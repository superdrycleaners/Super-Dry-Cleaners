import Link from 'next/link';
import dynamic from 'next/dynamic';
import { getContent, getContentSection } from '@/lib/data/content';
import Reveal from '@/components/site/Reveal';
import Marquee from '@/components/site/Marquee';
import Steps from '@/components/site/Steps';
import SpecialOffers from '@/components/site/SpecialOffers';
import HeroContent from '@/components/site/HeroContent';
import FloatingLeaves from '@/components/site/FloatingLeaves';

const OurProcess = dynamic(() => import('@/components/site/OurProcess'));
const ServiceCards = dynamic(() => import('@/components/site/ServiceCards'));
const WhyChooseUs = dynamic(() => import('@/components/site/WhyChooseUs'));
const Testimonial = dynamic(() => import('@/components/site/Testimonial'), { ssr: false });
const AreasServed = dynamic(() => import('@/components/site/AreasServed'));
const BookingForm = dynamic(() => import('@/components/site/BookingForm'), { ssr: false });

/**
 * Single-page layout: all content on one scrolling page with anchor sections.
 * Sections: Hero, Offers, Process, Services, Pricing, Why Us, About,
 * Testimonial, Areas, Book.
 */
export default async function HomePage() {
  const content = await getContent();
  const { home, steps, services, catalogue, about, testimonials } = content;
  const brand = await getContentSection('brand');

  // Extract offers from the catalogue groups
  const offersGroup = catalogue.find((g) => g.id === 'offers');
  const pricingGroups = catalogue.filter((g) => g.id !== 'offers');

  return (
    <>
      {/* Hero */}
      <section className="hero" id="home" style={{ position: 'relative', overflow: 'hidden' }}>
        <FloatingLeaves />
        <HeroContent brand={brand} home={home} />
        <Marquee />
      </section>

      {/* Special Offers — prominent, right after hero */}
      {offersGroup && <SpecialOffers offers={offersGroup.items} />}

      {/* How it works */}
      <section className="section" id="process">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">{home.processEyebrow || 'How it works'}</p>
            <h2 className="section__title">{home.processTitle || 'Laundry made effortless.'}</h2>
            <p className="section__intro">
              {home.processIntro || 'Four simple steps. No queues, no carrying — just clean clothes returned to your door.'}
            </p>
          </Reveal>
          <Steps steps={steps} />
        </div>
      </section>

      {/* Our Eco-Friendly Process */}
      <OurProcess />

      {/* Services */}
      <section className="section" id="services">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">{home.servicesEyebrow || 'Our services'}</p>
            <h2 className="section__title">{home.servicesTitle || 'Everything your wardrobe needs.'}</h2>
            <p className="section__intro">
              {home.servicesIntro || 'From everyday laundry to specialist cleaning — we handle it all with care.'}
            </p>
          </Reveal>
          <ServiceCards services={services} />
        </div>
      </section>

      {/* Pricing / Catalogue */}
      <section className="section" id="pricing">
        <div className="container" style={{ textAlign: 'center' }}>
          <Reveal as="header" className="section__head section__head--center" style={{ marginBottom: '2rem' }}>
            <p className="eyebrow">{home.pricingEyebrow || 'Pricing'}</p>
            <h2 className="section__title">{home.pricingTitle || 'Every item, every price.'}</h2>
            <p className="section__intro">
              {home.pricingIntro || 'Transparent, itemised pricing. Free collection & delivery on orders over £25.'}
            </p>
          </Reveal>
          <Reveal as="div" style={{ marginTop: '2rem', textAlign: 'center' }}>
            <Link href="/pricing" className="btn btn--ghost btn--large" style={{ marginRight: '1rem' }}>
              Explore our Catalogue &amp; Pricing
            </Link>
            <Link href="/#book" className="btn btn--solid btn--large">
              BOOK A COLLECTION
            </Link>
          </Reveal>
        </div>
      </section>

      {/* Why Choose Us */}
      <WhyChooseUs />

      {/* About */}
      <section className="section section--dark" id="about">
        <div className="container promise">
          <Reveal className="promise__head">
            <p className="eyebrow eyebrow--light">About us</p>
            <h2 className="section__title">{about.title}</h2>
            <p className="section__intro section__intro--light">{about.intro}</p>
          </Reveal>
          <div className="grid grid--promise">
            {about.features.map((feature) => (
              <Reveal className="feature" key={feature.title}>
                <h3>{feature.title}</h3>
                <p>{feature.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonial */}
      <Testimonial testimonials={testimonials || []} />

      {/* Areas Served */}
      <AreasServed />

      {/* Booking Form */}
      <section className="section book" id="book">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">{home.bookingEyebrow || 'Book a collection'}</p>
            <h2 className="section__title">{home.bookingTitle || "Let's take it from here."}</h2>
            <p className="section__intro">
              {home.bookingIntro || "Tell us where and when. Drop a pin for the exact pickup spot — we'll confirm within the hour."}
            </p>
          </Reveal>
          <BookingForm />
        </div>
      </section>
    </>
  );
}
