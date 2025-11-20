import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Bell, LogIn, LogOut, User } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { APP_NAME, APP_SUBTITLE } from '../types';
import { NotificationPanel } from './NotificationPanel';
import { db } from '../services/db';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isAdmin = location.pathname.includes('/admin');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [currentUser, setCurrentUser] = useState(db.getCurrentUser());
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sync = () => {
      setCurrentUser(db.getCurrentUser());
      const notifs = db.getUserNotifications();
      const unread = notifs.filter(n => !n.isRead).length;
      setUnreadCount(unread);
    };

    sync();
    const unsub = db.subscribe(sync);
    return () => unsub();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(event.target as Node)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    db.logout();
    navigate('/');
  };

  if (location.pathname === '/' && !currentUser) return null;

  return (
    <nav className="bg-dark-800 border-b border-dark-700 sticky top-0 z-50 shadow-lg" ref={navRef}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo Section */}
          <Link to={currentUser ? "/store" : "/"} className="flex items-center gap-2 sm:gap-3 group shrink-0">
            <div className="bg-gold-500/10 p-1.5 sm:p-2 rounded-full group-hover:bg-gold-500/20 transition-colors">
              <ShieldCheck className="h-6 w-6 sm:h-8 sm:w-8 text-gold-500" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-bold text-white tracking-wide leading-tight">{APP_NAME}</span>
              <span className="text-[10px] sm:text-xs text-gold-500 font-medium tracking-widest uppercase leading-tight">{APP_SUBTITLE}</span>
            </div>
          </Link>
          
          {/* Actions Section */}
          <div className="flex items-center gap-2 sm:gap-4">
            {/* Notification Bell */}
            {!isAdmin && currentUser && (
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="p-2 text-slate-400 hover:text-gold-500 transition-colors relative"
                >
                  <Bell className="w-5 h-5 sm:w-6 sm:h-6" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 sm:w-3 sm:h-3 bg-red-500 rounded-full ring-2 ring-dark-800 animate-pulse" />
                  )}
                </button>
                
                <NotificationPanel 
                  isOpen={showNotifications} 
                  onClose={() => setShowNotifications(false)} 
                />
              </div>
            )}

            {isAdmin ? (
              <Link to="/store" className="text-xs sm:text-sm text-slate-400 hover:text-white transition-colors border border-dark-600 px-3 py-1.5 rounded-lg">
                Store View
              </Link>
            ) : (
              <>
                {currentUser ? (
                   <div className="flex items-center gap-2 sm:gap-3">
                     {/* User Info - Hidden on very small screens, visible on larger mobile/desktop */}
                     <div className="hidden sm:flex flex-col items-end mr-2">
                        <span className="text-sm text-white font-medium max-w-[100px] truncate">{currentUser.name}</span>
                        <span className="text-xs text-gold-500 font-mono">ID: {currentUser.id.slice(4, 10)}</span>
                     </div>
                     
                     <Link to="/admin" className="p-2 text-slate-500 hover:text-gold-500 transition-colors" title="Admin Login">
                        <Lock className="w-5 h-5 sm:w-5 sm:h-5" />
                     </Link>
                     
                     <button 
                      onClick={handleLogout}
                      className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                      title="Logout"
                     >
                       <LogOut className="w-5 h-5 sm:w-5 sm:h-5" />
                     </button>
                   </div>
                ) : (
                  <Link to="/" className="text-sm text-gold-500 hover:text-gold-400 font-semibold px-3 py-2">
                    Login
                  </Link>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};