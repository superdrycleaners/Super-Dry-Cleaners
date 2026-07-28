'use client';

import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * Premium list layout of services.
 * Replaces the old card grid with an elegant row-based list.
 *
 * @param {object} props
 * @param {Array<{num: string, title: string, body: string}>} props.services
 * @param {number} [props.limit]
 */
const ServiceCards = ({ services, limit }) => {
  const list = typeof limit === 'number' ? services.slice(0, limit) : services;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', borderTop: '1px solid var(--line)' }}>
      {list.map((service) => (
        <Reveal 
          as="article" 
          key={service.title}
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            gap: '1.5rem',
            padding: '2.5rem 1.5rem',
            borderBottom: '1px solid var(--line)',
            transition: 'all 0.4s var(--ease)',
            cursor: 'default',
            borderRadius: '12px'
          }}
          onMouseEnter={(e) => { 
            e.currentTarget.style.backgroundColor = 'var(--paper)'; 
            e.currentTarget.style.transform = 'translateX(10px)';
          }}
          onMouseLeave={(e) => { 
            e.currentTarget.style.backgroundColor = 'transparent'; 
            e.currentTarget.style.transform = 'translateX(0)';
          }}
        >
          {/* Number */}
          <div style={{ flex: '0 0 60px' }}>
            <span style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '2.4rem', 
              color: 'var(--brass)', 
              fontStyle: 'italic',
              fontWeight: 400,
              lineHeight: 1
            }}>
              {service.num}
            </span>
          </div>

          {/* Title */}
          <div style={{ flex: '1 1 240px' }}>
            <h3 style={{ 
              fontFamily: 'var(--font-display)', 
              fontSize: '1.8rem', 
              fontWeight: 500, 
              color: 'var(--ink)',
              margin: 0
            }}>
              {service.title}
            </h3>
          </div>

          {/* Body */}
          <div style={{ flex: '2 1 320px' }}>
            <p style={{ 
              color: 'var(--ink-soft)', 
              fontSize: '1.05rem',
              margin: 0,
              lineHeight: '1.65'
            }}>
              {service.body}
            </p>
          </div>
        </Reveal>
      ))}
    </div>
  );
};

ServiceCards.propTypes = {
  services: PropTypes.arrayOf(
    PropTypes.shape({
      num: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }),
  ).isRequired,
  limit: PropTypes.number,
};

export default ServiceCards;
