'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import dynamic from 'next/dynamic';
import { submitBooking } from '@/app/(site)/book/actions';
import { ALLOWED_SERVICES, ALLOWED_SLOTS } from '@/lib/validation';

// Load the map only in the browser; it depends on `window` via Leaflet.
const PickupMap = dynamic(() => import('./PickupMap'), {
  ssr: false,
  loading: () => <div className="map" aria-hidden="true" />,
});

/** Initial state for the booking server action. */
const INITIAL_STATE = { ok: false };

/**
 * Submit button that reflects the pending state of the server action.
 */
const SubmitButton = () => {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn--solid book__submit" disabled={pending}>
      {pending ? 'Requesting…' : 'REQUEST COLLECTION'}
    </button>
  );
};

/**
 * Multi-step collection booking form.
 *
 * Collects contact details, a pickup location (with an interactive map pin and
 * mandatory address fields), and a date/time slot. Submission is handled by the
 * `submitBooking` server action, which re-validates everything server-side.
 * Field-level errors returned by the action are shown inline.
 */
const BookingForm = () => {
  const [state, formAction] = useFormState(submitBooking, INITIAL_STATE);
  const [pin, setPin] = useState({ lat: '', lng: '' });
  const [hint, setHint] = useState('Click the map or drag the pin to your exact pickup spot.');
  const [checkerPostcode, setCheckerPostcode] = useState('');
  const [postcodeStatus, setPostcodeStatus] = useState(null); // 'valid', 'invalid', or null

  // Refs to auto-fill address fields from reverse geocoding.
  const address1Ref = useRef(null);
  const cityRef = useRef(null);
  const postcodeRef = useRef(null);

  // Today's date (YYYY-MM-DD) to constrain the date picker to future pickups.
  const today = new Date().toISOString().split('T')[0];

  /**
   * Store the dropped pin coordinates and update the hint text.
   * Memoized so PickupMap's effect dependencies stay stable.
   */
  const handlePick = useCallback(({ lat, lng }) => {
    setPin({ lat: lat.toFixed(6), lng: lng.toFixed(6) });
    setHint(`Pin set: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  }, []);

  /**
   * Fill any empty address fields from a reverse-geocoded result.
   * Existing user input is never overwritten.
   */
  const handleGeocode = useCallback((address) => {
    if (address.line1 && address1Ref.current && !address1Ref.current.value) {
      address1Ref.current.value = address.line1;
    }
    if (address.city && cityRef.current && !cityRef.current.value) {
      cityRef.current.value = address.city;
    }
    if (address.postcode && postcodeRef.current && !postcodeRef.current.value) {
      postcodeRef.current.value = address.postcode;
    }
  }, []);

  const errors = state.errors || {};

  const handleCheckPostcode = () => {
    const pc = checkerPostcode.trim().toUpperCase();
    if (!pc) return;
    // We serve all LE (Leicester) postcodes
    if (pc.startsWith('LE')) {
      setPostcodeStatus('valid');
      if (postcodeRef.current && !postcodeRef.current.value) {
        postcodeRef.current.value = pc;
      }
    } else {
      setPostcodeStatus('invalid');
    }
  };

  // Auto-refresh the page 15 seconds after a successful booking.
  useEffect(() => {
    if (state.ok && state.message) {
      const timer = setTimeout(() => window.location.reload(), 15000);
      return () => clearTimeout(timer);
    }
  }, [state.ok, state.message]);

  // Success view replaces the form once the action confirms the order.
  if (state.ok && state.message) {
    return (
      <div className="book__success" role="status" aria-live="polite">
        <h2>Collection requested</h2>
        <p>{state.message}</p>
      </div>
    );
  }

  return (
    <form className="book__form" action={formAction} noValidate>
      {/* Honeypot field for bot protection */}
      <input
        type="text"
        name="website_trap"
        tabIndex={-1}
        autoComplete="off"
        style={{ position: 'absolute', opacity: 0, pointerEvents: 'none', height: 0, width: 0, left: '-9999px' }}
        aria-hidden="true"
      />

      {errors._form && (
        <div className="book__error-banner" role="alert">
          <p>{errors._form}</p>
        </div>
      )}

      {/* POSTCODE CHECKER */}
      {!postcodeStatus || postcodeStatus === 'invalid' ? (
        <div className="postcode-checker">
          <h3 className="postcode-checker__title">Check if we collect from your area</h3>
          <p className="postcode-checker__text">Enter your postcode to see if you are eligible for free collection & delivery.</p>
          <div className="postcode-checker__form">
            <input 
              type="text" 
              placeholder="e.g. LE1 1AA"
              value={checkerPostcode}
              onChange={(e) => setCheckerPostcode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleCheckPostcode())}
              className="postcode-checker__input"
            />
            <button type="button" onClick={handleCheckPostcode} className="btn btn--solid postcode-checker__btn">Check</button>
          </div>
          {postcodeStatus === 'invalid' && (
            <p className="postcode-checker__error">
              Sorry, we currently only serve Leicester (LE postcodes). Please contact us for special requests.
            </p>
          )}
        </div>
      ) : (
        <div className="postcode-checker postcode-checker--success">
          <p className="postcode-checker__success-text">
            Great news! We collect from {checkerPostcode.toUpperCase()}. Please complete your booking below.
          </p>
        </div>
      )}

      {/* Render the rest of the form only if valid postcode */}
      {postcodeStatus === 'valid' && (
        <>
          {/* Step 1 — Contact */}
          <fieldset className="book__step">
            <legend>
              <span className="book__stepnum">1</span> Your details
            </legend>
            <div className="book__row">
              <div className="field">
                <label htmlFor="name">Full Name <em>*</em></label>
                <input type="text" id="name" name="name" autoComplete="name" placeholder="Enter your full name"
                  className={errors.name ? 'is-invalid' : undefined} />
                {errors.name && <span className="field__error">{errors.name}</span>}
              </div>
              <div className="field">
                <label htmlFor="phone">Phone Number <em>*</em></label>
                <input type="tel" id="phone" name="phone" autoComplete="tel" placeholder="Enter your phone number"
                  className={errors.phone ? 'is-invalid' : undefined} />
                {errors.phone && <span className="field__error">{errors.phone}</span>}
              </div>
            </div>
            <div className="book__row">
              <div className="field">
                <label htmlFor="email">Email Address <em>*</em></label>
                <input type="email" id="email" name="email" autoComplete="email" placeholder="Enter your email address"
                  className={errors.email ? 'is-invalid' : undefined} />
                {errors.email && <span className="field__error">{errors.email}</span>}
              </div>
              <div className="field">
                <label htmlFor="service">Service Required <em>*</em></label>
                <select id="service" name="service" defaultValue=""
                  className={errors.service ? 'is-invalid' : undefined}>
                  <option value="" disabled>Choose a service…</option>
                  {ALLOWED_SERVICES.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                {errors.service && <span className="field__error">{errors.service}</span>}
              </div>
            </div>
            <div className="book__row">
              <div className="field field--wide">
                <label htmlFor="quantity">Number of Items / Approximate Quantity</label>
                <input type="text" id="quantity" name="quantity" placeholder="e.g. 2 bags, 5 shirts" />
              </div>
            </div>
          </fieldset>

          {/* Step 2 — Location + map */}
          <fieldset className="book__step">
            <legend>
              <span className="book__stepnum">2</span> Pickup location
            </legend>

            <PickupMap onPick={handlePick} onGeocode={handleGeocode} />
            <p className={`map__hint${pin.lat ? ' is-set' : ''}`}>{hint}</p>
            {errors.pin && <p className="field__error" style={{ textAlign: 'center' }}>{errors.pin}</p>}

            <div className="book__row">
              <div className="field field--wide">
                <label htmlFor="address1">Collection Address <em>*</em></label>
                <input ref={address1Ref} type="text" id="address1" name="address1"
                  autoComplete="address-line1" placeholder="Flat / house no. and street"
                  className={errors.address1 ? 'is-invalid' : undefined} />
                {errors.address1 && <span className="field__error">{errors.address1}</span>}
              </div>
            </div>
            <div className="book__row">
              <div className="field">
                <label htmlFor="address2">Address line 2</label>
                <input type="text" id="address2" name="address2" autoComplete="address-line2"
                  placeholder="Building, entrance, buzzer (optional)" />
              </div>
              <div className="field">
                <label htmlFor="city">City / Borough <em>*</em></label>
                <input ref={cityRef} type="text" id="city" name="city" autoComplete="address-level2"
                  placeholder="Enter your city" className={errors.city ? 'is-invalid' : undefined} />
                {errors.city && <span className="field__error">{errors.city}</span>}
              </div>
            </div>
            <div className="book__row">
              <div className="field">
                <label htmlFor="postcode">Postcode <em>*</em></label>
                <input ref={postcodeRef} type="text" id="postcode" name="postcode"
                  autoComplete="postal-code" placeholder="Enter your postcode"
                  className={errors.postcode ? 'is-invalid' : undefined} />
                {errors.postcode && <span className="field__error">{errors.postcode}</span>}
              </div>
              <div className="field">
                <label htmlFor="deliveryPreference">Delivery Preference</label>
                <select id="deliveryPreference" name="deliveryPreference" defaultValue="">
                  <option value="" disabled>Choose a preference…</option>
                  <option value="Hand to me">Hand to me</option>
                  <option value="Leave at door / safe place">Leave at door / safe place</option>
                  <option value="Leave with neighbor">Leave with neighbor</option>
                  <option value="Reception / Concierge">Reception / Concierge</option>
                </select>
              </div>
            </div>
            <div className="book__row">
              <div className="field field--wide">
                <label htmlFor="notes">Additional Notes</label>
                <input type="text" id="notes" name="notes" placeholder="Concierge, gate code, etc. (optional)" />
              </div>
            </div>

            {/* Precise coordinates captured from the pin, submitted with the form */}
            <input type="hidden" name="lat" value={pin.lat} readOnly />
            <input type="hidden" name="lng" value={pin.lng} readOnly />
          </fieldset>

          {/* Step 3 — Date + time */}
          <fieldset className="book__step">
            <legend>
              <span className="book__stepnum">3</span> Collection time
            </legend>
            <div className="book__row">
              <div className="field">
                <label htmlFor="date">Preferred Collection Date <em>*</em></label>
                <input type="date" id="date" name="date" min={today}
                  className={errors.date ? 'is-invalid' : undefined} />
                {errors.date && <span className="field__error">{errors.date}</span>}
              </div>
            </div>
            <fieldset className="slots">
              <legend className="slots__legend">Preferred Collection Time <em>*</em></legend>
              <div className="slots__grid" role="radiogroup" aria-label="Time slot">
                {ALLOWED_SLOTS.map((slot) => (
                  <label className="slot" key={slot}>
                    <input type="radio" name="slot" value={slot} />
                    <span>{slot.replace('–', ' – ')}</span>
                  </label>
                ))}
              </div>
              {errors.slot && <span className="field__error">{errors.slot}</span>}
            </fieldset>
          </fieldset>

          <div className="book__actions">
            {/* Offer code field */}
            <fieldset className="book__step book__step--offer">
              <legend>
                <span className="book__stepnum">4</span> Have an offer code?
              </legend>
              <div className="field">
                <label htmlFor="couponCode">Offer / Promo Code</label>
                <input type="text" id="couponCode" name="couponCode" placeholder="e.g. SUPER20" style={{ textTransform: 'uppercase' }} />
                {errors.couponCode && <span className="field__error">{errors.couponCode}</span>}
              </div>
            </fieldset>

            <SubmitButton />
            <p className="book__reassure">
              Free collection &amp; delivery · No charge until pickup · Cancel anytime
            </p>
          </div>
        </>
      )}
    </form>
  );
};

export default BookingForm;
