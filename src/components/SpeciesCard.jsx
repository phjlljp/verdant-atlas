import React from 'react';
import { PHASE_COLORS, HEIGHT_LABELS, SPACING_DATA } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';
import { getCountdown } from '../utils/timeline.js';
import { ChevronDown, ChevronUp } from './Icons.jsx';
import YearBar from './YearBar.jsx';
import PhaseBadge from './PhaseBadge.jsx';
import KeyDates from './KeyDates.jsx';
import VarietyChip from './VarietyChip.jsx';

function getTodayDoy() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  return Math.floor((now - start) / 86400000);
}

const todayDoy = getTodayDoy();

export default function SpeciesCard({
  sd,
  expanded,
  onToggle,
  myGarden,
  gardenNotes,
  onToggleGarden,
  onSelectVariety,
  searchTerm,
  filterMyGarden,
  compareMode,
  compareSpecies,
  onToggleCompare,
  focused,
  dragProps,
}) {
  const isVegetable = sd.category === 'vegetable';
  const borderColor = isVegetable
    ? (PHASE_COLORS.harvest?.bg || '#f97316')
    : (sd.bloomColor || '#94a3b8');
  const bloomColor = sd.bloomColor || '#94a3b8';

  // Species thumbnail: prefer second variety with image, fallback to first
  const withImg = sd.varieties.filter((v) => v.img);
  const thumbPick = withImg.length > 1 ? withImg[1] : withImg[0];

  // Variety count display
  const selCount = sd.varieties.filter((v) => myGarden[sd.species + '||' + v.name]).length;
  const countDisplay = (() => {
    const prefix = selCount > 0 ? `${selCount}/` : '';
    if (searchTerm) {
      const matchCount = sd.varieties.filter((v) =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
      ).length;
      if (matchCount < sd.varieties.length) {
        return (
          <span>
            {prefix}
            <span style={{ color: '#16a34a', fontWeight: 700 }}>{matchCount}</span> of{' '}
            {sd.varieties.length} var
          </span>
        );
      }
    }
    return (
      <span>
        {prefix}
        {sd.varieties.length} var
      </span>
    );
  })();

  // Countdown
  const cd = getCountdown(sd.tl, todayDoy);

  // Varieties to display
  const displayVarieties = filterMyGarden
    ? sd.varieties.filter((v) => myGarden[sd.species + '||' + v.name])
    : sd.varieties;

  return (
    <div
      {...(dragProps || {})}
      className={'species-card overflow-hidden ' + (expanded ? 'species-card-expanded' : 'species-card-collapsed')}
      style={{
        border: '1px solid #e2e8f0',
        borderLeft: `4px solid ${borderColor}`,
        backgroundColor: '#fff',
        borderRadius: '8px',
        opacity: dragProps?.style?.opacity ?? 1,
        cursor: filterMyGarden ? 'grab' : 'default',
        outline: focused ? '2px solid #6366f1' : 'none',
        outlineOffset: '2px',
      }}
    >
      <div className="flex gap-4 px-5 py-4 flex-col sm:flex-row">
        {/* Species thumbnail */}
        {thumbPick ? (
          <div className="img-skeleton shrink-0 hidden sm:block" style={{ width: '80px', height: '80px' }}>
            <img
              src={thumbPick.img}
              alt={sd.species}
              style={{ width: '80px', height: '80px', objectFit: 'cover', border: '1px solid #e2e8f0', position: 'relative', zIndex: 1 }}
              loading="lazy"
              onLoad={(e) => { e.target.parentElement.classList.remove('img-skeleton'); }}
              onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.remove('img-skeleton'); }}
            />
          </div>
        ) : (
          <div className="shrink-0 hidden sm:flex items-center justify-center" style={{ width: '80px', height: '80px', backgroundColor: '#f1f5f9', border: '1px solid #e2e8f0' }}>
            <span style={{ fontSize: '24px', color: '#cbd5e1' }}>&#10047;</span>
          </div>
        )}

        {/* Info column */}
        <div className="flex-1 min-w-0 flex flex-col">
          {/* Name row */}
          <button
            onClick={onToggle}
            className="species-name-btn flex items-center gap-2 mb-1.5 text-left w-full"
            style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer' }}
          >
            {compareMode && (
              <input
                type="checkbox"
                checked={compareSpecies?.includes(sd.species) || false}
                onChange={onToggleCompare}
                onClick={(e) => e.stopPropagation()}
                style={{ marginRight: '6px', accentColor: '#6366f1' }}
              />
            )}
            {filterMyGarden && (
              <span style={{ color: '#94a3b8', fontSize: '14px', cursor: 'grab', userSelect: 'none' }} title="Drag to reorder">
                &#10239;
              </span>
            )}
            <span
              className="shrink-0 flex items-center justify-center"
              style={{
                width: '22px', height: '22px', borderRadius: '4px',
                backgroundColor: expanded ? '#6366f1' : '#f1f5f9',
                transition: 'all 0.15s ease',
              }}
            >
              {expanded
                ? <ChevronUp size={13} style={{ color: '#fff' }} />
                : <ChevronDown size={13} style={{ color: '#94a3b8' }} />}
            </span>
            <span className="font-bold truncate" style={{ fontSize: '17px', letterSpacing: '2px', textTransform: 'uppercase', color: '#1e293b' }}>
              {sd.species}
            </span>
            <span className="text-xs tabular-nums" style={{ color: '#94a3b8' }}>
              {countDisplay}
            </span>
            <PhaseBadge tl={sd.tl} />
            {cd && (
              <span style={{ fontSize: '10px', color: '#f59e0b', fontWeight: 600 }}>
                {cd.label} in {cd.days}d
              </span>
            )}
          </button>

          {/* Timeline bar */}
          <div className="mb-2">
            <YearBar tl={sd.tl} height={20} />
          </div>

          {/* Collapsed summary */}
          {!expanded && (
            <div className="flex items-center gap-3 flex-wrap" style={{ fontSize: '10px', color: '#94a3b8', paddingBottom: '2px' }}>
              <span className="capitalize" style={{ color: '#64748b', fontWeight: 600 }}>{sd.type}</span>
              {sd.frostHardy && <span style={{ color: '#64748b' }}>Frost hardy</span>}
              <span>{sd.sowMethod.map((m) => m === 'startIndoors' ? 'Indoor' : 'Direct sow').join(' + ')}</span>
              <span>{isVegetable ? `Harvest ${formatDoy(sd.tl.harvestStart || sd.tl.bloomStart)}` : `Bloom ${formatDoy(sd.tl.bloomStart)}`}</span>
              {sd.deerResistant && <span>&#128737;&#65039;</span>}
            </div>
          )}

          {/* Expanded detail rows */}
          {expanded && (
            <div className="card-expand-enter" style={{ fontSize: '11px', lineHeight: '20px', color: '#64748b' }}>
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Type</span>
                <span className="capitalize font-bold" style={{ color: '#475569' }}>{sd.type}</span>
                {sd.frostHardy && (
                  <span className="px-1.5 py-0 font-bold" style={{ backgroundColor: '#f1f5f9', color: '#64748b', fontSize: '10px', lineHeight: '18px', border: '1px solid #e2e8f0' }}>
                    Frost hardy
                  </span>
                )}
              </div>
              <div className="flex gap-2 items-center">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Sow</span>
                <span className="flex items-center gap-1.5">
                  {sd.sowMethod.map((m, mi) => (
                    <span
                      key={mi}
                      className="font-bold"
                      style={{
                        color: '#fff',
                        backgroundColor: m === 'startIndoors' ? PHASE_COLORS.indoor.bg : PHASE_COLORS.sow.bg,
                        fontSize: '9px', padding: '2px 6px', borderRadius: '3px',
                        letterSpacing: '0.3px', textTransform: 'uppercase',
                      }}
                    >
                      {m === 'startIndoors' ? 'Indoor' : 'Direct'}
                    </span>
                  ))}
                  {sd.sowMethod.length > 1 && (
                    <span style={{ fontSize: '9px', color: '#f59e0b', fontWeight: 700 }}>BOTH</span>
                  )}
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Germination</span>
                <span className="font-bold tabular-nums" style={{ color: '#475569' }}>
                  {sd.germination ? `${sd.germination[0]}\u2013${sd.germination[1]} days` : '?'}
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>{isVegetable ? 'Maturity' : 'Bloom'}</span>
                <span className="font-bold tabular-nums" style={{ color: '#475569' }}>
                  {isVegetable
                    ? (sd.daysToMaturity ? `${sd.daysToMaturity[0]}\u2013${sd.daysToMaturity[1]} days` : '?')
                    : (sd.bloomDays ? `${sd.bloomDays[0]}\u2013${sd.bloomDays[1]} days` : '?')}
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Sun</span>
                <span className="font-bold tabular-nums" style={{ color: '#475569' }}>
                  {sd.sun ? `${sd.sun[0]}\u2013${sd.sun[1]} hr` : '?'}
                </span>
              </div>
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Height</span>
                <span className="font-bold" style={{ color: '#475569' }}>{HEIGHT_LABELS[sd.height] || '?'}</span>
              </div>
              {sd.height && SPACING_DATA[sd.height] && (
                <div className="flex gap-2 items-center">
                  <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Spacing</span>
                  <span className="flex items-center gap-2">
                    <svg width="80" height="20" viewBox="0 0 80 20">
                      <line x1="0" y1="18" x2="80" y2="18" stroke="#e2e8f0" strokeWidth="1" />
                      {(() => {
                        const sp = SPACING_DATA[sd.height];
                        const count = Math.min(Math.floor(72 / (sp.spacing * 72 / 36)) + 1, 5);
                        const gap = 72 / Math.max(count - 1, 1);
                        return Array.from({ length: count }, (_, i) => {
                          const cx = 4 + i * gap;
                          return (
                            <g key={i}>
                              <line x1={cx} y1="18" x2={cx} y2="8" stroke="#16a34a" strokeWidth="1.5" />
                              <circle cx={cx} cy="6" r="3" fill="#16a34a" opacity="0.6" />
                            </g>
                          );
                        });
                      })()}
                      {(() => {
                        const sp = SPACING_DATA[sd.height];
                        const count = Math.min(Math.floor(72 / (sp.spacing * 72 / 36)) + 1, 5);
                        if (count < 2) return null;
                        const gap = 72 / Math.max(count - 1, 1);
                        return (
                          <>
                            <line x1="4" y1="2" x2={4 + gap} y2="2" stroke="#94a3b8" strokeWidth="0.5" />
                            <line x1="4" y1="0" x2="4" y2="4" stroke="#94a3b8" strokeWidth="0.5" />
                            <line x1={4 + gap} y1="0" x2={4 + gap} y2="4" stroke="#94a3b8" strokeWidth="0.5" />
                          </>
                        );
                      })()}
                    </svg>
                    <span className="font-bold" style={{ color: '#475569', fontSize: '11px' }}>
                      {SPACING_DATA[sd.height].label}
                    </span>
                  </span>
                </div>
              )}
              {sd.type === 'perennial' && sd.firstYearBloom === false && (
                <div className="flex gap-2 items-center">
                  <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Note</span>
                  <span style={{ color: '#f59e0b', fontSize: '10px', fontWeight: 600 }}>May not bloom first year from seed</span>
                </div>
              )}
              {sd.type === 'annual' && sd.sowMethod.includes('directSow') && (sd.bloomDuration || sd.harvestDuration) && (sd.bloomDuration || sd.harvestDuration) <= 45 && (
                <div className="flex gap-2 items-start">
                  <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Succession</span>
                  <div style={{ fontSize: '10px', color: '#16a34a', fontWeight: 600 }}>
                    <span>Sow every 2\u20133 weeks for continuous {isVegetable ? 'harvest' : 'bloom'}:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {(() => {
                        const dates = [];
                        const interval = 14;
                        const start = sd.tl.sowStart;
                        const end = sd.tl.sowEnd || (sd.tl.sowStart + 42);
                        for (let d = start; d <= end; d += interval) {
                          dates.push(d);
                        }
                        return dates.map((d, i) => (
                          <span key={i} style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>
                            {formatDoy(d)}
                          </span>
                        ));
                      })()}
                    </div>
                  </div>
                </div>
              )}
              <div className="flex gap-2">
                <span style={{ width: '90px', color: '#94a3b8', flexShrink: 0 }}>Key dates</span>
                <KeyDates tl={sd.tl} />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Expanded: variety card grid */}
      {expanded && (
        <div style={{ borderTop: '1px solid #e2e8f0', backgroundColor: '#f8fafc' }} className="px-5 py-4">
          <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))' }}>
            {displayVarieties.map((v, i) => {
              const key = sd.species + '||' + v.name;
              return (
                <VarietyChip
                  key={i}
                  variety={v}
                  species={sd.species}
                  inGarden={!!myGarden[key]}
                  hasNotes={!!gardenNotes?.[key]}
                  onToggleGarden={() => onToggleGarden(sd.species, v.name)}
                  onSelect={() => onSelectVariety(v, sd)}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
