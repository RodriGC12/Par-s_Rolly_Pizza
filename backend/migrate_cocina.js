import pool from './db.js';

const migrateDB = async () => {
  try {
    console.log("Checking and fixing table schemas...");

    // 1. Fix orden.estado to be VARCHAR if it's boolean or missing
    try {
      await pool.query(`ALTER TABLE orden ALTER COLUMN estado TYPE VARCHAR(50) USING CASE WHEN estado=true THEN 'pendiente' ELSE 'pagada' END;`);
      console.log("Altered orden.estado to VARCHAR(50)");
    } catch(err) {
      if (err.message.includes('No existe la columna')) {
         await pool.query(`ALTER TABLE orden ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente';`);
         console.log("Added orden.estado VARCHAR(50)");
      } else {
         console.log("Notice for orden: ", err.message);
      }
    }

    // 2. Add detalleorden.estado
    try {
      await pool.query(`ALTER TABLE detalleorden ADD COLUMN estado VARCHAR(50) DEFAULT 'pendiente';`);
      console.log("Added detalleorden.estado VARCHAR(50)");
    } catch(err) {
      console.log("Notice for detalleorden: ", err.message);
    }

    // 3. Add nota to detalleorden
    try {
      await pool.query(`ALTER TABLE detalleorden ADD COLUMN nota VARCHAR(255);`);
      console.log("Added detalleorden.nota VARCHAR(255)");
    } catch(err) {
      console.log("Notice for detalleorden: ", err.message);
    }

    console.log("Migration complete!");
  } catch (error) {
    console.error("MIGRATION ERROR:", error.message);
  } finally {
    process.exit(0);
  }
};

migrateDB();
