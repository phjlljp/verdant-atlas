import { useMemo } from 'react';
import { HEIGHT_LABELS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';

export default function ComparePanel({ compareSpecies, speciesData, onClear }) {
  const comparison = useMemo(() => {
    if (compareSpecies.length !== 2) return null;
    const [a, b] = compareSpecies.map(name => speciesData.find(s => s.species === name)).filter(Boolean);
    if (!a || !b) return null;

    const rows = [
      { label: 'Type', a: a.type, b: b.type },
      { label: 'Height', a: HEIGHT_LABELS[a.height] || '?', b: HEIGHT_LABELS[b.height] || '?' },
      { label: 'Frost Hardy', a: a.frostHardy ? 'Yes' : 'No', b: b.frostHardy ? 'Yes' : 'No' },
      { label: 'Sow Method', a: a.sowMethod.join(', '), b: b.sowMethod.join(', ') },
      { label: 'Bloom Start', a: formatDoy(a.tl.bloomStart), b: formatDoy(b.tl.bloomStart) },
      { label: 'Bloom End', a: formatDoy(a.tl.bloomEnd), b: formatDoy(b.tl.bloomEnd) },
      { label: 'Bloom Duration', a: (a.bloomDuration || 60) + 'd', b: (b.bloomDuration || 60) + 'd' },
      { label: 'Varieties', a: String(a.varieties.length), b: String(b.varieties.length) },
      { label: 'Deer Resistant', a: a.deerResistant ? '🛡️ Yes' : 'No', b: b.deerResistant ? '🛡️ Yes' : 'No' },
      { label: 'Companions', a: a.companions.join(', ') || 'None', b: b.companions.join(', ') || 'None' },
    ];

    const isCompanion = a.companions.includes(b.species) || b.companions.includes(a.species);
    const bloomOverlap = Math.max(0, Math.min(a.tl.bloomEnd, b.tl.bloomEnd) - Math.max(a.tl.bloomStart, b.tl.bloomStart));

    return { a, b, rows, isCompanion, bloomOverlap };
  }, [compareSpecies, speciesData]);

  if (!comparison) return null;

  const { a, b, rows, isCompanion, bloomOverlap } = comparison;

  return (
    <div style={{ backgroundColor: '#fff', border: '2px solid #6366f1', borderRadius: '8px', padding: '16px 20px', marginBottom: '12px' }}>
      <div className="flex items-center justify-between mb-3">
        <span style={{ fontSize: '12px', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '1px' }}>Comparison</span>
        <button onClick={onClear} style={{ fontSize: '11px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer' }}>Clear</button>
      </div>
      <table style={{ width: '100%', fontSize: '12px', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={{ textAlign: 'left', padding: '4px 8px', color: '#94a3b8', fontWeight: 400, fontSize: '10px', textTransform: 'uppercase', borderBottom: '1px solid #e2e8f0' }}></th>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', borderBottom: '1px solid #e2e8f0' }}>{a.species}</th>
            <th style={{ textAlign: 'left', padding: '4px 8px', fontWeight: 700, color: '#1e293b', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '11px', borderBottom: '1px solid #e2e8f0' }}>{b.species}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={i} style={{ backgroundColor: i % 2 === 0 ? 'transparent' : '#f8fafc' }}>
              <td style={{ padding: '4px 8px', color: '#94a3b8', fontWeight: 400, fontSize: '10px', textTransform: 'uppercase' }}>{r.label}</td>
              <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 600 }}>{r.a}</td>
              <td style={{ padding: '4px 8px', color: '#475569', fontWeight: 600 }}>{r.b}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {bloomOverlap > 0 && <p style={{ fontSize: '11px', color: '#16a34a', marginTop: '8px' }}>Bloom overlap: {bloomOverlap} days</p>}
      {isCompanion && <p style={{ fontSize: '11px', color: '#6366f1', marginTop: '4px' }}>These species are companions ✓</p>}
    </div>
  );
}
