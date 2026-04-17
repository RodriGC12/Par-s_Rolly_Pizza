import pool from './db.js';

const testReq = async () => {
  const client = await pool.connect(); 
  try {
    await client.query('BEGIN');

    // Create a mock product, or it will fail here too if product ID 1 doesn't exist
    // Check if product 1 exists
    try {
      await pool.query(`INSERT INTO producto (idcategoria, nombre, precio, cantidad) VALUES (1, 'mock', 1, 10) ON CONFLICT DO NOTHING`);
    } catch(e){}

    const insertOrden = await client.query(
      `INSERT INTO orden (idmesa, idusuarios, idcliente, estado, fecha) 
       VALUES ($1, $2, $3, $4, NOW()) RETURNING idorden`,
      [4, 1, 1, 'pendiente'] 
    );
    console.log("Orden created:", insertOrden.rows[0].idorden);

    // Let's not test detalleorden yet so we can see if orden fails
    await client.query('ROLLBACK');
  } catch(err) {
    console.error("SQL_ERROR", err.message);
    await client.query('ROLLBACK');
  } finally {
    client.release();
    process.exit(0);
  }
};
testReq();
