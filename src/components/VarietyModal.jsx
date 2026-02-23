import React, { useState, useEffect, useCallback } from 'react';
import { PHASE_COLORS, HEIGHT_LABELS, SPACING_DATA, MONTHS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';
import { ExternalLink } from './Icons.jsx';
import YearBar from './YearBar.jsx';

export default function VarietyModal({
  variety,
  speciesData,
  myGarden,
  gardenNotes,
  onClose,
  onNavigate,
  onToggleGarden,
  onUpdateNotes,
  onSearchCompanion,
}) {
  const [modalTab, setModalTab] = useState('details');

  // Reset tab on variety change
  useEffect(() => {
    setModalTab('details');
  }, [variety?.name]);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  // Keyboard navigation
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === 'Escape') { onClose(); return; }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        onNavigate(e.key === 'ArrowLeft' ? -1 : 1);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [onClose, onNavigate]);

  if (!variety) return null;

  const sd = speciesData.find(s => s.species === variety.species);
  const idx = sd ? sd.varieties.findIndex(v => v.name === variety.name) : -1;
  const hasMultiple = sd && sd.varieties.length > 1;
  const gardenKey = variety.species + '||' + variety.name;
  const inGarden = !!myGarden[gardenKey];

  return (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 z-50 backdrop-enter"
      style={{ backgroundColor: 'rgba(0,0,0,0.3)' }}
      onClick={onClose}
    >
      <div
        className="max-w-lg w-full max-h-[90vh] overflow-y-auto modal-enter"
        style={{
          backgroundColor: '#fff',
          border: '1px solid #e2e8f0',
          boxShadow: '0 20px 60px rgba(0,0,0,0.15), 0 4px 12px rgba(0,0,0,0.08)',
          borderRadius: '12px',
          position: 'relative',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Navigation arrows */}
        {hasMultiple && (
          <>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(-1); }}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              style={{ left: '-40px', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', color: '#64748b', zIndex: 51 }}
            >
              ‹
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onNavigate(1); }}
              className="absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center"
              style={{ right: '-40px', backgroundColor: 'rgba(255,255,255,0.9)', border: '1px solid #e2e8f0', borderRadius: '50%', cursor: 'pointer', fontSize: '16px', color: '#64748b', zIndex: 51 }}
            >
              ›
            </button>
          </>
        )}

        {/* Header with image */}
        <div className="relative">
          {variety.img ? (
            <div>
              <div className="img-skeleton" style={{ width: '100%', height: '160px' }}>
                <img
                  src={variety.img}
                  alt={variety.name}
                  style={{ width: '100%', height: '160px', objectFit: 'cover', position: 'relative', zIndex: 1 }}
                  loading="lazy"
                  onLoad={(e) => { e.target.parentElement.classList.remove('img-skeleton'); }}
                  onError={(e) => { e.target.parentElement.style.display = 'none'; }}
                />
              </div>
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.3) 50%, transparent 100%)' }} />
            </div>
          ) : (
            <div style={{ height: '64px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }} />
          )}
          <div className="absolute bottom-0 left-0 right-0 p-5">
            <h2 className="font-bold" style={{ fontSize: '18px', letterSpacing: '2px', textTransform: 'uppercase', color: '#1e293b' }}>
              {variety.name}
            </h2>
            <button
              onClick={(e) => { e.stopPropagation(); onToggleGarden(variety.species, variety.name); }}
              style={{ fontSize: '20px', cursor: 'pointer', background: 'none', border: 'none', color: '#1e293b' }}
            >
              {inGarden ? '★' : '☆'}
            </button>
            <p className="text-sm" style={{ color: '#94a3b8' }}>{variety.species}</p>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-3 right-3 w-9 h-9 flex items-center justify-center text-lg font-bold"
            style={{ backgroundColor: '#fff', color: '#1e293b', border: '1px solid #e2e8f0', borderRadius: '8px', transition: 'background 0.15s', cursor: 'pointer' }}
            onMouseEnter={(e) => { e.target.style.backgroundColor = '#f8fafc'; }}
            onMouseLeave={(e) => { e.target.style.backgroundColor = '#fff'; }}
          >
            &times;
          </button>
        </div>

        {/* Tab bar */}
        <div className="segment-group flex" style={{ margin: '0 20px', marginTop: '12px', border: '1px solid #e2e8f0' }}>
          {['details', 'timeline', 'companions'].map(tab => (
            <button
              key={tab}
              onClick={() => setModalTab(tab)}
              style={{
                flex: 1, padding: '8px 0', fontSize: '11px', fontWeight: 700,
                textTransform: 'uppercase', letterSpacing: '1px', cursor: 'pointer',
                backgroundColor: modalTab === tab ? '#6366f1' : '#f8fafc',
                color: modalTab === tab ? '#fff' : '#94a3b8',
                border: 'none',
              }}
            >
              {tab === 'details' ? 'Details' : tab === 'timeline' ? 'Timeline' : 'Companions'}
            </button>
          ))}
        </div>

        <div className="p-5 space-y-4">
          {/* Navigation hint */}
          {hasMultiple && (
            <div style={{ textAlign: 'center', paddingBottom: '4px' }}>
              <span style={{ fontSize: '11px', color: '#94a3b8' }}>{idx + 1} of {sd.varieties.length} varieties</span>
              <span style={{ fontSize: '10px', color: '#c7d2fe', marginLeft: '8px', backgroundColor: '#eef2ff', padding: '2px 8px', borderRadius: '4px' }}>← → keys to browse</span>
            </div>
          )}

          {/* DETAILS TAB */}
          {modalTab === 'details' && (
            <>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Type', value: variety.type, capitalize: true },
                  { label: 'Frost Hardy', value: variety.frostHardy ? 'Yes' : 'No' },
                  { label: 'Sun', value: variety.sun ? `${variety.sun[0]}–${variety.sun[1]}hr` : 'Full' },
                  { label: 'Height', value: HEIGHT_LABELS[variety.height] || '?' },
                  { label: 'Spacing', value: SPACING_DATA[variety.height]?.label || '?' },
                  { label: 'Germination', value: variety.germination ? `${variety.germination[0]}–${variety.germination[1]}d` : '?' },
                  { label: variety.daysToMaturity ? 'Days to Harvest' : 'Days to Bloom', value: variety.daysToMaturity ? `${variety.daysToMaturity[0]}–${variety.daysToMaturity[1]}d` : variety.bloomDays ? `${variety.bloomDays[0]}–${variety.bloomDays[1]}d` : '?' },
                  { label: 'Sowing', value: variety.sowMethod ? variety.sowMethod.map(m => m === 'startIndoors' ? 'Indoor' : 'Direct').join(' / ') : '?' },
                ].map((item, i) => (
                  <div key={i} className="text-center" style={{ backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', padding: '12px 8px', borderRadius: '6px' }}>
                    <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400, letterSpacing: '0.1em', marginBottom: '2px', textTransform: 'uppercase' }}>{item.label}</p>
                    <p className={`font-bold tabular-nums ${item.capitalize ? 'capitalize' : ''}`} style={{ fontSize: '12px', color: '#1e293b' }}>{item.value}</p>
                  </div>
                ))}
              </div>

              {variety.sowTiming && (
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <p style={{ fontSize: '12px', color: '#64748b', lineHeight: 1.5 }}>{variety.sowTiming}</p>
                </div>
              )}

              {variety.type === 'perennial' && variety.firstYearBloom === false && (
                <div style={{ backgroundColor: '#fffbeb', border: '1px solid #fde68a', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#92400e' }}>
                  Perennial may not bloom first year from seed. Plan for establishment.
                </div>
              )}

              {variety.type === 'annual' && variety.sowMethod?.includes('directSow') && variety.bloomDuration && variety.bloomDuration <= 45 && variety.tl && (
                <div style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '6px', padding: '8px 12px', fontSize: '12px', color: '#15803d', fontWeight: 600 }}>
                  <span>Succession sow every 2-3 weeks:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {(() => {
                      const dates = [];
                      const start = variety.tl.sowStart;
                      const end = variety.tl.sowEnd || (start + 42);
                      for (let d = start; d <= end; d += 14) dates.push(d);
                      return dates.map((d, i) => (
                        <span key={i} style={{ backgroundColor: '#f0fdf4', border: '1px solid #86efac', padding: '1px 6px', borderRadius: '3px', fontSize: '10px' }}>{formatDoy(d)}</span>
                      ));
                    })()}
                  </div>
                </div>
              )}

              {variety.flag && (
                <div style={{ backgroundColor: '#f8fafc', padding: '12px 14px', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                  <p style={{ fontSize: '12px', color: '#64748b' }}>&#9888; {variety.flag}</p>
                </div>
              )}

              {inGarden && (
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>Notes</p>
                  <textarea
                    value={gardenNotes[gardenKey] || ''}
                    onChange={(e) => onUpdateNotes(gardenKey, e.target.value)}
                    placeholder="Add planting notes, location, quantity..."
                    rows={3}
                    style={{ width: '100%', fontSize: '12px', padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: '6px', resize: 'vertical', fontFamily: 'Inter, sans-serif', color: '#1e293b', backgroundColor: '#f8fafc' }}
                  />
                </div>
              )}
            </>
          )}

          {/* TIMELINE TAB */}
          {modalTab === 'timeline' && variety.tl && (
            <>
              <div>
                <p className="font-bold mb-2.5" style={{ fontSize: '12px', color: '#1e293b', letterSpacing: '2px', textTransform: 'uppercase' }}>Timeline</p>
                <div className="space-y-2">
                  {[
                    variety.tl.indoorStart && { phase: 'indoor', label: 'Start indoors', date: formatDoy(variety.tl.indoorStart) },
                    variety.tl.hardenStart && { phase: 'harden', label: 'Harden off', date: formatDoy(variety.tl.hardenStart) },
                    variety.tl.transplant && { phase: 'transplant', label: 'Transplant', date: formatDoy(variety.tl.transplant) },
                    variety.tl.sowStart && { phase: 'sow', label: 'Direct sow', date: `${formatDoy(variety.tl.sowStart)} – ${formatDoy(variety.tl.sowEnd)}` },
                    { phase: 'germination', label: 'Germination', date: formatDoy(variety.tl.germEnd) },
                    variety.tl.harvestStart
                      ? { phase: 'harvest', label: 'Harvest begins', date: formatDoy(variety.tl.harvestStart) }
                      : variety.tl.bloomStart && { phase: 'bloom', label: 'First bloom', date: formatDoy(variety.tl.bloomStart) },
                    variety.tl.harvestEnd
                      ? { phase: 'harvest', label: 'Harvest ends', date: formatDoy(variety.tl.harvestEnd) }
                      : null,
                    { phase: 'decline', label: variety.type === 'annual' ? 'Frost kill' : 'Dormancy', date: formatDoy(variety.tl.seasonEnd) },
                  ].filter(Boolean).map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5" style={{ fontSize: '13px' }}>
                      <span className="inline-block w-2 h-2 shrink-0" style={{ backgroundColor: PHASE_COLORS[item.phase]?.bg }} />
                      <span style={{ color: '#94a3b8', width: '110px' }}>{item.label}</span>
                      <span className="font-bold tabular-nums" style={{ color: '#1e293b' }}>{item.date}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 400, marginBottom: '6px', letterSpacing: '0.1em', textTransform: 'uppercase' }}>Full year</p>
                <YearBar tl={variety.tl} height={16} showGridlines={false} bloomColor={variety.bloomColor} />
                <div className="flex justify-between mt-1" style={{ fontSize: '10px', color: '#94a3b8' }}>
                  {MONTHS.map(m => <span key={m}>{m[0]}</span>)}
                </div>
              </div>
            </>
          )}

          {/* COMPANIONS TAB */}
          {modalTab === 'companions' && (
            <>
              {variety.companions && variety.companions.length > 0 ? (
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>Companion Plants</p>
                  <div className="flex flex-wrap gap-2">
                    {variety.companions.map((comp, i) => {
                      const compSd = speciesData.find(s => s.species === comp);
                      return (
                        <button
                          key={i}
                          onClick={() => onSearchCompanion(comp)}
                          style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 14px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: 700, color: '#6366f1' }}
                        >
                          {compSd && compSd.bloomColor && <span style={{ width: 10, height: 10, borderRadius: '50%', backgroundColor: compSd.bloomColor, border: '1px solid rgba(0,0,0,0.1)' }} />}
                          {comp}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: '13px', color: '#64748b', textAlign: 'center', padding: '20px 0' }}>No companion data available for this species.</p>
              )}
              {/* Related species with similar bloom times */}
              {variety.tl && (
                <div>
                  <p style={{ fontSize: '10px', color: '#94a3b8', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px', marginTop: '8px' }}>Blooms at the Same Time</p>
                  <div className="flex flex-wrap gap-2">
                    {speciesData
                      .filter(s => s.species !== variety.species && Math.abs(s.tl.bloomStart - variety.tl.bloomStart) < 21)
                      .slice(0, 5)
                      .map(s => (
                        <button
                          key={s.species}
                          onClick={() => onSearchCompanion(s.species)}
                          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px', cursor: 'pointer', fontSize: '11px', fontWeight: 600, color: '#1e293b' }}
                        >
                          {s.bloomColor && <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: s.bloomColor }} />}
                          {s.species}
                          <span style={{ fontSize: '10px', color: '#94a3b8' }}>Bloom {formatDoy(s.tl.bloomStart)}</span>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </>
          )}

          {/* Buy link */}
          {variety.url && (
            <a
              href={variety.url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-2 font-bold w-full uppercase"
              style={{ backgroundColor: '#1e293b', color: '#fff', padding: '12px', fontSize: '12px', transition: 'all 0.15s', textDecoration: 'none', letterSpacing: '2px', border: '2px solid #1e293b', borderRadius: '4px' }}
              onMouseEnter={(e) => { e.target.style.backgroundColor = '#334155'; }}
              onMouseLeave={(e) => { e.target.style.backgroundColor = '#1e293b'; }}
            >
              Buy on rareseeds.com <ExternalLink size={14} />
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
