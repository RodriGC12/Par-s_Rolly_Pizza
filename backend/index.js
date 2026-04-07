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
    // ORDER BY para que siempre se muestren en el mismo orden
    const result = await pool.query('SELECT * FROM producto ORDER BY idproducto DESC');
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener productos:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Crear un nuevo producto
app.post('/products', async (req, res) => {
  try {
    // agregamos los nuevos campos del inventario
    const { idcategoria, nombre, descripcion, precio, cantidad, stock_minimo, fecha_vencimiento } = req.body;

    // Actualizamos el INSERT y los valores ($1, $2...)
    const result = await pool.query(
      `INSERT INTO producto (idcategoria, nombre, descripcion, precio, cantidad, stock_minimo, fecha_vencimiento, fecha)
       VALUES ($1, $2, $3, $4, $5, $6, $7, NOW())
       RETURNING *`,
      [idcategoria, nombre, descripcion, precio, cantidad, stock_minimo, fecha_vencimiento]
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
    await pool.query('DELETE FROM producto WHERE idproducto= $1', [id]);
    res.json({ message: 'Producto eliminado exitosamente' });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// Actualizar un producto
app.put('/products/:id', async (req, res) => {
  try {
    const { id } = req.params;
    // quitamos 'imagen' y agregamos lo nuevo
    const { idcategoria, nombre, descripcion, precio, cantidad, stock_minimo, fecha_vencimiento } = req.body;

    //Actualizamos el UPDATE
    const result = await pool.query(
      `UPDATE producto 
       SET idcategoria = $1, nombre = $2, descripcion = $3, precio = $4, cantidad = $5, stock_minimo = $6, fecha_vencimiento = $7
       WHERE idproducto = $8 
       RETURNING *`,
      [idcategoria, nombre, descripcion, precio, cantidad, stock_minimo, fecha_vencimiento, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar producto:', error.message);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});