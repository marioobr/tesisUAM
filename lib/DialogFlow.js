const {config} = require('../config')
const dialogflow = require("@google-cloud/dialogflow");

//Configuracion de dialogflow
const configdf = {
  credentials: {
    private_key:  config.private_key,
    client_email: config.client_email,
  },
};
  
const sessionClient = new dialogflow.SessionsClient(configdf);

module.exports = sessionClient;