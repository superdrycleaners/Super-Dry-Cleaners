'use client';

import { motion } from 'framer-motion';
import AnimatedText from '@/components/site/AnimatedText';
import Reveal from '@/components/site/Reveal';

export default function HeroContent({ brand, home }) {
  return (
    <div className="container hero__inner" style={{ position: 'relative', zIndex: 10 }}>
      <motion.div
        animate={{ y: [0, -12, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        style={{ display: 'flex', justifyContent: 'center' }}
      >
        <Reveal delay={0.1}>
          <img
            src="/Frame 33.svg"
            alt={brand.name || 'Super Dry Cleaners'}
            className="hero__logo"
          />
        </Reveal>
      </motion.div>

      <AnimatedText text={home.title} as="h1" className="hero__title" delay={0.2} />
      
      <Reveal as="p" className="hero__lede" delay={0.6}>{home.lede}</Reveal>
      
      <Reveal className="hero__actions" delay={0.7}>
        <motion.a 
          href="#book" 
          className="btn btn--solid"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(26, 95, 180, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          {home.ctaBooking || 'Book Collection'}
        </motion.a>
        <motion.a 
          href="#pricing" 
          className="btn btn--ghost"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {home.ctaPricing || 'View Pricing'}
        </motion.a>
        <motion.a 
          href={`https://wa.me/${brand.whatsapp || '447889693265'}`} 
          className="btn btn--whatsapp" 
          target="_blank" 
          rel="noopener noreferrer"
          whileHover={{ scale: 1.05, boxShadow: "0 10px 25px -5px rgba(37, 211, 102, 0.4)" }}
          whileTap={{ scale: 0.95 }}
        >
          {home.ctaWhatsapp || 'WhatsApp Us'}
        </motion.a>
      </Reveal>

      <Reveal as="ul" className="hero__stats" delay={0.9}>
        {home.stats.map((stat, idx) => (
          <li key={stat.label || idx}>
            <strong>{stat.value}</strong>
            <span>{stat.label}</span>
          </li>
        ))}
      </Reveal>
    </div>
  );
}
