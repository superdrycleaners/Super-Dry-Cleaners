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
    title: 'Affordable Pricing',
    body: 'Premium quality without the premium price tag. Honest, transparent pricing.',
  },
  {
    icon: '🚐',
    title: 'Free Collection & Delivery',
    body: 'On all orders over £25. We come to you across Leicester and surrounding areas.',
  },
  {
    icon: '⭐',
    title: 'Satisfaction Guaranteed',
    body: "Not happy? We'll re-clean it for free. No questions asked.",
  },
  {
    icon: '👨‍👩‍👧',
    title: 'Trusted by Homes & Businesses',
    body: 'Hotels, Airbnbs, restaurants, salons and families across Leicestershire trust us.',
  },
];

const WhyChooseUs = () => (
  <section className="section section--muted">
    <div className="container">
      <Reveal as="header" className="section__head section__head--center">
        <p className="eyebrow">Why choose us</p>
        <h2 className="section__title">The Super Dry Cleaners difference.</h2>
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
