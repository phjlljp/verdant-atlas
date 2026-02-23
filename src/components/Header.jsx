import React from 'react';
import { formatDoy } from '../utils/dates.js';
import DashboardSummary from './DashboardSummary.jsx';

/**
 * App header with title, frost date controls, ZIP lookup,
 * growing season bar, and dashboard/off-season panel.
 */
export default function Header({
  // Frost dates
  lastFrostOffset, setLastFrostOffset,
  firstFrostOffset, setFirstFrostOffset,
  customMidcoast,
  resetFrostOffsets,
  seasonWeeks,
  // ZIP lookup
  showZipInput, setShowZipInput,
  zipCode, setZipCode,
  zipResult,
  lookupZip,
  // Dashboard
  dashboardItems,
  onDashboardItemClick,
  // Stats
  totalVarieties,
  filteredCount,
  flowerCount,
  vegetableCount,
  // Today
  todayDoy,
  // Theme
  dm,
}) {
  return (
    <div style={{ borderBottom: '2px solid #334155', backgroundColor: dm.headerBg }}>
      <div className="max-w-6xl mx-auto px-5 py-3" style={{ paddingLeft: '20px', paddingRight: '20px' }}>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="font-bold" style={{ fontSize: '20px', letterSpacing: '4px', textTransform: 'uppercase', color: '#fff' }}>VERDANT ATLAS</h1>
            <p style={{ fontWeight: 400, color: '#94a3b8', letterSpacing: '3px', fontSize: '11px', textTransform: 'uppercase' }}>Planting Calendar</p>
            <p className="mt-1" style={{ fontWeight: 400, color: '#64748b', letterSpacing: '1px', fontSize: '11px' }}>Zone 5b &middot; {flowerCount} flowers, {vegetableCount} vegetables, {totalVarieties} varieties</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1" style={{ fontSize: '11px' }}>
              {/* Last frost controls */}
              <div className="flex items-center gap-2">
                <span style={{ color: '#94a3b8' }}>Last frost:</span>
                <button onClick={() => setLastFrostOffset(f => f - 1)} title="Shift last frost date earlier by 1 week"
                  style={{ width: '32px', height: '32px', border: '1px solid #475569', backgroundColor: '#334155', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ color: lastFrostOffset === 0 ? '#94a3b8' : '#e2e8f0', fontWeight: lastFrostOffset !== 0 ? 700 : 400, minWidth: '50px', textAlign: 'center' }}>
                  {formatDoy(customMidcoast.lastFrost)}
                </span>
                <button onClick={() => setLastFrostOffset(f => f + 1)} title="Shift last frost date later by 1 week"
                  style={{ width: '32px', height: '32px', border: '1px solid #475569', backgroundColor: '#334155', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                {lastFrostOffset !== 0 && <span style={{ color: '#94a3b8', fontSize: '10px' }}>({lastFrostOffset > 0 ? '+' : ''}{lastFrostOffset}w)</span>}
                <button onClick={() => setShowZipInput(!showZipInput)} title="Look up frost dates by ZIP code"
                  style={{ fontSize: '12px', border: '1px solid #475569', backgroundColor: '#334155', color: '#e2e8f0', cursor: 'pointer', borderRadius: '4px', padding: '2px 6px', marginLeft: '8px' }}>📍</button>
              </div>
              {/* First frost controls */}
              <div className="flex items-center gap-2">
                <span style={{ color: '#94a3b8' }}>First frost:</span>
                <button onClick={() => setFirstFrostOffset(f => f - 1)} title="Shift first frost date earlier by 1 week"
                  style={{ width: '32px', height: '32px', border: '1px solid #475569', backgroundColor: '#334155', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>−</button>
                <span style={{ color: firstFrostOffset === 0 ? '#94a3b8' : '#e2e8f0', fontWeight: firstFrostOffset !== 0 ? 700 : 400, minWidth: '50px', textAlign: 'center' }}>
                  {formatDoy(customMidcoast.firstFrost)}
                </span>
                <button onClick={() => setFirstFrostOffset(f => f + 1)} title="Shift first frost date later by 1 week"
                  style={{ width: '32px', height: '32px', border: '1px solid #475569', backgroundColor: '#334155', color: '#e2e8f0', cursor: 'pointer', fontSize: '14px', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>+</button>
                {firstFrostOffset !== 0 && <span style={{ color: '#94a3b8', fontSize: '10px' }}>({firstFrostOffset > 0 ? '+' : ''}{firstFrostOffset}w)</span>}
              </div>
              {(lastFrostOffset !== 0 || firstFrostOffset !== 0) && (
                <button onClick={resetFrostOffsets} style={{ color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', fontSize: '10px', textDecoration: 'underline' }}>reset</button>
              )}
              <span style={{ color: '#94a3b8', fontSize: '10px' }}>({seasonWeeks} week season)</span>
              {/* Growing season bar */}
              <div style={{ width: '100%', marginTop: '6px' }}>
                <div style={{ height: '4px', backgroundColor: '#334155', borderRadius: '2px', position: 'relative', overflow: 'hidden' }}>
                  {/* Growing season fill */}
                  <div style={{
                    position: 'absolute',
                    left: ((customMidcoast.lastFrost / 365) * 100) + '%',
                    width: (((customMidcoast.firstFrost - customMidcoast.lastFrost) / 365) * 100) + '%',
                    height: '100%',
                    backgroundColor: '#16a34a',
                    opacity: 0.4,
                  }} />
                  {/* Today marker */}
                  <div style={{
                    position: 'absolute',
                    left: ((todayDoy / 365) * 100) + '%',
                    width: '3px',
                    height: '100%',
                    backgroundColor: todayDoy >= customMidcoast.lastFrost && todayDoy <= customMidcoast.firstFrost ? '#fff' : '#ef4444',
                    borderRadius: '1px',
                    transform: 'translateX(-1px)',
                  }} />
                </div>
                <div className="flex justify-between" style={{ fontSize: '9px', color: '#64748b', marginTop: '2px' }}>
                  <span>Jan</span>
                  <span>Apr</span>
                  <span>Jul</span>
                  <span>Oct</span>
                  <span>Dec</span>
                </div>
              </div>
              {/* ZIP code input */}
              {showZipInput && (
                <div className="flex items-center gap-2" style={{ marginTop: '8px', padding: '8px', backgroundColor: '#f8fafc', borderRadius: '4px', border: '1px solid #e2e8f0' }}>
                  <input
                    type="text"
                    placeholder="Enter ZIP code"
                    value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.trim())}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') lookupZip();
                    }}
                    style={{ padding: '4px 6px', fontSize: '12px', border: '1px solid #e2e8f0', borderRadius: '4px', width: '80px' }}
                  />
                  {zipResult && <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 600 }}>✓ {zipResult}</span>}
                  {zipResult === false && <span style={{ fontSize: '11px', color: '#ef4444' }}>ZIP not found</span>}
                  {!zipResult && zipCode && <span style={{ fontSize: '10px', color: '#94a3b8' }}>Press Enter</span>}
                </div>
              )}
            </div>
            {/* Dashboard summary */}
            <DashboardSummary dashboardItems={dashboardItems} onItemClick={onDashboardItemClick} />
          </div>
        </div>
      </div>
    </div>
  );
}
