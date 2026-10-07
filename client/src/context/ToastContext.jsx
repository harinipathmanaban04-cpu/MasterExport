import React, { createContext, useContext, useState, useCallback } from 'react';
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from 'lucide-react';

const ToastContext = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(({ type = 'info', title, message, duration = 3500 }) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newToast = { id, type, title, message, duration };

    setToasts((prev) => [...prev, newToast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    return id;
  }, [removeToast]);

  const toast = {
    success: (message, title = 'Success') => addToast({ type: 'success', title, message }),
    error: (message, title = 'Error') => addToast({ type: 'error', title, message }),
    info: (message, title = 'Notice') => addToast({ type: 'info', title, message }),
    warning: (message, title = 'Warning') => addToast({ type: 'warning', title, message }),
    dismiss: removeToast
  };

  // Expose toast globally to window and intercept legacy alert() calls
  React.useEffect(() => {
    window.toast = toast;
    const originalAlert = window.alert;

    window.alert = (msg) => {
      const text = String(msg || '');
      if (text.toLowerCase().includes('error') || text.toLowerCase().includes('fail')) {
        toast.error(text, 'Notification');
      } else if (text.toLowerCase().includes('require') || text.toLowerCase().includes('please')) {
        toast.warning(text, 'Attention');
      } else {
        toast.info(text, 'Notification');
      }
    };

    return () => {
      window.alert = originalAlert;
    };
  }, [toast]);

  return (
    <ToastContext.Provider value={toast}>
      {children}

      {/* Floating Toast Portal Container */}
      <div
        className="toast-container"
        style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          zIndex: 99999,
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
          maxWidth: '380px',
          width: 'calc(100vw - 40px)',
          pointerEvents: 'none'
        }}
      >
        {toasts.map((t) => {
          const isSuccess = t.type === 'success';
          const isError = t.type === 'error';
          const isWarning = t.type === 'warning';

          const accentColor = isSuccess ? '#059669' : isError ? '#dc2626' : isWarning ? '#d97706' : '#2563eb';
          const bgColor = isSuccess ? '#ecfdf5' : isError ? '#fef2f2' : isWarning ? '#fffbeb' : '#eff6ff';
          const borderColor = isSuccess ? '#a7f3d0' : isError ? '#fecaca' : isWarning ? '#fde68a' : '#bfdbfe';

          return (
            <div
              key={t.id}
              className="toast-item"
              style={{
                pointerEvents: 'auto',
                background: '#ffffff',
                border: `1.5px solid ${borderColor}`,
                borderLeft: `5px solid ${accentColor}`,
                borderRadius: '12px',
                padding: '12px 14px',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.12), 0 8px 10px -6px rgba(0, 0, 0, 0.08)',
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                animation: 'toastSlideIn 0.25s cubic-bezier(0.16, 1, 0.3, 1) forwards',
                transition: 'all 0.2s ease'
              }}
            >
              <div
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '8px',
                  background: bgColor,
                  color: accentColor,
                  display: 'grid',
                  placeItems: 'center',
                  flexShrink: 0
                }}
              >
                {isSuccess && <CheckCircle2 size={17} />}
                {isError && <AlertCircle size={17} />}
                {isWarning && <AlertTriangle size={17} />}
                {!isSuccess && !isError && !isWarning && <Info size={17} />}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <div style={{ fontSize: '13px', fontWeight: 700, color: '#0f172a', lineHeight: 1.3 }}>
                    {t.title}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#475569', marginTop: t.title ? '2px' : 0, lineHeight: 1.4 }}>
                  {t.message}
                </div>
              </div>

              <button
                type="button"
                onClick={() => removeToast(t.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '2px',
                  display: 'flex',
                  alignItems: 'center',
                  borderRadius: '4px',
                  transition: 'color 0.15s ease'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#1e293b')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#94a3b8')}
                title="Dismiss"
              >
                <X size={15} />
              </button>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}
