import React from 'react';
import { PHASE_COLORS } from '../data/constants.js';

function ActivitySection({ phase, label, items, onItemClick }) {
  if (items.length === 0) return null;
  return (
    <div style={{ borderLeft: '3px solid ' + PHASE_COLORS[phase].bg, backgroundColor: phaseBackground(phase), padding: '4px 10px', borderRadius: '0 4px 4px 0' }}>
      <span style={{ fontWeight: 700, color: PHASE_COLORS[phase].bg, textTransform: 'uppercase', fontSize: '9px', letterSpacing: '0.5px' }}>{label}</span>
      <span style={{ color: '#cbd5e1', marginLeft: '6px' }}>
        {items.map((item, idx) => (
          <React.Fragment key={idx}>
            {idx > 0 && ', '}
            <button
              onClick={() => onItemClick(item.species)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontWeight: 600, textDecoration: 'underline', textDecorationStyle: 'dotted', padding: 0 }}>
              {item.species}
            </button>
          </React.Fragment>
        ))}
      </span>
    </div>
  );
}

function phaseBackground(phase) {
  const map = {
    indoor: 'rgba(124,58,237,0.15)',
    transplant: 'rgba(37,99,235,0.15)',
    sow: 'rgba(22,163,106,0.15)',
    bloom: 'rgba(236,72,153,0.15)',
  };
  return map[phase] || 'rgba(100,116,139,0.15)';
}

export default function DashboardSummary({ dashboardItems, onItemClick }) {
  const hasActivity = dashboardItems.indoors.length > 0 ||
    dashboardItems.transplant.length > 0 ||
    dashboardItems.directSow.length > 0 ||
    dashboardItems.blooming.length > 0;

  return (
    <div className="mt-2 flex flex-wrap gap-2" style={{ fontSize: '11px' }}>
      <ActivitySection phase="indoor" label="Start indoors" items={dashboardItems.indoors} onItemClick={onItemClick} />
      <ActivitySection phase="transplant" label="Transplant" items={dashboardItems.transplant} onItemClick={onItemClick} />
      <ActivitySection phase="sow" label="Direct sow" items={dashboardItems.directSow} onItemClick={onItemClick} />
      <ActivitySection phase="bloom" label="Blooming" items={dashboardItems.blooming} onItemClick={onItemClick} />
      {!hasActivity && dashboardItems.nextUp && (
        <div style={{ borderLeft: '3px solid #475569', backgroundColor: 'rgba(100,116,139,0.15)', padding: '4px 10px', borderRadius: '0 4px 4px 0' }}>
          <span style={{ color: '#94a3b8' }}>Next: <strong style={{ color: '#e2e8f0' }}>{dashboardItems.nextUp.label}</strong> ({dashboardItems.nextUp.daysAway}d)</span>
        </div>
      )}
    </div>
  );
}
