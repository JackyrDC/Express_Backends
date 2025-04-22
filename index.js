const express = require('express');
const cors = require('cors');
const db = require('./db');

const app = express();
app.use(cors());
app.use(express.json());

// Endpoint de prueba
app.get('/api/rolls', async (req, res) => {
  const result = await db.query('SELECT * FROM rolls');
  res.json(result.rows);
});

app.listen(5000, () => console.log('API corriendo en http://localhost:5000'));