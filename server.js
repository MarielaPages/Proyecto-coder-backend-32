import express from 'express'
import session from 'express-session'
import MongoStore from 'connect-mongo'
import passport from 'passport'
import './src/passport/local.js'
import './src/mongooseConnection/mongooseConnection.js'
import apiRoutes from './src/routes/apiRoutes.js'
import dotenv from 'dotenv'
import yargs from 'yargs/yargs'
//import path from 'path';
//import { fileURLToPath } from 'url'; --> el de arriba y este son por si quisiera usar __dirname
//para usar el __dirname hay que hacer un par de configs (ver https://flaviocopes.com/fix-dirname-not-defined-es-module-scope/)

//console.log(yargs(process.argv)) esto devuelve objeto que tiene a argv como una prop con su valor (un objeto con los args)
const args = yargs(process.argv.slice(2)).default({PORT:8080}).argv //variable que contiene el objeto argv que estaba en el objeto antes mencionado
//console.log(args)

//inicializo el metodo config para que dotenv pueda leer el .env y trabajar con el
dotenv.config();

//creo mi app servidor
const app = express();

//le digo a la app donde estaran mis templates y prendo el motor de plantillas
app.set('views', './src/views')
app.set('view engine', 'ejs')

//middlewares
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
const PORT = args.PORT
const server = app.listen(PORT, () => {
    console.log(`Your app is listening on port ${PORT}`)
})

server.on('error', error => console.log(`Error en el servidor ${error}`))