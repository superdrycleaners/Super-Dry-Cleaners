import { getContent } from '@/lib/data/content';
import Reveal from '@/components/site/Reveal';

export const metadata = {
  title: 'Contact Us | Super Dry Cleaners Leicester',
  description: 'Get in touch with Super Dry Cleaners in Leicester. Unit 4, Pasture Lane, LE1 4EY. Call 07849 533923 or email superdrycleaners31@gmail.com.',
};

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
    name: brand.name || 'Super Dry Cleaners',
    image: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
    telephone: phoneDisplay,
    email: emailDisplay,
    address: {
      '@type': 'PostalAddress',
      streetAddress: 'Unit 4, Pasture Lane',
      addressLocality: 'Leicester',
      postalCode: 'LE1 4EY',
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
              <h1 className="section__title">Contact Super Dry Cleaners</h1>
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
                  <strong>Super Dry Cleaners</strong><br />
                  Unit 4, Pasture Lane<br />
                  Leicester<br />
                  LE1 4EY
                </address>
                <div style={{ marginTop: '1.5rem' }}>
                  <a
                    href="https://maps.google.com/?q=Unit+4+Pasture+Lane+Leicester+LE1+4EY"
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
                <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--ink-soft)', lineHeight: '1.8' }}>
                  <tbody>
                    <tr style={{ borderBottom: '1px solid var(--border-light)' }}>
                      <td style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--ink)' }}>Monday – Friday</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right' }}>9:00am – 6:00pm</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.5rem 0', fontWeight: '600', color: 'var(--ink)' }}>Saturday – Sunday</td>
                      <td style={{ padding: '0.5rem 0', textAlign: 'right', color: '#c53030', fontWeight: '600' }}>Closed</td>
                    </tr>
                  </tbody>
                </table>
              </Reveal>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
