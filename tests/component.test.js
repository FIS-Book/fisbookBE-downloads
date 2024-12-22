/*
const request = require('supertest');
const app = require('../app');  // Asumimos que 'app' es el archivo principal del servidor
const Download = require('../models/downloads'); // Modelo de descargas

describe("Downloads API", () => {

    describe('GET /api-v1/downloads', () => {
        it('should return all downloads', async () => {
            const res = await request(app).get('/api-v1/downloads');
            expect(res.status).toBe(200);
            expect(Array.isArray(res.body)).toBe(true);
        });

        it('should return a 500 if there is a server error', async () => {
            jest.spyOn(Download, 'find').mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app).get('/api-v1/downloads');
            expect(res.status).toBe(500);
        });
    });

    describe('GET /api-v1/downloads/:id', () => {
        it('should return a download by id', async () => {
            const download = new Download({
                usuarioId: 'user123',
                libro: 'book123',
                formato: 'PDF',
            });
            await download.save();

            const res = await request(app).get(`/api-v1/downloads/${download._id}`);
            expect(res.status).toBe(200);
            expect(res.body.usuarioId).toBe('user123');
        });

        it('should return 404 if download is not found', async () => {
            const res = await request(app).get('/api-v1/downloads/invalidid');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Descarga no encontrada');
        });

        it('should return a 500 if there is a server error', async () => {
            jest.spyOn(Download, 'findById').mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app).get('/api-v1/downloads/anyid');
            expect(res.status).toBe(500);
        });
    });

    describe('POST /api-v1/downloads', () => {
        it('should create a new download', async () => {
            const newDownload = {
                usuarioId: 'user123',
                libro: 'book123',
                formato: 'PDF',
            };

            const res = await request(app)
                .post('/api-v1/downloads')
                .send(newDownload);

            expect(res.status).toBe(201);
            expect(res.body.usuarioId).toBe('user123');
            expect(res.body.libro).toBe('book123');
        });

        it('should return 500 if there is a server error', async () => {
            jest.spyOn(Download.prototype, 'save').mockRejectedValueOnce(new Error('DB error'));
            const newDownload = {
                usuarioId: 'user123',
                libro: 'book123',
                formato: 'PDF',
            };

            const res = await request(app)
                .post('/api-v1/downloads')
                .send(newDownload);

            expect(res.status).toBe(500);
        });
    });

    describe('PUT /api-v1/downloads/:id', () => {
        it('should update a download', async () => {
            const download = new Download({
                usuarioId: 'user123',
                libro: 'book123',
                formato: 'PDF',
            });
            await download.save();

            const updatedDownload = {
                usuarioId: 'user456',
                libro: 'book456',
                formato: 'EPUB',
            };

            const res = await request(app)
                .put(`/api-v1/downloads/${download._id}`)
                .send(updatedDownload);

            expect(res.status).toBe(200);
            expect(res.body.usuarioId).toBe('user456');
            expect(res.body.libro).toBe('book456');
        });

        it('should return 404 if download is not found', async () => {
            const res = await request(app)
                .put('/api-v1/downloads/invalidid')
                .send({ usuarioId: 'user456', libro: 'book456' });
            expect(res.status).toBe(404);
        });

        it('should return 500 if there is a server error', async () => {
            jest.spyOn(Download, 'findById').mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app).put('/api-v1/downloads/anyid').send({ usuarioId: 'user456' });
            expect(res.status).toBe(500);
        });
    });

    describe('DELETE /api-v1/downloads/:id', () => {
        it('should delete a download by id', async () => {
            const download = new Download({
                usuarioId: 'user123',
                libro: 'book123',
                formato: 'PDF',
            });
            await download.save();

            const res = await request(app).delete(`/api-v1/downloads/${download._id}`);
            expect(res.status).toBe(200);
            expect(res.body.message).toBe('Descarga eliminada');
        });

        it('should return 404 if download is not found', async () => {
            const res = await request(app).delete('/api-v1/downloads/invalidid');
            expect(res.status).toBe(404);
            expect(res.body.message).toBe('Descarga no encontrada');
        });

        it('should return 500 if there is a server error', async () => {
            jest.spyOn(Download, 'findByIdAndDelete').mockRejectedValueOnce(new Error('DB error'));
            const res = await request(app).delete('/api-v1/downloads/anyid');
            expect(res.status).toBe(500);
        });
    });

});
*/

