import React, { useMemo } from 'react';
import { MONTHS, MONTH_START_DOY, MONTH_DAYS, PHASE_COLORS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';

function getTodayPct() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const doy = Math.floor((now - start) / 86400000);
  return (doy / 365) * 100;
}

function MonthLabels() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
      <span style={{ width: '140px', flexShrink: 0 }} />
      <div className="relative flex-1" style={{ height: '14px' }}>
        {MONTHS.map((m, mi) => {
          const left = (MONTH_START_DOY[mi] / 365) * 100;
          const width = (MONTH_DAYS[mi] / 365) * 100;
          return (
            <span key={m} className="absolute text-center" style={{ left: left + '%', width: width + '%', fontSize: '9px', fontWeight: 400, color: '#94a3b8', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
              {m}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function GanttRow({ sd, rowIdx, todayPct, phases, onClickSpecies }) {
  return (
    <div className="gantt-row" style={{ display: 'flex', alignItems: 'center', gap: '8px', backgroundColor: rowIdx % 2 === 0 ? 'transparent' : '#f8fafc', padding: '1px 4px', borderRadius: '2px' }}>
      <button
        onClick={() => onClickSpecies(sd.species)}
        className="truncate text-left"
        style={{ width: '140px', flexShrink: 0, fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#475569', background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
        title={'View ' + sd.species}
      >
        {sd.species}
      </button>
      <div style={{ flex: 1, height: '16px', position: 'relative', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
        {MONTH_START_DOY.slice(1).map((md, i) => (
          <div key={i} className="absolute top-0 bottom-0" style={{ left: (md / 365 * 100) + '%', width: '1px', backgroundColor: 'rgba(0,0,0,0.06)' }} />
        ))}
        {phases.map((p, pi) => (
          <div key={pi} title={p.label + ': ' + formatDoy(p.start) + ' – ' + formatDoy(p.end)}
            style={{ position: 'absolute', left: ((p.start - 1) / 365 * 100) + '%', width: Math.max(((p.end - p.start) / 365 * 100), 0.5) + '%', height: '100%', backgroundColor: p.color, top: 0 }} />
        ))}
        <div className="absolute" style={{ left: 'calc(' + todayPct + '% - 1px)', top: '-1px', bottom: '-1px', width: '2px', backgroundColor: '#c00', zIndex: 2 }} />
      </div>
    </div>
  );
}

export default function GanttView({ sortedFiltered, mode = 'bloom', onClickSpecies }) {
  const todayPct = useMemo(getTodayPct, []);

  const sortedData = useMemo(() => {
    const data = sortedFiltered.slice();
    if (mode === 'bloom') {
      return data.sort((a, b) => (a.tl.bloomStart || a.tl.harvestStart || 999) - (b.tl.bloomStart || b.tl.harvestStart || 999));
    }
    return data.sort((a, b) => {
      const aStart = a.tl.indoorStart || a.tl.sowStart || 999;
      const bStart = b.tl.indoorStart || b.tl.sowStart || 999;
      return aStart - bStart;
    });
  }, [sortedFiltered, mode]);

  const getPhases = (sd) => {
    if (mode === 'bloom') {
      const tl = sd.tl;
      // Show harvest bar for vegetables, bloom bar for flowers
      if (tl.harvestStart && tl.harvestEnd) {
        return [{ start: tl.harvestStart, end: tl.harvestEnd, color: PHASE_COLORS.harvest.bg, label: 'Harvest' }];
      }
      if (!tl.bloomStart || !tl.bloomEnd) return [];
      return [{ start: tl.bloomStart, end: tl.bloomEnd, color: PHASE_COLORS.bloom.bg, label: 'Bloom' }];
    }
    const tl = sd.tl;
    const phases = [];
    if (tl.indoorStart && tl.indoorEnd) phases.push({ start: tl.indoorStart, end: tl.indoorEnd, color: PHASE_COLORS.indoor.bg, label: 'Indoor' });
    if (tl.transplant) phases.push({ start: tl.transplant - 3, end: tl.transplant + 3, color: PHASE_COLORS.transplant.bg, label: 'Transplant' });
    if (tl.sowStart && tl.sowEnd) phases.push({ start: tl.sowStart, end: tl.sowEnd, color: PHASE_COLORS.sow.bg, label: 'Direct Sow' });
    if (tl.germStart && tl.germEnd) phases.push({ start: tl.germStart, end: tl.germEnd, color: PHASE_COLORS.germination.bg, label: 'Germination' });
    if (tl.harvestStart && tl.harvestEnd) phases.push({ start: tl.harvestStart, end: tl.harvestEnd, color: PHASE_COLORS.harvest.bg + '40', label: 'Harvest' });
    if (tl.bloomStart && tl.bloomEnd) phases.push({ start: tl.bloomStart, end: tl.bloomEnd, color: PHASE_COLORS.bloom.bg + '40', label: 'Bloom' });
    return phases;
  };

  // Gap analysis for bloom mode
  const gapAnalysis = useMemo(() => {
    if (mode !== 'bloom') return null;
    const sorted = sortedData.filter(s => s.tl.bloomStart && s.tl.bloomEnd);
    if (sorted.length === 0) return null;
    const start = Math.min(...sorted.map(s => s.tl.bloomStart));
    const end = Math.max(...sorted.map(s => s.tl.bloomEnd));
    const gaps = [];
    for (let d = start; d <= end; d++) {
      const anyBlooming = sorted.some(s => d >= s.tl.bloomStart && d <= s.tl.bloomEnd);
      if (!anyBlooming) {
        if (gaps.length === 0 || gaps[gaps.length - 1].end !== d - 1) {
          gaps.push({ start: d, end: d });
        } else {
          gaps[gaps.length - 1].end = d;
        }
      }
    }
    return { start, end, gaps };
  }, [sortedData, mode]);

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', color: '#1e293b' }}>
        {mode === 'bloom' ? 'Bloom & Harvest Calendar' : 'Planting Calendar'}
      </h3>
      <MonthLabels />
      <div className="space-y-1">
        {sortedData.map((sd, rowIdx) => (
          <GanttRow
            key={sd.species}
            sd={sd}
            rowIdx={rowIdx}
            todayPct={todayPct}
            phases={getPhases(sd)}
            onClickSpecies={onClickSpecies}
          />
        ))}
      </div>

      {/* Gap analysis for bloom mode */}
      {mode === 'bloom' && gapAnalysis && (
        gapAnalysis.gaps.length === 0 ? (
          <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0', fontSize: '11px', color: '#64748b' }}>
            Continuous bloom coverage from {formatDoy(gapAnalysis.start)} to {formatDoy(gapAnalysis.end)}.
          </div>
        ) : (
          <div style={{ marginTop: '12px', padding: '8px 12px', backgroundColor: '#f1f5f9', border: '1px solid #fca5a5', fontSize: '11px', color: '#64748b' }}>
            <p style={{ fontWeight: 700, color: '#c00', textTransform: 'uppercase', letterSpacing: '1px', fontSize: '10px', marginBottom: '4px' }}>Bloom Gaps</p>
            {gapAnalysis.gaps.map((gap, i) => (
              <p key={i}>{formatDoy(gap.start)} to {formatDoy(gap.end)} ({gap.end - gap.start + 1} days)</p>
            ))}
          </div>
        )
      )}

      {/* Legend for planting mode */}
      {mode === 'planting' && (
        <div className="flex gap-4 mt-4 flex-wrap" style={{ fontSize: '10px', color: '#64748b' }}>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.indoor.bg }} /> Indoor Start</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.transplant.bg }} /> Transplant</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.sow.bg }} /> Direct Sow</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.germination.bg }} /> Germination</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.harvest.bg + '40' }} /> Harvest (faded)</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '10px', height: '10px', backgroundColor: PHASE_COLORS.bloom.bg + '40' }} /> Bloom (faded)</span>
          <span className="flex items-center gap-1"><span style={{ display: 'inline-block', width: '2px', height: '10px', backgroundColor: '#c00' }} /> Today</span>
        </div>
      )}
    </div>
  );
}
