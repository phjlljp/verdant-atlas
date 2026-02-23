import { useCallback } from 'react';
import { GARDEN_PRESETS } from '../data/presets.js';

export default function GardenPresetsModal({ speciesData, myGarden, onClose, onSetGarden, onToast }) {
  const handleAdd = useCallback((preset) => {
    const newGarden = { ...myGarden };
    let added = 0;
    preset.species.forEach(sp => {
      const sd = speciesData.find(s => s.species === sp);
      if (sd && sd.varieties.length > 0 && !newGarden[sp + '||' + sd.varieties[0].name]) {
        newGarden[sp + '||' + sd.varieties[0].name] = true;
        added++;
      }
    });
    onSetGarden(newGarden);
    onClose();
    onToast(`Added ${added} varieties from ${preset.name}`);
  }, [myGarden, speciesData, onSetGarden, onClose, onToast]);

  return (
    <div className="fixed inset-0 z-50" style={{ backgroundColor: 'rgba(0,0,0,0.3)' }} onClick={onClose}>
      <div
        style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '340px', backgroundColor: '#fff', borderRadius: '12px', padding: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.2)', border: '1px solid #e2e8f0' }}
        onClick={e => e.stopPropagation()}
      >
        <h3 style={{ fontSize: '14px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '16px' }}>Garden Ideas</h3>
        <div className="space-y-3">
          {GARDEN_PRESETS.map(preset => (
            <div key={preset.name} style={{ padding: '12px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <div className="flex items-center justify-between mb-2">
                <span style={{ fontWeight: 700, fontSize: '13px', color: '#1e293b' }}>
                  <span style={{ marginRight: '6px' }}>{preset.icon}</span>{preset.name}
                </span>
                <button
                  onClick={() => handleAdd(preset)}
                  style={{ fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: '#6366f1', border: 'none', borderRadius: '6px', padding: '5px 12px', cursor: 'pointer' }}
                >
                  Add all
                </button>
              </div>
              <p style={{ fontSize: '11px', color: '#94a3b8' }}>{preset.species.join(', ')}</p>
            </div>
          ))}
        </div>
        <button onClick={onClose} style={{ marginTop: '12px', fontSize: '12px', color: '#cbd5e1', background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'center' }}>Close</button>
      </div>
    </div>
  );
}
