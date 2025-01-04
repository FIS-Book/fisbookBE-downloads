const express = require('express');
const router = express.Router();
const OnlineReading = require('../models/onlineReadings.js');
const debug = require('debug')('onlineReadings-2:server');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');

/**
* @swagger
* /api-v1/onlineReadings:
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
router.get('/', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  try {
    const result = await OnlineReading.find(); // Obtiene todas las lecturas en línea desde la base de datos
    res.json(result.map((c) => c.cleanup())); // Devuelve las lecturas con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({ message: 'Error en el servidor' }); // En caso de error, responde con un mensaje de error
  }
});

/**
* @swagger
* /api-v1/onlineReadings/{id}:
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
router.get('/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
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
* /api-v1/onlineReadings:
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
router.post('/', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const { usuarioId, titulo, autor, idioma, formato = 'PDF' } = req.body;

  // Validar datos obligatorios
  if (!usuarioId || !titulo || !autor || !idioma) {
    return res.status(400).json({ 
      message: 'Faltan datos obligatorios: usuarioId, titulo, autor, idioma.'
    });
  }

  // Validación del título
  if (titulo.length < 3 || titulo.length > 121) {
    return res.status(400).json({
      message: 'El título debe tener entre 3 y 121 caracteres.'
    });
  }

  // Validación de idioma
  if (!['en', 'es', 'fr', 'de', 'it', 'pt'].includes(idioma)) {
    return res.status(400).json({
      message: 'El idioma debe ser uno de los siguientes: en, es, fr, de, it, pt.'
    });
  }

  // Validación de formato
  if (formato !== 'PDF') {
    return res.status(400).json({
      message: 'El formato solo puede ser PDF.'
    });
  }

  const newOnlineReading = new OnlineReading({
    usuarioId,
    titulo,
    autor,
    idioma,
    formato,
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
  });

  try {
    // Guardar la nueva lectura en la base de datos
    await newOnlineReading.save();
    res.status(201).json(newOnlineReading.cleanup()); // Responder con la lectura recién creada
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({
      message: 'Error en el servidor al guardar la lectura en línea. Por favor, inténtelo más tarde.'
    });
  }
});


/**
* @swagger
* /api-v1/onlineReadings/{id}:
*   put:
*     summary: Actualiza una lectura en línea por ID.
*     parameters:
*       - in: path
*         name: id
*         required: true
*         description: ID de la lectura.
*         schema:
*           type: string
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
*     responses:
*       200:
*         description: Lectura en línea actualizada exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/OnlineReading'
*       404:
*         description: Lectura no encontrada.
*       400:
*         description: Datos inválidos.
*       500:
*         description: Error en el servidor.
*/
router.put('/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  const { usuarioId, titulo, autor, idioma, formato } = req.body; // Obtener datos de la solicitud

  try {
    // Buscar la lectura por ID
    const onlineReading = await OnlineReading.findById(id);
    if (!onlineReading) {
      return res.status(404).json({
        message: 'Lectura en línea no encontrada. Asegúrese de que el ID sea válido.'
      });
    }

    // Validación del título
    if (titulo && (titulo.length < 3 || titulo.length > 121)) {
      return res.status(400).json({
        message: 'El título debe tener entre 3 y 121 caracteres.'
      });
    }

    // Validación de idioma
    if (idioma && !['en', 'es', 'fr', 'de', 'it', 'pt'].includes(idioma)) {
      return res.status(400).json({
        message: 'El idioma debe ser uno de los siguientes: en, es, fr, de, it, pt.'
      });
    }

    // Validación de formato
    if (formato && formato !== 'PDF') {
      return res.status(400).json({
        message: 'El formato solo puede ser PDF.'
      });
    }

    // Actualizar la lectura en línea
    onlineReading.usuarioId = usuarioId || onlineReading.usuarioId;
    onlineReading.titulo = titulo || onlineReading.titulo;
    onlineReading.autor = autor || onlineReading.autor;
    onlineReading.idioma = idioma || onlineReading.idioma;
    onlineReading.formato = formato || onlineReading.formato;

    await onlineReading.save(); // Guardar cambios en la base de datos
    res.status(200).json(onlineReading.cleanup()); // Responder con la lectura actualizada
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({
      message: 'Error en el servidor al actualizar la lectura. Por favor, inténtelo más tarde.'
    });
  }
});


/**
* @swagger
* /api-v1/onlineReadings/{id}:
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
router.delete('/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
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

