'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import { useKeenSlider } from 'keen-slider/react';
import 'keen-slider/keen-slider.min.css';

/**
 * Testimonials carousel section with autoplay and navigation dots.
 *
 * Uses keen-slider for a smooth, accessible sliding experience.
 * Supports multiple testimonials managed through the CMS.
 *
 * @param {object} props
 * @param {Array<{quote: string, author: string, location: string}>} props.testimonials - Array of testimonial objects.
 */
const Testimonial = ({ testimonials }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const [sliderRef, instanceRef] = useKeenSlider(
    {
      initial: 0,
      loop: true,
      slideChanged(slider) {
        setCurrentSlide(slider.track.details.rel);
      },
    },
    [
      // Autoplay plugin
      (slider) => {
        let timeout;
        let mouseOver = false;

        function clearNextTimeout() {
          clearTimeout(timeout);
        }

        function nextTimeout() {
          clearTimeout(timeout);
          if (mouseOver) return;
          timeout = setTimeout(() => {
            slider.next();
          }, 10000);
        }

        slider.on('created', () => nextTimeout());
        slider.on('dragStarted', clearNextTimeout);
        slider.on('animationEnded', nextTimeout);
        slider.on('updated', nextTimeout);

        slider.container.addEventListener('mouseover', () => {
          mouseOver = true;
          clearNextTimeout();
        });
        slider.container.addEventListener('mouseout', () => {
          mouseOver = false;
          nextTimeout();
        });
      },
    ]
  );

  if (!testimonials || testimonials.length === 0) return null;

  return (
    <section className="testimonials-section">
      <div className="container">
        <div className="testimonials__header">
          <p className="eyebrow">What Our Customers Say</p>
          <h2 className="section__title">Trusted by Leicester</h2>
        </div>

        <div ref={sliderRef} className="keen-slider testimonials__slider">
          {testimonials.map((t, idx) => (
            <div key={idx} className="keen-slider__slide testimonials__slide">
              <blockquote className="testimonials__quote">
                <svg className="testimonials__icon" width="48" height="48" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M6 17h3l2-4V7H5v6h3l-2 4zm8 0h3l2-4V7h-6v6h3l-2 4z" />
                </svg>
                <p className="testimonials__text">&ldquo;{t.quote}&rdquo;</p>
                <footer className="testimonials__author">
                  <strong>{t.author}</strong>
                  <span>{t.location}</span>
                </footer>
              </blockquote>
            </div>
          ))}
        </div>

        {/* Navigation dots and arrows */}
        {testimonials.length > 1 && (
          <div className="testimonials__nav">
            <button
              type="button"
              className="testimonials__arrow testimonials__arrow--left"
              onClick={() => instanceRef.current?.prev()}
              aria-label="Previous testimonial"
            >
              ‹
            </button>
            <div className="testimonials__dots">
              {testimonials.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`testimonials__dot${currentSlide === idx ? ' is-active' : ''}`}
                  onClick={() => instanceRef.current?.moveToIdx(idx)}
                  aria-label={`Go to testimonial ${idx + 1}`}
                />
              ))}
            </div>
            <button
              type="button"
              className="testimonials__arrow testimonials__arrow--right"
              onClick={() => instanceRef.current?.next()}
              aria-label="Next testimonial"
            >
              ›
            </button>
          </div>
        )}

        {/* <div style={{ textAlign: 'center', marginTop: '3rem' }}>
          <a href="#reviews" className="btn btn--ghost">READ MORE REVIEWS</a>
        </div> */}
      </div>
    </section>
  );
};

Testimonial.propTypes = {
  testimonials: PropTypes.arrayOf(
    PropTypes.shape({
      quote: PropTypes.string.isRequired,
      author: PropTypes.string.isRequired,
      location: PropTypes.string.isRequired,
    })
  ).isRequired,
};

export default Testimonial;
