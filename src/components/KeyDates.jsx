import React from 'react';
import { PHASE_COLORS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';

export default function KeyDates({ tl }) {
  const parts = [];
  if (tl.indoorStart) parts.push({ label: 'Indoor', date: formatDoy(tl.indoorStart), color: PHASE_COLORS.indoor.bg });
  if (tl.transplant) parts.push({ label: 'Transplant', date: formatDoy(tl.transplant), color: PHASE_COLORS.transplant.bg });
  if (tl.sowStart) parts.push({ label: 'Sow', date: formatDoy(tl.sowStart), color: PHASE_COLORS.sow.bg });
  parts.push({ label: 'Bloom', date: formatDoy(tl.bloomStart), color: PHASE_COLORS.bloom.bg });

  return (
    <div className="flex flex-wrap gap-x-3.5 gap-y-0.5 text-xs text-stone-500">
      {parts.map((p, i) => (
        <span key={i} className="flex items-center gap-1.5">
          <span
            className="inline-block w-1.5 h-1.5 rounded-full"
            style={{ backgroundColor: p.color }}
          />
          <span className="font-medium text-stone-600">{p.label}</span>{' '}
          <span className="tabular-nums">{p.date}</span>
        </span>
      ))}
    </div>
  );
}
