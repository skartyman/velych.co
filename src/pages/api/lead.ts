import type { APIRoute } from 'astro';
import { sendTelegramLead } from '../../lib/telegram';

export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const data = await request.json();
    const { name, contact, need, message, company } = data;

    // 1. Honeypot check (field name is 'company')
    if (company) {
      console.log('Spam blocked via honeypot');
      return new Response(JSON.stringify({
        ok: true,
        message: "Lead received" 
      }), { status: 200 });
    }

    // 2. Validation
    if (!name || !contact || !need || !message) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Missing mandatory fields"
      }), { status: 400 });
    }

    if (message.length < 5) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Message too short"
      }), { status: 400 });
    }

    // 3. Telegram environment check
    // In Astro with Cloudflare adapter, env vars are often in runtime.env or process.env
    // We'll check both for maximum compatibility
    const runtime = locals.runtime as any;
    const TG_TOKEN = runtime?.env?.TELEGRAM_BOT_TOKEN || (import.meta as any).env?.TELEGRAM_BOT_TOKEN;
    const TG_CHAT_ID = runtime?.env?.TELEGRAM_CHAT_ID || (import.meta as any).env?.TELEGRAM_CHAT_ID;

    if (!TG_TOKEN || !TG_CHAT_ID) {
      console.error('Telegram config missing:', { hasToken: !!TG_TOKEN, hasChatId: !!TG_CHAT_ID });
      return new Response(JSON.stringify({
        ok: false,
        message: "Telegram is not configured"
      }), { status: 500 });
    }

    // 4. Send to Telegram
    try {
      await sendTelegramLead(TG_TOKEN, TG_CHAT_ID, { name, contact, need, message });
      
      return new Response(JSON.stringify({
        ok: true,
        message: "Lead sent"
      }), { status: 200 });

    } catch (tgError) {
      console.error('Telegram send failed:', tgError);
      return new Response(JSON.stringify({
        ok: false,
        message: "Lead was received, but notification failed"
      }), { status: 200 }); // Still 200 because the lead reached the server
    }

  } catch (error) {
    console.error('API lead error:', error);
    return new Response(JSON.stringify({
      ok: false,
      message: "Internal Server Error"
    }), { status: 500 });
  }
};
