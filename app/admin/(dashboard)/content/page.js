import { getContent } from '@/lib/data/content';
import VisualPageEditor from '@/components/admin/VisualPageEditor';

export const metadata = { title: 'Content (CMS) — Super Dry Cleaners Admin' };

export const dynamic = 'force-dynamic';

/**
 * CMS page: visual page editor that mirrors the public site layout.
 *
 * Shows all editable sections in the same order they appear on the live
 * website. Each section is a collapsible card with user-friendly form fields.
 * Non-technical users can edit content without ever seeing JSON.
 */
export default async function ContentPage() {
  const content = await getContent();

  return (
    <>
      <header className="admin__header">
        <h1>Edit Website Content</h1>
        <p>
          Each section below matches your live website — top to bottom.
          Click a section to expand it, make your changes, and hit Save.
        </p>
      </header>
      <VisualPageEditor content={content} />
    </>
  );
}
