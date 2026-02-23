import React, { useEffect } from 'react';

export default function Toast({ message, onClose, duration = 3000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, duration);
    return () => clearTimeout(timer);
  }, [message, onClose, duration]);

  if (!message) return null;

  return (
    <div
      className="fixed z-50"
      style={{
        bottom: '80px',
        left: '50%',
        transform: 'translateX(-50%)',
        backgroundColor: '#1e293b',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        animation: 'modalIn 0.2s ease-out',
      }}
    >
      {message}
    </div>
  );
}
