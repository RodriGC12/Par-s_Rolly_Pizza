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

// Obtener todos los productos
app.get('/products', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM producto');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo producto
app.post('/products', async (req, res) => {
  try {
    const { nombre, descripcion, precio, imagen } = req.body;

    const result = await pool.query(
      `INSERT INTO producto (nombre, descripcion, precio, imagen, fecha)
       VALUES ($1, $2, $3, $4, NOW())
       RETURNING *`,
      [nombre, descripcion, precio, imagen]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('ERROR REAL:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Eliminar un producto
app.delete('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await pool.query('DELETE FROM producto WHERE idproducto = $1', [id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});