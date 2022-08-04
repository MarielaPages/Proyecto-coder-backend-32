//recibo el mensaje de cantidad enviado con el .send() 
//que pude usar al implementar el metodo fork() de child-process.
//Este fue enviado desde donde importe a fork() y lo inicialice con este archivo
process.on('message', cantidadNums => {
    process.send(random(cantidadNums)) //con esto le retorno una respuesta
})                                 //al metodo fork que incialice (?)

const random = function(cant){
    const nrosRandom = {}
    
    for(let i=0; i<=cant; i++){
        let nro = Math.floor(Math.random()*1000) + 1
        if(nrosRandom[nro]){
            nrosRandom[nro] = nrosRandom[nro] + 1
        } else{
            nrosRandom[nro] = 1
        }
    }
    
    return nrosRandom
}

