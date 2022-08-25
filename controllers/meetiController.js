const Grupos = require('../models/Grupos');
const Meeti = require('../models/Meeti');

const uuid = require('uuid/v4');

// Muestra el formulario para nuevas Publicaciones
exports.formNuevoMeeti = async (req, res) => {
    const grupos = await Grupos.findAll({ where : { usuarioId : req.user.id }});

    res.render('nuevo-meeti', {
        nombrePagina : 'Crear Nueva Publicación',
        grupos
    })
}
// Inserta nuevas Publicaciones en la BD
exports.crearMeti = async (req, res) => {
    // Obtener los datos
    const meeti = req.body;

    // Asignar el usuario
    meeti.usuarioId = req.user.id;
    
    // Cupo opcional
    if(req.body.cupo === '') {
        meeti.cupo = 0;
    }

    meeti.id = uuid();

    // Almacenar en la BD
    try {
        await Meeti.create(meeti);
        req.flash('exito', 'Se ha creado una Publicación Correctamente');
        res.redirect('/administracion');
    } catch (error) {
        // Extraer el message de los errores
        const erroresSequelize = error.errors.map(err => err.message);
        req.flash('error', erroresSequelize);
        res.redirect('/nuevo-meeti');
    }

}
// Sanitiza las Publicaciones
exports.sanitizarMeeti = (req, res, next) => {
    req.sanitizeBody('titulo');
    req.sanitizeBody('invitado');
    req.sanitizeBody('cupo');
    req.sanitizeBody('fecha');
    req.sanitizeBody('hora');
    req.sanitizeBody('grupoId');

    next();
}

// Muestra el formulario para editar una Publicación
exports.formEditarMeeti = async (req, res, next) => {
    const consultas = [];
    consultas.push( Grupos.findAll({ where : { usuarioId : req.user.id }}) );
    consultas.push( Meeti.findByPk(req.params.id) );

    // Return un promise
    const [ grupos, meeti ] = await Promise.all(consultas);

    if(!grupos || !meeti ){
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Mostramos la vista
    res.render('editar-meeti', {
        nombrePagina : `Editar Publicación : ${meeti.titulo}`,
        grupos, 
        meeti
    })

}

// Almacena los cambios en la Publicación (BD)
exports.editarMeeti = async (req, res, next) => {
    const meeti = await Meeti.findOne({ where : { id: req.params.id, usuarioId : req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Asignar los valores
    const { grupoId, titulo, invitado, fecha, hora, cupo, descripcion} = req.body; 

    meeti.grupoId = grupoId;
    meeti.titulo = titulo;
    meeti.invitado = invitado;
    meeti.fecha = fecha;
    meeti.hora = hora;
    meeti.cupo = cupo;
    meeti.descripcion = descripcion;

    // Almacenar en la BD
    await meeti.save();
    req.flash('exito', 'Cambios Guardados Correctamente');
    res.redirect('/administracion');

}

// Muestra un formulario para eliminar Publicaciones
exports.formEliminarMeeti = async ( req, res, next) => {
    const meeti = await Meeti.findOne({ where : { id : req.params.id, usuarioId : req.user.id }});

    if(!meeti) {
        req.flash('error', 'Operación no valida');
        res.redirect('/administracion');
        return next();
    }

    // Mostrar la vista
    res.render('eliminar-meeti', {
        nombrePagina : `Eliminar Publicacion : ${meeti.titulo}`
    })
}

// Elimina la Publiación de la BD
exports.eliminarMeeti = async (req, res) => {
    await Meeti.destroy({
        where: {
            id: req.params.id
        }
    });

    req.flash('exito', 'Publicación Eliminada');
    res.redirect('/administracion');

}