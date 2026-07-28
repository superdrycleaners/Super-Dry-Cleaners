import Link from 'next/link';
import { getContentSection } from '@/lib/data/content';
import Card from '@/components/admin/ui/Card';
import CreateOrderForm from '@/components/admin/CreateOrderForm';

export const metadata = { title: 'New Order — Super Dry Cleaners Admin' };
export const dynamic = 'force-dynamic';

/**
 * Create a new order manually from the admin dashboard.
 * Loads the catalogue for the line-item dropdown.
 */
export default async function NewOrderPage() {
  const catalogue = await getContentSection('catalogue') || [];

  return (
    <>
      <Link href="/admin/orders" className="cms__back">← Back to orders</Link>

      <Card>
        <Card.Header>
          <Card.Title as="h1">Create New Order</Card.Title>
          <Card.Description>
            Manually create an order with customer details and line items.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <CreateOrderForm catalogue={catalogue} />
        </Card.Content>
      </Card>
    </>
  );
}
