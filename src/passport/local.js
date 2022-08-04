import passport from "passport";
import { Strategy } from 'passport-local';
import Usuarios from '../modeloMongoose/modeloMongoose.js'
import bcrypt from 'bcrypt'

const LocalStrategy = Strategy; //guardo el metodo en esa cte

//creo funcion comprar para la contra encriptada
const comparar = (password, userEncryptPass) => {
    return bcrypt.compareSync(password, userEncryptPass)
}

//Creo mis funciones passport
passport.use('registro', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, email, password, done) => {
    const usuarioBD = await Usuarios.findOne({email: email})
    if(usuarioBD){
        return done(null, false); // si ya existe devlve null porque no hubo error, pero false indicando que la rsta no fue satisfactoria. false indica falla en el registro
        //pongo return para que frene la ejec de la funcion si ya existia
    }
    const usuarioNuevo = new Usuarios(); //creo nueva instancia del modelo (o sea, un documento) que tendra los metodos que tiene el modelo
    usuarioNuevo.email = email;
    usuarioNuevo.password = usuarioNuevo.encriptar(password);
    await usuarioNuevo.save();
    return done(null, usuarioNuevo);
}
))

passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true
}, async(req, email, password, done) => {
    const usuarioBD = await Usuarios.findOne({email: email})
    if(!usuarioBD){
        return done(null, false)
    }
    if(!comparar(password, usuarioBD.password)){
        return done(null, false)
    }
    return done(null, usuarioBD)
}
))

//creo la serializ y deserializ --> por esto en session se guarda en passport solo user y el id, no se pasa toda la info del usuario que se logueo
passport.serializeUser((usuario, done) => {
    done(null, usuario.id)
})
passport.deserializeUser(async(id, done) => {
    const usuario = await Usuarios.findById(id);
    done(null, usuario)
})


