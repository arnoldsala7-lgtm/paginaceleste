async function enviarMensaje(mensaje){

try{

const res = await fetch("/.netlify/functions/chat",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body: JSON.stringify({

prompt: mensaje,
historial: []

})

});

const data = await res.json();

console.log(data); // mira consola

return data.respuesta;

}catch(error){

console.error(error);

return "Error de conexión con el servidor. Intenta de nuevo. 🍺";

}

}
