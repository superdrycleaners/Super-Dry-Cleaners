'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Reveal from './Reveal';

// Custom Icons for categories
const CategoryIcons = {
  dry: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
  ),
  laundry: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2 12h4l2-2 4 4 4-4 2 2h4"></path><path d="M2 16h4l2-2 4 4 4-4 2 2h4"></path><path d="M2 20h4l2-2 4 4 4-4 2 2h4"></path></svg>
  ),
  commercial: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="4" y="2" width="16" height="20" rx="2" ry="2"></rect><path d="M9 22v-4h6v4"></path><path d="M8 6h.01"></path><path d="M16 6h.01"></path><path d="M12 6h.01"></path><path d="M12 10h.01"></path><path d="M12 14h.01"></path><path d="M16 10h.01"></path><path d="M16 14h.01"></path><path d="M8 10h.01"></path><path d="M8 14h.01"></path></svg>
  ),
  offers: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
  ),
  default: (
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16c0 1.1.9 2 2 2h12a2 2 0 0 0 2-2V8l-6-6z"></path><path d="M14 3v5h5M16 13H8M16 17H8M10 9H8"></path></svg>
  )
};

/**
 * Filterable price catalogue, premium elegant menu design.
 */
const Catalogue = ({ groups }) => {
  const [filter, setFilter] = useState('all');

  const tabs = [
    { id: 'all', label: 'All Categories' },
    ...groups.map((g) => ({ id: g.id, label: g.title })),
  ];

  return (
    <>
      <style dangerouslySetInnerHTML={{
        __html: `
        .catalogue-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 5rem 4rem;
        }
        .group-wide {
          grid-column: 1 / -1;
        }
        .catalogue-item:hover .item-name {
          color: var(--teal);
          transform: translateX(4px);
        }
        .catalogue-item {
          transition: all 0.3s ease;
        }
        @media (max-width: 900px) {
          .catalogue-grid {
            grid-template-columns: 1fr;
            gap: 4rem;
          }
          .group-wide {
            grid-column: 1;
          }
        }
      `}} />

      {/* Elegant Underline Tabs */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '1.5rem', marginBottom: '5rem' }}>
        {tabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id)}
              style={{
                background: 'transparent',
                color: active ? 'var(--teal)' : 'var(--ink-soft)',
                border: 'none',
                borderBottom: active ? '2px solid var(--brass)' : '2px solid transparent',
                padding: '0.5rem 0',
                fontSize: '1.1rem',
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'all 0.3s var(--ease)',
                fontFamily: 'var(--font-body)',
                letterSpacing: '0.02em'
              }}
              onMouseEnter={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--teal)';
                  e.currentTarget.style.borderBottom = '2px solid rgba(201,169,78,0.4)';
                }
              }}
              onMouseLeave={(e) => {
                if (!active) {
                  e.currentTarget.style.color = 'var(--ink-soft)';
                  e.currentTarget.style.borderBottom = '2px solid transparent';
                }
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Catalogue Grid */}
      <div className="catalogue-grid">
        {groups.map((group) => {
          if (filter !== 'all' && filter !== group.id) return null;

          const isOffer = group.id === 'offers';
          const icon = CategoryIcons[group.id] || CategoryIcons.default;

          return (
            <Reveal
              key={group.id}
              className={group.wide ? 'group-wide' : 'group-normal'}
              style={{
                background: isOffer ? 'linear-gradient(135deg, var(--dark) 0%, #061533 100%)' : 'transparent',
                color: isOffer ? '#fff' : 'var(--ink)',
                borderRadius: isOffer ? '24px' : '0',
                padding: isOffer ? '4rem' : '0',
                position: 'relative',
                overflow: 'hidden',
                boxShadow: isOffer ? '0 30px 60px -20px rgba(10,31,68,0.5)' : 'none'
              }}
            >
              {isOffer && (
                <div style={{ position: 'absolute', top: '-10%', right: '-5%', width: '300px', height: '300px', background: 'radial-gradient(circle, rgba(201,169,78,0.15) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              )}

              {/* Group Header */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: isOffer ? 'center' : 'flex-start', textAlign: isOffer ? 'center' : 'left', marginBottom: '2.5rem' }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '2.2rem', fontWeight: 400, margin: 0, color: isOffer ? '#fff' : 'var(--teal)', letterSpacing: '-0.02em' }}>
                  {group.title}
                </h3>
                <span style={{ display: 'block', marginTop: '0.8rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.15em', color: isOffer ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)' }}>
                  {group.note}
                </span>
              </div>

              {/* Group Items */}
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className="catalogue-item"
                    style={{
                      display: 'flex',
                      alignItems: 'baseline',
                      gap: '1rem',
                      width: '100%',
                    }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span
                        className="item-name"
                        style={{
                          fontFamily: 'var(--font-display)',
                          fontSize: '1.35rem',
                          color: isOffer ? '#fff' : 'var(--ink)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {item.name}
                      </span>
                      {item.sub && (
                        <span style={{ fontSize: '0.9rem', color: isOffer ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)', marginTop: '0.2rem' }}>
                          {item.sub}
                        </span>
                      )}
                    </div>

                    {/* Dotted Line connector */}
                    <div style={{
                      flexGrow: 1,
                      borderBottom: isOffer ? '2px dotted rgba(255,255,255,0.2)' : '2px dotted rgba(10,31,68,0.15)',
                      margin: '0 0.5rem',
                      position: 'relative',
                      top: '-6px'
                    }}></div>

                    <div style={{ flexShrink: 0, textAlign: 'right' }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.45rem', color: isOffer ? 'var(--brass)' : 'var(--teal)' }}>
                        {item.price}
                      </span>
                      {item.priceSuffix && (
                        <span style={{ fontSize: '0.85rem', color: isOffer ? 'rgba(255,255,255,0.6)' : 'var(--ink-soft)', marginLeft: '0.3rem' }}>
                          {item.priceSuffix}
                        </span>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </>
  );
};

Catalogue.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      note: PropTypes.string,
      wide: PropTypes.bool,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          sub: PropTypes.string,
          price: PropTypes.string.isRequired,
          priceSuffix: PropTypes.string,
          feature: PropTypes.bool,
        }),
      ).isRequired,
    }),
  ).isRequired,
};

export default Catalogue;
