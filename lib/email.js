/**
 * Email utility for transactional emails via Gmail SMTP (Nodemailer).
 *
 * Requires these env vars:
 * - SMTP_EMAIL: Your Gmail address (e.g. superdrycleaners@gmail.com)
 * - SMTP_PASSWORD: Gmail App Password (NOT your regular password)
 * - ADMIN_NOTIFICATION_EMAIL: Where admin notifications go (can be same as SMTP_EMAIL)
 *
 * To get an App Password:
 * 1. Go to myaccount.google.com → Security → 2-Step Verification (must be enabled)
 * 2. At the bottom, click "App passwords"
 * 3. Generate one for "Mail" → copy the 16-char password
 */

import nodemailer from 'nodemailer';

const smtpEmail = process.env.SMTP_EMAIL;
const smtpPassword = process.env.SMTP_PASSWORD;
const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL || smtpEmail;

/**
 * Create the SMTP transporter. Returns null if not configured.
 */
function getTransporter() {
  if (!smtpEmail || !smtpPassword) {
    console.warn('[Email] SMTP not configured — emails will be logged only.');
    return null;
  }

  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: smtpEmail,
      pass: smtpPassword,
    },
  });
}

/**
 * Send an email. Falls back to console logging if SMTP isn't configured.
 *
 * @param {object} options
 * @param {string} options.to - Recipient email.
 * @param {string} options.subject - Email subject.
 * @param {string} options.html - HTML body.
 * @param {string} [options.text] - Plain text fallback.
 * @param {Array} [options.attachments] - Nodemailer attachments array.
 * @returns {Promise<boolean>} True if sent successfully.
 */
export async function sendEmail({ to, subject, html, text, attachments }) {
  const transporter = getTransporter();

  if (!transporter) {
    console.log(`[Email] Would send to: ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body preview: ${(text || html || '').slice(0, 200)}`);
    return false;
  }

  try {
    await transporter.sendMail({
      from: `"Super Dry Cleaners" <${smtpEmail}>`,
      to,
      subject,
      html,
      text: text || html.replace(/<[^>]*>/g, ''),
      attachments,
    });
    return true;
  } catch (err) {
    console.error('[Email] Failed to send:', err.message);
    return false;
  }
}

/**
 * Send a booking confirmation to the customer.
 *
 * @param {object} order - The created order.
 */
export async function sendBookingConfirmation(order) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a1f44; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Super Dry Cleaners</h1>
        <p style="color: #c9a94e; margin: 4px 0 0; font-size: 12px;">LAUNDRY SERVICES · SINCE 2005</p>
      </div>
      <div style="padding: 30px 20px; background: #f4f6fb;">
        <h2 style="color: #0a1f44; margin-top: 0;">Collection Request Received ✓</h2>
        <p>Hi <strong>${order.name.split(' ')[0]}</strong>,</p>
        <p>Thank you for your booking! We've received your collection request and will confirm within the hour.</p>
        <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
          <tr><td style="padding: 8px; color: #666; border-bottom: 1px solid #ddd;">Order ID</td><td style="padding: 8px; border-bottom: 1px solid #ddd; font-weight: 600;">${order.id}</td></tr>
          <tr><td style="padding: 8px; color: #666; border-bottom: 1px solid #ddd;">Service</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.service}</td></tr>
          <tr><td style="padding: 8px; color: #666; border-bottom: 1px solid #ddd;">Collection Date</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.date}</td></tr>
          <tr><td style="padding: 8px; color: #666; border-bottom: 1px solid #ddd;">Time Slot</td><td style="padding: 8px; border-bottom: 1px solid #ddd;">${order.slot}</td></tr>
          <tr><td style="padding: 8px; color: #666;">Pickup Address</td><td style="padding: 8px;">${order.address1}, ${order.city} ${order.postcode}</td></tr>
        </table>
        ${order.couponCode ? `<p style="color: #1f6f3f; background: #e9f6ee; padding: 10px; border-radius: 6px;">🎁 Offer applied: <strong>${order.discountLabel || order.couponCode}</strong></p>` : ''}
        <p style="color: #666; font-size: 14px;">If you need to make changes, reply to this email or WhatsApp us at 07889 693265.</p>
      </div>
      <div style="background: #0a1f44; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">Super Dry Cleaners · Leicester · superdrycleaners.co</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: order.email,
    subject: `Collection Confirmed — ${order.id}`,
    html,
  });
}

/**
 * Send a notification to the admin about a new booking.
 *
 * @param {object} order - The created order.
 */
export async function sendAdminNotification(order) {
  if (!adminEmail) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  const html = `
    <div style="font-family: Arial, sans-serif;">
      <h2 style="color: #0a1f44;">🆕 New Collection Request</h2>
      <table style="border-collapse: collapse;">
        <tr><td style="padding: 6px 12px; color: #666;">Order</td><td style="padding: 6px 12px; font-weight: 600;">${order.id}</td></tr>
        <tr><td style="padding: 6px 12px; color: #666;">Customer</td><td style="padding: 6px 12px;">${order.name} (${order.phone})</td></tr>
        <tr><td style="padding: 6px 12px; color: #666;">Email</td><td style="padding: 6px 12px;">${order.email}</td></tr>
        <tr><td style="padding: 6px 12px; color: #666;">Service</td><td style="padding: 6px 12px;">${order.service}</td></tr>
        <tr><td style="padding: 6px 12px; color: #666;">Date/Slot</td><td style="padding: 6px 12px;">${order.date} · ${order.slot}</td></tr>
        <tr><td style="padding: 6px 12px; color: #666;">Address</td><td style="padding: 6px 12px;">${order.address1}, ${order.city} ${order.postcode}</td></tr>
        ${order.couponCode ? `<tr><td style="padding: 6px 12px; color: #666;">Offer</td><td style="padding: 6px 12px; color: #1f6f3f;">${order.discountLabel || order.couponCode}</td></tr>` : ''}
      </table>
      <div style="margin-top: 20px;">
        <a href="${siteUrl}/admin/orders/${order.id}" style="display: inline-block; padding: 12px 24px; background: #0a1f44; color: #fff; text-decoration: none; border-radius: 6px; font-weight: 600;">View in Dashboard →</a>
      </div>
      <p style="color: #999; font-size: 12px; margin-top: 16px;">
        <a href="${siteUrl}/admin" style="color: #999;">Go to Admin Dashboard</a>
      </p>
    </div>
  `;

  await sendEmail({
    to: adminEmail,
    subject: `New Order: ${order.id} — ${order.name}`,
    html,
  });
}

/**
 * Send a pickup confirmation email to the customer when status changes to "confirmed".
 *
 * @param {object} order - The order being confirmed.
 */
export async function sendPickupConfirmation(order) {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a1f44; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Super Dry Cleaners</h1>
        <p style="color: #c9a94e; margin: 4px 0 0; font-size: 12px;">LAUNDRY SERVICES · SINCE 2005</p>
      </div>
      <div style="padding: 30px 20px; background: #f4f6fb;">
        <h2 style="color: #0a1f44; margin-top: 0;">Pickup Confirmed! 🚐</h2>
        <p>Hi <strong>${order.name.split(' ')[0]}</strong>,</p>
        <p>Great news — your collection has been confirmed! Our driver will arrive at your location:</p>
        <div style="background: #fff; border: 1px solid #ddd; border-radius: 8px; padding: 16px; margin: 16px 0;">
          <p style="margin: 4px 0;"><strong>📅 Date:</strong> ${order.date}</p>
          <p style="margin: 4px 0;"><strong>⏰ Time:</strong> ${order.slot}</p>
          <p style="margin: 4px 0;"><strong>📍 Address:</strong> ${order.address1}, ${order.city} ${order.postcode}</p>
        </div>
        <p style="color: #666; font-size: 14px;">Please have your items ready. If you need to reschedule, contact us ASAP.</p>
      </div>
      <div style="background: #0a1f44; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">Super Dry Cleaners · 07889 693265 · superdrycleaners.co</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: order.email,
    subject: `Pickup Confirmed — ${order.date} ${order.slot}`,
    html,
  });
}

/**
 * Send an invoice email to the customer with PDF attached.
 *
 * @param {object} order - The order.
 * @param {Buffer} pdfBuffer - The generated PDF as a Buffer.
 */
export async function sendInvoiceEmail(order, pdfBuffer) {
  // Calculate discount for display
  const subtotal = (order.items || []).reduce((sum, item) => sum + (item.qty * item.price), 0);
  let discountAmount = 0;
  if (order.couponCode) {
    if (order.discountType === 'percent') {
      discountAmount = Math.round(subtotal * (order.discountValue / 100));
    } else if (order.discountType === 'fixed') {
      discountAmount = order.discountValue || 0;
    }
  }
  const finalTotal = (order.total || 0) / 100;

  // Build line items table
  const itemsHtml = (order.items && order.items.length > 0) ? `
    <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
      <thead>
        <tr style="background: #0a1f44; color: #fff;">
          <th style="padding: 8px 12px; text-align: left; font-size: 12px;">Item</th>
          <th style="padding: 8px 12px; text-align: center; font-size: 12px;">Qty</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px;">Price</th>
          <th style="padding: 8px 12px; text-align: right; font-size: 12px;">Subtotal</th>
        </tr>
      </thead>
      <tbody>
        ${order.items.map((item, i) => `
          <tr style="background: ${i % 2 === 0 ? '#f4f6fb' : '#fff'};">
            <td style="padding: 8px 12px;">${item.name}</td>
            <td style="padding: 8px 12px; text-align: center;">${item.qty}</td>
            <td style="padding: 8px 12px; text-align: right;">£${(item.price / 100).toFixed(2)}</td>
            <td style="padding: 8px 12px; text-align: right;">£${((item.qty * item.price) / 100).toFixed(2)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
    ${order.couponCode ? `
      <p style="margin: 4px 0;">Subtotal: £${(subtotal / 100).toFixed(2)}</p>
      <p style="color: #1f6f3f; margin: 4px 0;">Discount (${order.discountLabel || order.couponCode}): -£${(discountAmount / 100).toFixed(2)}</p>
    ` : ''}
    <p style="font-size: 18px; font-weight: 700; color: #0a1f44; margin-top: 8px;">Total: £${finalTotal.toFixed(2)}</p>
  ` : `<p>Total: <strong>£${finalTotal.toFixed(2)}</strong></p>`;

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <div style="background: #0a1f44; padding: 20px; text-align: center;">
        <h1 style="color: #fff; margin: 0; font-size: 22px;">Super Dry Cleaners</h1>
        <p style="color: #c9a94e; margin: 4px 0 0; font-size: 12px;">LAUNDRY SERVICES · SINCE 2005</p>
      </div>
      <div style="padding: 30px 20px; background: #f4f6fb;">
        <h2 style="color: #0a1f44; margin-top: 0;">Your Invoice</h2>
        <p>Hi <strong>${order.name.split(' ')[0]}</strong>,</p>
        <p>Please find your invoice details for order <strong>${order.id}</strong>:</p>
        ${itemsHtml}
        <p style="color: #666; font-size: 14px; margin-top: 20px;">The full PDF invoice is attached to this email. If you have any questions, simply reply to this email.</p>
      </div>
      <div style="background: #0a1f44; padding: 16px; text-align: center;">
        <p style="color: #aaa; font-size: 12px; margin: 0;">Super Dry Cleaners · Leicester · superdrycleaners.co</p>
      </div>
    </div>
  `;

  await sendEmail({
    to: order.email,
    subject: `Invoice ${order.id} — Super Dry Cleaners`,
    html,
    attachments: [
      {
        filename: `invoice-${order.id}.pdf`,
        content: pdfBuffer,
        contentType: 'application/pdf',
      },
    ],
  });
}
