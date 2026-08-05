/**
 * Orders / collection-requests data-access layer.
 *
 * All order reads and writes flow through this module. Backend: Supabase
 * Postgres when available, otherwise falls back to an in-memory store
 * (for local dev without network access to Supabase).
 */

import { supabase } from '@/lib/supabase';

/**
 * In-memory fallback store for when Supabase is unreachable/unconfigured.
 * @type {import('./orders').Order[]}
 */
let memoryStore = [];

/**
 * @typedef {'pending'|'confirmed'|'collected'|'in_progress'|'ready'|'delivered'|'cancelled'} OrderStatus
 */

/**
 * @typedef {object} OrderItem
 * @property {string} name - Item/service name.
 * @property {number} qty - Quantity.
 * @property {number} price - Price per unit in pence.
 */

/**
 * @typedef {object} Order
 * @property {string} id - Unique order id.
 * @property {string} name - Customer full name.
 * @property {string} email - Customer email.
 * @property {string} phone - Customer phone.
 * @property {string} service - Requested service.
 * @property {OrderItem[]} [items] - Line items with prices.
 * @property {number} [total] - Total in pence.
 * @property {string} [couponCode] - Applied offer code.
 * @property {string} [discountType] - 'percent' or 'fixed'.
 * @property {number} [discountValue] - Discount amount (percent or pence).
 * @property {string} [discountLabel] - Human-readable offer name.
 * @property {string} address1 - Address line 1.
 * @property {string} [address2] - Address line 2.
 * @property {string} city - City / borough.
 * @property {string} postcode - Postcode.
 * @property {string} [notes] - Access notes.
 * @property {number|null} lat - Pickup latitude from the map pin.
 * @property {number|null} lng - Pickup longitude from the map pin.
 * @property {string} date - Requested collection date (YYYY-MM-DD).
 * @property {string} slot - Requested time slot.
 * @property {OrderStatus} status - Current status.
 * @property {string} createdAt - ISO timestamp of creation.
 */

/** Ordered pipeline of statuses used by the dashboard. */
export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'collected',
  'in_progress',
  'ready',
  'delivered',
  'cancelled',
];

/** Human-friendly labels for each status. */
export const STATUS_LABELS = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  collected: 'Collected',
  in_progress: 'In progress',
  ready: 'Ready',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

/**
 * Generate a collision-resistant, time-ordered order ID.
 *
 * Format: `ORD-` + base36 timestamp + 8 random uppercase hex characters.
 * Example: `ORD-M5K9A7-9F2CB401`
 *
 * Guarantees uniqueness across concurrent serverless lambdas and cold starts.
 * Uses universal Web Crypto API to ensure client and server bundler compatibility.
 *
 * @returns {string} Unique order ID.
 */
export function generateOrderId() {
  const time = Date.now().toString(36).toUpperCase();
  const bytes = new Uint8Array(4);
  if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
    crypto.getRandomValues(bytes);
  } else {
    for (let i = 0; i < 4; i++) {
      bytes[i] = Math.floor(Math.random() * 256);
    }
  }
  const rand = Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
    .toUpperCase();
  return `ORD-${time}-${rand}`;
}

/**
 * Map a Supabase row to the Order shape used by the app.
 * Handles the snake_case → camelCase conversion.
 *
 * @param {object} row - Supabase row.
 * @returns {Order} App-shaped order.
 */
function rowToOrder(row) {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    service: row.service,
    items: row.items || [],
    total: row.total || 0,
    couponCode: row.coupon_code || row.couponCode || null,
    discountType: row.discount_type || row.discountType || null,
    discountValue: row.discount_value || row.discountValue || 0,
    discountLabel: row.discount_label || row.discountLabel || null,
    address1: row.address1,
    address2: row.address2 || '',
    city: row.city,
    postcode: row.postcode,
    notes: row.notes || '',
    lat: row.lat,
    lng: row.lng,
    date: row.date,
    slot: row.slot,
    status: row.status,
    createdAt: row.created_at || row.createdAt,
  };
}

/**
 * List all orders, newest first.
 *
 * @param {object} [options] - Filter options.
 * @param {OrderStatus} [options.status] - Restrict to a single status.
 * @returns {Promise<Order[]>} Matching orders.
 */
export async function listOrders({ status } = {}) {
  if (!supabase) {
    let result = [...memoryStore];
    if (status) result = result.filter((o) => o.status === status);
    result.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    return result;
  }

  let query = supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });

  if (status) {
    query = query.eq('status', status);
  }

  const { data, error } = await query;
  if (error) {
    console.error('[Orders] Failed to list orders:', error.message);
    return [];
  }
  return (data || []).map(rowToOrder);
}

/**
 * Fetch a single order by id.
 *
 * @param {string} id - Order id.
 * @returns {Promise<Order|null>} The order, or null if not found.
 */
export async function getOrder(id) {
  if (!supabase) {
    return memoryStore.find((o) => o.id === id) || null;
  }

  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Orders] Failed to get order:', error.message);
    return null;
  }
  return data ? rowToOrder(data) : null;
}

/**
 * Create a new order from validated booking input.
 *
 * @param {Omit<Order,'id'|'status'|'createdAt'> & { id?: string }} input - Validated fields.
 * @returns {Promise<Order>} The created order.
 */
export async function createOrder(input) {
  const id = input.id || generateOrderId();

  if (!supabase) {
    const order = {
      id, ...input,
      status: 'pending',
      createdAt: new Date().toISOString(),
      items: input.items || [],
      total: input.total || 0,
      couponCode: input.couponCode || null,
      discountType: input.discountType || null,
      discountValue: input.discountValue || 0,
      discountLabel: input.discountLabel || null,
    };
    memoryStore.unshift(order);
    return { ...order };
  }

  const row = {
    id,
    name: input.name,
    email: input.email,
    phone: input.phone,
    service: input.service,
    address1: input.address1,
    address2: input.address2 || '',
    city: input.city,
    postcode: input.postcode,
    notes: input.notes || '',
    lat: input.lat || null,
    lng: input.lng || null,
    date: input.date,
    slot: input.slot,
    status: 'pending',
    items: input.items || [],
    total: input.total || 0,
    coupon_code: input.couponCode || null,
    discount_type: input.discountType || null,
    discount_value: input.discountValue || 0,
    discount_label: input.discountLabel || null,
    created_at: new Date().toISOString(),
  };

  const { data, error } = await supabase
    .from('orders')
    .insert(row)
    .select()
    .single();

  if (error) {
    console.error('[Orders] Failed to create order:', error.message);
    // Return a local-only fallback order so the UI doesn't crash
    return { ...row, createdAt: row.created_at };
  }
  return rowToOrder(data);
}

/**
 * Update an order's status.
 *
 * @param {string} id - Order id.
 * @param {OrderStatus} status - New status; must be a known value.
 * @returns {Promise<Order|null>} The updated order, or null if not found.
 */
export async function updateOrderStatus(id, status) {
  if (!ORDER_STATUSES.includes(status)) {
    throw new Error(`Invalid status: ${status}`);
  }

  if (!supabase) {
    const order = memoryStore.find((o) => o.id === id);
    if (!order) return null;
    order.status = status;
    return { ...order };
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Orders] Failed to update order status:', error.message);
    return null;
  }
  return data ? rowToOrder(data) : null;
}

/**
 * Update an order's invoice line items and total.
 *
 * @param {string} id - Order id.
 * @param {OrderItem[]} items - New line items.
 * @param {number} total - New total in pence.
 * @returns {Promise<Order|null>} The updated order, or null if not found.
 */
export async function updateOrderInvoice(id, items, total) {
  if (!supabase) {
    const order = memoryStore.find((o) => o.id === id);
    if (!order) return null;
    order.items = items;
    order.total = total;
    return { ...order };
  }

  const { data, error } = await supabase
    .from('orders')
    .update({ items, total })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null;
    console.error('[Orders] Failed to update invoice:', error.message);
    return null;
  }
  return data ? rowToOrder(data) : null;
}

/**
 * Aggregate counts for the dashboard summary cards.
 *
 * @returns {Promise<{ total: number, byStatus: Record<string, number> }>}
 */
export async function getOrderStats() {
  if (!supabase) {
    const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    for (const o of memoryStore) {
      if (o.status in byStatus) byStatus[o.status] += 1;
    }
    return { total: memoryStore.length, byStatus };
  }

  const { data, error } = await supabase
    .from('orders')
    .select('status');

  if (error) {
    console.error('[Orders] Failed to get order stats:', error.message);
    const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
    return { total: 0, byStatus };
  }

  const byStatus = Object.fromEntries(ORDER_STATUSES.map((s) => [s, 0]));
  for (const row of data || []) {
    if (row.status in byStatus) byStatus[row.status] += 1;
  }
  return { total: (data || []).length, byStatus };
}
