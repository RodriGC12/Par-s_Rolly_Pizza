import { CajaService } from '../services/caja.service.js';
import pool from '../../../db.js';

export class CajaController {
  
  // --- API DE CAJA / AUDITORIA ---
  static async abrirCaja(req, res) {
    try {
      const { monto_inicial } = req.body;
      const usuario_id = 1; // Fake login

      if (monto_inicial === undefined || Number(monto_inicial) < 0) {
        return res.status(400).json({ error: 'Monto inicial requerido y debe ser positivo' });
      }

      const caja = await CajaService.abrirCaja({ usuario_id, monto_inicial });
      res.status(201).json({ message: 'Caja abierta con éxito', caja });
    } catch (err) {
      if (err.message === 'CAJA_YA_ABIERTA') return res.status(400).json({ error: 'Ya existe una caja abierta en el sistema' });
      console.error(err);
      res.status(500).json({ error: 'Error al abrir caja' });
    }
  }

  static async getCajaActual(req, res) {
    try {
      const caja = await CajaService.getCajaActual();
      if (!caja) return res.status(404).json({ error: 'No hay caja abierta' });
      res.json(caja);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al obtener estado de caja' });
    }
  }

  static async cerrarCaja(req, res) {
    try {
      const { monto_final_real } = req.body;
      
      if (monto_final_real === undefined || Number(monto_final_real) < 0) {
        return res.status(400).json({ error: 'Monto final real requerido' });
      }

      const cierre = await CajaService.cerrarCaja({ monto_final_real });
      res.json({ message: 'Caja cerrada exitosamente', detalle: cierre });
    } catch (err) {
      if(err.message === 'SIN_CAJA_ABIERTA') return res.status(400).json({ error: 'No se puede cerrar, no hay caja abierta' });
      console.error(err);
      res.status(500).json({ error: 'Error al cerrar caja' });
    }
  }

  static async crearMovimientoManual(req, res) {
    try {
      const { tipo, monto, descripcion } = req.body;
      
      if(!['INGRESO','EGRESO'].includes(tipo) || !monto || Number(monto) <= 0 || !descripcion) {
        return res.status(400).json({ error: 'Datos inválidos para movimiento' });
      }

      const actual = await CajaService.getCajaActual();
      if (!actual) return res.status(400).json({ error: 'Necesita apertura de caja antes de registrar movimientos' });

      await CajaService.crearMovimiento(pool, { // Pasamos pool como cliente standard aca ya que no necesitamos trxn
        caja_id: actual.caja_id,
        tipo,
        monto,
        descripcion
      });

      res.status(201).json({ message: 'Movimiento registrado' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al registrar movimiento' });
    }
  }

  static async getMovimientos(req, res) {
    try {
      const ms = await CajaService.getMovimientos();
      res.json(ms);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Error al listar movimientos' });
    }
  }

  // --- API DE PAGOS / COBROS DE EX-ORDENES ---
  
  static async getOrdenesListas(req, res) {
    try {
      const ordenes = await CajaService.obtenerOrdenesListas();
      res.json(ordenes);
    } catch (error) {
      console.error('Error en CajaController.getOrdenesListas:', error);
      res.status(500).json({ error: 'Error al obtener órdenes listas para cobrar' });
    }
  }

  static async getDetalleOrden(req, res) {
    try {
      const idorden = req.params.id;
      const detalle = await CajaService.obtenerDetalleOrden(idorden);
      if (!detalle) return res.status(404).json({ error: 'Orden no encontrada' });
      res.json(detalle);
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener el detalle de la orden' });
    }
  }

  static async procesarPago(req, res) {
    try {
      const { orden_id, metodo_pago, monto_recibido } = req.body;
      const usuario_id = 1;

      if (!orden_id || !metodo_pago) return res.status(400).json({ error: 'Faltan datos obligatorios' });
      if (!['EFECTIVO', 'TARJETA', 'TRANSFERENCIA'].includes(metodo_pago)) return res.status(400).json({ error: 'Método inválido' });

      const pago = await CajaService.procesarPago({ orden_id, metodo_pago, monto_recibido, usuario_id });
      res.status(201).json({ message: 'Pago procesado exitosamente', detalles: pago });

    } catch (error) {
      if (error.message === 'SIN_CAJA_ABIERTA') return res.status(403).json({ error: 'La caja está cerrada. Debes abrir la caja primero.' });
      if (error.message === 'ORDEN_NO_ENCONTRADA') return res.status(404).json({ error: 'La orden indicada no existe' });
      if (error.message === 'ESTADO_INVALIDO') return res.status(400).json({ error: 'La orden no se encuentra en estado LISTA' });
      if (error.message === 'MONTO_INSUFICIENTE') return res.status(400).json({ error: 'El monto en efectivo recibido es menor al total' });
      
      console.error('Error en CajaController.procesarPago:', error);
      res.status(500).json({ error: 'Error interno del servidor al procesar el pago' });
    }
  }

  static async getHistorialPagos(req, res) {
    try {
      const pagos = await CajaService.obtenerHistorialPagos();
      res.json({ total: pagos.length, pagos });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Error al obtener historial' });
    }
  }
}
