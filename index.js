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
const mongoose = require("mongoose");
// const model = require('./lib/model')
const {
  crear,
  eliminar,
  actualizar,
  mostrar,
  mostraractivo,
} = require("./lib/controllers");

//Configuracion del servidor
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

const url =
  "mongodb+srv://tuntu99:hector9908@cluster0.afz7x.mongodb.net/encomiendas?retryWrites=true&w=majority";

mongoose
  .connect(url, {
    // useNewUrlParser: true,
    // useUnifiedTopology: true,
    // useFindAndModify: false,
    // useCreateIndex: true
  })
  .then(() => console.log("Conectado a Mongo"))
  .catch((e) => console.log("El error de conexion es: " + e));

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
  let mongoEstado;
  let mongoNumero;

  detectIntent(message)
    .then((intent) => {
      const numero = req.body.WaId;
      const result = intent.queryResult;
      console.log("Query Result: ", result.parameters.fields);
      const intentName = result.intent.displayName;

      console.log("intentName", intentName);

      if (intentName === "Saludo Inicial") {
        twiml.message(
          `Bienvenido ${customerName} al servicio de rastreo de encomiendas que brinda Transportes Castillo.
       
Escribi la opci??n que sea de tu interes:
0?????? Consultar estado de su encomienda
1?????? Consultar historial de encomiendas`
        );

        // crear()

        //Lineas requeridas despues de cada respuesta
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Estado de encomienda") {
        twiml.message("El estado de su encomienda es: ");
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
        // } else if (intentName === "Historial de encomienda") {
        //   twiml.message("Su historial de encomiendas es: ");
        //   res.writeHead(200, { "Content-Type": "text/xml" });
        //   res.end(twiml.toString());
      } else if (intentName === "Mostrar encomienda cliente") {
        mongoNumero = req.body.WaId;
        mostraractivo({ estado: { $lt: 2 }, numero: "50583731668" }).then(
          (encomiendas) => {
            console.log("Encomiendas", encomiendas);

            var message = "";

            encomiendas.forEach((encomienda) => {
              const {
                nombre,
                cantidad,
                producto,
                categoria,
                numero,
                estado,
                unidad,
              } = encomienda;
              const msg = `
            Tus encomiendas activas son:
            nombre: ${nombre}
            cantidad: ${cantidad}
            producto: ${producto}
            categoria: ${categoria}
            numero: ${numero}
            unidad: ${unidad}
            estado: ${estado}
            `;
              message += msg;
            });
            twiml.message(message);
            res.writeHead(200, { "Content-Type": "text/xml" });
            res.end(twiml.toString());
          }
        );
      } else if (intentName === "Mostrar todas encomiendas") {
        mongoNumero = req.body.WaId;
        mostraractivo({ numero: mongoNumero }).then((encomiendas) => {
          console.log("Encomiendas", encomiendas);

          var message = "";

          encomiendas.forEach((encomienda) => {
            const {
              nombre,
              cantidad,
              producto,
              categoria,
              numero,
              estado,
              unidad,
            } = encomienda;
            const msg = `
            Tu historial de encomiendas es: 
            nombre: ${nombre}
            cantidad: ${cantidad}
            producto: ${producto}
            categoria: ${categoria}
            numero: ${numero}
            unidad: ${unidad}
            estado: ${estado}
            `;
            message += msg;
          });
          twiml.message(message);
          res.writeHead(200, { "Content-Type": "text/xml" });
          res.end(twiml.toString());
        });
      } else if (intentName === "Reconocer ingreso paquete") {
        twiml.message(`
        Escribi la informacion de la encomienda que vas a registrar`);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Ingreso de informacion paquete") {
        mongoName = result.parameters.fields["name"]["stringValue"];
        mongoCantidad = result.parameters.fields["number"]["numberValue"];

        mongoProducto = result.parameters.fields["producto"]["stringValue"];
        mongoUnidad = result.parameters.fields["unidad"]["stringValue"];
        mongoNumero = req.body.WaId;

        const data = {
          nombre: mongoName,
          cantidad: mongoCantidad,
          producto: mongoProducto,
          categoria: "",
          estado: 0,
          unidad: mongoUnidad,
          numero: mongoNumero,
        };

        crear(data);

        twiml.message(`La informacion registrada es: 
    nombre del cliente: ${mongoName}
    producto: ${mongoProducto}
    cantidad: ${mongoCantidad}
    unidad: ${mongoUnidad}
    numero: ${mongoNumero}
    
        `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "tipo categoria") {
        twiml.message(`Escribi una de las siguientes categorias para la encomienda:
        No fragil
        Fragil
        Muy fragil 
        `);
        mongoCategoria = result.parameters.fields["categoria"]["stringValue"];
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Definir categoria") {
        // mongoCategoria = result.parameters.fields['categoria']['stringValue']
        twiml.message(`La categoria seleccionada para la encomienda ${mongoNumero} es ${mongoCategoria}
        `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Solicitar estado") {
        twiml.message(`Escribi el estado en el que se encuentra la encomienda de acuerdo a las siguientes opciones:
          Pendiente
          Recibido
          En proceso
          Extraviado
          Entregado
          `);

        mongoEstado = result.parameters.fields["estado"]["stringValue"];
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else if (intentName === "Definir Estado") {
        if (mongoEstado === "pendiente") {
          mongoEstado = 0;
        } else if (mongoEstado === "recibido") {
          mongoEstado = 1;
        } else if (mongoEstado === "en proceso") {
          mongoEstado = 2;
        } else if (mongoEstado === "entregado") {
          mongoEstado = 3;
        } else if (mongoEstado === "extraviado") {
          mongoEstado = 4;
        }

        twiml.message(`El estado de la encomienda con el numero ${numero} es ${mongoEstado}: 
        `);
        res.writeHead(200, { "Content-Type": "text/xml" });
        res.end(twiml.toString());
      } else {
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
