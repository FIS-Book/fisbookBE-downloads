const mongoose = require('mongoose');

// Esquema para las descargas
const downloadsSchema = new mongoose.Schema({
  usuarioId: {
    type: Number,
    required: true // ID del usuario asociado a la descarga
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    match:  [/^(?:\d{9}X|\d{10}|\d{13})$/, 'Invalid ISBN format. Must be ISBN-10 or ISBN-13.']
  },
  titulo: {
    type: String,
    required: true,
    minlength: [3, 'The title must be at least 3 characters long.'],
    maxlength: [121, 'The title cannot be longer than 121 characters.']
  },
  autor: {
    type: String,
    required: true
  },
  idioma: {
    type: String,
    required: true,
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt'],
    message: 'The language must be one of the following: en, es, fr, de, it, pt.'
},
  fecha: {
    type: String,
    required: true, // Fecha de la descarga en formato 'YYYY-MM-DD'
    default: () => new Date().toISOString().split('T')[0] // Valor predeterminado: fecha actual
  },
  formato: {
    type: String,
    required: true, // Formato del archivo descargado
    enum: ['PDF', 'EPUB'], // Opciones válidas
    default: 'PDF' // Valor predeterminado: PDF
  }
});

// Método personalizado para limpiar los datos antes de enviarlos al cliente
downloadsSchema.methods.cleanup = function () {
  return {
    id: this._id,
    usuarioId: this.usuarioId,
    isbn: this.isbn,
    titulo: this.titulo,
    autor: this.autor,
    idioma: this.idioma,
    fecha: this.fecha,
    formato: this.formato
  };
};

// Modelo basado en el esquema
const Download = mongoose.model('Download', downloadsSchema);

module.exports = Download;
