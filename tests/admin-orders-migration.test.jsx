import React from 'react';
import PropTypes from 'prop-types';
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import OrdersTable from '../components/admin/OrdersTable';
import StatusPill from '../components/admin/StatusPill';

// Mock StatusSelect since it depends on server actions and client hooks.
vi.mock('../components/admin/StatusSelect', () => ({
  default: ({ id, status }) => (
    <select aria-label={`Change status for order ${id}`} defaultValue={status}>
      <option value={status}>{status}</option>
    </select>
  ),
}));

/**
 * Admin-scoped test wrapper matching the production data-admin-ui root.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Test content.
 */
const AdminFixture = ({ children }) => (
  <div data-admin-ui="true">{children}</div>
);

AdminFixture.propTypes = {
  children: PropTypes.node.isRequired,
};

/** Sample orders matching the repository's Order typedef, sorted newest-first. */
const SAMPLE_ORDERS = [
  {
    id: 'ORD-1042',
    name: 'Eleanor Hartley',
    email: 'eleanor.h@example.com',
    phone: '07700 900123',
    service: 'Dry cleaning',
    address1: '14 Cadogan Place',
    address2: 'Flat 3',
    city: 'Kensington',
    postcode: 'SW1X 9RX',
    notes: '',
    lat: 51.4975,
    lng: -0.1583,
    date: '2026-07-02',
    slot: '08:00–10:00',
    status: 'confirmed',
    createdAt: '2026-06-30T09:12:00.000Z',
  },
  {
    id: 'ORD-1041',
    name: 'James Okonkwo',
    email: 'j.okonkwo@example.com',
    phone: '07700 900456',
    service: 'Laundry & fold',
    address1: '8 Elgin Crescent',
    address2: '',
    city: 'Notting Hill',
    postcode: 'W11 2JA',
    notes: '',
    lat: 51.5121,
    lng: -0.2016,
    date: '2026-07-01',
    slot: '18:00–20:00',
    status: 'pending',
    createdAt: '2026-06-30T14:45:00.000Z',
  },
];

describe('OrdersTable migration', () => {
  it('renders a semantic table with caption inside a scrollable region', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    const table = screen.getByRole('table', { name: 'Collection requests' });
    expect(table).toBeTruthy();

    // Scrollable region wraps the table for narrow-viewport access.
    const region = screen.getByRole('region');
    expect(region.contains(table)).toBe(true);
    expect(region.getAttribute('tabindex')).toBe('0');
  });

  it('renders all expected column headers', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    const headers = screen.getAllByRole('columnheader');
    const labels = headers.map((h) => h.textContent);
    expect(labels).toEqual(['Order', 'Customer', 'Service', 'Pickup', 'Requested', 'Status', 'Invoice']);
  });

  it('renders customer name and phone as escaped text', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    // Customer values rendered as text, not HTML
    expect(screen.getByText('Eleanor Hartley')).toBeTruthy();
    expect(screen.getByText('07700 900123')).toBeTruthy();
    expect(screen.getByText('James Okonkwo')).toBeTruthy();
  });

  it('renders pickup city/postcode and date/slot as escaped text', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    expect(screen.getByText('Kensington, SW1X 9RX')).toBeTruthy();
    expect(screen.getByText('2026-07-02 · 08:00–10:00')).toBeTruthy();
  });

  it('formats createdAt date as day month year', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    // Both sample orders were created on 30 Jun 2026; verify the format appears.
    const dateCells = screen.getAllByText('30 Jun 2026');
    expect(dateCells.length).toBeGreaterThanOrEqual(1);
  });

  it('preserves newest-first row order', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    const rows = screen.getAllByRole('row');
    // First data row (index 1, after header row) should be the newest order.
    const firstDataRow = rows[1];
    expect(within(firstDataRow).getByText(/ORD-1042/)).toBeTruthy();
    const secondDataRow = rows[2];
    expect(within(secondDataRow).getByText(/ORD-1041/)).toBeTruthy();
  });

  it('renders the empty state when orders is empty', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={[]} />
      </AdminFixture>
    );

    expect(screen.getByText('No collection requests yet.')).toBeTruthy();
    expect(screen.queryByRole('table')).toBeNull();
  });

  it('includes an inline status select control for each order', () => {
    render(
      <AdminFixture>
        <OrdersTable orders={SAMPLE_ORDERS} />
      </AdminFixture>
    );

    expect(
      screen.getByRole('combobox', { name: 'Change status for order ORD-1042' })
    ).toBeTruthy();
    expect(
      screen.getByRole('combobox', { name: 'Change status for order ORD-1041' })
    ).toBeTruthy();
  });
});

describe('StatusPill migration', () => {
  it('renders Badge primitive with the correct status label', () => {
    render(
      <AdminFixture>
        <StatusPill status="confirmed" />
      </AdminFixture>
    );

    const badge = screen.getByText('Confirmed');
    expect(badge).toBeTruthy();
    expect(badge.classList.contains('admin-ui__badge')).toBe(true);
    expect(badge.classList.contains('admin-ui__badge--confirmed')).toBe(true);
  });

  it('renders all known status labels', () => {
    const statuses = [
      ['pending', 'Pending'],
      ['confirmed', 'Confirmed'],
      ['collected', 'Collected'],
      ['in_progress', 'In progress'],
      ['ready', 'Ready'],
      ['delivered', 'Delivered'],
      ['cancelled', 'Cancelled'],
    ];

    render(
      <AdminFixture>
        {statuses.map(([key]) => (
          <StatusPill key={key} status={key} />
        ))}
      </AdminFixture>
    );

    statuses.forEach(([, label]) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
  });

  it('provides a safe fallback for unexpected status values', () => {
    render(
      <AdminFixture>
        <StatusPill status="unknown_value" />
      </AdminFixture>
    );

    const badge = screen.getByText('Unknown status');
    expect(badge.classList.contains('admin-ui__badge--unknown')).toBe(true);
  });
});
