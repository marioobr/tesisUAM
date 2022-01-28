const mongoose = require('mongoose')
const model = require('../model')

const mostraractivo = async(filter)=> {

    
    //Find muestra muestra toda la informacion de la coleccion
    const query = await model.modelEnc.find(filter)
    const encomiendas = await query.exec()
    console.log(encomiendas) 
    return encomiendas
}

module.exports = mostraractivo