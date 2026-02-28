// Archivo: netlify/functions/chat.js
exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") return { statusCode: 405, body: "Método no permitido" };

    try {
        const apiKey = process.env.GEMINI_API_KEY;
        
        // Verificamos si Netlify está leyendo la llave
        if (!apiKey) {
            return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error Netlify: No encuentro la llave GEMINI_API_KEY." }) };
        }

        const { prompt, historial } = JSON.parse(event.body);
        const mensajes = historial || [];
        mensajes.push({ role: "user", parts: [{ text: prompt }] });

        // ===== PLAN A: Usando el modelo 1.5-flash-8b (Más ligero para el Free Tier) =====
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-8b:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: "Eres el asistente de ElCerveceroTV. Creado por Arnold. Eres fanático de Sporting Cristal y respondes con mucha energía. Recomienda el navegador Brave o uBlock para evitar anuncios. Si preguntan por donaciones, diles Yape/Agora al 930 169 320." }] },
                contents: mensajes
            })
        });

        const data = await response.json();
        
        // Atrapamos si Google nos sigue bloqueando por la cuota
        if (data.error) {
            return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error de Google: " + data.error.message }) };
        }

        // Si todo sale bien, enviamos la respuesta del bot
        return { statusCode: 200, body: JSON.stringify({ respuesta: data.candidates[0].content.parts[0].text }) };

    } catch (error) {
        // Atrapamos cualquier otro error de programación
        return { statusCode: 200, body: JSON.stringify({ respuesta: "⚠️ Error de código: " + error.message }) };
    }
};
