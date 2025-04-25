const express = require('express');
const router = express.Router();
const db = require('../db');

// GET /api/Students/GET → obtener todos los estudiantes no eliminados
router.get('/Students/GET', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM students WHERE "IsDeleted" = FALSE'
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al obtener estudiantes');
  }
});

// GET /api/Students/GET/:id → obtener estudiante por ID
router.get('/Students/GET/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'SELECT * FROM students WHERE "IdStudent" = $1 AND "IsDeleted" = FALSE',
      [id]
    );
    if (result.rows.length === 0)
      return res.status(404).send('Estudiante no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al buscar estudiante');
  }
});

// POST /api/Students/POST → crear un nuevo estudiante
router.post('/Students/POST', async (req, res) => {
  const {
    StudentName,
    StudentLastName,
    StudentEmail,
    StudentPhone,
    StudentAddress,
    StudentGender,
    StudentBirthDate,
    StudentPhoto,
    StudentActive,
    IdCampus,
    IdUserType
  } = req.body;

  try {
    const result = await db.query(
      `INSERT INTO students (
        "StudentName", "StudentLastName", "StudentEmail", "StudentPhone",
        "StudentAddress", "StudentGender", "StudentBirthDate", "StudentPhoto",
        "StudentActive", "IdCampus", "IdUserType"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      RETURNING *`,
      [
        StudentName,
        StudentLastName,
        StudentEmail,
        StudentPhone,
        StudentAddress,
        StudentGender,
        StudentBirthDate,
        StudentPhoto,
        StudentActive,
        IdCampus,
        IdUserType
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear estudiante');
  }
});

// POST /api/Students/PostMany → crear múltiples estudiantes
router.post('/Students/PostMany', async (req, res) => {
  const students = req.body;
  try {
    for (const s of students) {
      await db.query(
        `INSERT INTO students (
          "StudentName", "StudentLastName", "StudentEmail", "StudentPhone",
          "StudentAddress", "StudentGender", "StudentBirthDate", "StudentPhoto",
          "StudentActive", "IdCampus", "IdUserType"
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)`,
        [
          s.StudentName,
          s.StudentLastName,
          s.StudentEmail,
          s.StudentPhone,
          s.StudentAddress,
          s.StudentGender,
          s.StudentBirthDate,
          s.StudentPhoto,
          s.StudentActive,
          s.IdCampus,
          s.IdUserType
        ]
      );
    }
    res.status(201).send('Estudiantes creados');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al crear múltiples estudiantes');
  }
});

// PUT /api/Students/PUT/:id → actualizar estudiante
router.put('/Students/PUT/:id', async (req, res) => {
  const id = req.params.id;
  const {
    StudentName,
    StudentLastName,
    StudentEmail,
    StudentPhone,
    StudentAddress,
    StudentGender,
    StudentBirthDate,
    StudentPhoto,
    StudentActive,
    IdCampus,
    IdUserType
  } = req.body;

  try {
    const result = await db.query(
      `UPDATE students SET
        "StudentName" = $1,
        "StudentLastName" = $2,
        "StudentEmail" = $3,
        "StudentPhone" = $4,
        "StudentAddress" = $5,
        "StudentGender" = $6,
        "StudentBirthDate" = $7,
        "StudentPhoto" = $8,
        "StudentActive" = $9,
        "IdCampus" = $10,
        "IdUserType" = $11
      WHERE "IdStudent" = $12 AND "IsDeleted" = FALSE
      RETURNING *`,
      [
        StudentName,
        StudentLastName,
        StudentEmail,
        StudentPhone,
        StudentAddress,
        StudentGender,
        StudentBirthDate,
        StudentPhoto,
        StudentActive,
        IdCampus,
        IdUserType,
        id
      ]
    );

    if (result.rowCount === 0)
      return res.status(404).send('Estudiante no encontrado o eliminado');

    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al actualizar estudiante');
  }
});

// PUT /api/Students/DELETE/:id → borrado lógico
router.put('/Students/DELETE/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      'UPDATE students SET "IsDeleted" = TRUE WHERE "IdStudent" = $1 AND "IsDeleted" = FALSE RETURNING *',
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).send('Estudiante no encontrado o ya eliminado');
    res.send('Estudiante eliminado lógicamente');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error al eliminar estudiante');
  }
});

module.exports = router;
