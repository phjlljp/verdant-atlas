export function getColorFamily(hex) {
  if (!hex) return 'other';
  const r = parseInt(hex.slice(1,3), 16) / 255;
  const g = parseInt(hex.slice(3,5), 16) / 255;
  const b = parseInt(hex.slice(5,7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  const l = (max + min) / 2;
  if (max - min < 0.1) return 'white';
  let h = 0;
  const d = max - min;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) * 60;
  else if (max === g) h = ((b - r) / d + 2) * 60;
  else h = ((r - g) / d + 4) * 60;
  if (h >= 330 || h < 15) return 'red';
  if (h >= 15 && h < 45) return 'orange';
  if (h >= 45 && h < 70) return 'yellow';
  if (h >= 70 && h < 170) return 'green';
  if (h >= 170 && h < 260) return 'blue';
  if (h >= 260 && h < 330) return 'purple';
  return 'other';
}

export const COLOR_FAMILIES = {
  all: 'All colors',
  'red': 'Red / Pink',
  'orange': 'Orange',
  'yellow': 'Yellow / Gold',
  'blue': 'Blue / Indigo',
  'purple': 'Purple / Violet',
  'white': 'White / Neutral'
};
