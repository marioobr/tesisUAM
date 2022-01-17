const mongoose = requier('mongoose')

const mostrar = async()=> {
    //Find muestra muestra toda la informacion de la coleccion
    const encomiendas = await EncomiendasModel.find()
    console.log(encomiendas)
}

//mostrar()

const crear = async (nombre, producto,cantidad,categoria)=> {
    const encCrear = EncomiendasModel({
        nombre : nombre,
        producto : producto,
        cantidad: cantidad,
        categoria: categoria

    })
    .then(()=> console.log('Cliente Agregado'))
    .catch((e)=> console.log('El error al crear fue: ' + e))

    const res = await encCrear.save()
    console.log(res)
}

//crear()

const actualizar = async (id)=>{
    const encomienda = await EncomiendasModel.updateOne({_id:id},
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

//actualizar('61e5ca384e4d5f0b125fd5e5')
 const eliminar = async(id) => {
    const encomiendaEliminar = await EncomiendasModel.deleteOne({_id:id})
    console.log(encomiendaEliminar)
 }

//  eliminar('61e5ca384e4d5f0b125fd5e5')