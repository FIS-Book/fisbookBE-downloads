require('dotenv').config();
const mongoose = require('mongoose');
const Download = require('../../models/downloads');

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
        await Download.deleteMany({});  
    });

    afterAll(async () => {
        if (dbConnect.readyState == 1) {
            await dbConnect.dropDatabase();  
            await dbConnect.close();
            await mongoose.disconnect();
        }
    });

    describe("Tests CRUD operations", () => {
        it('should create and save a download successfully', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935', // Asegúrate de usar un ISBN válido
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],  // Asegura que la fecha esté en formato adecuado
                formato: 'PDF'
            });

            const savedDownload = await download.save();
            expect(savedDownload.usuarioId).toBe('12345');
            expect(savedDownload.isbn).toBe('9780451524935');
            expect(savedDownload.titulo).toBe('Test Book');
            expect(savedDownload.formato).toBe('PDF');
        });

        it('should fetch a download by userId', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935',
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            await download.save();

            const foundDownload = await Download.findOne({ usuarioId: '12345' });
            expect(foundDownload).toBeDefined();
            expect(foundDownload.isbn).toBe('9780451524935');
        });

        it('should update a download successfully', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935',
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            await download.save();

            const updatedData = {
                formato: 'EPUB'
            };

            const updatedDownload = await Download.findOneAndUpdate({ usuarioId: '12345' }, updatedData, { new: true });

            expect(updatedDownload).toBeDefined();
            expect(updatedDownload.formato).toBe('EPUB');
        });

        it('should delete a download successfully', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935',
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF'
            });

            const savedDownload = await download.save();
            await Download.deleteOne({ usuarioId: savedDownload.usuarioId });
            const deletedDownload = await Download.findOne({ usuarioId: savedDownload.usuarioId });

            expect(deletedDownload).toBeNull();
        });
    });

    describe("Tests Download Model Validations", () => {
        it('should enforce required fields', async () => {
            const download = new Download({});

            try {
                await download.save();
            } catch (err) {
                expect(err).toBeTruthy();
                expect(err.errors.usuarioId).toBeDefined();
                expect(err.errors.isbn).toBeDefined();
                expect(err.errors.titulo).toBeDefined();
                expect(err.errors.autor).toBeDefined();
                expect(err.errors.idioma).toBeDefined();
            }
        });

        it('should fail to create a download with invalid status', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935',
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                fecha: new Date().toISOString().split('T')[0],
                formato: 'PDF',
                status: 'invalid-status'  // Aquí deberías tener un valor de status no permitido
            });

            try {
                await download.save();
            } catch (err) {
                expect(err).toBeDefined();
                expect(err.errors.status).toBeDefined();
                expect(err.errors.status.message).toBe('`invalid-status` is not a valid enum value for path `status`.');
            }
        });

        it('should default timestamp to current date if not provided', async () => {
            const download = new Download({
                usuarioId: '12345',
                isbn: '9780451524935',
                titulo: 'Test Book',
                autor: 'Test Author',
                idioma: 'es',
                formato: 'PDF'
            });

            const savedDownload = await download.save();
            expect(savedDownload.fecha).toBeDefined();
            expect(new Date(savedDownload.fecha)).toBeInstanceOf(Date); // Verifica que sea una fecha válida
        });
    });
});