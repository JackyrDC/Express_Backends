const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /campus
router.get('/campus', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM "dbo"."Campus" WHERE "IsDeleted" = FALSE');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Test log');
  }
});

// GET /campus/:id
router.get('/campus/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT * FROM "dbo"."Campus" WHERE "IdCampus" = $1 AND "IsDeleted" = FALSE',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Campus no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el campus');
  }
});

// POST /campus
router.post('/campus', async (req, res) => {
  const { name } = req.body;
  try {
    const result = await db.query(
      'INSERT INTO "dbo"."Campus ("Name") VALUES ($1) RETURNING *',
      [name]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el campus');
  }
});

// PUT /campus
router.put('/campus', async (req, res) => {
  const { idcampus, name } = req.body;
  try {
    const result = await db.query(
      'UPDATE "dbo"."Campus" SET "Name" = $1 WHERE "IdCampus" = $2 AND "IsDeleted" = FALSE RETURNING *',
      [name, idcampus]
    );
    if (result.rowCount === 0) return res.status(404).send('Campus no encontrado o eliminado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el campus');
  }
});

// DELETE /campus/:id → Borrado lógico
router.delete('/campus/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'UPDATE "dbo"."Campus" SET "IsDeleted" = TRUE WHERE "IdCampus" = $1 AND "IsDeleted" = FALSE RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).send('Campus no encontrado o ya eliminado');
    res.send('Campus eliminado lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el campus');
  }
});

module.exports = router;
