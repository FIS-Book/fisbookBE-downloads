var express = require('express');
var router = express.Router();

// Lista simulada de descargas
let downloads = [
  { id: 1, usuarioId: 1, libro: 'Cien años de soledad', fecha: '2024-01-01', formato: 'PDF' },
  { id: 2, usuarioId: 2, libro: 'El principito', fecha: '2024-01-02', formato: 'EPUB' },
  { id: 3, usuarioId: 3, libro: '1984', fecha: '2024-01-03', formato: 'MOBI' },
  { id: 4, usuarioId: 4, libro: 'Orgullo y prejuicio', fecha: '2024-01-04', formato: 'EPUB' }
];

/* GET users listing. */
router.get('/', function(req, res, next) {
  res.send(downloads);
});

// GET /downloads/:usuarioId
router.get('/:usuarioId', function(req, res, next) {
  const usuarioId = parseInt(req.params.usuarioId);
  const userDownloads = downloads.filter(download => download.usuarioId === usuarioId);
  
  if (userDownloads.length === 0) {
    return res.status(404).send({ error: 'No se encontraron descargas para este usuario.' });
  }
  
  res.send(userDownloads);
});


//TODO - GET /downloads/:libro

// POST /downloads
router.post('/', function(req, res, next) {
  const newDownload = {
    id: downloads.length + 1,
    usuarioId: req.body.usuarioId,
    libro: req.body.libro,
    fecha: new Date().toISOString().split('T')[0], // Fecha actual
    formato: req.body.formato || 'PDF' // Valor predeterminado: PDF
  };
  
  downloads.push(newDownload);
  res.status(201).send(newDownload);
});

// DELETE /downloads/:id
router.delete('/:id', function(req, res, next) {
  const id = parseInt(req.params.id);
  const index = downloads.findIndex(download => download.id === id);
  
  if (index === -1) {
    return res.status(404).send({ error: 'Descarga no encontrada.' });
  }
  
  downloads.splice(index, 1);
  res.status(204).send();
});

module.exports = router;
