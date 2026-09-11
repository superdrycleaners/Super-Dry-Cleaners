'use client';

import PropTypes from 'prop-types';
import { useBrand } from '@/components/site/BrandContext';

/**
 * Public site footer with brand, services, contact, hours, and areas served.
 *
 * @param {object} props
 * @param {object} [props.brand] - Brand contact info from CMS content.
 */
const SiteFooter = ({ brand: propBrand }) => {
  const contextBrand = useBrand();
  const brand = { ...contextBrand, ...propBrand };
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Frame 32.svg" alt={brand.name || 'SuperDryCleaners'} className="footer__brand-logo" width="180" height="108" />
          <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>{brand.name}</h3>
          <p>Professional Dry Cleaning &amp; Laundry Services in Leicester</p>
        </div>
        <nav className="footer__col" aria-label="Services">
          <h4>Services</h4>
          <a href="/#services">Dry Cleaning</a>
          <a href="/#services">Wash, Dry &amp; Fold</a>
          <a href="/#services">Ironing &amp; Pressing</a>
          <a href="/#services">Duvets &amp; Bedding</a>
          <a href="/#services">Wedding Dress Cleaning</a>
          <a href="/#services">Commercial Laundry</a>
          <a href="/#services">Alterations &amp; Repairs</a>
        </nav>
        <div className="footer__col">
          <h4>Contact</h4>
          {brand.phone && (
            <a href={`tel:${brand.phoneHref || brand.phone}`}>{brand.phone}</a>
          )}
          {brand.email && (
            <a href={`mailto:${brand.email}`}>{brand.email}</a>
          )}
          {brand.whatsapp && (
            <a href={`https://wa.me/${brand.whatsapp}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          )}
          {brand.address && (
            <p className="footer__addr">{brand.address}</p>
          )}
        </div>
        <div className="footer__col">
          <h4>Opening Hours</h4>
          {brand.openingHours && <p className="footer__hours">{brand.openingHours}</p>}
          {brand.closedDay && <p className="footer__hours">{brand.closedDay}</p>}
          <h4 style={{ marginTop: '1.4rem' }}>Quick Links</h4>
          <a href="/#about">About Us</a>
          <a href="/pricing">Pricing</a>
          <a href="/contact">Contact Us</a>
          <a href="/#book">Book Collection</a>
        </div>
      </div>

      {/* Areas we serve strip */}
      {brand.areasServed && (
        <div className="footer__areas">
          <div className="container">
            <p className="footer__areas-label">Areas we serve:</p>
            <p className="footer__areas-list">{brand.areasServed}</p>
          </div>
        </div>
      )}

      <div className="container footer__base">
        <p>© {year} {brand.name}. {brand.copyright}</p>
        <p>{brand.tagline}</p>
      </div>
    </footer>
  );
};

SiteFooter.propTypes = {
  brand: PropTypes.object,
};

export default SiteFooter;
