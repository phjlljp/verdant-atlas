import { useState, useMemo, useCallback } from 'react';
import { MIDCOAST, ZIP_FROST_DATA } from '../data/constants';

/**
 * Frost-date offset hook — manages last/first frost offsets (in weeks)
 * and ZIP-code lookup to auto-set them.
 *
 * @returns {{
 *   lastFrostOffset: number,
 *   firstFrostOffset: number,
 *   setLastFrostOffset: Function,
 *   setFirstFrostOffset: Function,
 *   customMidcoast: { lastFrost: number, firstFrost: number },
 *   resetFrostOffsets: Function,
 *   showZipInput: boolean,
 *   setShowZipInput: Function,
 *   zipCode: string,
 *   setZipCode: Function,
 *   zipResult: string|false|null,
 *   lookupZip: Function,
 *   seasonWeeks: number
 * }}
 */
export function useFrostDates() {
  const [lastFrostOffset, setLastFrostOffset] = useState(0);
  const [firstFrostOffset, setFirstFrostOffset] = useState(0);
  const [showZipInput, setShowZipInput] = useState(false);
  const [zipCode, setZipCode] = useState('');
  const [zipResult, setZipResult] = useState(null);

  const customMidcoast = useMemo(() => ({
    lastFrost: MIDCOAST.lastFrost + (lastFrostOffset * 7),
    firstFrost: MIDCOAST.firstFrost + (firstFrostOffset * 7),
  }), [lastFrostOffset, firstFrostOffset]);

  const seasonWeeks = Math.round((customMidcoast.firstFrost - customMidcoast.lastFrost) / 7);

  const resetFrostOffsets = useCallback(() => {
    setLastFrostOffset(0);
    setFirstFrostOffset(0);
    setZipResult(null);
  }, []);

  /**
   * Look up frost dates by ZIP code.
   * Sets offsets automatically if found, or sets zipResult to false if not.
   * @param {string} [zip] - ZIP code to look up (defaults to current zipCode state)
   * @returns {boolean} whether the ZIP was found
   */
  const lookupZip = useCallback((zip) => {
    const code = (zip || zipCode).trim();
    const data = ZIP_FROST_DATA[code];
    if (data) {
      const lastFrostWeekDiff = Math.round((data.lastFrost - MIDCOAST.lastFrost) / 7);
      const firstFrostWeekDiff = Math.round((data.firstFrost - MIDCOAST.firstFrost) / 7);
      setLastFrostOffset(lastFrostWeekDiff);
      setFirstFrostOffset(firstFrostWeekDiff);
      setZipResult(code);
      setZipCode('');
      return true;
    }
    setZipResult(false);
    return false;
  }, [zipCode]);

  return {
    lastFrostOffset,
    firstFrostOffset,
    setLastFrostOffset,
    setFirstFrostOffset,
    customMidcoast,
    resetFrostOffsets,
    showZipInput,
    setShowZipInput,
    zipCode,
    setZipCode,
    zipResult,
    lookupZip,
    seasonWeeks,
  };
}
