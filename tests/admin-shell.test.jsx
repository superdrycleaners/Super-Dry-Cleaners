import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import AdminNav from '../components/admin/AdminNav';
import LogoutButton from '../components/admin/LogoutButton';

const { usePathname, router } = vi.hoisted(() => ({
  usePathname: vi.fn(),
  router: {
    refresh: vi.fn(),
    replace: vi.fn(),
  },
}));

vi.mock('next/link', () => ({
  default: ({ children, ...props }) => <a {...props}>{children}</a>,
}));

vi.mock('next/navigation', () => ({
  usePathname,
  useRouter: () => router,
}));

describe('admin shell navigation and logout', () => {
  afterEach(() => {
    vi.restoreAllMocks();
    usePathname.mockReset();
    router.refresh.mockReset();
    router.replace.mockReset();
  });

  it('preserves navigation order and only activates matching route segments', () => {
    usePathname.mockReturnValue('/admin/orders/archive');

    render(<AdminNav />);

    const links = screen.getAllByRole('link');
    expect(links.map((link) => link.getAttribute('href'))).toEqual([
      '/admin',
      '/admin/orders',
      '/admin/content',
    ]);
    expect(links[0].getAttribute('aria-current')).toBeNull();
    expect(links[1].getAttribute('aria-current')).toBe('page');
    expect(links[2].getAttribute('aria-current')).toBeNull();
    expect(links[1].classList.contains('admin-ui__nav-link')).toBe(true);
    expect(links[1].classList.contains('is-active')).toBe(true);
  });

  it('prevents duplicate logout requests while the API call is pending', async () => {
    let resolveLogout;
    vi.stubGlobal(
      'fetch',
      vi.fn(
        () =>
          new Promise((resolve) => {
            resolveLogout = resolve;
          })
      )
    );

    render(<LogoutButton />);
    const button = screen.getByRole('button', { name: 'Sign out' });
    fireEvent.click(button);
    fireEvent.click(button);

    expect(fetch).toHaveBeenCalledTimes(1);
    const pendingButton = screen.getByRole('button', { name: 'Signing out…' });
    expect(pendingButton.disabled).toBe(true);
    expect(button.getAttribute('aria-busy')).toBe('true');

    await act(async () => {
      resolveLogout({ ok: true });
    });

    expect(fetch).toHaveBeenCalledWith('/api/admin/logout', { method: 'POST' });
    expect(router.replace).toHaveBeenCalledWith('/admin/login');
    expect(router.refresh).toHaveBeenCalledTimes(1);
  });
});
