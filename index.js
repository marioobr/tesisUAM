//Obtener variables de entorno
require("dotenv").config();
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const project_id = process.env.PROJECT_ID;
const private_key = process.env.PRIVATE_KEY.replace(/\\n/gm, '\n');
const client_email = process.env.CLIENT_EMAIL;
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const express = require("express");
const { pick } = require("lodash");
const client = require("twilio")(accountSid, authToken);

const app = express();
app.use(express.json());
const port = 5000;
//Configuracion de dialogflow
const configdf = {
  credentials: {
    private_key,
    client_email,
  },
};



const sessionClient = new dialogflow.SessionsClient(configdf);

async function detectIntent(query) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    project_id,
    "123456789"
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

app.get("/",(req, res) => {
    res.send('Todo gucci')
})


app.post("/api/test", (req, res) => {
  console.log(private_key);
  const message = req.body.message;

  detectIntent(message)
    .then((intent) => {
      console.log(intent);
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

app.listen(port, () => {
  console.log("Escuchando el puerto: " + port);
});
