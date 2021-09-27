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

//Configuracion del servidor
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

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

  detectIntent(message)
    .then((intent) => {
      const result = intent.queryResult;
      const intentName = result.intent.displayName;

      if (intentName === "Saludo Inicial") {
        twiml.message(
       `Bienvenido ${customerName} al servicio de rastreo de encomiendas que brinda Transportes Castillo.
       
Seleccione la opción que sea de sus interes:
0️⃣ Consultar estado de su encomienda
1️⃣ Consultar historial de encomiendas`);
        //Lineas requeridas despues de cada respuesta
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Estado de encomienda") {
        twiml.message("El estado de su encomienda es: ");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Historia de encomienda") {
        twiml.message("Su historial de encomiendas es: ");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }else if (intentName === "Registrar paquete nombre") {
        twiml.message(`Escribi el nombre del producto que vas a registrar.

        Por favor escriba selecciona la categoria del producto a registrar:
        No Fragil
        Fragil
        Muy fragil
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
