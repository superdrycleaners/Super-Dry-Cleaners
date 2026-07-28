import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import LoginForm from '../components/admin/LoginForm';

const { useSearchParams, router } = vi.hoisted(() => ({
  useSearchParams: vi.fn(),
  router: {
    refresh: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('next/navigation', () => ({
  useRouter: () => router,
  useSearchParams,
}));

describe('admin login form', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    useSearchParams.mockReset();
    router.refresh.mockReset();
    router.replace.mockReset();
  });

  it('keeps accessible bounded fields and prevents duplicate submission while pending', async () => {
    let resolveLogin;
    useSearchParams.mockReturnValue(new URLSearchParams());
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveLogin = resolve;
          })
      )
    );

    render(<LoginForm />);
    const email = screen.getByLabelText('Email');
    const password = screen.getByLabelText('Password');
    const form = email.closest('form');

    expect(email.name).toBe('email');
    expect(email.autocomplete).toBe('username');
    expect(email.maxLength).toBe(254);
    expect(password.name).toBe('password');
    expect(password.autocomplete).toBe('current-password');
    expect(password.maxLength).toBe(256);

    fireEvent.change(email, { target: { value: 'admin@example.test' } });
    fireEvent.change(password, { target: { value: 'not-a-real-password' } });
    fireEvent.submit(form);
    fireEvent.submit(form);

    expect(fetch).toHaveBeenCalledTimes(1);
    expect(fetch).toHaveBeenCalledWith('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@example.test', password: 'not-a-real-password' }),
    });
    expect(screen.getByRole('button', { name: 'Signing in…' }).disabled).toBe(true);
    expect(screen.getByRole('button', { name: 'Signing in…' }).getAttribute('aria-busy')).toBe('true');

    await act(async () => {
      resolveLogin({ ok: false, json: async () => ({ error: 'Invalid email or password.' }) });
    });

    expect(screen.getByRole('alert').textContent).toContain('Invalid email or password.');
  });

  it('refreshes after login and only redirects within the admin route tree', async () => {
    useSearchParams.mockReturnValue(new URLSearchParams('from=%2Fadmin%2Forders'));
    vi.stubGlobal('fetch', vi.fn(async () => ({ ok: true, json: async () => ({ ok: true }) })));

    render(<LoginForm />);
    fireEvent.submit(screen.getByRole('button', { name: 'Sign in' }).closest('form'));

    await act(async () => {});

    expect(router.replace).toHaveBeenCalledWith('/admin/orders');
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
