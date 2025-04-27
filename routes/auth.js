const express = require('express');
const router = express.Router();
const db = require('../db');

// POST /api/login → Login
router.post('/login', async (req, res) => {
  const { Email, Password } = req.body;

  if (!Email || !Password) {
    return res.status(400).send('Credenciales inválidas');
  }

  try {
    // Buscar estudiante primero
    const studentResult = await db.query(
      `SELECT * FROM students WHERE "StudentEmail" = $1 AND "Password" = $2 AND "IsDeleted" = FALSE`,
      [Email, Password]
    );

    if (studentResult.rows.length > 0) {
      const student = studentResult.rows[0];
      await db.query(
        `UPDATE students SET "IdUserState" = 1 WHERE "IdStudent" = $1`,
        [student.IdStudent]
      );
      return res.json({
        Tipo: 'Estudiante',
        Usuario: {
          IdStudent: student.IdStudent,
          StudentName: student.StudentName,
          StudentLastName: student.StudentLastName,
          Email: student.StudentEmail,
          IdUserType: student.IdUserType,
          IdUserState: 1
        }
      });
    }

    // Buscar docente si no es estudiante
    const teacherResult = await db.query(
      `SELECT * FROM teachers WHERE "Email" = $1 AND "Password" = $2 AND "IsDeleted" = FALSE`,
      [Email, Password]
    );

    if (teacherResult.rows.length > 0) {
      const teacher = teacherResult.rows[0];
      await db.query(
        `UPDATE teachers SET "IdUserState" = 1 WHERE "IdTeacher" = $1`,
        [teacher.IdTeacher]
      );
      return res.json({
        Tipo: 'Docente',
        Usuario: {
          IdTeacher: teacher.IdTeacher,
          Name: teacher.Name,
          LastName: teacher.LastName,
          Email: teacher.Email,
          IdUserType: teacher.IdUserType,
          IdUserState: 1
        }
      });
    }

    return res.status(401).send('No autorizado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el login');
  }
});

// POST /api/logout → Logout
router.post('/logout', async (req, res) => {
  const { Email } = req.body;

  if (!Email) {
    return res.status(400).send('Email requerido');
  }

  try {
    const studentResult = await db.query(
      `SELECT * FROM students WHERE "StudentEmail" = $1 AND "IsDeleted" = FALSE`,
      [Email]
    );

    if (studentResult.rows.length > 0) {
      const student = studentResult.rows[0];
      await db.query(
        `UPDATE students SET "IdUserState" = 2 WHERE "IdStudent" = $1`,
        [student.IdStudent]
      );
      return res.send('Sesión cerrada correctamente del estudiante');
    }

    const teacherResult = await db.query(
      `SELECT * FROM teachers WHERE "Email" = $1 AND "IsDeleted" = FALSE`,
      [Email]
    );

    if (teacherResult.rows.length > 0) {
      const teacher = teacherResult.rows[0];
      await db.query(
        `UPDATE teachers SET "IdUserState" = 2 WHERE "IdTeacher" = $1`,
        [teacher.IdTeacher]
      );
      return res.send('Sesión cerrada correctamente del docente');
    }

    return res.status(404).send('Usuario no encontrado');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en logout');
  }
});

// POST /api/signup → Registrar estudiante
router.post('/signup', async (req, res) => {
  const {
    Name,
    LastName,
    Email,
    Password,
    Phone,
    Address,
    Gender,
    BirthDate,
    Photo,
    IdCampus,
    IdUserType
  } = req.body;

  if (!Email || !Password) {
    return res.status(400).send('Datos incompletos');
  }

  try {
    const existingStudent = await db.query(
      `SELECT * FROM students WHERE "StudentEmail" = $1 AND "IsDeleted" = FALSE`,
      [Email]
    );

    if (existingStudent.rows.length > 0) {
      return res.status(400).send('Ya existe una cuenta con ese correo.');
    }

    await db.query(
      `INSERT INTO students (
        "StudentName", "StudentLastName", "StudentEmail", "Password",
        "StudentPhone", "StudentAddress", "StudentGender", "StudentBirthDate",
        "StudentPhoto", "IdCampus", "IdUserType", "IdUserState", "StudentActive", "IsDeleted"
      ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,2,TRUE,FALSE)`,
      [
        Name,
        LastName,
        Email,
        Password,
        Phone,
        Address,
        Gender,
        BirthDate,
        Photo,
        IdCampus,
        IdUserType
      ]
    );

    res.send('Registro exitoso');
  } catch (err) {
    console.error(err);
    res.status(500).send('Error en el registro');
  }
});

module.exports = router;

