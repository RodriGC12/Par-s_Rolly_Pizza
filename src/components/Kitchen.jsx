import React, { useState, useEffect } from 'react';

const ClockIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const CheckIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);

const PlayIcon = () => (
  <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

export default function Kitchen() {
  const [orders, setOrders] = useState([]);
  const [cargando, setCargando] = useState(true);
  const [currentTime, setCurrentTime] = useState(new Date());

  const fetchKitchenOrders = async () => {
    try {
      const response = await fetch('http://localhost:3000/kitchen/orders');
      if (!response.ok) throw new Error("Fallo en petición");
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error("Error al cargar órdenes de cocina:", error);
    } finally {
      if (cargando) setCargando((prev) => false);
    }
  };

  useEffect(() => {
    fetchKitchenOrders();
    // Polling every 5 seconds
    const interval = setInterval(() => {
      fetchKitchenOrders();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  // Update current time every minute to refresh "time elapsed"
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);
    return () => clearInterval(timeInterval);
  }, []);

  const handleUpdateItemStatus = async (iddetalle, newStatus) => {
    try {
      const response = await fetch(`http://localhost:3000/kitchen/items/${iddetalle}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ estado: newStatus })
      });
      if (!response.ok) throw new Error('Error actualizando ítem');
      
      // Inmediatamente despues actualizamos
      fetchKitchenOrders();
    } catch (error) {
      console.error("Error actualizando ítem:", error);
      alert("Hubo un error al actualizar el estado del ítem.");
    }
  };

  const calcularTiempoTranscurrido = (fecha) => {
    if (!fecha) return '0 min';
    const diff = Math.floor((currentTime - new Date(fecha)) / 60000); // minutos
    if (diff < 0) return '0 min';
    if (diff > 60) {
      const h = Math.floor(diff / 60);
      const m = diff % 60;
      return `${h}h ${m}m`;
    }
    return `${diff} min`;
  };

  const getItemStateColor = (estado) => {
    switch(estado) {
      case 'pendiente': return 'bg-orange-50 border-orange-200';
      case 'preparacion': return 'bg-blue-50 border-blue-200';
      case 'lista': return 'bg-green-50 border-green-200 opacity-60';
      default: return 'bg-gray-50 border-gray-200';
    }
  };

  return (
    <div className="w-full xl:max-w-[100rem] mx-auto p-2 animate-fade-in h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Monitor de Cocina</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Pedidos listados por orden de llegada (FIFO)</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold border border-blue-100 shadow-sm">
           <span className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></span>
           Sincronización Activa
        </div>
      </div>

      {cargando && orders.length === 0 ? (
        <div className="flex justify-center items-center py-20 flex-1">
          <div className="flex justify-center items-center gap-2">
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-slate-400 rounded-full animate-bounce delay-150"></span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="flex-1 flex items-center justify-center bg-white rounded-xl shadow-sm border border-gray-200 p-12 text-center h-full">
           <div>
             <div className="text-6xl mb-4 opacity-50">👨‍🍳</div>
             <p className="text-slate-500 font-medium text-lg">No hay órdenes pendientes en cocina.</p>
           </div>
        </div>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-4 flex-1 items-start snap-x">
          {orders.map((orden) => (
            <div key={orden.idorden} className="bg-white rounded-xl shadow-md border border-slate-200 min-w-[320px] max-w-[320px] flex flex-col max-h-full overflow-hidden snap-start shrink-0">
              {/* Header */}
              <div className={`px-4 py-3 border-b flex justify-between items-center shrink-0 ${orden.estado === 'preparacion' ? 'bg-blue-600 text-white' : 'bg-orange-500 text-white'}`}>
                <div>
                  <div className="font-bold text-lg leading-tight">Mesa {orden.mesa || '--'}</div>
                  <div className="text-xs font-medium opacity-80 uppercase tracking-widest">{orden.estado}</div>
                </div>
                <div className="text-right">
                  <div className="font-black text-xl">#{orden.idorden}</div>
                  <div className="text-xs font-semibold flex items-center gap-1 justify-end mt-1 bg-black/20 px-2 py-0.5 rounded-full">
                    <ClockIcon /> {calcularTiempoTranscurrido(orden.fecha)}
                  </div>
                </div>
              </div>

              {/* Items List */}
              <div className="flex-1 overflow-y-auto p-3 space-y-3 bg-slate-50">
                {orden.detalles && orden.detalles.length > 0 ? (
                  orden.detalles.map((item) => (
                    <div key={item.iddetalle} className={`p-3 rounded-lg border shadow-sm ${getItemStateColor(item.estado)}`}>
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-bold text-slate-800 flex-1">
                          <span className="text-orange-600 mr-1">{item.cantidad}x</span> 
                          {item.nombre}
                        </div>
                      </div>
                      
                      {item.nota && item.nota.trim() !== '' && (
                        <div className="text-xs bg-yellow-100 text-yellow-800 p-2 rounded mb-2 border border-yellow-200 italic font-medium">
                          " {item.nota} "
                        </div>
                      )}

                      <div className="mt-2 flex gap-2">
                        {item.estado === 'pendiente' && (
                          <button 
                            onClick={() => handleUpdateItemStatus(item.iddetalle, 'preparacion')}
                            className="flex-1 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                          >
                            <PlayIcon /> Empezar
                          </button>
                        )}
                        
                        {item.estado === 'preparacion' && (
                          <button 
                            onClick={() => handleUpdateItemStatus(item.iddetalle, 'lista')}
                            className="flex-1 bg-green-500 hover:bg-green-600 text-white text-xs font-bold py-1.5 px-2 rounded flex items-center justify-center gap-1 transition-colors"
                          >
                            <CheckIcon /> Listo
                          </button>
                        )}

                        {item.estado === 'lista' && (
                          <div className="flex-1 text-center py-1.5 px-2 text-xs font-bold text-green-700 bg-green-100 rounded border border-green-200">
                            Completado
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-center text-slate-400 my-4">No hay ítems</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
