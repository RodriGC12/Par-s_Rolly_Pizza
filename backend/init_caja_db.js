import pool from './db.js';

const initCajaTables = async () => {
  try {
    console.log('Creando tablas de caja y pagos...');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS caja (
        id SERIAL PRIMARY KEY,
        usuario_id INT,
        monto_inicial NUMERIC(15,2) NOT NULL,
        fecha_apertura TIMESTAMP DEFAULT NOW(),
        estado VARCHAR(20) DEFAULT 'ABIERTA',
        fecha_cierre TIMESTAMP,
        monto_final_real NUMERIC(15,2),
        saldo_teorico NUMERIC(15,2),
        diferencia NUMERIC(15,2)
      );
    `);
    console.log('Tabla CAJA verificada/creada.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS caja_movimientos (
        id SERIAL PRIMARY KEY,
        caja_id INT REFERENCES caja(id),
        tipo VARCHAR(20) NOT NULL,
        monto NUMERIC(15,2) NOT NULL,
        descripcion VARCHAR(255) NOT NULL,
        referencia VARCHAR(100),
        fecha TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Tabla CAJA_MOVIMIENTOS verificada/creada.');

    await pool.query(`
      CREATE TABLE IF NOT EXISTS pagos (
        id SERIAL PRIMARY KEY,
        orden_id INT,
        metodo_pago VARCHAR(50) NOT NULL,
        monto NUMERIC(15,2) NOT NULL,
        monto_recibido NUMERIC(15,2),
        cambio NUMERIC(15,2),
        usuario_id INT,
        fecha_pago TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('Tabla PAGOS verificada/creada.');

    console.log('¡Todas las tablas del módulo de caja se crearon con éxito!');
    process.exit(0);

  } catch (error) {
    console.error('Error al crear las tablas:', error);
    process.exit(1);
  }
};

initCajaTables();
