import express from 'express';
import pool from './db.js';
import cors from 'cors';

const app = express();

app.use(cors());
app.use(express.json());

// test simple
app.get('/', (req, res) => {
  res.send('API funcionando');
});

// test con DB
app.get('/db', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json(result.rows);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Error conectando a la DB' });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});