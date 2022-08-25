const passport = require('passport');

exports.autenticarUsuario = passport.authenticate('local', {
    successRedirect : '/administracion',
    failureRedirect: '/iniciar-sesion', 
    failureFlash : true,
    badRequestMessage : 'Ambos campos son obligatorios'
});

// Revisa si el usuario esta autenticado o no
exports.usuarioAutenticado = (req, res, next) => {
    // Si el usuario esta autenticado, adelante
    if(req.isAuthenticated() ) {
        return next();
    }

    // Sino esta autenticado
    return res.redirect('/iniciar-sesion');
}

// Cerrar sesión
exports.cerrarSesion = (req, res, next) => {
    req.logout();
    req.flash('correcto', 'Cerraste sesión correctamente');
    res.redirect('/iniciar-sesion');
    next();
}