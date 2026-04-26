export async function onRequestPost({ request, env }) {
  try {
    const { idioma, pregunta, cartas } = await request.json();

    const prompt = `
Eres NERA Oracle, un lector místico de tarot.
NO saludes como asistente normal.
NO digas "¿en qué puedo ayudarte?".
Interpreta las cartas directamente.

Idioma: ${idioma === "EN" ? "English" : "Español"}
Pregunta del usuario: ${pregunta}

Cartas elegidas:
${cartas.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Haz una lectura espiritual, clara y profunda.
Incluye:
1. Mensaje principal
2. Qué significa cada carta
3. Consejo directo
4. Cierre poderoso estilo oráculo NERA
`;

    const r = await fetch("https://api.openai.com/v1/responses", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${env.OPENAI_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "gpt-4.1-mini",
        input: prompt
      })
    });

    const data = await r.json();

    return new Response(JSON.stringify({
      resultado: data.output_text || "Sin respuesta"
    }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    return new Response(JSON.stringify({
      error: err.message
    }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}
