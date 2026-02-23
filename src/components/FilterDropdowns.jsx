import React from 'react';
import { COLOR_FAMILIES } from '../data/constants.js';

const selectClass = 'px-3 py-2 text-sm cursor-pointer';

function selectStyle(dm) {
  return {
    fontWeight: 700,
    backgroundColor: dm.inputBg,
    border: '1px solid ' + dm.border,
    color: dm.text,
    borderRadius: '4px',
  };
}

export default function FilterDropdowns({
  filterSow, setFilterSow,
  filterType, setFilterType,
  filterHeight, setFilterHeight,
  filterColorFamily, setFilterColorFamily,
  filterDeer, setFilterDeer,
  filterPollinator, setFilterPollinator,
  sortBy, setSortBy,
  filterCategory,
  dm,
}) {
  const isVegetables = filterCategory === 'vegetables';
  const style = selectStyle(dm);

  return (
    <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto">
      <select value={filterSow} onChange={e => setFilterSow(e.target.value)} className={selectClass} style={style}>
        <option value="all">All methods</option>
        <option value="indoor">Indoor start</option>
        <option value="direct">Direct sow</option>
      </select>
      <select value={filterType} onChange={e => setFilterType(e.target.value)} className={selectClass} style={style}>
        <option value="all">All types</option>
        <option value="annual">Annual</option>
        <option value="perennial">Perennial</option>
        {isVegetables && <option value="biennial">Biennial</option>}
      </select>
      <select value={filterHeight} onChange={e => setFilterHeight(e.target.value)} className={selectClass} style={style}>
        <option value="all">All heights</option>
        <option value="ground">Ground (0-6&quot;)</option>
        <option value="short">Short (6-18&quot;)</option>
        <option value="medium">Medium (18-36&quot;)</option>
        <option value="tall">Tall (36-60&quot;)</option>
        <option value="vine">Vine</option>
      </select>
      {!isVegetables && (
        <select value={filterColorFamily} onChange={e => setFilterColorFamily(e.target.value)} className={selectClass} style={style}>
          {Object.entries(COLOR_FAMILIES).map(([k, v]) => (
            <option key={k} value={k}>{v}</option>
          ))}
        </select>
      )}
      <select value={filterDeer} onChange={e => setFilterDeer(e.target.value)} className={selectClass} style={style}>
        <option value="all">All deer</option>
        <option value="resistant">Deer resistant</option>
        <option value="vulnerable">Deer vulnerable</option>
      </select>
      {!isVegetables && (
        <select value={filterPollinator} onChange={e => setFilterPollinator(e.target.value)} className={selectClass} style={style}>
          <option value="all">All pollinators</option>
          <option value="bee">Bee friendly</option>
          <option value="butterfly">Butterfly</option>
          <option value="hummingbird">Hummingbird</option>
        </select>
      )}
      <select value={sortBy} onChange={e => setSortBy(e.target.value)} className={selectClass} style={style}>
        <option value="alpha">Sort: A-Z</option>
        <option value="sowDate">Sort: Sow date</option>
        <option value="bloomDate">Sort: Bloom date</option>
        <option value="varieties">Sort: Most varieties</option>
        <option value="type">Sort: Type</option>
        <option value="nextAction">Sort: Next action</option>
      </select>
    </div>
  );
}
