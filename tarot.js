export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/tarot" && request.method === "POST") {
      try {
        const body = await request.json();

        const idioma = body?.idioma === "EN" ? "EN" : "ES";
        const pregunta = body?.pregunta || (idioma === "ES" ? "Lectura general" : "General reading");
        const cartas = Array.isArray(body?.cartas) ? body.cartas : [];

        const prompt = idioma === "ES"
          ? `
Eres NERA, un oráculo místico, profundo y elegante.

Pregunta del consultante:
"${pregunta}"

Cartas reveladas:
${cartas.join(", ")}

Haz una interpretación espiritual, emocional y clara.
Habla directamente a la persona.
No uses listas.
No repitas demasiado los nombres de las cartas.
Extensión máxima: 220 palabras.
`
          : `
You are NERA, a mystical, deep and elegant oracle.

Question from the querent:
"${pregunta}"

Revealed cards:
${cartas.join(", ")}

Write a spiritual, emotional and clear interpretation.
Speak directly to the person.
Do not use bullet points.
Do not repeat the card names too much.
Maximum length: 220 words.
`;

        const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${env.OPENAI_API_KEY}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: idioma === "ES"
                  ? "Eres NERA, un oráculo espiritual, simbólico, elegante y emocional."
                  : "You are NERA, a spiritual, symbolic, elegant and emotional oracle."
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.9,
            max_completion_tokens: 350
          })
        });

        const data = await openaiRes.json();

        if (!openaiRes.ok) {
          return new Response(JSON.stringify({
            error: data?.error?.message || "Error en OpenAI"
          }), {
            status: openaiRes.status,
            headers: { "Content-Type": "application/json" }
          });
        }

        const resultado = data?.choices?.[0]?.message?.content || "No se obtuvo respuesta.";

        return new Response(JSON.stringify({ resultado }), {
          status: 200,
          headers: { "Content-Type": "application/json" }
        });
      } catch (error) {
        return new Response(JSON.stringify({
          error: error.message || "Error interno"
        }), {
          status: 500,
          headers: { "Content-Type": "application/json" }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
