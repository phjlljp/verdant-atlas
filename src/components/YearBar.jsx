import React, { useState, useRef, useMemo } from 'react';
import { MONTHS, MONTH_START_DOY, MONTH_DAYS } from '../data/constants.js';
import { PHASE_COLORS } from '../data/constants.js';
import { PHASE_TIPS } from '../data/constants.js';
import { getPhaseAtDoy } from '../utils/timeline.js';
import { formatDoy } from '../utils/dates.js';

function getTodayPct() {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const doy = Math.floor((now - start) / 86400000);
  return (doy / 365) * 100;
}

export default function YearBar({ tl, height = 20, showGridlines = true }) {
  const [tooltip, setTooltip] = useState(null);
  const barRef = useRef(null);
  const todayPct = useMemo(getTodayPct, []);

  const segments = useMemo(() => {
    const segs = [];
    let prevPhase = null;
    let segStart = 1;
    for (let d = 1; d <= 366; d++) {
      const phase = d <= 365 ? getPhaseAtDoy(tl, d) : null;
      if (phase !== prevPhase) {
        if (prevPhase && prevPhase !== 'dormant') {
          segs.push({
            phase: prevPhase,
            left: ((segStart - 1) / 365) * 100,
            width: ((d - segStart) / 365) * 100,
            startDoy: segStart,
            endDoy: d - 1,
          });
        }
        segStart = d;
        prevPhase = phase;
      }
    }
    return segs;
  }, [tl]);

  return (
    <div style={{ position: 'relative' }}>
      {showGridlines && (
        <div className="relative" style={{ height: '14px' }}>
          {MONTHS.map((m, mi) => {
            const left = (MONTH_START_DOY[mi] / 365) * 100;
            const width = (MONTH_DAYS[mi] / 365) * 100;
            return (
              <span
                key={m}
                className="absolute text-center"
                style={{
                  left: left + '%',
                  width: width + '%',
                  fontSize: '9px',
                  fontWeight: 400,
                  color: '#999',
                  letterSpacing: '0.05em',
                  textTransform: 'uppercase',
                }}
              >
                {m}
              </span>
            );
          })}
        </div>
      )}
      <div
        ref={barRef}
        className="relative overflow-visible"
        style={{
          height: height + 'px',
          backgroundColor: '#e8e2d0',
          borderRadius: 0,
          border: '1px solid #ccc',
        }}
      >
        {showGridlines &&
          MONTH_START_DOY.slice(1).map((md, i) => (
            <div
              key={i}
              className="absolute top-0 bottom-0"
              style={{
                left: (md / 365) * 100 + '%',
                width: '1px',
                backgroundColor: 'rgba(0,0,0,0.08)',
              }}
            />
          ))}
        {segments.map((seg, i) => (
          <div
            key={i}
            className="absolute top-0 bottom-0 year-bar-seg"
            onMouseEnter={(e) => {
              const rect = barRef.current.getBoundingClientRect();
              const x = e.clientX - rect.left;
              setTooltip({
                text: PHASE_COLORS[seg.phase].label,
                dates: `${formatDoy(seg.startDoy)} – ${formatDoy(seg.endDoy)}`,
                tip: PHASE_TIPS[seg.phase] || '',
                left: (x / rect.width) * 100,
              });
            }}
            onMouseLeave={() => setTooltip(null)}
            onClick={() =>
              setTooltip((prev) =>
                prev
                  ? null
                  : {
                      text: PHASE_COLORS[seg.phase].label,
                      dates: `${formatDoy(seg.startDoy)} – ${formatDoy(seg.endDoy)}`,
                      tip: PHASE_TIPS[seg.phase] || '',
                      left: seg.left + seg.width / 2,
                    }
              )
            }
            style={{
              left: seg.left + '%',
              width: Math.max(seg.width, 0.3) + '%',
              backgroundColor: PHASE_COLORS[seg.phase].bg,
              cursor: 'pointer',
            }}
          />
        ))}
        {/* Today marker */}
        <div
          className="absolute"
          style={{
            left: 'calc(' + todayPct + '% - 1px)',
            top: '-2px',
            bottom: '-2px',
            width: '2px',
            backgroundColor: '#c00',
            zIndex: 2,
          }}
        />
        {tooltip && (
          <div className="year-bar-tooltip" style={{ left: tooltip.left + '%' }}>
            <div style={{ fontWeight: 700 }}>{tooltip.text}</div>
            <div style={{ opacity: 0.85, fontSize: '10px' }}>{tooltip.dates}</div>
            {tooltip.tip && (
              <div style={{ opacity: 0.7, fontSize: '10px', marginTop: '2px' }}>
                {tooltip.tip}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
