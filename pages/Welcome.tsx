import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { APP_NAME, APP_SUBTITLE } from '../types';
import { AuthModal } from '../components/AuthModal';
import { db } from '../services/db';

export const Welcome: React.FC = () => {
  const navigate = useNavigate();
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');

  // If already logged in, redirect to store
  useEffect(() => {
    if (db.getCurrentUser()) {
      navigate('/store');
    }
  }, [navigate]);

  const handleVisit = () => {
    navigate('/store');
  };

  const openLogin = () => {
    setAuthMode('login');
    setShowAuth(true);
  };

  return (
    <div className="min-h-screen bg-dark-900 flex flex-col items-center justify-center relative overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-gold-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[120px] animate-pulse" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
        {/* Logo Animation */}
        <div className="mb-8 flex justify-center">
          <div className="relative">
            <div className="absolute inset-0 bg-gold-500 blur-xl opacity-20 animate-pulse" />
            <div className="bg-dark-800 border border-dark-700 p-6 rounded-2xl shadow-2xl relative">
              <ShieldCheck className="w-20 h-20 text-gold-500" />
            </div>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-black text-white mb-4 tracking-tight">
          {APP_NAME}
        </h1>
        <p className="text-gold-500 text-xl font-medium tracking-[0.3em] uppercase mb-8 animate-pulse">
          {APP_SUBTITLE}
        </p>

        <p className="text-slate-400 text-lg md:text-xl max-w-2xl mx-auto mb-12 leading-relaxed">
          The most secure platform for premium virtual numbers. 
          Instant verification, real-time support, and guaranteed privacy.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <button 
            onClick={openLogin}
            className="w-full sm:w-auto px-10 py-4 bg-gold-500 hover:bg-gold-600 text-black text-lg font-bold rounded-xl shadow-lg shadow-gold-500/20 transition-all hover:-translate-y-1 flex items-center justify-center gap-2"
          >
            <Zap className="w-5 h-5" /> Login / Join
          </button>

          <button 
            onClick={handleVisit}
            className="w-full sm:w-auto px-10 py-4 bg-dark-800 hover:bg-dark-700 text-white border border-dark-600 text-lg font-semibold rounded-xl transition-all hover:-translate-y-1 flex items-center justify-center gap-2 group"
          >
            Visit Store <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuth && (
        <AuthModal 
          initialMode={authMode}
          onClose={() => setShowAuth(false)}
          onSuccess={() => navigate('/store')}
        />
      )}
    </div>
  );
};