const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/daily/getdaily → obtener todos los dailyrolls
router.get('/daily/getdaily', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM dailyrolls WHERE "IsDeleted" = FALSE');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener los registros diarios');
  }
});

// GET /api/daily/getdaily/:id → obtener un dailyroll por ID
router.get('/daily/getdaily/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM dailyrolls WHERE iddailyroll = $1 AND "IsDeleted" = FALSE',
      [req.params.id]
    );
    if (result.rows.length === 0) return res.status(404).send('Registro diario no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener el registro diario');
  }
});

// POST /api/daily/postdaily → crear un nuevo dailyroll
router.post('/daily/postdaily', async (req, res) => {
  try {
    const result = await db.query(
      'INSERT INTO dailyrolls (creationdate) VALUES ($1) RETURNING *',
      [new Date()]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear el registro diario');
  }
});

// POST /api/daily/postmanydaily → crear varios dailyrolls
router.post('/daily/postmanydaily', async (req, res) => {
  const collection = req.body; // Se espera un array de objetos
  const createdAt = new Date();

  try {
    for (const _ of collection) {
      await db.query(
        'INSERT INTO dailyrolls (creationdate) VALUES ($1)',
        [createdAt]
      );
    }
    res.status(201).send('Registros diarios creados');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear múltiples registros diarios');
  }
});

// PUT /api/daily/putdaily/:id → actualizar creationdate de un dailyroll
router.put('/daily/putdaily/:id', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE dailyrolls SET creationdate = $1 WHERE iddailyroll = $2 AND "IsDeleted" = FALSE RETURNING *',
      [new Date(), req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).send('Registro no encontrado o eliminado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar el registro diario');
  }
});

// POST /api/daily/deletedaily/:id → borrado lógico
router.post('/daily/deletedaily/:id', async (req, res) => {
  try {
    const result = await db.query(
      'UPDATE dailyrolls SET "IsDeleted" = TRUE WHERE iddailyroll = $1 AND "IsDeleted" = FALSE RETURNING *',
      [req.params.id]
    );
    if (result.rowCount === 0) return res.status(404).send('Registro no encontrado o ya eliminado');
    res.send('Registro eliminado lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar el registro diario');
  }
});

module.exports = router;
