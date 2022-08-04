import { Router } from "express"
import passport from "passport"
import yargs from "yargs/yargs"
import { fork } from 'child_process'

const router = Router()

//Creo funcion para chequear si el usuario esta autenticado
function isAuth(req, res, next){
    if(req.isAuthenticated()){ //req.isAuthenticated() devuelve true o false. es true si esta la info de la persona en session porque se autentico
        next()
    } else {
        res.render('signIn')
    }
}

//creo constante args con el objeto que tendra los argumentos de entrada
const args = yargs(process.argv).default({PORT:8080}).argv


router.get('/signUp', (req, res) => {
    res.render('signUp')
})

router.post('/signUp', passport.authenticate('registro', { //al hacer esto (el passport.authenticate) ya guarda en session los datos (si se dio success)
    failureRedirect: '/errorRegistro',
    successRedirect: '/login'
}))

router.get('/errorRegistro', (req, res) => {
    res.render('errorRegistro')
})

router.get('/login', (req, res) => {
    res.render('signIn')
})

router.post('/login', passport.authenticate('login', { //al hacer esto se guardan los datos en session (si salio success)
    failureRedirect: '/errorLogin',
    successRedirect: '/bienvenido'
}))

router.get('/errorLogin', (req, res) => {
    res.render('errorLogin')
})

router.get('/bienvenido', isAuth, (req, res) => {
    res.render('bienvenido', {email: req.user.email})
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.json({status: 'logout ERROR'})
        }
        })
    res.render('adios')
})

router.get('/info', (req, res) => {
    res.render('info', {
        argumentosEntrada: args,
        nombrePlataformaSO: process.platform,
        versionNode: process.version,
        memoriaRservada: process.memoryUsage.rss(),
        execPath: process.execPath,
        processId: process.pid,
        projectFile: process.cwd()
    })
})


router.get('/api/randoms', (req, res)=>{
    const { cant } = req.query
    const cantNumeros = cant || 100000000 //si el 1ro no existe, toma el 2do
    const forky = fork('./src/funRandom/funRandom.js') //la ruta se pone como si la buscara desde sever porque desde ahi abre esta ruta con el .use
    forky.send(cantNumeros) //le envio la catidad como mensaje a la ruta que le puse a fork
    forky.on('message', nrosRandom => { //recibo la rsta enviada desde la ruta que le puse a fork
        res.send(nrosRandom)
    })
})


export default router 