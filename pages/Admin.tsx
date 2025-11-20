
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Order, VirtualNumber, User, Notification } from '../types';
import { Trash2, Plus, Search, LayoutGrid, ShoppingBag, X, Megaphone, Send, CheckCircle2, XCircle, MessageSquare, Users, Image as ImageIcon, UserPlus } from 'lucide-react';
import { ChatWindow } from '../components/ChatWindow';

export const Admin: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'orders' | 'numbers' | 'broadcast' | 'users'>('orders');
  const [orders, setOrders] = useState<Order[]>([]);
  const [numbers, setNumbers] = useState<VirtualNumber[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [broadcasts, setBroadcasts] = useState<Notification[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState('');

  // Modals & Forms
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [chatTarget, setChatTarget] = useState<{id: string, name: string} | null>(null);
  
  // Add Inventory Form
  const [newNumber, setNewNumber] = useState('');
  const [newPrice, setNewPrice] = useState('200');
  
  // Broadcast Form
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMsg, setBroadcastMsg] = useState('');

  // Add User Form
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserPassword, setNewUserPassword] = useState('');

  useEffect(() => {
    if (isLoggedIn) {
      refreshData();
      const unsubscribe = db.subscribe(() => {
        refreshData();
      });
      return () => unsubscribe();
    }
  }, [isLoggedIn]);

  const refreshData = () => {
    setOrders(db.getOrders());
    setNumbers(db.getNumbers());
    setUsers(db.getUsers());
    setBroadcasts(db.getNotifications().filter(n => n.type === 'broadcast'));
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'powerxtream') {
      setIsLoggedIn(true);
    } else {
      alert('Invalid Password');
    }
  };

  // --- Order Actions ---
  const handleDeleteOrder = (id: string) => {
    if (confirm('Delete this order?')) db.deleteOrder(id);
  };

  const handleStatusChange = (id: string, newStatus: 'approved' | 'rejected' | 'pending') => {
    db.updateOrder(id, { status: newStatus });
  };

  // --- Broadcast Actions ---
  const handleSendBroadcast = (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMsg) return;

    db.sendNotification({
      id: Date.now().toString(),
      type: 'broadcast',
      title: broadcastTitle,
      message: broadcastMsg,
      isRead: false,
      timestamp: Date.now()
    });

    setBroadcastTitle('');
    setBroadcastMsg('');
    alert('Broadcast sent to all users!');
  };

  const handleDeleteBroadcast = (id: string) => {
    if (confirm("Delete this broadcast?")) {
      db.deleteNotification(id);
      setBroadcasts(prev => prev.filter(b => b.id !== id));
    }
  };

  // --- Inventory Actions ---
  const handleAddNumber = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNumber) return;
    db.addNumber({
      id: Date.now().toString(),
      phoneNumber: newNumber,
      price: Number(newPrice),
      status: 'working',
      countryCode: 'TG'
    });
    setNewNumber('');
  };

  const handleDeleteNumber = (id: string) => {
    if (confirm('Delete this number?')) db.deleteNumber(id);
  };

  const handleUpdateNumber = (id: string, updates: Partial<VirtualNumber>) => {
    db.updateNumber(id, updates);
  };

  // --- User Actions ---
  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail || !newUserPassword) return;

    const result = db.createUser({
      name: newUserName,
      email: newUserEmail,
      password: newUserPassword
    });

    if ('error' in result) {
      alert(result.error);
    } else {
      alert('User created successfully!');
      setNewUserName('');
      setNewUserEmail('');
      setNewUserPassword('');
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <form onSubmit={handleLogin} className="bg-dark-800/90 backdrop-blur-md p-8 rounded-xl border border-dark-700 shadow-2xl w-full max-w-md z-20">
          <h2 className="text-2xl font-bold text-white mb-6 text-center">Admin Access</h2>
          <input 
            type="password" 
            placeholder="Enter Password" 
            className="w-full bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white mb-4 focus:ring-2 focus:ring-gold-500 outline-none transition-all"
            value={password}
            onChange={e => setPassword(e.target.value)}
          />
          <button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 rounded-lg transition-colors">
            Login
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-slate-200 pb-20 relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header & Tabs - Flex Col on Mobile, Row on Desktop */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-8 gap-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">Dashboard</h1>
            <p className="text-slate-400 text-sm md:text-base">Manage orders, users and inventory</p>
          </div>
          <div className="flex gap-2 bg-dark-800/80 p-1 rounded-lg border border-dark-700 backdrop-blur-sm overflow-x-auto w-full lg:w-auto no-scrollbar">
            <button 
              onClick={() => setActiveTab('orders')}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'orders' ? 'bg-gold-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <ShoppingBag className="w-4 h-4" /> Orders
            </button>
            <button 
              onClick={() => setActiveTab('users')}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'users' ? 'bg-gold-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Users className="w-4 h-4" /> Users
            </button>
            <button 
              onClick={() => setActiveTab('numbers')}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'numbers' ? 'bg-gold-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <LayoutGrid className="w-4 h-4" /> Inventory
            </button>
            <button 
              onClick={() => setActiveTab('broadcast')}
              className={`flex-1 lg:flex-none px-4 py-2 rounded-md text-sm font-medium flex justify-center items-center gap-2 transition-all whitespace-nowrap ${activeTab === 'broadcast' ? 'bg-gold-500 text-black shadow' : 'text-slate-400 hover:text-white'}`}
            >
              <Megaphone className="w-4 h-4" /> Broadcast
            </button>
          </div>
        </div>

        {activeTab === 'orders' && (
          <div className="space-y-6">
            {orders.length === 0 && <p className="text-center text-slate-500 py-10">No orders yet.</p>}
            {orders.map(order => (
              <div key={order.id} className={`bg-dark-800/80 backdrop-blur-sm rounded-xl border overflow-hidden shadow-lg flex flex-col lg:flex-row transition-all
                ${order.status === 'pending' ? 'border-dark-600' : ''}
                ${order.status === 'approved' ? 'border-green-500/30 bg-green-900/5' : ''}
                ${order.status === 'rejected' ? 'border-red-500/30 bg-red-900/5' : ''}
              `}>
                {/* Screenshot Thumbnail */}
                <div 
                  className="lg:w-48 h-48 lg:h-auto bg-dark-900/50 flex items-center justify-center cursor-pointer relative group border-b lg:border-b-0 lg:border-r border-dark-700"
                  onClick={() => setPreviewImage(order.screenshotBase64)}
                >
                  <img src={order.screenshotBase64} alt="Proof" className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/40 transition-opacity">
                    <Search className="text-white w-6 h-6" />
                  </div>
                </div>

                {/* Details */}
                <div className="p-4 md:p-6 flex-1">
                  <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center gap-3 flex-wrap">
                        <h3 className="text-lg md:text-xl font-bold text-white">{order.customerName}</h3>
                        <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase border
                          ${order.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20' : ''}
                          ${order.status === 'approved' ? 'bg-green-500/10 text-green-500 border-green-500/20' : ''}
                          ${order.status === 'rejected' ? 'bg-red-500/10 text-red-500 border-red-500/20' : ''}
                        `}>
                          {order.status}
                        </span>
                      </div>
                      <p className="text-gold-500 font-mono text-xs md:text-sm mt-1">{new Date(order.createdAt).toLocaleString()}</p>
                    </div>
                    
                    <div className="flex gap-2 w-full md:w-auto">
                       <button 
                        onClick={() => setChatTarget({id: order.userId, name: order.customerName})}
                        className="flex-1 md:flex-none p-2 bg-dark-700 text-blue-400 hover:bg-blue-500/20 rounded-lg transition-colors flex justify-center items-center gap-2"
                        title="Open Chat"
                      >
                        <MessageSquare className="w-5 h-5" /> <span className="text-xs font-bold md:hidden lg:inline">Chat</span>
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-2 bg-dark-700 text-red-400 hover:bg-red-500/20 rounded-lg transition-colors"
                        title="Delete Order"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                    <div className="bg-dark-900/50 p-3 rounded-lg overflow-hidden">
                      <span className="text-xs text-slate-500 uppercase">Number</span>
                      <p className="font-mono text-base md:text-lg text-white truncate">{order.numberValue}</p>
                    </div>
                    <div className="bg-dark-900/50 p-3 rounded-lg overflow-hidden">
                      <span className="text-xs text-slate-500 uppercase">WhatsApp</span>
                      <p className="font-mono text-base md:text-lg text-white truncate">{order.customerWhatsapp}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button 
                      onClick={() => handleStatusChange(order.id, 'approved')}
                      disabled={order.status === 'approved'}
                      className="flex-1 py-2 bg-green-600 hover:bg-green-500 disabled:bg-dark-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-colors flex justify-center items-center gap-2"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Approve
                    </button>
                    <button 
                      onClick={() => handleStatusChange(order.id, 'rejected')}
                      disabled={order.status === 'rejected'}
                      className="flex-1 py-2 bg-red-600 hover:bg-red-500 disabled:bg-dark-700 disabled:text-slate-500 text-white rounded-lg font-semibold transition-colors flex justify-center items-center gap-2"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'users' && (
          <div className="space-y-8">
            {/* Add User Form */}
            <div className="bg-dark-800/80 backdrop-blur-sm p-6 rounded-xl border border-dark-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <UserPlus className="w-5 h-5 text-gold-500" /> Add Manual User
              </h3>
              <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  className="bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newUserName}
                  onChange={e => setNewUserName(e.target.value)}
                  required
                />
                <input
                  type="email"
                  placeholder="Email"
                  className="bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newUserEmail}
                  onChange={e => setNewUserEmail(e.target.value)}
                  required
                />
                 <input
                  type="text"
                  placeholder="Password"
                  className="bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newUserPassword}
                  onChange={e => setNewUserPassword(e.target.value)}
                  required
                />
                <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-3 rounded-lg transition-colors flex items-center justify-center gap-2">
                  <Plus className="w-4 h-4" /> Create User
                </button>
              </form>
            </div>

            {/* Responsive Table Container */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-dark-700 overflow-hidden">
               <div className="overflow-x-auto">
                 <table className="w-full text-left min-w-[600px]">
                    <thead className="bg-dark-900/50 border-b border-dark-700">
                      <tr>
                        <th className="p-4 text-slate-400 font-medium">User ID</th>
                        <th className="p-4 text-slate-400 font-medium">Name</th>
                        <th className="p-4 text-slate-400 font-medium">Email</th>
                        <th className="p-4 text-slate-400 font-medium">Joined</th>
                        <th className="p-4 text-slate-400 font-medium text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-dark-700">
                      {users.map(user => (
                        <tr key={user.id} className="hover:bg-dark-700/30 transition-colors">
                          <td className="p-4 font-mono text-gold-500 text-sm">{user.id}</td>
                          <td className="p-4 text-white">{user.name}</td>
                          <td className="p-4 text-slate-300">{user.email}</td>
                          <td className="p-4 text-slate-400 text-sm">{new Date(user.createdAt).toLocaleDateString()}</td>
                          <td className="p-4 text-right">
                             <button 
                              onClick={() => setChatTarget({id: user.id, name: user.name})}
                              className="p-2 text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors flex items-center gap-2 ml-auto"
                              title="Message User"
                            >
                              <MessageSquare className="w-4 h-4" /> <span className="text-xs hidden sm:inline">Chat</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
               </div>
            </div>
          </div>
        )}

        {activeTab === 'broadcast' && (
          <div className="space-y-8">
            <div className="max-w-2xl mx-auto bg-dark-800/80 backdrop-blur-sm p-6 md:p-8 rounded-xl border border-dark-700">
              <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                <Megaphone className="text-gold-500" /> Send Announcement
              </h3>
              <form onSubmit={handleSendBroadcast} className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Title</label>
                  <input 
                    type="text" 
                    required
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none"
                    value={broadcastTitle}
                    onChange={e => setBroadcastTitle(e.target.value)}
                    placeholder="e.g., New Numbers Added!"
                  />
                </div>
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Message</label>
                  <textarea 
                    required
                    className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none h-32 resize-none"
                    value={broadcastMsg}
                    onChange={e => setBroadcastMsg(e.target.value)}
                    placeholder="Type your message here..."
                  />
                </div>
                <button className="w-full bg-gold-500 hover:bg-gold-600 text-black font-bold py-3 rounded-lg transition-colors flex justify-center items-center gap-2">
                  <Send className="w-4 h-4" /> Send to All Users
                </button>
              </form>
            </div>

            <div className="max-w-2xl mx-auto">
              <h3 className="text-lg font-bold text-white mb-4">Broadcast History</h3>
              <div className="space-y-4">
                {broadcasts.length === 0 && <p className="text-slate-500 text-center">No broadcasts sent yet.</p>}
                {broadcasts.map(b => (
                  <div key={b.id} className="bg-dark-800/80 border border-dark-700 rounded-xl p-4 flex justify-between items-start group">
                    <div>
                      <h4 className="font-bold text-white">{b.title}</h4>
                      <p className="text-sm text-slate-400 mt-1">{b.message}</p>
                      <p className="text-xs text-slate-600 mt-2">{new Date(b.timestamp).toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => handleDeleteBroadcast(b.id)}
                      className="p-2 text-slate-500 hover:text-red-500 transition-colors bg-dark-900/50 rounded-lg opacity-75 group-hover:opacity-100"
                      title="Delete Broadcast"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'numbers' && (
          <div className="space-y-8">
            {/* Add Number Form */}
            <div className="bg-dark-800/80 backdrop-blur-sm p-6 rounded-xl border border-dark-700">
              <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-gold-500" /> Add New Number
              </h3>
              <form onSubmit={handleAddNumber} className="flex flex-col sm:flex-row gap-4">
                <input 
                  type="text" 
                  placeholder="Number (e.g., +22870424724)" 
                  className="flex-[2] bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newNumber}
                  onChange={e => setNewNumber(e.target.value)}
                  required
                />
                <input 
                  type="number" 
                  placeholder="Price" 
                  className="flex-1 bg-dark-900/50 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 outline-none transition-all"
                  value={newPrice}
                  onChange={e => setNewPrice(e.target.value)}
                />
                <button type="submit" className="bg-gold-500 hover:bg-gold-600 text-black font-bold px-6 py-3 rounded-lg transition-colors">
                  Add
                </button>
              </form>
            </div>

            {/* List - Responsive Table */}
            <div className="bg-dark-800/80 backdrop-blur-sm rounded-xl border border-dark-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[600px]">
                  <thead className="bg-dark-900/50 border-b border-dark-700">
                    <tr>
                      <th className="p-4 text-slate-400 font-medium">Number</th>
                      <th className="p-4 text-slate-400 font-medium">Price (Rs.)</th>
                      <th className="p-4 text-slate-400 font-medium">Status</th>
                      <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-dark-700">
                    {numbers.map(num => (
                      <tr key={num.id} className="hover:bg-dark-700/30 transition-colors">
                        <td className="p-4">
                           <input 
                            type="text"
                            value={num.phoneNumber}
                            onChange={(e) => handleUpdateNumber(num.id, { phoneNumber: e.target.value })}
                            className="bg-dark-900/50 border border-dark-600 rounded px-3 py-2 w-full text-white font-mono focus:ring-1 focus:ring-gold-500 outline-none text-sm"
                          />
                        </td>
                        <td className="p-4">
                          <input 
                            type="number"
                            value={num.price}
                            onChange={(e) => handleUpdateNumber(num.id, { price: Number(e.target.value) })}
                            className="bg-dark-900/50 border border-dark-600 rounded px-3 py-2 w-24 text-white focus:ring-1 focus:ring-gold-500 outline-none text-sm"
                          />
                        </td>
                        <td className="p-4">
                          <select
                            value={num.status}
                            onChange={(e) => handleUpdateNumber(num.id, { status: e.target.value as any })}
                            className={`px-3 py-2 rounded-lg text-xs font-semibold border outline-none cursor-pointer appearance-none
                              ${num.status === 'working' ? 'bg-green-900/20 text-green-400 border-green-900/50' : ''}
                              ${num.status === 'coming_soon' ? 'bg-slate-700/30 text-slate-400 border-slate-600' : ''}
                              ${num.status === 'sold' ? 'bg-red-900/20 text-red-400 border-red-900/50' : ''}
                            `}
                          >
                            <option value="working" className="bg-dark-800 text-white">Working</option>
                            <option value="coming_soon" className="bg-dark-800 text-white">Coming Soon</option>
                            <option value="sold" className="bg-dark-800 text-white">Sold</option>
                          </select>
                        </td>
                        <td className="p-4 text-right">
                          <button 
                            onClick={() => handleDeleteNumber(num.id)}
                            className="p-2 text-slate-500 hover:text-red-400 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 z-[200] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          onClick={() => setPreviewImage(null)}
        >
          <img src={previewImage} alt="Full Preview" className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" />
          <button className="absolute top-4 right-4 text-white bg-white/10 p-2 rounded-full hover:bg-white/20">
            <X className="w-6 h-6" />
          </button>
        </div>
      )}

      {/* Chat Window */}
      {chatTarget && (
        <ChatWindow 
          chatPartnerId={chatTarget.id} 
          chatPartnerName={chatTarget.name} 
          currentUserRole="admin" 
          onClose={() => setChatTarget(null)} 
        />
      )}
    </div>
  );
};
