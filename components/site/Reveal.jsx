'use client';

import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

/**
 * Wrapper that fades/reveals its children when scrolled into view using framer-motion.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Content to reveal.
 * @param {string} [props.as='div'] - Element/tag to render as the wrapper.
 * @param {string} [props.className] - Extra classes.
 * @param {number} [props.delay=0] - Delay before animation starts in seconds.
 */
const Reveal = ({ children, as = 'div', className = '', delay = 0, ...otherProps }) => {
  // Map standard HTML tags to motion components
  const Tag = motion[as] || motion.div;

  return (
    <Tag
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "0px 0px -40px 0px", amount: 0.12 }}
      transition={{ 
        duration: 0.7, 
        delay, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className={className}
      {...otherProps}
    >
      {children}
    </Tag>
  );
};

Reveal.propTypes = {
  children: PropTypes.node.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  delay: PropTypes.number,
};

export default Reveal;
