const { config } = require("./config/index");
const uuid = require("uuid");
const sessionClient = require("./lib/DialogFlow");
const express = require("express");
const cors = require("cors");
const client = require("twilio")(config.accountSid, config.authToken);
const MessagingResponse = require("twilio").twiml.MessagingResponse;

const app = express();
app.use(cors());
app.use(express.json());

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
        text: query,
        languageCode: "es",
      },
    },
  };

  const responses = await sessionClient.detectIntent(request);
  return responses[0];
}

app.get("/", (req, res) => {
  res.send("Todo gucci");
});

app.post("/api/inbound-message", (req, res) => {
  const twiml = new MessagingResponse();

  const message = req.body;
  twiml.message(message.toString());
  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
  // detectIntent(message)
  //   .then((intent) => {
  //     const result = intent.queryResult;
  //     const intentName = result.intent.displayName;

  //     if (intentName === "Default Fallback Intent") {
  //       twiml.message(`Bienvenido al servicio de rastreo de encomiendas de Transportes Castillo.
  //       Seleccione la opción que sea de sus interes:
  //       1️⃣ CDM
  //       2️⃣ VVV
  //       3️⃣ HDTP
  //       4️⃣ ALC
  //       5️⃣ ALV`);
  //       res.writeHead(200, { "Content-Type": "text/xml" });
  //       res.end(twiml.toString());
  //     } else if (intentName === "laconcha") {
  //       twiml.message("Mauricio es una bestia.");
  //       res.writeHead(200, { "Content-Type": "text/xml" });
  //       res.end(twiml.toString());
  //     } else {
  //       twiml.message(
  //         "Rey, lo que mandaste no apunta a ningún intent, ubicate."
  //       );
  //       res.writeHead(200, { "Content-Type": "text/xml" });
  //       res.end(twiml.toString());
  //     }
  //   })
  //   .catch((err) => {
  //     twiml.message("La cagamos prix, algo salio mal, intenta al rato.");
  //     res.writeHead(200, { "Content-Type": "text/xml" });
  //     res.end(twiml.toString());
  //   });
});

app.post('/api/test', (req, res) => {
  const message = req.body.message;
  detectIntent(message)
    .then((intent) => {
      console.log(intent);
      const result = intent.queryResult;
      const intentName = result.intent.displayName;

      client.messages
        .create({
          from: "whatsapp:+14155238886",
          body: message,
          to: "whatsapp:+50586005122",
        })
        .then((message) => {
          console.log(message.sid);
          res.status(200).json({
            error: 0,
            msg: "Message correctly sent",
          });
        });
    })
    .catch((err) => {
      res.status(501).json({
        error: 501,
        msg: err,
      });
    });
})

app.listen(config.port, () => {
  console.log("Escuchando el puerto: " + config.port);
});
