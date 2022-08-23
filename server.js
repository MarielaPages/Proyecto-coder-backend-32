import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import './src/passport/local.js'
import './src/mongooseConnection/mongooseConnection.js'
import apiRoutes from './src/routes/apiRoutes.js'
import dotenv from 'dotenv'
import morgan from "morgan" //Para ver los codigos de estado cuando monitorizamos
//import path from 'path';
//import { fileURLToPath } from 'url'; --> el de arriba y este son por si quisiera usar __dirname
//para usar el __dirname hay que hacer un par de configs (ver https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/)
import cluster from 'cluster' //lib nativa de node
import os from 'os' //lib nativa de node

//creo mi app servidor
const app = express();
const MODO_CLUSTER = process.argv[2] 

if(MODO_CLUSTER === 'CLUSTER' && cluster.isPrimary){
    const numCPUs = os.cpus().length //num de cspus de mi compu
    for (let i=0; i<numCPUs; i++){
        cluster.fork() //crea un servidor fork para cada cpu (una instancia del servidor por cada cpu)
    }
    //Utilizo metodo on de cluster por si muere/cae una de las instancias del servidor. Si sucede, se creara otra automaticamente. 
    cluster.on('exit', (worker, code, signal) => {
        cluster.fork()
    })
} else{
    //inicializo el metodo config para que dotenv pueda leer el .env y trabajar con el
    dotenv.config();

    //le digo a la app donde estaran mis templates y prendo el motor de plantillas
    app.set('views', './src/views')
    app.set('view engine', 'ejs')

    //middlewares
    app.use(morgan("dev"))
    app.use(express.json())
    app.use(express.urlencoded({extended:true}))
    app.use(session({
        secret:'secretKey',
        saveUninitialized: false,
        resave:false,
        store: MongoStore.create({mongoUrl: `mongodb+srv://${process.env.MONGO_BD_PASSWORD}@cluster0.ashm8.mongodb.net/sessionMongoD26?retryWrites=true&w=majority`}),
        cookie: {maxAge:600000} //sesion expira en 10 mins (a menos que refresque la pagina del sitio, que seria la de bienvenido)
    }))
    app.use(passport.initialize()) //creo que este es para que funcione passport
    app.use(passport.session())//para que session funcione con passport
    app.use('/', apiRoutes)



    //inicio server
    const PORT = parseInt(process.argv[3]) || 8080
    const server = app.listen(PORT, () => {
        console.log(`Your app is listening on port ${PORT}`)
    })

    server.on('error', error => console.log(`Error en el servidor ${error}`))
    }

