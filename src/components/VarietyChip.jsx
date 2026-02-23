import React from 'react';

export default function VarietyChip({ variety, species, inGarden, hasNotes, onToggleGarden, onSelect }) {
  return (
    <div
      onClick={onSelect}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect(); } }}
      tabIndex={0}
      role="button"
      className="variety-chip cursor-pointer overflow-hidden relative"
      style={{ border: inGarden ? '2px solid #6366f1' : '1px solid #e2e8f0', backgroundColor: '#fff' }}
    >
      <button
        onClick={(e) => { e.stopPropagation(); onToggleGarden(); }}
        aria-label={inGarden ? 'Remove from garden' : 'Add to garden'}
        title={inGarden ? 'Remove from My Garden plan' : 'Click to add to My Garden plan'}
        className="absolute z-10 flex items-center justify-center"
        style={{
          top: '4px', right: '4px', width: '22px', height: '22px',
          backgroundColor: 'rgba(255,255,255,0.9)',
          border: '1px solid #e2e8f0', fontSize: '11px', cursor: 'pointer', lineHeight: 1,
        }}
      >
        {inGarden ? '\u2605' : '\u2606'}
      </button>
      {hasNotes && (
        <span className="absolute z-10" style={{ top: '4px', left: '4px', fontSize: '10px' }} title="Has notes">
          \ud83d\udcdd
        </span>
      )}
      {variety.img ? (
        <div className="img-skeleton" style={{ width: '100%', height: '100px', position: 'relative' }}>
          <img
            src={variety.img}
            alt={variety.name}
            style={{ width: '100%', height: '100px', objectFit: 'cover', display: 'block', position: 'relative', zIndex: 1 }}
            loading="lazy"
            onLoad={(e) => { e.target.parentElement.classList.remove('img-skeleton'); }}
            onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.classList.remove('img-skeleton'); }}
          />
        </div>
      ) : (
        <div className="flex items-center justify-center" style={{ width: '100%', height: '100px', backgroundColor: '#f8fafc' }}>
          <span style={{ fontSize: '28px', color: '#cbd5e1' }}>&#10047;</span>
        </div>
      )}
      <div style={{ padding: '6px 8px 7px' }}>
        <a
          href={`https://www.rareseeds.com/catalogsearch/result/?q=${encodeURIComponent(variety.name)}`}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="font-bold truncate block"
          style={{ fontSize: '10px', color: '#1e293b', textTransform: 'uppercase', letterSpacing: '0.3px', textDecoration: 'none' }}
          title={`View ${variety.name} on Rareseeds.com`}
        >
          {variety.name}
        </a>
      </div>
    </div>
  );
}
