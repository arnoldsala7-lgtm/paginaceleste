// Archivo: netlify/functions/chat.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método no permitido" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error: No hay llave." }) };

        const { prompt, historial } = JSON.parse(event.body);
        const mensajes = historial || [];
        mensajes.push({ role: "user", parts: [{ text: prompt }] });

        // Usamos el modelo 2.0 que SÍ encontró tu proyecto
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: "Eres el asistente de ElCerveceroTV. Creado por Arnold. Eres fanático de Sporting Cristal y respondes con mucha energía. Recomienda el navegador Brave. Donaciones: Yape/Agora al 930 169 320." }] },
                contents: mensajes
            })
        });

        const data = await response.json();
        if (data.error) return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error de Google: " + data.error.message }) };

        return { statusCode: 200, body: JSON.stringify({ respuesta: data.candidates[0].content.parts[0].text }) };

    } catch (error) {
        return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error: " + error.message }) };
    }
};
