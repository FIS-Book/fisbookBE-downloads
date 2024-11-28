const mongoose = require('mongoose');

// Esquema para las descargas
const downloadsSchema = new mongoose.Schema({
  usuarioId: {
    type: Number,
    required: true // ID del usuario asociado a la descarga
  },
  libro: {
    type: String,
    required: true // Título del libro descargado
  },
  fecha: {
    type: String,
    required: true, // Fecha de la descarga en formato 'YYYY-MM-DD'
    default: () => new Date().toISOString().split('T')[0] // Valor predeterminado: fecha actual
  },
  formato: {
    type: String,
    required: true, // Formato del archivo descargado
    enum: ['PDF', 'EPUB', 'MOBI'], // Opciones válidas
    default: 'PDF' // Valor predeterminado: PDF
  }
});

// Método personalizado para limpiar los datos antes de enviarlos al cliente
downloadsSchema.methods.cleanup = function () {
  return {
    id: this._id,
    usuarioId: this.usuarioId,
    libro: this.libro,
    fecha: this.fecha,
    formato: this.formato
  };
};

// Modelo basado en el esquema
const Download = mongoose.model('Download', downloadsSchema);

module.exports = Download;
