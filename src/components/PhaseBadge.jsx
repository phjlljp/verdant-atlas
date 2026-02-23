import React from 'react';
import { PHASE_COLORS } from '../data/constants.js';
import { getPhaseAtDoy } from '../utils/timeline.js';

function getTodayDoy() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

const todayDoy = getTodayDoy();

export default function PhaseBadge({ tl }) {
  const phase = getPhaseAtDoy(tl, todayDoy);
  if (phase === 'dormant') return null;
  const c = PHASE_COLORS[phase];
  return (
    <span
      className="text-xs px-2 py-0.5 font-bold uppercase"
      style={{
        backgroundColor: c.bg,
        color: '#fff',
        letterSpacing: '0.08em',
        fontSize: '10px',
      }}
    >
      {c.label}
    </span>
  );
}
