import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

type Toast = { id: number; message: string; type?: 'success' | 'error' | 'info'; duration?: number };

type ToastContextType = {
  show: (message: string, opts?: { type?: 'success' | 'error' | 'info'; duration?: number }) => void;
};

const ToastContext = createContext<ToastContextType | null>(null);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const show = useCallback((message: string, opts?: { type?: 'success' | 'error' | 'info'; duration?: number }) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type: opts?.type || 'info', duration: opts?.duration || 3000 }]);
  }, []);

  useEffect(() => {
    const timers = toasts.map((t) => setTimeout(() => {
      setToasts((prev) => prev.filter((x) => x.id !== t.id));
    }, t.duration || 3000));
    return () => { timers.forEach(clearTimeout); };
  }, [toasts]);

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div style={{ position: 'fixed', bottom: 20, right: 20, zIndex: 9999, display: 'flex', flexDirection: 'column', gap: 8 }}>
        {toasts.map((t) => (
          <div key={t.id} style={{
            background: t.type === 'success' ? '#25a18e' : t.type === 'error' ? '#d64545' : '#333',
            color: '#fff',
            padding: '10px 12px',
            borderRadius: 6,
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
          }}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used within ToastProvider');
  return ctx;
};
