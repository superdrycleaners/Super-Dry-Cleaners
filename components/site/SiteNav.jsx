'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import PropTypes from 'prop-types';

/** Primary navigation links — all point to anchor sections on the single page. */
const LINKS = [
  { href: '/#home', label: 'Home' },
  { href: '/#services', label: 'Services' },
  { href: '/#pricing', label: 'Pricing' },
  { href: '/#about', label: 'About' },
];

/**
 * Fixed public site navigation bar.
 *
 * Uses the brand logo SVG. Adds a frosted background once the page is scrolled
 * and provides a mobile toggle menu. Includes WhatsApp + Book CTA buttons.
 */
const SiteNav = ({ whatsapp = '447889693265' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`nav${scrolled ? ' is-scrolled' : ''}${open ? ' is-open' : ''}`}>
      <div className="container nav__inner">
        <Link href="/" className="brand" aria-label="Super Dry Cleaners home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Frame 34.svg" alt="Super Dry Cleaners — Laundry Services Since 2005" className="brand__logo" />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="nav__actions">
          <a
            href={`https://wa.me/${whatsapp}`}
            className="btn btn--whatsapp"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Chat on WhatsApp"
          >
            WhatsApp
          </a>
          <a href="#book" className="btn btn--solid nav__cta">
            Book Collection
          </a>
        </div>

        <button
          type="button"
          className={`nav__toggle${open ? ' is-open' : ''}`}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
};

SiteNav.propTypes = {
  whatsapp: PropTypes.string,
};

export default SiteNav;
