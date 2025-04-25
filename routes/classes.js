const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/Classes/Get/:id → Obtener clase por ID
router.get('/Classes/Get/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT * FROM classes WHERE idclass = $1 AND "IsDeleted" = FALSE',
      [id]
    );
    if (result.rows.length === 0) return res.status(404).send('Clase no encontrada');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener la clase');
  }
});

// GET /api/Classes/GetByAlumn/:idAlumno → Clases por alumno
router.get('/Classes/GetByAlumn/:idAlumno', async (req, res) => {
  const idAlumno = req.params.idAlumno;
  try {
    const result = await db.query(
      `SELECT c.* FROM classes c
       JOIN "StudentClasses" sc ON sc."IdClass" = c.idclass
       WHERE sc."IdStudent" = $1 AND c."IsDeleted" = FALSE`,
      [idAlumno]
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener las clases del alumno');
  }
});

// POST /api/Classes → Crear clase
router.post('/Classes', async (req, res) => {
  const { name, idcampus } = req.body; // Ajusta según columnas reales
  try {
    const result = await db.query(
      'INSERT INTO classes (name, idcampus) VALUES ($1, $2) RETURNING *',
      [name, idcampus]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear la clase');
  }
});

// PUT /api/Classes/:id → Actualizar clase
router.put('/Classes/:id', async (req, res) => {
  const id = req.params.id;
  const { name, idcampus } = req.body;
  try {
    const result = await db.query(
      'UPDATE classes SET name = $1, idcampus = $2 WHERE idclass = $3 AND "IsDeleted" = FALSE RETURNING *',
      [name, idcampus, id]
    );
    if (result.rowCount === 0) return res.status(404).send('Clase no encontrada o eliminada');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar la clase');
  }
});

// PUT /api/Classes/Delete/:id → Borrado lógico
router.put('/Classes/Delete/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'UPDATE classes SET "IsDeleted" = TRUE WHERE idclass = $1 AND "IsDeleted" = FALSE RETURNING *',
      [id]
    );
    if (result.rowCount === 0) return res.status(404).send('Clase no encontrada o ya eliminada');
    res.send('Clase eliminada lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar la clase');
  }
});

module.exports = router;
