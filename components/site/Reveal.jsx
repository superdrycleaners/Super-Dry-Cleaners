'use client';

import { useRef, useEffect, useState } from 'react';
import PropTypes from 'prop-types';

/**
 * Wrapper that fades/reveals its children when scrolled into view.
 *
 * Uses IntersectionObserver and unobserves after the first reveal so the
 * animation runs once. Respects reduced-motion via the CSS `.reveal` rules.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Content to reveal.
 * @param {string} [props.as='div'] - Element/tag to render as the wrapper.
 * @param {string} [props.className] - Extra classes appended to `reveal`.
 */
const Reveal = ({ children, as = 'div', className = '', ...otherProps }) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return undefined;

    // Fallback: if IO is unavailable, show immediately.
    if (!('IntersectionObserver' in window)) {
      setVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries, obs) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisible(true);
            obs.unobserve(entry.target); // reveal once, then stop watching
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const Tag = as;
  return (
    <Tag
      ref={ref}
      className={`reveal${visible ? ' is-visible' : ''}${className ? ` ${className}` : ''}`}
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
};

export default Reveal;
