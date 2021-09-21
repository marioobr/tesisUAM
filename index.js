//Obtener variables de entorno
const { config } = require("./config/index");
//Declaracion de librerias que se estan utilizando
const uuid = require("uuid");
const sessionClient = require("./lib/DialogFlow");
const express = require("express");
const cors = require("cors");
const MessagingResponse = require("twilio").twiml.MessagingResponse;
const bodyParser = require('body-parser')

//Configuracion del servidor
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));


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
  const customerName = req.body.ProfileName
  
  detectIntent(message)
    .then((intent) => {
      const result = intent.queryResult;
      const intentName = result.intent.displayName;

      if (intentName === "Default Fallback Intent") {
        twiml.message(`Bienvenido ${customerName} al servicio de rastreo de encomiendas de Transportes Castillo.
        Seleccione la opción que sea de sus interes:
        1️⃣ CDM
        2️⃣ VVV
        3️⃣ HDTP
        4️⃣ ALC
        5️⃣ ALV`);
        //Lineas requeridas despues de cada respuesta
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "laconcha") {
        twiml.message("Mauricio es una bestia.");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else {
        twiml.message(
          "Rey, lo que mandaste no apunta a ningún intent, ubicate."
        );
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      }
    })
    .catch((err) => {
      twiml.message("Me estás cagando papi?");
      res.writeHead(200, { "Content-Type": "text/xml" });
      res.end(twiml.toString());
    });
});

app.listen(config.port, () => {
  console.log("Escuchando el puerto: " + config.port);
});
