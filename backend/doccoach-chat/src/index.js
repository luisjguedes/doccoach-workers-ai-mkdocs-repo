export default {
  async fetch(request, env) {
    // --- CORS allowlist (tighten this for production) ---
    const origin = request.headers.get("Origin") || "";
    const allowedOrigins = [
      "http://localhost:8000",
      "http://127.0.0.1:8000",
      // Replace with your GitHub Pages origin:
      "https://YOUR_GITHUB_USERNAME.github.io",
    ];

    const corsHeaders = {
      "Access-Control-Allow-Origin": allowedOrigins.includes(origin) ? origin : "null",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Max-Age": "86400",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    const url = new URL(request.url);
    if (url.pathname !== "/api/chat" || request.method !== "POST") {
      return new Response("Not found", { status: 404, headers: corsHeaders });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { messages = [], pageContext = "", mode = "coach" } = body;

    const trimmedContext = String(pageContext).slice(0, 6000);

    const system = [
      "You are DocCoach, a Staff-level technical writing coach.",
      "Be practical, specific, and safe. If asked for secrets/credentials, refuse.",
      "Prefer checklists, examples, and clear reasoning. Keep answers concise unless asked otherwise.",
      `Mode: ${mode}`,
      trimmedContext ? "Page context is included below. Use it when relevant." : "",
      trimmedContext ? `PAGE_CONTEXT:\n${trimmedContext}` : "",
    ]
      .filter(Boolean)
      .join("\n\n");

    const input = [
      { role: "system", content: system },
      ...messages.map((m) => ({
        role: m.role === "assistant" ? "assistant" : "user",
        content: String(m.content || ""),
      })),
    ];

    try {
      // Workers AI binding (no API key needed)
      const result = await env.AI.run("@cf/meta/llama-3.1-8b-instruct", {
        messages: input,
        max_tokens: 350,
      });

      const text = result?.response ?? JSON.stringify(result);

      return new Response(JSON.stringify({ text }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    } catch (err) {
      return new Response(
        JSON.stringify({
          error: "LLM request failed",
          detail: String(err?.message || err),
        }),
        {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }
  },
};
