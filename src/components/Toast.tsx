'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import { Check } from 'lucide-react';

interface ToastCtx {
  show: (msg: string) => void;
}

const ToastContext = createContext<ToastCtx>({ show: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);

  const show = useCallback((message: string) => {
    setMsg(message);
    setVisible(true);
    setTimeout(() => setVisible(false), 1800);
  }, []);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      {/* Toast */}
      <div
        className={`fixed bottom-8 left-1/2 -translate-x-1/2 z-[999] transition-all duration-300 ${
          visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-surface text-white text-sm font-medium shadow-2xl border border-white/10 backdrop-blur-xl"
          style={{ background: 'linear-gradient(135deg, #1a1a2e, #252540)' }}
        >
          <Check size={16} className="text-emerald-400" />
          {msg}
        </div>
      </div>
    </ToastContext.Provider>
  );
}
