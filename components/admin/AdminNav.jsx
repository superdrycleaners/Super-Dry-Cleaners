'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

/** Admin sidebar navigation links; order and paths are part of the admin UX contract. */
const LINKS = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/orders', label: 'Orders' },
  { href: '/admin/content', label: 'Content (CMS)' },
];

/**
 * Sidebar navigation for the admin area, highlighting the active section.
 *
 * Native Next links keep the links keyboard-reachable and preserve route
 * semantics while the scoped classes provide responsive wrapping and focus.
 *
 * @returns {JSX.Element} The admin navigation landmark.
 */
const AdminNav = () => {
  const pathname = usePathname() || '';

  return (
    <nav className="admin__nav admin-ui__nav" aria-label="Admin">
      {LINKS.map((link) => {
        // A segment boundary prevents /admin/orders-archive from activating Orders.
        const active =
          link.href === '/admin'
            ? pathname === '/admin'
            : pathname === link.href || pathname.startsWith(`${link.href}/`);
        return (
          <Link
            key={link.href}
            href={link.href}
            className={`admin-ui__nav-link${active ? ' is-active' : ''}`}
            aria-current={active ? 'page' : undefined}
          >
            {link.label}
          </Link>
        );
      })}
    </nav>
  );
};

AdminNav.propTypes = {};

export default AdminNav;
