
import React from 'react';
import { VirtualNumber } from '../types';
import { CheckCircle2, Clock, ShoppingCart, Smartphone, XCircle } from 'lucide-react';

interface Props {
  data: VirtualNumber;
  onBuy: (number: VirtualNumber) => void;
}

export const NumberCard: React.FC<Props> = ({ data, onBuy }) => {
  const isWorking = data.status === 'working';
  const isSold = data.status === 'sold';
  const isComingSoon = data.status === 'coming_soon';

  // Masking logic: Hide middle 4 digits
  // Memoizing this ensures it updates immediately when data.phoneNumber changes in db
  const maskedNumber = React.useMemo(() => {
    if (!data.phoneNumber || data.phoneNumber.length < 8) return data.phoneNumber;
    // Keep first 6 chars (e.g., +22870), hide next 4, show rest
    // Adjust dynamically if number is shorter
    const prefixLen = Math.min(6, Math.floor(data.phoneNumber.length / 2));
    const prefix = data.phoneNumber.substring(0, prefixLen); 
    const suffix = data.phoneNumber.substring(data.phoneNumber.length - 3);
    return `${prefix} **** ${suffix}`;
  }, [data.phoneNumber]);

  return (
    <div className={`relative group overflow-hidden rounded-xl border transition-all duration-300 shadow-xl hover:-translate-y-1
      ${isWorking ? 'border-dark-700 bg-dark-800 hover:shadow-gold-500/10' : ''}
      ${isComingSoon ? 'border-dark-700/50 bg-dark-800/50' : ''}
      ${isSold ? 'border-red-900/30 bg-red-900/5' : ''}
    `}>
      {/* Status Badge */}
      <div className="absolute top-3 right-3">
        {isWorking && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-green-500/10 text-green-400 border border-green-500/20">
            <CheckCircle2 className="w-3 h-3" /> Working
          </span>
        )}
        {isComingSoon && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-700/50 text-slate-400 border border-slate-600">
            <Clock className="w-3 h-3" /> Soon
          </span>
        )}
        {isSold && (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-500/10 text-red-500 border border-red-500/20">
            <XCircle className="w-3 h-3" /> Sold
          </span>
        )}
      </div>

      <div className="p-6">
        {/* Icon */}
        <div className={`w-12 h-12 rounded-lg flex items-center justify-center mb-4 
          ${isWorking ? 'bg-gold-500/10 text-gold-500' : ''}
          ${isComingSoon ? 'bg-slate-700/30 text-slate-500' : ''}
          ${isSold ? 'bg-red-500/10 text-red-500' : ''}
        `}>
          <Smartphone className="w-6 h-6" />
        </div>

        {/* Number */}
        <h3 className={`text-xl font-mono font-bold mb-2 
          ${isWorking ? 'text-white' : 'text-slate-500 line-through decoration-slate-700'}
        `}>
          {maskedNumber}
        </h3>

        {/* Price */}
        <p className="text-sm text-slate-400 mb-6">
          Price: <span className={`font-semibold ${isSold ? 'text-slate-500' : 'text-white'}`}>Rs. {data.price}</span>
        </p>

        {/* Action Button */}
        <button
          onClick={() => isWorking && onBuy(data)}
          disabled={!isWorking}
          className={`w-full py-3 px-4 rounded-lg flex items-center justify-center gap-2 font-semibold transition-all duration-200 
            ${isWorking 
              ? 'bg-gradient-to-r from-gold-600 to-gold-500 hover:from-gold-500 hover:to-gold-400 text-white shadow-lg shadow-gold-500/20' 
              : 'bg-dark-700 text-slate-500 cursor-not-allowed'
            }`}
        >
          {isWorking && <><ShoppingCart className="w-4 h-4" /> Buy Now</>}
          {isComingSoon && 'Coming Soon'}
          {isSold && 'Sold Out'}
        </button>
      </div>
    </div>
  );
};
