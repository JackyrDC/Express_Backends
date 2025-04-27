const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/teachers/ → obtener todos los maestros no eliminados
router.get('/teachers', async (req, res) => {
  try {
    const result = await db.query('SELECT * FROM teachers WHERE "IsDeleted" = FALSE');
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener maestros');
  }
});

// GET /api/teachers/:id → obtener maestro por ID
router.get('/teachers/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT * FROM teachers WHERE "IdTeacher" = $1 AND "IsDeleted" = FALSE',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).send('Maestro no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al buscar maestro');
  }
});

// POST /api/teachers/post → crear maestro
router.post('/teachers/post', async (req, res) => {
  const { EmployeeNumber, IdCampus, IdUserState, IdUserType } = req.body;
  try {
    const result = await db.query(
      `INSERT INTO teachers (
        "EmployeeNumber", "IdCampus", "IdUserState", "IdUserType"
      ) VALUES ($1, $2, $3, $4)
      RETURNING *`,
      [EmployeeNumber, IdCampus, IdUserState, IdUserType]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear maestro');
  }
});

// POST /api/teachers/createmultiple → crear múltiples maestros
router.post('/teachers/createmultiple', async (req, res) => {
  const teachers = req.body;
  try {
    for (const t of teachers) {
      await db.query(
        `INSERT INTO teachers (
          "EmployeeNumber", "IdCampus", "IdUserState", "IdUserType"
        ) VALUES ($1, $2, $3, $4)`,
        [t.EmployeeNumber, t.IdCampus, t.IdUserState, t.IdUserType]
      );
    }
    res.status(201).send('Maestros creados');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear múltiples maestros');
  }
});

// PUT /api/teachers/put/:id → actualizar maestro
router.put('/teachers/put/:id', async (req, res) => {
  const id = req.params.id;
  const { EmployeeNumber, IdCampus, IdUserState, IdUserType } = req.body;
  try {
    const result = await db.query(
      `UPDATE teachers SET
        "EmployeeNumber" = $1,
        "IdCampus" = $2,
        "IdUserState" = $3,
        "IdUserType" = $4
      WHERE "IdTeacher" = $5 AND "IsDeleted" = FALSE
      RETURNING *`,
      [EmployeeNumber, IdCampus, IdUserState, IdUserType, id]
    );

    if (result.rowCount === 0)
      return res.status(404).send('Maestro no encontrado o eliminado');

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar maestro');
  }
});

// PUT /api/teachers/Delete/:id → borrado lógico
router.put('/teachers/Delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'UPDATE teachers SET "IsDeleted" = TRUE WHERE "IdTeacher" = $1 AND "IsDeleted" = FALSE RETURNING *',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).send('Maestro no encontrado o ya eliminado');
    res.send('Maestro eliminado lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar maestro');
  }
});

module.exports = router;
