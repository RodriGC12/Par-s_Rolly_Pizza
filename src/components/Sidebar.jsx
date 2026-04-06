import React from 'react';
import { LayoutDashboard, Package, Calculator, ClipboardList, ChefHat, Users } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventario', label: 'Inventario', icon: Package },
  { id: 'caja', label: 'Caja', icon: Calculator },
  { id: 'ordenes', label: 'Órdenes', icon: ClipboardList },
  { id: 'cocina', label: 'Cocina', icon: ChefHat },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
];

export default function Sidebar({ activeView, setActiveView }) {
  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-500">Paris Rolly Pizza</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2">
        {MENU_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-orange-500 text-white' 
                  : 'text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center">
            <span className="text-sm font-medium">AD</span>
          </div>
          <div>
            <p className="text-sm font-medium">Admin</p>
            <p className="text-xs text-slate-400">Panel de control</p>
          </div>
        </div>
      </div>
    </div>
  );
}
