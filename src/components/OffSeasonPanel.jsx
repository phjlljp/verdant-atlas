import { PHASE_COLORS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';

export default function OffSeasonPanel({
  nearestEvent,
  todayDoy,
  myGarden,
  speciesData,
  darkMode,
  dm,
  onViewGarden,
  onCopyList,
  onSearchSpecies,
}) {
  if (!nearestEvent) return null;

  const daysAway = nearestEvent.doy - todayDoy;
  const weeksAway = Math.ceil(daysAway / 7);
  const gardenCount = Object.keys(myGarden).length;

  // Find companion suggestions
  const gardenSpecies = [...new Set(Object.keys(myGarden).map(k => k.split('||')[0]))];
  const companions = [];
  gardenSpecies.forEach(sp => {
    const sd = speciesData.find(s => s.species === sp);
    if (sd && sd.companions) {
      sd.companions.forEach(c => {
        if (!gardenSpecies.includes(c) && !companions.includes(c)) companions.push(c);
      });
    }
  });

  return (
    <div style={{ padding: '8px 20px', backgroundColor: darkMode ? '#1e293b' : '#f8fafc', borderBottom: '1px solid ' + dm.border, fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
      <span style={{ fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>Off season</span>
      <span style={{ color: dm.textMuted }}>Growing season starts in <strong style={{ color: '#6366f1', fontWeight: 700 }}>{weeksAway} week{weeksAway !== 1 ? 's' : ''}</strong></span>
      <span style={{ color: dm.textFaint, fontSize: '11px' }}>Next up: {nearestEvent.label} {nearestEvent.species} ({formatDoy(nearestEvent.doy)})</span>
      {gardenCount > 0 && (
        <div style={{ marginTop: '12px', padding: '12px 16px', backgroundColor: dm.altRow, borderRadius: '8px', border: '1px solid ' + dm.border }}>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: '13px', fontWeight: 700, color: dm.text, marginBottom: '4px' }}>Garden Planning</p>
              <p style={{ fontSize: '12px', color: dm.textMuted }}>
                You have <strong>{gardenCount}</strong> varieties saved. Order seeds now so you're ready for spring.
              </p>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button onClick={onViewGarden}
                style={{ fontSize: '11px', padding: '6px 14px', backgroundColor: '#6366f1', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 700 }}>
                View My Garden
              </button>
              <button onClick={onCopyList}
                style={{ fontSize: '11px', padding: '6px 14px', backgroundColor: dm.chipBg, color: dm.text, border: '1px solid ' + dm.border, borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>
                Copy Seed List
              </button>
            </div>
          </div>
          {companions.length > 0 && (
            <div style={{ marginTop: '10px', paddingTop: '10px', borderTop: '1px solid ' + dm.border }}>
              <p style={{ fontSize: '11px', color: dm.textMuted, marginBottom: '6px' }}>Consider adding companions:</p>
              <div className="flex gap-1.5 flex-wrap">
                {companions.slice(0, 6).map(c => (
                  <button key={c} onClick={() => onSearchSpecies(c)}
                    style={{ fontSize: '10px', padding: '3px 10px', backgroundColor: darkMode ? '#312e81' : '#eef2ff', color: darkMode ? '#c7d2fe' : '#4338ca', border: '1px solid ' + (darkMode ? '#4338ca' : '#c7d2fe'), borderRadius: '12px', cursor: 'pointer', fontWeight: 600 }}>
                    + {c}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
