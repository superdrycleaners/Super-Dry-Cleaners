import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * Highlighted special offers banner for the homepage.
 *
 * Dark navy background with gold accents — visually distinct from other
 * sections to draw attention to current promotions.
 *
 * @param {object} props
 * @param {Array<{name: string, sub?: string, price: string, feature?: boolean}>}
 *   props.offers - The offer items from the catalogue data.
 */
const SpecialOffers = ({ offers }) => (
  <section className="section offers" id="offers">
    <div className="container">
      <Reveal as="header" className="section__head section__head--center">
        <p className="offers__badge">★ Limited Time Offers</p>
        <h2 className="offers__title">Exclusive Deals</h2>
        <p className="offers__sub">Save on your first order and selected services. Don&apos;t miss out!</p>
      </Reveal>
      <div className="offers__grid">
        {offers.map((offer) => (
          <Reveal className="offers__card" key={offer.name}>
            <span className="offers__price">{offer.price}</span>
            <h3>{offer.name}</h3>
            {offer.sub && <p>{offer.sub}</p>}
          </Reveal>
        ))}
      </div>
      <Reveal className="offers__cta">
        <a href="#book" className="btn btn--solid">Book Now &amp; Save</a>
      </Reveal>
    </div>
  </section>
);

SpecialOffers.propTypes = {
  offers: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      sub: PropTypes.string,
      price: PropTypes.string.isRequired,
      feature: PropTypes.bool,
    }),
  ).isRequired,
};

export default SpecialOffers;
