import { useState, useCallback } from 'react';

/**
 * Generic hook for localStorage-backed state.
 * @param {string} key - localStorage key
 * @param {*} initialValue - default value if key not found
 * @returns {[*, Function]} - [storedValue, setValue]
 */
export function useLocalStorage(key, initialValue) {
  const [storedValue, setStoredValue] = useState(() => {
    try {
      const item = localStorage.getItem(key);
      return item !== null ? JSON.parse(item) : initialValue;
    } catch {
      return initialValue;
    }
  });

  const setValue = useCallback((value) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch {
      // Silently fail on storage errors (e.g. quota exceeded)
    }
  }, [key, storedValue]);

  return [storedValue, setValue];
}
