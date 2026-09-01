'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import PropTypes from 'prop-types';

/** Primary navigation links */
const LINKS = [
  { href: '/#home', label: 'Home', sectionId: 'home' },
  { href: '/eco', label: 'Eco', isPage: true },
  { href: '/#services', label: 'Services', sectionId: 'services' },
  { href: '/#pricing', label: 'Pricing', sectionId: 'pricing' },
  { href: '/#about', label: 'About', sectionId: 'about' },
];

/**
 * Fixed public site navigation bar.
 * Dynamically highlights the active route/section based on current pathname and scroll.
 */
const SiteNav = ({ whatsapp = '447889693265' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('home');
  const pathname = usePathname();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (pathname !== '/') return;

    const sections = ['home', 'services', 'pricing', 'about'];
    const handleScrollSpy = () => {
      const scrollPos = window.scrollY + 120;
      for (let i = sections.length - 1; i >= 0; i--) {
        const el = document.getElementById(sections[i]);
        if (el && el.offsetTop <= scrollPos) {
          setActiveSection(sections[i]);
          return;
        }
      }
      setActiveSection('home');
    };

    window.addEventListener('scroll', handleScrollSpy, { passive: true });
    handleScrollSpy();
    return () => window.removeEventListener('scroll', handleScrollSpy);
  }, [pathname]);

  const isLinkActive = (link) => {
    if (link.isPage) {
      return pathname === link.href;
    }
    if (pathname === '/') {
      return activeSection === link.sectionId;
    }
    return false;
  };

  return (
    <header className={`nav${scrolled ? ' ' : ''}${open ? ' is-open' : ''}`}>
      <div className="container nav__inner">
        <Link href="/" className="brand" aria-label="Super Dry Cleaners home">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/Frame 34.svg" alt="Super Dry Cleaners — Laundry Services Since 2005" className="brand__logo" />
        </Link>

        <nav className="nav__links" aria-label="Primary">
          {LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className={isLinkActive(link) ? 'is-current' : undefined}
            >
              {link.label}
            </Link>
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
          <a href="/#book" className="btn btn--solid nav__cta" onClick={() => setOpen(false)}>
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
