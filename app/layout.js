import './globals.css';

/**
 * Root layout: loads fonts and Leaflet's stylesheet, and sets site metadata.
 * Applies to every route, including the admin area.
 */
export const metadata = {
  title: 'Super Dry Cleaners — Premium Laundry & Dry Cleaning, Leicester',
  description:
    "Leicester's premium dry cleaning and laundry service since 2005. Free collection & delivery on orders over £25.",
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
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400&family=Manrope:wght@300;400;500;600&display=swap"
          rel="stylesheet"
        />
        {/* Leaflet marker/control styles for the booking map */}
        <link
          rel="stylesheet"
          href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
          integrity="sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY="
          crossOrigin="anonymous"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
