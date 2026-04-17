import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';
import Login from './components/Login';

function App() {
  const [user, setUser] = useState(null);
  const [activeView, setActiveView] = useState('dashboard');

  const handleLogin = (userData) => {
    setUser(userData);
    
    const rol = (userData.rol || '').toLowerCase();
    if (rol === 'cocinero') {
       setActiveView('cocina');
    } else if (rol === 'mesero') {
       setActiveView('ordenes');
    } else if (rol === 'cajero') {
       setActiveView('caja');
    } else {
       setActiveView('dashboard');
    }
  };

  const handleLogout = () => {
    setUser(null);
  };

  if (!user) {
    return <Login onLoginSuccess={handleLogin} />;
  }

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} user={user} onLogout={handleLogout} />
      <MainContent activeView={activeView} user={user} />
    </div>
  );
}

export default App;
