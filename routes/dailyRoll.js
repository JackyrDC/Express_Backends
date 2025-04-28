const express = require('express');
const router = express.Router();
const db = require('../db');
const crypto = require('crypto');

// Sesiones activas en memoria
const activeAttendanceSessions = {}; // { idDailyRoll: { otp, expiresAt, mode } }

// GET /api/dailyroll/get
router.get('/dailyroll/get', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM "DailyRoll" WHERE "IsDeleted" = FALSE`
    );
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo daily rolls');
  }
});

// GET /api/dailyroll/get/:id
router.get('/dailyroll/get/:id', async (req, res) => {
  try {
    const result = await db.query(
      `SELECT * FROM "DailyRoll" WHERE "IdDailyRoll" = $1 AND "IsDeleted" = FALSE`,
      [req.params.id]
    );
    if (result.rows.length === 0)
      return res.status(404).send('DailyRoll no encontrado');
    res.json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error obteniendo daily roll');
  }
});

// POST /api/dailyroll/start/:idRoll → iniciar pase de lista (modo QR, OTP o Manual)
router.post('/dailyroll/start/:idRoll', async (req, res) => {
  const idRoll = req.params.idRoll;
  const { mode } = req.body; // QR, OTP, Manual

  try {
    const result = await db.query(
      `INSERT INTO "DailyRoll" ("CreationDate", "IdRoll", "IsDeleted")
       VALUES (NOW(), $1, FALSE)
       RETURNING "IdDailyRoll"`,
      [idRoll]
    );

    const idDailyRoll = result.rows[0].IdDailyRoll;

    const otp = crypto.randomBytes(3).toString('hex').toUpperCase();
    const expiresAt = Date.now() + 2 * 60 * 1000; // 2 minutos

    activeAttendanceSessions[idDailyRoll] = {
      otp,
      expiresAt,
      mode
    };

    res.json({
      idDailyRoll,
      otp,
      mode,
      expiresInMinutes: 2
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Error iniciando pase de lista');
  }
});

// POST /api/dailyroll/postdaily → crear daily roll manual (sin otp)
router.post('/dailyroll/postdaily', async (req, res) => {
  try {
    const result = await db.query(
      `INSERT INTO "DailyRoll" ("CreationDate", "IsDeleted")
       VALUES (NOW(), FALSE)
       RETURNING *`
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).send('Error creando daily roll');
  }
});

// PUT /api/dailyroll/deletedaily/:id → borrado lógico
router.put('/dailyroll/deletedaily/:id', async (req, res) => {
  const id = req.params.id;
  try {
    const result = await db.query(
      `UPDATE "DailyRoll" SET "IsDeleted" = TRUE WHERE "IdDailyRoll" = $1 RETURNING *`,
      [id]
    );
    if (result.rowCount === 0)
      return res.status(404).send('DailyRoll no encontrado');
    res.send('DailyRoll eliminado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error eliminando daily roll');
  }
});

module.exports = { router, activeAttendanceSessions };
