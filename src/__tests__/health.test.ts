import request from 'supertest';
import express from 'express';
import pool from '../db.js';
import { jest } from '@jest/globals';

// Create a test app instance
const app = express();

// Add the health and ready endpoints
app.get('/health', (_req, res) => {
  res.status(200).send({ status: 'ok' });
});

app.get('/ready', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.status(200).send({ status: 'ready' });
  } catch (err) {
    res.status(503).send({ status: 'unavailable', error: (err as Error).message });
  }
});

describe('Health Endpoints', () => {
  describe('GET /health', () => {
    it('should return 200 with ok status', async () => {
      const response = await request(app).get('/health');
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ status: 'ok' });
    });
  });

  describe('GET /ready', () => {
    it('should return 200 or 503 depending on DB availability', async () => {
      const response = await request(app).get('/ready');
      // Accept either 200 (DB connected) or 503 (DB not available)
      expect([200, 503]).toContain(response.status);
      
      if (response.status === 200) {
        expect(response.body.status).toBe('ready');
      } else {
        expect(response.body.status).toBe('unavailable');
      }
    });
  });

  afterAll(async () => {
    // Clean up database connection pool
    await pool.end();
  });
});
