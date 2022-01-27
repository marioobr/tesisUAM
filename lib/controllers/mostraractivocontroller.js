const mongoose = require('mongoose')
const model = require('../model')

const mostraractivo = async(filter)=> {

    
    //Find muestra muestra toda la informacion de la coleccion
    const encomiendas = await model.modelEnc.find(filter)
    console.log(encomiendas) 
    return encomiendas
}

module.exports = mostraractivo