
import { VirtualNumber, Order, Notification, User } from '../types';

const NUMBERS_KEY = 'power_modz_numbers';
const ORDERS_KEY = 'power_modz_orders';
const NOTIFICATIONS_KEY = 'power_modz_notifications';
const USERS_KEY = 'power_modz_users';
const SESSION_KEY = 'power_modz_session';

// Initial data seeding
const INITIAL_NUMBERS: VirtualNumber[] = [
  { id: '1', phoneNumber: '+22870424724', price: 200, status: 'working', countryCode: 'TG' },
  { id: '2', phoneNumber: '+22871583465', price: 200, status: 'working', countryCode: 'TG' },
  { id: '3', phoneNumber: '+22871122743', price: 200, status: 'working', countryCode: 'TG' },
  { id: '4', phoneNumber: '+22871127687', price: 200, status: 'working', countryCode: 'TG' },
  { id: '5', phoneNumber: '+93773662441', price: 200, status: 'working', countryCode: 'AF' },
  { id: '6', phoneNumber: '+221768216663', price: 200, status: 'working', countryCode: 'SN' },
  { id: '7', phoneNumber: '+120255501XX', price: 200, status: 'coming_soon', countryCode: 'US' },
  { id: '8', phoneNumber: '+447700900XX', price: 200, status: 'coming_soon', countryCode: 'UK' },
];

// Event system for reactivity
type Listener = () => void;
const listeners: Set<Listener> = new Set();

const notify = () => {
  listeners.forEach(listener => listener());
};

// Listen for changes in other tabs
window.addEventListener('storage', (event) => {
  if ([NUMBERS_KEY, ORDERS_KEY, NOTIFICATIONS_KEY, USERS_KEY, SESSION_KEY].includes(event.key || '')) {
    notify();
  }
});

export const db = {
  subscribe: (listener: Listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },

  // --- Authentication & Users ---
  
  registerUser: (user: Omit<User, 'id' | 'createdAt'>): User | { error: string } => {
    const users = db.getUsers();
    // Case insensitive email check
    if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { error: "Email already exists. Please Login." };
    }

    const newUser: User = {
      ...user,
      id: 'UID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    
    // Auto login after register
    localStorage.setItem(SESSION_KEY, JSON.stringify(newUser));
    notify();
    return newUser;
  },

  // Manual user creation by admin (Does not auto-login)
  createUser: (user: Omit<User, 'id' | 'createdAt'>): User | { error: string } => {
    const users = db.getUsers();
    // Case insensitive email check
    if (users.find(u => u.email.toLowerCase() === user.email.toLowerCase())) {
      return { error: "Email already exists." };
    }

    const newUser: User = {
      ...user,
      id: 'UID-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
      createdAt: Date.now()
    };

    users.push(newUser);
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
    notify();
    return newUser;
  },

  loginUser: (email: string, pass: string): User | { error: string } => {
    const users = db.getUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === pass);
    if (user) {
      localStorage.setItem(SESSION_KEY, JSON.stringify(user));
      notify();
      return user;
    }
    return { error: "Invalid email or password" };
  },

  logout: () => {
    localStorage.removeItem(SESSION_KEY);
    notify();
  },

  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(SESSION_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  getUsers: (): User[] => {
    const stored = localStorage.getItem(USERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // --- Numbers ---
  getNumbers: (): VirtualNumber[] => {
    const stored = localStorage.getItem(NUMBERS_KEY);
    if (!stored) {
      localStorage.setItem(NUMBERS_KEY, JSON.stringify(INITIAL_NUMBERS));
      return INITIAL_NUMBERS;
    }
    return JSON.parse(stored);
  },

  addNumber: (num: VirtualNumber) => {
    const numbers = db.getNumbers();
    numbers.push(num);
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(numbers));
    notify();
  },

  updateNumber: (id: string, updates: Partial<VirtualNumber>) => {
    const numbers = db.getNumbers();
    const index = numbers.findIndex(n => n.id === id);
    if (index !== -1) {
      numbers[index] = { ...numbers[index], ...updates };
      localStorage.setItem(NUMBERS_KEY, JSON.stringify(numbers));
      notify();
    }
  },

  deleteNumber: (id: string) => {
    let numbers = db.getNumbers();
    numbers = numbers.filter(n => n.id !== id);
    localStorage.setItem(NUMBERS_KEY, JSON.stringify(numbers));
    notify();
  },

  // --- Orders ---
  getOrders: (): Order[] => {
    const stored = localStorage.getItem(ORDERS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Get orders specifically for the current logged in user
  getUserOrders: (): Order[] => {
    const user = db.getCurrentUser();
    if (!user) return [];
    return db.getOrders().filter(o => o.userId === user.id);
  },

  createOrder: (orderData: Omit<Order, 'id' | 'userId' | 'createdAt' | 'status'>) => {
    const user = db.getCurrentUser();
    if (!user) throw new Error("User must be logged in");

    const order: Order = {
      ...orderData,
      id: Date.now().toString(),
      userId: user.id,
      status: 'pending',
      createdAt: Date.now()
    };

    const orders = db.getOrders();
    orders.unshift(order);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notify();
  },
  
  updateOrder: (id: string, updates: Partial<Order>) => {
    const orders = db.getOrders();
    const index = orders.findIndex(o => o.id === id);
    if (index !== -1) {
      const oldOrder = orders[index];
      orders[index] = { ...oldOrder, ...updates };
      localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
      
      // If status changed, send notification to user
      if (updates.status && updates.status !== oldOrder.status) {
        db.sendNotification({
          id: Date.now().toString(),
          type: 'order_update',
          userId: oldOrder.userId,
          sender: 'admin',
          title: `Order ${updates.status === 'approved' ? 'Approved' : 'Rejected'}`,
          message: `Your order for ${oldOrder.numberValue} has been ${updates.status}.`,
          isRead: false,
          timestamp: Date.now(),
          relatedOrderId: oldOrder.id
        });
      }
      
      notify();
    }
  },

  deleteOrder: (id: string) => {
    let orders = db.getOrders();
    orders = orders.filter(o => o.id !== id);
    localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
    notify();
  },

  // --- Notifications & Chat ---
  getNotifications: (): Notification[] => {
    const stored = localStorage.getItem(NOTIFICATIONS_KEY);
    return stored ? JSON.parse(stored) : [];
  },

  // Get general notifications for user (excluding direct chat messages which are handled in getConversation)
  getUserNotifications: (): Notification[] => {
    const user = db.getCurrentUser();
    if (!user) return []; 

    const all = db.getNotifications();
    return all
      .filter(n => n.type === 'broadcast' || (n.userId === user.id && n.type !== 'private'))
      .sort((a, b) => b.timestamp - a.timestamp);
  },

  // Get conversation history for a specific user (User <-> Admin)
  getConversation: (userId: string): Notification[] => {
    const all = db.getNotifications();
    return all
      .filter(n => n.type === 'private' && n.userId === userId)
      .sort((a, b) => a.timestamp - b.timestamp);
  },

  sendNotification: (notification: Notification) => {
    const all = db.getNotifications();
    // Add to beginning of array
    all.unshift(notification);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
    notify();
  },

  deleteNotification: (id: string) => {
    let all = db.getNotifications();
    const newAll = all.filter(n => n.id !== id);
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(newAll));
    notify();
  },

  markAllAsRead: () => {
    const user = db.getCurrentUser();
    if (!user) return;
    
    const all = db.getNotifications();
    let changed = false;
    all.forEach(n => {
      // Do not mark private chat messages as read from the notification panel
      if (n.type !== 'private' && (n.type === 'broadcast' || n.userId === user.id) && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
      notify();
    }
  },

  markChatRead: (userId: string, role: 'admin' | 'user') => {
    const all = db.getNotifications();
    let changed = false;
    all.forEach(n => {
      // If current user is 'user', they read messages from 'admin'.
      // If current user is 'admin', they read messages from 'user'.
      const senderToMark = role === 'admin' ? 'user' : 'admin';
      
      if (n.type === 'private' && n.userId === userId && n.sender === senderToMark && !n.isRead) {
        n.isRead = true;
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(all));
      notify();
    }
  }
};
