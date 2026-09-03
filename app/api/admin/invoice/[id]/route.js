import { NextResponse } from 'next/server';
import { jsPDF } from 'jspdf';
import { getSession } from '@/lib/session';
import { getOrder } from '@/lib/data/orders';
import { getContentSection } from '@/lib/data/content';

/** Brand colors in RGB */
const NAVY = [10, 31, 68];
const GOLD = [201, 169, 78];
const DARK_TEXT = [26, 31, 46];
const SOFT_TEXT = [74, 85, 104];
const WHITE = [255, 255, 255];
const LIGHT_BG = [244, 246, 251];

/**
 * GET /api/admin/invoice/[id]
 *
 * Generates a branded PDF invoice for the given order and returns it as a download.
 * Requires an authenticated admin session.
 */
export async function GET(_request, { params }) {
  const session = getSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorised. Please sign in.' }, { status: 401 });
  }

  const { id } = params;
  const order = await getOrder(id);

  if (!order) {
    return NextResponse.json({ error: 'Order not found.' }, { status: 404 });
  }

  const brand = await getContentSection('brand');
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 16;
  let y = 0;

  // ─── Header (navy bar with brand text) ───────────────────────────────
  doc.setFillColor(...NAVY);
  doc.rect(0, 0, pageWidth, 38, 'F');

  // Brand name
  doc.setTextColor(...WHITE);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text('SUPER DRY CLEANERS', margin, 18);

  // Tagline
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('LAUNDRY SERVICES · SINCE 2005', margin, 26);

  // Invoice label (right side)
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', pageWidth - margin, 18, { align: 'right' });
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(order.id, pageWidth - margin, 26, { align: 'right' });

  // Gold accent line under header
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.5);
  doc.line(0, 38, pageWidth, 38);

  // Invoice details below header
  y = 48;

  // Gold accent line under header
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(1.2);
  doc.line(0, y, pageWidth, y);

  y += 8;

  // Invoice number + date row
  doc.setTextColor(...NAVY);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('INVOICE', margin, y + 2);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...DARK_TEXT);
  doc.text(order.id, margin + 42, y + 2);

  const orderDate = new Date(order.createdAt).toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });
  doc.setFontSize(9);
  doc.setTextColor(...SOFT_TEXT);
  doc.text(`Date: ${orderDate}`, pageWidth - margin, y, { align: 'right' });
  doc.text(`Status: ${(order.status || 'pending').replace('_', ' ').toUpperCase()}`, pageWidth - margin, y + 5, { align: 'right' });

  y += 16;

  // ─── Bill To section ────────────────────────────────────────────────
  // Light background card
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

  // Collection details (right column)
  const colX = pageWidth / 2 + 10;
  y -= 12;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...NAVY);
  doc.text('COLLECTION', colX, y - 3);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...DARK_TEXT);
  doc.text(`Date: ${order.date}`, colX, y + 3);
  doc.text(`Slot: ${order.slot}`, colX, y + 7);
  doc.text(`Service: ${order.service}`, colX, y + 11);

  y += 30;

  // ─── Line items table ───────────────────────────────────────────────
  if (order.items && order.items.length > 0) {
    // Table header
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

    // Table rows
    doc.setTextColor(...DARK_TEXT);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    let rowBg = false;
    for (const item of order.items) {
      if (rowBg) {
        doc.setFillColor(...LIGHT_BG);
        doc.rect(margin, y - 3.5, pageWidth - margin * 2, 7, 'F');
      }
      rowBg = !rowBg;

      const subtotal = (item.qty * item.price) / 100;
      doc.text(item.name, margin + 4, y);
      doc.text(String(item.qty), 120, y);
      doc.text(`£${(item.price / 100).toFixed(2)}`, 140, y);
      doc.text(`£${subtotal.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 7;
    }

    y += 4;

    // Gold divider before totals
    doc.setDrawColor(...GOLD);
    doc.setLineWidth(0.8);
    doc.line(margin, y, pageWidth - margin, y);
    y += 8;

    // Subtotal
    const subtotalAmount = order.items.reduce((sum, item) => sum + (item.qty * item.price), 0) / 100;

    if (order.couponCode) {
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(...SOFT_TEXT);
      doc.text('Subtotal:', 140, y);
      doc.text(`£${subtotalAmount.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 7;

      // Discount line
      let discountAmount = 0;
      let discountText = '';
      if (order.discountType === 'percent') {
        discountAmount = subtotalAmount * (order.discountValue / 100);
        discountText = `${order.discountLabel || order.couponCode} (${order.discountValue}% off)`;
      } else {
        discountAmount = (order.discountValue || 0) / 100;
        discountText = order.discountLabel || order.couponCode;
      }
      doc.setTextColor(31, 111, 63); // green
      doc.text(`Discount: ${discountText}`, margin + 4, y);
      doc.text(`-£${discountAmount.toFixed(2)}`, pageWidth - margin - 4, y, { align: 'right' });
      y += 9;
    }

    // Total (big, bold, navy)
    doc.setFillColor(...NAVY);
    doc.roundedRect(pageWidth / 2, y - 3, pageWidth / 2 - margin, 12, 2, 2, 'F');
    doc.setTextColor(...WHITE);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    const total = (order.total || 0) / 100;
    doc.text('TOTAL', pageWidth / 2 + 8, y + 5);
    doc.text(`£${total.toFixed(2)}`, pageWidth - margin - 6, y + 5, { align: 'right' });
    y += 20;
  }

  // ─── Footer ─────────────────────────────────────────────────────────
  const footerY = 270;

  // Gold accent line
  doc.setDrawColor(...GOLD);
  doc.setLineWidth(0.8);
  doc.line(margin, footerY, pageWidth - margin, footerY);

  doc.setTextColor(...SOFT_TEXT);
  doc.setFontSize(7);
  doc.setFont('helvetica', 'normal');
  doc.text('Thank you for choosing Super Dry Cleaners. We care for your clothes like they\'re our own.', pageWidth / 2, footerY + 6, { align: 'center' });
  doc.text(`${brand.phone || '07889 693265'} · ${brand.email || 'info@superdrycleaners.co'} · ${brand.website || 'superdrycleaners.co'}`, pageWidth / 2, footerY + 10, { align: 'center' });

  // Return PDF as download
  const pdfBuffer = Buffer.from(doc.output('arraybuffer'));

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="invoice-${order.id}.pdf"`,
    },
  });
}
