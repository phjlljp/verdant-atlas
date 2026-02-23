import React, { useState } from 'react';
import { PHASE_COLORS } from '../data/constants.js';
import { formatDoy } from '../utils/dates.js';
import SearchInput from './SearchInput.jsx';
import FilterDropdowns from './FilterDropdowns.jsx';
import QuickFilters from './QuickFilters.jsx';
import OffSeasonPanel from './OffSeasonPanel.jsx';

/**
 * Sticky toolbar with search, filters, quick filters, view mode toggle,
 * compare mode, and expand/collapse all controls.
 */
export default function Toolbar({
  // Filter state
  searchTerm, setSearchTerm,
  filterSow, setFilterSow,
  filterType, setFilterType,
  filterHeight, setFilterHeight,
  filterColorFamily, setFilterColorFamily,
  filterPlantNow, setFilterPlantNow,
  filterBloomNow, setFilterBloomNow,
  filterMyGarden, setFilterMyGarden,
  filterDeer, setFilterDeer,
  filterPollinator, setFilterPollinator,
  sortBy, setSortBy,
  hasActiveFilters,
  clearAllFilters,
  // View state
  viewMode, setViewMode,
  // Compare
  compareMode, setCompareMode, setCompareSpecies,
  // Garden
  myGarden, setMyGarden,
  myGardenCount,
  // Garden actions
  onCopyList, copiedList,
  onPrint,
  onRemind, notificationsEnabled,
  onDownloadCalendar,
  onExportCSV,
  // Share
  onShareLink, copiedLink,
  // Presets
  onShowPresets,
  // This week / off season
  speciesData, todayDoy,
  // Dark mode
  darkMode, setDarkMode, dm,
  // Expand/collapse
  onExpandAll, onCollapseAll,
  // Scrolled state
  scrolledPast,
}) {
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Compute this-week actions
  const weekActions = [];
  speciesData.forEach(sd => {
    const tl = sd.tl;
    if (tl.indoorStart && todayDoy >= tl.indoorStart && todayDoy <= tl.indoorStart + 7) {
      weekActions.push({ action: 'Start indoors', species: sd.species, phase: 'indoor' });
    }
    if (tl.transplant && todayDoy >= tl.transplant - 3 && todayDoy <= tl.transplant + 3) {
      weekActions.push({ action: 'Transplant', species: sd.species, phase: 'transplant' });
    }
    if (tl.sowStart && todayDoy >= tl.sowStart && todayDoy <= tl.sowStart + 7) {
      weekActions.push({ action: 'Direct sow', species: sd.species, phase: 'sow' });
    }
  });

  // Off-season: find nearest upcoming event
  let nearestEvent = null;
  if (weekActions.length === 0) {
    speciesData.forEach(sd => {
      const tl = sd.tl;
      const events = [];
      if (tl.indoorStart && tl.indoorStart > todayDoy) events.push({ doy: tl.indoorStart, label: 'Indoor starting', species: sd.species, phase: 'indoor' });
      if (tl.sowStart && tl.sowStart > todayDoy) events.push({ doy: tl.sowStart, label: 'Direct sowing', species: sd.species, phase: 'sow' });
      if (tl.transplant && tl.transplant > todayDoy) events.push({ doy: tl.transplant, label: 'Transplanting', species: sd.species, phase: 'transplant' });
      events.forEach(ev => {
        if (!nearestEvent || ev.doy < nearestEvent.doy) nearestEvent = ev;
      });
    });
  }

  return (
    <div role="navigation" aria-label="Planting calendar filters" className="sticky top-0 z-20" style={{ backgroundColor: dm.toolbarBg, borderBottom: '2px solid ' + dm.border, boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
      {/* This Week or Off Season banner */}
      {weekActions.length > 0 ? (
        <div style={{ padding: '6px 20px', backgroundColor: '#eef2ff', borderBottom: '1px solid #c7d2fe', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
          <span style={{ fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', fontSize: '10px', letterSpacing: '1px' }}>This week</span>
          {weekActions.map((a, i) => (
            <span key={i} style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <span style={{ width: '6px', height: '6px', borderRadius: '2px', backgroundColor: PHASE_COLORS[a.phase].bg, display: 'inline-block' }} />
              <span style={{ color: '#475569' }}>{a.action} <strong style={{ color: dm.text }}>{a.species}</strong></span>
              {i < weekActions.length - 1 && <span style={{ color: '#cbd5e1', margin: '0 2px' }}>&middot;</span>}
            </span>
          ))}
        </div>
      ) : nearestEvent ? (
        <OffSeasonPanel
          nearestEvent={nearestEvent}
          todayDoy={todayDoy}
          myGarden={myGarden}
          speciesData={speciesData}
          darkMode={darkMode}
          dm={dm}
          onViewGarden={() => { setFilterMyGarden(true); setViewMode('list'); }}
          onCopyList={onCopyList}
          onSearchSpecies={(name) => { setFilterMyGarden(false); setSearchTerm(name); }}
        />
      ) : null}

      <div className="max-w-6xl mx-auto" style={{ paddingLeft: scrolledPast ? '12px' : '20px', paddingRight: scrolledPast ? '12px' : '20px' }}>
        <div className="flex flex-col sm:flex-row gap-3 py-3 flex-wrap items-center">
          {/* GROUP A: Filters (Search + dropdowns) */}
          <div>
            <p className="hidden sm:block" style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '2px' }}>Filter</p>
            <div className="flex gap-2 flex-wrap items-center flex-1 min-w-0">
              <SearchInput searchTerm={searchTerm} setSearchTerm={setSearchTerm} darkMode={darkMode} dm={dm} />
              {/* Filter collapse toggle + dark mode */}
              <button onClick={() => setFiltersOpen(!filtersOpen)}
                className="filter-btn px-3 py-2 text-sm font-bold"
                style={{ backgroundColor: filtersOpen ? '#1e293b' : dm.chipBg, color: filtersOpen ? '#fff' : dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', minHeight: '44px' }}>
                Filters {filtersOpen ? '▴' : '▾'}
              </button>
              <button onClick={() => setDarkMode(!darkMode)}
                title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
                className="filter-btn text-sm"
                style={{ backgroundColor: darkMode ? '#334155' : '#fff', color: darkMode ? '#f1f5f9' : '#94a3b8', border: '1px solid ' + (darkMode ? '#475569' : '#e2e8f0'), borderRadius: '4px', fontSize: '16px', padding: '8px 12px', minHeight: '44px' }}>
                {darkMode ? '☀️' : '🌙'}
              </button>
              {/* Dropdowns - collapsible */}
              <div className="flex gap-2 flex-wrap items-center w-full sm:w-auto" style={{ display: filtersOpen ? 'flex' : 'none' }}>
                <FilterDropdowns
                  filterSow={filterSow} setFilterSow={setFilterSow}
                  filterType={filterType} setFilterType={setFilterType}
                  filterHeight={filterHeight} setFilterHeight={setFilterHeight}
                  filterColorFamily={filterColorFamily} setFilterColorFamily={setFilterColorFamily}
                  filterDeer={filterDeer} setFilterDeer={setFilterDeer}
                  filterPollinator={filterPollinator} setFilterPollinator={setFilterPollinator}
                  sortBy={sortBy} setSortBy={setSortBy}
                  dm={dm}
                />
              </div>
            </div>
          </div>

          {/* Separator */}
          {filtersOpen && <div className="hidden sm:block" style={{ width: '1px', height: '28px', backgroundColor: dm.border }} />}

          {/* GROUP B: Quick Filters */}
          {filtersOpen && (
            <div>
              <p className="hidden sm:block" style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: '#94a3b8', marginBottom: '2px' }}>Status</p>
              <div className="flex gap-2 flex-wrap items-center">
                <QuickFilters
                  filterPlantNow={filterPlantNow} setFilterPlantNow={setFilterPlantNow}
                  filterBloomNow={filterBloomNow} setFilterBloomNow={setFilterBloomNow}
                  filterMyGarden={filterMyGarden} setFilterMyGarden={setFilterMyGarden}
                  myGardenCount={myGardenCount}
                  onShowPresets={onShowPresets}
                  dm={dm}
                />
                {myGardenCount > 0 && (
                  <>
                    <button onClick={onCopyList}
                      title="Copy your garden selections as a shopping list to clipboard"
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: copiedList ? '#16a34a' : '#fff', color: copiedList ? '#fff' : '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px' }}>
                      {copiedList ? '✓ Copied!' : '📋 Copy List'}
                    </button>
                    <button onClick={onPrint}
                      title="Print your garden plan"
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: dm.chipBg, color: dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px' }}>
                      🖨 Print
                    </button>
                    <button onClick={onRemind}
                      title={notificationsEnabled ? 'Disable planting reminders' : 'Get browser notifications 3 days before planting events'}
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: notificationsEnabled ? '#16a34a' : '#fff', color: notificationsEnabled ? '#fff' : '#94a3b8', border: '1px solid ' + (notificationsEnabled ? '#16a34a' : '#e2e8f0'), borderRadius: '4px', fontSize: '11px' }}>
                      {notificationsEnabled ? '🔔 On' : '🔔 Remind'}
                    </button>
                    <button onClick={onDownloadCalendar}
                      title="Download calendar events for your garden plan"
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: dm.chipBg, color: dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px' }}>
                      📅 Calendar
                    </button>
                    <button onClick={onExportCSV}
                      title="Download your garden plan as a CSV spreadsheet"
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: dm.chipBg, color: dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px' }}>
                      📊 CSV
                    </button>
                    <button onClick={() => {
                      if (window.confirm('Remove all varieties from My Garden? This cannot be undone.')) {
                        setMyGarden({});
                      }
                    }}
                      title="Remove all varieties from your garden plan"
                      className="filter-btn px-2.5 py-2 text-sm font-bold whitespace-nowrap"
                      style={{ backgroundColor: dm.chipBg, color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '11px' }}>
                      ✕ Unstar All
                    </button>
                    {hasActiveFilters && (
                      <button onClick={clearAllFilters}
                        title="Reset all filters and search to defaults"
                        className="filter-btn px-2.5 py-2 text-sm whitespace-nowrap"
                        style={{ backgroundColor: dm.chipBg, color: '#ef4444', border: '1px solid #fecaca', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                        ✕ Clear all
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Separator */}
          <div className="hidden sm:block" style={{ width: '1px', height: '28px', backgroundColor: dm.border }} />

          {/* GROUP C: Display */}
          <div>
            <p className="hidden sm:block" style={{ fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', color: dm.textFaint, marginBottom: '2px' }}>View</p>
            <div className="flex gap-2 flex-wrap items-center">
              <div className="segment-group">
                <button onClick={() => setViewMode(viewMode === 'overview' ? 'list' : 'overview')}
                  title="Month-by-month summary of all planting actions"
                  className="filter-btn px-3.5 py-2 text-sm font-bold whitespace-nowrap"
                  style={viewMode === 'overview' ? { backgroundColor: '#1e293b', color: '#fff' } : { backgroundColor: dm.chipBg, color: dm.textMuted }}>
                  Overview
                </button>
                <button onClick={() => setViewMode(viewMode === 'gantt' ? 'list' : 'gantt')}
                  title="See when each species blooms across the year"
                  className="filter-btn px-3.5 py-2 text-sm font-bold whitespace-nowrap"
                  style={viewMode === 'gantt' ? { backgroundColor: '#1e293b', color: '#fff' } : { backgroundColor: dm.chipBg, color: dm.textMuted }}>
                  Bloom Chart
                </button>
                <button onClick={() => setViewMode(viewMode === 'planting' ? 'list' : 'planting')}
                  title="See indoor start, transplant, and sow windows"
                  className="filter-btn px-3.5 py-2 text-sm font-bold whitespace-nowrap"
                  style={viewMode === 'planting' ? { backgroundColor: '#1e293b', color: '#fff' } : { backgroundColor: dm.chipBg, color: dm.textMuted }}>
                  Planting Chart
                </button>
                <button onClick={() => setViewMode(viewMode === 'weekly' ? 'list' : 'weekly')}
                  title="Tasks organized by calendar week"
                  className="filter-btn px-3.5 py-2 text-sm font-bold whitespace-nowrap"
                  style={viewMode === 'weekly' ? { backgroundColor: '#1e293b', color: '#fff' } : { backgroundColor: dm.chipBg, color: dm.textMuted }}>
                  Weekly
                </button>
              </div>
              <button onClick={onShareLink}
                title="Copy a shareable link with your current filters"
                className="filter-btn px-2.5 py-1.5 text-sm whitespace-nowrap"
                style={{ backgroundColor: copiedLink ? '#16a34a' : dm.chipBg, color: copiedLink ? '#fff' : '#94a3b8', border: '1px solid #e2e8f0', borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                {copiedLink ? '✓ Copied!' : '🔗 Share'}
              </button>
              <button onClick={() => { setCompareMode(!compareMode); setCompareSpecies([]); }}
                title="Select two species to compare side-by-side"
                className="filter-btn px-2.5 py-1.5 text-sm whitespace-nowrap"
                style={{ backgroundColor: compareMode ? '#6366f1' : dm.chipBg, color: compareMode ? '#fff' : dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                {compareMode ? '✕ Cancel' : '⚖️ Compare'}
              </button>
              {viewMode === 'list' && (
                <>
                  <button onClick={onExpandAll}
                    title="Expand all species cards"
                    className="filter-btn px-2.5 py-1.5 text-sm whitespace-nowrap"
                    style={{ backgroundColor: dm.chipBg, color: dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    ↕ Expand All
                  </button>
                  <button onClick={onCollapseAll}
                    title="Collapse all species cards"
                    className="filter-btn px-2.5 py-1.5 text-sm whitespace-nowrap"
                    style={{ backgroundColor: dm.chipBg, color: dm.textMuted, border: '1px solid ' + dm.border, borderRadius: '4px', fontSize: '11px', fontWeight: 600 }}>
                    ↕ Collapse All
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
