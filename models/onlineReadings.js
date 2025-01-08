const mongoose = require('mongoose');
 
// Esquema para las lecturas en línea
const onlineReadingsSchema = new mongoose.Schema({
  usuarioId: {
    type: String,
    required: true // ID del usuario asociado a la lectura en línea
  },
  isbn: {
    type: String,
    required: true,
    unique: true,
    match: [/^(?:\d{9}X|\d{10}|\d{13})$/, 'Invalid ISBN format. Must be ISBN-10 or ISBN-13.'] // Validación para ISBN
  },
  titulo: {
    type: String,
    required: true,
    minlength: [3, 'The title must be at least 3 characters long.'], // Título mínimo de 3 caracteres
    maxlength: [121, 'The title cannot be longer than 121 characters.'] // Título máximo de 121 caracteres
  },
  autor: {
    type: String,
    required: true // El autor del libro
  },
  idioma: {
    type: String,
    required: true,
    enum: ['en', 'es', 'fr', 'de', 'it', 'pt'], // Idioma del libro
    message: 'The language must be one of the following: en, es, fr, de, it, pt.'
  },
  fecha: {
    type: String,
    required: true, // Fecha de la lectura en línea en formato 'YYYY-MM-DD'
    default: () => new Date().toISOString().split('T')[0] // Valor predeterminado: fecha actual
  },
  formato: {
    type: String,
    required: true, // Formato del libro leído
    enum: ['PDF'], // Solo se permite PDF
    default: 'PDF' // Valor predeterminado: PDF
  }
});
 
// Método personalizado para limpiar los datos antes de enviarlos al cliente
onlineReadingsSchema.methods.cleanup = function () {
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
const OnlineReading = mongoose.model('OnlineReading', onlineReadingsSchema);
 
module.exports = OnlineReading;