var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // Cargar variables de entorno

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/downloads');

var app = express(); // Declaración única de 'app'

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/downloads', usersRouter);

// Conexión a MongoDB
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI;

mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
.then(() => console.log('✅ Conexión exitosa a MongoDB Atlas'))
.catch(err => console.error('❌ Error al conectar a MongoDB Atlas:', err));

// Configuración de Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

// Swagger definition
const swaggerOptions = {
  swaggerDefinition: {
    info: {
      title: 'My API',
      description: 'API documentation for my project',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:3000', // Cambia esto si tu servidor usa otra URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Ruta a tus archivos de rutas
};

// Initialize SwaggerJSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar el servidor
const PORT = process.env.PORT || 3002;
app.listen(PORT, () => {
  console.log("Servidor corriendo en http://localhost:${PORT}");
  console.log("Documentación Swagger disponible en http://localhost:${PORT}/api-docs");
});

module.exports = app;