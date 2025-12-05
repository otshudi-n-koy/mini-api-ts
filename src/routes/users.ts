import { Router } from 'express';
import type { User } from '../types/user.js';
import pool from '../db.js';

const router = Router();

// Lister les utilisateurs
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows as User[]);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

// Ajouter un utilisateur
router.post('/add', async (req, res) => {
  try {
    const user: User = req.body; // 👈 typage explicite

    const result = await pool.query(
      'INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *',
      [user.name, user.email]
    );

    res.json(result.rows[0]);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur lors de l\'insertion' });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

// Lister les utilisateurs
router.get('/', async (_req, res) => {
  try {
    const result = await pool.query('SELECT * FROM users');
    res.json(result.rows as User[]);
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur lors de la récupération' });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

export default router;
