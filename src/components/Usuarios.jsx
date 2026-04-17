import React, { useState, useEffect } from 'react';

const EditIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);

const UserIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const TrashIcon = () => (
  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

export default function Usuarios() {
  const [usuarios, setUsuarios] = useState([]);
  const [cargando, setCargando] = useState(true);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [errorSubmit, setErrorSubmit] = useState('');

  // Form State
  const [formData, setFormData] = useState({
    id: null,
    nombre: '',
    apellido: '',
    correo: '',
    contrasena: '',
    rol: 'cajero',
    activo: true
  });

  const fetchUsuarios = async () => {
    try {
      setCargando(true);
      const res = await fetch('http://localhost:3000/api/usuarios');
      if (res.ok) {
        const data = await res.json();
        setUsuarios(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  const handleOpenModal = (user = null) => {
    setErrorSubmit('');
    if (user) {
      setEditando(true);
      setFormData({
        id: user.id,
        nombre: user.nombre || '',
        apellido: user.apellido || '',
        correo: user.correo || '',
        contrasena: '', // No mostrar en edit, dejar vacio para no cambiar
        rol: user.rol || 'cajero',
        activo: user.activo !== false
      });
    } else {
      setEditando(false);
      setFormData({
        id: null,
        nombre: '',
        apellido: '',
        correo: '',
        contrasena: '',
        rol: 'cajero',
        activo: true
      });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGuardando(true);
    setErrorSubmit('');

    if (!formData.nombre || !formData.correo) {
      setErrorSubmit('Nombre y Correo son obligatorios.');
      setGuardando(false);
      return;
    }
    if (!editando && !formData.contrasena) {
      setErrorSubmit('La contraseña es obligatoria para nuevos usuarios.');
      setGuardando(false);
      return;
    }

    try {
      const url = editando 
        ? `http://localhost:3000/api/usuarios/${formData.id}`
        : 'http://localhost:3000/api/usuarios';
      
      const method = editando ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Error al guardar el usuario');
      }

      setIsModalOpen(false);
      fetchUsuarios();
    } catch (error) {
      setErrorSubmit(error.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleToggleEstado = async (id, estadoActual) => {
    if (!window.confirm(`¿Seguro que deseas ${estadoActual ? 'desactivar' : 'activar'} esta cuenta?`)) return;
    
    try {
      await fetch(`http://localhost:3000/api/usuarios/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ activo: !estadoActual }) // Mandar los minimos campos u obligar update simple. En la API lo soporta.
      });
      fetchUsuarios();
    } catch (e) {
      console.error(e);
    }
  };

  const formatearFecha = (fecha) => {
    if(!fecha) return '-';
    return new Date(fecha).toLocaleDateString('es-AR');
  };

  return (
    <div className="w-full xl:max-w-[85rem] mx-auto animate-fade-in p-2 sm:p-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">Gestión de Usuarios</h1>
          <p className="text-slate-500 mt-1 font-medium text-sm">Administra los permisos y accesos del personal al sistema</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2 px-4 rounded-lg shadow-sm cursor-pointer transition-colors flex items-center gap-2"
        >
          <UserIcon />
          <span>Nuevo Empleado</span>
        </button>
      </div>

      {/* Tabla de Usuarios */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 text-slate-500 text-sm font-semibold border-b border-slate-200 uppercase tracking-wider">
                <th className="py-4 px-6">Usuario</th>
                <th className="py-4 px-6">Rol</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Suscrito</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {cargando ? (
                <tr>
                  <td colSpan="5" className="py-20 text-center">
                    <div className="flex justify-center flex-col items-center gap-3">
                      <div className="flex gap-2">
                        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-75"></span>
                        <span className="w-3 h-3 bg-indigo-500 rounded-full animate-bounce delay-150"></span>
                      </div>
                      <p className="text-slate-400 font-medium">Buscando nómina...</p>
                    </div>
                  </td>
                </tr>
              ) : usuarios.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-400 font-medium text-lg">
                    No existen usuarios registrados. (Raro)
                  </td>
                </tr>
              ) : (
                usuarios.map(u => (
                  <tr key={u.id} className="hover:bg-slate-50 transition-colors group">
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                         <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-lg">
                           {(u.nombre || 'U')[0].toUpperCase()}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-slate-800">{u.nombre} {u.apellido}</p>
                           <p className="text-xs text-slate-500">{u.correo}</p>
                         </div>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-md font-semibold tracking-wide text-xs uppercase border border-slate-200">
                        {u.rol || 'N/A'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-sm">
                      {u.activo ? (
                        <span className="flex items-center gap-1.5 text-emerald-600 font-medium bg-emerald-50 w-fit px-2 py-0.5 rounded-full border border-emerald-100">
                           <span className="w-2 h-2 rounded-full bg-emerald-500"></span> Activo
                        </span>
                      ) : (
                        <span className="flex items-center gap-1.5 text-rose-500 font-medium bg-rose-50 w-fit px-2 py-0.5 rounded-full border border-rose-100">
                           <span className="w-2 h-2 rounded-full bg-rose-400"></span> Inactivo
                        </span>
                      )}
                    </td>
                    <td className="py-4 px-6 text-sm text-slate-500 font-medium">
                      {formatearFecha(u.fecha)}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button 
                          onClick={() => handleOpenModal(u)}
                          className="p-1.5 text-blue-500 hover:bg-blue-50 rounded-md transition-colors"
                          title="Editar usuario"
                        >
                          <EditIcon />
                        </button>
                        <button 
                          onClick={() => handleToggleEstado(u.id, u.activo)}
                          className="p-1.5 text-rose-400 hover:bg-rose-50 hover:text-rose-600 rounded-md transition-colors"
                          title={u.activo ? 'Desactivar cuenta' : 'Activar cuenta'}
                        >
                          <TrashIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal CRUD */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900 bg-opacity-60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
            
            <div className="px-6 py-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center relative">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <h3 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                <UserIcon /> {editando ? 'Editar Empleado' : 'Nuevo Empleado'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600 text-2xl leading-none">&times;</button>
            </div>
            
            <form onSubmit={handleSubmit} className="px-6 py-6 overflow-y-auto">
              {errorSubmit && (
                <div className="mb-5 p-3 text-sm text-rose-700 bg-rose-50 rounded-lg border border-rose-200">
                  {errorSubmit}
                </div>
              )}
              
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Nombre *</label>
                    <input 
                      type="text" 
                      name="nombre"
                      value={formData.nombre}
                      onChange={handleChange}
                      autoFocus
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Apellido</label>
                    <input 
                      type="text" 
                      name="apellido"
                      value={formData.apellido}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">Correo Electrónico *</label>
                  <input 
                    type="email" 
                    name="correo"
                    value={formData.correo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1">
                    Contraseña {editando && <span className="text-slate-400 text-xs font-normal">(Dejar en blanco para no cambiar)</span>} {!editando && '*'}
                  </label>
                  <input 
                    type="password" 
                    name="contrasena"
                    value={formData.contrasena}
                    onChange={handleChange}
                    placeholder={editando ? '••••••••' : ''}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1">Asignar Rol</label>
                    <select 
                      name="rol"
                      value={formData.rol}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all bg-white"
                    >
                      <option value="admin">Administrador</option>
                      <option value="cajero">Cajero</option>
                      <option value="mesero">Mesero</option>
                      <option value="cocinero">Cocinero</option>
                    </select>
                  </div>
                  
                  {editando && (
                    <div className="flex items-center pt-6">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox"
                          name="activo"
                          checked={formData.activo}
                          onChange={handleChange}
                          className="w-4 h-4 text-indigo-600 border-slate-300 rounded focus:ring-indigo-500"
                        />
                        <span className="text-sm font-semibold text-slate-700">Cuenta Activa</span>
                      </label>
                    </div>
                  )}
                </div>

              </div>
              
              <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancelar
                </button>
                <button 
                  type="submit" 
                  disabled={guardando}
                  className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium rounded-lg shadow-sm transition-colors flex items-center justify-center min-w-[120px] disabled:opacity-50"
                >
                  {guardando ? 'Guardando...' : 'Guardar Cuenta'}
                </button>
              </div>
            </form>
          </div>
          
          <div className="absolute inset-0 z-0" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}
    </div>
  );
}
