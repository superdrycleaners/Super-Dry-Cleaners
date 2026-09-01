'use client';

/**
 * Subtle luxury botanical accents for the eco page hero.
 * Delicate watermark leaf lines in muted champagne and slate-navy with low opacity.
 */
const LEAVES = [
  {
    id: 'gold-1',
    stroke: '#c9a94e',
    fill: 'rgba(201, 169, 78, 0.04)',
    delay: '0s',
    size: 130,
    top: '12%',
    left: '8%',
    rotate: -18,
    duration: '14s',
  },
  // {
  //   id: 'navy-1',
  //   stroke: '#1a5fb4',
  //   fill: 'rgba(26, 95, 180, 0.03)',
  //   delay: '2s',
  //   size: 95,
  //   top: '18%',
  //   left: '78%',
  //   rotate: 22,
  //   duration: '16s',
  // },
  // {
  //   id: 'gold-2',
  //   stroke: '#c9a94e',
  //   fill: 'rgba(201, 169, 78, 0.03)',
  //   delay: '4s',
  //   size: 110,
  //   top: '58%',
  //   left: '84%',
  //   rotate: 35,
  //   duration: '18s',
  // },
  {
    id: 'sage-1',
    stroke: '#2d6a4f',
    fill: 'rgba(45, 106, 79, 0.03)',
    delay: '1.5s',
    size: 90,
    top: '62%',
    left: '6%',
    rotate: -28,
    duration: '15s',
  },
];

function Leaf({ stroke, fill, size, top, left, rotate, delay, duration }) {
  return (
    <svg
      className="eco-leaf"
      style={{
        top,
        left,
        width: size,
        height: size,
        animationDelay: delay,
        animationDuration: duration,
        transform: `rotate(${rotate}deg)`,
      }}
      viewBox="0 0 100 140"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path
        d="M50 5 C10 20 0 60 10 100 C20 130 50 135 50 135 C50 135 80 130 90 100 C100 60 90 20 50 5Z"
        fill={fill}
        stroke={stroke}
        strokeWidth="1.2"
        strokeOpacity="0.35"
      />
      <path
        d="M50 5 Q50 70 50 135"
        stroke={stroke}
        strokeWidth="1"
        strokeOpacity="0.25"
        fill="none"
      />
      <path d="M50 30 Q38 48 28 58" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
      <path d="M50 45 Q62 58 72 65" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.2" fill="none" />
      <path d="M50 65 Q36 78 26 84" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.18" fill="none" />
      <path d="M50 75 Q64 85 74 90" stroke={stroke} strokeWidth="0.8" strokeOpacity="0.18" fill="none" />
    </svg>
  );
}

export default function FloatingLeaves() {
  return (
    <div className="eco-leaves" aria-hidden="true">
      {LEAVES.map((leaf) => (
        <Leaf key={leaf.id} {...leaf} />
      ))}
    </div>
  );
}
