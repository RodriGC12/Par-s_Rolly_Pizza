import React, { useState, useEffect } from 'react';

// Icons
const CurrencyIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>;
const CheckIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>;
const CloseIcon = () => <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>;
const CashIcon = () => <svg className="w-8 h-8 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>;

export default function Caja() {
  const [cargandoGlobal, setCargandoGlobal] = useState(true);
  const [cajaAbierta, setCajaAbierta] = useState(null); // guardara { saldo_actual, ingresos, etc }
  
  // States - Cobro Ordenes
  const [ordenes, setOrdenes] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [ordenActiva, setOrdenActiva] = useState(null);
  const [metodoPago, setMetodoPago] = useState('EFECTIVO');
  const [montoRecibido, setMontoRecibido] = useState('');
  const [pagoExitoso, setPagoExitoso] = useState(null);
  
  // States - Operaciones manuales
  const [modalOperacion, setModalOperacion] = useState(null); // 'APERTURA', 'MOVIMIENTO', 'CIERRE'
  const [formMonto, setFormMonto] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formTipoMov, setFormTipoMov] = useState('INGRESO');
  const [errorGlobal, setErrorGlobal] = useState('');
  const [procesando, setProcesando] = useState(false);

  // Carga Inicial
  const loadEstadoCaja = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/caja/actual');
      if (res.status === 404) {
        setCajaAbierta(null);
        return;
      }
      if (!res.ok) throw new Error("Fallo la petición de caja");
      const data = await res.json();
      setCajaAbierta(data);
    } catch (err) {
      console.error(err);
    }
  };

  const loadOrdenesListas = async () => {
    try {
      const res = await fetch('http://localhost:3000/api/caja/ordenes');
      if (!res.ok) throw new Error("Fallo al obtener ordenes");
      const data = await res.json();
      setOrdenes(data);
    } catch (err) {
      console.error(err);
    }
  };

  const inicializarVista = async () => {
    setCargandoGlobal(true);
    await loadEstadoCaja();
    await loadOrdenesListas();
    setCargandoGlobal(false);
  };

  useEffect(() => {
    inicializarVista();
    const interval = setInterval(() => {
      loadEstadoCaja();
      loadOrdenesListas();
    }, 10000); // refresh cada 10s
    return () => clearInterval(interval);
  }, []);

  const formatearMoneda = (val) => new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(val || 0);

  // =================== LOGICA AUDITORIA DE CAJA ===================
  const handleApertura = async () => {
    setErrorGlobal('');
    if (!formMonto || Number(formMonto) < 0) return setErrorGlobal('Ingresa un monto válido.');
    setProcesando(true);
    try {
      const res = await fetch('http://localhost:3000/api/caja/apertura', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_inicial: Number(formMonto) })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalOperacion(null);
      await loadEstadoCaja();
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleMovimientoManual = async () => {
    setErrorGlobal('');
    if (!formMonto || Number(formMonto) <= 0 || !formDesc) return setErrorGlobal('Completa un monto válido y la descripción.');
    setProcesando(true);
    try {
      const res = await fetch('http://localhost:3000/api/caja/movimientos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: formTipoMov, monto: Number(formMonto), descripcion: formDesc })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalOperacion(null);
      await loadEstadoCaja();
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setProcesando(false);
    }
  };

  const handleCierre = async () => {
    setErrorGlobal('');
    if (formMonto === '') return setErrorGlobal('Debes contar el dinero y escribir el monto final real.');
    setProcesando(true);
    try {
      const res = await fetch('http://localhost:3000/api/caja/cierre', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ monto_final_real: Number(formMonto) })
      });
      if (!res.ok) throw new Error((await res.json()).error);
      setModalOperacion(null);
      setCajaAbierta(null); // Caja goes back to undefined state
      alert("Caja cerrada correctamente. " + (await res.json()).message || '');
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setProcesando(false);
    }
  };

  // =================== LOGICA COBRO ===================
  const handleAbrirCobro = async (idorden) => {
    try {
      setErrorGlobal(''); setPagoExitoso(null); setMetodoPago('EFECTIVO'); setMontoRecibido('');
      setIsModalOpen(true);
      const res = await fetch(`http://localhost:3000/api/caja/ordenes/${idorden}`);
      if (!res.ok) throw new Error('No se pudo obtener detalle');
      setOrdenActiva(await res.json());
    } catch (err) {
      console.error(err);
      setErrorGlobal('Error al cargar la orden');
    }
  };

  const handleProcesarPago = async () => {
    setErrorGlobal('');
    if (metodoPago === 'EFECTIVO' && (!montoRecibido || Number(montoRecibido) < ordenActiva.total)) {
      return setErrorGlobal('El monto recibido menor al total de la cuenta');
    }
    setProcesando(true);
    try {
      const res = await fetch('http://localhost:3000/api/caja/pagos', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orden_id: ordenActiva.id, metodo_pago: metodoPago,
          monto_recibido: metodoPago === 'EFECTIVO' ? Number(montoRecibido) : null
        })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setPagoExitoso(data.detalles);
      await loadEstadoCaja();
      await loadOrdenesListas();
    } catch (err) {
      setErrorGlobal(err.message);
    } finally {
      setProcesando(false);
    }
  };


  // ================= RENDERIZADO =================
  if (cargandoGlobal) return (
    <div className="flex h-full items-center justify-center">
      <span className="w-4 h-4 bg-emerald-500 rounded-full animate-ping"></span>
    </div>
  );

  return (
    <div className="w-full xl:max-w-[75rem] mx-auto animate-fade-in flex flex-col h-full gap-6">
      
      {/* HEADER DE CAJA (PANEL AUDITORIA) */}
      {!cajaAbierta ? (
         <div className="bg-white border border-rose-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
            <CashIcon />
            <h2 className="text-2xl font-black mt-4 mb-2 text-slate-800">Caja Cerrada</h2>
            <p className="text-slate-500 mb-6">Debes abrir una nueva sesión de caja para procesar ordenes y movimientos.</p>
            <button 
              onClick={() => { setFormMonto(''); setModalOperacion('APERTURA'); setErrorGlobal(''); }}
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-8 rounded-lg shadow-sm"
            >
              Realizar Apertura de Caja
            </button>
         </div>
      ) : (
         <div className="bg-white border rounded-xl shadow-sm p-4 flex flex-wrap lg:flex-nowrap justify-between gap-4">
            {/* KPI Totales */}
            <div className="flex bg-slate-50 rounded-lg border divide-x divide-slate-200">
               <div className="p-3 px-5 text-center">
                 <p className="text-xs text-slate-500 font-bold uppercase tracking-wide">Fondo Inicial</p>
                 <p className="font-extrabold text-slate-700">{formatearMoneda(cajaAbierta.monto_inicial)}</p>
               </div>
               <div className="p-3 px-5 text-center bg-emerald-50 text-emerald-900">
                 <p className="text-xs text-emerald-700 font-bold uppercase tracking-wide">Ingresos (+)</p>
                 <p className="font-bold">{formatearMoneda(cajaAbierta.total_ingresos)}</p>
               </div>
               <div className="p-3 px-5 text-center bg-rose-50 text-rose-900">
                 <p className="text-xs text-rose-700 font-bold uppercase tracking-wide">Egresos (-)</p>
                 <p className="font-bold">{formatearMoneda(cajaAbierta.total_egresos)}</p>
               </div>
               <div className="p-3 px-6 text-center bg-slate-800 text-white rounded-r-lg">
                 <p className="text-xs text-slate-300 font-bold uppercase tracking-wide">Saldo en Caja</p>
                 <p className="font-black text-lg text-emerald-400">{formatearMoneda(cajaAbierta.saldo_actual)}</p>
               </div>
            </div>

            {/* Acciones */}
            <div className="flex gap-2">
               <button onClick={() => { setFormMonto(''); setFormDesc(''); setFormTipoMov('INGRESO'); setErrorGlobal(''); setModalOperacion('MOVIMIENTO'); }} className="h-full border border-slate-300 text-slate-700 text-sm font-semibold hover:bg-slate-50 px-4 rounded-lg">
                 Registrar Ajuste / Gasto
               </button>
               <button onClick={() => { setFormMonto(''); setErrorGlobal(''); setModalOperacion('CIERRE'); }} className="h-full bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold px-4 rounded-lg shadow-sm">
                 Hacer Corte Cierre
               </button>
            </div>
         </div>
      )}

      {/* DASHBOARD DE ORDENES (SOLO SI CAJA ABIERTA) */}
      {cajaAbierta && (
        <div className="flex-1 flex flex-col">
          <h3 className="text-xl font-bold mb-4">Órdenes pendientes de cobro</h3>
          {ordenes.length === 0 ? (
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-12 text-center flex-1 flex flex-col items-center justify-center">
              <CashIcon />
              <p className="text-slate-500 font-medium text-lg mt-4">Todo al día. Esperando ordenes de cocina.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 content-start">
              {ordenes.map((orden) => (
                <div key={orden.id} className="bg-white rounded-xl shadow-md border flex flex-col h-full">
                  <div className="px-5 py-3 border-b bg-green-50 flex justify-between items-center">
                    <div className="font-bold text-green-900">Mesa {orden.mesa || '--'}</div>
                    <div className="text-xs font-bold text-green-700 uppercase bg-green-200 px-2 py-0.5 rounded-full">{orden.estado}</div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col pt-3">
                    <div className="flex justify-between text-sm text-slate-500 mb-2">
                      <span className="font-medium">Ord. #{orden.id}</span>
                    </div>
                    <div className="mt-auto pt-4 flex flex-col gap-2">
                      <div className="flex justify-between items-center mb-2">
                         <span className="text-slate-500 font-medium text-sm">Total:</span>
                         <span className="text-xl font-black">{formatearMoneda(orden.total)}</span>
                      </div>
                      <button onClick={() => handleAbrirCobro(orden.id)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2.5 rounded-lg flex justify-center items-center gap-2">
                        <CurrencyIcon /> Cobrar
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}


      {/* ================= MODALES DE AUDITORIA (OPERACIONES) ================= */}
      {modalOperacion && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden p-6 relative">
            <button onClick={() => setModalOperacion(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-700"><CloseIcon/></button>
            
            <h3 className="text-xl font-black mb-1 text-slate-800">
               {modalOperacion === 'APERTURA' ? 'Apertura de Caja' : modalOperacion === 'CIERRE' ? 'Cierre de Sesión' : 'Movimiento Manual'}
            </h3>
            
            <p className="text-sm text-slate-500 mb-5">
               {modalOperacion === 'APERTURA' && 'Indica con cuánto saldo inicial empiezas (sencillo/cambio).'}
               {modalOperacion === 'CIERRE' && `El saldo teórico actual es ${formatearMoneda(cajaAbierta?.saldo_actual)}. Ingresa el dinero físico REAL contado.`}
               {modalOperacion === 'MOVIMIENTO' && 'Retiros de gastos, pagos a proveedores, o ingresos extra.'}
            </p>

            {errorGlobal && (
              <div className="mb-4 text-xs font-bold bg-rose-50 text-rose-600 p-2 rounded border border-rose-200">
                {errorGlobal}
              </div>
            )}

            <div className="space-y-4">
              {modalOperacion === 'MOVIMIENTO' && (
                <div>
                  <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">TIPO DE MOVIMIENTO</label>
                  <div className="flex gap-2">
                     <button onClick={() => setFormTipoMov('INGRESO')} className={`flex-1 py-2 text-sm font-bold border rounded-lg ${formTipoMov === 'INGRESO' ? 'bg-emerald-50 border-emerald-400 text-emerald-700' : 'bg-slate-50'}`}>INGRESO</button>
                     <button onClick={() => setFormTipoMov('EGRESO')} className={`flex-1 py-2 text-sm font-bold border rounded-lg ${formTipoMov === 'EGRESO' ? 'bg-rose-50 border-rose-400 text-rose-700' : 'bg-slate-50'}`}>EGRESO</button>
                  </div>
                </div>
              )}
              
              <div>
                 <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">
                    {modalOperacion === 'CIERRE' ? 'Monto REAL EN CAJA' : 'Monto (ARS)'}
                 </label>
                 <div className="relative">
                   <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                   <input type="number" value={formMonto} onChange={e=>setFormMonto(e.target.value)} className="w-full border rounded-lg pl-8 pr-4 py-2 font-bold focus:ring-2 focus:ring-emerald-500 outline-none" placeholder="0.00"/>
                 </div>
              </div>

              {modalOperacion === 'MOVIMIENTO' && (
                <div>
                   <label className="text-xs font-bold text-slate-500 uppercase mb-1 block">Descripción breve</label>
                   <input type="text" value={formDesc} onChange={e=>setFormDesc(e.target.value)} className="w-full border rounded-lg px-4 py-2 text-sm focus:ring-2 outline-none" placeholder="Ej. Pago verdulería"/>
                </div>
              )}

              <button 
                onClick={modalOperacion === 'APERTURA' ? handleApertura : modalOperacion === 'CIERRE' ? handleCierre : handleMovimientoManual}
                disabled={procesando}
                className={`w-full py-3 rounded-lg font-bold text-white transition-opacity ${procesando?'opacity-50':''} ${modalOperacion==='CIERRE' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-emerald-600 hover:bg-emerald-700'}`}
              >
                {procesando ? 'Procesando...' : (modalOperacion === 'APERTURA' ? 'Abrir Caja Fija' : modalOperacion === 'CIERRE' ? 'Aplicar Cierre y Arqueo' : 'Registrar Movimiento')}
              </button>
            </div>
          </div>
        </div>
      )}


      {/* ================= MODAL COBRO (PANTALLA 2) ================= */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-900/60 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl overflow-hidden relative flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 border-b flex justify-between items-center bg-white">
              <h3 className="text-xl font-bold flex items-center gap-2"><CurrencyIcon/> Procesar Pago</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:bg-slate-100 p-1 rounded-full"><CloseIcon /></button>
            </div>
            
            <div className="px-6 py-6 overflow-y-auto flex-1 bg-slate-50">
              {pagoExitoso ? (
                <div className="flex flex-col items-center justify-center py-10 text-center animate-fade-in">
                  <div className="w-16 h-16 bg-green-100 text-green-500 rounded-full flex items-center justify-center mb-4"><CheckIcon /></div>
                  <h4 className="text-2xl font-black mb-2">Ingreso Auditado y Orden Cerrada</h4>
                  <div className="bg-white border p-6 rounded-xl w-full max-w-sm mb-6 text-left">
                     <div className="flex justify-between text-slate-500"><span>Cobro Total:</span> <span className="font-bold text-black">{formatearMoneda(pagoExitoso.total)}</span></div>
                     <div className="flex justify-between border-t border-dashed mt-3 pt-3"><span className="text-slate-500 font-bold">Cambio a dar:</span> <span className="font-black text-emerald-600">{formatearMoneda(pagoExitoso.cambio)}</span></div>
                  </div>
                  <button onClick={() => setIsModalOpen(false)} className="bg-slate-800 text-white font-bold py-2.5 px-8 rounded-lg">Cerrar</button>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Resumen */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-3">CONSUMO / TICKET - ORDEN #{ordenActiva?.id}</h4>
                    <div className="bg-white border rounded-xl overflow-hidden">
                      <div className="p-0 overflow-y-auto max-h-56">
                        <ul className="divide-y divide-slate-100">
                          {ordenActiva?.productos?.map((i, idx) => (
                            <li key={idx} className="p-3 text-sm flex justify-between items-center">
                              <span><span className="text-slate-400 mr-2">{i.cantidad}x</span>{i.nombre}</span>
                              <span className="font-bold">{formatearMoneda(i.subtotal)}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-slate-800 text-white p-4 flex justify-between items-center font-bold">
                        <span>Total:</span> <span className="text-xl">{formatearMoneda(ordenActiva?.total)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Pago */}
                  <div>
                    <h4 className="font-bold text-slate-800 text-xs mb-3">MÉTODO DE PAGO</h4>
                    {errorGlobal && <div className="mb-3 text-xs text-red-600 bg-red-50 p-2 rounded">{errorGlobal}</div>}
                    
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {['EFECTIVO', 'TARJETA', 'TRANSF.'].map(m => {
                        const originalM = m === 'TRANSF.' ? 'TRANSFERENCIA' : m;
                        return (
                          <button key={originalM} onClick={() => {setMetodoPago(originalM); setErrorGlobal('');}} className={`py-2 text-xs font-bold border rounded-lg ${metodoPago === originalM ? 'bg-emerald-50 border-emerald-500 text-emerald-800' : 'bg-white'}`}>
                            {m}
                          </button>
                        );
                      })}
                    </div>

                    {metodoPago === 'EFECTIVO' && (
                      <div className="bg-white p-4 rounded-xl border">
                        <label className="text-xs font-bold text-slate-600 mb-1 block">DINERO RECIBIDO</label>
                        <div className="relative mb-3">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">$</span>
                          <input type="number" value={montoRecibido} onChange={e=>setMontoRecibido(e.target.value)} className="w-full border rounded-lg pl-8 p-2 font-bold outline-none focus:border-emerald-500" />
                        </div>
                        <div className="flex justify-between items-center pt-3 border-t">
                          <span className="text-sm font-bold text-slate-500">Cambio:</span>
                          <span className="text-lg font-black text-emerald-600">{formatearMoneda((Number(montoRecibido)||0) - (ordenActiva?.total||0) > 0 ? (Number(montoRecibido)||0) - (ordenActiva?.total||0) : 0)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {!pagoExitoso && (
              <div className="px-6 py-4 border-t flex justify-end gap-3 bg-white">
                <button onClick={() => setIsModalOpen(false)} className="px-5 py-2 font-bold text-slate-500">Cancelar</button>
                <button onClick={handleProcesarPago} disabled={procesando} className="bg-emerald-600 text-white font-bold py-2 px-6 rounded-lg flex items-center gap-2">
                  {procesando ? 'Procesando...' : <><CheckIcon /> Cobrar (Impactar Caja)</>}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
