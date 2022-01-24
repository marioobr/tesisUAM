const mongoose = require('mongoose')
const model = require('../model')

// const nombre;
// const producto;
// const cantidad;
// const categoria;

const crear = async (data)=> {
    
    

    await model.modelEnc.insertMany(data)
    .then(()=> console.log('Cliente Agregado'))
    .catch((e)=> console.log('El error al crear fue: ' + e))
    
    
}

module.exports.create = crear()