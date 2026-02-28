exports.handler = async function(event){

if(event.httpMethod !== "POST"){

return{

statusCode:405,
body:"Método no permitido"

};

}

try{

const apiKey = process.env.GEMINI_API_KEY;

if(!apiKey){

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⚠️ No API KEY"

})

};

}

const body = JSON.parse(event.body || "{}");

const prompt = body.prompt || "";

const mensajes = [

{

role:"user",

parts:[{text:prompt}]

}

];

const response = await fetch(

`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify({

contents:mensajes

})

}

);


// 👇 IMPORTANTE
if(!response.ok){

const text = await response.text();

console.log("Google Error:",text);

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⚠️ Gemini ocupado 😅 intenta otra vez."

})

};

}


const data = await response.json();

const respuesta =

data?.candidates?.[0]?.content?.parts?.[0]?.text

|| "Sin respuesta";


return{

statusCode:200,

body:JSON.stringify({

respuesta

})

};

}catch(error){

console.log("ERROR:",error);

return{

statusCode:200,

body:JSON.stringify({

respuesta:"⚠️ Error servidor: "+error.message

})

};

}

};
