import { useState, useEffect, useCallback, createContext, useContext } from 'react';

/* ─── Toast System ─── */
const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now() + Math.random();
    setToasts(prev => [...prev, { id, message, type }]);
    if (duration > 0) setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ addToast }}>
      {children}
      <div className="aecc-toast-container">
        {toasts.map(t => (
          <div key={t.id} className={`aecc-toast aecc-toast-${t.type}`}>
            <i className={`fas ${t.type === 'success' ? 'fa-check-circle' : t.type === 'error' ? 'fa-exclamation-circle' : t.type === 'warning' ? 'fa-exclamation-triangle' : 'fa-info-circle'}`}></i>
            <span>{t.message}</span>
            <button className="aecc-toast-close" onClick={() => removeToast(t.id)}><i className="fas fa-times"></i></button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}

/* ─── Confirm Modal ─── */
const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [state, setState] = useState({ open: false, title: '', message: '', resolve: null, variant: 'danger' });

  const confirm = useCallback((message, title = 'Confirmation', variant = 'danger') => {
    return new Promise((resolve) => {
      setState({ open: true, title, message, resolve, variant });
    });
  }, []);

  function handleConfirm() {
    state.resolve?.(true);
    setState(s => ({ ...s, open: false }));
  }
  function handleCancel() {
    state.resolve?.(false);
    setState(s => ({ ...s, open: false }));
  }

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {state.open && (
        <div className="aecc-confirm-overlay" onClick={handleCancel}>
          <div className="aecc-confirm-box" onClick={e => e.stopPropagation()}>
            <div className={`aecc-confirm-icon aecc-confirm-icon-${state.variant}`}>
              <i className={`fas ${state.variant === 'danger' ? 'fa-trash-alt' : state.variant === 'warning' ? 'fa-exclamation-triangle' : 'fa-question-circle'}`}></i>
            </div>
            <h3 className="aecc-confirm-title">{state.title}</h3>
            <p className="aecc-confirm-message">{state.message}</p>
            <div className="aecc-confirm-actions">
              <button className="aecc-confirm-btn aecc-confirm-btn-cancel" onClick={handleCancel}>Annuler</button>
              <button className={`aecc-confirm-btn aecc-confirm-btn-${state.variant}`} onClick={handleConfirm}>
                {state.variant === 'danger' ? 'Supprimer' : 'Confirmer'}
              </button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
