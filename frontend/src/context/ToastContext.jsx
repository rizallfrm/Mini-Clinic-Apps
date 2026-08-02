import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, AlertTriangle, Info, X, HelpCircle } from 'lucide-react';

const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback((type, message, title) => {
    const id = Date.now() + Math.random().toString(36).substr(2, 9);
    const newToast = { id, type, message, title };

    setToasts((prev) => [...prev.slice(-4), newToast]); // max 5 toasts visible

    // Auto dismiss after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, [removeToast]);

  const confirm = useCallback(({
    title = 'Konfirmasi Tindakan',
    message,
    onConfirm,
    confirmText = 'Ya, Lanjutkan',
    cancelText = 'Batal',
    type = 'warning'
  }) => {
    setConfirmDialog({
      title,
      message,
      confirmText,
      cancelText,
      type,
      onConfirm: async () => {
        setConfirmDialog(null);
        if (onConfirm) await onConfirm();
      },
      onCancel: () => setConfirmDialog(null),
    });
  }, []);

  const toast = {
    success: (msg, title = 'Berhasil!') => addToast('success', msg, title),
    error: (msg, title = 'Gagal!') => addToast('error', msg, title),
    warning: (msg, title = 'Peringatan!') => addToast('warning', msg, title),
    info: (msg, title = 'Informasi') => addToast('info', msg, title),
    confirm,
  };

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Centered Top Floating Toast Container */}
      <div className="fixed top-5 left-1/2 -translate-x-1/2 z-[9999] flex flex-col gap-2.5 max-w-md w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <ToastItem key={t.id} toast={t} onClose={() => removeToast(t.id)} />
        ))}
      </div>

      {/* Confirmation Toast Dialog Modal */}
      {confirmDialog && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
          <div className="bg-white/95 border border-slate-200 shadow-2xl rounded-2xl max-w-sm w-full p-5 space-y-4 backdrop-blur-md animate-in zoom-in-95 duration-200">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-100/80 text-amber-600 shrink-0">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1 pt-0.5">
                <h3 className="text-sm font-bold text-slate-900">{confirmDialog.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{confirmDialog.message}</p>
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={confirmDialog.onCancel}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                {confirmDialog.cancelText}
              </button>
              <button
                type="button"
                onClick={confirmDialog.onConfirm}
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-sm transition"
              >
                {confirmDialog.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

const ToastItem = ({ toast, onClose }) => {
  const { type, message, title } = toast;

  const styles = {
    success: {
      bg: 'bg-emerald-50/95 border-emerald-300 text-emerald-950',
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
      bar: 'bg-emerald-500',
    },
    error: {
      bg: 'bg-rose-50/95 border-rose-300 text-rose-950',
      icon: <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />,
      bar: 'bg-rose-500',
    },
    warning: {
      bg: 'bg-amber-50/95 border-amber-300 text-amber-950',
      icon: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
      bar: 'bg-amber-500',
    },
    info: {
      bg: 'bg-sky-50/95 border-sky-300 text-sky-950',
      icon: <Info className="w-5 h-5 text-sky-600 shrink-0" />,
      bar: 'bg-sky-500',
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div
      className={`pointer-events-auto relative overflow-hidden rounded-xl border p-4 shadow-2xl backdrop-blur-md transition-all duration-300 animate-in slide-in-from-top-3 fade-in ${current.bg}`}
    >
      <div className="flex items-start gap-3">
        {current.icon}
        <div className="flex-1 pr-2">
          {title && <h4 className="text-xs font-bold uppercase tracking-wider mb-0.5">{title}</h4>}
          <p className="text-xs font-medium leading-relaxed opacity-90 whitespace-pre-line">{message}</p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 transition-colors p-0.5 rounded-lg hover:bg-black/5"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Progress Line */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/5">
        <div className={`h-full ${current.bar} animate-[toastProgress_4s_linear_forwards]`} />
      </div>
    </div>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
};
