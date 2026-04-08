import { Router } from 'express';
import { CajaController } from '../controllers/caja.controller.js';

const router = Router();

// --- OPERACIONES DE CAJA (SESIÓN) ---
// Abrir caja
router.post('/apertura', CajaController.abrirCaja);

// Cerrar caja
router.post('/cierre', CajaController.cerrarCaja);

// Ver estado de caja actual
router.get('/actual', CajaController.getCajaActual);

// Registrar ingreso/egreso manual
router.post('/movimientos', CajaController.crearMovimientoManual);

// Ver el historial de todos los movimientos (de la caja abierta o pasados)
router.get('/movimientos', CajaController.getMovimientos);

// --- COBROS ---
// Endpoint para traer órdenes que se pueden cobrar (estado = lista)
router.get('/ordenes', CajaController.getOrdenesListas);

// Detalle de una sola orden (con sus productos y total)
router.get('/ordenes/:id', CajaController.getDetalleOrden);

// Procesar un nuevo pago (crea pago, registra INGRESO en caja y cambia orden a 'pagada')
router.post('/pagos', CajaController.procesarPago);

// Ver historial de pagos netos
router.get('/pagos-historial', CajaController.getHistorialPagos);

export default router;
