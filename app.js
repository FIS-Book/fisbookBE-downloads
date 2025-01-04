var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // Cargar variables de entorno

var indexRouter = require('./routes/index');
var downloadsRouter = require('./routes/downloads');
var onlineReadingsRouter = require('./routes/onlinereadings');

var app = express(); // Declaración única de 'app'

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

const cors = require('cors');
const corsOptions = {
  origin: ['http://localhost:3000', 'http://localhost:3001'], // Permitir solicitudes desde este dominio
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // Métodos permitidos
  allowedHeaders: ['Content-Type', 'Authorization'], // Encabezados permitidos
};
app.use(cors(corsOptions));

app.use('/', indexRouter);
app.use('/api/v1/read-and-download', downloadsRouter);
app.use('/api/v1/read-and-download', onlineReadingsRouter);

// Conexión a MongoDB
const mongoose = require('mongoose');
const uri = process.env.MONGO_URI_DOWNLOADS;

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
        url: 'http://localhost:2000', // Cambia esto si tu servidor usa otra URL
      },
    ],
  },
  apis: ['./routes/*.js'], // Ruta a tus archivos de rutas
};

// Initialize SwaggerJSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api/v1/read-and-download/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Iniciar el servidor

const PORT = process.env.PORT || 2000;
app.listen(PORT, () => {
  console.log(`🌟 Servidor corriendo en http://localhost:${PORT}`);
  console.log(`📖 Documentación Swagger disponible en http://localhost:${PORT}/api-docs`);
});

module.exports = app;
