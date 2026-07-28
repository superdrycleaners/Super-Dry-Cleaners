import PropTypes from 'prop-types';
import { requireSession } from '@/lib/session';
import AdminNav from '@/components/admin/AdminNav';
import LogoutButton from '@/components/admin/LogoutButton';
import '../admin.css';
import '../admin-ui.css';

/**
 * Protected admin shell: sidebar navigation + main content area.
 *
 * `requireSession()` runs on the server for every admin page render and
 * redirects to the login page if the session is missing or invalid. This is
 * the authoritative auth check (middleware only does a cheap edge pre-check).
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Admin page content.
 * @returns {JSX.Element} The authenticated admin shell.
 */
export default function AdminLayout({ children }) {
  // Keep authorization in the server component before any protected markup is created.
  const session = requireSession();

  return (
    <div data-admin-ui="true" className="admin admin--topnav">
      <header className="admin__topbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src="/Frame 34.svg" alt="Super Dry Cleaners" className="admin__topbar-logo" />
        <div className="admin__topbar-right">
          <AdminNav />
          <span className="admin__user">{session.sub}</span>
          <LogoutButton />
        </div>
      </header>

      <div className="admin__main">{children}</div>
    </div>
  );
}

AdminLayout.propTypes = {
  children: PropTypes.node.isRequired,
};
