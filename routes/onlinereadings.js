const express = require('express');
const router = express.Router();
const OnlineReading = require('../models/onlineReadings.js');
const debug = require('debug')('onlineReadings-2:server');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');

/**
* @swagger
* /api/v1/read-and-download/onlineReadings:
*   get:
*     summary: Obtiene todas las lecturas en línea.
*     responses:
*       200:
*         description: Lista de lecturas obtenida exitosamente.
*         content:
*           application/json:
*             schema:
*               type: array
*               items:
*                 $ref: '#/components/schemas/OnlineReading'
*       500:
*         description: Error en el servidor.
*/
router.get('/onlineReadings', authenticateAndAuthorize(['Admin']), async function(req, res, next) {
  try {
    // Obtener todas las lecturas en línea de la base de datos
    const onlineReadings = await OnlineReading.find();

    // Retornar la respuesta con las lecturas en línea
    res.status(200).json({ onlineReadings });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' }); // Solo enviamos la respuesta con json
  }
  
});


/**
* @swagger
* /api/v1/read-and-download/onlineReadings/{id}:
*   get:
*     summary: Obtiene una lectura en línea por ID.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: ID de la lectura.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Lectura obtenida exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/OnlineReading'
*       404:
*         description: Lectura no encontrada.
*       500:
*         description: Error en el servidor.
*/
router.get('/onlineReadings/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  try {
    const onlineReading = await OnlineReading.findById(id); // Buscar la lectura en línea por ID en la base de datos
    if (!onlineReading) {
      return res.status(404).json({ message: 'Lectura en línea no encontrada' }); // Si no se encuentra, responde con un error 404
    }
    res.json(onlineReading.cleanup()); // Devuelve la lectura con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({ message: 'Error en el servidor' }); // En caso de error, responde con un mensaje de error
  }
});

/**
* @swagger
* /api/v1/read-and-download/onlineReadings:
*   post:
*     summary: Crea una nueva lectura en línea.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               usuarioId:
*                 type: number
*               isbn:
*                 type: string
*               titulo:
*                 type: string
*               autor:
*                 type: string
*               idioma:
*                 type: string
*                 enum: ['en', 'es', 'fr', 'de', 'it', 'pt']
*               formato:
*                 type: string
*                 enum: ['PDF', 'EPUB']
*                 default: 'PDF'
*     responses:
*       201:
*         description: Lectura en línea creada exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/OnlineReading'
*       400:
*         description: Datos inválidos.
*       500:
*         description: Error en el servidor.
*/
router.post('/onlinereadings', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const { usuarioId, isbn, titulo, autor, idioma, formato } = req.body;

  // Validar los datos antes de guardar
  if (!isbn.match(/^(?:\d{9}X|\d{10}|\d{13})$/)) {
    return res.status(400).json({ message: 'Invalid ISBN format. Must be ISBN-10 or ISBN-13.' });
  }

  if (titulo.length < 3 || titulo.length > 121) {
    return res.status(400).json({ message: 'The title must be at least 3 characters long and cannot be longer than 121 characters.' });
  }

  if (!['en', 'es', 'fr', 'de', 'it', 'pt'].includes(idioma)) {
    return res.status(400).json({ message: 'The language must be one of the following: en, es, fr, de, it, pt.' });
  }

  if (formato && formato !== 'PDF') {
    return res.status(400).json({ message: 'The format must be PDF.' });
  }

  // Crear la nueva lectura en línea
  const newOnlineReading = new OnlineReading({
    usuarioId,
    isbn,
    titulo,
    autor,
    idioma,
    formato: formato || 'PDF', // Si no se proporciona formato, se asigna 'PDF' por defecto
    fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato 'YYYY-MM-DD'
  });

  try {
    await newOnlineReading.save(); // Guardar la nueva lectura en línea en la base de datos
    res.status(201).json(newOnlineReading.cleanup()); // Respuesta exitosa con código 201
  } catch (e) {
    console.error('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/**
* @swagger
* /api/v1/read-and-download/onlineReadings/{id}:
*   delete:
*     summary: Elimina una lectura en línea por ID.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: ID de la lectura.
*         schema:
*           type: string
*     responses:
*       200:
*         description: Lectura eliminada exitosamente.
*       404:
*         description: Lectura no encontrada.
*       500:
*         description: Error en el servidor.
*/
router.delete('/onlineReadings/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL

  try {
    const onlineReading = await OnlineReading.findByIdAndDelete(id); // Eliminar la lectura en línea de la base de datos
    if (!onlineReading) {
      return res.status(404).json({ message: 'Lectura en línea no encontrada' }); // Si no se encuentra, responde con un error 404
    }
    res.json({ message: 'Lectura eliminada' }); // Responde con un mensaje de éxito
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({ message: 'Error en el servidor' }); // En caso de error, responde con un mensaje de error
  }
});

module.exports = router;

