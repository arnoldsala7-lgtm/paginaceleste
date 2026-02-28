exports.handler = async (event) => {

if(event.httpMethod !== "POST"){

return{
statusCode:405,
body:"Metodo no permitido"
};

}

try{

const apiKey = process.env.OPENAI_API_KEY;

const { mensaje } = JSON.parse(event.body);

const respuesta = await fetch(

"https://api.openai.com/v1/chat/completions",

{

method:"POST",

headers:{

"Content-Type":"application/json",

"Authorization":`Bearer ${apiKey}`

},

body:JSON.stringify({

model:"gpt-4.1-mini",

messages:[

{

role:"system",

content:`

Eres el asistente virtual oficial de ElCerveceroTV,
una plataforma gratuita creada por Arnold.

Tono amigable, energético,
fanático de Sporting Cristal.

Usa frases:

¡Fuerza Cristal!
Raza Celeste
¡Salud Cervecero!

INFORMACION:

- Los partidos están en Agenda.
- Recomienda Brave o uBlock Origin si hay anuncios.
- Donaciones Yape/Agora 930169320 Arnold.
- Si no sabes algo di que eres bot en entrenamiento.

`

},

{

role:"user",

content:mensaje

}

]

})

}

);

const data = await respuesta.json();

return{

statusCode:200,

body:JSON.stringify({

respuesta:

data.choices[0].message.content

})

};

}catch(error){

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⚠️ Error servidor "+error.message

})

};

}

};
