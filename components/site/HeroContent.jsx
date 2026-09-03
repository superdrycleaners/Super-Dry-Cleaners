'use client';

import { motion } from 'framer-motion';
import Image from 'next/image';
import AnimatedText from '@/components/site/AnimatedText';
import Reveal from '@/components/site/Reveal';

export default function HeroContent({ brand, home }) {
  const renderTitle = (title) => {
    if (!title) return null;
    const words = title.split(' ');
    return words.map((word, i) => {
      // Highlight the second word with a pill, matching reference style
      if (i === 1) {
        return <span key={i} className="title-pill">{word} </span>;
      }
      return <span key={i}>{word} </span>;
    });
  };

  return (
    <div className="hero__content-wrapper">
      <div className="hero__image-wrapper">
        <Image
          src="/hero-image-sd.jpeg"
          alt={brand?.name || 'Super Dry Cleaners'}
          className="hero__image"
          fill
          style={{ objectFit: 'cover' }}
          priority
        />
        <div className="hero__loved-badge">
          TRUSTED BY CUSTOMERS ACROSS LEICESTER
        </div>
      </div>

      <div className="container" style={{ position: 'relative', zIndex: 10 }}>
        <div className="hero__inner">
          <Reveal delay={0.1}>
            <p className="eyebrow" style={{ color: 'var(--ink-soft)' }}>
              {home.eyebrow || 'WELCOME'}
            </p>
          </Reveal>

          <AnimatedText
            as="h1"
            className="hero__title"
            delay={0.2}
            text={<>{renderTitle(home.title)}</>}
          />

          <Reveal as="p" className="hero__lede" delay={0.6}>{home.lede}</Reveal>

          <Reveal className="hero__actions" delay={0.7}>
            <a href="#book" className="btn btn--solid">
              {home.ctaBooking || 'Book Collection'}
            </a>
            <a href="/pricing" className="btn btn--ghost">
              {home.ctaPricing || 'View Pricing'}
            </a>
            <a href={`https://wa.me/${brand?.whatsapp || '447889693265'}`} className="btn btn--whatsapp" target="_blank" rel="noopener noreferrer">
              CALL US / WHATSAPP US
            </a>
          </Reveal>

          {home.stats && (
            <Reveal as="ul" className="hero__stats" delay={0.9}>
              {home.stats.map((stat, idx) => (
                <li key={stat.label || idx}>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </li>
              ))}
            </Reveal>
          )}
        </div>
      </div>
    </div>
  );
}
