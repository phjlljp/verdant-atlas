import React from 'react';

const activeStyle = {
  backgroundColor: '#f0fdf4',
  color: '#16a34a',
  border: '1px solid #bbf7d0',
  borderLeft: '3px solid #16a34a',
  fontWeight: 700,
};

function inactiveStyle(dm) {
  return {
    backgroundColor: dm.chipBg,
    color: dm.textMuted,
    border: '1px solid ' + dm.border,
  };
}

const btnClass = 'filter-btn px-3.5 py-2 text-sm font-bold whitespace-nowrap';

export default function QuickFilters({
  filterPlantNow, setFilterPlantNow,
  filterBloomNow, setFilterBloomNow,
  filterMyGarden, setFilterMyGarden,
  myGardenCount,
  onShowPresets,
  dm,
}) {
  const inactive = inactiveStyle(dm);

  return (
    <div className="flex gap-2 flex-wrap items-center">
      <button
        onClick={() => setFilterPlantNow(!filterPlantNow)}
        title="Show only species you can plant or start this week"
        className={btnClass}
        style={filterPlantNow ? activeStyle : inactive}
      >
        Plant Now
      </button>
      <button
        onClick={() => setFilterBloomNow(!filterBloomNow)}
        title="Show only species currently in bloom"
        className={btnClass}
        style={filterBloomNow ? activeStyle : inactive}
      >
        Blooming
      </button>
      <button
        onClick={() => setFilterMyGarden(!filterMyGarden)}
        title="Show only your starred varieties"
        className={btnClass}
        style={filterMyGarden ? activeStyle : inactive}
      >
        My Garden{myGardenCount > 0 ? ` (${myGardenCount})` : ''}
      </button>
      <button
        onClick={onShowPresets}
        title="Browse curated garden collections"
        className="filter-btn px-3 py-2 text-sm font-bold whitespace-nowrap"
        style={{
          backgroundColor: dm.chipBg,
          color: '#6366f1',
          border: '1px solid #c7d2fe',
          fontSize: '11px',
        }}
      >
        Garden Ideas
      </button>
    </div>
  );
}
