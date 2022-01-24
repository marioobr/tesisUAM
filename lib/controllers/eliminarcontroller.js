const mongoose = require('mongoose')
const model = require('../model')

const eliminar = async(id) => {
    const encomiendaEliminar = await model.modelEnc.deleteOne({_id:id})
    console.log(encomiendaEliminar)
 }

module.exports = eliminar