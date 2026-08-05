import Link from 'next/link';
import Reveal from '@/components/site/Reveal';
import FloatingLeaves from '@/components/site/FloatingLeaves';
import CountUp from '@/components/site/CountUp';
import { getContentSection } from '@/lib/data/content';

export const metadata = {
  title: 'Eco-Friendly Cleaning — Super Dry Cleaners Leicester',
  description:
    'We use Electrolux lagoon® Advanced Care — the world\'s most advanced water-based, chemical-free professional textile cleaning system. Fast, gentle, and genuinely green.',
};

const FEATURES = [
  {
    icon: '🌱',
    stat: 99,
    statSuffix: '%',
    title: 'Garments Accepted',
    body: 'No fabric limits — silks, wools, cashmere, embroidery, sequins, wedding dresses, curtains and more. lagoon® handles it all.',
  },
  {
    icon: '🚫',
    stat: 0,
    statSuffix: ' Perc',
    title: 'Harsh Chemicals',
    body: 'Water-based from start to finish. No Perc, no solvents, no chemical risk — safe for your family and the planet.',
  },
];

const PROCESS_STEPS = [
  {
    num: '01',
    icon: '🔍',
    title: 'Pre-Spotting',
    time: '~5 min',
    body: 'Expert assessment and targeted stain treatment before the main wash cycle.',
  },
  {
    num: '02',
    icon: '💧',
    title: 'lagoon® Wet Clean',
    time: '~25 min',
    body: 'ProYtex drum technology creates a gentle water-cuddle action — 30% higher loading, dramatically gentler on fibres.',
  },
  {
    num: '03',
    icon: '👗',
    title: 'Smart Finishing',
    time: '~20 min',
    body: 'Garments come out clean, dry and with little to no creasing — no extensive hand-finishing required.',
  },
  {
    num: '04',
    icon: '📦',
    title: 'Ready to Deliver',
    time: '~5 min',
    body: 'Packaged with care and dispatched back to your door — or ready to collect.',
  },
];

const FABRICS = [
  { icon: '👗', name: 'Silk Dresses' },
  { icon: '🧥', name: 'Cashmere Coats' },
  { icon: '💍', name: 'Wedding Dresses' },
  { icon: '🪭', name: 'Embroidery & Sequins' },
  { icon: '🧣', name: 'Wools & Knitwear' },
  { icon: '🏠', name: 'Curtains & Bedding' },
  { icon: '👔', name: 'Structured Suits' },
  { icon: '🎨', name: 'Viscose & Delicates' },
  { icon: '👘', name: 'Sarees & Lehengas' },
  { icon: '🎩', name: 'Vintage & Antique' },
];

const COMPARE_ROWS = [
  {
    feature: 'Garments Accepted',
    lagoon: { text: '99% — No Limits', level: 'high' },
    perc: { text: '90%', level: 'mid' },
    wet: { text: '70%', level: 'low' },
  },
  {
    feature: 'Greasy Stains',
    lagoon: { text: 'HIGH removal', level: 'high' },
    perc: { text: 'HIGH', level: 'high' },
    wet: { text: 'LOW', level: 'low' },
  },
  {
    feature: 'Water-Soluble Stains',
    lagoon: { text: 'No Limits', level: 'high' },
    perc: { text: 'LOW', level: 'low' },
    wet: { text: 'HIGH', level: 'high' },
  },
  {
    feature: 'Crease Recovery',
    lagoon: { text: 'HIGH — little/no creases', level: 'high' },
    perc: { text: 'HIGH', level: 'high' },
    wet: { text: 'LOW — extensive finishing', level: 'low' },
  },
  {
    feature: 'Eco-Friendly',
    lagoon: { text: '✅ Fully water-based', level: 'high' },
    perc: { text: '❌ PERC chemicals', level: 'low' },
    wet: { text: '⚠️ Partial', level: 'mid' },
  },
];

/**
 * Eco-Friendly page — powered by Electrolux lagoon® Advanced Care.
 */
export default async function EcoPage() {
  const brand = await getContentSection('brand');
  const whatsapp = brand?.whatsapp || '447889693265';

  return (
    <>
      {/* ── HERO ───────────────────────────────────────────────── */}
      <section className="eco-hero">
        <FloatingLeaves />
        <div className="container eco-hero__inner">
          <Reveal>
            <span className="eyebrow eco-eyebrow">Powered by Electrolux lagoon® Advanced Care</span>
          </Reveal>
          <Reveal>
            <h1 className="eco-hero__title">
              Clean Without<br />
              <span className="eco-hero__accent">Compromise.</span>
            </h1>
          </Reveal>
          <Reveal>
            <p className="eco-hero__lede">
              We use Electrolux lagoon® Advanced Care — the world&apos;s most advanced
              water-based textile cleaning system. Fast, gentle, and genuinely green.
              No Perc. No solvents. No limits on what we can clean.
            </p>
          </Reveal>
          <Reveal className="eco-hero__actions">
            <a href="#book" className="btn btn--solid">Book a Collection</a>
            <a href="#how-it-works" className="btn btn--ghost">How It Works ↓</a>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp"
            >
              WhatsApp Us
            </a>
          </Reveal>
          <Reveal>
            <div className="eco-badge">
              <span className="eco-badge__icon">🐑</span>
              <span>Woolmark Approved since 2004</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FEATURE STRIP ──────────────────────────────────────── */}
      <section className="section section--muted eco-features">
        <div className="container">
          <div className="eco-features__grid">
            {FEATURES.map((f, i) => (
              <Reveal key={f.title} className="eco-feat-card" style={{ '--delay': `${i * 0.15}s` }}>
                <span className="eco-feat-card__icon">{f.icon}</span>
                <strong className="eco-feat-card__stat">
                  <CountUp target={f.stat} suffix={f.statSuffix} />
                </strong>
                <h3 className="eco-feat-card__title">{f.title}</h3>
                <p className="eco-feat-card__body">{f.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── SUSTAINABLE BY DESIGN ──────────────────────────────── */}
      <section className="section eco-split">
        <div className="container eco-split__inner">
          <Reveal className="eco-split__text">
            <p className="eyebrow">Sustainable by Design</p>
            <h2 className="section__title">Water-based. Chemical-free. Woolmark-approved.</h2>
            <p className="eco-split__body">
              Say goodbye to solvent-based cleaning. lagoon® Advanced Care is a truly
              green alternative — just as fast, just as effective, with none of the
              dangerous PERC procedures. It&apos;s water-based cleaning with specialised
              detergents tailored to every fabric type.
            </p>
            <ul className="eco-pills">
              <li className="eco-pill">♻️ Water-based — No Perc, No Solvents</li>
              <li className="eco-pill">🌍 Dramatically reduced carbon footprint</li>
              <li className="eco-pill">✅ Safe for staff &amp; environment</li>
              <li className="eco-pill">🐑 Woolmark &amp; Woolmark Performance Approved</li>
            </ul>
          </Reveal>
          <Reveal className="eco-split__visual">
            <div className="eco-visual-card">
              <div className="eco-visual-leaves" aria-hidden="true">
                <svg className="eco-vis-leaf eco-vis-leaf--1" viewBox="0 0 100 140" fill="none">
                  <path d="M50 5 C10 20 0 60 10 100 C20 130 50 135 50 135 C50 135 80 130 90 100 C100 60 90 20 50 5Z" fill="rgba(201, 169, 78, 0.08)" stroke="#c9a94e" strokeWidth="1.2" strokeOpacity="0.4" />
                  <path d="M50 5 Q50 70 50 135" stroke="#c9a94e" strokeWidth="1" strokeOpacity="0.3" fill="none" />
                </svg>
                <svg className="eco-vis-leaf eco-vis-leaf--2" viewBox="0 0 100 140" fill="none">
                  <path d="M50 5 C10 20 0 60 10 100 C20 130 50 135 50 135 C50 135 80 130 90 100 C100 60 90 20 50 5Z" fill="rgba(26, 95, 180, 0.06)" stroke="#1a5fb4" strokeWidth="1.2" strokeOpacity="0.35" />
                  <path d="M50 5 Q50 70 50 135" stroke="#1a5fb4" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                </svg>
                <svg className="eco-vis-leaf eco-vis-leaf--3" viewBox="0 0 100 140" fill="none">
                  <path d="M50 5 C10 20 0 60 10 100 C20 130 50 135 50 135 C50 135 80 130 90 100 C100 60 90 20 50 5Z" fill="rgba(31, 84, 70, 0.07)" stroke="#1f5446" strokeWidth="1.2" strokeOpacity="0.35" />
                  <path d="M50 5 Q50 70 50 135" stroke="#1f5446" strokeWidth="1" strokeOpacity="0.25" fill="none" />
                </svg>
              </div>
              <div className="eco-visual-stats">
                <div className="eco-vis-stat">
                  <strong>Fast, easy and green</strong>
                  <span>lagoon® Advanced Care</span>
                </div>
                <div className="eco-vis-divider" />
                <div className="eco-vis-stat">
                  <strong>Electrolux Professional</strong>
                  <span>Professional Textile Care</span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── HOW IT WORKS ───────────────────────────────────────── */}
      <section className="section section--muted eco-process" id="how-it-works">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">The lagoon® Process</p>
            <h2 className="section__title">From Collection to Delivery</h2>
            <p className="section__intro" style={{ marginInline: 'auto' }}>
              No other wet-cleaning system on the market offers the same speed and results.
              A unique, continuous workflow designed for rapid, gentle precision.
            </p>
          </Reveal>
          <div className="eco-steps">
            {PROCESS_STEPS.map((step, i) => (
              <Reveal key={step.num} className="eco-step" style={{ '--delay': `${i * 0.12}s` }}>
                {i < PROCESS_STEPS.length - 1 && <span className="eco-step__connector" aria-hidden="true" />}
                <div className="eco-step__num">{step.num}</div>
                <span className="eco-step__icon">{step.icon}</span>
                <h3 className="eco-step__title">{step.title}</h3>
                <p className="eco-step__body">{step.body}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── EVERY FABRIC ───────────────────────────────────────── */}
      <section className="section eco-fabrics">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">No Garment Too Precious</p>
            <h2 className="section__title">Every Fabric. No Limits.</h2>
            <p className="section__intro" style={{ marginInline: 'auto' }}>
              Silks, cashmere, embroidery, viscose, sequins, wedding dresses, curtains —
              there is no limit with lagoon® Advanced Care.
            </p>
          </Reveal>
        </div>
        <div className="eco-marquee">
          <div className="eco-marquee__track">
            {[...FABRICS, ...FABRICS].map((fabric, i) => (
              <div key={i} className="eco-fabric-chip">
                <span>{fabric.icon}</span>
                <span>{fabric.name}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── COMPARISON TABLE ───────────────────────────────────── */}
      <section className="section section--muted eco-compare">
        <div className="container">
          <Reveal as="header" className="section__head section__head--center">
            <p className="eyebrow">Side-by-Side Comparison</p>
            <h2 className="section__title">lagoon® vs Traditional Methods</h2>
          </Reveal>
          <Reveal>
            <div className="eco-table-wrap">
              <table className="eco-table">
                <thead>
                  <tr>
                    <th className="eco-table__label">Feature</th>
                    <th className="eco-table__col eco-table__col--winner">
                      <span className="eco-table__badge">lagoon® Advanced Care</span>
                    </th>
                    <th className="eco-table__col">Dry Cleaning (Perc)</th>
                    <th className="eco-table__col">Traditional Wet Cleaning</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_ROWS.map((row) => (
                    <tr key={row.feature}>
                      <td className="eco-table__feature">{row.feature}</td>
                      <td className={`eco-table__cell eco-table__cell--winner eco-table__cell--${row.lagoon.level}`}>
                        {row.lagoon.text}
                      </td>
                      <td className={`eco-table__cell eco-table__cell--${row.perc.level}`}>
                        {row.perc.text}
                      </td>
                      <td className={`eco-table__cell eco-table__cell--${row.wet.level}`}>
                        {row.wet.text}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── TRUST BAR ──────────────────────────────────────────── */}
      <section className="section eco-trust">
        <div className="container">
          <div className="eco-trust__grid">
            <Reveal className="eco-trust-badge">
              <span className="eco-trust-badge__icon">🐑</span>
              <strong>Woolmark Approved</strong>
              <span>Approved for dry-clean labelled wool garments since 2004</span>
            </Reveal>
            <Reveal className="eco-trust-badge">
              <span className="eco-trust-badge__icon">🏭</span>
              <strong>Electrolux Professional</strong>
              <span>Industry-leading commercial textile care technology</span>
            </Reveal>
            <Reveal className="eco-trust-badge">
              <span className="eco-trust-badge__icon">💧</span>
              <strong>100% Water-Based</strong>
              <span>No Perc, no solvents — the cleanest clean possible</span>
            </Reveal>
            <Reveal className="eco-trust-badge">
              <span className="eco-trust-badge__icon">⭐</span>
              <strong><CountUp target={20} suffix="+" /> Years</strong>
              <span>Trusted by Leicester homes &amp; businesses</span>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── ECO COMMITMENT ─────────────────────────────────────── */}
      <section className="eco-commitment">
        <div className="container eco-commitment__inner">
          <Reveal>
            <p className="eyebrow eco-eyebrow--light">Our Pledge</p>
            <h2 className="eco-commitment__title">Our Commitment to the Planet</h2>
            <p className="eco-commitment__body">
              Every garment we clean uses water — not chemicals. Our machines, our
              detergents, and our processes are designed to leave the smallest possible
              footprint on the environment, while delivering the highest possible results
              for your wardrobe.
            </p>
            <div className="eco-commitment__pills">
              <span className="eco-commit-pill">🌊 Water-based process</span>
              <span className="eco-commit-pill">🏭 Electrolux lagoon® technology</span>
              <span className="eco-commit-pill">🚫 Zero Perc or solvents</span>
              <span className="eco-commit-pill">♻️ Lower carbon footprint</span>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── FINAL CTA ──────────────────────────────────────────── */}
      <section className="section eco-cta">
        <Reveal className="container eco-cta__inner">
          <p className="eyebrow">Ready?</p>
          <h2 className="eco-cta__title">
            Experience Genuinely Green Cleaning.
          </h2>
          <p className="eco-cta__body">
            Collected from your door. Cleaned with lagoon®. Returned fresh, spotless, and
            ready to wear.
          </p>
          <div className="eco-cta__actions">
            <a href="#book" className="btn btn--solid btn--large">Book a Collection</a>
            <a
              href={`https://wa.me/${whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn--whatsapp btn--large"
            >
              WhatsApp Us
            </a>
          </div>
        </Reveal>
      </section>
    </>
  );
}
