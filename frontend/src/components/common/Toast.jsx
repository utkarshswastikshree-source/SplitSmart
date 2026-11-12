import React from 'react';
import { useApp } from '../../context/AppContext';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';
import { cn } from '../../utils/cn';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (!toasts || toasts.length === 0) return null;

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    warning: AlertTriangle,
    info: Info,
  };

  const colors = {
    success: 'border-emerald-200 bg-white text-emerald-800 shadow-elevated',
    error: 'border-rose-200 bg-white text-rose-800 shadow-elevated',
    warning: 'border-amber-200 bg-white text-amber-800 shadow-elevated',
    info: 'border-brand-200 bg-white text-brand-900 shadow-elevated',
  };

  const iconColors = {
    success: 'text-emerald-500',
    error: 'text-rose-500',
    warning: 'text-amber-500',
    info: 'text-brand-600',
  };

  return (
    <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
      {toasts.map((toast) => {
        const Icon = icons[toast.type] || Info;

        return (
          <div
            key={toast.id}
            className={cn(
              'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in fade-in slide-in-from-bottom-3',
              colors[toast.type] || colors.info
            )}
          >
            <Icon className={cn('w-5 h-5 shrink-0 mt-0.5', iconColors[toast.type])} />
            <div className="flex-1 min-w-0">
              {toast.title && (
                <h5 className="text-sm font-bold text-navy-900 leading-snug">{toast.title}</h5>
              )}
              {toast.message && (
                <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{toast.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-slate-400 hover:text-slate-600 transition-colors p-1 -mr-1 -mt-1 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}

