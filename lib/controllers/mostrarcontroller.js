const mongoose = requier('mongoose')
const model = require('../model')

const mostrar = async()=> {
    //Find muestra muestra toda la informacion de la coleccion
    const encomiendas = await model.modelEnc.find()
    console.log(encomiendas) 
}

module.exports = mostrar