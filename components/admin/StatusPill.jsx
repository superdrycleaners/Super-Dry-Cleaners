import PropTypes from 'prop-types';
import Badge from './ui/Badge';

/**
 * Status badge for an order, backed by the shared Badge primitive.
 *
 * Retains every existing status label and provides a safe fallback for
 * unexpected values. Color is supplemental — text and a dot marker
 * distinguish states without relying on color alone.
 *
 * @param {object} props
 * @param {string} props.status - One of the known order status keys.
 */
const StatusPill = ({ status }) => (
  <Badge status={status} />
);

StatusPill.propTypes = {
  status: PropTypes.string.isRequired,
};

export default StatusPill;
