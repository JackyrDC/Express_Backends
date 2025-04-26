const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

//Variables de controladores
const campusRoutes = require('./routes/campus');
const classesRoutes = require('./routes/classes');
const dRollRoutes = require('./routes/dailyRoll');
const pRollRoutes = require('./routes/permanentRoll');
const studentsRoutes = require('./routes/students');

//Rutas a controladores
app.use('/api', campusRoutes);
app.use('/api', classesRoutes);
app.use('/api', dRollRoutes);
app.use('/api', pRollRoutes);
app.use('/api', studentsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Servidor backend corriendo en http://localhost:${PORT}`);
});