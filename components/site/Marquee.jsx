'use client';

import { motion } from 'framer-motion';

/** Words shown in the scrolling hero marquee. */
const WORDS = [
  'Dry Cleaning',
  'Wash & Fold',
  'Ironing',
  'Duvets & Bedding',
  'Wedding Dresses',
  'Commercial Laundry',
  'Alterations',
  'Free Collection',
];

/**
 * Decorative infinite marquee of service keywords under the hero.
 * Powered by framer-motion for smooth, reliable scrolling.
 */
const Marquee = () => {
  // Duplicate the list to create a continuous, gapless scroll loop.
  const loop = [...WORDS, ...WORDS];

  return (
    <div className="marquee" aria-hidden="true">
      <motion.div 
        className="marquee__track"
        animate={{ x: [0, "-50%"] }}
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 28,
        }}
      >
        {loop.map((word, i) => (
          <span key={`${word}-${i}`}>
            {word}
            <span aria-hidden="true"> · </span>
          </span>
        ))}
      </motion.div>
    </div>
  );
};

export default Marquee;
