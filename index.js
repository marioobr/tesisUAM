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

  twiml.message("Comeme la pinga!");

  res.writeHead(200, { "Content-Type": "text/xml" });
  res.end(twiml.toString());
});

app.post("/api/test", (req, res) => {
  // console.log(config.private_key);
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
          to: "whatsapp:+50583731668",
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
});

app.listen(config.port, () => {
  console.log("Escuchando el puerto: " + config.port);
});
