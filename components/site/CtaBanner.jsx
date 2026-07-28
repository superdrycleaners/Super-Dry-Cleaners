import Link from 'next/link';
import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * Reusable closing call-to-action banner.
 *
 * @param {object} props
 * @param {string} props.title - Banner heading.
 * @param {string} props.intro - Supporting line beneath the heading.
 * @param {Array<{href: string, label: string, variant?: string}>} props.actions -
 *   One or more buttons. `variant` maps to a `.btn--*` modifier.
 */
const CtaBanner = ({ title, intro, actions }) => (
  <section className="section cta">
    <Reveal className="container cta__inner">
      <h2 className="section__title">{title}</h2>
      <p className="section__intro">{intro}</p>
      <div className="cta__actions">
        {actions.map((action) => (
          <Link key={action.href + action.label} href={action.href} className={`btn ${action.variant || 'btn--solid'}`}>
            {action.label}
          </Link>
        ))}
      </div>
    </Reveal>
  </section>
);

CtaBanner.propTypes = {
  title: PropTypes.string.isRequired,
  intro: PropTypes.string.isRequired,
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      href: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      variant: PropTypes.string,
    }),
  ).isRequired,
};

export default CtaBanner;
