import { useState, useCallback, useEffect, useMemo } from 'react';

/**
 * Filter, sort, and search state with bidirectional URL hash sync.
 *
 * Reads initial values from the URL hash on mount, then writes back
 * whenever any filter/sort value changes. Only non-default values are
 * persisted to keep URLs clean.
 *
 * @returns {Object} filter/sort state, setters, derived helpers, and clearAll
 */
export function useFilters() {
  // --- state ---
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSow, setFilterSow] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [filterHeight, setFilterHeight] = useState('all');
  const [filterColorFamily, setFilterColorFamily] = useState('all');
  const [filterPlantNow, setFilterPlantNow] = useState(false);
  const [filterBloomNow, setFilterBloomNow] = useState(false);
  const [filterMyGarden, setFilterMyGarden] = useState(false);
  const [filterDeer, setFilterDeer] = useState('all');
  const [filterPollinator, setFilterPollinator] = useState('all');
  const [sortBy, setSortBy] = useState('alpha');
  const [viewMode, setViewMode] = useState('list');
  const [lastFrostOffset, setLastFrostOffset] = useState(0);
  const [firstFrostOffset, setFirstFrostOffset] = useState(0);

  // --- read from URL hash on mount ---
  useEffect(() => {
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const params = new URLSearchParams(hash);
    if (params.get('view')) setViewMode(params.get('view'));
    if (params.get('sow')) setFilterSow(params.get('sow'));
    if (params.get('type')) setFilterType(params.get('type'));
    if (params.get('height')) setFilterHeight(params.get('height'));
    if (params.get('colorFamily')) setFilterColorFamily(params.get('colorFamily'));
    if (params.get('sort')) setSortBy(params.get('sort'));
    if (params.get('search')) setSearchTerm(params.get('search'));
    if (params.get('garden') === '1') setFilterMyGarden(true);
    if (params.get('frostL')) setLastFrostOffset(parseInt(params.get('frostL')) || 0);
    if (params.get('frostF')) setFirstFrostOffset(parseInt(params.get('frostF')) || 0);
    if (params.get('deer')) setFilterDeer(params.get('deer'));
    if (params.get('poll')) setFilterPollinator(params.get('poll'));
  }, []);

  // --- write state to URL hash ---
  useEffect(() => {
    const params = new URLSearchParams();
    if (viewMode !== 'list') params.set('view', viewMode);
    if (filterSow !== 'all') params.set('sow', filterSow);
    if (filterType !== 'all') params.set('type', filterType);
    if (filterHeight !== 'all') params.set('height', filterHeight);
    if (filterColorFamily !== 'all') params.set('colorFamily', filterColorFamily);
    if (sortBy !== 'alpha') params.set('sort', sortBy);
    if (searchTerm) params.set('search', searchTerm);
    if (filterMyGarden) params.set('garden', '1');
    if (lastFrostOffset !== 0) params.set('frostL', String(lastFrostOffset));
    if (firstFrostOffset !== 0) params.set('frostF', String(firstFrostOffset));
    if (filterDeer !== 'all') params.set('deer', filterDeer);
    if (filterPollinator !== 'all') params.set('poll', filterPollinator);
    const hash = params.toString();
    window.history.replaceState(null, '', hash ? '#' + hash : window.location.pathname);
  }, [viewMode, filterSow, filterType, filterHeight, filterColorFamily, sortBy, searchTerm, filterMyGarden, lastFrostOffset, firstFrostOffset, filterDeer, filterPollinator]);

  // --- derived ---
  const hasActiveFilters = searchTerm || filterSow !== 'all' || filterType !== 'all' || filterHeight !== 'all' || filterColorFamily !== 'all' || filterPlantNow || filterBloomNow || filterMyGarden || sortBy !== 'alpha' || filterDeer !== 'all' || filterPollinator !== 'all';

  const activeFilterCount = useMemo(() => [
    searchTerm, filterSow !== 'all', filterType !== 'all', filterHeight !== 'all',
    filterColorFamily !== 'all', filterPlantNow, filterBloomNow, filterMyGarden,
    filterDeer !== 'all', filterPollinator !== 'all',
  ].filter(Boolean).length, [searchTerm, filterSow, filterType, filterHeight, filterColorFamily, filterPlantNow, filterBloomNow, filterMyGarden, filterDeer, filterPollinator]);

  const clearAllFilters = useCallback(() => {
    setSearchTerm('');
    setFilterSow('all');
    setFilterType('all');
    setFilterHeight('all');
    setFilterColorFamily('all');
    setFilterPlantNow(false);
    setFilterBloomNow(false);
    setFilterMyGarden(false);
    setSortBy('alpha');
    setFilterDeer('all');
    setFilterPollinator('all');
  }, []);

  return {
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
    viewMode, setViewMode,
    lastFrostOffset, setLastFrostOffset,
    firstFrostOffset, setFirstFrostOffset,
    hasActiveFilters,
    activeFilterCount,
    clearAllFilters,
  };
}
