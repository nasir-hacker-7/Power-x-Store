import React from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Store } from './pages/Store';
import { Admin } from './pages/Admin';
import { Welcome } from './pages/Welcome';
import { Background } from './components/Background';

const App: React.FC = () => {
  return (
    <HashRouter>
      <div className="min-h-screen text-white relative">
        <Background />
        <Navbar />
        <main className="relative z-10">
          <Routes>
            <Route path="/" element={<Welcome />} />
            <Route path="/store" element={<Store />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        
        <footer className="bg-dark-900/80 backdrop-blur border-t border-dark-800 py-8 text-center relative z-10">
          <p className="text-slate-500 text-sm">
            © {new Date().getFullYear()} Power Modz | Power Trust. All rights reserved.
          </p>
        </footer>
      </div>
    </HashRouter>
  );
};

export default App;