'use client';

import { useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useRouter } from 'next/navigation';
import Button from '@/components/admin/ui/Button';

/**
 * Signs the admin out by clearing the session cookie via the logout API,
 * then redirects to the login page.
 *
 * The browser never reads or stores the session token; the API owns the
 * httpOnly cookie lifecycle. A ref closes the small event-loop gap before the
 * pending state is committed, preventing duplicate logout requests.
 *
 * @returns {JSX.Element} The pending-aware logout button.
 */
const LogoutButton = () => {
  const router = useRouter();
  const logoutInFlight = useRef(false);
  const [pending, setPending] = useState(false);

  const handleLogout = async () => {
    if (logoutInFlight.current) return;

    logoutInFlight.current = true;
    setPending(true);

    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.replace('/admin/login');
      router.refresh();
    } finally {
      logoutInFlight.current = false;
      setPending(false);
    }
  };

  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      className="admin__logout"
      pending={pending}
      onClick={handleLogout}
    >
      {pending ? 'Signing out…' : 'Sign out'}
    </Button>
  );
};

LogoutButton.propTypes = {};

export default LogoutButton;
