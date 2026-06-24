import React from 'react';
import { CheckCircle, AlertCircle, Info, X } from 'lucide-react';
import { useShop } from '../context/ShopContext';

export default function ToastContainer() {
  const { toasts } = useShop();
  if (!toasts.length) return null;

  return (
    <div className="toast-container">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          {t.type === 'success' && <CheckCircle size={18} color="#10b981" />}
          {t.type === 'error' && <AlertCircle size={18} color="#ef4444" />}
          {t.type === 'info' && <Info size={18} color="#06b6d4" />}
          <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{t.message}</span>
        </div>
      ))}
    </div>
  );
}
