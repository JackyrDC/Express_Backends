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


//Rutas a controladores
app.use('/api', campusRoutes);
app.use('/api', classesRoutes);
app.use('/api', dRollRoutes);
app.use('/api', pRollRoutes);

app.listen(5000, () => console.log('API corriendo en http://localhost:5000'));