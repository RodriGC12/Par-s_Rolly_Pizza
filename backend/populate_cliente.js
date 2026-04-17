import pool from './db.js';

const populateCliente = async () => {
  try {
    console.log("Checking cliente table and inserting default ID 1...");
    
    // Create cliente logic if table doesn't exist just in case
    const checkCliente = await pool.query(`SELECT to_regclass('cliente') as exists`);
    if (!checkCliente.rows[0].exists) {
      console.log("Table cliente does not exist. Creating it...");
      await pool.query(`
        CREATE TABLE cliente (
          idcliente SERIAL PRIMARY KEY,
          nombre VARCHAR(100) NOT NULL,
          telefono VARCHAR(20)
        );
      `);
    }

    try {
      await pool.query(`
        INSERT INTO cliente (idcliente, nombre, telefono) 
        VALUES (1, 'Cliente Mostrador', '0000000')
      `);
      console.log("Inserted Cliente Mostrador successfully!");
    } catch (err) {
      if(err.code === '23505') {
         console.log("El cliente 1 ya existe, todo está bien.");
      } else {
         console.log("Error inserting cliente:", err.message);
      }
    }

    process.exit(0);
  } catch (error) {
    console.error("Error setting up cliente:", error.message);
    process.exit(1);
  }
};

populateCliente();
