'use client';

import PropTypes from 'prop-types';
import { useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import Button from './ui/Button';
import Input from './ui/Input';

/**
 * Admin login form.
 *
 * Posts credentials to /api/admin/login, which sets an httpOnly session cookie
 * on success. On success it navigates to the originally requested admin page
 * or the dashboard. The password remains only in this browser form state and
 * is never persisted, rendered, logged, or included in an error message.
 *
 * @returns {JSX.Element} An accessible credential form.
 */
const LoginForm = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const requestInFlight = useRef(false);

  /**
   * Submit credentials and handle the auth response.
   *
   * The endpoint remains the server-authoritative decision-maker; this client
   * only sends the form values and reacts to its generic response.
   *
   * @param {import('react').FormEvent<HTMLFormElement>} e - Form submit event.
   * @returns {Promise<void>} Resolves after the request and UI state settle.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (requestInFlight.current) return;

    requestInFlight.current = true;
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/admin/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Sign in failed.');
        return;
      }
      // Restrict the return target to the admin route tree to avoid open redirects.
      const from = searchParams.get('from');
      const isAllowedAdminPath = from === '/admin' || from?.startsWith('/admin/');
      const dest = isAllowedAdminPath ? from : '/admin';
      router.replace(dest);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      requestInFlight.current = false;
      setLoading(false);
    }
  };

  return (
    <form className="login__form" onSubmit={handleSubmit} noValidate>
      {error && <p className="login__error admin-ui__alert" role="alert">{error}</p>}
      <div className="admin-ui__field">
        <label className="admin-ui__field-label" htmlFor="email">
          Email
        </label>
        <Input
          type="email"
          id="email"
          name="email"
          autoComplete="username"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          maxLength={254}
          disabled={loading}
        />
      </div>
      <div className="admin-ui__field">
        <label className="admin-ui__field-label" htmlFor="password">
          Password
        </label>
        <Input
          type="password"
          id="password"
          name="password"
          autoComplete="current-password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          maxLength={256}
          disabled={loading}
        />
      </div>
      <Button type="submit" className="login__submit" pending={loading}>
        {loading ? 'Signing in…' : 'Sign in'}
      </Button>
    </form>
  );
};

LoginForm.propTypes = {};

export default LoginForm;
