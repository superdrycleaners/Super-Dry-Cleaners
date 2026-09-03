import { notFound } from 'next/navigation';
import { getContent } from '@/lib/data/content';
import Reveal from '@/components/site/Reveal';
import Link from 'next/link';

// Generate static params for all services in site-content.json
export async function generateStaticParams() {
  const content = await getContent();
  return content.services.map((s) => ({ slug: s.slug }));
}

// Dynamic metadata
export async function generateMetadata({ params }) {
  const content = await getContent();
  const service = content.services.find((s) => s.slug === params.slug);
  
  if (!service) return { title: 'Service Not Found' };
  
  return {
    title: `${service.title} Services in Leicester | Super Dry Cleaners`,
    description: service.body,
    openGraph: {
      title: `${service.title} Services in Leicester | Super Dry Cleaners`,
      description: service.body,
      url: `https://superdrycleaners.co.uk/services/${service.slug}`,
      siteName: 'Super Dry Cleaners',
      images: [
        {
          url: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
          width: 1200,
          height: 630,
          alt: `${service.title} - Super Dry Cleaners Leicester`,
        },
      ],
      locale: 'en_GB',
      type: 'website',
    },
  };
}

export default async function ServicePage({ params }) {
  const content = await getContent();
  const service = content.services.find((s) => s.slug === params.slug);

  if (!service) {
    notFound();
  }

  return (
    <main style={{ paddingTop: '8rem', paddingBottom: '5rem', background: 'var(--paper)', minHeight: '100vh' }}>
      <section className="section">
        <div className="container" style={{ maxWidth: '800px' }}>
          <Reveal as="header" className="section__head section__head--center">
            <h1 className="section__title" style={{ fontSize: '3rem', marginBottom: '1.5rem' }}>{service.title}</h1>
            <p className="section__intro" style={{ fontSize: '1.3rem', color: 'var(--ink)' }}>
              {service.body}
            </p>
          </Reveal>

          <Reveal className="service-details" style={{ background: '#fff', borderRadius: '16px', padding: '3rem', marginTop: '3rem', boxShadow: '0 10px 30px -10px rgba(10,31,68,0.1)' }}>
            <div style={{ display: 'grid', gap: '2rem' }}>
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--teal)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>What is Included</h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{service.includes}</p>
              </div>
              
              <div>
                <h3 style={{ fontSize: '1.2rem', color: 'var(--teal)', marginBottom: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Suitable For</h3>
                <p style={{ fontSize: '1.1rem', color: 'var(--ink)' }}>{service.suitableFor}</p>
              </div>

              <div style={{ display: 'flex', gap: '3rem', flexWrap: 'wrap', paddingTop: '1.5rem', borderTop: '1px solid var(--line)' }}>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--ink-soft)', marginBottom: '0.2rem' }}>Typical Turnaround</h3>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--ink)' }}>{service.turnaround}</p>
                </div>
                <div>
                  <h3 style={{ fontSize: '1rem', color: 'var(--ink-soft)', marginBottom: '0.2rem' }}>Starting Price</h3>
                  <p style={{ fontSize: '1.2rem', fontWeight: 600, color: 'var(--brass)' }}>{service.price}</p>
                </div>
              </div>
            </div>
            
            <div style={{ marginTop: '3rem', textAlign: 'center' }}>
              <Link href="/#book" className="btn btn--solid btn--large" style={{ width: '100%', justifyContent: 'center' }}>
                BOOK A COLLECTION
              </Link>
            </div>
          </Reveal>
          
          <Reveal as="div" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/" style={{ color: 'var(--teal)', fontWeight: 600, textDecoration: 'underline', textUnderlineOffset: '4px' }}>
              &larr; Back to all services
            </Link>
          </Reveal>
        </div>
      </section>
    </main>
  );
}
