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
      <a href={`tel:${brand.phoneHref || '+447849533923'}`} className="topbar__item">
        <span aria-hidden="true">📞</span> {brand.phone || '07849 533923'}
      </a>
      <a href={`mailto:${brand.email || 'superdrycleaners31@gmail.com'}`} className="topbar__item">
        <span aria-hidden="true">✉️</span> {brand.email || 'superdrycleaners31@gmail.com'}
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
