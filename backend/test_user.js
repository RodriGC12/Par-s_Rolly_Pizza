import pool from './db.js';

const testInsert = async () => {
  try {
     const res = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, contrasena, rol, idrol, activo, fecha) 
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW()) RETURNING idusuarios as id, nombre, apellido, correo, rol, activo, fecha`,
      ['Agustín', 'Herrera', 'agustin@gmail.com', '1234', 'cocinero', null]
    );
  } catch (err) {
     console.error("DB ERROR: ", err.message);
  } finally {
     process.exit(0);
  }
}
testInsert();
