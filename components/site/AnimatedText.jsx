'use client';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';

const container = {
  hidden: { opacity: 0 },
  visible: (delay) => ({
    opacity: 1,
    transition: { staggerChildren: 0.12, delayChildren: delay },
  }),
};

const child = {
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      damping: 12,
      stiffness: 100,
    },
  },
  hidden: {
    opacity: 0,
    y: 20,
  },
};

/**
 * Animates a string of text word-by-word.
 */
const AnimatedText = ({ text, as = 'h1', className = '', delay = 0 }) => {
  const Tag = motion[as] || motion.h1;
  // If the text isn't a string (e.g. JSX), just fallback to a regular motion element
  if (typeof text !== 'string') {
    return (
      <Tag
        className={className}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "0px 0px -40px 0px" }}
        transition={{ delay, duration: 0.7 }}
      >
        {text}
      </Tag>
    );
  }

  const words = text.split(" ");

  return (
    <Tag
      className={className}
      variants={container}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "0px 0px -40px 0px", amount: 0.12 }}
      custom={delay}
    >
      {words.map((word, index) => (
        <motion.span
          variants={child}
          style={{ display: 'inline-block', marginRight: '0.25em' }}
          key={index}
        >
          {word}
        </motion.span>
      ))}
    </Tag>
  );
};

AnimatedText.propTypes = {
  text: PropTypes.node.isRequired,
  as: PropTypes.string,
  className: PropTypes.string,
  delay: PropTypes.number,
};

export default AnimatedText;
