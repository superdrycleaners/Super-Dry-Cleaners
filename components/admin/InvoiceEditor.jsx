'use client';

import { useState, useMemo } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import PropTypes from 'prop-types';
import { updateInvoice } from '@/app/admin/(dashboard)/actions';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Select from '@/components/admin/ui/Select';

const INITIAL_STATE = { ok: false };

/** Custom item sentinel value for the dropdown. */
const CUSTOM_ITEM_VALUE = '__custom__';

/**
 * Submit button that reads pending state.
 */
function SaveButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" pending={pending}>
      {pending ? 'Saving…' : 'Save Invoice'}
    </Button>
  );
}

/**
 * Parse a catalogue price string like "£5", "From £12", "£3.50" to pence.
 * Returns 0 if unparseable.
 *
 * @param {string} priceStr - Price string from catalogue.
 * @returns {number} Price in pence.
 */
function parseCataloguePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.replace(/[Ff]rom\s*/, '').match(/£?([\d.]+)/);
  if (!match) return 0;
  return Math.round(parseFloat(match[1]) * 100);
}

/**
 * Format pence to GBP display string.
 * @param {number} pence - Amount in pence.
 * @returns {string} Formatted like "42.00".
 */
function penceToPounds(pence) {
  return (pence / 100).toFixed(2);
}

/**
 * Parse a pounds string to pence.
 * @param {string} str - Amount like "42.00" or "42".
 * @returns {number} Amount in pence.
 */
function poundsToPence(str) {
  const num = parseFloat(str.replace('£', '').trim());
  return Math.round((isNaN(num) ? 0 : num) * 100);
}

/**
 * Build a flat list of selectable catalogue items from the nested catalogue groups.
 *
 * @param {Array} catalogue - Catalogue groups from CMS content.
 * @returns {Array<{ id: string, name: string, price: number, group: string }>}
 */
function buildCatalogueOptions(catalogue) {
  const options = [];
  for (const group of catalogue) {
    for (const item of group.items || []) {
      options.push({
        id: `${group.id}::${item.name}`,
        name: item.name,
        price: parseCataloguePrice(item.price),
        group: group.title,
      });
    }
  }
  return options;
}

/**
 * Invoice line item editor with catalogue-based dropdown and auto-pricing.
 *
 * Line items are selected from the service catalogue (populated from CMS).
 * When the admin picks an item, the price auto-fills. A "Custom" option
 * allows entering a one-off charge with a custom name and price.
 *
 * @param {object} props
 * @param {object} props.order - The full order object.
 * @param {Array} props.catalogue - Catalogue data from CMS content.
 */
const InvoiceEditor = ({ order, catalogue }) => {
  const [state, formAction] = useFormState(updateInvoice, INITIAL_STATE);
  const [items, setItems] = useState(() =>
    (order.items || []).map((item) => ({
      ...item,
      isCustom: !catalogue.some((g) => g.items?.some((ci) => ci.name === item.name)),
    }))
  );

  const catalogueOptions = useMemo(() => buildCatalogueOptions(catalogue), [catalogue]);

  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    setItems(next);
  };

  const handleItemSelect = (idx, selectedValue) => {
    if (selectedValue === CUSTOM_ITEM_VALUE) {
      updateItem(idx, 'isCustom', true);
      updateItem(idx, 'name', '');
      updateItem(idx, 'price', 0);
      return;
    }

    const found = catalogueOptions.find((opt) => opt.id === selectedValue);
    if (found) {
      const next = [...items];
      next[idx] = { ...next[idx], name: found.name, price: found.price, isCustom: false, catalogueId: found.id };
      setItems(next);
    }
  };

  const addItem = () => {
    setItems([...items, { name: '', qty: 1, price: 0, isCustom: false, catalogueId: '' }]);
  };

  const removeItem = (idx) => {
    setItems(items.filter((_, i) => i !== idx));
  };

  const subtotal = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  // Calculate discount from coupon
  let discountAmount = 0;
  if (order.couponCode) {
    if (order.discountType === 'percent') {
      discountAmount = Math.round(subtotal * (order.discountValue / 100));
    } else if (order.discountType === 'fixed') {
      discountAmount = order.discountValue || 0;
    }
  }
  const total = Math.max(0, subtotal - discountAmount);

  // Serialize items for the hidden form field (strip UI-only keys)
  const cleanItems = items.map(({ name, qty, price }) => ({ name, qty, price }));
  const payload = JSON.stringify({ items: cleanItems, total });

  return (
    <div className="invoice-editor">
      {/* Order summary (read-only) */}
      <div className="invoice-editor__summary">
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Customer</span>
          <strong>{order.name}</strong>
        </div>
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Phone</span>
          <span>{order.phone}</span>
        </div>
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Email</span>
          <span>{order.email}</span>
        </div>
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Address</span>
          <span>{order.address1}{order.address2 ? `, ${order.address2}` : ''}, {order.city} {order.postcode}</span>
        </div>
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Collection</span>
          <span>{order.date} · {order.slot}</span>
        </div>
        <div className="invoice-editor__detail">
          <span className="admin-ui__field-label">Service</span>
          <span>{order.service}</span>
        </div>
        {order.quantity && (
          <div className="invoice-editor__detail">
            <span className="admin-ui__field-label">Quantity</span>
            <span>{order.quantity}</span>
          </div>
        )}
        {order.deliveryPreference && (
          <div className="invoice-editor__detail">
            <span className="admin-ui__field-label">Delivery Preference</span>
            <span>{order.deliveryPreference}</span>
          </div>
        )}
        {order.notes && (
          <div className="invoice-editor__detail">
            <span className="admin-ui__field-label">Access Notes</span>
            <span>{order.notes}</span>
          </div>
        )}
        {order.couponCode && (
          <div className="invoice-editor__detail">
            <span className="admin-ui__field-label">Offer Applied</span>
            <span style={{ color: 'var(--teal, #1f6f3f)', fontWeight: 600 }}>
              Offer: {order.discountLabel || order.couponCode}
              {order.discountType === 'percent' ? ` (${order.discountValue}% off)` : ` (£${((order.discountValue || 0) / 100).toFixed(2)} off)`}
            </span>
          </div>
        )}
      </div>

      {/* Line items editor */}
      <form className="invoice-editor__form" action={formAction}>
        <Input type="hidden" name="id" value={order.id} />
        <Input type="hidden" name="payload" value={payload} />

        <h3 className="invoice-editor__section-title">Line Items</h3>

        <table className="invoice-editor__table">
          <thead>
            <tr>
              <th>Service / Item</th>
              <th style={{ width: '5rem' }}>Qty</th>
              <th style={{ width: '7rem' }}>Price (£)</th>
              <th style={{ width: '6rem' }}>Subtotal</th>
              <th style={{ width: '3rem' }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx}>
                <td>
                  {item.isCustom ? (
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <Input
                        value={item.name}
                        placeholder="Custom item name"
                        onChange={(e) => updateItem(idx, 'name', e.target.value)}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          const next = [...items];
                          next[idx] = { ...next[idx], isCustom: false, catalogueId: '', name: '', price: 0 };
                          setItems(next);
                        }}
                      >
                        ↩
                      </Button>
                    </div>
                  ) : (
                    <Select
                      value={item.catalogueId || ''}
                      onChange={(e) => handleItemSelect(idx, e.target.value)}
                      aria-label={`Select item ${idx + 1}`}
                    >
                      <option value="">— Select service —</option>
                      <option value={CUSTOM_ITEM_VALUE}>✏️ Custom / Other</option>
                      {catalogueOptions.map((opt) => (
                        <option key={opt.id} value={opt.id}>
                          {opt.name} — £{penceToPounds(opt.price)} ({opt.group})
                        </option>
                      ))}
                    </Select>
                  )}
                </td>
                <td>
                  <Input
                    type="text"
                    value={String(item.qty)}
                    onChange={(e) => updateItem(idx, 'qty', Math.max(0, parseInt(e.target.value) || 0))}
                  />
                </td>
                <td>
                  <Input
                    type="text"
                    value={penceToPounds(item.price)}
                    onChange={(e) => updateItem(idx, 'price', poundsToPence(e.target.value))}
                    disabled={!item.isCustom && Boolean(item.catalogueId)}
                  />
                </td>
                <td className="invoice-editor__subtotal">
                  £{penceToPounds(item.qty * item.price)}
                </td>
                <td>
                  <Button type="button" variant="danger" size="sm" onClick={() => removeItem(idx)}>✕</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        <div className="invoice-editor__actions-row">
          <Button type="button" variant="ghost" size="sm" onClick={addItem}>+ Add item</Button>
        </div>

        <div className="invoice-editor__total">
          {order.couponCode && (
            <>
              <span>Subtotal: £{penceToPounds(subtotal)}</span>
              <span style={{ color: 'var(--teal, #1f6f3f)' }}>
                Discount ({order.discountLabel || order.couponCode}): -£{penceToPounds(discountAmount)}
              </span>
            </>
          )}
          <span>Total:</span>
          <strong>£{penceToPounds(total)}</strong>
        </div>

        <div className="invoice-editor__footer">
          <SaveButton />
          <a
            href={`/api/admin/invoice/${order.id}`}
            className="admin-ui__button admin-ui__button--secondary admin-ui__button--md"
            download
            title="Download PDF"
          >
            📄 Download PDF
          </a>
          <button
            type="button"
            className="admin-ui__button admin-ui__button--ghost admin-ui__button--md"
            onClick={async () => {
              const res = await fetch(`/api/admin/invoice/${order.id}/send`, { method: 'POST' });
              const data = await res.json();
              if (data.ok) alert(`✅ ${data.message}`);
              else alert(`❌ ${data.error || 'Failed to send'}`);
            }}
          >
            ✉️ Email Invoice
          </button>
          {state.error && (
            <span className="cms__status cms__status--err" role="alert">{state.error}</span>
          )}
          {state.ok && state.message && (
            <span className="cms__status cms__status--ok" role="status">{state.message}</span>
          )}
        </div>
      </form>
    </div>
  );
};

InvoiceEditor.propTypes = {
  order: PropTypes.object.isRequired,
  catalogue: PropTypes.array.isRequired,
};

export default InvoiceEditor;
