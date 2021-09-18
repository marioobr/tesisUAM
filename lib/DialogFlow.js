const credentials = require('./credentials.json')
const dialogflow = require("@google-cloud/dialogflow");

//Configuracion de dialogflow
const configdf = {
    credentials: JSON.parse(credentials),
  };
  
const sessionClient = new dialogflow.SessionsClient(configdf);

module.exports = sessionClient;