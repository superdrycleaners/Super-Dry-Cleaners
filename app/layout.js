import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  variable: '--font-manrope',
  display: 'swap',
});

/**
 * Root layout: loads fonts and sets site metadata.
 * Applies to every route, including the admin area.
 */
export const metadata = {
  title: 'SuperDryCleaners: Professional Dry Cleaning & Laundry Services Leicester',
  description:
    'Professional dry cleaning, laundry, ironing and specialist cleaning services in Leicester. Convenient collection and delivery for homes and businesses.',
  openGraph: {
    title: 'SuperDryCleaners: Professional Dry Cleaning & Laundry Services Leicester',
    description: 'Professional dry cleaning, laundry, ironing and specialist cleaning services in Leicester. Convenient collection and delivery for homes and businesses.',
    url: 'https://superdrycleaners.co.uk',
    siteName: 'SuperDryCleaners',
    images: [
      {
        url: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
        width: 1200,
        height: 630,
        alt: 'SuperDryCleaners Leicester',
      },
    ],
    locale: 'en_GB',
    type: 'website',
  },
  icons: {
    icon: '/Frame 33.svg',
  },
};

/**
 * @param {object} props
 * @param {import('react').ReactNode} props.children - Route content.
 */
export default function RootLayout({ children }) {
  const jsonLdGraph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://superdrycleaners.co.uk/#website',
        url: 'https://superdrycleaners.co.uk',
        name: 'SuperDryCleaners',
        alternateName: ['SuperDryCleaners Leicester', 'SuperDryCleaners UK'],
        publisher: {
          '@id': 'https://superdrycleaners.co.uk/#organization',
        },
      },
      {
        '@type': 'DryCleaningOrLaundry',
        '@id': 'https://superdrycleaners.co.uk/#organization',
        name: 'SuperDryCleaners',
        legalName: 'SuperDryCleaners',
        url: 'https://superdrycleaners.co.uk',
        image: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
        telephone: '+447849533923',
        address: {
          '@type': 'PostalAddress',
          streetAddress: 'Unit 4, Pasture Lane',
          addressLocality: 'Leicester',
          postalCode: 'LE1 4EY',
          addressCountry: 'GB',
        },
        geo: {
          '@type': 'GeoCoordinates',
          latitude: 52.6369,
          longitude: -1.1398,
        },
        openingHoursSpecification: [
          {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
            opens: '09:00',
            closes: '18:00',
          },
        ],
        priceRange: '££',
      },
    ],
  };

  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(jsonLdGraph),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
