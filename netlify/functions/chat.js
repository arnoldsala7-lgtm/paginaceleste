exports.handler = async function(event) {

if (event.httpMethod !== "POST")
return { statusCode:405, body:"Método no permitido" };

try{

const apiKey = process.env.GEMINI_API_KEY;

if(!apiKey){

return{
statusCode:200,
body:JSON.stringify({
respuesta:"⚠️ Falta API KEY"
})
};

}

const { prompt , historial } = JSON.parse(event.body);

const mensajes = historial || [];

mensajes.push({

role:"user",
parts:[{text:prompt}]

});

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,

{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({

systemInstruction:{
parts:[{
text:"Eres el asistente de ElCerveceroTV creado por Arnold."
}]
},

contents:mensajes

})

}

);

const data = await response.json();


// 👇 SI GOOGLE BLOQUEA
if(data.error){

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⏳ Estoy ocupado 😅 intenta otra vez en unos segundos."

})

};

}


return{

statusCode:200,

body:JSON.stringify({

respuesta:

data.candidates?.[0]?.content?.parts?.[0]?.text

|| "Sin respuesta"

})

};

}catch(error){

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⚠️ "+error.message

})

};

}

};
