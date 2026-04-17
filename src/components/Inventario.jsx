import React, { useState, useEffect } from 'react';

// Iconos SVG 
const SearchIcon = () => (
  <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
  </svg>
);
const EditIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
  </svg>
);
const TrashIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);
const AlertIcon = () => (
  <svg className="w-4 h-4 inline-block mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);
const CloseIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

export default function Inventario() {
  const [productos, setProductos] = useState([]);
  const [cargando, setCargando] = useState(true);
  
  // Estado para Modal Formulario (Crear/Editar)
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editandoId, setEditandoId] = useState(null);
  const [guardando, setGuardando] = useState(false);
  const [errorMensaje, setErrorMensaje] = useState('');
  const [form, setForm] = useState({
    nombre: '',
    precio: '',
    categoria: '',
    unidad_medida: '',
    cantidad: '',
    stock_minimo: '',
    fecha_vencimiento: ''
  });

  // Estado para Modal Confirmar Eliminar
  const [productoEliminar, setProductoEliminar] = useState(null);
  const [eliminando, setEliminando] = useState(false);

  // Estado para búsqueda
  const [busqueda, setBusqueda] = useState('');


  // ======= CONEXIÓN REAL AL BACKEND =======
  const fetchProductos = async () => {
    try {
      setCargando(true);
      const response = await fetch('http://localhost:3000/products');
      if (!response.ok) throw new Error("Fallo en peticion");
      const data = await response.json();
      setProductos(data);
    } catch (error) {
      console.error("Error al cargar productos", error);
    } finally {
      setCargando(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  // DELETE Handlers
  const handleConfirmDelete = async () => {
    if (!productoEliminar) return;
    setEliminando(true);
    try {
      const id = productoEliminar.idproducto || productoEliminar.id;
      const response = await fetch(`http://localhost:3000/products/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProductoEliminar(null);
        fetchProductos(); // Actualizar lista
      } else {
        alert("Hubo un error al intentar eliminar el producto.");
      }
    } catch (error) {
      console.error("Error eliminando:", error);
    } finally {
      setEliminando(false);
    }
  };

  // POST/PUT Handlers
  const handleOpenModal = (producto = null) => {
    setErrorMensaje('');
    if (producto) {
      setEditandoId(producto.idproducto || producto.id);
      setForm({
        nombre: producto.nombre || '',
        precio: producto.precio !== undefined ? producto.precio : '',
        categoria: producto.categoria || producto.idcategoria || '',
        unidad_medida: producto.unidad_medida || '',
        cantidad: producto.cantidad !== undefined ? producto.cantidad : '',
        stock_minimo: producto.stock_minimo !== undefined ? producto.stock_minimo : '',
        fecha_vencimiento: producto.fecha_vencimiento ? producto.fecha_vencimiento.split('T')[0] : (producto.vencimiento ? producto.vencimiento.split('T')[0] : '')
      });
    } else {
      setEditandoId(null);
      setForm({ nombre: '', precio: '', categoria: '', unidad_medida: '', cantidad: '', stock_minimo: '', fecha_vencimiento: '' });
    }
    setIsModalOpen(true);
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.nombre || !form.precio) {
      setErrorMensaje('El nombre y el precio son requeridos');
      return;
    }
    
    setErrorMensaje('');
    setGuardando(true);

    const isEditing = !!editandoId;
    const url = isEditing 
      ? `http://localhost:3000/products/${editandoId}` 
      : 'http://localhost:3000/products';
    const method = isEditing ? 'PUT' : 'POST';

    try {
      const response = await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre: form.nombre,
          precio: parseFloat(form.precio) || 0,
          idcategoria: form.categoria ? parseInt(form.categoria) : null,
          descripcion: null,
          cantidad: parseInt(form.cantidad, 10) || 0,
          stock_minimo: parseInt(form.stock_minimo, 10) || 0,
          fecha_vencimiento: form.fecha_vencimiento || null
        })
      });

      if (!response.ok) throw new Error('Error en el servidor');
      
      setIsModalOpen(false);
      fetchProductos();
    } catch (error) {
      console.error(error);
      setErrorMensaje(`Fallo al ${isEditing ? 'actualizar' : 'crear'} el producto.`);
    } finally {
      setGuardando(false);
    }
  };

  // Utils
  const formatearMoneda = (valor) => {
    if (valor === null || valor === undefined) return '$0.00';
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS' }).format(valor);
  };

  const getEstadoBadge = (estado) => {
    if (!estado) return <span className="text-gray-400 text-xs font-medium italic">-</span>;
    switch(estado) {
      case 'Bueno': return <span className="px-2 py-1 bg-green-100 text-green-700 text-xs rounded-full font-bold uppercase tracking-wider shadow-sm">Bueno</span>;
      case 'Medio': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs rounded-full font-bold uppercase tracking-wider shadow-sm">Medio</span>;
      case 'Bajo': return <span className="px-2 py-1 bg-red-100 text-red-700 text-xs rounded-full font-bold uppercase tracking-wider shadow-sm">Bajo</span>;
      default: return <span className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full font-bold uppercase tracking-wider shadow-sm">{estado}</span>;
    }
  };

  const getCategoriaBadge = (categoria) => {
    if (!categoria) return <span className="px-2.5 py-1 bg-gray-50 text-gray-400 border border-gray-100 rounded-md text-xs font-semibold">Sin Categoría</span>;
    return <span className="px-2.5 py-1 bg-gray-100/80 text-gray-600 border border-gray-200 rounded-md text-xs font-semibold">{categoria}</span>;
  }

  // Lógica de cálculo de estado
  const calcularEstado = (cantidad, stockMinimo) => {
    const cant = Number(cantidad) || 0;
    const min = Number(stockMinimo) || 0;
    if (cant <= min) return 'Bajo';
    if (cant <= min + 5) return 'Medio';
    return 'Bueno';
  };

  // Lógica de vencimiento
  const calcularVencimiento = (fecha) => {
    if (!fecha) return { texto: '-', estado: 'normal' };
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const fechaVen = new Date(fecha);
    // Si no es una fecha válida, retornar tal cual
    if (isNaN(fechaVen.getTime())) return { texto: fecha, estado: 'normal' };
    
    fechaVen.setHours(0, 0, 0, 0);
    
    const difTiempo = fechaVen.getTime() - hoy.getTime();
    const difDias = Math.ceil(difTiempo / (1000 * 3600 * 24));
    
    if (difDias < 0) {
      return { texto: 'Vencido', estado: 'vencido' };
    } else if (difDias <= 5) {
      return { texto: `Vence en ${difDias} días`, estado: 'cerca' };
    } else {
      return { texto: fechaVen.toLocaleDateString('es-ES'), estado: 'normal' };
    }
  };

  // Filtrado local
  const productosMostrar = productos.filter(p => {
    return p.nombre && p.nombre.toLowerCase().includes(busqueda.toLowerCase());
  });

  return (
    <div className="w-full xl:max-w-[85rem] mx-auto p-2 sm:p-4 animate-fade-in relative">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div>
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">Inventario</h1>
          <p className="text-gray-500 mt-1 font-medium text-sm">Gestión de materias primas</p>
        </div>
        <button 
          onClick={() => handleOpenModal()} 
          className="bg-orange-500 hover:bg-orange-600 text-white font-semibold py-2.5 px-6 rounded-lg shadow cursor-pointer transition-all active:scale-95 duration-200"
        >
          + Agregar Producto
        </button>
      </div>

      {/* Barra de Herramientas */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 mt-8">
        <div className="relative w-full xl:w-96">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon />
          </div>
          <input 
            type="text" 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 sm:text-sm transition-colors shadow-sm" 
            placeholder="Buscar por nombre..."
          />
        </div>

      </div>

      {/* Tabla de Datos */}
      <div className="bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden mt-6">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PRODUCTO</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CATEGORÍA</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">CANTIDAD</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">STOCK MÍNIMO</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">ESTADO</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">VENCIMIENTO</th>
                <th scope="col" className="px-6 py-4 text-left text-xs font-bold text-gray-500 uppercase tracking-wider">PRECIO</th>
                <th scope="col" className="px-6 py-4 text-right text-xs font-bold text-gray-500 uppercase tracking-wider">ACCIONES</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {cargando ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-400 font-medium">
                    <div className="flex justify-center items-center gap-2">
                       <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce"></span>
                       <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-75"></span>
                       <span className="w-2 h-2 bg-orange-500 rounded-full animate-bounce delay-150"></span>
                    </div>
                  </td>
                </tr>
              ) : productosMostrar.length === 0 ? (
                <tr>
                  <td colSpan="8" className="px-6 py-12 text-center text-gray-500 font-medium">
                    No hay productos disponibles.
                  </td>
                </tr>
              ) : (
                productosMostrar.map((prod) => (
                  <tr key={prod.idproducto || prod.id} className="hover:bg-gray-50 transition-colors duration-150 group">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-gray-900">
                      {prod.nombre}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {getCategoriaBadge(prod.idcategoria || prod.categoria)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-700">
                      {prod.cantidad !== undefined && prod.cantidad !== null ? prod.cantidad : <span className="text-gray-400 italic">-</span>}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-400">
                      {prod.stock_minimo !== undefined && prod.stock_minimo !== null ? prod.stock_minimo : "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getEstadoBadge(calcularEstado(prod.cantidad, prod.stock_minimo))}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(() => {
                        const v = calcularVencimiento(prod.fecha_vencimiento || prod.vencimiento);
                        if (v.estado === 'vencido') {
                          return <span className="text-red-600 font-black">{v.texto}</span>;
                        } else if (v.estado === 'cerca') {
                          return (
                            <span className="text-red-500 bg-red-50 px-2 py-0.5 rounded text-xs font-bold flex items-center w-max">
                              <AlertIcon /> {v.texto}
                            </span>
                          );
                        }
                        return <span className="text-gray-700 font-medium">{v.texto}</span>;
                      })()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-bold">
                      {formatearMoneda(prod.precio)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                      <div className="flex items-center justify-end gap-3 opacity-80 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => handleOpenModal(prod)} className="p-1.5 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors" title="Editar">
                          <EditIcon />
                        </button>
                        <button onClick={() => setProductoEliminar(prod)} className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors" title="Eliminar">
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

      {/* Modal Formulario Crear/Editar (Solución limpia flex-center) */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity">
          {/* Panel del Modal */}
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative z-10 flex flex-col max-h-[90vh]">
            {/* Header Modal */}
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-20">
              <h3 className="text-xl font-bold text-gray-900">
                {editandoId ? 'Editar Producto' : 'Agregar Nuevo Producto'}
              </h3>
              <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600 focus:outline-none transition-colors p-1 rounded-full hover:bg-gray-100">
                <CloseIcon />
              </button>
            </div>
            
            {/* Body Modal (con scroll si excede altura) */}
            <div className="px-6 py-6 overflow-y-auto">
              {errorMensaje && (
                <div className="mb-6 text-sm text-red-600 bg-red-50 p-4 rounded-lg border border-red-100 flex items-start gap-2">
                  <AlertIcon />
                  <span className="font-medium">{errorMensaje}</span>
                </div>
              )}
              
              <form id="product-form" onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                  <div className="sm:col-span-4">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Nombre <span className="text-red-500">*</span></label>
                    <input 
                      type="text" 
                      name="nombre" 
                      value={form.nombre} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="Ej. Queso Mozzarella"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Categoría</label>
                    <select 
                      name="categoria" 
                      value={form.categoria} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Seleccionar una opción...</option>
                    </select>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Unidad de Medida</label>
                    <select 
                      name="unidad_medida" 
                      value={form.unidad_medida} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    >
                      <option value="">Seleccionar una opción...</option>
                    </select>
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Cant. Actual</label>
                    <input 
                      type="number" 
                      name="cantidad" 
                      value={form.cantidad} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Stock Mín.</label>
                    <input 
                      type="number" 
                      name="stock_minimo" 
                      value={form.stock_minimo} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="0"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Vencimiento</label>
                    <input 
                      type="date" 
                      name="fecha_vencimiento" 
                      value={form.fecha_vencimiento} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                    />
                  </div>
                  
                  <div className="sm:col-span-1">
                    <label className="block text-sm font-semibold text-gray-700 mb-1.5">Precio <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      step="0.01"
                      name="precio" 
                      value={form.precio} 
                      onChange={handleChange} 
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 text-gray-900 rounded-lg focus:bg-white focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent transition-all"
                      placeholder="0.00"
                    />
                  </div>


                </div>
              </form>
            </div>

            {/* Footer Modal */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end gap-3 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => setIsModalOpen(false)}
                className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white font-medium hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-200 transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                form="product-form"
                disabled={guardando}
                className="px-6 py-2.5 rounded-lg bg-orange-500 text-white font-medium hover:bg-orange-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500 transition-colors disabled:opacity-50 shadow-sm"
              >
                {guardando ? 'Guardando...' : (editandoId ? 'Actualizar Producto' : 'Crear Producto')}
              </button>
            </div>
          </div>
          {/* Clickeable para cerrar atrás */}
          <div className="absolute inset-0 z-0" onClick={() => setIsModalOpen(false)}></div>
        </div>
      )}

      {/* Modal Confirmación Eliminar */}
      {productoEliminar && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-6 bg-gray-900 bg-opacity-60 backdrop-blur-sm transition-opacity">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden relative z-10 flex flex-col p-6 text-center animate-fade-in-up">
            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
              <TrashIcon className="h-6 w-6 text-red-600" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Eliminar Producto</h3>
            <p className="text-sm text-gray-500 mb-6">
              ¿Estás seguro que deseas eliminar <strong>{productoEliminar.nombre}</strong>? Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-center w-full">
              <button 
                onClick={() => setProductoEliminar(null)}
                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 text-gray-700 bg-white font-medium hover:bg-gray-50 transition-colors"
                disabled={eliminando}
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDelete}
                className="w-full px-4 py-2.5 rounded-lg bg-red-600 text-white font-medium hover:bg-red-700 transition-colors shadow-sm disabled:opacity-50"
                disabled={eliminando}
              >
                {eliminando ? 'Borrando...' : 'Sí, eliminar'}
              </button>
            </div>
          </div>
          <div className="absolute inset-0 z-0" onClick={() => !eliminando && setProductoEliminar(null)}></div>
        </div>
      )}
    </div>
  );
}
