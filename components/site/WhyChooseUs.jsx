import Reveal from './Reveal';

/**
 * "Why Choose Us?" section — trust-building feature grid.
 *
 * Mirrors the pattern used by Clarendon's "Heritage & Trust" trio and the
 * business leaflet's "Why Choose Us?" checklist.
 */
const REASONS = [
  {
    icon: '🏭',
    title: 'Latest Machines',
    body: 'Professional-grade equipment and premium detergents for the best results every time.',
  },
  {
    icon: '🌿',
    title: 'Eco-Friendly',
    body: 'Environmentally responsible products that protect your fabrics and the planet.',
  },
  {
    icon: '💷',
    title: 'Competitive Pricing',
    body: 'Professional cleaning and laundry services at clear and competitive prices.',
  },
  {
    icon: '🚐',
    title: 'Free Collection & Delivery',
    body: 'On all orders over £25. We come to you across Leicester and surrounding areas.',
  },
  {
    icon: '⭐',
    title: 'Satisfaction Guaranteed',
    body: "If you are not satisfied with the cleaning, please contact us and we will work with you to put it right.",
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Trusted by Homes & Businesses',
    body: 'Serving households, hotels, Airbnb hosts, restaurants, salons and other businesses across Leicester and surrounding areas.',
  },
];

const WhyChooseUs = () => (
  <section className="section section--muted">
    <div className="container">
      <Reveal as="header" className="section__head section__head--center">
        <p className="eyebrow">Why choose us</p>
        <h2 className="section__title">The SuperDryCleaners difference.</h2>
      </Reveal>
      <div className="grid grid--reasons">
        {REASONS.map((reason) => (
          <Reveal className="reason" key={reason.title}>
            <span className="reason__icon" aria-hidden="true">{reason.icon}</span>
            <h3>{reason.title}</h3>
            <p>{reason.body}</p>
          </Reveal>
        ))}
      </div>
    </div>
  </section>
);

export default WhyChooseUs;
