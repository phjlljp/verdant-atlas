import React, { useState, useMemo } from 'react';
import { IMG_BASE, IMAGE_MAP } from '../data/images.js';

function getVarietySlug(species, variety) {
  return (variety || species).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function GalleryCard({ species, variety, slug }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imagePath = IMAGE_MAP[slug];
  const hasImage = !!imagePath;

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', overflow: 'hidden' }}>
      <div style={{ width: '100%', paddingTop: '100%', position: 'relative', backgroundColor: '#f1f5f9' }}>
        {hasImage && !errored ? (
          <>
            {!loaded && (
              <div className="img-skeleton" style={{ position: 'absolute', inset: 0 }} />
            )}
            <img
              src={IMG_BASE + imagePath}
              alt={variety || species}
              loading="lazy"
              onLoad={() => setLoaded(true)}
              onError={() => setErrored(true)}
              style={{
                position: 'absolute',
                inset: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
                opacity: loaded ? 1 : 0,
                transition: 'opacity 0.2s ease',
              }}
            />
          </>
        ) : (
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', fontSize: '24px' }}>
            🌸
          </div>
        )}
      </div>
      <div style={{ padding: '8px 10px' }}>
        <p style={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: '#94a3b8', marginBottom: '2px' }}>{species}</p>
        {variety && (
          <p style={{ fontSize: '12px', fontWeight: 600, color: '#1e293b', lineHeight: 1.3 }}>{variety}</p>
        )}
      </div>
    </div>
  );
}

export default function GalleryView({ sortedFiltered }) {
  const items = useMemo(() => {
    const result = [];
    sortedFiltered.forEach(sd => {
      sd.varieties.forEach(v => {
        const slug = getVarietySlug(sd.species, v.name);
        if (IMAGE_MAP[slug]) {
          result.push({ species: sd.species, variety: v.name, slug });
        }
      });
    });
    // Sort by species name then variety
    result.sort((a, b) => a.species.localeCompare(b.species) || (a.variety || '').localeCompare(b.variety || ''));
    return result;
  }, [sortedFiltered]);

  if (items.length === 0) {
    return (
      <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
        <p style={{ color: '#94a3b8', fontSize: '12px' }}>No variety photos available for the current filter.</p>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: '#fff', border: '1px solid #e2e8f0', padding: '20px', borderRadius: '8px' }}>
      <h3 style={{ fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '16px', color: '#1e293b' }}>
        Variety Gallery ({items.length} photos)
      </h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '12px' }}>
        {items.map((item) => (
          <GalleryCard
            key={item.slug}
            species={item.species}
            variety={item.variety}
            slug={item.slug}
          />
        ))}
      </div>
    </div>
  );
}
