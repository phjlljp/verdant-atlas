import { calcTimeline } from './timeline.js';
import { formatDoy, doyToICSDate } from './dates.js';
import { HEIGHT_LABELS } from '../data/constants.js';

export function copyShoppingList(myGarden, flowerDatabase) {
  const items = [];
  Object.keys(myGarden).forEach(key => {
    const [species, variety] = key.split('||');
    const sd = Object.entries(flowerDatabase).find(([s]) => s === species);
    if (!sd) return;
    const v = sd[1].varieties.find(vr => vr.name === variety);
    if (!v) return;
    items.push({ species, variety, url: v.url });
  });
  items.sort((a, b) => a.species.localeCompare(b.species) || a.variety.localeCompare(b.variety));
  const text = items.map(i => `${i.species} - ${i.variety}\n  ${i.url}`).join('\n\n');
  const header = `Verdant Atlas Garden Plan (${items.length} varieties)\n${'='.repeat(45)}\n\n`;
  return navigator.clipboard.writeText(header + text);
}

export function exportCSV(myGarden, flowerDatabase, midcoast) {
  const headers = ['Species', 'Variety', 'Type', 'Height', 'Indoor Start', 'Transplant', 'Direct Sow', 'Bloom Start', 'Bloom End', 'Deer Resistant', 'Pollinators', 'URL'];
  const rows = [];
  Object.keys(myGarden).sort().forEach(key => {
    const [species, variety] = key.split('||');
    const dbEntry = Object.entries(flowerDatabase).find(([s]) => s === species);
    if (!dbEntry) return;
    const sd = dbEntry[1];
    const v = sd.varieties.find(vr => vr.name === variety);
    if (!v) return;
    const tl = calcTimeline(sd, midcoast);
    rows.push([
      species,
      variety,
      sd.type,
      HEIGHT_LABELS[sd.height] || '',
      tl.indoorStart ? formatDoy(tl.indoorStart) : '',
      tl.transplant ? formatDoy(tl.transplant) : '',
      tl.sowStart ? formatDoy(tl.sowStart) : '',
      formatDoy(tl.bloomStart),
      formatDoy(tl.bloomEnd),
      sd.deerResistant ? 'Yes' : 'No',
      (sd.pollinators || []).join('; '),
      v.url
    ]);
  });
  const csvContent = [headers, ...rows].map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'verdant-atlas-garden-plan.csv';
  link.click();
  URL.revokeObjectURL(link.href);
}

export function downloadICSCalendar(myGarden, speciesData) {
  const events = [];
  Object.keys(myGarden).forEach(key => {
    const [species] = key.split('||');
    const sd = speciesData.find(s => s.species === species);
    if (!sd) return;
    const tl = sd.tl;
    if (tl.indoorStart) {
      events.push({
        summary: `Start Indoors: ${species}`,
        description: `Start ${species} seeds indoors in trays`,
        date: doyToICSDate(tl.indoorStart)
      });
    }
    if (tl.transplant) {
      events.push({
        summary: `Transplant: ${species}`,
        description: `Transplant ${species} seedlings outdoors`,
        date: doyToICSDate(tl.transplant)
      });
    }
    if (tl.sowStart) {
      events.push({
        summary: `Direct Sow: ${species}`,
        description: `Direct sow ${species} seeds outdoors`,
        date: doyToICSDate(tl.sowStart)
      });
    }
    if (tl.bloomStart) {
      events.push({
        summary: `Expected Bloom: ${species}`,
        description: `${species} should begin blooming`,
        date: doyToICSDate(tl.bloomStart)
      });
    }
  });
  let ics = `BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Verdant Atlas//EN\nCALSCALE:GREGORIAN\n`;
  events.forEach(e => {
    const nextDay = String(parseInt(e.date) + 1).padStart(8, '0');
    ics += `BEGIN:VEVENT\nDTSTART;VALUE=DATE:${e.date}\nDTEND;VALUE=DATE:${nextDay}\nSUMMARY:${e.summary}\nDESCRIPTION:${e.description}\nEND:VEVENT\n`;
  });
  ics += `END:VCALENDAR`;
  const blob = new Blob([ics], { type: 'text/calendar' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'garden-plan.ics';
  a.click();
  URL.revokeObjectURL(url);
}
