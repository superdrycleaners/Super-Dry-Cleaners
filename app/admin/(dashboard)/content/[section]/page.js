import { notFound } from 'next/navigation';
import Link from 'next/link';
import { getContentSection, listContentSections } from '@/lib/data/content';
import Card from '@/components/admin/ui/Card';
import ContentFormEditor from '@/components/admin/ContentFormEditor';

export const dynamic = 'force-dynamic';

/**
 * Per-section CMS editor page.
 *
 * Loads the requested content section and hands it to the client editor. An
 * unknown section 404s rather than exposing anything unexpected.
 *
 * @param {object} props
 * @param {{ section: string }} props.params - Route params with the section key.
 */
export default async function EditContentPage({ params }) {
  const { section } = params;

  const known = await listContentSections();
  if (!known.includes(section)) notFound();

  const value = await getContentSection(section);

  return (
    <>
      <Link href="/admin/content" className="cms__back">← Back to content</Link>

      <Card>
        <Card.Header>
          <Card.Title as="h1" style={{ textTransform: 'capitalize' }}>
            {section}
          </Card.Title>
          <Card.Description>
            Edit this section&apos;s content. Fields are stored as structured data.
          </Card.Description>
        </Card.Header>
        <Card.Content>
          <ContentFormEditor section={section} value={value} />
        </Card.Content>
      </Card>
    </>
  );
}
