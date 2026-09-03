import SiteNav from '@/components/site/SiteNav';
import TopBar from '@/components/site/TopBar';
import SiteFooter from '@/components/site/SiteFooter';
import ScrollToTop from '@/components/site/ScrollToTop';
import { getContentSection } from '@/lib/data/content';

/**
 * Layout for the public marketing site: top bar, shared nav and footer.
 * Brand contact details for the footer come from the CMS content layer.
 *
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Page content.
 */
export default async function SiteLayout({ children }) {
  const brand = await getContentSection('brand');

  return (
    <>
      <TopBar brand={brand} />
      <SiteNav whatsapp={brand.whatsapp} />
      <main>{children}</main>
      <SiteFooter brand={brand} />
      <ScrollToTop />
    </>
  );
}
