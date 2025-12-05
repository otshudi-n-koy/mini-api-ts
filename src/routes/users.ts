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

// Récupérer un utilisateur par ID
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json(result.rows[0] as User);
    }
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

// Mettre à jour un utilisateur
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email } = req.body;

    const result = await pool.query(
      'UPDATE users SET name = $1, email = $2 WHERE id = $3 RETURNING *',
      [name, email, id]
    );

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json(result.rows[0]);
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur lors de la mise à jour' });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

// Supprimer un utilisateur
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      res.status(404).json({ error: 'Utilisateur non trouvé' });
    } else {
      res.json({ message: 'Utilisateur supprimé', user: result.rows[0] });
    }
  } catch (err) {
    if (err instanceof Error) {
      console.error('Erreur SQL :', err.message);
      res.status(500).json({ error: 'Erreur lors de la suppression' });
    } else {
      res.status(500).json({ error: 'Erreur inconnue' });
    }
  }
});

export default router;
