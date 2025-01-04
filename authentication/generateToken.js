const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');

dotenv.config(); // Cargar variables de entorno

// Simulamos un usuario con roles
const user = {
  id: 1,
  email: 'test@example.com',
  rol: 'User'
};

// Generamos un token JWT con los roles
const token = jwt.sign(user, process.env.JWT_SECRET, { expiresIn: '1h' });

console.log('Token generado:', token);