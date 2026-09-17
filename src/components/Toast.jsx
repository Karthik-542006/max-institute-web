import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

let toastTimeout;

export function useToast() {
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success', duration = 4000) => {
    clearTimeout(toastTimeout);
    setToast({ message, type, id: Date.now() });
    if (duration > 0) {
      toastTimeout = setTimeout(() => {
        setToast(null);
      }, duration);
    }
  };

  const hideToast = () => {
    clearTimeout(toastTimeout);
    setToast(null);
  };

  return { toast, showToast, hideToast };
}

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    error: <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-secondary shrink-0" />
  };

  const bgStyles = {
    success: 'bg-white border-emerald-200 text-slate-800 shadow-lg',
    error: 'bg-white border-red-200 text-slate-800 shadow-lg',
    info: 'bg-white border-blue-200 text-slate-800 shadow-lg'
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-md animate-fade-in">
      <div className={`flex items-center gap-3 px-4 py-3 rounded-xl border ${bgStyles[toast.type || 'success']}`}>
        {icons[toast.type || 'success']}
        <p className="text-sm font-medium pr-2">{toast.message}</p>
        <button
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 p-1 rounded-md transition-colors"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
