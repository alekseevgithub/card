// worker/worker.js
async function sendToTelegram(env, text) {
  const url = `https://api.telegram.org/bot${env.TG_BOT_TOKEN}/sendMessage`;
  const resp = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: env.TG_CHAT_ID, text })
  });
  if (!resp.ok) {
    const err = await resp.text();
    throw new Error(`Telegram error: ${err}`);
  }
}

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin || "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const origin = request.headers.get("Origin") || "*";

    // Preflight
    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }

    if (request.method === "POST" && url.pathname === "/api/notify") {
      try {
        const { choice, time } = await request.json();
        const text = `📬 Открытка: ${choice}\n🕒 ${time || new Date().toISOString()}`;
        await sendToTelegram(env, text);
        return new Response(JSON.stringify({ ok: true }), {
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      } catch (e) {
        return new Response(JSON.stringify({ ok: false, error: String(e) }), {
          status: 500,
          headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
        });
      }
    }

    return new Response("OK", { headers: corsHeaders(origin) });
  }
};

