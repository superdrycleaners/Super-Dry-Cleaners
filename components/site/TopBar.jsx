'use client';

import PropTypes from 'prop-types';
import { useBrand } from '@/components/site/BrandContext';

/**
 * Slim contact bar shown above the main nav.
 *
 * Displays phone, email and hours from CMS brand content.
 *
 * @param {object} props
 * @param {object} [props.brand] - Optional brand contact info from CMS.
 */
const TopBar = ({ brand: propBrand }) => {
  const contextBrand = useBrand();
  const brand = { ...contextBrand, ...propBrand };

  return (
    <div className="topbar">
      <div className="container topbar__inner">
        {brand.phone && (
          <a href={`tel:${brand.phoneHref || brand.phone}`} className="topbar__item">
            <span aria-hidden="true">📞</span> {brand.phone}
          </a>
        )}
        {brand.email && (
          <a href={`mailto:${brand.email}`} className="topbar__item">
            <span aria-hidden="true">✉️</span> {brand.email}
          </a>
        )}
        {brand.openingHours && (
          <span className="topbar__item topbar__hours">
            <span aria-hidden="true">🕐</span> {brand.openingHours}
          </span>
        )}
      </div>
    </div>
  );
};

TopBar.propTypes = {
  brand: PropTypes.object,
};

export default TopBar;
