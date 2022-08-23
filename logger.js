import winston from 'winston'
import dotenv from 'dotenv'

dotenv.config();

//Creo dos funciones para tener un logger si estoy en produccion y otro si estoy en desarrollo
function loggerProd(){
    const loggerProd = winston.createLogger({
        transports: [
            new winston.transports.File({filename: 'prodError.log', level: 'error'})
        ]
    })

    return loggerProd

}

function loggerDev(){
    const loggerDev = winston.createLogger({
        transports: [
            new winston.transports.Console({level: 'info'}),
            new winston.transports.File({filename: 'devWarn', level: 'warn'}),
            new winston.transports.File({filename: 'devError', level: 'error'})
        ]
    })

    return loggerDev
}

let logger = null 
if(process.env.NODE_ENV === "PROD"){
    logger = loggerProd()
}else{
    logger = loggerDev()
}

export default logger 