import { Router } from "express";
const router = Router();

/**
 * @openapi
 * /users:
 *   get:
 *     summary: Liste des utilisateurs
 *     responses:
 *       200:
 *         description: Retourne la liste des utilisateurs
 */
router.get("/", (_req, res) => {
  res.json([{ id: 1, name: "Alice" }, { id: 2, name: "Bob" }]);
});

/**
 * @openapi
 * /users/{id}:
 *   get:
 *     summary: Récupère un utilisateur par ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
router.get("/:id", (req, res) => {
  const id = parseInt(req.params.id, 10);
  if (Number.isNaN(id)) return res.status(400).json({ error: "ID invalide" });
  res.json({ id, name: `User${id}` });
});

export default router;
