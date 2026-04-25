export async function onRequest(context) {
  const { request, env } = context;

  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
    "Content-Type": "application/json"
  };

  // 🔹 Preflight (CORS)
  if (request.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  // 🔹 GET test
  if (request.method === "GET") {
    return new Response(JSON.stringify({
      status: "ok",
      message: "NERA API funcionando. Usa POST /api"
    }), {
      status: 200,
      headers: corsHeaders
    });
  }

  // 🔹 POST (tu lógica principal)
  if (request.method === "POST") {
    try {
      if (!env.OPENAI_API_KEY) {
        return new Response(JSON.stringify({
          error: "Falta configurar OPENAI_API_KEY en Cloudflare."
        }), {
          status: 500,
          headers: corsHeaders
        });
      }

      const body = await request.json();

      const idioma = body?.idioma === "EN" ? "EN" : "ES";
      const pregunta = body?.pregunta || (idioma === "ES" ? "Lectura general" : "General reading");
      const cartas = Array.isArray(body?.cartas) ? body.cartas : [];

      const prompt = idioma === "ES"
        ? `Eres NERA...`
        : `You are NERA...`;

      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${env.OPENAI_API_KEY}`
        },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [
            { role: "system", content: "Eres NERA..." },
            { role: "user", content: prompt }
          ],
          temperature: 0.9,
          max_tokens: 350
        })
      });

      const data = await openaiRes.json();

      if (!openaiRes.ok) {
        return new Response(JSON.stringify({
          error: data?.error?.message || "Error en OpenAI"
        }), {
          status: openaiRes.status,
          headers: corsHeaders
        });
      }

      const resultado = data?.choices?.[0]?.message?.content || "No se obtuvo respuesta.";

      return new Response(JSON.stringify({ resultado }), {
        status: 200,
        headers: corsHeaders
      });

    } catch (error) {
      return new Response(JSON.stringify({
        error: error.message || "Error interno"
      }), {
        status: 500,
        headers: corsHeaders
      });
    }
  }

  return new Response("Método no permitido", { status: 405 });
}
