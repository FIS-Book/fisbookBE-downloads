const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Download = require('../models/downloads'); // Importa el modelo de descargas
const debug = require('debug')('downloads-2:server');

/* GET /downloads - Obtener todas las descargas */
router.get('/', async function(req, res, next) {
  try {
    const result = await Download.find(); // Obtiene todas las descargas desde la base de datos
    res.json(result.map((c) => c.cleanup())); // Devuelve las descargas con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/* GET /downloads/:id - Obtener una descarga por ID */
router.get('/:id', async function(req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  try {
    const download = await Download.findById(id); // Buscar la descarga por ID en la base de datos
    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); // Si no se encuentra, responde con un error 404
    }
    res.json(download.cleanup()); // Devuelve la descarga con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/* POST /downloads - Crear una nueva descarga */
router.post('/', async function(req, res, next) {
  const { usuarioId, libro, formato } = req.body; // Obtener los datos del cuerpo de la solicitud

  const newDownload = new Download({
    usuarioId,
    libro,
    formato: formato || 'PDF', // Si no se proporciona formato, se asigna 'PDF' por defecto
    fecha: new Date().toISOString().split('T')[0] // Fecha actual en formato 'YYYY-MM-DD'
  });

  try {
    await newDownload.save(); // Guardar la nueva descarga en la base de datos
    res.status(201).json(newDownload.cleanup()); // Devolver la descarga recién creada con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
})

/* PUT /downloads/:id - Actualizar una descarga */
router.put('/:id', async function(req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  const { usuarioId, libro, formato } = req.body; // Obtener los datos a actualizar

  try {
    const download = await Download.findById(id); // Buscar la descarga por ID en la base de datos

    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); // Si no se encuentra, responde con un error 404
    }

    // Actualizar los datos de la descarga
    download.usuarioId = usuarioId || download.usuarioId;
    download.libro = libro || download.libro;
    download.formato = formato || download.formato;

    await download.save(); // Guardar los cambios en la base de datos
    res.json(download.cleanup()); // Devolver la descarga actualizada con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/* DELETE /downloads/:id - Eliminar una descarga */
router.delete('/:id', async function(req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL

  try {
    const download = await Download.findByIdAndDelete(id); // Eliminar la descarga de la base de datos

    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); // Si no se encuentra, responde con un error 404
    }

    res.json({ message: 'Descarga eliminada' }); // Responde con un mensaje de éxito
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

module.exports = router;
