// Frost dates and calendar constants for Zone 5b (Midcoast Maine)
export const MIDCOAST = { lastFrost: 135, firstFrost: 274 }; // Day of year: May 15 = 135, Oct 1 = 274

export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
export const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
export const MONTH_START_DOY = [0,31,59,90,120,151,181,212,243,273,304,334];
export const TOTAL_DAYS = 365;

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

export const PHASE_TIPS = {
  indoor: 'Sow seeds in trays under grow lights.',
  harden: 'Gradually expose seedlings outdoors.',
  transplant: 'Move seedlings outdoors after frost.',
  sow: 'Plant seeds directly in garden soil.',
  germination: 'Seeds sprouting. Keep soil moist.',
  growing: 'Plants establishing. Water & feed.',
  bloom: 'Flowers open. Deadhead to extend.',
  decline: 'Season ending. Collect seeds.'
};

export const HEIGHT_LABELS = {
  ground: '0–6" groundcover',
  short: '6–18"',
  medium: '18–36"',
  tall: '36–60"',
  vine: 'Climbing/Trailing'
};

export const SPACING_DATA = {
  ground: { spacing: 6, label: '6" apart' },
  short: { spacing: 12, label: '12" apart' },
  medium: { spacing: 18, label: '18" apart' },
  tall: { spacing: 24, label: '24" apart' },
  vine: { spacing: 36, label: '36" apart' }
};

export const COLOR_FAMILIES = {
  all: 'All colors',
  'red': 'Red / Pink',
  'orange': 'Orange',
  'yellow': 'Yellow / Gold',
  'blue': 'Blue / Indigo',
  'purple': 'Purple / Violet',
  'white': 'White / Neutral'
};

export const ZIP_FROST_DATA = {
  '04101': { lastFrost: 125, firstFrost: 284 },
  '04005': { lastFrost: 128, firstFrost: 280 },
  '04841': { lastFrost: 135, firstFrost: 274 },
  '04843': { lastFrost: 135, firstFrost: 274 },
  '04011': { lastFrost: 130, firstFrost: 278 },
  '04609': { lastFrost: 140, firstFrost: 268 },
  '04401': { lastFrost: 138, firstFrost: 270 },
  '04330': { lastFrost: 140, firstFrost: 265 },
  '04210': { lastFrost: 142, firstFrost: 262 },
  '04901': { lastFrost: 145, firstFrost: 258 }
};
