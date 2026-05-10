import type { APIRoute } from 'astro';
import { sendTelegramLead } from '../../lib/telegram';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { name, contact, need, message, company } = data;

    // 1. Honeypot check
    if (company) {
      return new Response(JSON.stringify({ ok: true, message: "Lead received" }), { status: 200 });
    }

    // 2. Validation
    if (!name || !contact || !need || !message) {
      return new Response(JSON.stringify({ ok: false, message: "Missing mandatory fields" }), { status: 400 });
    }

    // 3. Environment Variables (Cloudflare Pages / Workers)
    // In Astro + Cloudflare, env vars are in locals.runtime.env
    const runtime = (locals as any).runtime;
    
    // Support for different adapter versions / local dev
    const TG_TOKEN = runtime?.env?.TELEGRAM_BOT_TOKEN || process?.env?.TELEGRAM_BOT_TOKEN;
    const TG_CHAT_ID = runtime?.env?.TELEGRAM_CHAT_ID || process?.env?.TELEGRAM_CHAT_ID;

    if (!TG_TOKEN || !TG_CHAT_ID) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Telegram configuration is missing in environment",
        debug: { hasToken: !!TG_TOKEN, hasChatId: !!TG_CHAT_ID }
      }), { status: 500 });
    }

    // 4. Send to Telegram
    try {
      await sendTelegramLead(TG_TOKEN, TG_CHAT_ID, { name, contact, need, message });
      
      return new Response(JSON.stringify({
        ok: true,
        message: "Lead sent"
      }), { status: 200 });

    } catch (tgError: any) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Lead received, but Telegram notification failed",
        error: tgError.message
      }), { status: 200 });
    }

  } catch (error: any) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Internal Server Error",
      error: error.message
    }), { status: 500 });
  }
};
