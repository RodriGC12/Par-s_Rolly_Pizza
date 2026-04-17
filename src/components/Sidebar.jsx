import React from 'react';
import { LayoutDashboard, Package, Calculator, ClipboardList, ChefHat, Users, LogOut } from 'lucide-react';

const MENU_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['admin'] },
  { id: 'inventario', label: 'Inventario', icon: Package, roles: ['admin', 'cajero', 'mesero'] },
  { id: 'caja', label: 'Caja', icon: Calculator, roles: ['admin', 'cajero'] },
  { id: 'ordenes', label: 'Órdenes', icon: ClipboardList, roles: ['admin', 'cajero', 'mesero'] },
  { id: 'cocina', label: 'Cocina', icon: ChefHat, roles: ['admin', 'cocinero'] },
  { id: 'usuarios', label: 'Usuarios', icon: Users, roles: ['admin'] },
];

export default function Sidebar({ activeView, setActiveView, user, onLogout }) {
  const userRol = (user?.rol || '').toLowerCase();
  
  // Filter menu items based on exact role matching. Admin sees everything.
  const allowedItems = MENU_ITEMS.filter(item => item.roles.includes(userRol));

  const getInitials = (name, surname) => {
    return `${(name || 'U').charAt(0)}${(surname || '').charAt(0)}`.toUpperCase();
  };

  return (
    <div className="w-64 h-full bg-slate-900 text-white flex flex-col">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-orange-500">Paris Rolly Pizza</h1>
      </div>
      
      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        {allowedItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          
          return (
            <button
              key={item.id}
              onClick={() => setActiveView(item.id)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors cursor-pointer ${
                isActive 
                  ? 'bg-orange-500 text-white shadow-md' 
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
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-orange-400">
              <span className="text-sm font-bold">{getInitials(user?.nombre, user?.apellido)}</span>
            </div>
            <div>
              <p className="text-sm font-bold truncate max-w-[100px]">{user?.nombre} {user?.apellido}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.rol}</p>
            </div>
          </div>
          <button 
            onClick={onLogout}
            title="Cerrar Sesión"
            className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-800 rounded-md transition-colors"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
