import { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { FLOWER_DATABASE } from './data/flowers.js';
import { VEGETABLE_DATABASE } from './data/vegetables.js';
import { getImageUrl } from './data/images.js';
import { calcTimeline, getCountdown } from './utils/timeline.js';
import { doy, formatDoy } from './utils/dates.js';
import { getColorFamily } from './utils/colors.js';
import { copyShoppingList, exportCSV, downloadICSCalendar } from './utils/exports.js';
import { useGarden } from './hooks/useGarden.js';
import { useFilters } from './hooks/useFilters.js';
import { useFrostDates } from './hooks/useFrostDates.js';
import { useDarkMode } from './hooks/useDarkMode.js';
import { useKeyboardNav } from './hooks/useKeyboardNav.js';
import { useNotifications } from './hooks/useNotifications.js';
import Header from './components/Header.jsx';
import Toolbar from './components/Toolbar.jsx';
import SpeciesCard from './components/SpeciesCard.jsx';
import VarietyModal from './components/VarietyModal.jsx';
import ComparePanel from './components/ComparePanel.jsx';
import GardenPresetsModal from './components/GardenPresetsModal.jsx';
import ShortcutsModal from './components/ShortcutsModal.jsx';
import OnboardingWalkthrough from './components/OnboardingWalkthrough.jsx';
import GanttView from './components/GanttView.jsx';
import GalleryView from './components/GalleryView.jsx';
import Toast from './components/Toast.jsx';

export default function App() {
  // --- Hooks ---
  const garden = useGarden();
  const { myGarden, setMyGarden, gardenNotes, setGardenNotes, gardenOrder, toggleGarden, gardenCount } = garden;

  const filters = useFilters();
  const {
    searchTerm, setSearchTerm, filterSow, setFilterSow, filterType, setFilterType,
    filterHeight, setFilterHeight, filterColorFamily, setFilterColorFamily,
    filterPlantNow, setFilterPlantNow, filterBloomNow, setFilterBloomNow,
    filterMyGarden, setFilterMyGarden, filterDeer, setFilterDeer,
    filterPollinator, setFilterPollinator, sortBy, setSortBy,
    viewMode, setViewMode, hasActiveFilters, clearAllFilters,
    filterCategory, setFilterCategory,
  } = filters;

  const frost = useFrostDates();
  const { customMidcoast } = frost;

  const [isDark, toggleDarkMode] = useDarkMode();

  // --- Local state ---
  const [expandedSpecies, setExpandedSpecies] = useState({});
  const [selectedVariety, setSelectedVariety] = useState(null);
  const [compareMode, setCompareMode] = useState(false);
  const [compareSpecies, setCompareSpecies] = useState([]);
  const [showPresets, setShowPresets] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [walkStep, setWalkStep] = useState(() => {
    try { return localStorage.getItem('onboardingDismissed') ? null : 0; } catch { return 0; }
  });
  const [scrolledPast, setScrolledPast] = useState(false);
  const [filterHintDismissed, setFilterHintDismissed] = useState(() => {
    try { return !!localStorage.getItem('filterHintDismissed'); } catch { return false; }
  });
  const [footerDismissed, setFooterDismissed] = useState(false);
  const [toastMsg, setToastMsg] = useState(null);
  const [copiedList, setCopiedList] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // --- Today ---
  const today = new Date();
  const todayDoy = doy(today.getMonth() + 1, today.getDate());

  // --- Species data with timelines ---
  const speciesData = useMemo(() => {
    const result = [];
    Object.entries(FLOWER_DATABASE).forEach(([species, sd]) => {
      const tl = calcTimeline(sd, customMidcoast);
      const varieties = sd.varieties.map(v => ({
        name: v.name, url: v.url, img: getImageUrl(v.url),
      }));
      result.push({
        species, category: 'flower', type: sd.type, germination: sd.germination,
        bloomDays: sd.bloomDays || [60, 90], frostHardy: sd.frostHardy,
        sowMethod: sd.sowMethod, sowTiming: sd.sowTiming, sun: sd.sun,
        bloomColor: sd.bloomColor, height: sd.height, flag: sd.flag,
        zoneRange: sd.zoneRange, companions: sd.companions || [],
        bloomDuration: sd.bloomDuration, firstYearBloom: sd.firstYearBloom,
        deerResistant: sd.deerResistant, pollinators: sd.pollinators || [],
        soil: sd.soil, moisture: sd.moisture,
        tl, varieties,
      });
    });
    Object.entries(VEGETABLE_DATABASE).forEach(([species, sd]) => {
      const tl = calcTimeline(sd, customMidcoast);
      const varieties = sd.varieties.map(v => ({
        name: v.name, url: v.url, img: getImageUrl(v.url),
      }));
      result.push({
        species, category: 'vegetable', type: sd.category || 'vegetable',
        germination: sd.germination,
        daysToMaturity: sd.daysToMaturity, frostHardy: sd.frostHardy,
        sowMethod: sd.sowMethod, sowTiming: sd.sowTiming, sun: sd.sun,
        height: sd.height, companions: sd.companions || [],
        harvestDuration: sd.harvestDuration,
        deerResistant: sd.deerResistant,
        soil: sd.soil, moisture: sd.moisture,
        tl, varieties,
      });
    });
    // Compute bi-directional companions
    const speciesNames = new Set(result.map(s => s.species));
    result.forEach(sd => {
      sd.companions.forEach(comp => {
        if (!speciesNames.has(comp)) return;
        const target = result.find(s => s.species === comp);
        if (target && !target.companions.includes(sd.species)) {
          target.companions = [...target.companions, sd.species];
        }
      });
    });
    return result;
  }, [customMidcoast]);

  // --- Notifications ---
  const { notificationsEnabled, enableNotifications } = useNotifications(myGarden, speciesData);

  // --- Filtering ---
  const filtered = useMemo(() => {
    return speciesData.filter(sd => {
      if (searchTerm) {
        const q = searchTerm.toLowerCase();
        const nameMatch = sd.species.toLowerCase().includes(q);
        const varMatch = sd.varieties.some(v => v.name.toLowerCase().includes(q));
        if (!nameMatch && !varMatch) return false;
      }
      if (filterSow === 'indoor' && !sd.sowMethod.includes('startIndoors')) return false;
      if (filterSow === 'direct' && !sd.sowMethod.includes('directSow')) return false;
      if (filterType !== 'all' && sd.type !== filterType) return false;
      if (filterPlantNow) {
        const tl = sd.tl;
        const inSow = (tl.sowStart && todayDoy >= tl.sowStart && todayDoy <= tl.sowEnd) ||
          (tl.indoorStart && todayDoy >= tl.indoorStart && todayDoy <= (tl.indoorEnd || tl.indoorStart + 42));
        if (!inSow) return false;
      }
      if (filterBloomNow) {
        if (!(todayDoy >= sd.tl.bloomStart && todayDoy <= sd.tl.bloomEnd)) return false;
      }
      if (filterMyGarden) {
        const hasSelected = sd.varieties.some(v => myGarden[sd.species + '||' + v.name]);
        if (!hasSelected) return false;
      }
      if (filterHeight !== 'all' && sd.height !== filterHeight) return false;
      if (filterColorFamily !== 'all' && getColorFamily(sd.bloomColor) !== filterColorFamily) return false;
      if (filterDeer === 'resistant' && !sd.deerResistant) return false;
      if (filterDeer === 'vulnerable' && sd.deerResistant) return false;
      if (filterPollinator !== 'all' && (!sd.pollinators || !sd.pollinators.includes(filterPollinator))) return false;
      if (filterCategory !== 'all' && sd.category !== filterCategory) return false;
      return true;
    });
  }, [speciesData, searchTerm, filterSow, filterType, filterPlantNow, filterBloomNow, filterMyGarden, myGarden, filterHeight, filterColorFamily, todayDoy, filterDeer, filterPollinator, filterCategory]);

  const totalVarieties = useMemo(() => filtered.reduce((sum, sd) => sum + sd.varieties.length, 0), [filtered]);
  const flowerCount = useMemo(() => filtered.filter(sd => sd.category === 'flower').length, [filtered]);
  const vegetableCount = useMemo(() => filtered.filter(sd => sd.category === 'vegetable').length, [filtered]);

  // --- Sorting ---
  const sortedFiltered = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      switch (sortBy) {
        case 'sowDate': return (a.tl.indoorStart || a.tl.sowStart || 999) - (b.tl.indoorStart || b.tl.sowStart || 999);
        case 'bloomDate': return (a.tl.bloomStart || 999) - (b.tl.bloomStart || 999);
        case 'varieties': return b.varieties.length - a.varieties.length;
        case 'type': {
          const ta = a.type === 'annual' ? 0 : 1;
          const tb = b.type === 'annual' ? 0 : 1;
          return ta !== tb ? ta - tb : a.species.localeCompare(b.species);
        }
        case 'nextAction': {
          const getNext = (sd) => {
            const actions = [sd.tl.indoorStart, sd.tl.transplant, sd.tl.sowStart, sd.tl.bloomStart]
              .filter(d => d && d > todayDoy);
            return actions.length > 0 ? Math.min(...actions) : 999;
          };
          return getNext(a) - getNext(b);
        }
        default: return a.species.localeCompare(b.species);
      }
    });
    if (filterMyGarden && gardenOrder.length > 0) {
      arr.sort((a, b) => {
        const ai = gardenOrder.indexOf(a.species);
        const bi = gardenOrder.indexOf(b.species);
        if (ai === -1 && bi === -1) return 0;
        if (ai === -1) return 1;
        if (bi === -1) return -1;
        return ai - bi;
      });
    }
    return arr;
  }, [filtered, sortBy, filterMyGarden, gardenOrder, todayDoy]);

  // --- Dashboard items ---
  const dashboardItems = useMemo(() => {
    const windowDays = 14;
    const items = { indoors: [], transplant: [], directSow: [], blooming: [], nextUp: null };
    let nearestFuture = Infinity;
    let nearestLabel = '';

    speciesData.forEach(sd => {
      const tl = sd.tl;
      if (tl.indoorStart) {
        if (todayDoy >= tl.indoorStart && todayDoy <= (tl.indoorEnd || tl.indoorStart + 42)) {
          items.indoors.push({ species: sd.species, varCount: sd.varieties.length, date: formatDoy(tl.indoorStart), active: true });
        } else if (tl.indoorStart > todayDoy && tl.indoorStart <= todayDoy + windowDays) {
          items.indoors.push({ species: sd.species, varCount: sd.varieties.length, date: formatDoy(tl.indoorStart), active: false });
        }
        if (tl.indoorStart > todayDoy && tl.indoorStart < nearestFuture) {
          nearestFuture = tl.indoorStart;
          nearestLabel = 'Indoor starting (' + sd.species + ') begins ' + formatDoy(tl.indoorStart);
        }
      }
      if (tl.transplant) {
        if (todayDoy >= tl.transplant - 3 && todayDoy <= tl.transplant + 7) {
          items.transplant.push({ species: sd.species, varCount: sd.varieties.length, date: formatDoy(tl.transplant) });
        }
        if (tl.transplant > todayDoy && tl.transplant < nearestFuture) {
          nearestFuture = tl.transplant;
          nearestLabel = 'Transplant (' + sd.species + ') begins ' + formatDoy(tl.transplant);
        }
      }
      if (tl.sowStart) {
        if (todayDoy >= tl.sowStart && todayDoy <= tl.sowEnd) {
          items.directSow.push({ species: sd.species, varCount: sd.varieties.length, date: formatDoy(tl.sowStart) });
        } else if (tl.sowStart > todayDoy && tl.sowStart <= todayDoy + windowDays) {
          items.directSow.push({ species: sd.species, varCount: sd.varieties.length, date: formatDoy(tl.sowStart), upcoming: true });
        }
        if (tl.sowStart > todayDoy && tl.sowStart < nearestFuture) {
          nearestFuture = tl.sowStart;
          nearestLabel = 'Direct sow (' + sd.species + ') begins ' + formatDoy(tl.sowStart);
        }
      }
      if (todayDoy >= tl.bloomStart && todayDoy <= tl.bloomEnd) {
        items.blooming.push({ species: sd.species, varCount: sd.varieties.length });
      }
    });

    if (nearestFuture < Infinity) {
      items.nextUp = { label: nearestLabel, daysAway: nearestFuture - todayDoy };
    }
    return items;
  }, [speciesData, todayDoy]);

  // --- Dark mode theme object ---
  const dm = useMemo(() => ({
    bg: isDark ? '#0f172a' : '#f8fafc',
    cardBg: isDark ? '#1e293b' : '#fff',
    border: isDark ? '#334155' : '#e2e8f0',
    text: isDark ? '#e2e8f0' : '#1e293b',
    textMuted: isDark ? '#94a3b8' : '#64748b',
    textFaint: isDark ? '#64748b' : '#94a3b8',
    headerBg: isDark ? '#1e293b' : '#1e293b',
    toolbarBg: isDark ? 'rgba(30,41,59,0.97)' : 'rgba(241,245,249,0.98)',
    inputBg: isDark ? '#334155' : '#fff',
    chipBg: isDark ? '#1e293b' : '#fff',
    altRow: isDark ? '#1e293b' : '#f8fafc',
  }), [isDark]);

  // --- Apply dark mode to body ---
  useEffect(() => {
    document.body.style.backgroundColor = isDark ? '#0f172a' : '#f8fafc';
    document.body.style.color = isDark ? '#e2e8f0' : '#1e293b';
  }, [isDark]);

  // --- Scroll tracking ---
  const headerRef = useRef(null);
  useEffect(() => {
    const handleScroll = () => {
      if (headerRef.current) {
        setScrolledPast(headerRef.current.getBoundingClientRect().bottom < 0);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // --- Species toggle ---
  const toggleSpecies = useCallback((sp) => {
    setExpandedSpecies(prev => {
      const wasExpanded = prev[sp];
      if (!wasExpanded) {
        requestAnimationFrame(() => {
          const el = document.querySelector(`[data-species="${sp}"]`);
          if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        });
      }
      return { ...prev, [sp]: !wasExpanded };
    });
  }, []);

  // --- Keyboard navigation ---
  const handleToggleShortcuts = useCallback(() => setShowShortcuts(prev => !prev), []);
  const { focusedCardIndex } = useKeyboardNav({
    enabled: !selectedVariety && !showShortcuts && !showPresets,
    viewMode,
    onToggleSpecies: toggleSpecies,
    onToggleShortcuts: handleToggleShortcuts,
    filterDeps: [searchTerm, filterType, filterHeight, filterColorFamily, filterMyGarden, filterPlantNow, filterBloomNow, sortBy],
  });

  // --- Variety selection ---
  const selectVariety = useCallback((variety, sd) => {
    setSelectedVariety({
      ...variety, species: sd.species, type: sd.type, germination: sd.germination,
      bloomDays: sd.bloomDays || [60, 90], frostHardy: sd.frostHardy,
      sowMethod: sd.sowMethod, sowTiming: sd.sowTiming, sun: sd.sun,
      bloomColor: sd.bloomColor, height: sd.height, companions: sd.companions,
      flag: sd.flag, zoneRange: sd.zoneRange, bloomDuration: sd.bloomDuration,
      firstYearBloom: sd.firstYearBloom, tl: sd.tl,
    });
  }, []);

  const navigateVariety = useCallback((direction) => {
    if (!selectedVariety) return;
    const sd = speciesData.find(s => s.species === selectedVariety.species);
    if (!sd) return;
    const currentIdx = sd.varieties.findIndex(v => v.name === selectedVariety.name);
    if (currentIdx === -1) return;
    const newIdx = direction === -1
      ? (currentIdx - 1 + sd.varieties.length) % sd.varieties.length
      : (currentIdx + 1) % sd.varieties.length;
    const v = sd.varieties[newIdx];
    setSelectedVariety({
      ...v, species: sd.species, type: sd.type, germination: sd.germination,
      bloomDays: sd.bloomDays || [60, 90], frostHardy: sd.frostHardy,
      sowMethod: sd.sowMethod, sowTiming: sd.sowTiming, sun: sd.sun,
      bloomColor: sd.bloomColor, height: sd.height, companions: sd.companions,
      flag: sd.flag, zoneRange: sd.zoneRange, bloomDuration: sd.bloomDuration,
      firstYearBloom: sd.firstYearBloom, tl: sd.tl,
    });
  }, [selectedVariety, speciesData]);

  // --- Compare toggle ---
  const toggleCompare = useCallback((speciesName) => {
    setCompareSpecies(prev => {
      if (prev.includes(speciesName)) return prev.filter(s => s !== speciesName);
      if (prev.length >= 2) return prev;
      return [...prev, speciesName];
    });
  }, []);

  // --- Garden actions ---
  const mergedDatabase = useMemo(() => ({ ...FLOWER_DATABASE, ...VEGETABLE_DATABASE }), []);

  const handleCopyList = useCallback(() => {
    copyShoppingList(myGarden, mergedDatabase).then(() => {
      setCopiedList(true);
      setTimeout(() => setCopiedList(false), 2000);
    });
  }, [myGarden, mergedDatabase]);

  const handleExportCSV = useCallback(() => {
    exportCSV(myGarden, mergedDatabase, customMidcoast);
  }, [myGarden, mergedDatabase, customMidcoast]);

  const handleDownloadCalendar = useCallback(() => {
    downloadICSCalendar(myGarden, speciesData);
  }, [myGarden, speciesData]);

  const handleShareLink = useCallback(() => {
    const url = window.location.href;
    navigator.clipboard.writeText(url).then(() => {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    });
  }, []);

  const handlePrint = useCallback(() => window.print(), []);

  // --- Expand/Collapse all ---
  const expandAll = useCallback(() => {
    const all = {};
    sortedFiltered.forEach(sd => { all[sd.species] = true; });
    setExpandedSpecies(all);
  }, [sortedFiltered]);

  const collapseAll = useCallback(() => {
    setExpandedSpecies({});
  }, []);

  // --- Dashboard click ---
  const handleDashboardItemClick = useCallback((speciesName) => {
    setExpandedSpecies(prev => ({ ...prev, [speciesName]: true }));
    requestAnimationFrame(() => {
      const el = document.querySelector(`[data-species="${speciesName}"]`);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  }, []);

  // --- Onboarding dismiss ---
  const dismissOnboarding = useCallback(() => {
    setWalkStep(null);
    localStorage.setItem('onboardingDismissed', '1');
  }, []);

  // --- Toast helper ---
  const showToast = useCallback((msg) => {
    setToastMsg(msg);
  }, []);

  // --- Companion search from modal ---
  const handleSearchCompanion = useCallback((speciesName) => {
    setSelectedVariety(null);
    setSearchTerm(speciesName);
    window.scrollTo(0, 0);
  }, [setSearchTerm]);

  // --- Update notes from modal ---
  const handleUpdateNotes = useCallback((key, note) => {
    setGardenNotes(prev => {
      const next = { ...prev };
      if (note) next[key] = note; else delete next[key];
      return next;
    });
  }, [setGardenNotes]);

  return (
    <div style={{ backgroundColor: dm.bg, minHeight: '100vh', color: dm.text }}>
      {/* Header */}
      <div ref={headerRef}>
        <Header
          lastFrostOffset={frost.lastFrostOffset}
          setLastFrostOffset={frost.setLastFrostOffset}
          firstFrostOffset={frost.firstFrostOffset}
          setFirstFrostOffset={frost.setFirstFrostOffset}
          customMidcoast={customMidcoast}
          resetFrostOffsets={frost.resetFrostOffsets}
          seasonWeeks={frost.seasonWeeks}
          showZipInput={frost.showZipInput}
          setShowZipInput={frost.setShowZipInput}
          zipCode={frost.zipCode}
          setZipCode={frost.setZipCode}
          zipResult={frost.zipResult}
          lookupZip={frost.lookupZip}
          dashboardItems={dashboardItems}
          onDashboardItemClick={handleDashboardItemClick}
          totalVarieties={totalVarieties}
          filteredCount={filtered.length}
          flowerCount={flowerCount}
          vegetableCount={vegetableCount}
          todayDoy={todayDoy}
          dm={dm}
        />
      </div>

      {/* Toolbar */}
      <Toolbar
        searchTerm={searchTerm} setSearchTerm={setSearchTerm}
        filterSow={filterSow} setFilterSow={setFilterSow}
        filterType={filterType} setFilterType={setFilterType}
        filterHeight={filterHeight} setFilterHeight={setFilterHeight}
        filterColorFamily={filterColorFamily} setFilterColorFamily={setFilterColorFamily}
        filterPlantNow={filterPlantNow} setFilterPlantNow={setFilterPlantNow}
        filterBloomNow={filterBloomNow} setFilterBloomNow={setFilterBloomNow}
        filterMyGarden={filterMyGarden} setFilterMyGarden={setFilterMyGarden}
        filterDeer={filterDeer} setFilterDeer={setFilterDeer}
        filterPollinator={filterPollinator} setFilterPollinator={setFilterPollinator}
        filterCategory={filterCategory} setFilterCategory={setFilterCategory}
        sortBy={sortBy} setSortBy={setSortBy}
        hasActiveFilters={hasActiveFilters}
        clearAllFilters={clearAllFilters}
        viewMode={viewMode} setViewMode={setViewMode}
        compareMode={compareMode} setCompareMode={setCompareMode} setCompareSpecies={setCompareSpecies}
        myGarden={myGarden} setMyGarden={setMyGarden}
        myGardenCount={gardenCount}
        onCopyList={handleCopyList} copiedList={copiedList}
        onPrint={handlePrint}
        onRemind={enableNotifications} notificationsEnabled={notificationsEnabled}
        onDownloadCalendar={handleDownloadCalendar}
        onExportCSV={handleExportCSV}
        onShareLink={handleShareLink} copiedLink={copiedLink}
        onShowPresets={() => setShowPresets(true)}
        speciesData={speciesData} todayDoy={todayDoy}
        darkMode={isDark} setDarkMode={toggleDarkMode} dm={dm}
        onExpandAll={expandAll} onCollapseAll={collapseAll}
        scrolledPast={scrolledPast}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto" style={{ paddingLeft: scrolledPast ? '12px' : '20px', paddingRight: scrolledPast ? '12px' : '20px' }}>

        {/* List view */}
        {viewMode === 'list' && (
          <div className="space-y-2 py-4">
            {/* Progressive filter hint */}
            {!filterHintDismissed && sortedFiltered.length > 20 && !hasActiveFilters && !searchTerm && (() => {
              const hasPlantable = speciesData.some(sd => {
                const tl = sd.tl;
                return (tl.indoorStart && todayDoy >= tl.indoorStart - 7 && todayDoy <= tl.indoorStart + 14) ||
                       (tl.sowStart && todayDoy >= tl.sowStart - 7 && todayDoy <= tl.sowStart + 14);
              });
              const hasBlooming = speciesData.some(sd => todayDoy >= sd.tl.bloomStart && todayDoy <= sd.tl.bloomEnd);
              const tip = hasPlantable
                ? { text: 'Try "Plant Now" to see species you can start this week.', action: () => setFilterPlantNow(true) }
                : hasBlooming
                ? { text: 'Try "Blooming" to see what\'s flowering right now.', action: () => setFilterBloomNow(true) }
                : { text: 'Try sorting by "Next action" to see your most urgent tasks.', action: () => setSortBy('nextAction') };
              return (
                <div style={{ borderLeft: '3px solid #6366f1', backgroundColor: isDark ? '#1e1b4b' : '#eef2ff', padding: '8px 14px', borderRadius: '0 6px 6px 0', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '10px', fontSize: '12px' }}>
                  <span style={{ color: '#6366f1', fontWeight: 700, fontSize: '11px' }}>TIP</span>
                  <button onClick={tip.action} style={{ background: 'none', border: 'none', cursor: 'pointer', color: isDark ? '#a5b4fc' : '#4338ca', fontWeight: 500, padding: 0, textAlign: 'left', flex: 1 }}>{tip.text}</button>
                  <button onClick={() => { setFilterHintDismissed(true); localStorage.setItem('filterHintDismissed', '1'); }}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8', fontSize: '14px', padding: '2px 6px' }}>&times;</button>
                </div>
              );
            })()}

            {sortedFiltered.length === 0 && (
              <div className="text-center py-12" style={{ color: dm.textMuted }}>
                <p style={{ fontSize: '16px', fontWeight: 600 }}>No species match your filters</p>
                <p style={{ fontSize: '13px', marginTop: '4px' }}>Try adjusting your search or filters</p>
                {hasActiveFilters && (
                  <button onClick={clearAllFilters}
                    style={{ marginTop: '12px', fontSize: '12px', fontWeight: 700, color: '#fff', backgroundColor: '#6366f1', border: 'none', borderRadius: '6px', padding: '8px 16px', cursor: 'pointer' }}>
                    Clear all filters
                  </button>
                )}
              </div>
            )}
            {sortedFiltered.map((sd, idx) => (
              <SpeciesCard
                key={sd.species}
                sd={sd}
                expanded={!!expandedSpecies[sd.species]}
                onToggle={() => toggleSpecies(sd.species)}
                myGarden={myGarden}
                gardenNotes={gardenNotes}
                onToggleGarden={toggleGarden}
                onSelectVariety={(v) => selectVariety(v, sd)}
                searchTerm={searchTerm}
                filterMyGarden={filterMyGarden}
                compareMode={compareMode}
                compareSpecies={compareSpecies}
                onToggleCompare={toggleCompare}
                focused={focusedCardIndex === idx}
              />
            ))}
          </div>
        )}

        {/* Gantt views */}
        {(viewMode === 'gantt' || viewMode === 'planting') && (
          <GanttView
            sortedFiltered={sortedFiltered}
            mode={viewMode === 'planting' ? 'planting' : 'bloom'}
            onClickSpecies={handleDashboardItemClick}
          />
        )}

        {/* Gallery view */}
        {viewMode === 'gallery' && (
          <GalleryView sortedFiltered={sortedFiltered} />
        )}
      </div>

      {/* Compare panel */}
      {compareMode && compareSpecies.length === 2 && (
        <ComparePanel
          compareSpecies={compareSpecies}
          speciesData={speciesData}
          onClear={() => { setCompareSpecies([]); setCompareMode(false); }}
        />
      )}

      {/* Variety modal */}
      {selectedVariety && (
        <VarietyModal
          variety={selectedVariety}
          speciesData={speciesData}
          myGarden={myGarden}
          gardenNotes={gardenNotes}
          onClose={() => setSelectedVariety(null)}
          onNavigate={navigateVariety}
          onToggleGarden={toggleGarden}
          onUpdateNotes={handleUpdateNotes}
          onSearchCompanion={handleSearchCompanion}
        />
      )}

      {/* Garden presets modal */}
      {showPresets && (
        <GardenPresetsModal
          speciesData={speciesData}
          myGarden={myGarden}
          onClose={() => setShowPresets(false)}
          onSetGarden={setMyGarden}
          onToast={showToast}
        />
      )}

      {/* Shortcuts modal */}
      {showShortcuts && (
        <ShortcutsModal onClose={() => setShowShortcuts(false)} />
      )}

      {/* Onboarding walkthrough */}
      {walkStep !== null && (
        <OnboardingWalkthrough
          walkStep={walkStep}
          setWalkStep={setWalkStep}
          onDismiss={dismissOnboarding}
        />
      )}

      {/* Jump-to dropdown (list view with many items) */}
      {viewMode === 'list' && sortedFiltered.length > 5 && (
        <div className="fixed z-30" style={{
          bottom: gardenCount > 0 && !footerDismissed && !filterMyGarden ? '60px' : '20px',
          right: '20px', transition: 'bottom 0.2s ease',
        }}>
          <select
            onChange={(e) => {
              if (!e.target.value) return;
              setExpandedSpecies(prev => ({ ...prev, [e.target.value]: true }));
              const el = document.querySelector(`[data-species="${e.target.value}"]`);
              if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              e.target.value = '';
            }}
            style={{ backgroundColor: '#1e293b', color: '#fff', border: 'none', padding: '10px 14px', borderRadius: '8px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 12px rgba(0,0,0,0.15)', letterSpacing: '0.5px' }}>
            <option value="">Jump to...</option>
            {sortedFiltered.map(sd => (
              <option key={sd.species} value={sd.species}>{sd.species}</option>
            ))}
          </select>
        </div>
      )}

      {/* Shortcuts toggle button */}
      <button onClick={() => setShowShortcuts(!showShortcuts)}
        style={{
          position: 'fixed',
          bottom: gardenCount > 0 && !footerDismissed && viewMode === 'list' && !filterMyGarden ? '60px' : '20px',
          left: '20px', zIndex: 30, width: '32px', height: '32px', borderRadius: '50%',
          backgroundColor: dm.text, color: dm.cardBg, border: 'none', fontSize: '14px',
          fontWeight: 700, cursor: 'pointer', boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
          transition: 'bottom 0.2s ease',
        }}>
        ?
      </button>

      {/* Sticky garden footer */}
      {gardenCount > 0 && !footerDismissed && viewMode === 'list' && !filterMyGarden && (
        <div className="fixed bottom-0 left-0 right-0 z-20" style={{
          backgroundColor: dm.headerBg, borderTop: '2px solid #6366f1',
          padding: '8px 20px', display: 'flex', alignItems: 'center', gap: '12px',
          fontSize: '12px', boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        }}>
          <span style={{ fontWeight: 700, color: '#6366f1' }}>{gardenCount} saved</span>
          {(() => {
            const gardenSpeciesList = [...new Set(Object.keys(myGarden).map(k => k.split('||')[0]))];
            const nextAction = gardenSpeciesList.map(sp => {
              const sd = speciesData.find(s => s.species === sp);
              if (!sd) return null;
              const cd = getCountdown(sd.tl, todayDoy);
              return cd ? { species: sp, ...cd } : null;
            }).filter(Boolean).sort((a, b) => a.days - b.days)[0];
            return nextAction ? (
              <span style={{ color: dm.textMuted }}>Next: <strong style={{ color: '#f59e0b' }}>{nextAction.label}</strong> {nextAction.species} in {nextAction.days}d</span>
            ) : null;
          })()}
          <span style={{ flex: 1 }} />
          <button onClick={() => { setFilterMyGarden(true); window.scrollTo(0, 0); }}
            style={{ fontSize: '11px', fontWeight: 700, color: '#fff', backgroundColor: '#6366f1', border: 'none', borderRadius: '6px', padding: '6px 14px', cursor: 'pointer' }}>
            View Garden
          </button>
          <button onClick={() => setFooterDismissed(true)}
            style={{ background: 'none', border: 'none', color: dm.textFaint, cursor: 'pointer', fontSize: '14px', padding: '4px' }}>&times;</button>
        </div>
      )}

      {/* Toast notification */}
      <Toast message={toastMsg} onClose={() => setToastMsg(null)} />

      {/* Footer */}
      <footer style={{
        backgroundColor: '#1e293b', color: '#94a3b8', padding: '24px 20px',
        marginTop: '40px', textAlign: 'center', fontSize: '12px', lineHeight: '1.8',
        marginBottom: gardenCount > 0 && !footerDismissed && viewMode === 'list' && !filterMyGarden ? '44px' : 0,
      }}>
        <p style={{ fontWeight: 600, color: '#e2e8f0', marginBottom: '4px' }}>Verdant Atlas</p>
        <p>USDA Zone 5b · Last frost ~May 15 · First frost ~Oct 1</p>
        <p style={{ marginTop: '8px' }}>Seed data sourced from <a href="https://www.rareseeds.com" target="_blank" rel="noopener noreferrer" style={{ color: '#818cf8', textDecoration: 'underline' }}>Baker Creek Heirloom Seeds</a>. Dates are estimates for Midcoast Maine (Zone 5b).</p>
      </footer>
    </div>
  );
}
