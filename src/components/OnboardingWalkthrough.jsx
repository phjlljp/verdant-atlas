import { useCallback } from 'react';

const WALK_STEPS = [
  { selector: 'input[placeholder*="Search"]', title: 'Search Varieties', text: 'Search 147 flower varieties by name. Try "sun" or "purple".' },
  { selector: '[data-species]', title: 'Explore Species', text: 'Tap any card to expand it and see varieties, dates, and growing details.' },
  { selector: '.variety-chip', title: 'Star Your Favorites', text: 'Click the star on any variety to add it to your garden plan.' },
  { selector: '[title="Show only your starred varieties"]', title: 'View My Garden', text: 'See all your starred varieties in one place. Your selections save automatically.' },
];

export default function OnboardingWalkthrough({ walkStep, setWalkStep, onDismiss }) {
  const dismiss = useCallback(() => {
    onDismiss();
  }, [onDismiss]);

  if (walkStep === null || walkStep < 0 || walkStep > 3) return null;

  const step = WALK_STEPS[walkStep];
  const el = typeof document !== 'undefined' ? document.querySelector(step.selector) : null;
  const rect = el ? el.getBoundingClientRect() : { top: 200, left: 100, width: 200, height: 40 };
  const pad = 8;

  return (
    <div className="fixed inset-0 z-50" style={{ pointerEvents: 'auto' }}>
      <svg className="absolute inset-0" width="100%" height="100%" style={{ pointerEvents: 'none' }}>
        <defs>
          <mask id="walk-mask">
            <rect width="100%" height="100%" fill="white" />
            <rect x={rect.left - pad} y={rect.top - pad} width={rect.width + pad * 2} height={rect.height + pad * 2} rx="8" fill="black" />
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="rgba(0,0,0,0.5)" mask="url(#walk-mask)" />
      </svg>
      <div style={{
        position: 'absolute',
        top: Math.min(rect.top + rect.height + pad + 12, (typeof window !== 'undefined' ? window.innerHeight : 800) - 160),
        left: Math.max(16, Math.min(rect.left, (typeof window !== 'undefined' ? window.innerWidth : 400) - 300)),
        width: '280px',
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '16px 20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.25)',
        zIndex: 51
      }}>
        <p style={{ fontSize: '10px', color: '#6366f1', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '4px' }}>Step {walkStep + 1} of 4</p>
        <p style={{ fontSize: '15px', fontWeight: 700, color: '#1e293b', marginBottom: '6px' }}>{step.title}</p>
        <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, marginBottom: '14px' }}>{step.text}</p>
        <div className="flex gap-2 justify-end">
          <button onClick={dismiss} style={{ fontSize: '12px', color: '#94a3b8', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 12px' }}>Skip</button>
          <button onClick={() => { if (walkStep >= 3) { dismiss(); } else { setWalkStep(walkStep + 1); } }}
            style={{ fontSize: '12px', fontWeight: 700, color: '#fff', backgroundColor: '#6366f1', border: 'none', borderRadius: '6px', cursor: 'pointer', padding: '6px 16px' }}>
            {walkStep >= 3 ? 'Done' : 'Next'}
          </button>
        </div>
      </div>
    </div>
  );
}
