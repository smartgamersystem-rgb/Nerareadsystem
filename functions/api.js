export async function onRequestPost({ request, env }) {
  try {
    const { idioma, pregunta, cartas } = await request.json();

    const prompt = `
Eres NERA Oracle, un lector místico de tarot.
NO saludes.
NO hagas introducciones.
NO digas "hola".
Habla directo como un oráculo.

Idioma: ${idioma === "EN" ? "English" : "Español"}
Pregunta: ${pregunta}

Cartas:
${cartas.map((c, i) => `${i + 1}. ${c}`).join("\n")}

Responde con:
1. Mensaje principal
2. Interpretación de cada carta
3. Consejo directo
4. Cierre poderoso
`;

    const openaiResponse = await fetch("https://api.openai.com/v1/responses", {
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

    const data = await openaiResponse.json();

    // 🔥 PARSER CORRECTO (AQUÍ ESTABA TU ERROR)
    let texto = "Sin respuesta";

    if (data.output_text) {
      texto = data.output_text;
    } else if (data.output && data.output.length > 0) {
      const parts = data.output[0].content || [];
      texto = parts.map(p => p.text || "").join("");
    }

    return new Response(JSON.stringify({
      resultado: texto
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
