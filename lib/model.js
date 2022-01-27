const mongoose = require('mongoose')



const informacionSchema = mongoose.Schema({
    nombre:String,
    producto:String,
    cantidad:Number,
    categoria:String,
    unidad: String,
    estado: Number,
    numero: String
},{versionKey: false})

module.exports.modelEnc  = mongoose.model('encomiendas',informacionSchema,'informacion')