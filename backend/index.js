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

// ==== RUTAS PARA ÓRDENES ====

// 1. GET /orders
app.get('/orders', async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        o.idorden, o.estado, o.fecha, m.numeromesa as mesa,
        d.cantidad, p.nombre, p.precio
      FROM orden o
      LEFT JOIN mesa m ON o.idmesa = m.idmesa
      LEFT JOIN detalleorden d ON o.idorden = d.idorden
      LEFT JOIN producto p ON d.idproducto = p.idproducto
      ORDER BY o.idorden DESC
    `);
    
    // Agrupar productos por orden en JS
    const ordersMap = {};
    result.rows.forEach(row => {
      if (!ordersMap[row.idorden]) {
        ordersMap[row.idorden] = {
          idorden: row.idorden,
          estado: row.estado,
          mesa: row.mesa,
          fecha: row.fecha,
          total: 0,
          detalles: []
        };
      }
      
      if (row.nombre) {
        const itemTotal = Number(row.cantidad || 0) * Number(row.precio || 0);
        ordersMap[row.idorden].total += itemTotal;
        ordersMap[row.idorden].detalles.push({
          nombre: row.nombre,
          cantidad: row.cantidad,
          precio: row.precio
        });
      }
    });

    res.json(Object.values(ordersMap));
  } catch (error) {
    console.error('Error GET /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 2. POST /orders
app.post('/orders', async (req, res) => {
  const { idMesa, idUsuario, idCliente, productos } = req.body;

  const client = await pool.connect(); 

  try {
    await client.query('BEGIN');

    // 1. Insertar orden
    const insertOrden = await client.query(
      `INSERT INTO orden (idmesa, idusuarios, idcliente, estado, fecha) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING idorden`,
      [idMesa, idUsuario, idCliente, 'pendiente']
    );

    const orderId = insertOrden.rows[0].idorden;

    // 2. Insertar detalles
    if (productos && productos.length > 0) {
      for (let p of productos) {
        await client.query(
          `INSERT INTO detalleorden (idorden, idproducto, cantidad) 
           VALUES ($1, $2, $3)`,
          [orderId, p.idProducto, p.cantidad]
        );
      }
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Orden creada exitosamente',
      idorden: orderId
    });

  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error POST /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });

  } finally {
    client.release(); 
  }
});

// 3. PATCH /orders/:id
app.patch('/orders/:id', async (req, res) => {
  const { id } = req.params;
  const { estado } = req.body; // se espera string para los estados nuevos
  try {
    const result = await pool.query(
      `UPDATE orden SET estado = $1 WHERE idorden = $2 RETURNING *`,
      [estado, id]
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error PATCH /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

// 4. DELETE /orders/:id
app.delete('/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('BEGIN');
    
    // 1ro borrar dependencias
    await pool.query('DELETE FROM detalleorden WHERE idorden = $1', [id]);
    
    // 2do borrar orden maestra
    const result = await pool.query('DELETE FROM orden WHERE idorden = $1 RETURNING *', [id]);
    
    await pool.query('COMMIT');
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }
    res.json({ message: 'Orden y detalles eliminados exitosamente' });
  } catch (error) {
    await pool.query('ROLLBACK');
    console.error('Error DELETE /orders:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
});

app.listen(3000, () => {
  console.log('Servidor en http://localhost:3000');
});