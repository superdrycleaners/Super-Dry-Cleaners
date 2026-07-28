import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * The four-step "how it works" list.
 *
 * @param {object} props
 * @param {Array<{title: string, body: string}>} props.steps - Ordered steps.
 */
const Steps = ({ steps }) => (
  <ol className="steps">
    {steps.map((step, i) => (
      <Reveal as="li" className="step" key={step.title}>
        {/* Connector line is omitted on the last step via absence of markup */}
        {i < steps.length - 1 && <span className="step__line" aria-hidden="true" />}
        <span className="step__num">{i + 1}</span>
        <h3>{step.title}</h3>
        <p>{step.body}</p>
      </Reveal>
    ))}
  </ol>
);

Steps.propTypes = {
  steps: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      body: PropTypes.string.isRequired,
    }),
  ).isRequired,
};

export default Steps;
