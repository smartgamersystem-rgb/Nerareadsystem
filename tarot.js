export async function onRequestPost(context) {
  try {
    const { request, env } = context;
    const body = await request.json();

    const pregunta = body?.pregunta || "Lectura general";
    const cartas = Array.isArray(body?.cartas) ? body.cartas : [];

    const prompt = `
Eres NERA, un oráculo místico, profundo y elegante.

Pregunta del consultante:
"${pregunta}"

Cartas reveladas:
${cartas.join(", ")}

Haz una interpretación espiritual, emocional y clara.
Habla directamente a la persona.
No uses listas.
No repitas literalmente los nombres de las cartas demasiadas veces.
Extensión máxima: 220 palabras.
`;

    const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer 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
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          {
            role: "system",
            content: "Eres NERA, un oráculo espiritual, simbólico, elegante y emocional."
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
