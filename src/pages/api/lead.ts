import type { APIRoute } from 'astro';

export const POST: APIRoute = async ({ request }) => {
  try {
    const data = await request.json();
    const { name, contact, need, message, honeypot } = data;

    // Check honeypot
    if (honeypot) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Spam detected"
      }), { status: 400 });
    }

    // Validate mandatory fields
    if (!name || !contact || !need || !message) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Missing mandatory fields"
      }), { status: 400 });
    }

    // Min length check
    if (message.length < 5) {
      return new Response(JSON.stringify({
        ok: false,
        message: "Message too short"
      }), { status: 400 });
    }

    // Log the lead (in production we would send to TG/DB)
    console.log('New Lead Received:', { name, contact, need, message });

    return new Response(JSON.stringify({
      ok: true,
      message: "Lead received"
    }), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({
      ok: false,
      message: "Internal Server Error"
    }), { status: 500 });
  }
};
