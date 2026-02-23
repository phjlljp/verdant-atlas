import { useState, useEffect, useCallback } from 'react';

/**
 * Keyboard navigation hook — j/k (or arrow keys) to move between species cards,
 * Enter to toggle expand, Escape to clear focus, ? to toggle shortcuts modal.
 *
 * @param {Object} options
 * @param {boolean} options.enabled - false when a modal/overlay is open
 * @param {string} options.viewMode - only active in 'list' mode
 * @param {Function} options.onToggleSpecies - called with species name on Enter
 * @param {Function} options.onToggleShortcuts - called on '?' press
 * @param {string[]} options.filterDeps - reset focusedCardIndex when these change
 * @returns {{ focusedCardIndex: number, setFocusedCardIndex: Function }}
 */
export function useKeyboardNav({ enabled = true, viewMode = 'list', onToggleSpecies, onToggleShortcuts, filterDeps = [] } = {}) {
  const [focusedCardIndex, setFocusedCardIndex] = useState(-1);

  // Reset focused card when filters change
  useEffect(() => {
    setFocusedCardIndex(-1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, filterDeps);

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Ignore when typing in form fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return;

      // ? toggles shortcuts modal regardless of other state
      if (e.key === '?') {
        if (onToggleShortcuts) onToggleShortcuts();
        e.preventDefault();
        return;
      }

      // Skip navigation when disabled or not in list view
      if (!enabled || viewMode !== 'list') return;

      if (e.key === 'j' || e.key === 'ArrowDown') {
        e.preventDefault();
        setFocusedCardIndex((prev) => {
          const next = Math.min(prev + 1, (document.querySelectorAll('[data-species]').length || 1) - 1);
          requestAnimationFrame(() => {
            const cards = document.querySelectorAll('[data-species]');
            if (cards[next]) cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
          return next;
        });
      } else if (e.key === 'k' || e.key === 'ArrowUp') {
        e.preventDefault();
        setFocusedCardIndex((prev) => {
          const next = Math.max(prev - 1, 0);
          requestAnimationFrame(() => {
            const cards = document.querySelectorAll('[data-species]');
            if (cards[next]) cards[next].scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
          return next;
        });
      } else if (e.key === 'Enter') {
        setFocusedCardIndex((prev) => {
          if (prev >= 0 && onToggleSpecies) {
            const cards = document.querySelectorAll('[data-species]');
            if (cards[prev]) {
              const sp = cards[prev].getAttribute('data-species');
              onToggleSpecies(sp);
            }
          }
          return prev;
        });
      } else if (e.key === 'Escape') {
        setFocusedCardIndex(-1);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [enabled, viewMode, onToggleSpecies, onToggleShortcuts]);

  return { focusedCardIndex, setFocusedCardIndex };
}
