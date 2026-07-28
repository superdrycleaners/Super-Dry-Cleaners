import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * Grid of service cards.
 *
 * @param {object} props
 * @param {Array<{num: string, title: string, body: string}>} props.services -
 *   Services to render.
 * @param {number} [props.limit] - Optional cap on how many to show (used on
 *   the home page preview).
 */
const ServiceCards = ({ services, limit }) => {
  const list = typeof limit === 'number' ? services.slice(0, limit) : services;

  return (
    <div className="grid grid--services">
      {list.map((service) => (
        <Reveal as="article" className="card" key={service.title}>
          <span className="card__num">{service.num}</span>
          <h3>{service.title}</h3>
          <p>{service.body}</p>
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
