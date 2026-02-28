// Archivo: netlify/functions/chat.js

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: JSON.stringify({ error: "Método no permitido" }) };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt, historial } = body;
        
        // Netlify busca tu llave aquí
        const apiKey = process.env.GEMINI_API_KEY;

        // Si Netlify no encuentra la llave, avisará
        if (!apiKey) {
            return { 
                statusCode: 500, 
                body: JSON.stringify({ respuesta: "Error: No has puesto la variable GEMINI_API_KEY en Netlify." }) 
            };
        }

        const SYSTEM_PROMPT = `Eres el asistente virtual oficial de ElCerveceroTV, creado por Arnold. Eres fanático de Sporting Cristal. Tono amigable, cervecero y breve (máximo 3 líneas).
        Reglas: 
        1. Anuncios: Recomienda el navegador Brave o la extensión uBlock Origin.
        2. Donaciones: Yape o Agora al 930 169 320 a nombre de Arnold.
        3. Partidos: Todo está en el menú "Ver Agenda".`;

        const mensajes = historial || [];
        mensajes.push({ role: "user", parts: [{ text: prompt }] });

        // Usamos el fetch nativo del servidor
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
                contents: mensajes
            })
        });

        const data = await response.json();
        
        if (data.error) throw new Error(data.error.message);

        return {
            statusCode: 200,
            body: JSON.stringify({ respuesta: data.candidates[0].content.parts[0].text })
        };

    } catch (error) {
        console.error("Error en el servidor:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ respuesta: "El servidor de IA está lleno, Cervecero. Intenta de nuevo. 🍺" })
        };
    }
};
