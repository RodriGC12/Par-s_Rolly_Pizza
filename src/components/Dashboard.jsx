import React, { useState, useEffect } from 'react';

// Iconos Minimalistas
const SalesIcon = () => (
  <svg className="w-8 h-8 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const OrdersIcon = () => (
  <svg className="w-8 h-8 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
  </svg>
);

const AlertIcon = () => (
  <svg className="w-8 h-8 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const ActivityIcon = () => (
  <svg className="w-8 h-8 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
  </svg>
);

export default function Dashboard() {
  const [stats, setStats] = useState({
    ventas_hoy: 0,
    ordenes_hoy: 0,
    ordenes_activas: 0,
    alerta_inventario: 0,
    ultimas_ordenes: [],
    ventas_semana: []
  });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3000/api/dashboard/stats');
      if (res.ok) {
        const data = await res.json();
        setStats(data);
      }
    } catch (error) {
      console.error("Error fetching dashboard stats", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 15000); // Polling cada 15 seg
    return () => clearInterval(interval);
  }, []);

  const formatearMoneda = (valor) => {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor || 0);
  };

  const formatearHoraSolo = (fechaString) => {
    if (!fechaString) return '--:--';
    const d = new Date(fechaString);
    return d.toLocaleTimeString('es-AR', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="w-full xl:max-w-[85rem] mx-auto animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-black text-slate-800 tracking-tight">Panorama General</h1>
        <p className="text-slate-500 mt-1 font-medium">Métricas clave y resumen interactivo al día de hoy</p>
      </div>

      {loading && stats.ordenes_hoy === 0 ? (
        <div className="flex justify-center items-center py-20">
          <div className="flex gap-2">
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></span>
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
            <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
          </div>
        </div>
      ) : (
        <>
          {/* Tarjetas Superiores */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><SalesIcon /></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-emerald-50 rounded-xl">
                  <SalesIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Ventas Hoy</p>
                  <p className="text-2xl font-black text-slate-800">{formatearMoneda(stats.ventas_hoy)}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><OrdersIcon /></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-blue-50 rounded-xl">
                  <OrdersIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Órdenes Hoy</p>
                  <p className="text-2xl font-black text-slate-800">{stats.ordenes_hoy}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><ActivityIcon /></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-indigo-50 rounded-xl">
                  <ActivityIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">En Curso</p>
                  <p className="text-2xl font-black text-slate-800">{stats.ordenes_activas}</p>
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col hover:shadow-md transition-shadow relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-10"><AlertIcon /></div>
              <div className="flex items-center gap-4 mb-2">
                <div className="p-3 bg-rose-50 rounded-xl">
                  <AlertIcon />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Stock Crítico</p>
                  <p className="text-2xl font-black text-rose-600">{stats.alerta_inventario} items</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfica Simple (Visualización de datos usando flex/bars) */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6">Tendencia de Ingresos (Últimos 7 días)</h3>
              
              <div className="flex-1 flex items-end gap-3 min-h-[250px] relative">
                {stats.ventas_semana && stats.ventas_semana.length > 0 ? (
                  <>
                    {/* Y Axis Guide Lines */}
                    <div className="absolute inset-0 flex flex-col justify-between z-0">
                      <div className="w-full border-b border-dashed border-slate-200"></div>
                      <div className="w-full border-b border-dashed border-slate-200"></div>
                      <div className="w-full border-b border-dashed border-slate-200"></div>
                      <div className="w-full border-b border-slate-200"></div>
                    </div>

                    {/* Bars */}
                    <div className="w-full flex items-end justify-between z-10 space-x-2 pt-4">
                      {(() => {
                        const maxVal = Math.max(...stats.ventas_semana.map(v => v.total), 1);
                        return stats.ventas_semana.map((dia, idx) => {
                          const altura = (dia.total / maxVal) * 100;
                          const fechaObj = new Date(dia.fecha);
                          return (
                            <div key={idx} className="flex flex-col items-center flex-1 group">
                              <div className="w-full flex relative justify-center">
                                <div 
                                  className="w-[80%] max-w-[40px] bg-indigo-500 rounded-t-lg group-hover:bg-indigo-600 transition-colors cursor-pointer relative"
                                  style={{ height: `${altura === 0 ? 1 : altura}%`, minHeight: '10px' }}
                                >
                                  {/* Tooltip */}
                                  <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs font-bold py-1 px-2 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-20">
                                    {formatearMoneda(dia.total)}
                                  </div>
                                </div>
                              </div>
                              <span className="text-xs text-slate-400 font-medium mt-3">
                                {fechaObj.toLocaleDateString('es-AR', { weekday: 'short' })}
                              </span>
                            </div>
                          );
                        });
                      })()}
                    </div>
                  </>
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-slate-400">
                    <span className="text-4xl mb-2">📊</span>
                    Aún no hay suficientes datos de ventas.
                  </div>
                )}
              </div>
            </div>

            {/* Lista de Órdenes Recientes */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-6 flex flex-col">
              <h3 className="text-lg font-bold text-slate-800 mb-6 flex justify-between items-center">
                Últimas Órdenes
                <span className="text-xs text-indigo-500 bg-indigo-50 px-2 py-1 rounded-full">{stats.ultimas_ordenes?.length || 0}</span>
              </h3>
              
              <div className="flex-1 overflow-y-auto pr-1 space-y-3">
                {stats.ultimas_ordenes && stats.ultimas_ordenes.length > 0 ? (
                  stats.ultimas_ordenes.map(orden => (
                    <div key={orden.idorden} className="flex items-center justify-between p-3 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100 transition-colors">
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-slate-800">Orden #{orden.idorden}</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <ActivityIcon className="w-3 h-3" /> {formatearHoraSolo(orden.fecha)}
                        </span>
                      </div>
                      <div>
                        {orden.estado === 'pendiente' && <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2.5 py-1 rounded-lg">Pendiente</span>}
                        {orden.estado === 'preparacion' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">Cocina</span>}
                        {orden.estado === 'lista' && <span className="bg-emerald-100 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-lg">Lista</span>}
                        {orden.estado === 'entregada' && <span className="bg-slate-200 text-slate-600 text-xs font-bold px-2.5 py-1 rounded-lg">Entregada</span>}
                        {orden.estado === 'pagada' && <span className="bg-blue-100 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-lg">Pagada</span>}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-slate-400 text-sm">
                    No hay órdenes registradas.
                  </div>
                )}
              </div>
            </div>
            
          </div>
        </>
      )}
    </div>
  );
}
