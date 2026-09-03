import Reveal from './Reveal';

/**
 * "Areas We Serve" section — a grid of Leicester neighbourhoods.
 *
 * Helps with local SEO and signals coverage breadth to potential customers.
 * Inspired by Laundero's footer area list.
 */
const AREAS = [
  'Leicester City Centre',
  'Clarendon Park',
  'Oadby',
  'Knighton',
  'Evington',
  'Stoneygate',
  'Highfields',
  'Braunstone',
  'Glenfield',
  'Beaumont Leys',
  'Belgrave',
  'Birstall',
  'Thurmaston',
  'Hamilton',
  'Glen Parva',
  'Aylestone',
  'New Parks',
  'Wigston',
  'Leicester Forest East',
  'Narborough',
];

const AreasServed = () => (
  <section className="section">
    <div className="container">
      <Reveal as="header" className="section__head section__head--center">
        <h2 className="section__title">Convenient Collection &amp; Delivery</h2>
        <p className="section__intro" style={{ marginBottom: '1.5rem' }}>
          We collect and deliver your laundry and dry cleaning directly to your door across Leicester and surrounding areas.
        </p>
        <p className="eyebrow" style={{ color: 'var(--teal)', fontSize: '1.1rem', fontWeight: 600 }}>
          FREE COLLECTION &amp; DELIVERY ON ORDERS OVER £25
        </p>
      </Reveal>
      <Reveal className="areas">
        {AREAS.map((area) => (
          <span className="areas__tag" key={area}>{area}</span>
        ))}
      </Reveal>
    </div>
  </section>
);

export default AreasServed;
