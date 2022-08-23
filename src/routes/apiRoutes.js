import { Router } from "express"
import passport from "passport"
import { fork } from 'child_process'
import os from "os" //libreria nativa de node
import compression from "compression"
import logger from "../../logger.js"

const router = Router()

const numCPUs = os.cpus().length //obtengo el numero de cpus en mi compu

//Creo funcion para chequear si el usuario esta autenticado
function isAuth(req, res, next){
    if(req.isAuthenticated()){ //req.isAuthenticated() devuelve true o false. es true si esta la info de la persona en session porque se autentico
        next()
    } else {
        res.render('signIn')
    }
}

const d = new Date();
    const day = d.getDate()
    const month = d.getMonth() + 1
    const year = d.getFullYear()
    const hour = d.getHours()
    const minutes = d.getMinutes()
    const second = d.getMilliseconds()
    const date = `${day}/${month}/${year} ${hour}:${minutes}:${second}`

router.get('/signUp', (req, res) => {
    logger.info(`${date} -Route: /signUp -Method: GET`)
    res.render('signUp')
})

router.post('/signUp', passport.authenticate('registro', { //al hacer esto (el passport.authenticate) ya guarda en session los datos (si se dio success)
    failureRedirect: '/errorRegistro',
    successRedirect: '/login'
})) //No se como poner el logger.info en estos

router.get('/errorRegistro', (req, res) => {
    logger.info(`${date} -Route: /errorRegistro -Method: GET`)
    res.render('errorRegistro')
})

router.get('/login', (req, res) => {
    logger.info(`${date} -Route: /login -Method: GET`)
    res.render('signIn')
})

router.post('/login', passport.authenticate('login', { //al hacer esto se guardan los datos en session (si salio success)
    failureRedirect: '/errorLogin',
    successRedirect: '/bienvenido'
}))

router.get('/errorLogin', (req, res) => {
    logger.info(`${date} -Route: /errorLogin -Method: GET`)
    res.render('errorLogin')
})

router.get('/bienvenido', isAuth, (req, res) => {
    logger.info(`${date} -Route: /bienvenido -Method: GET`)
    res.render('bienvenido', {email: req.user.email})
})

router.get('/logout', (req, res) => {
    req.session.destroy(err => {
        if(err){
            return res.json({status: 'logout ERROR'})
        }
        })
    logger.info(`${date} -Route: /logout -Method: GET`)
    res.render('adios')
})

router.get('/info', compression(), (req, res) => {
    logger.info(`${date} -Route: /info -Method: GET`)
    res.render('info', {
        argumentosEntrada: process.argv[3],
        nombrePlataformaSO: process.platform,
        versionNode: process.version,
        memoriaRservada: process.memoryUsage.rss(),
        execPath: process.execPath,
        processId: process.pid,
        projectFile: process.cwd(),
        numeroProcesadores: numCPUs
    })
})


router.get('/api/randoms', (req, res)=>{
    logger.info(`${date} -Route: /api/randoms -Method: GET`)
    const { cant } = req.query
    if(!cant){
        logger.error(`${date} -Route: /api/randoms -Method: GET -Error: cantidad no especificada`)
        res.status(400).send("You must send a number using cant parameter")
    }
    //const cantNumeros = cant || 100000000 //si el 1ro no existe, toma el 2do
    const forky = fork('./src/funRandom/funRandom.js') //la ruta se pone como si la buscara desde sever porque desde ahi abre esta ruta con el .use
    //forky.send(cantNumeros) //le envio la catidad como mensaje a la ruta que le puse a fork
    forky.send(cant)
    forky.on('message', nrosRandom => { //recibo la rsta enviada desde la ruta que le puse a fork
        res.send(nrosRandom)
    })

})

//rutas inexistentes del servidor
router.get('*', (req, res) =>{
    logger.warn(`${date} -Route: ${req.url} 404 not found -Method: GET`)
    res.send('Sorry, this url doesn\'t exist')
})

export default router 