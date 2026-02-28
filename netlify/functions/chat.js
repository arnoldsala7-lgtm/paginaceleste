// Archivo: netlify/functions/chat.js

exports.handler = async function(event, context) {

    if (event.httpMethod !== "POST")
        return { statusCode: 405, body: "Método no permitido" };

    try {

        const apiKey = process.env.GEMINI_API_KEY;

        if (!apiKey)
            return {
                statusCode: 200,
                body: JSON.stringify({ respuesta:"⚠️ Error: No hay llave." })
            };

        const { prompt, historial } = JSON.parse(event.body);

        const mensajes = historial || [];

        mensajes.push({
            role:"user",
            parts:[{ text:prompt }]
        });


        async function llamarGemini(reintentos = 3){

            const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
            {
                method:"POST",
                headers:{ "Content-Type":"application/json" },
                body: JSON.stringify({

                    systemInstruction:{
                        parts:[{
                            text:"Eres el asistente de ElCerveceroTV. Creado por Arnold."
                        }]
                    },

                    contents: mensajes

                })
            });

            const data = await response.json();

            // 👇 si google pide esperar
            if(data.error?.message?.includes("retry") && reintentos > 0){

                console.log("Esperando retry...");

                await new Promise(r=>setTimeout(r,11000)); //11 seg

                return llamarGemini(reintentos - 1);
            }

            return data;
        }


        const data = await llamarGemini();

        if(data.error){

            return {
                statusCode:200,
                body: JSON.stringify({
                    respuesta:"⚠️ Google dice: "+data.error.message
                })
            };
        }

        return {

            statusCode:200,

            body: JSON.stringify({

                respuesta:data.candidates?.[0]?.content?.parts?.[0]?.text
                || "Sin respuesta."

            })

        };

    } catch(error){

        return {
            statusCode:200,
            body: JSON.stringify({
                respuesta:"⚠️ Error: "+error.message
            })
        };

    }

};
