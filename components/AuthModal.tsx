import React, { useState } from 'react';
import { db } from '../services/db';
import { X, Mail, Lock, User, ArrowRight, Loader2 } from 'lucide-react';

interface Props {
  initialMode: 'login' | 'register';
  onClose: () => void;
  onSuccess: () => void;
}

export const AuthModal: React.FC<Props> = ({ initialMode, onClose, onSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (mode === 'register') {
      if (!name || !email || !password) {
        setError("All fields are required");
        setLoading(false);
        return;
      }
      const result = db.registerUser({ name, email, password });
      if ('error' in result) {
        setError(result.error);
      } else {
        onSuccess();
      }
    } else {
      if (!email || !password) {
        setError("Email and password required");
        setLoading(false);
        return;
      }
      const result = db.loginUser(email, password);
      if ('error' in result) {
        setError(result.error);
      } else {
        onSuccess();
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-800 w-full max-w-md mx-4 rounded-2xl border border-dark-700 shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
        {/* Header */}
        <div className="p-6 sm:p-8 pb-0 text-center">
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">
            {mode === 'login' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-slate-400 text-sm">
            {mode === 'login' ? 'Enter your details to access your account' : 'Join Power Modz for premium access'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-4">
          {mode === 'register' && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
                <input 
                  type="text" 
                  className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  placeholder="John Doe"
                  value={name}
                  onChange={e => setName(e.target.value)}
                />
              </div>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="email" 
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-400 uppercase ml-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 w-5 h-5 text-slate-500" />
              <input 
                type="password" 
                className="w-full bg-dark-900 border border-dark-700 rounded-xl py-3 pl-10 pr-4 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
              />
            </div>
          </div>

          {error && (
            <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg text-center">
              {error}
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-xl transition-all flex items-center justify-center gap-2 mt-4"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
              <>
                {mode === 'login' ? 'Sign In' : 'Create Account'} <ArrowRight className="w-5 h-5" />
              </>
            )}
          </button>
        </form>

        {/* Footer */}
        <div className="p-4 bg-dark-900/50 text-center text-sm border-t border-dark-700">
          <span className="text-slate-400">
            {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
          </span>
          <button 
            onClick={() => {
              setMode(mode === 'login' ? 'register' : 'login');
              setError('');
            }}
            className="ml-2 text-gold-500 font-semibold hover:underline"
          >
            {mode === 'login' ? 'Sign Up' : 'Log In'}
          </button>
        </div>
        
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>
      </div>
    </div>
  );
};