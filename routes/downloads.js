const express = require('express');
const router = express.Router();
const Download = require('../models/downloads'); // Importa el modelo de descargas
const debug = require('debug')('downloads-2:server');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');
const axios = require('axios');

// Microservicio de Lista de Lecturas
const MS_READING_LIST_URL = process.env.MS_READING_LIST_URL;
const BASE_URL = process.env.BASE_URL;

// HEALTH CHECK
router.get('/healthz', (req, res) => {
  /* 
  #swagger.tags = ['Health']
  #swagger.description = 'Endpoint to check the health status of the service.'
  #swagger.responses[200] = { $ref: '#/responses/ServiceHealthy' }
  #swagger.responses[500] = { $ref: '#/responses/ServerError' }
*/
res.sendStatus(200);
});

/**
 * @swagger
 * /api/v1/read-and-download/downloads:
 *   get:
 *     summary: Obtiene todas las descargas.
 *     responses:
 *       200:
 *         description: Lista de descargas obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Download'
 *       500:
 *         description: Error en el servidor.
 */

/* GET /downloads - Obtener todas las descargas */
router.get('/downloads/', authenticateAndAuthorize(['Admin']), async function (req, res, next) {
  try {
    const result = await Download.find(); // Obtiene todas las descargas desde la base de datos
    res.json(result.map((c) => c.cleanup())); // Devuelve las descargas con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/**
 * @swagger
 * /api/v1/read-and-download/downloads/{id}:
 *   get:
 *     summary: Obtiene una descarga por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descarga.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Descarga obtenida exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Descarga no encontrada.
 *       500:
 *         description: Error en el servidor.
 */

router.get('/downloads/:id',authenticateAndAuthorize(['Admin']), async function (req, res, next) {
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


/** 
* @swagger
* /api/v1/read-and-download/downloads:
*   post:
*     summary: Crea una nueva descarga.
*     requestBody:
*       required: true
*       content:
*         application/json:
*           schema:
*             type: object
*             properties:
*               usuarioId:
*                 type: string
*               libro:
*                 type: string
*               formato:
*                 type: string
*                 default: PDF
*     responses:
*       201:
*         description: Descarga creada exitosamente.
*         content:
*           application/json:
*             schema:
*               $ref: '#/components/schemas/Download'
*       500:
*         description: Error en el servidor.
*/
router.post('/downloads/', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const { usuarioId, formato, isbn, titulo, autor, idioma } = req.body; 

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

  if (!['PDF', 'EPUB'].includes(formato)) {
    return res.status(400).json({ message: 'The format must be either PDF or EPUB.' });
  }

  // Crear la nueva descarga
  const newDownload = new Download({
    usuarioId,
    isbn,
    titulo,
    autor,
    idioma,
    formato: formato || 'PDF', // Si no se proporciona formato, se asigna 'PDF' por defecto
    fecha: new Date().toISOString().split('T')[0], // Fecha actual en formato 'YYYY-MM-DD'
  });

  try {
    await newDownload.save(); // Guardar la nueva descarga en la base de datos
    res.status(201).json(newDownload.cleanup()); // Respuesta exitosa con código 201
  } catch (e) {
    console.error('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});


/**
 * @swagger
 * /api/v1/read-and-download/downloads/{id}:
 *   delete:
 *     summary: Elimina una descarga por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descarga.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Descarga eliminada exitosamente.
 *       404:
 *         description: Descarga no encontrada.
 *       500:
 *         description: Error en el servidor.
 */

router.delete('/downloads/:id', authenticateAndAuthorize(['Admin']), async function (req, res, next) {
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

// -------------------- COMUNICACIÓN CON OTROS MICROSERVICIOS -----------------------------

/**
 * @swagger
 * /api/v1/read-and-download/downloads/count/:isbn:
 *   get:
 *     summary: Cuenta las descargas de un libro.
 *     description: Devuelve el número de veces que un libro con un ISBN específico ha sido descargado.
 *     parameters:
 *       - in: query
 *         name: isbn
 *         required: true
 *         description: El ISBN del libro del cual se desea conocer el número de descargas.
 *         schema:
 *           type: string
 *           example: "9780451524935"
 *     responses:
 *       200:
 *         description: El número de descargas del libro.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Número de descargas del libro.
 *       400:
 *         description: El ISBN proporcionado es inválido.
 *       404:
 *         description: No se encontraron descargas para el libro con el ISBN proporcionado.
 *       500:
 *         description: Error inesperado del servidor.
 */

router.get('/downloads/count/:isbn', authenticateAndAuthorize(['User', 'Admin']), async (req, res) => {
  const { isbn } = req.params;

  // Validar que el ISBN esté presente y tenga el formato correcto
  if (!isbn || !/^(?:\d{9}X|\d{10}|\d{13})$/.test(isbn)) {
    return res.status(400).json({ message: 'El ISBN es inválido o falta en la solicitud.' });
  }

  // Obtener el token desde el encabezado de autorización
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Se asume que el token viene en el formato "Bearer <token>"

  // Validar que el token esté presente
  if (!token) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado.' });
  }

  try {
    // Buscar las descargas del libro por ISBN en la base de datos
    const downloadCount = await Download.countDocuments({ isbn });

    // Si no se encontraron descargas
    if (downloadCount === 0) {
      return res.status(404).json({ message: 'No se encontraron descargas para este libro.' });
    }

    // Asegúrate de que downloadCount sea un número entero
    const downloadCountInt = parseInt(downloadCount, 10);
    
    if (isNaN(downloadCountInt)) {
      return res.status(400).json({ message: 'El número de descargas es inválido.' });
    }

    // Paso 2: Actualizar el número de descargas en el microservicio del catálogo
    await axios.patch(`${BASE_URL}/api/v1/books/${isbn}/downloads`, {
      downloadCount: downloadCountInt // Enviar el número de descargas como un entero
    }, {
      headers: {
        'Authorization': `Bearer ${token}` // Asegúrate de enviar el token de autorización correctamente
      }
    });

    // Responder con el número de descargas
    return res.status(200).json({ count: downloadCountInt });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.response ? error.response.data : error.message });
  }
});


/**
 * @swagger
 * /api/v1/read-and-download/downloads/user/count:
 *   get:
 *     summary: Cuenta el número de descargas realizadas por un usuario.
 *     description: Devuelve el número de descargas realizadas por un usuario dado su `usuarioId`.
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         description: El ID del usuario cuyo número de descargas se desea conocer.
 *         schema:
 *           type: string
 *           example: 677918707b978a621e439cd7
 *     responses:
 *       200:
 *         description: El número de descargas realizadas por el usuario.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 *                   description: Número de descargas realizadas por el usuario.
 *       400:
 *         description: El ID del usuario proporcionado es inválido.
 *       404:
 *         description: No se encontraron descargas para el usuario.
 *       500:
 *         description: Error inesperado del servidor.
 */
// La url debe ser así: /api/v1/read-and-download/downloads/user/count?usuarioId=677918707b978a621e439cd7

router.get('/downloads/user/count', async (req, res) => {
  const { usuarioId } = req.query;
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];  // Se asume que el token es enviado en el formato "Bearer <token>"

  if (!usuarioId || !token) {
    return res.status(400).json({ message: 'Faltan parámetros: usuarioId o token.' });
  }

  try {

    // Paso 1: Contar las descargas del usuario
    const downloadCount = await Download.countDocuments({ usuarioId });
    console.log(`Número de descargas: ${downloadCount}`);

    if (downloadCount === 0) {
      return res.status(404).json({ message: 'No se encontraron descargas para este usuario.' });
    }

    // Paso 2: Actualizar el número de descargas en el microservicio de usuarios
    await axios.patch(`${BASE_URL}/api/v1/auth/users/${usuarioId}/downloads`, {
      numDescargas: downloadCount  // Enviar el número de descargas como un entero
    }, {
      headers: {
        'Authorization': `Bearer ${token}`  // Enviar el token de autorización
      }
    });

    return res.status(200).json({ message: `Número de descargas actualizado para ${username}: ${downloadCount}` });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Error al contar descargas o actualizar el usuario: ${error.message}` });
  }
});

module.exports = router;

