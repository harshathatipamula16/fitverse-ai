import { useApp } from '../context/AppContext.js';
import { X, CheckCircle, AlertTriangle, Info } from 'lucide-react';

export default function ToastContainer() {
  const { toasts, removeToast } = useApp();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-24 right-6 z-50 flex flex-col gap-3 max-w-sm w-full pointer-events-none" id="toast_container">
      {toasts.map((toast) => {
        let icon = <Info className="w-5 h-5 text-cyan-400" />;
        let borderClass = 'border-cyan-500/30 shadow-cyan-950/20';
        let bgClass = 'bg-black/80 backdrop-blur-md';

        if (toast.type === 'success') {
          icon = <CheckCircle className="w-5 h-5 text-emerald-400" />;
          borderClass = 'border-emerald-500/30 shadow-emerald-950/20';
        } else if (toast.type === 'error') {
          icon = <AlertTriangle className="w-5 h-5 text-red-400" />;
          borderClass = 'border-red-500/30 shadow-red-950/20';
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-xl border ${bgClass} ${borderClass} shadow-xl animate-fade-in transition-all`}
            id={`toast_item_${toast.id}`}
          >
            <div className="flex-shrink-0 mt-0.5">{icon}</div>
            <div className="flex-grow">
              <p className="text-sm font-semibold text-slate-100">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="flex-shrink-0 text-slate-400 hover:text-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
