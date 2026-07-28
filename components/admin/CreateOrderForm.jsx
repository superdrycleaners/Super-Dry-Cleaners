'use client';

import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import PropTypes from 'prop-types';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';
import Select from '@/components/admin/ui/Select';

const CUSTOM_ITEM_VALUE = '__custom__';

const SERVICES = [
  'Dry cleaning',
  'Wash, Dry & Fold',
  'Ironing & Pressing',
  'Duvets & Bedding',
  'Curtains & Household',
  'Wedding Dress Cleaning',
  'Alterations & Repairs',
  'Commercial Laundry',
  'Bag & Shoe Cleaning',
  'Other',
];

const SLOTS = [
  '08:00–10:00',
  '10:00–12:00',
  '12:00–14:00',
  '14:00–16:00',
  '16:00–18:00',
  '18:00–20:00',
];

function parseCataloguePrice(priceStr) {
  if (!priceStr) return 0;
  const match = priceStr.replace(/[Ff]rom\s*/, '').match(/£?([\d.]+)/);
  if (!match) return 0;
  return Math.round(parseFloat(match[1]) * 100);
}

function penceToPounds(pence) {
  return (pence / 100).toFixed(2);
}

function poundsToPence(str) {
  const num = parseFloat(str.replace('£', '').trim());
  return Math.round((isNaN(num) ? 0 : num) * 100);
}

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
 * Admin form for manually creating a new order with customer details and
 * catalogue-based line items.
 *
 * @param {object} props
 * @param {Array} props.catalogue - Catalogue data from CMS.
 */
const CreateOrderForm = ({ catalogue }) => {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  // Customer fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState(SERVICES[0]);
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [city, setCity] = useState('Leicester');
  const [postcode, setPostcode] = useState('');
  const [date, setDate] = useState('');
  const [slot, setSlot] = useState(SLOTS[0]);
  const [notes, setNotes] = useState('');

  // Line items
  const [items, setItems] = useState([]);
  const catalogueOptions = useMemo(() => buildCatalogueOptions(catalogue), [catalogue]);

  const updateItem = (idx, key, value) => {
    const next = [...items];
    next[idx] = { ...next[idx], [key]: value };
    setItems(next);
  };

  const handleItemSelect = (idx, selectedValue) => {
    if (selectedValue === CUSTOM_ITEM_VALUE) {
      const next = [...items];
      next[idx] = { ...next[idx], isCustom: true, name: '', price: 0, catalogueId: '' };
      setItems(next);
      return;
    }
    const found = catalogueOptions.find((opt) => opt.id === selectedValue);
    if (found) {
      const next = [...items];
      next[idx] = { ...next[idx], name: found.name, price: found.price, isCustom: false, catalogueId: found.id };
      setItems(next);
    }
  };

  const addItem = () => setItems([...items, { name: '', qty: 1, price: 0, isCustom: false, catalogueId: '' }]);
  const removeItem = (idx) => setItems(items.filter((_, i) => i !== idx));

  const total = items.reduce((sum, item) => sum + (item.qty * item.price), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (pending) return;
    setError('');
    setPending(true);

    const body = {
      name, email, phone, service,
      address1, address2, city, postcode,
      date, slot, notes,
      lat: null, lng: null,
      items: items.map(({ name: n, qty, price }) => ({ name: n, qty, price })),
      total,
    };

    try {
      const res = await fetch('/api/admin/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Failed to create order.');
        return;
      }
      router.push(`/admin/orders/${data.id}`);
      router.refresh();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setPending(false);
    }
  };

  return (
    <form className="create-order-form" onSubmit={handleSubmit}>
      {error && <p className="admin-ui__alert" role="alert">{error}</p>}

      <h3 className="invoice-editor__section-title">Customer Details</h3>
      <div className="cms-form__grid">
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-name">Full Name *</label>
          <Input id="co-name" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-email">Email *</label>
          <Input id="co-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-phone">Phone *</label>
          <Input id="co-phone" value={phone} onChange={(e) => setPhone(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-service">Service *</label>
          <Select id="co-service" value={service} onChange={(e) => setService(e.target.value)}>
            {SERVICES.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-address1">Address Line 1 *</label>
          <Input id="co-address1" value={address1} onChange={(e) => setAddress1(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-address2">Address Line 2</label>
          <Input id="co-address2" value={address2} onChange={(e) => setAddress2(e.target.value)} />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-city">City *</label>
          <Input id="co-city" value={city} onChange={(e) => setCity(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-postcode">Postcode *</label>
          <Input id="co-postcode" value={postcode} onChange={(e) => setPostcode(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-date">Collection Date *</label>
          <Input id="co-date" type="text" placeholder="YYYY-MM-DD" value={date} onChange={(e) => setDate(e.target.value)} required />
        </div>
        <div className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor="co-slot">Time Slot *</label>
          <Select id="co-slot" value={slot} onChange={(e) => setSlot(e.target.value)}>
            {SLOTS.map((s) => <option key={s} value={s}>{s}</option>)}
          </Select>
        </div>
      </div>
      <div className="admin-ui__field" style={{ marginTop: '1rem' }}>
        <label className="admin-ui__field-label" htmlFor="co-notes">Notes</label>
        <Textarea id="co-notes" value={notes} rows={2} onChange={(e) => setNotes(e.target.value)} />
      </div>

      <h3 className="invoice-editor__section-title" style={{ marginTop: '2rem' }}>Line Items</h3>
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
                    <Input value={item.name} placeholder="Custom item name" onChange={(e) => updateItem(idx, 'name', e.target.value)} />
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      const next = [...items];
                      next[idx] = { ...next[idx], isCustom: false, catalogueId: '', name: '', price: 0 };
                      setItems(next);
                    }}>↩</Button>
                  </div>
                ) : (
                  <Select value={item.catalogueId || ''} onChange={(e) => handleItemSelect(idx, e.target.value)} aria-label={`Select item ${idx + 1}`}>
                    <option value="">— Select service —</option>
                    <option value={CUSTOM_ITEM_VALUE}>✏️ Custom / Other</option>
                    {catalogueOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>{opt.name} — £{penceToPounds(opt.price)} ({opt.group})</option>
                    ))}
                  </Select>
                )}
              </td>
              <td>
                <Input type="text" value={String(item.qty)} onChange={(e) => updateItem(idx, 'qty', Math.max(0, parseInt(e.target.value) || 0))} />
              </td>
              <td>
                <Input type="text" value={penceToPounds(item.price)} onChange={(e) => updateItem(idx, 'price', poundsToPence(e.target.value))} disabled={!item.isCustom && Boolean(item.catalogueId)} />
              </td>
              <td className="invoice-editor__subtotal">£{penceToPounds(item.qty * item.price)}</td>
              <td><Button type="button" variant="danger" size="sm" onClick={() => removeItem(idx)}>✕</Button></td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="invoice-editor__actions-row">
        <Button type="button" variant="ghost" size="sm" onClick={addItem}>+ Add item</Button>
      </div>

      <div className="invoice-editor__total">
        <span>Total:</span>
        <strong>£{penceToPounds(total)}</strong>
      </div>

      <div className="invoice-editor__footer">
        <Button type="submit" variant="primary" pending={pending}>
          {pending ? 'Creating…' : 'Create Order'}
        </Button>
      </div>
    </form>
  );
};

CreateOrderForm.propTypes = {
  catalogue: PropTypes.array.isRequired,
};

export default CreateOrderForm;
