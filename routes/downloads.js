const express = require('express');
const router = express.Router();
const Download = require('../models/downloads'); // Importa el modelo de descargas
const debug = require('debug')('downloads-2:server');

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
 * /

/* GET /api-v1/downloads - Obtener todas las descargas */
router.get('/', async function (req, res, next) {
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

/* GET /api-v1/downloads/:id - Obtener una descarga por ID */
router.get('/:id', async function (req, res, next) {
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
 * /api-v1/downloads:
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

/* POST /api-v1/downloads - Crear una nueva descarga */
router.post('/', async function (req, res, next) {
  const { usuarioId, isbn, titulo, autor, idioma, formato } = req.body; // Obtener los datos del cuerpo de la solicitud

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
    res.status(201).json(newDownload.cleanup()); // Devolver la descarga recién creada con limpieza de atributos
  } catch (e) {
    debug('DB problem', e);
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

/* PUT /api-v1/downloads/:id - Actualizar una descarga */
router.put('/:id', async function (req, res, next) {
  const id = req.params.id; // Obtener el ID de la URL
  const { usuarioId, isbn, titulo, autor, idioma, formato } = req.body; // Obtener los datos a actualizar

  try {
    const download = await Download.findById(id); // Buscar la descarga por ID en la base de datos

    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); // Si no se encuentra, responde con un error 404
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

/* DELETE /api-v1/downloads/:id - Eliminar una descarga */
router.delete('/:id', async function (req, res, next) {
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
// Catálogo: Desde la página de detalles de un libro, que se pueda acceder a su lectura y descarga.

// Lista de lecturas: Desde una lista de lectura, que puedas descargarte TODOS los libros de esa lista.

module.exports = router;
