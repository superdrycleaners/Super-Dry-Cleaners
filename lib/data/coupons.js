/**
 * Coupon / offer code data-access layer.
 *
 * Tracks which customers have redeemed which offer codes.
 * Current backend: in-memory. TODO(supabase): replace with a coupon_redemptions table.
 */

import { supabase } from '@/lib/supabase';

/**
 * @typedef {object} CouponRedemption
 * @property {string} code - The offer code used.
 * @property {string} name - Customer name.
 * @property {string} email - Customer email.
 * @property {string} phone - Customer phone.
 * @property {string} orderId - The order it was applied to.
 * @property {string} redeemedAt - ISO timestamp.
 */

/** Available offer codes with their discount rules. */
export const OFFER_CODES = {
  SUPER20: {
    label: '20% Off First Order',
    type: 'percent',
    value: 20,
    firstTimeOnly: true,
  },
  CLEAN10: {
    label: '£10 Off Orders Over £30',
    type: 'fixed',
    value: 1000, // pence
    minOrder: 3000, // pence
    firstTimeOnly: false,
  },
  REFER15: {
    label: '15% Off Referral',
    type: 'percent',
    value: 15,
    firstTimeOnly: true,
  },
};

/** In-memory fallback store for coupon redemptions. */
let memoryRedemptions = [];

/**
 * Check if a coupon code is valid and hasn't been used by this customer.
 *
 * @param {string} code - Offer code.
 * @param {string} email - Customer email.
 * @returns {Promise<{ valid: boolean, offer?: object, error?: string }>}
 */
export async function validateCoupon(code, email) {
  const normalizedCode = code.trim().toUpperCase();
  const offer = OFFER_CODES[normalizedCode];

  if (!offer) {
    return { valid: false, error: 'Invalid offer code.' };
  }

  if (offer.firstTimeOnly) {
    const used = await hasCustomerUsedCode(normalizedCode, email);
    if (used) {
      return { valid: false, error: 'This offer has already been used.' };
    }
  }

  return { valid: true, offer: { ...offer, code: normalizedCode } };
}

/**
 * Check if a customer has already used a specific code.
 *
 * @param {string} code - Normalized offer code.
 * @param {string} email - Customer email.
 * @returns {Promise<boolean>}
 */
async function hasCustomerUsedCode(code, email) {
  const normalizedEmail = email.trim().toLowerCase();

  if (!supabase) {
    return memoryRedemptions.some(
      (r) => r.code === code && r.email === normalizedEmail
    );
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .select('id')
    .eq('code', code)
    .eq('email', normalizedEmail)
    .limit(1);

  if (error) {
    console.error('[Coupons] Failed to check redemption:', error.message);
    return false;
  }

  return (data || []).length > 0;
}

/**
 * Record that a customer has redeemed a coupon.
 *
 * @param {object} redemption - Redemption details.
 * @param {string} redemption.code - Offer code.
 * @param {string} redemption.name - Customer name.
 * @param {string} redemption.email - Customer email.
 * @param {string} redemption.phone - Customer phone.
 * @param {string} redemption.orderId - Order ID.
 * @returns {Promise<void>}
 */
export async function recordRedemption({ code, name, email, phone, orderId }) {
  const record = {
    code: code.trim().toUpperCase(),
    name,
    email: email.trim().toLowerCase(),
    phone,
    order_id: orderId,
    redeemed_at: new Date().toISOString(),
  };

  if (!supabase) {
    memoryRedemptions.push(record);
    return;
  }

  const { error } = await supabase
    .from('coupon_redemptions')
    .insert(record);

  if (error) {
    console.error('[Coupons] Failed to record redemption:', error.message);
  }
}

/**
 * List all coupon redemptions (for admin view).
 *
 * @returns {Promise<CouponRedemption[]>}
 */
export async function listRedemptions() {
  if (!supabase) {
    return [...memoryRedemptions];
  }

  const { data, error } = await supabase
    .from('coupon_redemptions')
    .select('*')
    .order('redeemed_at', { ascending: false });

  if (error) {
    console.error('[Coupons] Failed to list redemptions:', error.message);
    return [];
  }

  return data || [];
}
