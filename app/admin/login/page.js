import { Suspense } from 'react';

import LoginForm from '@/components/admin/LoginForm';
import Card from '@/components/admin/ui/Card';
import '../admin.css';
import '../admin-ui.css';

export const metadata = {
  title: 'Admin sign in — Super Dry Cleaners',
};

/**
 * Admin login page. Rendered outside the protected admin shell so it is
 * reachable without a session (middleware allows this route through).
 *
 * The page owns its admin stylesheet boundary; the client form is isolated in
 * Suspense because Next.js statically analyzes its useSearchParams hook.
 *
 * @returns {JSX.Element} The unauthenticated admin login surface.
 */
export default function AdminLoginPage() {
  return (
    <div data-admin-ui="true" className="login">
      <Card as="section" className="login__card" aria-labelledby="admin-login-title">
        <Card.Header className="login__header">
          <div className="login__brand">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/Frame 34.svg" alt="Super Dry Cleaners — Laundry Services Since 2005" className="login__brand-logo" />
          </div>
          <Card.Title as="h1" id="admin-login-title">
            Admin sign in
          </Card.Title>
          <Card.Description className="login__sub">
            Manage orders and site content.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <Suspense fallback={null}>
            <LoginForm />
          </Suspense>
        </Card.Content>
      </Card>
    </div>
  );
}
