'use server';

import { revalidatePath } from 'next/cache';
import { requireSession } from '@/lib/session';
import { updateOrderStatus, updateOrderInvoice, ORDER_STATUSES } from '@/lib/data/orders';
import { updateContentSection } from '@/lib/data/content';
import { sendPickupConfirmation } from '@/lib/email';

/**
 * Known section-validation message prefix thrown by the data layer when a
 * section key does not exist. Matching against this allows the action to
 * surface actionable feedback without leaking arbitrary exception text.
 */
const UNKNOWN_SECTION_PREFIX = 'Unknown content section:';

/**
 * Generic client-safe error for unexpected CMS failures. Internal details
 * stay in server logs and never reach the browser.
 */
const GENERIC_CMS_ERROR = 'Could not save content. Please try again or contact support.';

/**
 * Server action: change an order's status.
 *
 * Re-checks the admin session (defense in depth — never rely on middleware
 * alone for mutations) and validates the status against the allowed set.
 *
 * @param {FormData} formData - Contains `id` and `status`.
 * @returns {Promise<{ ok: boolean, error?: string }>} Result.
 */
export async function changeOrderStatus(formData) {
  requireSession();

  const id = String(formData.get('id') || '');
  const status = String(formData.get('status') || '');

  if (!id) return { ok: false, error: 'Missing order id.' };
  if (!ORDER_STATUSES.includes(status)) return { ok: false, error: 'Invalid status.' };

  const updated = await updateOrderStatus(id, status);
  if (!updated) return { ok: false, error: 'Order not found.' };

  // Send pickup confirmation email when status changes to "confirmed"
  if (status === 'confirmed') {
    sendPickupConfirmation(updated).catch(() => {});
  }

  // Refresh dashboard and orders views so counts and pills update.
  revalidatePath('/admin');
  revalidatePath('/admin/orders');
  return { ok: true };
}

/**
 * Server action: save an edited CMS content section.
 *
 * Re-checks the session before any parsing or data access (defense in depth).
 * Only known sections are writable (enforced by the data layer). Invalid JSON
 * is rejected with a user-actionable message. Unexpected failures return a
 * generic client-safe response — internal details are logged server-side only.
 *
 * @param {*} _prevState - Previous state (unused; for useActionState).
 * @param {FormData} formData - Contains `section` and `payload` (JSON string).
 * @returns {Promise<{ ok: boolean, error?: string, message?: string }>} Result.
 */
export async function saveContentSection(_prevState, formData) {
  requireSession();

  const section = String(formData.get('section') || '');
  const payloadRaw = String(formData.get('payload') || '');

  if (!section) return { ok: false, error: 'Missing section.' };

  let value;
  try {
    value = JSON.parse(payloadRaw);
  } catch {
    return { ok: false, error: 'Content is not valid JSON. Please check your edits.' };
  }

  try {
    await updateContentSection(section, value);
  } catch (err) {
    // Surface a known validation rejection (unknown section) as actionable
    // feedback. All other failures get a generic response so internal details
    // (file paths, storage errors, stack traces) never reach the client.
    const message = err instanceof Error ? err.message : '';
    if (message.startsWith(UNKNOWN_SECTION_PREFIX)) {
      return { ok: false, error: 'Unknown section. Please choose a valid content section.' };
    }

    // Log the failure server-side for debugging. Exclude CMS payload content,
    // passwords, session tokens, customer PII, stack traces, and file paths.
    // Only the section name and a sanitized error class are recorded.
    console.error('[CMS] Unexpected save failure', {
      section,
      errorType: err?.constructor?.name || 'Unknown',
    });

    return { ok: false, error: GENERIC_CMS_ERROR };
  }

  revalidatePath('/', 'layout'); // public site reads this content
  revalidatePath('/admin/content');
  return { ok: true, message: 'Saved. Changes are live on the site.' };
}

/**
 * Server action: update an order's invoice line items and total.
 *
 * Re-checks the admin session before processing. Validates the payload
 * structure and persists via the data-access layer.
 *
 * @param {*} _prevState - Previous state (unused; for useActionState).
 * @param {FormData} formData - Contains `id` and `payload` (JSON string with items + total).
 * @returns {Promise<{ ok: boolean, error?: string, message?: string }>} Result.
 */
export async function updateInvoice(_prevState, formData) {
  requireSession();

  const id = String(formData.get('id') || '');
  const payloadRaw = String(formData.get('payload') || '');

  if (!id) return { ok: false, error: 'Missing order ID.' };

  let parsed;
  try {
    parsed = JSON.parse(payloadRaw);
  } catch {
    return { ok: false, error: 'Invalid invoice data.' };
  }

  const { items, total } = parsed;
  if (!Array.isArray(items)) return { ok: false, error: 'Items must be a list.' };

  // Validate each item
  for (const item of items) {
    if (!item.name || typeof item.name !== 'string') {
      return { ok: false, error: 'Each item must have a name.' };
    }
    if (typeof item.qty !== 'number' || item.qty < 0) {
      return { ok: false, error: 'Invalid quantity.' };
    }
    if (typeof item.price !== 'number' || item.price < 0) {
      return { ok: false, error: 'Invalid price.' };
    }
  }

  try {
    const updated = await updateOrderInvoice(id, items, typeof total === 'number' ? total : 0);
    if (!updated) return { ok: false, error: 'Order not found.' };
  } catch (err) {
    console.error('[Invoice] Unexpected save failure', {
      orderId: id,
      errorType: err?.constructor?.name || 'Unknown',
    });
    return { ok: false, error: 'Could not save invoice. Please try again.' };
  }

  revalidatePath('/admin/invoices');
  revalidatePath('/admin/orders');
  revalidatePath(`/admin/invoices/${id}`);
  return { ok: true, message: 'Invoice saved.' };
}
