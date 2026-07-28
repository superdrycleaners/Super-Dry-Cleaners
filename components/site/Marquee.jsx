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
 *
 * The word list is duplicated so the CSS translateX(-50%) loop is seamless.
 */
const Marquee = () => {
  // Duplicate the list to create a continuous, gapless scroll loop.
  const loop = [...WORDS, ...WORDS];

  return (
    <div className="marquee" aria-hidden="true">
      <div className="marquee__track">
        {loop.map((word, i) => (
          // Index key is acceptable here: a fixed, non-reordering decorative list.
          <span key={`${word}-${i}`}>
            {word}
            <span aria-hidden="true"> · </span>
          </span>
        ))}
      </div>
    </div>
  );
};

export default Marquee;
