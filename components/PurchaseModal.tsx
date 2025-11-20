
import React, { useState, useRef } from 'react';
import { VirtualNumber, EASYPAISA_DETAILS } from '../types';
import { X, Copy, Upload, Check, AlertCircle, Send } from 'lucide-react';

interface Props {
  number: VirtualNumber | null;
  onClose: () => void;
  onSubmit: (formData: { name: string; email: string; whatsapp: string; screenshot: string }) => void;
}

export const PurchaseModal: React.FC<Props> = ({ number, onClose, onSubmit }) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [formData, setFormData] = useState({ name: '', email: '', whatsapp: '' });
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [error, setError] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!number) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5000000) { // 5MB limit
        setError("Image size too large. Max 5MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setScreenshot(reader.result as string);
        setError('');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!screenshot) {
      setError("Please upload the payment screenshot.");
      return;
    }
    if (!formData.name || !formData.email || !formData.whatsapp) {
      setError("All fields are required.");
      return;
    }
    
    onSubmit({ ...formData, screenshot });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 sm:px-0">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-800 rounded-2xl border border-dark-700 shadow-2xl w-full max-w-lg mx-4 overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-4 md:p-6 border-b border-dark-700 flex justify-between items-center bg-dark-900/50">
          <div>
            <h2 className="text-lg md:text-xl font-bold text-white">Buy Virtual Number</h2>
            <p className="text-sm text-gold-500 font-mono mt-1">Rs. {number.price}</p>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-dark-700/50 rounded-lg hover:bg-dark-700 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 md:p-6 overflow-y-auto">
          
          {/* Stepper */}
          <div className="flex items-center justify-center mb-6 md:mb-8">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 1 ? 'bg-gold-500 text-black' : 'bg-dark-700 text-slate-500'}`}>1</div>
            <div className={`w-12 h-1 bg-dark-700 mx-2 relative`}>
              <div className={`absolute inset-0 bg-gold-500 transition-all duration-300 ${step === 2 ? 'w-full' : 'w-0'}`} />
            </div>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${step >= 2 ? 'bg-gold-500 text-black' : 'bg-dark-700 text-slate-500'}`}>2</div>
          </div>

          {step === 1 ? (
            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
              <div className="bg-gradient-to-br from-green-900/20 to-dark-800 border border-green-500/20 rounded-xl p-4 md:p-6 text-center">
                <h3 className="text-lg font-semibold text-green-400 mb-4">Send Payment via Easypaisa</h3>
                
                <div className="space-y-4">
                  <div className="bg-dark-900/80 p-4 rounded-lg border border-dark-700 group relative">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Number</p>
                    <p className="text-2xl font-mono font-bold text-white tracking-wide break-all">{EASYPAISA_DETAILS.number}</p>
                    <button 
                      onClick={() => handleCopy(EASYPAISA_DETAILS.number)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-slate-500 hover:text-gold-500"
                    >
                      <Copy className="w-5 h-5" />
                    </button>
                  </div>

                  <div className="bg-dark-900/80 p-4 rounded-lg border border-dark-700">
                    <p className="text-xs text-slate-500 uppercase tracking-wider mb-1">Account Title</p>
                    <p className="text-lg font-bold text-white">{EASYPAISA_DETAILS.name}</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 items-start bg-yellow-500/10 p-4 rounded-lg text-yellow-200 text-sm">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p>Please take a clear screenshot of the transaction success screen. You will need it in the next step.</p>
              </div>

              <button 
                onClick={() => setStep(2)}
                className="w-full py-3 bg-gold-500 hover:bg-gold-600 text-black font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
              >
                I have made the payment <Check className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Full Name</label>
                <input 
                  type="text" 
                  required
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Email Address</label>
                <input 
                  type="email" 
                  required
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">WhatsApp Number</label>
                <input 
                  type="tel" 
                  required
                  className="w-full bg-dark-900 border border-dark-700 rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-gold-500 focus:border-transparent outline-none transition-all"
                  placeholder="Enter your WhatsApp number"
                  value={formData.whatsapp}
                  onChange={(e) => setFormData({...formData, whatsapp: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Payment Screenshot</label>
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors
                    ${screenshot ? 'border-green-500 bg-green-500/10' : 'border-dark-600 hover:border-gold-500 bg-dark-900'}
                  `}
                >
                  <input 
                    type="file" 
                    ref={fileInputRef}
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  {screenshot ? (
                    <div className="flex flex-col items-center">
                      <img src={screenshot} alt="Preview" className="h-24 object-contain rounded-md mb-2" />
                      <span className="text-green-400 text-sm font-medium flex items-center gap-1">
                        <Check className="w-4 h-4" /> Image Uploaded
                      </span>
                      <span className="text-xs text-slate-500 mt-1">Click to change</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-slate-400">
                      <Upload className="w-8 h-8 mb-2" />
                      <span className="text-sm">Click to upload screenshot</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="text-red-400 text-sm bg-red-500/10 p-3 rounded-lg flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" /> {error}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button 
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 py-3 px-4 bg-dark-700 hover:bg-dark-600 text-slate-200 rounded-xl font-medium transition-colors"
                >
                  Back
                </button>
                <button 
                  type="submit"
                  className="flex-[2] py-3 px-4 bg-gold-500 hover:bg-gold-600 text-black rounded-xl font-bold transition-colors flex items-center justify-center gap-2"
                >
                  Submit Order <Send className="w-4 h-4" />
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
