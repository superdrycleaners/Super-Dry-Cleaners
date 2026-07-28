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
        <p className="eyebrow">Areas we serve</p>
        <h2 className="section__title">Covering Leicester &amp; beyond.</h2>
        <p className="section__intro">
          Free collection and delivery on orders over £25 across all these areas and more.
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
