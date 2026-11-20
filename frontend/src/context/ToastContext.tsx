import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContextType {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const ToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  const addToast = useCallback((message: string, type: ToastType = 'info', duration: number = 4000) => {
    const id = Math.random().toString(36).substring(2, 9);
    setToasts(prev => [...prev, { id, message, type }]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
  }, [removeToast]);

  return (
    <ToastContext.Provider value={{ addToast, removeToast }}>
      {children}
      {/* Toast Render Container */}
      <div className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-md w-full pointer-events-none px-4">
        {toasts.map(toast => {
          const icons = {
            success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
            error: <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />,
            warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />,
            info: <Info className="w-5 h-5 text-blue-500 shrink-0" />
          };

          const borders = {
            success: 'border-emerald-500/20 bg-emerald-50/90 dark:bg-emerald-950/40 text-emerald-950 dark:text-emerald-200',
            error: 'border-rose-500/20 bg-rose-50/90 dark:bg-rose-950/40 text-rose-950 dark:text-rose-200',
            warning: 'border-amber-500/20 bg-amber-50/90 dark:bg-amber-950/40 text-amber-950 dark:text-amber-200',
            info: 'border-blue-500/20 bg-blue-50/90 dark:bg-blue-950/40 text-blue-950 dark:text-blue-200'
          };

          return (
            <div
              key={toast.id}
              className={`pointer-events-auto flex items-center justify-between gap-3 p-3.5 rounded-xl border shadow-lg backdrop-blur-md transition-all animate-in slide-in-from-bottom-2 ${borders[toast.type]}`}
            >
              <div className="flex items-center gap-2.5 text-sm font-medium">
                {icons[toast.type]}
                <span>{toast.message}</span>
              </div>
              <button
                onClick={() => removeToast(toast.id)}
                className="p-1 rounded-lg hover:bg-black/5 dark:hover:bg-white/10 transition-colors opacity-70 hover:opacity-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) throw new Error('useToast must be used within a ToastProvider');
  return context;
};
