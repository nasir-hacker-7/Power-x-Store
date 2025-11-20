
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { Notification } from '../types';
import { Bell, Megaphone, Package, CheckCircle2, XCircle, MessageSquare, Image as ImageIcon, Mic } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationPanel: React.FC<Props> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'owner' | 'orders'>('owner');
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState('');

  useEffect(() => {
    const sync = () => {
      const user = db.getCurrentUser();
      setUserId(user ? user.id : '');
      setNotifications(db.getUserNotifications());
    };

    sync();
    const unsub = db.subscribe(sync);
    return () => unsub();
  }, []);

  useEffect(() => {
    if (isOpen) {
      db.markAllAsRead();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const broadcasts = notifications.filter(n => n.type === 'broadcast');
  // Filter out 'private' messages from here, as they belong in the chat window now.
  // Only show order updates.
  const personal = notifications.filter(n => n.type === 'order_update');

  const renderContent = (n: Notification) => (
    <div className="mt-2">
      <p className="text-slate-400 text-xs leading-relaxed whitespace-pre-wrap">{n.message}</p>
      {n.attachment && (
        <div className="mt-3">
          {n.attachment.type === 'image' ? (
            <img src={n.attachment.content} alt="Attachment" className="w-full rounded-lg border border-dark-700" />
          ) : (
            <div className="bg-dark-950/50 p-2 rounded-lg border border-dark-700">
               <audio controls src={n.attachment.content} className="w-full h-8" />
            </div>
          )}
        </div>
      )}
    </div>
  );

  return (
    <div className="absolute top-16 right-4 w-80 md:w-96 bg-dark-800 border border-dark-700 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[80vh]">
      {/* Header */}
      <div className="p-4 bg-dark-900 border-b border-dark-700 flex justify-between items-center">
        <div>
          <h3 className="text-white font-bold">Notifications</h3>
          <p className="text-xs text-slate-500">ID: <span className="font-mono text-gold-500">{userId.slice(0, 12)}...</span></p>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-dark-700">
        <button 
          onClick={() => setActiveTab('owner')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === 'owner' ? 'bg-gold-500/10 text-gold-500 border-b-2 border-gold-500' : 'text-slate-400 hover:bg-dark-700'}
          `}
        >
          <Megaphone className="w-4 h-4" /> Owner Message
        </button>
        <button 
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2
            ${activeTab === 'orders' ? 'bg-gold-500/10 text-gold-500 border-b-2 border-gold-500' : 'text-slate-400 hover:bg-dark-700'}
          `}
        >
          <Package className="w-4 h-4" /> Order Detail
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto bg-dark-800/95">
        {activeTab === 'owner' ? (
          <div className="p-4 space-y-3">
            {broadcasts.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No announcements yet.</p>
            ) : (
              broadcasts.map(n => (
                <div key={n.id} className="bg-dark-900/80 p-4 rounded-lg border border-dark-700">
                  <div className="flex items-center gap-2 mb-1">
                    <Megaphone className="w-3 h-3 text-gold-500" />
                    <span className="text-xs text-gold-500 uppercase font-bold">Announcement</span>
                    <span className="text-xs text-slate-500 ml-auto">{new Date(n.timestamp).toLocaleDateString()}</span>
                  </div>
                  <h4 className="text-white font-semibold text-sm mb-1">{n.title}</h4>
                  {renderContent(n)}
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="p-4 space-y-3">
             {personal.length === 0 ? (
              <p className="text-center text-slate-500 text-sm py-4">No order updates yet.</p>
            ) : (
              personal.map(n => (
                <div key={n.id} className="bg-dark-900/80 p-4 rounded-lg border border-dark-700">
                  <div className="flex items-center gap-2 mb-1">
                    {n.type === 'order_update' && n.title.includes('Approved') && <CheckCircle2 className="w-3 h-3 text-green-500" />}
                    {n.type === 'order_update' && n.title.includes('Rejected') && <XCircle className="w-3 h-3 text-red-500" />}
                    
                    <span className="text-xs text-slate-400 font-mono">{new Date(n.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</span>
                  </div>
                  <h4 className={`font-semibold text-sm mb-1 ${n.title.includes('Rejected') ? 'text-red-400' : 'text-white'}`}>
                    {n.title}
                  </h4>
                  {renderContent(n)}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
