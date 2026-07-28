import PropTypes from 'prop-types';

// Keep labels local so the client bundle does not import the order data module.
const STATUS_DETAILS = {
  pending: { className: 'pending', label: 'Pending' },
  confirmed: { className: 'confirmed', label: 'Confirmed' },
  collected: { className: 'collected', label: 'Collected' },
  'in-progress': { className: 'in-progress', label: 'In progress' },
  ready: { className: 'ready', label: 'Ready' },
  delivered: { className: 'delivered', label: 'Delivered' },
  cancelled: { className: 'cancelled', label: 'Cancelled' },
};

const STATUS_ALIASES = { in_progress: 'in-progress' };
const FALLBACK_STATUS = { className: 'unknown', label: 'Unknown status' };

/**
 * Admin-scoped order-status badge with a readable label and status marker.
 *
 * Status keys are allowlisted before entering a CSS class, so unexpected
 * values render a neutral fallback rather than becoming selector fragments.
 * The `status` alias accepts the repository's order-record naming while
 * `variant` follows the primitive contract.
 *
 * @param {object} props - Badge configuration and forwarded span attributes.
 * @param {string} [props.variant='pending'] - Status variant to display.
 * @param {string} [props.status] - Optional repository-style status alias.
 * @param {React.ReactNode} [props.children] - Custom readable badge content.
 * @param {string} [props.className] - Additional classes for the badge.
 * @returns {JSX.Element} A readable, admin-styled status badge.
 */
const Badge = ({
  variant = 'pending',
  status,
  children,
  className = '',
  ...otherProps
}) => {
  const requestedStatus = status || variant;
  const normalizedStatus = STATUS_ALIASES[requestedStatus] || requestedStatus;
  const details = STATUS_DETAILS[normalizedStatus] || FALLBACK_STATUS;
  const badgeClassName = [
    'admin-ui__badge',
    `admin-ui__badge--${details.className}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <span {...otherProps} className={badgeClassName}>
      {children ?? details.label}
    </span>
  );
};

Badge.propTypes = {
  variant: PropTypes.string,
  status: PropTypes.string,
  children: PropTypes.node,
  className: PropTypes.string,
};

export default Badge;
