const { config } = require('./config/index');
const dialogflow = require("@google-cloud/dialogflow");
const uuid = require("uuid");

const express = require("express");
const cors = require('cors');
const client = require("twilio")(config.accountSid, config.authToken);

const app = express();
app.use(cors());
app.use(express.json());

//Configuracion de dialogflow
const configdf = {
  credentials: {
    private_key:  config.private_key,
    client_email: config.client_email,
  },
};



const sessionClient = new dialogflow.SessionsClient(configdf);

async function detectIntent(query) {
  // The path to identify the agent that owns the created intent.
  const sessionPath = sessionClient.projectAgentSessionPath(
    config.project_id,
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
  console.log(config.private_key);
  const message = req.body.message;


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
  // detectIntent(message)
  //   .then((intent) => {
  //     console.log(intent);
      
  //   })
  //   .catch((err) => {
  //     res.status(501).json({
  //       error: 501,
  //       msg: err,
  //     });
  //   });
});

app.listen(config.port, () => {
  console.log("Escuchando el puerto: " + config.port);
});
