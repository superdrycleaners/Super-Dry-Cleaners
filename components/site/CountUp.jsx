'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Animated counter that counts from 0 to `target` when visible.
 *
 * @param {object} props
 * @param {number} props.target - The final number to count to.
 * @param {string} [props.suffix=''] - Text appended after the number (e.g. '%', '+').
 * @param {number} [props.duration=1800] - Animation duration in ms.
 */
export default function CountUp({ target, suffix = '', duration = 1800 }) {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  const startedRef = useRef(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !startedRef.current) {
            startedRef.current = true;
            const start = performance.now();
            const step = (now) => {
              const progress = Math.min((now - start) / duration, 1);
              const eased = 1 - Math.pow(1 - progress, 3);
              setValue(Math.round(eased * target));
              if (progress < 1) requestAnimationFrame(step);
            };
            requestAnimationFrame(step);
            observer.unobserve(node);
          }
        });
      },
      { threshold: 0.5 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [target, duration]);

  return (
    <span ref={ref}>
      {value}
      {suffix}
    </span>
  );
}
