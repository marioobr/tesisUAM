const mongoose = require('mongoose')
const model = require('../model')


const actualizar = async (numero)=>{
    const encomienda = await model.modelEnc.updateOne({numero:numero},
    {
        $set:{
            nombre: "Alejandro",
            producto: "Guitarra",
            cantidad: 2,
            categoria: "No fragil"

        }
    })
    .then(()=> console.log('Informacion actualizada'))
    .catch((e)=> console.log('El error al actualizar fue: ' + e))
}

module.exports = actualizar