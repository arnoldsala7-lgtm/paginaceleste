// Archivo: netlify/functions/chat.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método no permitido" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // 1. Si Netlify no encuentra la llave, el bot lo dirá
        if (!apiKey) {
            return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error Netlify: No encuentro la variable GEMINI_API_KEY." }) };
        }

        const { prompt, historial } = JSON.parse(event.body);
        const mensajes = historial || [];
        mensajes.push({ role: "user", parts: [{ text: prompt }] });

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: "Eres el asistente oficial de ElCerveceroTV. Fanático de Sporting Cristal." }] },
                contents: mensajes
            })
        });

        const data = await response.json();
        
        // 2. Si Google bloqueó la llave, el bot mostrará el mensaje de Google
        if (data.error) {
            return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error de Google: " + data.error.message }) };
        }

        return { statusCode: 200, body: JSON.stringify({ respuesta: data.candidates[0].content.parts[0].text }) };

    } catch (error) {
        // 3. Cualquier otro fallo interno
        return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error de código: " + error.message }) };
    }
};
