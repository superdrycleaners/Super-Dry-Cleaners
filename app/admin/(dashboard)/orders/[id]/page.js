import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getOrder, STATUS_LABELS } from '@/lib/data/orders';
import { getContentSection } from '@/lib/data/content';
import Card from '@/components/admin/ui/Card';
import Badge from '@/components/admin/ui/Badge';
import StatusSelect from '@/components/admin/StatusSelect';
import InvoiceEditor from '@/components/admin/InvoiceEditor';

export const dynamic = 'force-dynamic';

/**
 * Order detail page — view full order info, manage status, edit line items,
 * and download the invoice PDF. Combines order management and invoicing
 * into a single view.
 *
 * @param {object} props
 * @param {{ id: string }} props.params - Route params with order ID.
 */
export default async function OrderDetailPage({ params }) {
  const { id } = params;
  const order = await getOrder(id);

  if (!order) notFound();

  const catalogue = await getContentSection('catalogue') || [];

  return (
    <>
      <Link href="/admin/orders" className="cms__back">← Back to orders</Link>

      <header className="admin__header">
        <h1>Order {order.id}</h1>
        <p>
          <Badge status={order.status} /> — placed{' '}
          {new Date(order.createdAt).toLocaleDateString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
          })}
        </p>
      </header>

      {/* Status control */}
      <Card className="order-detail__status-card">
        <Card.Header>
          <Card.Title as="h2">Status</Card.Title>
        </Card.Header>
        <Card.Content>
          <StatusSelect id={order.id} status={order.status} />
        </Card.Content>
      </Card>

      {/* Invoice / line items */}
      <Card>
        <Card.Header>
          <Card.Title as="h2">Invoice & Line Items</Card.Title>
          <Card.Description>
            Add services from the catalogue, set quantities, and download the PDF when ready.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <InvoiceEditor order={order} catalogue={catalogue} />
        </Card.Content>
      </Card>
    </>
  );
}
