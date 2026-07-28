import Link from 'next/link';
import { listOrders } from '@/lib/data/orders';
import OrdersTable from '@/components/admin/OrdersTable';
import Card from '@/components/admin/ui/Card';

export const metadata = { title: 'Orders — Super Dry Cleaners Admin' };

// Always render fresh so status changes are reflected on reload.
export const dynamic = 'force-dynamic';

/**
 * Orders page: the full list of collection requests with inline status control.
 */
export default async function OrdersPage() {
  const orders = await listOrders();

  return (
    <>
      <header className="admin__header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1>Orders</h1>
          <p>All collection requests. Update a status inline or click to edit the invoice.</p>
        </div>
        <Link href="/admin/orders/new" className="admin-ui__button admin-ui__button--primary admin-ui__button--md">
          + New Order
        </Link>
      </header>

      <Card as="section" aria-labelledby="orders-heading">
        <Card.Header>
          <Card.Title as="h2" id="orders-heading">
            {orders.length} request{orders.length === 1 ? '' : 's'}
          </Card.Title>
        </Card.Header>
        <Card.Content>
          <OrdersTable orders={orders} />
        </Card.Content>
      </Card>
    </>
  );
}
