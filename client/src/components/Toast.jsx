// Add this component at the top of your file
import { useEffect } from "react";

export function Toast({ message, type, onClose }) {
  useEffect(() => {
    const t = setTimeout(onClose, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div style={{
      position: 'fixed',
      top: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      background: '#1e1e1e',
      color: '#fff',
      padding: '12px 20px',
      borderRadius: '8px',
      display: 'flex',
      alignItems: 'center',
      gap: '10px',
      zIndex: 9999,
      boxShadow: '0 4px 12px rgba(0,0,0,0.5)',
      borderLeft: `4px solid ${type === 'success' ? '#22c55e' : '#ef4444'}`,
      minWidth: '280px',
    }}>
      <span style={{ fontSize: '18px' }}>{type === 'success' ? '✅' : '🔴'}</span>
      <span style={{ flex: 1, fontSize: '14px' }}>{message}</span>
      <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#aaa', cursor: 'pointer', fontSize: '16px' }}>✕</button>
    </div>
  );
}