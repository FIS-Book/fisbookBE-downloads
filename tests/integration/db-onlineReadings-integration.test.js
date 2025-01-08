require('dotenv').config();
const mongoose = require('mongoose');
const OnlineReading = require('../../models/onlineReadings');

jest.setTimeout(30000);

describe("Pruebas de Integración - Conexión con la DB de Usuarios", () => {
    let dbConnect;

    beforeAll(async () => {
        try {
          await mongoose.connect(process.env.MONGO_URI_DOWNLOADS_TEST, { useNewUrlParser: true, useUnifiedTopology: true });
          dbConnect = mongoose.connection;
      
          if (dbConnect.readyState !== 1) {
            throw new Error('La conexión a la base de datos no está activa.');
          }
        } catch (error) {
          console.error('Error al conectar con la base de datos:', error);
          throw error; // Detiene las pruebas si no se puede conectar
        }
      });
      

    beforeEach(async () => {
        await OnlineReading.deleteMany({});  
    });

    afterAll(async () => {
        if (dbConnect.readyState == 1) {
            await dbConnect.dropDatabase();  
            await dbConnect.close();
            await mongoose.disconnect();
        }
    });

    describe("Tests CRUD operations", () => {
        it('should create and save an online reading successfully', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484100',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0], // Asegura que la fecha esté en formato adecuado
                formato: 'PDF'
            });

            const savedOnlineReading = await onlineReading.save();
            expect(savedOnlineReading.usuarioId).toBe('12345'); // Espera string
            expect(savedOnlineReading.isbn).toBe('9783161484100');
            expect(savedOnlineReading.titulo).toBe('Test Online Book');
            expect(savedOnlineReading.formato).toBe('PDF');
        });

        it('should fetch an online reading by userId', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484100',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            await onlineReading.save();

            const foundOnlineReading = await OnlineReading.findOne({ usuarioId: '12345' }); // Busca con string
            expect(foundOnlineReading).toBeDefined();
            expect(foundOnlineReading.isbn).toBe('9783161484100');
        });

        it('should update an online reading successfully', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484101',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            await onlineReading.save();

            const updatedData = {
                formato: 'EPUB'
            };

            const updatedOnlineReading = await OnlineReading.findOneAndUpdate({ usuarioId: '12345' }, updatedData, { new: true }); // Busca con string

            expect(updatedOnlineReading).toBeDefined();
            expect(updatedOnlineReading.formato).toBe('EPUB');
        });

        it('should delete an online reading successfully', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484101',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            const savedOnlineReading = await onlineReading.save();
            await OnlineReading.deleteOne({ usuarioId: savedOnlineReading.usuarioId });
            const deletedOnlineReading = await OnlineReading.findOne({ usuarioId: savedOnlineReading.usuarioId });

            expect(deletedOnlineReading).toBeNull();
        });
    });

    describe("Tests Online Reading Model Validations", () => {
        it('should enforce required fields', async () => {
            const onlineReading = new OnlineReading({});

            try {
                await onlineReading.save();
            } catch (err) {
                expect(err).toBeTruthy();
                expect(err.errors.usuarioId).toBeDefined();
                expect(err.errors.isbn).toBeDefined();
                expect(err.errors.titulo).toBeDefined();
                expect(err.errors.autor).toBeDefined();
                expect(err.errors.idioma).toBeDefined();
            }
        });

        it('should fail to create an online reading with an invalid ISBN', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: 'invalid-isbn',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            try {
                await onlineReading.save();
            } catch (err) {
                expect(err).toBeDefined();
                expect(err.errors.isbn).toBeDefined();
                expect(err.errors.isbn.message).toBe('Invalid ISBN format. Must be ISBN-10 or ISBN-13.');
            }
        });

        it('should enforce language validation', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484100',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'invalid-language', // Idioma no válido
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });
        
            try {
                await onlineReading.save();
            } catch (err) {
                expect(err).toBeDefined();
                expect(err.errors.idioma).toBeDefined();
                expect(err.errors.idioma.message).toBe('`invalid-language` is not a valid enum value for path `idioma`.');
            }
        });
        

        it('should default timestamp to current date if not provided', async () => {
            const onlineReading = new OnlineReading({
                usuarioId: '12345', // Se cambia a string
                isbn: '9783161484102',
                titulo: 'Test Online Book',
                autor: 'Test Author',
                idioma: 'es',
                formato: 'PDF'
            });

            const savedOnlineReading = await onlineReading.save();
            expect(savedOnlineReading.fecha).toBeDefined();
            expect(new Date(savedOnlineReading.fecha)).toBeInstanceOf(Date); // Verifica que sea una fecha válida
        });
    });
});
