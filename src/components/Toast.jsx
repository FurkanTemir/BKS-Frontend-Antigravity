import React, { createContext, useContext, useState } from 'react';
import { FiX, FiCheckCircle, FiAlertCircle, FiInfo, FiAlertTriangle } from 'react-icons/fi';

// --- TOAST CONTEXT ---
const ToastContext = createContext();

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    // ToastProvider yoksa fallback fonksiyon döndür
    return {
      showToast: (message, type) => {
        console.warn('ToastProvider not found. Using console:', message);
        // Fallback: alert kullan
        if (type === 'error') {
          alert(`Hata: ${message}`);
        } else if (type === 'success') {
          alert(`Başarılı: ${message}`);
        } else {
          alert(message);
        }
      }
    };
  }
  return context;
};

// --- TOAST PROVIDER ---
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const showToast = (message, type = 'info', duration = 3000) => {
    const id = Date.now() + Math.random();
    const toast = { id, message, type };
    
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, duration);
  };

  const removeToast = (id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </ToastContext.Provider>
  );
};

// --- TOAST CONTAINER ---
const ToastContainer = ({ toasts, onRemove }) => {
  if (toasts.length === 0) return null;

  return (
    <div className="toast-container">
      {toasts.map(toast => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  );
};

// --- TOAST ITEM ---
const ToastItem = ({ toast, onRemove }) => {
  const icons = {
    success: FiCheckCircle,
    error: FiAlertCircle,
    warning: FiAlertTriangle,
    info: FiInfo
  };

  const Icon = icons[toast.type] || FiInfo;

  return (
    <div className={`toast toast-${toast.type}`}>
      <Icon className="toast-icon" size={20} />
      <span className="toast-message">{toast.message}</span>
      <button
        className="toast-close"
        onClick={() => onRemove(toast.id)}
        aria-label="Kapat"
      >
        <FiX size={16} />
      </button>
    </div>
  );
};

