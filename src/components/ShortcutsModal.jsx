const SHORTCUTS = [
  ['j / ↓', 'Next species card'],
  ['k / ↑', 'Previous species card'],
  ['Enter', 'Expand/collapse focused card'],
  ['?', 'Toggle this help'],
  ['← →', 'Browse varieties in modal'],
  ['Esc', 'Close modal or overlay'],
];

export default function ShortcutsModal({ onClose }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div style={{ backgroundColor: '#fff', borderRadius: '12px', padding: '24px', maxWidth: '360px', boxShadow: '0 20px 60px rgba(0,0,0,0.15)' }} onClick={e => e.stopPropagation()}>
        <h3 style={{ fontSize: '14px', fontWeight: 700, marginBottom: '16px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px' }}>Keyboard Shortcuts</h3>
        <div style={{ fontSize: '13px', lineHeight: 2, color: '#94a3b8' }}>
          {SHORTCUTS.map(([key, desc], i) => (
            <div key={i} className="flex gap-3">
              <kbd style={{ fontFamily: 'monospace', backgroundColor: '#f8fafc', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 700, minWidth: '40px', textAlign: 'center', color: '#1e293b' }}>{key}</kbd>
              <span>{desc}</span>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: '16px', fontSize: '12px', color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer' }}>Close</button>
      </div>
    </div>
  );
}
