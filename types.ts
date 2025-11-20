
export interface VirtualNumber {
  id: string;
  phoneNumber: string;
  price: number;
  status: 'working' | 'coming_soon' | 'sold';
  countryCode: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  password: string; // In a real app, hash this. Here we simulate.
  createdAt: number;
}

export interface Order {
  id: string;
  userId: string; // Links to User.id
  numberId: string;
  numberValue: string;
  customerName: string;
  customerEmail: string;
  customerWhatsapp: string;
  screenshotBase64: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: number;
}

export interface Notification {
  id: string;
  type: 'broadcast' | 'private' | 'order_update';
  userId?: string; // The user this notification belongs to (thread ID)
  sender?: 'admin' | 'user'; // Who sent the message
  title: string;
  message: string;
  isRead: boolean;
  timestamp: number;
  relatedOrderId?: string;
  attachment?: {
    type: 'image' | 'audio';
    content: string; // Base64 string
  };
}

export const EASYPAISA_DETAILS = {
  number: "03366413938",
  name: "Muhammad Shahzad"
};

export const APP_NAME = "Power Modz";
export const APP_SUBTITLE = "Power Trust";
