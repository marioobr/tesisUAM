const mongoose = require('mongoose')
const model = require('../model')

const crear = async ()=> {
    const encCrear = {
        nombre: "Oscar",
        producto: "Cafe",
        cantidad: 2,
        categoria: "Muy fragil"

    }
    

    await model.modelEnc.insertMany(encCrear)
    .then(()=> console.log('Cliente Agregado'))
    .catch((e)=> console.log('El error al crear fue: ' + e))
    
    
}

module.exports.create = crear()