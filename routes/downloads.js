const express = require('express');
const router = express.Router();
const Download = require('../models/downloads'); // Importa el modelo de descargas
const debug = require('debug')('downloads-2:server');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');
const axios = require('axios');

// Microservicio de Lista de Lecturas
const MS_READING_URL = process.env.MS_READING_URL; // URL del microservicio de listas de lectura

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
 * /api-v1/downloads:
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
router.get('/downloads/', async function (req, res, next) {
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
 * /api-v1/downloads/{id}:
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

/* GET /downloads/:id - Obtener una descarga por ID */
router.get('/downloads/:id', async function (req, res, next) {
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


/*
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
* /        description: Error en el servidor.

/* POST /downloads - Crear una nueva descarga */
router.post('/downloads/', async function (req, res, next) {
  const { usuarioId, libro, formato } = req.body; // Obtener los datos del cuerpo de la solicitud

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
 * /api-v1/downloads/{id}:
 *   put:
 *     summary: Actualiza una descarga por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descarga.
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
 *     responses:
 *       200:
 *         description: Descarga actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Descarga no encontrada.
 *       500:
 *         description: Error en el servidor.
 */

/*
 *   put:
 *     summary: Actualiza una descarga por ID.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID de la descarga.
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
 *                 type: string
 *               libro:
 *                 type: string
 *               formato:
 *                 type: string
 *     responses:
 *       200:
 *         description: Descarga actualizada exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Download'
 *       404:
 *         description: Descarga no encontrada.
 *       500:
 *         description: Error en el servidor.
 * /
 * 
/* PUT /downloads/:id - Actualizar una descarga */
router.put('/downloads/:id', async function (req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  const { usuarioId, isbn, titulo, autor, idioma, formato } = req.body; // Obtener los datos a actualizar

  try {
    const download = await Download.findById(id); // Buscar la descarga por ID en la base de datos

    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); // Si no se encuentra, responde con un error 404
    }

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

    // Actualizar los datos de la descarga
    download.usuarioId = usuarioId || download.usuarioId;
    download.isbn = isbn || download.isbn;
    download.titulo = titulo || download.titulo;
    download.autor = autor || download.autor;
    download.idioma = idioma || download.idioma;
    download.formato = formato || download.formato;

    await download.save(); // Guardar los cambios en la base de datos
    res.json(download.cleanup()); // Devolver la descarga actualizada con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500); // En caso de error, responde con un código 500
  }
});

/**
 * @swagger
 * /api-v1/downloads/{id}:
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

/* DELETE /downloads/:id - Eliminar una descarga */
router.delete('/downloads/:id', async function (req, res, next) {
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
 * /api-v1/downloads/count:
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

router.get('/:isbn/downloads', async (req, res) => {
  const { isbn } = req.query;

  // Validar que el ISBN esté presente y tenga el formato correcto
  if (!isbn || !/^(?:\d{9}X|\d{10}|\d{13})$/.test(isbn)) {
    return res.status(400).json({ message: 'El ISBN es inválido o falta en la solicitud.' });
  }

  try {
    // Buscar las descargas del libro por ISBN
    const downloadCount = await Download.countDocuments({ isbn });

    // Si no se encontraron descargas
    if (downloadCount === 0) {
      return res.status(404).json({ message: 'No se encontraron descargas para este libro.' });
    }

    // Responder con el número de descargas
    return res.status(200).json({ count: downloadCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.message });
  }
});


/**
 * @swagger
 * /api-v1/downloads/user/count:
 *   get:
 *     summary: Cuenta el número de descargas realizadas por un usuario.
 *     description: Devuelve el número de descargas realizadas por un usuario dado su `usuarioId`.
 *     parameters:
 *       - in: query
 *         name: usuarioId
 *         required: true
 *         description: El ID del usuario cuyo número de descargas se desea conocer.
 *         schema:
 *           type: number
 *           example: 1234567890
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

router.get('/downloads/user/count', async (req, res) => {
  const { usuarioId } = req.query;

  // Validar que el usuarioId esté presente y sea un número
  if (!usuarioId || typeof usuarioId !== 'number') {
    return res.status(400).json({ message: 'El ID de usuario es inválido o falta en la solicitud.' });
  }

  try {
    // Buscar las descargas del usuario por usuarioId
    const downloadCount = await Download.countDocuments({ usuarioId });

    // Si no se encontraron descargas
    if (downloadCount === 0) {
      return res.status(404).json({ message: 'No se encontraron descargas para este usuario.' });
    }

    // Responder con el número de descargas
    return res.status(200).json({ count: downloadCount });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.message });
  }
});


/**
 * @swagger
 * /api-v1/downloads/download-all:
 *   get:
 *     summary: Descarga todos los libros de una lista de lectura de un usuario.
 *     description: Permite descargar todos los libros asociados a un usuario.
 *     parameters:
 *       - in: query
 *         name: userId
 *         required: true
 *         description: El ID del usuario cuyos libros se desean descargar.
 *         schema:
 *           type: string
 *           example: "00000000001"
 *     responses:
 *       200:
 *         description: Libros obtenidos y descargados exitosamente.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 downloads:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       isbn:
 *                         type: string
 *                       titulo:
 *                         type: string
 *                       autor:
 *                         type: string
 *                       formato:
 *                         type: string
 *       400:
 *         description: Parámetros inválidos en la solicitud.
 *       404:
 *         description: No se encontraron libros para el usuario.
 *       500:
 *         description: Error inesperado del servidor.
 */

router.get('/downloads/download-readinglist', async (req, res) => {
  const { userId } = req.query;

  // Validar que el userId está presente
  if (!userId) {
    return res.status(400).json({ message: 'El parámetro userId es obligatorio.' });
  }

  try {
    // Hacer una solicitud al microservicio de lectura para obtener todos los libros del usuario
    const response = await axios.get(`${MS_READING_URL}/api/v1/readings`, {
      params: { userId: userId }
    });

    // Verificar si se encontraron libros
    if (!response.data || response.data.length === 0) {
      return res.status(404).json({ message: 'No se encontraron libros para el usuario.' });
    }

    // Guardar los libros descargados en la base de datos
    const downloads = await Promise.all(response.data.map(async (book) => {
      const downloadEntry = new Download({
        usuarioId: userId,
        isbn: book.isbn,
        titulo: book.titulo,
        autor: book.autor,
        formato: book.formato,
        fecha: new Date().toISOString().split('T')[0] // Fecha actual
      });

      // Guardar la entrada de descarga en la base de datos
      return await downloadEntry.save();
    }));

    // Responder con los libros descargados
    return res.status(200).json({
      message: 'Libros obtenidos y descargados exitosamente.',
      downloads: downloads
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error inesperado en el servidor.', error: error.message });
  }
});

module.exports = router;

