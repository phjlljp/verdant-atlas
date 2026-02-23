import { useCallback } from 'react';
import { useLocalStorage } from './useLocalStorage';

/**
 * Garden state hook — manages saved varieties, notes, and species ordering.
 *
 * Keys in myGarden/gardenNotes use the format "Species||Variety Name".
 *
 * @returns {{
 *   myGarden: Object,
 *   gardenNotes: Object,
 *   gardenOrder: string[],
 *   toggleGarden: Function,
 *   setGardenNote: Function,
 *   clearGarden: Function,
 *   applyPreset: Function,
 *   setGardenOrder: Function,
 *   gardenCount: number
 * }}
 */
export function useGarden() {
  const [myGarden, setMyGarden] = useLocalStorage('myGarden', {});
  const [gardenNotes, setGardenNotes] = useLocalStorage('gardenNotes', {});
  const [gardenOrder, setGardenOrder] = useLocalStorage('gardenOrder', []);

  /** Toggle a variety in/out of the garden. Accepts optional event to stop propagation. */
  const toggleGarden = useCallback((species, varietyName, e) => {
    if (e) { e.stopPropagation(); e.preventDefault(); }
    setMyGarden((prev) => {
      const key = species + '||' + varietyName;
      const next = { ...prev };
      if (next[key]) delete next[key]; else next[key] = true;
      return next;
    });
  }, [setMyGarden]);

  /** Set or clear a note for a variety. Pass empty string to clear. */
  const setGardenNote = useCallback((species, varietyName, note) => {
    const key = species + '||' + varietyName;
    setGardenNotes((prev) => {
      const next = { ...prev };
      if (note) {
        next[key] = note;
      } else {
        delete next[key];
      }
      return next;
    });
  }, [setGardenNotes]);

  /** Remove all varieties from the garden (preserves notes). */
  const clearGarden = useCallback(() => {
    setMyGarden({});
  }, [setMyGarden]);

  /**
   * Apply a preset — adds first variety of each species found in speciesData.
   * @param {Object} preset - { species: string[] }
   * @param {Array} speciesData - resolved species data array
   * @returns {number} count of newly added varieties
   */
  const applyPreset = useCallback((preset, speciesData) => {
    let added = 0;
    setMyGarden((prev) => {
      const next = { ...prev };
      preset.species.forEach((sp) => {
        const sd = speciesData.find((s) => s.species === sp);
        if (sd && sd.varieties.length > 0) {
          const key = sp + '||' + sd.varieties[0].name;
          if (!next[key]) {
            next[key] = true;
            added++;
          }
        }
      });
      return next;
    });
    return added;
  }, [setMyGarden]);

  const gardenCount = Object.keys(myGarden).length;

  return {
    myGarden,
    setMyGarden,
    gardenNotes,
    setGardenNotes,
    gardenOrder,
    setGardenOrder,
    toggleGarden,
    setGardenNote,
    clearGarden,
    applyPreset,
    gardenCount,
  };
}
