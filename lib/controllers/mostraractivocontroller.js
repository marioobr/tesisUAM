const mongoose = require('mongoose')
const model = require('../model')

const mostraractivo = async(filter)=> {

    
    //Find muestra muestra toda la informacion de la coleccion
    const encomiendas = await model.modelEnc.findOne(filter).exec()
    // const encomiendas = await query.
    console.log(encomiendas) 
    return encomiendas
}

module.exports = mostraractivo