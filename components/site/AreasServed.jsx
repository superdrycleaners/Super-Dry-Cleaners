'use client';

import Reveal from './Reveal';
import { useBrand } from '@/components/site/BrandContext';

/**
 * "Areas We Serve" section — a grid of Leicester neighbourhoods.
 *
 * Helps with local SEO and signals coverage breadth to potential customers.
 */
const DEFAULT_AREAS = [
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

const AreasServed = () => {
  const brand = useBrand();

  const areasList = brand.areasServed
    ? brand.areasServed.split('·').map((a) => a.trim()).filter(Boolean)
    : DEFAULT_AREAS;

  return (
    <section className="section">
      <div className="container">
        <Reveal as="header" className="section__head section__head--center">
          <h2 className="section__title">Convenient Collection &amp; Delivery</h2>
          <p className="section__intro" style={{ marginBottom: '1.5rem' }}>
            We collect and deliver your laundry and dry cleaning directly to your door across Leicester and surrounding areas.
          </p>
          <p className="eyebrow" style={{ color: 'var(--teal)', fontSize: '1.1rem', fontWeight: 600 }}>
            FREE COLLECTION &amp; DELIVERY ON ORDERS OVER {brand.freeDeliveryThreshold || '£25'}
          </p>
        </Reveal>
        <Reveal className="areas">
          {areasList.map((area) => (
            <span className="areas__tag" key={area}>{area}</span>
          ))}
        </Reveal>
      </div>
    </section>
  );
};

export default AreasServed;
