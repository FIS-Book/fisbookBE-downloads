const express = require('express');
const router = express.Router();
const Download = require('../models/downloads'); // Importa el modelo de descargas
const debug = require('debug')('downloads-2:server');
const authenticateAndAuthorize = require('../authentication/authenticateAndAuthorize');
const axios = require('axios');

// Microservicio de Lista de Lecturas
const BASE_URL = process.env.BASE_URL;

// HEALTH CHECK
/** 
 * @swagger
 * /healthz:
 *   get:
 *     tags:
 *       - Health
 *     description: 'Endpoint to check the health status of the service.'
 *     responses:
 *       200:
 *         $ref: '#/responses/ServiceHealthy'
 *       500:
 *         $ref: '#/responses/ServerError'
 */
router.get('/healthz', (req, res) => {
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
router.get('/downloads', authenticateAndAuthorize(['Admin']), async function(req, res, next) {
  try {
    const downloads = await Download.find();
 
    res.status(200).json({ downloads });
  } catch (error) {
    res.status(500).json({ message: 'Error en el servidor' });
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

router.get('/downloads/:id', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const id = req.params.id;
  try {
    const download = await Download.findById(id);
    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' });
    }
 
    const response = download.cleanup ? download.cleanup() : download;
    res.json(response);
  } catch (e) {
    debug('DB problem', e);
    res.status(500).json({ error: 'Unexpected server error' });
  }
});

/** 
 * @swagger
 * /api/v1/read-and-download/downloads:
 *   post:
 *     summary: Crea una nueva descarga.
 *     description: Este endpoint permite crear una nueva descarga en la base de datos.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               usuarioId:
 *                 type: string
 *                 description: ID del usuario que realiza la descarga.
 *               libro:
 *                 type: string
 *                 description: Título del libro que se está descargando.
 *               formato:
 *                 type: string
 *                 description: El formato del archivo a descargar. El valor predeterminado es "PDF".
 *                 default: PDF
 *     responses:
 *       201:
 *         description: Descarga creada exitosamente.
 *       400:
 *         description: Datos inválidos o faltantes. 
 *       500:
 *         description: Error inesperado al guardar la descarga. Inténtelo más tarde.
 */
router.post('/downloads', authenticateAndAuthorize(['User', 'Admin']), async function (req, res, next) {
  const { usuarioId, isbn, titulo, autor, idioma, formato} = req.body;
 
  if (!usuarioId || !isbn || !titulo || !autor || !idioma) {
    return res.status(400).json({
      message: 'Faltan datos obligatorios'
    });
  }
 
  if (titulo.length < 3 || titulo.length > 121) {
    return res.status(400).json({
      message: 'El título debe tener entre 3 y 121 caracteres.'
    });
  }
 
  if (!['en', 'es', 'fr', 'de', 'it', 'pt'].includes(idioma)) {
    return res.status(400).json({
      message: 'El idioma debe ser uno de los siguientes: en, es, fr, de, it, pt.'
    });
  }
 
  const newDownload = new Download({
    usuarioId,
    isbn,
    titulo,
    autor,
    idioma,
    formato,
    fecha: new Date().toISOString().split('T')[0],
  });
 
  try {
    await newDownload.save();
    res.status(201).json(newDownload); 
  } catch (e) {
    console.error('Error al guardar la descarga:', e);
    res.status(500).json({
      message: 'Error en el servidor al guardar la descarga. Por favor, inténtelo más tarde.'
    });
  }
});


/**
 * @swagger
 * /api/v1/read-and-download/downloads/{id}:
 *   delete:
 *     summary: Elimina una descarga por ID.
 *     description: Este endpoint elimina una descarga específica de la base de datos usando el ID de la descarga.
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: ID único de la descarga que se desea eliminar.
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Descarga eliminada exitosamente.
 *       404:
 *         description: No se encontró la descarga con el ID proporcionado.
 *       500:
 *         description: Error inesperado en el servidor al intentar eliminar la descarga.
 */

router.delete('/downloads/:id', authenticateAndAuthorize(['Admin']), async function (req, res, next) {
  const id = req.params.id; 

  try {
    const download = await Download.findByIdAndDelete(id); 

    if (!download) {
      return res.status(404).json({ message: 'Descarga no encontrada' }); 
    }

    res.json({ message: 'Descarga eliminada' });
  } catch (e) {
    debug('DB problem', e);
    res.sendStatus(500);
  }
});

// -------------------- COMUNICACIÓN CON OTROS MICROSERVICIOS -----------------------------

/**
 * @swagger
 * /api/v1/read-and-download/downloads/count/{isbn}:
 *   get:
 *     summary: Cuenta las descargas de un libro.
 *     description: Devuelve el número de veces que un libro con un ISBN específico ha sido descargado y actualiza el número haciendo un PATCH al MS_CATALOGUE.
 *     parameters:
 *       - in: path
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

  if (!isbn || !/^(?:\d{9}X|\d{10}|\d{13})$/.test(isbn)) {
    return res.status(400).json({ message: 'El ISBN es inválido o falta en la solicitud.' });
  }

  const token = req.headers.authorization && req.headers.authorization.split(' ')[1]; // Se asume que el token viene en el formato "Bearer <token>"

  if (!token) {
    return res.status(401).json({ message: 'Token de autorización no proporcionado.' });
  }

  try {
    // Paso 1: Buscar las descargas del libro por ISBN en la base de datos
    const downloadCount = await Download.countDocuments({ isbn });

    if (downloadCount === 0) {
      return res.status(404).json({ message: 'No se encontraron descargas para este libro.' });
    }

    const downloadCountInt = parseInt(downloadCount, 10);
    
    if (isNaN(downloadCountInt)) {
      return res.status(400).json({ message: 'El número de descargas es inválido.' });
    }

    // Paso 2: Actualizar el número de descargas en el microservicio del catálogo
    await axios.patch(`${BASE_URL}/api/v1/books/${isbn}/downloads`, {
      downloadCount: downloadCountInt 
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

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
 *     description: Devuelve el número de descargas realizadas por un usuario dado su `usuarioId` y actualiza el número haciendo un PATCH al MS_USERS.
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

router.get('/downloads/user/count', async (req, res) => {
  const { usuarioId } = req.query;
  const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

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
      numDescargas: downloadCount 
    }, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    return res.status(200).json({ message: `Número de descargas actualizado para ${username}: ${downloadCount}` });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: `Error al contar descargas o actualizar el usuario: ${error.message}` });
  }
});

module.exports = router;

