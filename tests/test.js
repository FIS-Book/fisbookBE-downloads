/*
const request = require('supertest');
const Download = require('../models/download');
const mongoose = require('mongoose');

describe('Download Model', () => {

  // Test de validación
  describe('Download Model Validation', () => {

    it('Should fail validation if usuarioId is missing', async () => {
      const download = new Download({
        libro: 'Test Book',
        fecha: '2024-12-22',
        formato: 'PDF'
      });

      try {
        await download.validate();
      } catch (error) {
        expect(error.errors.usuarioId).toBeDefined();
      }
    });

    it('Should fail validation if libro is missing', async () => {
      const download = new Download({
        usuarioId: 1,
        fecha: '2024-12-22',
        formato: 'PDF'
      });

      try {
        await download.validate();
      } catch (error) {
        expect(error.errors.libro).toBeDefined();
      }
    });

    it('Should fail validation if fecha is missing', async () => {
      const download = new Download({
        usuarioId: 1,
        libro: 'Test Book',
        formato: 'PDF'
      });

      try {
        await download.validate();
      } catch (error) {
        expect(error.errors.fecha).toBeDefined();
      }
    });

    it('Should fail validation if formato is missing', async () => {
      const download = new Download({
        usuarioId: 1,
        libro: 'Test Book',
        fecha: '2024-12-22'
      });

      try {
        await download.validate();
      } catch (error) {
        expect(error.errors.formato).toBeDefined();
      }
    });

    it('Should fail validation if formato is invalid', async () => {
      const download = new Download({
        usuarioId: 1,
        libro: 'Test Book',
        fecha: '2024-12-22',
        formato: 'TXT'  // Formato inválido
      });

      try {
        await download.validate();
      } catch (error) {
        expect(error.errors.formato).toBeDefined();
      }
    });

    it('Should pass validation with all fields', async () => {
      const download = new Download({
        usuarioId: 1,
        libro: 'Test Book',
        fecha: '2024-12-22',
        formato: 'PDF'
      });

      const result = await download.validate();
      expect(result).toBeUndefined();  // No debería haber errores
    });

  });

  // Test de método cleanup
  describe('Download Model Method - Cleanup', () => {
    it('Should clean up data properly', async () => {
      const download = new Download({
        usuarioId: 1,
        libro: 'Test Book',
        fecha: '2024-12-22',
        formato: 'PDF'
      });

      const cleanedData = download.cleanup();
      expect(cleanedData).toHaveProperty('id');
      expect(cleanedData).toHaveProperty('usuarioId');
      expect(cleanedData).toHaveProperty('libro');
      expect(cleanedData).toHaveProperty('fecha');
      expect(cleanedData).toHaveProperty('formato');
    });
  });

});
*/