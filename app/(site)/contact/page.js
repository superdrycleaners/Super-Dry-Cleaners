import { getContent } from '@/lib/data/content';
import Reveal from '@/components/site/Reveal';

export async function generateMetadata() {
  const content = await getContent();
  const { brand = {} } = content;
  return {
    title: `Contact Us | ${brand.name || 'SuperDryCleaners Leicester'}`,
    description: `Get in touch with ${brand.name || 'SuperDryCleaners'} in Leicester. ${brand.address || ''}. Call ${brand.phone || ''} or email ${brand.email || ''}.`,
  };
}

export default async function ContactPage() {
  const content = await getContent();
  const { brand = {} } = content;

  const phoneDisplay = brand.phone || '07849 533923';
  const phoneHref = brand.phoneHref || '+447849533923';
  const emailDisplay = brand.email || 'superdrycleaners31@gmail.com';
  const whatsappNumber = brand.whatsapp || '447849533923';
  const addressDisplay = brand.address || 'Unit 4, Pasture Lane, Leicester LE1 4EY';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DryCleaner',
    name: brand.name || 'SuperDryCleaners',
    image: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
    telephone: phoneDisplay,
    email: emailDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: addressDisplay,
      addressLocality: 'Leicester',
      addressCountry: 'GB',
    },
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        opens: '09:00',
        closes: '18:00',
      },
    ],
  };

  // Helper to split opening hours and closed day for tabular rendering if needed
  const openingHoursText = brand.openingHours || 'Monday – Friday: 9:00am – 6:00pm';
  const closedDayText = brand.closedDay || 'Saturday – Sunday: Closed';

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <main style={{ paddingTop: '8rem', paddingBottom: '5rem', background: 'var(--paper)', minHeight: '100vh' }}>
        <section className="section">
          <div className="container">
            <Reveal as="header" className="section__head section__head--center" style={{ marginBottom: '3.5rem' }}>
              <p className="eyebrow">Get in touch</p>
              <h1 className="section__title">Contact {brand.name || 'SuperDryCleaners'}</h1>
              <p className="section__intro">
                Have a question about our services or need help with a collection? We are here to help.
              </p>
            </Reveal>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                gap: '2rem',
                marginBottom: '4rem',
              }}
            >
              {/* Address Card */}
              <Reveal className="card" style={{ padding: '2rem', borderRadius: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📍</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ink)' }}>
                  Our Location
                </h2>
                <address style={{ fontStyle: 'normal', lineHeight: '1.6', color: 'var(--ink-soft)' }}>
                  <strong>{brand.name || 'SuperDryCleaners'}</strong><br />
                  {addressDisplay.split(',').map((line, idx) => (
                    <span key={idx}>
                      {line.trim()}
                      <br />
                    </span>
                  ))}
                </address>
                <div style={{ marginTop: '1.5rem' }}>
                  <a
                    href={`https://maps.google.com/?q=${encodeURIComponent(addressDisplay)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--teal)', fontWeight: '600', textDecoration: 'underline', textUnderlineOffset: '4px' }}
                  >
                    Get Directions →
                  </a>
                </div>
              </Reveal>

              {/* Phone & Email Card */}
              <Reveal className="card" style={{ padding: '2rem', borderRadius: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>📞</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ink)' }}>
                  Call & Email
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', color: 'var(--ink-soft)' }}>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--ink-light)', display: 'block' }}>Phone:</span>
                    <a
                      href={`tel:${phoneHref}`}
                      style={{ color: 'var(--ink)', fontWeight: '600', fontSize: '1.1rem', textDecoration: 'none' }}
                    >
                      {phoneDisplay}
                    </a>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.875rem', color: 'var(--ink-light)', display: 'block' }}>Email:</span>
                    <a
                      href={`mailto:${emailDisplay}`}
                      style={{ color: 'var(--teal)', fontWeight: '600', wordBreak: 'break-all' }}
                    >
                      {emailDisplay}
                    </a>
                  </div>
                  <div style={{ marginTop: '0.5rem' }}>
                    <a
                      href={`https://wa.me/${whatsappNumber}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn--whatsapp"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}
                    >
                      WhatsApp Us
                    </a>
                  </div>
                </div>
              </Reveal>

              {/* Opening Hours Card */}
              <Reveal className="card" style={{ padding: '2rem', borderRadius: '1rem', background: 'var(--surface)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>🕐</div>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '700', marginBottom: '0.75rem', color: 'var(--ink)' }}>
                  Opening Hours
                </h2>
                <div style={{ color: 'var(--ink-soft)', lineHeight: '1.8' }}>
                  <div style={{ padding: '0.5rem 0', borderBottom: '1px solid var(--border-light)', fontWeight: '600', color: 'var(--ink)' }}>
                    {openingHoursText}
                  </div>
                  <div style={{ padding: '0.5rem 0', color: '#c53030', fontWeight: '600' }}>
                    {closedDayText}
                  </div>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
