const mongoose = require('mongoose')



const informacionSchema = mongoose.Schema({
    nombre:String,
    producto:String,
    cantidad:Number,
    categoria:String
},{versionKey: false})

const modelEnc  = mongoose.model('encomiendas',informacionSchema,'informacion')