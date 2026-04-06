import { useState } from 'react';
import Sidebar from './components/Sidebar';
import MainContent from './components/MainContent';

function App() {
  const [activeView, setActiveView] = useState('dashboard');

  return (
    <div className="flex w-full h-screen overflow-hidden bg-slate-100 text-slate-900 font-sans">
      <Sidebar activeView={activeView} setActiveView={setActiveView} />
      <MainContent activeView={activeView} />
    </div>
  );
}

export default App;
