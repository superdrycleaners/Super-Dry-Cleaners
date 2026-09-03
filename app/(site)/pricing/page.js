import { getContent } from '@/lib/data/content';
import Reveal from '@/components/site/Reveal';
import Catalogue from '@/components/site/Catalogue';

export const metadata = {
  title: 'Pricing & Catalogue | Super Dry Cleaners',
  description: 'Transparent, itemised pricing for all our dry cleaning and laundry services in Leicester.',
};

export default async function PricingPage() {
  const content = await getContent();
  const { catalogue, home } = content;

  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '4rem', background: 'var(--paper)', minHeight: '100vh' }}>
      <section className="section">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center" style={{ marginBottom: '4rem' }}>
            <p className="eyebrow">{home.pricingEyebrow || 'Pricing'}</p>
            <h1 className="section__title">{home.pricingTitle || 'Every item, every price.'}</h1>
            <p className="section__intro">
              {home.pricingIntro || 'Transparent, itemised pricing. Free collection & delivery on orders over £25.'}
            </p>
          </Reveal>
          
          {/* We pass the ENTIRE catalogue here, which includes the styled 'offers' group */}
          <Catalogue groups={catalogue} />
          
          <Reveal as="p" className="cat__foot" style={{ marginTop: '5rem', textAlign: 'center', fontSize: '1.1rem', color: 'var(--ink-soft)' }}>
            {home.pricingFooter || 'Need something not listed?'} <a href="/#book" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>Ask us for a quote →</a>
          </Reveal>
          
          <Reveal as="div" style={{ marginTop: '3rem', textAlign: 'center' }}>
            <a href="/#book" className="btn btn--solid btn--large">
              BOOK A COLLECTION
            </a>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
