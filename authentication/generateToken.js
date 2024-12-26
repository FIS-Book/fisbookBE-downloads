const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

// Simulamos un usuario
const user = {
  id: 1,
  email: 'test@example.com',
  roles: ['user', 'admin'] // roles para la prueba
};

// Generamos un token JWT
const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Token generado:', token);
