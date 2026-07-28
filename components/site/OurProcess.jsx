import Reveal from '@/components/site/Reveal';

export default function OurProcess() {
  const steps = [
    {
      id: 1,
      title: "Expert Inspection",
      desc: "We carefully inspect every garment to identify specific fabric needs and areas requiring special attention.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>
      )
    },
    {
      id: 2,
      title: "Eco Pre-Spotting",
      desc: "Advanced, eco-friendly agents are used to expertly treat stubborn stains like grease or ink before washing.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"></path>
          <path d="M12 8v.01"></path>
        </svg>
      )
    },
    {
      id: 3,
      title: "Gentle Water Wash",
      desc: "Our PERC-free system uses ProV'tex technology to give your clothes a highly effective, gentle 'water cuddle.'",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 12h4l2-2 4 4 4-4 2 2h4"></path>
          <path d="M2 16h4l2-2 4 4 4-4 2 2h4"></path>
          <path d="M2 20h4l2-2 4 4 4-4 2 2h4"></path>
        </svg>
      )
    },
    {
      id: 4,
      title: "Woolmark Approved",
      desc: "Our water-based process is exceptionally delicate, making it fully safe for fine silks, cashmere, and wools.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
          <path d="M8 11l3 3 5-5"></path>
        </svg>
      )
    },
    {
      id: 5,
      title: "Smart Drying",
      desc: "Garments dry fully inside the machine—protecting the fabric surface and eliminating hang-dry time.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2"></path>
        </svg>
      )
    },
    {
      id: 6,
      title: "Flawless Finish",
      desc: "Your clothes emerge beautifully clean with minimal creases, ready to wear in under one hour.",
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon>
        </svg>
      )
    }
  ];

  return (
    <section className="section" id="eco-process" style={{ background: 'var(--mist)' }}>
      <div className="container">
        <Reveal as="header" className="section__head section__head--center">
          <p className="eyebrow">Super Dry Cleaners</p>
          <h2 className="section__title">Our Process: Fast, Easy & Green</h2>
          <p className="section__intro">
            Experience the future of garment care. Our revolutionary, eco-friendly wet-cleaning system delivers spotless results without harsh toxic solvents.
          </p>
        </Reveal>
        
        <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '2rem' }}>
          {steps.map((step) => (
            <Reveal className="card" key={step.id} style={{ display: 'flex', flexDirection: 'column', padding: '2.5rem 2rem', position: 'relative', overflow: 'hidden' }}>
              {/* Decorative Gradients */}
              <div style={{ position: 'absolute', top: '-15%', right: '-15%', width: '150px', height: '150px', background: 'radial-gradient(circle, rgba(201,169,78,0.12) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              <div style={{ position: 'absolute', bottom: '-10%', left: '-10%', width: '120px', height: '120px', background: 'radial-gradient(circle, rgba(26,95,180,0.06) 0%, transparent 70%)', borderRadius: '50%', pointerEvents: 'none' }}></div>
              
              {/* Header: Icon & Step Number */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem', zIndex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '50px', height: '50px', borderRadius: '12px', background: 'var(--mist-deep)', color: 'var(--teal)', border: '1px solid var(--line)' }}>
                  {step.icon}
                </div>
                <span className="card__num" style={{ color: 'var(--brass)', letterSpacing: '0.12em', fontSize: '0.8rem', fontWeight: 600, textTransform: 'uppercase' }}>
                  Step 0{step.id}
                </span>
              </div>

              {/* Content */}
              <div style={{ flex: 1, zIndex: 1 }}>
                <h3 style={{ fontSize: '1.25rem', marginTop: 0, marginBottom: '0.5rem', lineHeight: '1.3', color: 'var(--ink)' }}>{step.title}</h3>
                <p style={{ fontSize: '0.92rem', color: 'var(--ink-soft)', lineHeight: '1.5' }}>{step.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
