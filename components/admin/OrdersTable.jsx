'use client';

import PropTypes from 'prop-types';
import Link from 'next/link';
import Table from './ui/Table';
import StatusSelect from './StatusSelect';

/**
 * Format an ISO timestamp as a short, readable date.
 *
 * @param {string} iso - ISO 8601 timestamp.
 * @returns {string} A localized date like "30 Jun 2026".
 */
function formatDate(iso) {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Table of orders / collection requests with an inline status control.
 *
 * Uses semantic Table primitives with an accessible caption and a focusable
 * scroll region for narrow viewports. Customer and pickup values are rendered
 * as escaped React text — no dangerouslySetInnerHTML or unsanitized output.
 *
 * @param {object} props
 * @param {Array<object>} props.orders - Orders to display (already sorted newest-first).
 */
const OrdersTable = ({ orders }) => {
  if (orders.length === 0) {
    return <p className="cms__intro">No collection requests yet.</p>;
  }

  return (
    <Table caption="Collection requests" className="orders">
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Order</Table.HeaderCell>
          <Table.HeaderCell>Customer</Table.HeaderCell>
          <Table.HeaderCell>Service</Table.HeaderCell>
          <Table.HeaderCell>Pickup</Table.HeaderCell>
          <Table.HeaderCell>Requested</Table.HeaderCell>
          <Table.HeaderCell>Status</Table.HeaderCell>
          <Table.HeaderCell>Invoice</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {orders.map((order) => (
          <Table.Row key={order.id} className={order.status === 'pending' ? 'orders__row--new' : ''}>
            <Table.Cell className="orders__id">
              <Link href={`/admin/orders/${order.id}`} title="View & edit order">✏️ {order.id}</Link>
            </Table.Cell>
            <Table.Cell>
              {order.name}
              <div className="muted">{order.phone}</div>
            </Table.Cell>
            <Table.Cell>{order.service}</Table.Cell>
            <Table.Cell>
              {order.city}, {order.postcode}
              <div className="muted">{order.date} · {order.slot}</div>
            </Table.Cell>
            <Table.Cell className="muted">{formatDate(order.createdAt)}</Table.Cell>
            <Table.Cell>
              <StatusSelect id={order.id} status={order.status} />
            </Table.Cell>
            <Table.Cell>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
                <a
                  href={`/api/admin/invoice/${order.id}`}
                  className="admin-ui__button admin-ui__button--ghost admin-ui__button--sm"
                  download
                  title="Download PDF"
                >
                  📄 PDF
                </a>
                <button
                  type="button"
                  className="admin-ui__button admin-ui__button--ghost admin-ui__button--sm"
                  title="Send invoice to customer"
                  onClick={() => {
                    fetch(`/api/admin/invoice/${order.id}/send`, { method: 'POST' });
                  }}
                >
                  ✉️ Email
                </button>
              </div>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

OrdersTable.propTypes = {
  orders: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default OrdersTable;
