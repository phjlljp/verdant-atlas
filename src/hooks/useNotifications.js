import { useState, useCallback, useEffect } from 'react';
import { doy, formatDoy } from '../utils/dates';

/**
 * Browser notification hook — requests permission, checks planting events
 * in the user's garden, and fires notifications up to 3 days before each event.
 *
 * Persists enabled state and already-notified events in localStorage.
 *
 * @param {Object} myGarden - garden selections keyed as "Species||Variety"
 * @param {Array} speciesData - resolved species data with timeline (.tl)
 * @returns {{ notificationsEnabled: boolean, enableNotifications: Function, disableNotifications: Function }}
 */
export function useNotifications(myGarden, speciesData) {
  const [notificationsEnabled, setNotificationsEnabled] = useState(() => {
    try { return localStorage.getItem('notificationsEnabled') === '1'; } catch { return false; }
  });

  const checkAndNotify = useCallback(() => {
    if (!notificationsEnabled || typeof Notification === 'undefined' || Notification.permission !== 'granted') return;
    const today = new Date();
    const tdoy = doy(today.getMonth() + 1, today.getDate());
    const notified = JSON.parse(localStorage.getItem('notifiedEvents') || '{}');

    Object.keys(myGarden).forEach((key) => {
      const [species] = key.split('||');
      const sd = speciesData.find((s) => s.species === species);
      if (!sd) return;
      const events = [
        sd.tl.indoorStart && { doy: sd.tl.indoorStart, label: 'Start indoors' },
        sd.tl.transplant && { doy: sd.tl.transplant, label: 'Transplant' },
        sd.tl.sowStart && { doy: sd.tl.sowStart, label: 'Direct sow' },
      ].filter(Boolean);

      events.forEach((evt) => {
        const daysUntil = evt.doy - tdoy;
        const notifKey = `${species}-${evt.label}-${evt.doy}`;
        if (daysUntil >= 0 && daysUntil <= 3 && !notified[notifKey]) {
          new Notification(`🌱 ${evt.label}: ${species}`, {
            body: daysUntil === 0 ? 'Today!' : `In ${daysUntil} day${daysUntil > 1 ? 's' : ''}. ${formatDoy(evt.doy)}`,
            icon: '🌿',
          });
          notified[notifKey] = true;
          localStorage.setItem('notifiedEvents', JSON.stringify(notified));
        }
      });
    });
  }, [notificationsEnabled, myGarden, speciesData]);

  const enableNotifications = useCallback(() => {
    if (typeof Notification === 'undefined') { return; }
    Notification.requestPermission().then((perm) => {
      if (perm === 'granted') {
        setNotificationsEnabled(true);
        localStorage.setItem('notificationsEnabled', '1');
        checkAndNotify();
      }
    });
  }, [checkAndNotify]);

  const disableNotifications = useCallback(() => {
    setNotificationsEnabled(false);
    localStorage.setItem('notificationsEnabled', '0');
  }, []);

  // Check on mount and every hour
  useEffect(() => {
    if (!notificationsEnabled) return;
    checkAndNotify();
    const interval = setInterval(checkAndNotify, 3600000);
    return () => clearInterval(interval);
  }, [notificationsEnabled, checkAndNotify]);

  return { notificationsEnabled, enableNotifications, disableNotifications };
}
