const express = require('express');
const router = express.Router();
const db = require('../db');
const { activeAttendanceSessions } = require('./dailyRoll');

// GET /api/permanentroll/get
router.get('/permanentroll/get', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM "PermanentRoll" WHERE "IsDeleted" = FALSE`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo permanent rolls');
  }
});

// GET /api/permanentroll/get/:idDailyRoll/:idStudent
router.get('/permanentroll/get/:idDailyRoll/:idStudent', async (req, res) => {
  const { idDailyRoll, idStudent } = req.params;
  try {
    const result = await db.query(
      `SELECT * FROM "PermanentRoll" WHERE "IdDailyRoll" = $1 AND "IdStudent" = $2 AND "IsDeleted" = FALSE`,
      [idDailyRoll, idStudent]
    );
    if (result.rows.length === 0)
      return res.status(404).send('Registro no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error buscando permanent roll');
  }
});

// POST /api/permanentroll/mark → alumno marca asistencia usando otp
router.post('/permanentroll/mark', async (req, res) => {
  const { otp, email } = req.body;

  try {
    const sessionEntry = Object.entries(activeAttendanceSessions)
      .find(([idDailyRoll, session]) => 
        session.otp === otp && session.expiresAt > Date.now()
      );

    if (!sessionEntry) {
      return res.status(400).send('Código inválido o expirado');
    }

    const [idDailyRoll] = sessionEntry;

    const student = await db.query(
      `SELECT * FROM students WHERE "StudentEmail" = $1 AND "IsDeleted" = FALSE`,
      [email]
    );

    if (student.rows.length === 0) {
      return res.status(404).send('Alumno no encontrado');
    }

    await db.query(
      `INSERT INTO "PermanentRoll" ("IdDailyRoll", "IdStudent", "RollState", "IsDeleted")
       VALUES ($1, $2, 'Presente', FALSE)`,
      [idDailyRoll, student.rows[0].IdStudent]
    );

    res.send('Asistencia registrada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error registrando asistencia');
  }
});

// PUT /api/permanentroll/manual → pase de lista manual por el maestro
router.put('/permanentroll/manual', async (req, res) => {
  const { idDailyRoll, attendanceList } = req.body;
  // attendanceList = [{ idStudent: 1, rollState: "Presente" }, { idStudent: 2, rollState: "Ausente" }]

  try {
    for (const record of attendanceList) {
      await db.query(
        `INSERT INTO "PermanentRoll" ("IdDailyRoll", "IdStudent", "RollState", "IsDeleted")
         VALUES ($1, $2, $3, FALSE)
         ON CONFLICT ("IdDailyRoll", "IdStudent") 
         DO UPDATE SET "RollState" = EXCLUDED."RollState"`,
        [idDailyRoll, record.idStudent, record.rollState]
      );
    }
    res.send('Asistencia manual registrada');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en pase de lista manual');
  }
});

// GET /api/permanentroll/myattendance/:idStudent → ver mis asistencias
router.get('/permanentroll/myattendance/:idStudent', async (req, res) => {
  const idStudent = req.params.idStudent;

  try {
    const result = await db.query(
      `SELECT dr."CreationDate", pr."RollState"
       FROM "PermanentRoll" pr
       INNER JOIN "DailyRoll" dr ON pr."IdDailyRoll" = dr."IdDailyRoll"
       WHERE pr."IdStudent" = $1 AND pr."IsDeleted" = FALSE
       ORDER BY dr."CreationDate" DESC`,
      [idStudent]
    );

    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo asistencias');
  }
});

module.exports = router;
