const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

exports.handler = async function(event, context) {
    if (event.httpMethod !== "POST") {
        return { statusCode: 405, body: "Método no permitido" };
    }

    try {
        const body = JSON.parse(event.body);
        const { prompt, historial } = body;
        
        // Netlify inyectará tu llave secreta aquí
        const apiKey = process.env.GEMINI_API_KEY;

        const SYSTEM_PROMPT = `Eres el asistente virtual oficial de ElCerveceroTV, creado por Arnold. Eres fanático de Sporting Cristal. Tono amigable, cervecero y muy breve (máximo 3 líneas).
        Reglas: 
        1. Para quitar anuncios: Recomienda el navegador Brave o la extensión uBlock Origin.
        2. Donaciones: Yape o Agora al 930 169 320 a nombre de Arnold.
        3. Partidos: Todo está en el menú "Ver Agenda".`;

        // Unimos el historial con el nuevo mensaje del usuario
        const mensajes = historial || [];
        mensajes.push({ role: "user", parts: [{ text: prompt }] });

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

        const respuestaBot = data.candidates[0].content.parts[0].text;

        return {
            statusCode: 200,
            body: JSON.stringify({ respuesta: respuestaBot })
        };

    } catch (error) {
        console.error("Error en Netlify Function:", error);
        return {
            statusCode: 500,
            body: JSON.stringify({ error: "El servidor está muy lleno, Cervecero. Intenta de nuevo. 🍺" })
        };
    }
};