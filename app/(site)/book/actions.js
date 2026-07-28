'use server';

import { validateBooking } from '@/lib/validation';
import { createOrder } from '@/lib/data/orders';
import { validateCoupon, recordRedemption } from '@/lib/data/coupons';
import { sendBookingConfirmation, sendAdminNotification } from '@/lib/email';

/**
 * Server action: create a collection request from the booking form.
 *
 * All validation happens server-side (never trust the client). On success the
 * order is persisted via the data layer and a confirmation summary is returned.
 * If a coupon code is provided, it's validated and the discount is recorded.
 *
 * @param {*} _prevState - Previous form state (unused; required by useActionState).
 * @param {FormData} formData - Submitted booking form data.
 * @returns {Promise<{ ok: boolean, errors?: Record<string,string>,
 *   message?: string, order?: object }>} Result for the client form to render.
 */
export async function submitBooking(_prevState, formData) {
  // Convert FormData into a plain object for validation.
  const raw = Object.fromEntries(formData.entries());

  const result = validateBooking(raw);
  if (!result.ok) {
    return { ok: false, errors: result.errors };
  }

  // Validate coupon code if provided
  let appliedOffer = null;
  const couponCode = (raw.couponCode || '').trim().toUpperCase();
  if (couponCode) {
    const couponResult = await validateCoupon(couponCode, result.data.email);
    if (!couponResult.valid) {
      return { ok: false, errors: { couponCode: couponResult.error } };
    }
    appliedOffer = couponResult.offer;
  }

  // Create the order with discount info if applicable
  const orderData = {
    ...result.data,
    ...(appliedOffer && {
      couponCode: appliedOffer.code,
      discountType: appliedOffer.type,
      discountValue: appliedOffer.value,
      discountLabel: appliedOffer.label,
    }),
  };

  const order = await createOrder(orderData);

  // Record coupon redemption after successful order creation
  if (appliedOffer) {
    await recordRedemption({
      code: appliedOffer.code,
      name: order.name,
      email: order.email,
      phone: order.phone,
      orderId: order.id,
    });
  }

  // Send confirmation emails (non-blocking — don't fail the booking if email fails)
  sendBookingConfirmation(order).catch(() => {});
  sendAdminNotification(order).catch(() => {});

  return {
    ok: true,
    message: `Thank you, ${order.name.split(' ')[0]}. Your collection is requested for ${order.date}, ${order.slot}. We'll confirm within the hour.${appliedOffer ? ` Offer "${appliedOffer.label}" applied!` : ''}`,
    order: { id: order.id, date: order.date, slot: order.slot },
  };
}
