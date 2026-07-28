import { listOrders, getOrderStats, STATUS_LABELS } from '@/lib/data/orders';
import OrdersTable from '@/components/admin/OrdersTable';
import Card from '@/components/admin/ui/Card';

export const metadata = { title: 'Dashboard — Super Dry Cleaners Admin' };

// Always render fresh so new orders and status changes show immediately.
export const dynamic = 'force-dynamic';

/** Status keys surfaced as summary cards on the dashboard. */
const SUMMARY_STATUSES = ['pending', 'confirmed', 'in_progress', 'ready'];

/**
 * Admin dashboard: high-level order stats plus the most recent requests.
 */
export default async function DashboardPage() {
  const [stats, recent] = await Promise.all([
    getOrderStats(),
    listOrders(),
  ]);

  return (
    <>
      <header className="admin__header">
        <h1>Dashboard</h1>
        <p>Overview of collection requests and their statuses.</p>
      </header>

      <div className="stats">
        <Card>
          <Card.Content>
            <div className="stat__value">{stats.total}</div>
            <div className="stat__label">Total orders</div>
          </Card.Content>
        </Card>
        {SUMMARY_STATUSES.map((status) => (
          <Card key={status}>
            <Card.Content>
              <div className="stat__value">{stats.byStatus[status]}</div>
              <div className="stat__label">{STATUS_LABELS[status]}</div>
            </Card.Content>
          </Card>
        ))}
      </div>

      <Card as="section" aria-labelledby="recent-heading">
        <Card.Header>
          <Card.Title as="h2" id="recent-heading">Recent requests</Card.Title>
        </Card.Header>
        <Card.Content>
          <OrdersTable orders={recent.slice(0, 8)} />
        </Card.Content>
      </Card>
    </>
  );
}
