import pool from '../../db.js';

export const getDashboardStats = async (req, res) => {
  try {
    // 1. Órdenes Hoy (totales y activas)
    const ordenesRes = await pool.query(`
      SELECT 
        COUNT(*) as total_ordenes,
        SUM(CASE WHEN estado IN ('pendiente', 'preparacion', 'lista') THEN 1 ELSE 0 END) as activas
      FROM orden
      WHERE fecha >= CURRENT_DATE
    `);

    // 2. Ventas Hoy (de pagos)
    const ventasRes = await pool.query(`
      SELECT COALESCE(SUM(monto), 0) as total_ventas
      FROM pagos
      WHERE fecha_pago >= CURRENT_DATE
    `);

    // 3. Alertas de inventario
    const invRes = await pool.query(`
      SELECT COUNT(*) as low_stock
      FROM producto
      WHERE cantidad <= stock_minimo
    `);

    // 4. Últimas órdenes
    const ultimasOrdenes = await pool.query(`
      SELECT idorden, estado, fecha 
      FROM orden 
      ORDER BY idorden DESC 
      LIMIT 5
    `);

    // 5. Ventas de la semana (para el gráfico)
    const ventasSemana = await pool.query(`
      SELECT date_trunc('day', fecha_pago) as dia, SUM(monto) as total
      FROM pagos
      WHERE fecha_pago >= CURRENT_DATE - INTERVAL '6 days'
      GROUP BY 1
      ORDER BY 1 ASC
    `);

    res.json({
      ordenes_hoy: parseInt(ordenesRes.rows[0].total_ordenes || 0),
      ordenes_activas: parseInt(ordenesRes.rows[0].activas || 0),
      ventas_hoy: parseFloat(ventasRes.rows[0].total_ventas || 0),
      alerta_inventario: parseInt(invRes.rows[0].low_stock || 0),
      ultimas_ordenes: ultimasOrdenes.rows,
      ventas_semana: ventasSemana.rows.map(v => ({
        fecha: v.dia,
        total: parseFloat(v.total)
      }))
    });

  } catch (error) {
    console.error("Error en dashboard:", error);
    res.status(500).json({ error: 'Error del servidor al obtener métricas' });
  }
};
