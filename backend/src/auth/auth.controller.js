import pool from '../../db.js';

export const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  if (!correo || !contrasena) {
    return res.status(400).json({ error: 'Correo y contraseña son requeridos' });
  }

  try {
    // Buscar usuario por correo y validar que esté activo
    const query = `
      SELECT u.idusuarios as id, u.nombre, u.apellido, u.correo, r.nombre as rol, u.activo, u.contrasena
      FROM usuarios u
      LEFT JOIN rol r ON u.idrol = r.idrol
      WHERE u.correo = $1
    `;
    const result = await pool.query(query, [correo]);

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales inválidas o correo no registrado' });
    }

    const user = result.rows[0];

    // Verificar si la cuenta está desactivada
    if (!user.activo) {
      return res.status(403).json({ error: 'Esta cuenta ha sido desactivada. Contacta al administrador.' });
    }

    // Verificar contraseña (texto plano según configuración actual)
    if (user.contrasena !== contrasena) {
      return res.status(401).json({ error: 'Contraseña incorrecta' });
    }

    // Retornamos sin contraseña por seguridad
    res.json({
      id: user.id,
      nombre: user.nombre,
      apellido: user.apellido,
      correo: user.correo,
      rol: user.rol,
      activo: user.activo
    });

  } catch (error) {
    console.error('Error POST /auth/login:', error);
    res.status(500).json({ error: 'Error interno del servidor al procesar el ingreso' });
  }
};
