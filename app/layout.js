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
  title: 'Dry Cleaning & Laundry Services Leicester | Super Dry Cleaners',
  description:
    'Professional dry cleaning, laundry, ironing and specialist cleaning services in Leicester. Convenient collection and delivery for homes and businesses.',
  openGraph: {
    title: 'Dry Cleaning & Laundry Services Leicester | Super Dry Cleaners',
    description: 'Professional dry cleaning, laundry, ironing and specialist cleaning services in Leicester. Convenient collection and delivery for homes and businesses.',
    url: 'https://superdrycleaners.co.uk',
    siteName: 'Super Dry Cleaners',
    images: [
      {
        url: 'https://superdrycleaners.co.uk/hero-image-sd.jpeg',
        width: 1200,
        height: 630,
        alt: 'Super Dry Cleaners Leicester',
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
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "DryCleaningOrLaundry",
              name: "Super Dry Cleaners",
              image: "https://superdrycleaners.co.uk/hero-image-sd.jpeg",
              "@id": "https://superdrycleaners.co.uk",
              url: "https://superdrycleaners.co.uk",
              telephone: "+447889693265",
              address: {
                "@type": "PostalAddress",
                streetAddress: "Leicester City Centre",
                addressLocality: "Leicester",
                addressCountry: "UK"
              },
              geo: {
                "@type": "GeoCoordinates",
                latitude: 52.6369,
                longitude: -1.1398
              },
              openingHoursSpecification: {
                "@type": "OpeningHoursSpecification",
                dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
                opens: "09:00",
                closes: "18:00"
              },
              priceRange: "££"
            })
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
