const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/PermanentRoll/Get → todos los registros no eliminados
router.get('/PermanentRoll/Get', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM permanentrolls WHERE "IsDeleted" = FALSE');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los registros permanentes');
  }
});

// GET /api/PermanentRoll/Get/:id → obtener uno por ID
router.get('/PermanentRoll/Get/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM permanentrolls WHERE id = $1 AND "IsDeleted" = FALSE',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Registro no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el registro permanente');
  }
});

// POST /api/PermanentRoll/Post → crear registro
router.post('/PermanentRoll/Post', async (req, res) => {
  const { idDailyRoll, idStudent, rollState } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO permanentrolls ("idDailyRoll", "idStudent", "rollState") 
       VALUES ($1, $2, $3) RETURNING *`,
      [idDailyRoll, idStudent, rollState]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el registro permanente');
  }
});

// PUT /api/PermanentRoll/Put → actualizar
router.put('/PermanentRoll/Put/:id', async (req, res) => {
  const id = req.params.id;
  const { idDailyRoll, idStudent, rollState, IsDeleted } = req.body;

  try {
    const result = await db.query(
      `UPDATE permanentrolls 
       SET "idDailyRoll" = $1, "idStudent" = $2, "rollState" = $3, "IsDeleted" = $4 
       WHERE id = $5 AND "IsDeleted" = FALSE 
       RETURNING *`,
      [idDailyRoll, idStudent, rollState, IsDeleted, id]
    );

    if (result.rowCount === 0) return res.status(404).send('Registro no encontrado o eliminado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el registro permanente');
  }
});

// PUT /api/PermanentRoll/Delete/:id → borrado lógico
router.put('/PermanentRoll/Delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'UPDATE permanentrolls SET "IsDeleted" = TRUE WHERE id = $1 AND "IsDeleted" = FALSE RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).send('Registro no encontrado o ya eliminado');
    res.send('Registro eliminado lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el registro permanente');
  }
});

module.exports = router;
