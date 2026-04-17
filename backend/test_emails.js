import pool from './db.js';

const getMails = async () => {
    try {
      const res = await pool.query("SELECT idusuarios, nombre, correo, contrasena, activo FROM usuarios");
      console.log("=== USUARIOS REGISTRADOS EN LA BASE DE DATOS ===");
      console.table(res.rows);
    } catch(e) {
      console.error(e);
    } finally {
        process.exit();
    }
}
getMails();
