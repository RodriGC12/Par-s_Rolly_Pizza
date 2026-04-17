import pool from '../../../db.js';

export class CajaService {
  
  // --- SECCIÓN CAJA Y AUDITORÍA ---

  static async abrirCaja({ usuario_id, monto_inicial }) {
    // 1. Validar si ya existe caja abierta para el usuario (o global, aqui lo hacemos por user/global temp)
    const verif = await pool.query(`SELECT id FROM caja WHERE estado = 'ABIERTA'`);
    if (verif.rows.length > 0) {
      throw new Error('CAJA_YA_ABIERTA');
    }

    const result = await pool.query(`
      INSERT INTO caja (usuario_id, monto_inicial)
      VALUES ($1, $2)
      RETURNING id, monto_inicial, fecha_apertura
    `, [usuario_id, monto_inicial]);

    return result.rows[0];
  }

  static async getCajaActual() {
    const res = await pool.query(`SELECT * FROM caja WHERE estado = 'ABIERTA' LIMIT 1`);
    if (res.rows.length === 0) return null;

    const caja = res.rows[0];

    // Calc ingresos y egresos
    const movsRes = await pool.query(`
      SELECT tipo, SUM(monto) as total
      FROM caja_movimientos 
      WHERE caja_id = $1 
      GROUP BY tipo
    `, [caja.id]);

    let total_ingresos = 0;
    let total_egresos = 0;

    movsRes.rows.forEach(r => {
      if (r.tipo === 'INGRESO') total_ingresos = Number(r.total);
      if (r.tipo === 'EGRESO') total_egresos = Number(r.total);
    });

    const saldo_actual = Number(caja.monto_inicial) + total_ingresos - total_egresos;

    return {
      caja_id: caja.id,
      monto_inicial: Number(caja.monto_inicial),
      total_ingresos,
      total_egresos,
      saldo_actual: Number(saldo_actual),
      fecha_apertura: caja.fecha_apertura
    };
  }

  static async cerrarCaja({ monto_final_real }) {
    const act = await this.getCajaActual();
    if (!act) throw new Error('SIN_CAJA_ABIERTA');

    const saldo_teorico = act.saldo_actual;
    const diferencia = Number(monto_final_real) - saldo_teorico;

    await pool.query(`
      UPDATE caja 
      SET fecha_cierre = NOW(), 
          monto_final_real = $1, 
          saldo_teorico = $2, 
          diferencia = $3, 
          estado = 'CERRADA'
      WHERE id = $4
    `, [monto_final_real, saldo_teorico, diferencia, act.caja_id]);

    return { saldo_teorico, monto_final_real, diferencia };
  }

  static async crearMovimiento(clientDb, { caja_id, tipo, monto, descripcion, referencia = null }) {
    if (Number(monto) < 0) throw new Error('MONTO_NEGATIVO');
    
    await clientDb.query(`
      INSERT INTO caja_movimientos (caja_id, tipo, monto, descripcion, referencia)
      VALUES ($1, $2, $3, $4, $5)
    `, [caja_id, tipo, monto, descripcion, referencia]);
  }

  static async getMovimientos(fecha, tipo) {
    // Si hay caja abierta saca esos, si no saca todo (segun lo necesites)
    // Para simplificar, devolvemos toda la tabla con joins o filtrados basicos
    const act = await pool.query(`SELECT id FROM caja WHERE estado = 'ABIERTA' LIMIT 1`);
    if(act.rows.length === 0) return [];
    const caja_id = act.rows[0].id;

    let query = `SELECT * FROM caja_movimientos WHERE caja_id = $1`;
    const params = [caja_id];

    if (tipo) {
      params.push(tipo);
      query += ` AND tipo = $2`;
    }

    query += ` ORDER BY fecha DESC`;
    const res = await pool.query(query, params);
    return res.rows;
  }

  // --- SECCIÓN ÓRDENES Y PAGOS ---
  
  static async obtenerOrdenesListas() {
    const query = `
      SELECT o.idorden as id, o.fecha, o.estado, m.numeromesa as mesa, o.idcliente as cliente,
        COALESCE(
          (SELECT SUM(d.cantidad * p.precio) FROM detalleorden d JOIN producto p ON d.idproducto = p.idproducto WHERE d.idorden = o.idorden), 0
        ) as total
      FROM orden o LEFT JOIN mesa m ON o.idmesa = m.idmesa
      WHERE o.estado IN ('lista', 'entregada') ORDER BY o.fecha ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  static async obtenerDetalleOrden(idorden) {
    const ordenRes = await pool.query(`
      SELECT o.idorden as id, o.estado, m.numeromesa as mesa FROM orden o LEFT JOIN mesa m ON o.idmesa = m.idmesa WHERE idorden = $1
    `, [idorden]);
    
    if (ordenRes.rows.length === 0) return null;
    const orden = ordenRes.rows[0];

    const detallesRes = await pool.query(`
      SELECT p.nombre, d.cantidad, p.precio, (d.cantidad * p.precio) as subtotal
      FROM detalleorden d JOIN producto p ON d.idproducto = p.idproducto WHERE d.idorden = $1
    `, [idorden]);
    
    const productos = detallesRes.rows;
    const total = productos.reduce((acc, curr) => acc + Number(curr.subtotal), 0);
    return { ...orden, productos, total };
  }

  static async procesarPago({ orden_id, metodo_pago, monto_recibido, usuario_id }) {
    // Check caja first
    const cajaQuery = await pool.query(`SELECT id FROM caja WHERE estado = 'ABIERTA'`);
    if (cajaQuery.rows.length === 0) throw new Error('SIN_CAJA_ABIERTA');
    const caja_id = cajaQuery.rows[0].id;

    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      
      const ordenRes = await client.query('SELECT estado FROM orden WHERE idorden = $1 FOR UPDATE', [orden_id]);
      if (ordenRes.rows.length === 0) throw new Error('ORDEN_NO_ENCONTRADA');
      if (!['lista', 'entregada'].includes(ordenRes.rows[0].estado)) throw new Error('ESTADO_INVALIDO');
      
      const detallesRes = await client.query(`
        SELECT SUM(d.cantidad * p.precio) as total FROM detalleorden d JOIN producto p ON d.idproducto = p.idproducto WHERE d.idorden = $1
      `, [orden_id]);
      const total = Number(detallesRes.rows[0].total) || 0;

      let cambio = 0;
      let monto_recibido_final = null;
      if (metodo_pago === 'EFECTIVO') {
        if (!monto_recibido || Number(monto_recibido) < total) throw new Error('MONTO_INSUFICIENTE');
        monto_recibido_final = Number(monto_recibido);
        cambio = monto_recibido_final - total;
      }

      await client.query(`INSERT INTO pagos (orden_id, metodo_pago, monto, monto_recibido, cambio, usuario_id) VALUES ($1, $2, $3, $4, $5, $6)`, 
      [orden_id, metodo_pago, total, monto_recibido_final, cambio, usuario_id]);

      await client.query(`UPDATE orden SET estado = 'pagada' WHERE idorden = $1`, [orden_id]);

      // INYECTAR MOVIMIENTO DE CAJA
      await CajaService.crearMovimiento(client, {
        caja_id,
        tipo: 'INGRESO',
        monto: total,
        descripcion: `Cobro de Orden #${orden_id} (${metodo_pago})`,
        referencia: orden_id
      });

      await client.query('COMMIT');
      return { exito: true, total, cambio };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async obtenerHistorialPagos(fecha) {
    let query = `SELECT p.id, p.orden_id, p.metodo_pago, p.monto, p.fecha_pago, o.idmesa as mesa FROM pagos p JOIN orden o ON p.orden_id = o.idorden ORDER BY p.fecha_pago DESC`;
    const result = await pool.query(query); // simplify for now
    return result.rows;
  }
}
