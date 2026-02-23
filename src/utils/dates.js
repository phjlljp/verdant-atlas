const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
const MONTH_DAYS = [31,28,31,30,31,30,31,31,30,31,30,31];
const MONTH_START_DOY = [0,31,59,90,120,151,181,212,243,273,304,334];
const TOTAL_DAYS = 365;

export function doy(month, day) {
  return MONTH_START_DOY[month - 1] + day;
}

export function doyToDate(d) {
  let m = 0;
  while (m < 11 && d > MONTH_START_DOY[m + 1]) m++;
  return { month: m, day: d - MONTH_START_DOY[m] };
}

export function formatDoy(d) {
  const dt = doyToDate(Math.max(1, Math.min(365, d)));
  return `${MONTHS[dt.month]} ${dt.day}`;
}

export function doyToICSDate(dayOfYear) {
  const d = new Date(2026, 0, dayOfYear);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}${m}${day}`;
}

export { MONTHS, MONTH_DAYS, MONTH_START_DOY, TOTAL_DAYS };
