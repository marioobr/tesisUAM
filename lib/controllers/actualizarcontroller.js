const mongoose = require('mongoose')
const model = require('../model')


const actualizar = async (id)=>{
    const encomienda = await model.modelEnc.updateOne({_id:id},
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