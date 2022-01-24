//Obtener variables de entorno
const { config } = require("./config/index");
//Declaracion de librerias que se estan utilizando
const uuid = require("uuid");
const admin = require("firebase-admin");
const sessionClient = require("./lib/DialogFlow");
const express = require("express");
const cors = require("cors");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require("body-parser");
const mongoose = require('mongoose')
const model = require('./lib/model')
// const controller = require('./lib/controllers')





//Configuracion del servidor
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const url = 'mongodb+srv://tuntu99:hector9908@cluster0.afz7x.mongodb.net/encomiendas?retryWrites=true&w=majority'

mongoose.connect(url,  {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true

})
.then(()=> console.log('Conectado a Mongo'))
.catch((e)=> console.log('El error de conexion es: ' + e))

//Inicializacion de firebaseAdmin
const inicia = admin.initializeApp({
  credential: admin.credential.applicationDefault(),
  // databaseURL: 'https://<DATABASE_NAME>.firebaseio.com'
});

console.log(inicia.name);

//Funcion que detenta los intents de Dialogflow, tiene como parametro query, que es el mensaje que recibe
async function detectIntent(query) {
  // The path to identify the agent that owns the created intent.
  const uniqueID = uuid.v4();
  const sessionPath = sessionClient.projectAgentSessionPath(
    config.project_id,
    uniqueID
  );

  // The text query request.
  const request = {
    session: sessionPath,
    queryInput: {
      text: {
        //Uso del mensaje que recibe
        text: query,
        languageCode: "es",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

//Verificar que el servidor esta activo
app.get("/", (req, res) => {
  res.send("Todo gucci");
});

app.post("/api/inbound-message", (req, res) => {
  const twiml = new MessagingResponse();

  //Asignar a message el body del request
  const message = req.body.Body;
  const customerName = req.body.ProfileName;
  //Variables con valores temporales 
  let mongoName;
  let mongoProducto;
  let mongoCategoria;
  let mongoCantidad;
  let mongoUnidad;

  detectIntent(message)
    .then((intent) => {
      const result = intent.queryResult;
      console.log('Query result: ', result.parameters.fields)
      console.log('Intent completo: ', intent)
      const intentName = result.intent.displayName;

      console.log('intentName', intentName);

      if (intentName === "Saludo Inicial") {
        twiml.message(
       `Bienvenido ${customerName} al servicio de rastreo de encomiendas que brinda Transportes Castillo.
       
Escribi la opción que sea de tu interes:
0️⃣ Consultar estado de su encomienda
1️⃣ Consultar historial de encomiendas`);

// crear()

        //Lineas requeridas despues de cada respuesta
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Estado de encomienda") {
        twiml.message("El estado de su encomienda es: ");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Historial de encomienda") {
        twiml.message("Su historial de encomiendas es: ");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }else if (intentName === "Reconocer ingreso paquete") {
        
        twiml.message(`
        Escribi la informacion de la encomienda que vas a registrar.

        
        `);
        // twiml.message(`
        // La informacion que agregaste es la siguiente:
        // Nombre: 

        
        // `);

        // Por favor escriba selecciona la categoria del producto a registrar:
        // No Fragil
        // Fragil
        // Muy fragil
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
      else if (intentName === "Ingreso de informacion paquete") {

        mongoName = result.parameters.fields['name']['stringValue']
        mongoCantidad = result.parameters.fields['number']['numberValue']
        mongoCategoria = result.parameters.fields['categoria']['stringValue']
        mongoProducto = result.parameters.fields['producto']['stringValue']
        mongoUnidad = result.parameters.fields['unidad']['stringValue']

        twiml.message(`La informacion registrada es: 
    nombre del cliente: ${mongoName}
    producto: ${mongoProducto}
    cantidad: ${mongoCantidad}
    categoria: ${mongoCategoria}
        `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
      else if (intentName === "tipo categoria") {
        twiml.message(`La categoria seleccionada fue: 
        `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } 
      else if (intentName === "tipo nombre") {
        twiml.message(`El nombre del producto seleccionado es: `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } 
      else {
        twiml.message(
          "Parece que te equivocaste! Escribi una de las opciones validas para que podamos seguir interactuando"
        );
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
    })
    .catch((err) => {
      twiml.message("Mensaje totalmente fuera del scope");
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    });
});

app.listen(config.port, () => {
  console.log("Escuchando el puerto: " + config.port);
});

// NODE_ENV=production node index
