import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { createOrder } from '@/lib/data/orders';

/**
 * POST /api/admin/orders
 *
 * Creates a new order from admin-supplied data. Requires an authenticated
 * admin session. Returns the created order with its generated ID.
 */
export async function POST(request) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const { name, email, phone, service, address1, address2, city, postcode, date, slot, notes, lat, lng, items, total } = body;

  // Basic validation
  if (!name || !email || !phone || !service || !address1 || !city || !postcode || !date || !slot) {
    return NextResponse.json({ error: 'Please fill in all required fields.' }, { status: 400 });
  }

  const order = await createOrder({
    name: String(name).trim(),
    email: String(email).trim(),
    phone: String(phone).trim(),
    service: String(service).trim(),
    address1: String(address1).trim(),
    address2: address2 ? String(address2).trim() : '',
    city: String(city).trim(),
    postcode: String(postcode).trim(),
    date: String(date).trim(),
    slot: String(slot).trim(),
    notes: notes ? String(notes).trim() : '',
    lat: lat || null,
    lng: lng || null,
    items: Array.isArray(items) ? items : [],
    total: typeof total === 'number' ? total : 0,
  });

  return NextResponse.json({ ok: true, id: order.id }, { status: 201 });
}
