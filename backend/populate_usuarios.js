import pool from './db.js';

const populateUsuariosFinal = async () => {
  try {
    // Si idrol is required, check if we need to mock rol first, or if idrol can be null.
    // We will just try leaving idrol null or assigning 1.
    // If idrol has foreign key to `rol` we might need to insert `rol` first.
    
    // First try a complete insert
    await pool.query(`
      INSERT INTO usuarios (idusuarios, nombre, apellido, correo, usuario, contrasena, activo, fecha) 
      VALUES (1, 'Admin', 'Admin', 'admin@example.com', 'admin', '1234', true, NOW()) 
      ON CONFLICT DO NOTHING
    `);
    console.log("Inserted admin successfully!");
  } catch (err) {
    if(err.message.includes("violates foreign key constraint") && err.message.includes("idrol")) {
       console.log("Need to create rol first");
       try {
         await pool.query(`
           INSERT INTO rol (idrol, nombre) VALUES (1, 'Administrador') ON CONFLICT DO NOTHING
         `);
         await pool.query(`
           INSERT INTO usuarios (idusuarios, idrol, nombre, apellido, correo, usuario, contrasena, activo, fecha) 
           VALUES (1, 1, 'Admin', 'Admin', 'admin@example.com', 'admin', '1234', true, NOW()) 
           ON CONFLICT DO NOTHING
         `);
         console.log("Inserted admin with rol successfully!");
       } catch (e) {
         console.log("Double error:", e.message);
       }
    } else {
       console.log("Error inserting:", err.message);
    }
  } finally {
    process.exit(0);
  }
}

populateUsuariosFinal();
