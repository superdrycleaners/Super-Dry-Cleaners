import PropTypes from 'prop-types';

/**
 * Public site footer with brand, services, contact, hours, and areas served.
 *
 * @param {object} props
 * @param {object} props.brand - Brand contact info from CMS content.
 */
const SiteFooter = ({ brand }) => {
  const year = new Date().getFullYear();

  return (
    <footer className="footer">
      <div className="container footer__inner">
        <div className="footer__brand">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Frame 32.svg" alt="Super Dry Cleaners" className="footer__brand-logo" width="180" height="108" />
          <h3 style={{ fontSize: '1.2rem', marginTop: '1rem', marginBottom: '0.5rem', color: 'var(--ink)' }}>Super Dry Cleaners</h3>
          <p>Professional Dry Cleaning &amp; Laundry Services in Leicester</p>
        </div>
        <nav className="footer__col" aria-label="Services">
          <h4>Services</h4>
          <a href="#services">Dry Cleaning</a>
          <a href="#services">Wash, Dry &amp; Fold</a>
          <a href="#services">Duvets &amp; Bedding</a>
          <a href="#services">Ironing &amp; Pressing</a>
          <a href="#services">Commercial Laundry</a>
          <a href="#services">Wedding Dress</a>
        </nav>
        <div className="footer__col">
          <h4>Contact</h4>
          <a href={`tel:${brand.phoneHref}`}>{brand.phone}</a>
          <a href={`mailto:${brand.email}`}>{brand.email}</a>
          <a href={`https://wa.me/${brand.whatsapp || '447889693265'}`} target="_blank" rel="noopener noreferrer">WhatsApp</a>
          <p className="footer__addr">{brand.address}</p>
        </div>
        <div className="footer__col">
          <h4>Opening Hours</h4>
          <p className="footer__hours">Monday – Friday: 9:00am – 6:00pm</p>
          <p className="footer__hours">Saturday – Sunday: Closed</p>
          <h4 style={{ marginTop: '1.4rem' }}>Quick Links</h4>
          <a href="#about">About Us</a>
          <a href="#pricing">Pricing</a>
          <a href="#book">Book Collection</a>
        </div>
      </div>

      {/* Areas we serve strip */}
      <div className="footer__areas">
        <div className="container">
          <p className="footer__areas-label">Areas we serve:</p>
          <p className="footer__areas-list">
            {brand.areasServed || 'Leicester City Centre · Clarendon Park · Oadby · Knighton · Evington · Stoneygate · Highfields · Braunstone · Glenfield · Beaumont Leys · Belgrave · Wigston · and more'}
          </p>
        </div>
      </div>

      <div className="container footer__base">
        <p>© {year} {brand.name}. {brand.copyright || 'All rights reserved.'}</p>
        <p>{brand.tagline || 'Proudly serving Leicester & surrounding areas since 2005.'}</p>
      </div>
    </footer>
  );
};

SiteFooter.propTypes = {
  brand: PropTypes.shape({
    name: PropTypes.string.isRequired,
    email: PropTypes.string.isRequired,
    phone: PropTypes.string.isRequired,
    phoneHref: PropTypes.string.isRequired,
    phoneLandline: PropTypes.string,
    whatsapp: PropTypes.string,
    address: PropTypes.string.isRequired,
    tagline: PropTypes.string,
    copyright: PropTypes.string,
    openingHours: PropTypes.string,
    closedDay: PropTypes.string,
    areasServed: PropTypes.string,
  }).isRequired,
};

export default SiteFooter;
