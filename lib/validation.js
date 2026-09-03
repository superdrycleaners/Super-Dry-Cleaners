/**
 * Input validation for booking / collection requests.
 *
 * Server-side validation is the source of truth (never trust the client).
 * The booking server action calls `validateBooking` before creating an order.
 */

/** Services the customer may choose. Allowlist — anything else is rejected. */
export const ALLOWED_SERVICES = [
  'Wash, dry & fold',
  'Dry cleaning',
  'Ironing & pressing',
  'Duvets & bedding',
  'Curtains & household',
  'Wedding dress cleaning',
  'Alterations & repairs',
  'Commercial laundry',
  'Bag & shoe cleaning',
];

/** Time slots the customer may choose. Allowlist. */
export const ALLOWED_SLOTS = [
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
];

/** Email format check (pragmatic, not RFC-exhaustive). */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
/** Phone check: digits, spaces and common separators, min 7 chars. */
const PHONE_RE = /^[\d\s()+-]{7,}$/;
/** Collection date must be YYYY-MM-DD. */
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

/**
 * Trim and cap a string to a maximum length.
 *
 * Length caps bound stored data and reduce abuse via oversized payloads.
 * @param {*} value - Raw value.
 * @param {number} max - Maximum allowed length.
 * @returns {string} The trimmed, capped string ('' when not a string).
 */
function str(value, max) {
  return (typeof value === 'string' ? value : '').trim().slice(0, max);
}

/**
 * Validate and normalize raw booking input.
 *
 * @param {Record<string, *>} raw - Raw fields from the submitted form.
 * @returns {{ ok: true, data: object } | { ok: false, errors: Record<string,string> }}
 *   On success, `data` holds normalized, safe fields ready to persist.
 */
export function validateBooking(raw) {
  const errors = {};

  const name = str(raw.name, 120);
  const email = str(raw.email, 160).toLowerCase();
  const phone = str(raw.phone, 40);
  const service = str(raw.service, 60);
  const address1 = str(raw.address1, 160);
  const address2 = str(raw.address2, 160);
  const city = str(raw.city, 80);
  const postcode = str(raw.postcode, 12);
  const notes = str(raw.notes, 300);
  const quantity = str(raw.quantity, 100);
  const deliveryPreference = str(raw.deliveryPreference, 100);
  const date = str(raw.date, 10);
  const slot = str(raw.slot, 20);

  if (!name) errors.name = 'Full name is required.';
  if (!email || !EMAIL_RE.test(email)) errors.email = 'A valid email is required.';
  if (!phone || !PHONE_RE.test(phone)) errors.phone = 'A valid phone number is required.';
  if (!ALLOWED_SERVICES.includes(service)) errors.service = 'Please choose a service.';
  if (!address1) errors.address1 = 'Address line 1 is required.';
  if (!city) errors.city = 'City / borough is required.';
  if (!postcode) errors.postcode = 'Postcode is required.';
  if (!DATE_RE.test(date)) errors.date = 'A valid collection date is required.';
  if (!ALLOWED_SLOTS.includes(slot)) errors.slot = 'Please choose a time slot.';

  // Coordinates are optional at the schema level but validated when present.
  const lat = raw.lat === '' || raw.lat == null ? null : Number(raw.lat);
  const lng = raw.lng === '' || raw.lng == null ? null : Number(raw.lng);
  if (lat !== null && (Number.isNaN(lat) || lat < -90 || lat > 90)) {
    errors.lat = 'Invalid pickup location.';
  }
  if (lng !== null && (Number.isNaN(lng) || lng < -180 || lng > 180)) {
    errors.lng = 'Invalid pickup location.';
  }
  if (lat === null || lng === null) {
    errors.pin = 'Please drop a pin for the exact pickup spot.';
  }

  if (Object.keys(errors).length > 0) return { ok: false, errors };

  return {
    ok: true,
    data: { name, email, phone, service, quantity, address1, address2, city, postcode, deliveryPreference, notes, date, slot, lat, lng },
  };
}
