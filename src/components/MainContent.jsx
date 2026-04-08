import React from 'react';
import Inventario from './Inventario';
import Orders from './Orders';
import Kitchen from './Kitchen';
import Caja from './Caja';

// A simple dictionary to map view IDs to display titles
const VIEW_TITLES = {
  dashboard: 'Dashboard Principal',
  inventario: 'Gestión de Inventario',
  caja: 'Caja y Transacciones',
  ordenes: 'Órdenes Activas',
  cocina: 'Monitor de Cocina',
  usuarios: 'Administración de Usuarios'
};

export default function MainContent({ activeView }) {
  const currentTitle = VIEW_TITLES[activeView] || 'Vista Desconocida';

  return (
    <div className="flex-1 bg-slate-50 h-full overflow-y-auto w-full">
      <header className="bg-white border-b border-slate-200 px-8 py-5">
        <h2 className="text-2xl font-semibold text-slate-800">{currentTitle}</h2>
      </header>
      
      <main className="p-8 h-[calc(100vh-5rem)]">
        {activeView === 'inventario' ? (
          <Inventario />
        ) : activeView === 'ordenes' ? (
          <Orders />
        ) : activeView === 'cocina' ? (
          <Kitchen />
        ) : activeView === 'caja' ? (
          <Caja />
        ) : (
          <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 min-h-[calc(100vh-12rem)] flex flex-col items-center justify-center">
            <div className="text-center text-slate-400">
              <div className="w-16 h-16 rounded-full bg-slate-50 border-2 border-dashed border-slate-200 flex items-center justify-center mx-auto mb-4">
                 <span className="text-2xl">🍕</span>
              </div>
              <p className="text-xl font-medium text-slate-600 mb-2">Contenido de {currentTitle}</p>
              <p className="text-sm">Esta sección es un placeholder para el dashboard base.</p>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
