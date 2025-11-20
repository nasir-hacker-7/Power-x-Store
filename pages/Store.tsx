
import React, { useState, useEffect } from 'react';
import { db } from '../services/db';
import { VirtualNumber, APP_NAME } from '../types';
import { NumberCard } from '../components/NumberCard';
import { PurchaseModal } from '../components/PurchaseModal';
import { AuthModal } from '../components/AuthModal';
import { ChatWindow } from '../components/ChatWindow';
import { Zap, MessageSquare } from 'lucide-react';

export const Store: React.FC = () => {
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [selectedNumber, setSelectedNumber] = useState<VirtualNumber | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showChat, setShowChat] = useState(false);
  const [user, setUser] = useState(db.getCurrentUser());
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  useEffect(() => {
    const sync = () => {
      setNumbers(db.getNumbers());
      const currentUser = db.getCurrentUser();
      setUser(currentUser);
      
      if (currentUser) {
        const conversation = db.getConversation(currentUser.id);
        // Count unread messages from admin
        const unread = conversation.filter(m => !m.isRead && m.sender === 'admin').length;
        setUnreadChatCount(unread);
      } else {
        setUnreadChatCount(0);
      }
    };

    sync();
    const unsubscribe = db.subscribe(sync);

    return () => unsubscribe();
  }, []);

  const handleBuy = (num: VirtualNumber) => {
    if (!user) {
      setShowAuthModal(true);
    } else {
      setSelectedNumber(num);
    }
  };

  const handleChatOpen = () => {
     if (!user) {
      setShowAuthModal(true);
    } else {
      setShowChat(true);
    }
  };

  const handlePurchaseSubmit = (formData: { name: string; email: string; whatsapp: string; screenshot: string }) => {
    if (!selectedNumber) return;

    db.createOrder({
      numberId: selectedNumber.id,
      numberValue: selectedNumber.phoneNumber,
      customerName: formData.name,
      customerEmail: formData.email,
      customerWhatsapp: formData.whatsapp,
      screenshotBase64: formData.screenshot
    });

    setSelectedNumber(null);
    setShowSuccess(true);
    
    // Hide success message after 5 seconds
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="min-h-screen bg-dark-900 pb-20">
      {/* Hero Section */}
      <div className="relative bg-dark-800 border-b border-dark-700 overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1550751827-4bd374c3f58b?q=80&w=2070&auto=format&fit=crop')] opacity-5 bg-cover bg-center mix-blend-overlay"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20 relative z-10 text-center">
          <div className="inline-flex items-center justify-center p-3 bg-gold-500/10 rounded-2xl mb-6 ring-1 ring-gold-500/30">
            <Zap className="w-6 h-6 md:w-8 md:h-8 text-gold-500" />
          </div>
          <h1 className="text-3xl md:text-6xl font-black text-white mb-4 tracking-tight">
            PREMIUM <span className="block md:inline text-transparent bg-clip-text bg-gradient-to-r from-gold-400 to-gold-600">VIRTUAL NUMBERS</span>
          </h1>
          <p className="text-sm md:text-lg text-slate-400 max-w-2xl mx-auto px-4">
            Secure, reliable, and instant verification numbers for your needs. 
            Owned by <span className="text-gold-500 font-semibold">{APP_NAME}</span>.
          </p>
        </div>
      </div>

      {/* Numbers Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="flex items-center justify-between mb-6 md:mb-8">
          <h2 className="text-xl md:text-2xl font-bold text-white border-l-4 border-gold-500 pl-4">Available Numbers</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {numbers.map((num) => (
            <NumberCard 
              key={num.id} 
              data={num} 
              onBuy={handleBuy} 
            />
          ))}
        </div>
      </div>

      {/* Floating Chat Button */}
      <button 
        onClick={handleChatOpen}
        className="fixed bottom-6 right-4 md:right-10 p-3 md:p-4 bg-gold-500 hover:bg-gold-400 text-black rounded-full shadow-2xl shadow-gold-500/40 transition-all hover:-translate-y-1 z-40 flex items-center gap-2 group"
      >
        <div className="relative">
          <MessageSquare className="w-6 h-6" />
          {unreadChatCount > 0 && (
            <span className="absolute -top-3 -right-3 bg-red-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center border border-dark-900 animate-bounce shadow-sm">
              {unreadChatCount}
            </span>
          )}
        </div>
        <span className="font-bold hidden md:inline-block animate-in slide-in-from-right-2 duration-200">Support Chat</span>
      </button>

      {/* Success Notification */}
      {showSuccess && (
        <div className="fixed bottom-20 md:bottom-24 left-4 right-4 md:left-auto md:right-6 bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl z-50 animate-bounce text-center md:text-left">
          <h4 className="font-bold">Order Submitted!</h4>
          <p className="text-sm">Admin will verify and contact you shortly.</p>
        </div>
      )}

      {/* Purchase Modal (Only for logged in) */}
      {selectedNumber && (
        <PurchaseModal 
          number={selectedNumber}
          onClose={() => setSelectedNumber(null)}
          onSubmit={handlePurchaseSubmit}
        />
      )}

      {/* Auth Modal (For guests) */}
      {showAuthModal && (
        <AuthModal 
          initialMode="login"
          onClose={() => setShowAuthModal(false)}
          onSuccess={() => setShowAuthModal(false)}
        />
      )}

      {/* Customer Chat Window */}
      {showChat && user && (
        <ChatWindow 
          chatPartnerId={user.id} 
          chatPartnerName="Admin Support" 
          currentUserRole="user" 
          onClose={() => setShowChat(false)}
        />
      )}
    </div>
  );
};
