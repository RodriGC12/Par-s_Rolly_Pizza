import pool from '../../db.js';

export const getUsuarios = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT u.idusuarios as id, u.nombre, u.apellido, u.correo, r.nombre as rol, u.activo, u.fecha 
      FROM usuarios u 
      LEFT JOIN rol r ON u.idrol = r.idrol 
      ORDER BY u.idusuarios DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Error GET /usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const createUsuario = async (req, res) => {
  const { nombre, apellido, correo, contrasena, rol } = req.body;
  
  // Validaciones
  if (!nombre || !correo || !contrasena) {
    return res.status(400).json({ error: 'Nombre, Correo y Contraseña son requeridos' });
  }

  try {
    // Validar si el correo o usuario(nombre para simplificar) ya existe
    const exists = await pool.query('SELECT * FROM usuarios WHERE correo = $1', [correo]);
    if (exists.rows.length > 0) {
      return res.status(400).json({ error: 'El correo ya está registrado en el sistema' });
    }

    const rolesQuery = await pool.query('SELECT idrol FROM rol WHERE nombre ILIKE $1', [rol]);
    let id_rol = null;
    
    // Create rol if it does not exist
    if (rolesQuery.rows.length === 0 && rol) {
       const newRol = await pool.query('INSERT INTO rol (nombre) VALUES ($1) RETURNING idrol', [rol]);
       id_rol = newRol.rows[0].idrol;
    } else if(rolesQuery.rows.length > 0) {
       id_rol = rolesQuery.rows[0].idrol;
    }

    // Usando texto plano según indicación del usuario para modo local/desarrollo
    const user = await pool.query(
      `INSERT INTO usuarios (nombre, apellido, correo, usuario, contrasena, idrol, activo, fecha) 
       VALUES ($1, $2, $3, $4, $5, $6, true, NOW()) RETURNING idusuarios as id, nombre, apellido, correo, activo, fecha`,
      [nombre, apellido || '', correo, nombre, contrasena, id_rol]
    );

    res.status(201).json({ ...user.rows[0], rol: rol || 'cajero' });
  } catch (error) {
    console.error('Error POST /usuarios:', error);
    res.status(500).json({ error: 'Error al crear el usuario' });
  }
};

export const updateUsuario = async (req, res) => {
  const { id } = req.params;
  const { nombre, apellido, correo, contrasena, rol, activo } = req.body;

  try {
    const rolesQuery = await pool.query('SELECT idrol FROM rol WHERE nombre ILIKE $1', [rol]);
    let id_rol = null;
    if (rolesQuery.rows.length > 0) {
       id_rol = rolesQuery.rows[0].idrol;
    }

    // Actualiza. Si password viene vacío, no lo toca.
    let updateQuery;
    let values;

    if (contrasena && contrasena.trim() !== '') {
      updateQuery = `
        UPDATE usuarios 
        SET nombre = $1, apellido = $2, correo = $3, usuario = $4, contrasena = $5, activo = $6, idrol = $7
        WHERE idusuarios = $8 
        RETURNING idusuarios as id, nombre, apellido, correo, activo, fecha`;
      values = [nombre, apellido || '', correo, nombre, contrasena, activo !== undefined ? activo : true, id_rol, id];
    } else {
      updateQuery = `
        UPDATE usuarios 
        SET nombre = $1, apellido = $2, correo = $3, usuario = $4, activo = $5, idrol = $6
        WHERE idusuarios = $7 
        RETURNING idusuarios as id, nombre, apellido, correo, activo, fecha`;
      values = [nombre, apellido || '', correo, nombre, activo !== undefined ? activo : true, id_rol, id];
    }

    const result = await pool.query(updateQuery, values);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error PUT /usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

export const deleteUsuario = async (req, res) => {
  const { id } = req.params;
  try {
    await pool.query('UPDATE usuarios SET activo = false WHERE idusuarios = $1', [id]);
    res.json({ message: 'Usuario desactivado correctamente' });
  } catch (error) {
    console.error('Error DELETE /usuarios:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};
