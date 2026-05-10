import type { APIRoute } from 'astro';
import { sendTelegramLead } from '../../lib/telegram';
import { createLeadAiSummary } from '../../lib/aiLeadSummary';
// @ts-ignore
import { env } from 'cloudflare:workers';

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
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

    if (message.length < 5) {
      return new Response(JSON.stringify({ ok: false, message: "Message too short" }), { status: 400 });
    }

    // 3. Environment Variables (Astro v6 + Cloudflare)
    const TG_TOKEN = env?.TELEGRAM_BOT_TOKEN;
    const TG_CHAT_ID = env?.TELEGRAM_CHAT_ID;

    if (!TG_TOKEN || !TG_CHAT_ID) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Telegram configuration is missing",
        debug: { hasEnv: !!env, hasToken: !!TG_TOKEN, hasChatId: !!TG_CHAT_ID }
      }), { status: 500 });
    }

    // 4. AI Summary (Optional)
    let aiSummary = null;
    try {
      aiSummary = await createLeadAiSummary(env, { name, contact, need, message });
    } catch (aiError) {
      console.error("AI Summary generation failed:", aiError);
    }

    // 5. Send to Telegram
    try {
      await sendTelegramLead(TG_TOKEN, TG_CHAT_ID, { name, contact, need, message }, aiSummary);
      
      return new Response(JSON.stringify({
        ok: true,
        message: "Lead sent"
      }), { status: 200 });

    } catch (tgError: any) {
      console.error("Telegram notification failed:", tgError);
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
