var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config(); // Cargar variables de entorno


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/downloads');

var app = express();

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

module.exports = app;

// Conexión a Swagger
const swaggerUi = require('swagger-ui-express');
const swaggerJsdoc = require('swagger-jsdoc');

const app = express();

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
        url: 'http://localhost:3000', // Change this to your server URL if different
      },
    ],
  },
  apis: ['./routes/*.js'], // Path to the API docs (your route files)
};

// Initialize SwaggerJSDoc
const swaggerDocs = swaggerJsdoc(swaggerOptions);

// Serve Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
  console.log('Swagger documentation available at http://localhost:3000/api-docs');
});
