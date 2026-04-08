import React, { useState, useEffect } from 'react';

const ClockIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const UndoIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
  </svg>
);

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [cargando, setCargando] = useState(true);

  // States for Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [productosDisponibles, setProductosDisponibles] = useState([]);
  const [carrito, setCarrito] = useState([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState('');
  const [productoSeleccionado, setProductoSeleccionado] = useState('');
  const [cantidadSeleccionada, setCantidadSeleccionada] = useState(1);
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');

  const fetchOrders = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:3000/orders');
      if (!response.ok) throw new Error("Fallo en petición");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar órdenes:", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchOrders();
    // Podremos meter un polling aquí si hace falta.
    const interval = setInterval(() => {
      fetchOrders();
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      if (!response.ok) throw new Error('Error actualizando estado');
      
      fetchOrders();
    } catch (error) {
      console.error("Error actualizando la orden:", error);
      alert("Hubo un error al actualizar la orden.");
    }
  };

  const handleRevertStatus = async (id) => {
    try {
      const response = await fetch(`http://localhost:3000/orders/${id}/revert-status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' }
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Error retrocediendo estado');
      }
      
      fetchOrders();
    } catch (error) {
      console.error("Error retrocediendo la orden:", error);
      alert(error.message || "Hubo un error al retroceder la orden.");
    }
  };

  const fetchProductos = async () => {
    try {
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) throw new Error("Fallo en petición");
      const data = await response.json();
      setProductosDisponibles(data);
    } catch (error) {
      console.error("Error al cargar productos:", error);
    }
  };

  const handleOpenModal = () => {
    setIsModalOpen(true);
    setErrorMensaje('');
    setCarrito([]);
    setMesaSeleccionada('');
    fetchProductos();
  };

  const handleAgregarAlCarrito = () => {
    if (!productoSeleccionado) {
      setErrorMensaje('Selecciona un producto');
      return;
    }
    const cant = parseInt(cantidadSeleccionada, 10);
    if (!cant || cant <= 0) {
      setErrorMensaje('Cantidad inválida');
      return;
    }

    const prodInfo = productosDisponibles.find(p => (p.idproducto || p.id).toString() === productoSeleccionado.toString());
    if (!prodInfo) return;

    const existe = carrito.find(item => item.idProducto.toString() === productoSeleccionado.toString());
    if (existe) {
      setCarrito(carrito.map(item => 
        item.idProducto.toString() === productoSeleccionado.toString() 
        ? { ...item, cantidad: item.cantidad + cant }
        : item
      ));
    } else {
      setCarrito([...carrito, {
        idProducto: prodInfo.idproducto || prodInfo.id,
        nombre: prodInfo.nombre,
        precio: parseFloat(prodInfo.precio || 0),
        cantidad: cant
      }]);
    }
    
    setErrorMensaje('');
    setProductoSeleccionado('');
    setCantidadSeleccionada(1);
  };

  const handleEliminarDelCarrito = (id) => {
    setCarrito(carrito.filter(item => item.idProducto.toString() !== id.toString()));
  };

  const totalCarrito = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

  const handleSubmitOrden = async () => {
    if (!mesaSeleccionada) {
      setErrorMensaje('Por favor, indica un número de mesa');
      return;
    }
    if (carrito.length === 0) {
      setErrorMensaje('El carrito está vacío');
      return;
    }

    setGuardando(true);
    setErrorMensaje('');
    
    try {
      const payload = {
        idMesa: parseInt(mesaSeleccionada, 10),
        idUsuario: 1, 
        idCliente: 1, 
        productos: carrito.map(c => ({ idProducto: c.idProducto, cantidad: c.cantidad }))
      };

      const response = await fetch('http://localhost:3000/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) throw new Error('Error creando orden');
      
      setIsModalOpen(false);
      fetchOrders(); 
    } catch (error) {
      console.error(error);
      setErrorMensaje('Hubo un problema al crear la orden. Intenta nuevamente.');
    } finally {
      setGuardando(false);
    }
  };

  // Utils para estilo y formato
  const getStatusColor = (estado) => {
    switch (estado) {
      case 'pendiente': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'preparacion': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'lista': return 'bg-green-100 text-green-800 border-green-200';
      case 'entregada': return 'bg-gray-100 text-gray-600 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusLabel = (estado) => {
    switch (estado) {
      case 'pendiente': return 'Pendiente';
      case 'preparacion': return 'En Preparación';
      case 'lista': return 'Lista para Servir';
      case 'entregada': return 'Entregada';
      default: return estado;
    }
  };

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor || 0);
  };

  const formatearHora = (fechaString) => {
    if (!fechaString) return '--:--';
    const d = new Date(fechaString);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full xl:max-w-[85rem] mx-auto p-2 sm:p-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Órdenes Activas</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Gestiona y administra los pedidos actuales</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleOpenModal}
            className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer transition-colors"
          >
            + Nueva Orden
          </button>
        </div>
      </div>

      {cargando && orders.length === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex justify-center items-center gap-2">
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-150"></span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center">
          <p className="text-slate-500 font-medium text-lg">No hay órdenes en este momento.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {orders.map((orden) => {
            // Suponemos que detalles viene como array o string.
            // Si el backend lo devuelve como string, lo intentamos parsear. Depende de cómo lo devuelva Postgres.
            let items = [];
            if (Array.isArray(orden.detalles)) {
              items = orden.detalles;
            } else if (typeof orden.detalles === 'string') {
              try { items = JSON.parse(orden.detalles); } catch(e) { console.error("Error parseando detalles"); }
            }

            return (
              <div key={orden.id || orden.idorden} className={`bg-white rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-shadow flex flex-col h-full ${orden.estado === 'entregada' ? 'opacity-60' : 'border-slate-200'}`}>
                {/* Cabecera Card */}
                <div className={`px-5 py-4 border-b flex justify-between items-center ${getStatusColor(orden.estado)} border-opacity-50`}>
                  <div className="font-bold text-lg">Mesa {orden.mesa_id || '--'}</div>
                  <div className="text-sm font-semibold tracking-wide uppercase">
                    {getStatusLabel(orden.estado)}
                  </div>
                </div>
                
                {/* Cuerpo Card */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex justify-between items-center mb-4 text-sm text-gray-500">
                    <span className="font-medium text-gray-900">Ord. #{orden.id || orden.idorden}</span>
                    <span className="flex items-center gap-1"><ClockIcon /> {formatearHora(orden.fecha || orden.fecha_creacion)}</span>
                  </div>
                  
                  {orden.cliente && (
                    <div className="mb-3 pb-3 border-b border-gray-100 text-sm">
                      <span className="text-gray-500">Cliente:</span> <span className="font-medium text-gray-800">{orden.cliente}</span>
                    </div>
                  )}

                  <div className="flex-1 overflow-y-auto mb-4">
                    <ul className="space-y-2">
                      {items.length > 0 ? items.map((item, idx) => (
                        <li key={idx} className="flex justify-between text-sm py-1 border-b border-gray-50 last:border-0">
                          <span className="text-gray-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis mr-2 flex-1">
                            {item.cantidad}x {item.nombre || item.producto}
                          </span>
                        </li>
                      )) : (
                        <span className="text-xs text-gray-400 italic">No hay detalles disponibles</span>
                      )}
                    </ul>
                  </div>

                  <div className="mt-auto">
                    <div className="flex justify-between items-center pt-3 border-t border-gray-100">
                      <span className="text-gray-500 font-medium">Total</span>
                      <span className="text-xl font-black text-gray-900">{formatearMoneda(orden.total || orden.precio_total)}</span>
                    </div>
                  </div>
                </div>

                {/* Footer/Botones Acciones */}
                <div className="px-5 py-4 bg-gray-50 border-t border-gray-100">
                  {orden.estado === 'pendiente' && (
                    <button 
                      onClick={() => handleUpdateStatus(orden.id || orden.idorden, 'preparacion')}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                    >
                      <span>Iniciar Preparación</span>
                    </button>
                  )}

                  {orden.estado === 'preparacion' && (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(orden.id || orden.idorden, 'lista')}
                        className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                      >
                        <CheckIcon />
                        <span>Marcar Lista</span>
                      </button>
                      <button 
                        onClick={() => handleRevertStatus(orden.id || orden.idorden)}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm"
                      >
                        <UndoIcon />
                        <span>Retroceder estado</span>
                      </button>
                    </div>
                  )}

                  {orden.estado === 'lista' && (
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => handleUpdateStatus(orden.id || orden.idorden, 'entregada')}
                        className="w-full bg-slate-800 hover:bg-slate-900 text-white font-semibold py-2.5 rounded-lg transition-colors flex justify-center items-center gap-2"
                      >
                        <span>Entregar</span>
                      </button>
                      <button 
                        onClick={() => handleRevertStatus(orden.id || orden.idorden)}
                        className="w-full bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 font-medium py-2 rounded-lg transition-colors flex justify-center items-center gap-2 text-sm"
                      >
                        <UndoIcon />
                        <span>Retroceder estado</span>
                      </button>
                    </div>
                  )}

                  {orden.estado === 'entregada' && (
                    <div className="w-full text-center py-2 text-sm text-gray-500 font-medium italic">
                      Orden finalizada
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Nueva Orden */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <h3 className="text-xl font-bold text-gray-900">Crear Nueva Orden</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none p-1 rounded-full hover:bg-gray-100 transition-colors">
                <CloseIcon />
              </button>
            </div>
            
            <div className="px-6 py-6 overflow-y-auto flex-1 bg-gray-50/50">
              {errorMensaje && (
                <div className="mb-6 py-3 px-4 text-sm text-red-600 bg-red-50 rounded-lg border border-red-100 font-medium tracking-wide shadow-sm">
                  {errorMensaje}
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Panel Izquierdo: Formularios */}
                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Número de Mesa <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      value={mesaSeleccionada}
                      onChange={(e) => setMesaSeleccionada(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                      placeholder="Ej. 5"
                    />
                  </div>

                  <div className="p-4 bg-white rounded-xl border border-gray-200 shadow-sm space-y-4">
                    <h4 className="font-bold text-gray-800 text-sm uppercase tracking-wide border-b pb-2">Agregar Producto</h4>
                    
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Producto</label>
                      <select 
                        value={productoSeleccionado}
                        onChange={(e) => setProductoSeleccionado(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-gray-50 focus:bg-white"
                      >
                        <option value="">Selecciona producto...</option>
                        {productosDisponibles.map(p => (
                          <option key={p.idproducto || p.id} value={p.idproducto || p.id}>
                            {p.nombre} - {formatearMoneda(p.precio)}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="flex gap-3 items-end">
                      <div className="flex-1">
                        <label className="block text-xs font-semibold text-gray-600 mb-1">Cantidad</label>
                        <input 
                          type="number" 
                          min="1"
                          value={cantidadSeleccionada}
                          onChange={(e) => setCantidadSeleccionada(e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none bg-gray-50 focus:bg-white"
                        />
                      </div>
                      <button 
                        type="button"
                        onClick={handleAgregarAlCarrito}
                        className="bg-gray-800 hover:bg-gray-900 text-white px-4 py-2 text-sm font-semibold rounded-lg transition-colors shadow-sm"
                      >
                        Agregar
                      </button>
                    </div>
                  </div>
                </div>

                {/* Panel Derecho: Carrito */}
                <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden flex flex-col">
                  <div className="bg-gray-100 px-4 py-3 border-b border-gray-200">
                    <h4 className="font-bold text-gray-800 text-sm flex justify-between items-center">
                      Resumen de Orden
                      <span className="bg-gray-200 text-gray-600 px-2 py-0.5 rounded-full text-xs">{carrito.length} items</span>
                    </h4>
                  </div>
                  
                  <div className="p-0 flex-1 overflow-y-auto min-h-[200px]">
                    {carrito.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full opacity-50 p-6 text-center">
                         <span className="text-3xl mb-2">🛒</span>
                         <p className="text-sm font-medium">No hay productos agregados</p>
                      </div>
                    ) : (
                      <ul className="divide-y divide-gray-100">
                        {carrito.map(item => (
                          <li key={item.idProducto} className="p-4 flex justify-between items-center hover:bg-slate-50 transition-colors">
                            <div className="flex-1">
                              <p className="text-sm font-bold text-gray-800">{item.nombre}</p>
                              <p className="text-xs text-gray-500">{item.cantidad} x {formatearMoneda(item.precio)}</p>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="font-black text-sm text-gray-900">{formatearMoneda(item.cantidad * item.precio)}</span>
                              <button 
                                onClick={() => handleEliminarDelCarrito(item.idProducto)}
                                className="text-red-400 hover:text-red-600 hover:bg-red-50 p-1.5 rounded-md transition-colors"
                              >
                                <TrashIcon />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>

                  <div className="bg-gray-50 border-t border-gray-200 p-4">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm font-semibold text-gray-500">Total calculado:</span>
                      <span className="text-lg font-black text-orange-600">{formatearMoneda(totalCarrito)}</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

            <div className="px-6 py-4 bg-white border-t border-gray-100 flex justify-end gap-3 rounded-b-xl sticky bottom-0">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button 
                onClick={handleSubmitOrden}
                disabled={guardando || carrito.length === 0}
                className="px-6 py-2.5 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors disabled:opacity-50 shadow-sm flex items-center justify-center min-w-[160px]"
              >
                {guardando ? (
                   <div className="flex items-center gap-2">
                     <span className="w-4 h-4 rounded-full border-2 border-t-white border-r-white border-b-white border-l-transparent animate-spin"></span>
                     Guardando...
                   </div>
                ) : 'Confirmar Orden'}
              </button>
            </div>

          </div>
          {/* Clickeable para cerrar atrás */}
          <div className="absolute inset-0 z-0" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
