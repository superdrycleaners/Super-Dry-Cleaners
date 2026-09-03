import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getSession } from '@/lib/session';
import { getOrder } from '@/lib/data/orders';
import { getContentSection } from '@/lib/data/content';
import { sendInvoiceEmail } from '@/lib/email';

/** Brand colors */
const NAVY = [10, 31, 68];
const GOLD = [201, 169, 78];
const DARK_TEXT = [26, 31, 46];
const SOFT_TEXT = [74, 85, 104];
const WHITE = [255, 255, 255];
const LIGHT_BG = [244, 246, 251];

/**
 * POST /api/admin/invoice/[id]/send
 *
 * Generates the PDF invoice and emails it to the customer.
 * Requires an authenticated admin session.
 */
export async function POST(_request, { params }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 });
  }

  const { id } = params;
  const order = await getOrder(id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  if (!order.email) {
    return NextResponse.json({ error: 'Customer has no email address.' }, { status: 400 });
  }

  const brand = await getContentSection('brand');

  // Generate the PDF (same logic as the download route)
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 0;

  // Header
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 38, 'F');
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPER DRY CLEANERS', margin, 18);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LAUNDRY SERVICES · SINCE 2005', margin, 26);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(order.id, pageWidth - margin, 26, { align: 'right' });
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(0, 38, pageWidth, 38);

  y = 48;

  // Invoice details
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, y + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  doc.text(order.id, margin + 42, y + 2);
  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' });
  doc.setFontSize(9);
  doc.setTextColor(...SOFT_TEXT);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, y, { align: 'right' });
  y += 16;

  // Bill To
  doc.setFillColor(...LIGHT_BG);
  doc.roundedRect(margin, y - 4, pageWidth - margin * 2, 36, 3, 3, 'F');
  doc.setTextColor(...NAVY);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('BILL TO', margin + 6, y + 3);
  doc.setTextColor(...DARK_TEXT);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  y += 9;
  doc.text(order.name, margin + 6, y); y += 4;
  doc.text(order.address1 + (order.address2 ? `, ${order.address2}` : ''), margin + 6, y); y += 4;
  doc.text(`${order.city}, ${order.postcode}`, margin + 6, y); y += 4;
  doc.text(`${order.phone} · ${order.email}`, margin + 6, y);
  y += 24;

  // Line items
  if (order.items && order.items.length > 0) {
    doc.setFillColor(...NAVY);
    doc.rect(margin, y, pageWidth - margin * 2, 8, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('ITEM', margin + 4, y + 5.5);
    doc.text('QTY', 120, y + 5.5);
    doc.text('PRICE', 140, y + 5.5);
    doc.text('SUBTOTAL', pageWidth - margin - 4, y + 5.5, { align: 'right' });
    y += 12;

    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    for (const item of order.items) {
      const subtotal = (item.qty * item.price) / 100;
      doc.text(item.name, margin + 4, y);
      doc.text(String(item.qty), 120, y);
      doc.text(`£${(item.price / 100).toFixed(2)}`, 140, y);
      doc.text(`£${subtotal.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 7;
    }
    y += 4;
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Discount and total
    const subtotalAmount = order.items.reduce((sum, item) => sum + (item.qty * item.price), 0) / 100;

    if (order.couponCode) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SOFT_TEXT);
      doc.text(`Subtotal:`, 140, y);
      doc.text(`£${subtotalAmount.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 6;

      let discountAmount = 0;
      let discountText = '';
      if (order.discountType === 'percent') {
        discountAmount = subtotalAmount * (order.discountValue / 100);
        discountText = `${order.discountLabel || order.couponCode} (${order.discountValue}% off)`;
      } else {
        discountAmount = (order.discountValue || 0) / 100;
        discountText = order.discountLabel || order.couponCode;
      }
      doc.setTextColor(31, 111, 63);
      doc.text(`Discount: ${discountText}`, margin + 4, y);
      doc.text(`-£${discountAmount.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      doc.setTextColor(0, 0, 0);
      y += 9;
    }

    // Total
    doc.setFillColor(...NAVY);
    doc.roundedRect(pageWidth / 2, y - 3, pageWidth / 2 - margin, 12, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const total = (order.total || 0) / 100;
    doc.text('TOTAL', pageWidth / 2 + 8, y + 5);
    doc.text(`£${total.toFixed(2)}`, pageWidth - margin - 6, y + 5, { align: 'right' });
  }

  // Footer
  doc.setTextColor(...SOFT_TEXT);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Super Dry Cleaners.', pageWidth / 2, 276, { align: 'center' });

  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  // Send the email
  const sent = await sendInvoiceEmail(order, pdfBuffer);

  if (!sent) {
    return NextResponse.json({ error: 'Failed to send email. Check SMTP configuration.' }, { status: 500 });
  }

  return NextResponse.json({ ok: true, message: `Invoice sent to ${order.email}` });
}
