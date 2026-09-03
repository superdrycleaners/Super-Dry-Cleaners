import PropTypes from 'prop-types';

/**
 * Slim contact bar shown above the main nav.
 *
 * Displays phone, email and hours from CMS brand content.
 *
 * @param {object} props
 * @param {object} props.brand - Brand contact info from CMS.
 */
const TopBar = ({ brand = {} }) => (
  <div className="topbar">
    <div className="container topbar__inner">
      <a href={`tel:${brand.phoneHref || '+447889693265'}`} className="topbar__item">
        <span aria-hidden="true">📞</span> {brand.phone || '07889 693265'}
      </a>
      <a href={`mailto:${brand.email || 'info@superdrycleaners.co'}`} className="topbar__item">
        <span aria-hidden="true">✉️</span> {brand.email || 'info@superdrycleaners.co'}
      </a>
      <span className="topbar__item topbar__hours">
        <span aria-hidden="true">🕐</span> {brand.openingHours || 'Mon–Fri: 9am – 6pm'}
      </span>
    </div>
  </div>
);

TopBar.propTypes = {
  brand: PropTypes.object,
};

export default TopBar;
