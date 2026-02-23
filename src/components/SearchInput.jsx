import React, { useState } from 'react';
import { Search } from './Icons.jsx';

const SUGGESTIONS = ['Zinnia', 'Cosmos', 'Sunflower', 'Petunia', 'Snapdragon'];

export default function SearchInput({ searchTerm, setSearchTerm, darkMode, dm }) {
  const [searchFocused, setSearchFocused] = useState(false);

  return (
    <div className="relative flex-1 min-w-[200px]">
      <Search
        className="absolute left-3 top-1/2 -translate-y-1/2"
        size={15}
        style={{ color: '#94a3b8' }}
      />
      <input
        type="text"
        aria-label="Search species or varieties"
        placeholder="Search species or varieties..."
        value={searchTerm}
        onChange={e => setSearchTerm(e.target.value)}
        onFocus={() => setSearchFocused(true)}
        onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
        className="w-full pl-9 pr-8 py-2 text-sm transition-all"
        style={{
          fontWeight: 400,
          backgroundColor: dm.inputBg,
          border: '1px solid ' + dm.border,
          color: dm.text,
          borderRadius: '6px',
        }}
      />
      {searchTerm && (
        <button
          onClick={() => setSearchTerm('')}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center justify-center"
          style={{
            width: '18px',
            height: '18px',
            borderRadius: '50%',
            backgroundColor: dm.border,
            border: 'none',
            cursor: 'pointer',
            fontSize: '12px',
            color: dm.textMuted,
            lineHeight: 1,
          }}
        >
          &times;
        </button>
      )}
      {searchFocused && !searchTerm && (
        <div
          className="absolute z-30 mt-1 flex flex-wrap gap-1.5"
          style={{ top: '100%', left: 0 }}
        >
          {SUGGESTIONS.map(s => (
            <button
              key={s}
              onMouseDown={e => {
                e.preventDefault();
                setSearchTerm(s);
              }}
              style={{
                fontSize: '11px',
                padding: '3px 10px',
                backgroundColor: darkMode ? '#312e81' : '#eef2ff',
                color: darkMode ? '#c7d2fe' : '#4338ca',
                border: '1px solid ' + (darkMode ? '#4338ca' : '#c7d2fe'),
                borderRadius: '12px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              {s}
            </button>
          ))}
          <span
            style={{
              fontSize: '10px',
              color: '#94a3b8',
              padding: '4px 4px',
              alignSelf: 'center',
            }}
          >
            Try a species name
          </span>
        </div>
      )}
    </div>
  );
}
