
import React, { useState, useEffect, useRef } from 'react';
import { db } from '../services/db';
import { Notification } from '../types';
import { Send, Image as ImageIcon, Mic, X, StopCircle, Play, User, ShieldCheck } from 'lucide-react';

interface Props {
  chatPartnerId: string;
  chatPartnerName: string;
  currentUserRole: 'admin' | 'user';
  onClose: () => void;
}

export const ChatWindow: React.FC<Props> = ({ chatPartnerId, chatPartnerName, currentUserRole, onClose }) => {
  const [messages, setMessages] = useState<Notification[]>([]);
  const [inputText, setInputText] = useState('');
  const [attachment, setAttachment] = useState<{type: 'image' | 'audio', content: string} | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadMessages = () => {
      const conv = db.getConversation(chatPartnerId);
      setMessages(conv);
      // Mark as read immediately when data updates and window is open
      db.markChatRead(chatPartnerId, currentUserRole);
    };

    loadMessages();
    const unsubscribe = db.subscribe(loadMessages);
    return () => unsubscribe();
  }, [chatPartnerId, currentUserRole]);

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, attachment]);

  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !attachment) return;

    db.sendNotification({
      id: Date.now().toString(),
      type: 'private',
      userId: chatPartnerId, // Thread belongs to this user
      sender: currentUserRole,
      title: currentUserRole === 'admin' ? 'Support' : 'User Message',
      message: inputText,
      isRead: false,
      timestamp: Date.now(),
      attachment: attachment || undefined
    });

    setInputText('');
    setAttachment(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setAttachment({ type: 'image', content: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = MediaRecorder.isTypeSupported('audio/webm') ? 'audio/webm' : '';
      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        const reader = new FileReader();
        reader.readAsDataURL(blob);
        reader.onloadend = () => {
          if (reader.result) {
            setAttachment({ type: 'audio', content: reader.result as string });
          }
          stream.getTracks().forEach(track => track.stop());
        };
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      alert("Microphone access denied or not available.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-0 sm:p-6">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-sm" onClick={onClose} />
      
      <div className="relative bg-dark-900 w-full h-full sm:h-[80vh] sm:max-w-md md:max-w-lg sm:rounded-2xl border-0 sm:border border-dark-700 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
        
        {/* Header */}
        <div className="bg-dark-800 border-b border-dark-700 p-4 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
             <div className={`w-10 h-10 rounded-full flex items-center justify-center border ${currentUserRole === 'admin' ? 'bg-blue-900/20 border-blue-500/30' : 'bg-gold-500/10 border-gold-500/30'}`}>
                {currentUserRole === 'admin' ? <User className="w-5 h-5 text-blue-400" /> : <ShieldCheck className="w-5 h-5 text-gold-500" />}
             </div>
             <div>
               <h3 className="font-bold text-white">{chatPartnerName}</h3>
               <p className="text-xs text-slate-400 flex items-center gap-1">
                 <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"/> Online
               </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white bg-dark-700/50 rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Messages Area - Scrollable */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#0b141a]" ref={scrollRef}>
          {/* Background Pattern Overlay */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[url('https://user-images.githubusercontent.com/15075759/28719144-86dc0f70-73b1-11e7-911d-60d70fcded21.png')] bg-repeat"></div>
          
          <div className="text-center py-4">
             <span className="bg-dark-800 text-slate-500 text-xs py-1 px-3 rounded-lg border border-dark-700 shadow-sm">
               Messages are end-to-end encrypted.
             </span>
          </div>

          {messages.map(msg => {
            const isMe = msg.sender === currentUserRole;
            return (
              <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} relative z-10`}>
                <div 
                  className={`max-w-[80%] rounded-lg p-3 shadow-md text-sm relative
                  ${isMe ? 'bg-[#005c4b] text-white rounded-tr-none' : 'bg-[#202c33] text-slate-100 rounded-tl-none'}
                `}>
                  {/* Attachment Display */}
                  {msg.attachment && (
                    <div className="mb-2">
                      {msg.attachment.type === 'image' ? (
                        <img src={msg.attachment.content} alt="Sent" className="rounded-md w-full max-w-[240px] border border-white/10" />
                      ) : (
                        <div className="flex items-center gap-2 bg-black/20 p-2 rounded-md min-w-[180px]">
                          <Play className="w-4 h-4 text-slate-300" />
                          <audio controls src={msg.attachment.content} className="h-6 w-32 md:w-40" />
                        </div>
                      )}
                    </div>
                  )}

                  {/* Text Content */}
                  {msg.message && <p className="leading-relaxed break-words">{msg.message}</p>}
                  
                  {/* Timestamp */}
                  <div className={`text-[10px] text-right mt-1 flex items-center justify-end gap-1 ${isMe ? 'text-green-200' : 'text-slate-400'}`}>
                    {new Date(msg.timestamp).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                    {isMe && <span className="text-blue-300">✓✓</span>}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Input Area */}
        <div className="bg-dark-800 p-3 shrink-0 flex items-end gap-2 border-t border-dark-700 relative z-20 safe-area-bottom">
          {/* Attachment Preview in Input */}
          {attachment && (
             <div className="absolute bottom-full left-0 right-0 bg-dark-900 p-2 border-t border-dark-700 flex items-center gap-3">
                <div className="bg-dark-800 p-2 rounded border border-dark-600">
                  {attachment.type === 'image' ? <ImageIcon className="w-5 h-5 text-blue-400"/> : <Mic className="w-5 h-5 text-green-400"/>}
                </div>
                <span className="text-sm text-slate-300">
                  {attachment.type === 'image' ? 'Image attached' : 'Voice note recorded'}
                </span>
                <button onClick={() => setAttachment(null)} className="ml-auto p-1 text-slate-400 hover:text-white"><X className="w-4 h-4"/></button>
             </div>
          )}

          <button onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-slate-200 hover:bg-dark-700 rounded-full transition-colors">
            <ImageIcon className="w-6 h-6" />
            <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageUpload}/>
          </button>

          <div className="flex-1 bg-dark-700/50 rounded-xl border border-dark-600 focus-within:border-green-500/50 focus-within:bg-dark-700 transition-all flex items-center overflow-hidden">
             <textarea 
                value={inputText}
                onChange={e => setInputText(e.target.value)}
                onKeyDown={e => {
                  if(e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type a message"
                className="w-full bg-transparent text-white px-4 py-3 outline-none resize-none max-h-24 min-h-[48px]"
                rows={1}
             />
          </div>

          {inputText || attachment ? (
            <button onClick={() => handleSendMessage()} className="p-3 bg-green-600 hover:bg-green-500 text-white rounded-full shadow-lg transition-transform hover:scale-105">
              <Send className="w-5 h-5 translate-x-0.5 translate-y-0.5" />
            </button>
          ) : (
            <button 
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onTouchStart={startRecording}
              onTouchEnd={stopRecording}
              className={`p-3 rounded-full transition-all shadow-lg ${isRecording ? 'bg-red-500 text-white animate-pulse scale-110' : 'bg-dark-700 text-slate-400 hover:bg-dark-600'}`}
            >
              <Mic className="w-6 h-6" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
