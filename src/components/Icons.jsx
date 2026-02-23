import React from 'react';

const svgBase = {
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 2,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
};

function Icon({ size = 24, className = '', children }) {
  return (
    <svg width={size} height={size} className={className} {...svgBase}>
      {children}
    </svg>
  );
}

export function ChevronDown({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="m6 9 6 6 6-6" />
    </Icon>
  );
}

export function ChevronUp({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="m18 15-6-6-6 6" />
    </Icon>
  );
}

export function Search({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="11" cy="11" r="8" />
      <path d="m21 21-4.3-4.3" />
    </Icon>
  );
}

export function ExternalLink({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
    </Icon>
  );
}

export function X({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="M18 6 6 18" />
      <path d="m6 6 12 12" />
    </Icon>
  );
}

export function Sun({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </Icon>
  );
}

export function Moon({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z" />
    </Icon>
  );
}

export function Filter({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" fill="none" stroke="currentColor" />
    </Icon>
  );
}

export function Copy({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <rect width="14" height="14" x="8" y="8" rx="2" ry="2" />
      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
    </Icon>
  );
}

export function Share({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <path d="m8.59 13.51 6.83 3.98" />
      <path d="m15.41 6.51-6.82 3.98" />
    </Icon>
  );
}

export function Star({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" fill="none" stroke="currentColor" />
    </Icon>
  );
}

export function ChevronLeft({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="m15 18-6-6 6-6" />
    </Icon>
  );
}

export function ChevronRight({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="m9 18 6-6-6-6" />
    </Icon>
  );
}

export function Check({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="M20 6 9 17l-5-5" />
    </Icon>
  );
}

export function Trash({ size = 24, className = '' }) {
  return (
    <Icon size={size} className={className}>
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    </Icon>
  );
}
