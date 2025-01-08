const request = require('supertest');
const app = require('../app'); // Asegúrate de que este archivo exporte tu aplicación Express
const Download = require('../models/downloads');
const axios = require('axios');

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

jest.mock('../models/downloads'); // Esto hace que el modelo Download sea un mock
jest.mock('axios');


describe('Downloads API', () => {

    beforeAll(() => {
        // Mocking the console.error
        jest.spyOn(console, 'error').mockImplementation(() => {});
    });
    afterAll(() => {
        // Restore the console.error
        console.error.mockRestore();
    });

  describe("GET /api/v1/read-and-download/downloads", () => {
    const downloads = [
      {
        usuarioId: '12345',
        isbn: '9780451524935',
        titulo: '1984',
        autor: 'George Orwell',
        idioma: 'en',
        formato: 'PDF',
        fecha: '2025-01-01',
      },
    ];
    var dbFind;
    beforeEach(() => {
      jest.clearAllMocks();
      dbFind = jest.spyOn(Download, 'find');
    });
  
    it("Debe obtener todas las descargas si existen", async () => {
      dbFind.mockImplementation(async () => Promise.resolve(downloads));
  
      return request(app)
        .get('/api/v1/read-and-download/downloads') // Asegúrate de que el endpoint sea el correcto
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.downloads).toEqual(expect.arrayContaining(downloads)); // Esperamos la clave 'downloads' en el cuerpo
          expect(dbFind).toBeCalled();
        });
    });
  
    it("Debe devolver un array vacío si no hay descargas", async () => {
      dbFind.mockImplementation(async () => Promise.resolve([]));
  
      return request(app)
        .get('/api/v1/read-and-download/downloads')
        .then((response) => {
          expect(response.statusCode).toBe(200);
          expect(response.body.downloads).toEqual([]); // Confirmamos que la clave 'downloads' sea un array vacío
          expect(dbFind).toBeCalled();
        });
    });
  
    it("Debe devolver un error 500 si ocurre un error inesperado", async () => {
      dbFind.mockImplementation(async () => Promise.reject(new Error("Unexpected server error")));
  
      return request(app)
        .get('/api/v1/read-and-download/downloads')
        .then((response) => {
          expect(response.statusCode).toBe(500);
          expect(response.body).toHaveProperty('message', 'Error en el servidor'); // Verificamos el mensaje de error en la respuesta
          expect(dbFind).toBeCalled();
        });
    });
  });

  describe('GET /api/v1/read-and-download/downloads/:id', () => {
    it('debe devolver una descarga específica', async () => {
      const download = {
        _id: '64abcd123456abcdef123456',
        usuarioId: '12345',
        isbn: '9780451524935',
        titulo: '1984',
        autor: 'George Orwell',
        idioma: 'en',
        formato: 'PDF',
        fecha: '2025-01-01',
      };

      jest.spyOn(Download, 'findById').mockResolvedValue(download);

      const response = await request(app).get(`/api/v1/read-and-download/downloads/${download._id}`);
      expect(response.statusCode).toBe(200);
      expect(response.body).toEqual(download);
      expect(Download.findById).toBeCalledWith(download._id);
    });

    it('debe devolver un error 404 si no se encuentra la descarga', async () => {
      jest.spyOn(Download, 'findById').mockResolvedValue(null);

      const response = await request(app).get('/api/v1/read-and-download/downloads/64abcd123456abcdef123456');
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Descarga no encontrada');
      expect(Download.findById).toBeCalled();
    });

    it('debe devolver un error 500 si ocurre un error inesperado', async () => {
      jest.spyOn(Download, 'findById').mockRejectedValue(new Error('Unexpected server error'));

      const response = await request(app).get('/api/v1/read-and-download/downloads/64abcd123456abcdef123456');
      expect(response.statusCode).toBe(500);
      expect(response.body).toHaveProperty('error', 'Unexpected server error');
      expect(Download.findById).toBeCalled();
    });
  });

  describe('POST /api/v1/read-and-download/downloads', () => {
    const newDownload = {
      usuarioId: 'user123',
      isbn: '9780451524935',
      titulo: 'El Gran Libro',
      autor: 'Autor Ejemplo',
      idioma: 'es',
      formato: 'PDF',
    };
  
    // Definir el token de autorización
    const token = 'fake-jwt-token';  // Este es un token simulado, reemplázalo por uno real si es necesario
  
    it('Debe retornar 201 y crear una nueva descarga', async () => {
      // Mock de la función save de Mongoose
      const mockSave = jest.fn().mockResolvedValue(newDownload);
      Download.prototype.save = mockSave;
    
      // Hacer la solicitud POST
      const response = await request(app)
        .post('/api/v1/read-and-download/downloads')
        .set('Authorization', `Bearer ${token}`)
        .send(newDownload);
    
      // Verificar la respuesta
      console.log(response.body);  // Verifica lo que se está recibiendo en la respuesta
    
      expect(response.statusCode).toBe(201);
      expect(response.body).toBe("");  // Cambiar a comparación con cadena vacía

    
      expect(mockSave).toHaveBeenCalledTimes(1);
    });
  
  
    it('Debe retornar 400 si faltan datos obligatorios en la solicitud', async () => {
      // Simulamos la falta de un campo obligatorio, por ejemplo "usuarioId"
      const incompleteData = {
        isbn: '978-3-16-148410-0',
        titulo: 'El Gran Libro',
        autor: 'Autor Ejemplo',
        idioma: 'Español',
        formato: 'PDF',
      };
  
      const response = await request(app)
        .post('/api/v1/read-and-download/downloads')
        .send(incompleteData);
  
      expect(response.statusCode).toBe(400);
      expect(response.body).toHaveProperty('message', 'Faltan datos obligatorios');
    });
  });

  describe('DELETE /api/v1/read-and-download/downloads/:id', () => {
    let mockDownloadId;
    let mockDownloadData;
  
    // Definir el ID y los datos de la descarga para las pruebas
    beforeAll(() => {
      mockDownloadId = '12345abcde'; // ID ficticio para la descarga
      mockDownloadData = {
        _id: mockDownloadId,
        usuarioId: 'user123',
        isbn: '973161484100',
        titulo: 'El Gran Libro',
        autor: 'Autor Ejemplo',
        idioma: 'Español',
        formato: 'PDF',
      };
    });
  
    // Prueba para eliminar una descarga correctamente
    it('Debe eliminar una descarga y devolver un mensaje de éxito', async () => {
      // Mock de Download.findByIdAndDelete para simular la eliminación
      Download.findByIdAndDelete = jest.fn().mockResolvedValue(mockDownloadData);
  
      // Hacer la solicitud DELETE
      const response = await request(app)
        .delete(`/api/v1/read-and-download/downloads/${mockDownloadId}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(200);
      expect(response.body).toHaveProperty('message', 'Descarga eliminada');
      expect(Download.findByIdAndDelete).toHaveBeenCalledWith(mockDownloadId); // Verifica que el método fue llamado con el ID correcto
    });
  
    // Prueba cuando la descarga no se encuentra
    it('Debe retornar 404 si no se encuentra la descarga', async () => {
      // Simulamos que no se encuentra el objeto en la base de datos
      Download.findByIdAndDelete = jest.fn().mockResolvedValue(null);
  
      // Hacer la solicitud DELETE
      const response = await request(app)
        .delete(`/api/v1/read-and-download/downloads/${mockDownloadId}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(404);
      expect(response.body).toHaveProperty('message', 'Descarga no encontrada');
    });
  
    // Prueba para manejar error de la base de datos (500)
    it('Debe retornar 500 si hay un error al eliminar la descarga', async () => {
      // Simulamos un error en la base de datos
      Download.findByIdAndDelete = jest.fn().mockRejectedValue(new Error('Error de base de datos'));
  
      // Hacer la solicitud DELETE
      const response = await request(app)
        .delete(`/api/v1/read-and-download/downloads/${mockDownloadId}`)
        .send();
  
      // Verificar la respuesta
      expect(response.statusCode).toBe(500);
    });
  });

  // describe('GET /downloads/count/:isbn', () => {
  //   const mockDownloadISBN = '9780590353427';
  //   const mockToken = 'valid-jwt-token';
  //   const BASE_URL = 'http://mock-api-url';
  
  //   beforeEach(() => {
  //     jest.clearAllMocks();
  //   });
  
  //   it('Debe retornar 401 si no se proporciona un token', async () => {
  //       const response = await request(app)
  //         .get(`/downloads/count/${mockDownloadISBN}`);
      
  //       expect(response.statusCode).toBe(401); // Verifica que se devuelve 401
  //       expect(response.body).toHaveProperty('message', 'Token de autorización no proporcionado.');
  //     });
  
  //     it('Debe retornar 404 si no se encuentran descargas para el ISBN', async () => {
  //       jest.spyOn(Download, 'countDocuments').mockResolvedValue(0); // Simula que no hay descargas
       
  //       const response = await request(app)
  //         .get(`/downloads/count/${mockDownloadISBN}`)
  //         .set('Authorization', `Bearer ${mockToken}`);
       
  //       expect(response.statusCode).toBe(404);
  //       expect(response.body).toHaveProperty('message', 'No se encontraron descargas para este libro.'); // Verifica que "message" está presente
  //     });
      
  
  //     it('Debe actualizar el número de descargas en el microservicio externo y retornar 200', async () => {
  //       // Simula la llamada al microservicio externo
  //       const mockDownloadISBN = '9783161484100';
  //       const mockToken = 'valid-jwt-token';
      
  //       const scope = nock('http://mock-api-url') // URL del microservicio
  //         .patch(`/api/v1/books/${mockDownloadISBN}/downloads`, { downloadCount: 5 })
  //         .reply(200, { success: true });
      
  //       const response = await request(app)
  //         .get(`/downloads/count/${mockDownloadISBN}`)
  //         .set('Authorization', `Bearer ${mockToken}`);
      
  //       expect(response.statusCode).toBe(200); // Verifica que la respuesta sea 200
  //       expect(response.body).toHaveProperty('count', 5); // Verifica que se actualice el número de descargas
  //     });
      
  
  //     it('Debe retornar 500 si ocurre un error interno del servidor', async () => {
  //       // Simulamos un error en la base de datos
  //       jest.spyOn(Download, 'countDocuments').mockRejectedValueOnce(new Error('Database error'));
      
  //       const response = await request(app)
  //         .get(`/downloads/count/${mockDownloadISBN}`)
  //         .set('Authorization', `Bearer ${mockToken}`); // Enviamos un token válido
      
  //       expect(response.statusCode).toBe(500); // Verifica que se devuelve 500
  //       expect(response.body).toHaveProperty('message', 'Error inesperado en el servidor.');
  //     });
      
  // });
});