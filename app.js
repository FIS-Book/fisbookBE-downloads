var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // Cargar variables de entorno
const db = require('./db.js');
const cors = require('cors');

var downloadsRouter = require('./routes/downloads');
var onlineReadingsRouter = require('./routes/onlinereadings');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use(cors({
  origin: [`${process.env.BASE_URL}`,'http://localhost:3000'], // Permitir solicitudes desde este dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
}));

app.use('/api/v1/read-and-download', downloadsRouter);
app.use('/api/v1/read-and-download', onlineReadingsRouter);

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
        url: 'http://localhost:2000', // Cambia esto si tu servidor usa otra URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Ruta a tus archivos de rutas
};

// Initialize SwaggerJSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api/v1/read-and-download/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

module.exports = app;
