import React, { useState } from 'react';

const ChefHatIcon = () => (
  <svg className="w-16 h-16 text-orange-500 mb-6 drop-shadow-sm" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const PizzaIcon = () => (
  <span className="text-6xl mb-6 drop-shadow-md animate-bounce" style={{ display: 'inline-block' }}>🍕</span>
);

export default function Login({ onLoginSuccess }) {
  const [formData, setFormData] = useState({ correo: '', contrasena: '' });
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.correo || !formData.contrasena) {
      setErrorMsg('Por favor llena todos los campos.');
      return;
    }

    setLoading(true);
    setErrorMsg('');

    try {
      const response = await fetch('http://localhost:3000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Fallo de autenticación');
      }

      // Login success, pass the user object up
      onLoginSuccess(data);

    } catch (error) {
      setErrorMsg(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-slate-100 flex items-center justify-center p-4 selection:bg-orange-200">
      <div className="absolute inset-0 z-0 bg-slate-900 pointer-events-none">
         <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-orange-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
         <div className="absolute top-1/2 right-1/4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse delay-700"></div>
      </div>
      
      <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 sm:p-12 w-full max-w-md relative z-10 border border-white/20">
        <div className="flex flex-col items-center text-center mb-8">
          <PizzaIcon />
          <h1 className="text-3xl font-black text-slate-800 tracking-tight">The Rolly Pizza</h1>
          <p className="text-sm font-medium text-slate-500 mt-2">Ingresa tus credenciales de empleado</p>
        </div>

        {errorMsg && (
          <div className="mb-6 py-3 px-4 bg-rose-50 border border-rose-200 rounded-xl text-rose-600 text-sm font-semibold text-center animate-fade-in">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Correo Electrónico</label>
            <input 
              type="email" 
              name="correo"
              value={formData.correo}
              onChange={handleChange}
              placeholder="tu@correo.com"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-bold text-slate-700 mb-1.5">Contraseña</label>
            <input 
              type="password" 
              name="contrasena"
              value={formData.contrasena}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 focus:bg-white focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all shadow-sm"
              required
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-3.5 rounded-xl transition-all pt-3 shadow-md flex justify-center items-center gap-2 mt-4 disabled:opacity-70 disabled:cursor-not-allowed group active:scale-[0.98]"
          >
            {loading ? (
              <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
            ) : (
               <span>Entrar al Sistema</span>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
