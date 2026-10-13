import React, { useState, useEffect } from 'react';
import { AppNotification } from '../../services/notificationService';
import { Cpu, CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface ToastItem extends AppNotification {
  toastId: string;
}

export const NotificationToasts: React.FC<{ isDarkMode: boolean }> = ({ isDarkMode }) => {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  useEffect(() => {
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<AppNotification>;
      if (!customEvent.detail) return;

      const newToast: ToastItem = {
        ...customEvent.detail,
        toastId: `toast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      };

      setToasts((prev) => [...prev.slice(-3), newToast]);

      // Auto dismiss after 4 seconds
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.toastId !== newToast.toastId));
      }, 4200);
    };

    window.addEventListener('constructlab:toast', handleToastEvent);
    return () => window.removeEventListener('constructlab:toast', handleToastEvent);
  }, []);

  if (toasts.length === 0) return null;

  const getIcon = (type: AppNotification['type']) => {
    switch (type) {
      case 'circuit':
        return <Cpu className="w-4 h-4 text-blue-400" />;
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-amber-400" />;
      default:
        return <Info className="w-4 h-4 text-indigo-400" />;
    }
  };

  return (
    <div className="fixed bottom-12 right-5 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          className={`pointer-events-auto p-3.5 rounded-xl border shadow-2xl flex items-start gap-3 transition-all animate-in slide-in-from-bottom-5 duration-200 ${
            isDarkMode
              ? 'bg-slate-900/95 border-slate-700/80 text-slate-100 backdrop-blur-md'
              : 'bg-white/95 border-slate-200 text-slate-900 backdrop-blur-md'
          }`}
        >
          <div className="p-1.5 rounded-lg bg-blue-500/10 border border-blue-500/20 shrink-0 mt-0.5">
            {getIcon(toast.type)}
          </div>
          <div className="flex-1 min-w-0">
            <h5 className="font-bold text-xs truncate">{toast.title}</h5>
            <p className="text-[11px] text-slate-400 mt-0.5 leading-snug line-clamp-2">
              {toast.message}
            </p>
          </div>
          <button
            onClick={() => setToasts((prev) => prev.filter((t) => t.toastId !== toast.toastId))}
            className="p-1 text-slate-400 hover:text-slate-200 shrink-0"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ))}
    </div>
  );
};
