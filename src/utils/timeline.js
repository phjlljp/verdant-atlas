export function calcTimeline(sd, midcoast) {
  const germDays = Math.round((sd.germination[0] + sd.germination[1]) / 2);
  const bloomDays = sd.bloomDays ? Math.round((sd.bloomDays[0] + sd.bloomDays[1]) / 2) : 75;
  const t = {};
  if (sd.sowMethod.includes('startIndoors')) {
    t.indoorStart = midcoast.lastFrost - 56; // 8 weeks before
    t.indoorEnd = midcoast.lastFrost - 14;
    t.hardenStart = t.indoorEnd;
    t.hardenEnd = midcoast.lastFrost + (sd.frostHardy ? -14 : 7);
    t.transplant = midcoast.lastFrost + (sd.frostHardy ? -14 : 7);
  }
  if (sd.sowMethod.includes('directSow')) {
    if (sd.frostHardy) {
      t.sowStart = midcoast.lastFrost - 42; // 6 weeks before last frost
      t.sowEnd = midcoast.lastFrost + 30;
    } else {
      t.sowStart = midcoast.lastFrost + 1;
      t.sowEnd = midcoast.lastFrost + 42;
    }
  }
  const effectiveSow = t.transplant || t.sowStart || midcoast.lastFrost;
  t.germStart = effectiveSow;
  t.germEnd = effectiveSow + germDays;
  t.bloomStart = effectiveSow + bloomDays;
  const duration = sd.bloomDuration || 60;
  t.bloomEnd = Math.min(effectiveSow + bloomDays + duration, sd.type === 'annual' ? midcoast.firstFrost : midcoast.firstFrost + 14);
  t.seasonEnd = sd.type === 'annual' ? midcoast.firstFrost : 334;
  return t;
}

export function getPhaseAtDoy(tl, dayOfYear) {
  // Indoor phase: from indoorStart until harden start
  if (tl.indoorStart && tl.hardenStart && dayOfYear >= tl.indoorStart && dayOfYear < tl.hardenStart) return 'indoor';
  // Indoor-only (no transplant): use indoorEnd
  if (tl.indoorStart && !tl.hardenStart && dayOfYear >= tl.indoorStart && dayOfYear <= (tl.indoorEnd || tl.indoorStart + 42)) return 'indoor';
  // Hardening off phase
  if (tl.hardenStart && tl.hardenEnd && dayOfYear >= tl.hardenStart && dayOfYear < tl.hardenEnd) return 'harden';
  // Transplant until germination ends
  if (tl.transplant && dayOfYear >= tl.transplant && dayOfYear < tl.germEnd) return 'transplant';
  // Direct sow window (only for species without indoor start, or overlapping sow window)
  if (tl.sowStart && !tl.transplant && dayOfYear >= tl.sowStart && dayOfYear < tl.germEnd) return 'sow';
  if (tl.sowStart && tl.transplant && dayOfYear >= tl.sowStart && dayOfYear <= tl.sowEnd) return 'sow';
  // Germination (fallback if not covered by transplant/sow above)
  if (dayOfYear >= tl.germStart && dayOfYear < tl.germEnd) return 'germination';
  // Vegetative growth: germination done, waiting for bloom
  if (dayOfYear >= tl.germEnd && dayOfYear < tl.bloomStart) return 'growing';
  // Bloom
  if (dayOfYear >= tl.bloomStart && dayOfYear <= tl.bloomEnd) return 'bloom';
  // Decline / frost kill
  if (dayOfYear > tl.bloomEnd && dayOfYear <= tl.seasonEnd) return 'decline';
  return 'dormant';
}

export function getCountdown(tl, todayDoy) {
  const actions = [
    tl.indoorStart && { doy: tl.indoorStart, label: 'Start indoors' },
    tl.transplant && { doy: tl.transplant, label: 'Transplant' },
    tl.sowStart && { doy: tl.sowStart, label: 'Sow' },
    { doy: tl.bloomStart, label: 'Bloom' }
  ].filter(Boolean);
  // Find the nearest future action
  const future = actions.filter(a => a.doy > todayDoy).sort((a, b) => a.doy - b.doy);
  if (future.length === 0) return null;
  const next = future[0];
  const days = next.doy - todayDoy;
  if (days > 60) return null;
  return { label: next.label, days };
}

export const PHASE_COLORS = {
  indoor: { bg: '#7c3aed', label: 'Start Indoors' },
  harden: { bg: '#0891b2', label: 'Harden Off' },
  transplant: { bg: '#2563eb', label: 'Transplant' },
  sow: { bg: '#16a34a', label: 'Direct Sow' },
  germination: { bg: '#84cc16', label: 'Germination' },
  growing: { bg: '#a3e635', label: 'Growing' },
  bloom: { bg: '#ec4899', label: 'Bloom' },
  decline: { bg: '#f59e0b', label: 'Decline/Frost Kill' },
  dormant: { bg: '#f1f5f9', label: 'Dormant' }
};
