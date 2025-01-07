const request = require('supertest');
const app = require('../app'); // Asegúrate de que este archivo exporte tu aplicación Express
const OnlineReading = require('../models/onlineReadings');
const jwt = require('jsonwebtoken');

// Generamos el token correctamente para el usuario
const token = jwt.sign({ userId: 1, rol: 'Admin' }, 'tu_clave_secreta', { expiresIn: '1h' });

jest.mock('../authentication/authenticateAndAuthorize', () => {
  return jest.fn(() => (req, res, next) => {
    req.user = {
      _id: '1234567890abcdef12345678',
      nombre: 'Test',
      apellidos: 'User',
      username: 'testuser',
      email: 'test@example.com',
      plan: 'Plan2',
      rol: 'Admin',
    };
    next();
  });
});

describe('OnlineReadings API', () => {

    beforeAll(() => {
        // Mocking the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterAll(() => {
        // Restore the console.error
        console.error.mockRestore();
    });

  describe("GET /api/v1/read-and-download/onlineReadings", () => {
    const onlineReadings = [
      {
        _id: '63b93a637bf1aef43f291c3e', 
        usuarioId: '12345',
        isbn: '9780451524935',
        titulo: '1984',
        autor: 'George Orwell',
        idioma: 'en',
        formato: 'PDF',
        fecha: '2025-01-01',
      },
    ];
    
    let dbFind; // Mock para el método find de OnlineReading
    
    beforeEach(() => {
      jest.clearAllMocks(); // Limpia los mocks antes de cada prueba
      dbFind = jest.spyOn(OnlineReading, 'find'); // Espía el método `find` del modelo `OnlineReading`
    });

 
    it('Debe retornar 200 y obtener todas las lecturas en línea', async () => {
      // Mock de la búsqueda de lecturas en línea en la base de datos
      jest.spyOn(OnlineReading, 'find').mockResolvedValue(onlineReadings);  // Usando el modelo adecuado
    
      // Realizar la solicitud GET al endpoint
      const response = await request(app)
        .get('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`); // Incluye el token si es necesario para la autenticación
    
      // Validar la respuesta
      expect(response.statusCode).toBe(200); // Asegúrate de que el estado sea 200
      expect(response.body.onlineReadings).toEqual(expect.arrayContaining(onlineReadings)); // Verifica que el cuerpo de la respuesta contenga el array
      expect(OnlineReading.find).toHaveBeenCalled(); // Verifica que se haya llamado al método `find`

    });
    
    it('Debe retornar 500 si ocurre un error en la base de datos',async () => {
      // Simulamos que OnlineReading.find() lanza un error
      dbFind.mockRejectedValue(new Error('Error en la base de datos'));
    
      const response = await request(app)
        .get('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`) // Pasamos el token JWT en el header
        .send();
    
      // Verificar la respuesta
      expect(response.statusCode).toBe(500); // Asegúrate de que el estado sea 500
      expect(response.body).toHaveProperty('message', 'Error en el servidor'); // Verifica que tenga la propiedad `message` con el valor esperado
    });

    
  });

  describe('GET /api/v1/read-and-download/onlineReadings/:id', () => {
    const mockReading = {
      _id: '507f1f77bcf86cd799439011', // Asegúrate de que el ID sea válido
      isbn: '9780451524935',
      titulo: '1984',
      autor: 'George Orwell',
      idioma: 'en',
      formato: 'PDF',
      fecha: '2025-01-01',
      cleanup() {
        return {
          isbn: this.isbn,
          titulo: this.titulo,
          autor: this.autor,
          idioma: this.idioma,
          formato: this.formato,
          fecha: this.fecha,
        };
      }
    };
  
    // Caso exitoso: obtener una lectura en línea por ID
    it('Debe retornar 200 y obtener la lectura en línea por ID', async () => {
      // Mock de la búsqueda por ID en la base de datos
      OnlineReading.findById = jest.fn().mockResolvedValue(mockReading);
  
      const response = await request(app)
        .get(`/api/v1/read-and-download/onlineReadings/${mockReading._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(mockReading.cleanup());
    });
  
    // Caso de lectura no encontrada: respuesta 404
    it('Debe retornar 404 si la lectura no existe', async () => {
      // Simulamos que la lectura no existe
      OnlineReading.findById = jest.fn().mockResolvedValue(null);
  
      const response = await request(app)
        .get(`/api/v1/read-and-download/onlineReadings/507f1f77bcf86cd799439011`) // ID que no existe
        .set('Authorization', `Bearer ${token}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Lectura en línea no encontrada');
    });
  
    // Caso de error de base de datos: respuesta 500
    it('Debe retornar 500 si ocurre un error en la base de datos', async () => {
      // Simulamos que hay un error al consultar la base de datos
      OnlineReading.findById = jest.fn().mockRejectedValue(new Error('Error en la base de datos'));
  
      const response = await request(app)
        .get(`/api/v1/read-and-download/onlineReadings/${mockReading._id}`)
        .set('Authorization', `Bearer ${token}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error en el servidor');
    });
  });

  describe('POST /api/v1/read-and-download/onlineReadings', () => {
    const newReading = {
      usuarioId: '12345',
      isbn: '9780451524935',
      titulo: '1984',
      autor: 'George Orwell',
      idioma: 'es',
      formato: 'PDF',
    };
  
    // Caso exitoso: crear una nueva lectura en línea
    it('Debe retornar 201 y crear una nueva lectura en línea', async () => {
      // Mock de la función save de Mongoose
      const mockSave = jest.fn().mockResolvedValue(newReading);
      OnlineReading.prototype.save = mockSave;
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(newReading);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(201);
      expect(response.body).toEqual(expect.objectContaining({
        usuarioId: newReading.usuarioId,
        titulo: newReading.titulo,
        autor: newReading.autor,
        idioma: newReading.idioma,
        formato: newReading.formato,
      }));
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  
    // Caso de datos inválidos: falta el campo usuarioId
    it('Debe retornar 400 si faltan datos obligatorios', async () => {
      const invalidData = { ...newReading, usuarioId: undefined }; // Faltando usuarioId
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Faltan datos obligatorios: usuarioId, titulo, autor, idioma.');
    });
  
    // Caso de datos inválidos: título demasiado corto
    it('Debe retornar 400 si el título es demasiado corto', async () => {
      const invalidData = { ...newReading, titulo: 'A' }; // Título demasiado corto
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'El título debe tener entre 3 y 121 caracteres.');
    });
  
    // Caso de datos inválidos: idioma incorrecto
    it('Debe retornar 400 si el idioma no es válido', async () => {
      const invalidData = { ...newReading, idioma: 'jp' }; // Idioma no válido
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'El idioma debe ser uno de los siguientes: en, es, fr, de, it, pt.');
    });
  
    // Caso de datos inválidos: formato no permitido
    it('Debe retornar 400 si el formato no es válido', async () => {
      const invalidData = { ...newReading, formato: 'TXT' }; // Formato no permitido
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'El formato solo puede ser PDF.');
    });
  
    // Caso de error de base de datos: respuesta 500
    it('Debe retornar 500 si ocurre un error al guardar la lectura', async () => {
      // Simulamos que la base de datos falla al intentar guardar la lectura
      const mockSave = jest.fn().mockRejectedValue(new Error('Error al guardar en la base de datos'));
      OnlineReading.prototype.save = mockSave;
  
      const response = await request(app)
        .post('/api/v1/read-and-download/onlineReadings')
        .set('Authorization', `Bearer ${token}`)
        .send(newReading);
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error en el servidor al guardar la lectura en línea. Por favor, inténtelo más tarde.');
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  });
  
  describe('DELETE /api/v1/read-and-download/onlineReadings/:id', () => {
    const mockReadingId = '12345'; // ID de la lectura a eliminar
  
    // Prueba de eliminación exitosa
    it('Debe eliminar una lectura en línea correctamente', async () => {
      // Simulamos que la lectura se elimina correctamente
      const mockDelete = jest.fn().mockResolvedValue({ message: 'Lectura eliminada' });
      OnlineReading.findByIdAndDelete = mockDelete;
  
      const response = await request(app)
        .delete(`/api/v1/read-and-download/onlineReadings/${mockReadingId}`)
        .set('Authorization', `Bearer ${token}`)  // Incluye el token de autorización
        .send();
  
      // Verificar que la respuesta tiene un estado 200 (OK) y el mensaje adecuado
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Lectura eliminada');
      expect(mockDelete).toHaveBeenCalledTimes(1);  // Verifica que la función de eliminación fue llamada una vez
      expect(mockDelete).toHaveBeenCalledWith(mockReadingId);  // Verifica que se pasó el ID correcto a la función
    });
  
    // Prueba cuando no se encuentra la lectura (Error 404)
    it('Debe retornar 404 si la lectura no se encuentra', async () => {
      // Simulamos que no se encuentra la lectura (findByIdAndDelete devuelve null)
      const mockDelete = jest.fn().mockResolvedValue(null);
      OnlineReading.findByIdAndDelete = mockDelete;
  
      const response = await request(app)
        .delete(`/api/v1/read-and-download/onlineReadings/${mockReadingId}`)
        .set('Authorization', `Bearer ${token}`)  // Incluye el token de autorización
        .send();
  
      // Verificar que la respuesta tiene un estado 404 y el mensaje adecuado
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Lectura en línea no encontrada');
      expect(mockDelete).toHaveBeenCalledTimes(1);  // Verifica que la función de eliminación fue llamada
      expect(mockDelete).toHaveBeenCalledWith(mockReadingId);  // Verifica que se pasó el ID correcto
    });
  
    // Prueba cuando ocurre un error en la base de datos (Error 500)
    it('Debe retornar 500 si ocurre un error al eliminar la lectura', async () => {
      // Simulamos un error en la base de datos
      const mockDelete = jest.fn().mockRejectedValue(new Error('Error en la base de datos'));
      OnlineReading.findByIdAndDelete = mockDelete;
  
      const response = await request(app)
        .delete(`/api/v1/read-and-download/onlineReadings/${mockReadingId}`)
        .set('Authorization', `Bearer ${token}`)  // Incluye el token de autorización
        .send();
  
      // Verificar que la respuesta tiene un estado 500 y el mensaje adecuado
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('message', 'Error en el servidor');
      expect(mockDelete).toHaveBeenCalledTimes(1);  // Verifica que la función de eliminación fue llamada
      expect(mockDelete).toHaveBeenCalledWith(mockReadingId);  // Verifica que se pasó el ID correcto
    });
  });
  

});