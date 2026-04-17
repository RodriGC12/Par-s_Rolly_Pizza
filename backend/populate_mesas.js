import pool from './db.js';

const populateMesas = async () => {
  try {
    console.log("Adding mesas 1 to 20 to the database to prevent foreign key errors...");
    
    // Check if table mesa exists
    const check = await pool.query(`SELECT to_regclass('mesa') as exists`);
    if (!check.rows[0].exists) {
      console.log("Table mesa does not exist. Creating it...");
      await pool.query(`
        CREATE TABLE mesa (
          idmesa SERIAL PRIMARY KEY,
          numeromesa INT UNIQUE NOT NULL,
          capacidad INT DEFAULT 4,
          estado VARCHAR(20) DEFAULT 'disponible'
        );
      `);
    }

    // Insert mesas 1 to 20
    for (let i = 1; i <= 20; i++) {
      try {
        await pool.query(`
          INSERT INTO mesa (idmesa, numeromesa) 
          VALUES ($1, $1)
        `, [i]);
      } catch (err) {
         // ignore duplicates
      }
    }
    
    console.log("Mesas successfully created or verified!");
    process.exit(0);
  } catch (error) {
    console.error("Error setting up mesas:", error.message);
    process.exit(1);
  }
};

populateMesas();
