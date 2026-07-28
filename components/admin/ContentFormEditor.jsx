'use client';

import { useState, useCallback } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import PropTypes from 'prop-types';
import { saveContentSection } from '@/app/admin/(dashboard)/actions';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';

/** Initial state for the save action. */
const INITIAL_STATE = { ok: false };

/**
 * Submit button that reads pending state from the parent form.
 */
function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="primary" pending={pending}>
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  );
}

/* ─── Section-specific form renderers ─────────────────────────────────── */

/**
 * Brand section: flat key/value fields.
 */
function BrandForm({ data, onChange }) {
  const fields = [
    { key: 'name', label: 'Business Name' },
    { key: 'email', label: 'Email Address' },
    { key: 'phone', label: 'Phone (display)', placeholder: '07889 693265' },
    { key: 'phoneHref', label: 'Phone (link format)', placeholder: '+447889693265' },
    { key: 'phoneLandline', label: 'Landline' },
    { key: 'whatsapp', label: 'WhatsApp Number (no +)', placeholder: '447889693265' },
    { key: 'website', label: 'Website' },
    { key: 'address', label: 'Address' },
    { key: 'tagline', label: 'Tagline / Slogan' },
    { key: 'footerText', label: 'Footer Description' },
    { key: 'copyright', label: 'Copyright Text' },
    { key: 'openingHours', label: 'Opening Hours' },
    { key: 'closedDay', label: 'Closed Day' },
    { key: 'freeDeliveryThreshold', label: 'Free Delivery Threshold', placeholder: '£25' },
    { key: 'areasServed', label: 'Areas Served (separated by ·)' },
  ];

  return (
    <div className="cms-form__grid">
      {fields.map((f) => (
        <div key={f.key} className="admin-ui__field">
          <label className="admin-ui__field-label" htmlFor={`brand-${f.key}`}>{f.label}</label>
          <Input
            id={`brand-${f.key}`}
            value={data[f.key] || ''}
            placeholder={f.placeholder || ''}
            onChange={(e) => onChange({ ...data, [f.key]: e.target.value })}
          />
        </div>
      ))}
    </div>
  );
}

BrandForm.propTypes = {
  data: PropTypes.object.isRequired,
  onChange: PropTypes.func.isRequired,
};

/**
 * Home section: headline fields + stats list.
 */
function HomeForm({ data, onChange }) {
  const updateField = (key, val) => onChange({ ...data, [key]: val });
  const updateStat = (idx, key, val) => {
    const stats = [...data.stats];
    stats[idx] = { ...stats[idx], [key]: val };
    onChange({ ...data, stats });
  };
  const addStat = () => onChange({ ...data, stats: [...data.stats, { value: '', label: '' }] });
  const removeStat = (idx) => onChange({ ...data, stats: data.stats.filter((_, i) => i !== idx) });

  const textFields = [
    { key: 'eyebrow', label: 'Eyebrow text' },
    { key: 'title', label: 'Main headline' },
    { key: 'ctaBooking', label: 'Booking button text' },
    { key: 'ctaPricing', label: 'Pricing button text' },
    { key: 'ctaWhatsapp', label: 'WhatsApp button text' },
    { key: 'processEyebrow', label: 'Process section eyebrow' },
    { key: 'processTitle', label: 'Process section title' },
    { key: 'servicesEyebrow', label: 'Services section eyebrow' },
    { key: 'servicesTitle', label: 'Services section title' },
    { key: 'pricingEyebrow', label: 'Pricing section eyebrow' },
    { key: 'pricingTitle', label: 'Pricing section title' },
    { key: 'pricingFooter', label: 'Pricing footer text' },
    { key: 'bookingEyebrow', label: 'Booking section eyebrow' },
    { key: 'bookingTitle', label: 'Booking section title' },
  ];

  const textareaFields = [
    { key: 'lede', label: 'Intro paragraph' },
    { key: 'processIntro', label: 'Process section intro' },
    { key: 'servicesIntro', label: 'Services section intro' },
    { key: 'pricingIntro', label: 'Pricing section intro' },
    { key: 'bookingIntro', label: 'Booking section intro' },
  ];

  return (
    <div className="cms-form__stack">
      {textFields.map((f) => (
        <div key={f.key} className="admin-ui__field">
          <label className="admin-ui__field-label">{f.label}</label>
          <Input value={data[f.key] || ''} onChange={(e) => updateField(f.key, e.target.value)} />
        </div>
      ))}
      {textareaFields.map((f) => (
        <div key={f.key} className="admin-ui__field">
          <label className="admin-ui__field-label">{f.label}</label>
          <Textarea value={data[f.key] || ''} rows={2} onChange={(e) => updateField(f.key, e.target.value)} />
        </div>
      ))}
      <fieldset className="cms-form__fieldset">
        <legend className="admin-ui__field-label">Stats</legend>
        {data.stats?.map((stat, idx) => (
          <div key={idx} className="cms-form__row">
            <Input placeholder="Value (e.g. 20+)" value={stat.value} onChange={(e) => updateStat(idx, 'value', e.target.value)} />
            <Input placeholder="Label (e.g. Years)" value={stat.label} onChange={(e) => updateStat(idx, 'label', e.target.value)} />
            <Button type="button" variant="danger" size="sm" onClick={() => removeStat(idx)}>✕</Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={addStat}>+ Add stat</Button>
      </fieldset>
    </div>
  );
}

HomeForm.propTypes = { data: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/**
 * Steps section: ordered list of step cards.
 */
function StepsForm({ data, onChange }) {
  const update = (idx, key, val) => {
    const next = [...data];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };
  const add = () => onChange([...data, { title: '', body: '' }]);
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx));

  return (
    <div className="cms-form__stack">
      {data.map((step, idx) => (
        <fieldset key={idx} className="cms-form__fieldset">
          <legend className="admin-ui__field-label">Step {idx + 1}</legend>
          <div className="admin-ui__field">
            <label className="admin-ui__field-label" htmlFor={`step-title-${idx}`}>Title</label>
            <Input id={`step-title-${idx}`} value={step.title} onChange={(e) => update(idx, 'title', e.target.value)} />
          </div>
          <div className="admin-ui__field">
            <label className="admin-ui__field-label" htmlFor={`step-body-${idx}`}>Description</label>
            <Textarea id={`step-body-${idx}`} value={step.body} rows={2} onChange={(e) => update(idx, 'body', e.target.value)} />
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => remove(idx)}>Remove step</Button>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add}>+ Add step</Button>
    </div>
  );
}

StepsForm.propTypes = { data: PropTypes.array.isRequired, onChange: PropTypes.func.isRequired };

/**
 * Services section: list of service cards.
 */
function ServicesForm({ data, onChange }) {
  const update = (idx, key, val) => {
    const next = [...data];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };
  const add = () => onChange([...data, { num: String(data.length + 1).padStart(2, '0'), title: '', body: '' }]);
  const remove = (idx) => onChange(data.filter((_, i) => i !== idx));

  return (
    <div className="cms-form__stack">
      {data.map((svc, idx) => (
        <fieldset key={idx} className="cms-form__fieldset">
          <legend className="admin-ui__field-label">{svc.num} — {svc.title || 'New service'}</legend>
          <div className="cms-form__row">
            <div className="admin-ui__field" style={{ maxWidth: '5rem' }}>
              <label className="admin-ui__field-label" htmlFor={`svc-num-${idx}`}>#</label>
              <Input id={`svc-num-${idx}`} value={svc.num} onChange={(e) => update(idx, 'num', e.target.value)} />
            </div>
            <div className="admin-ui__field" style={{ flex: 1 }}>
              <label className="admin-ui__field-label" htmlFor={`svc-title-${idx}`}>Title</label>
              <Input id={`svc-title-${idx}`} value={svc.title} onChange={(e) => update(idx, 'title', e.target.value)} />
            </div>
          </div>
          <div className="admin-ui__field">
            <label className="admin-ui__field-label" htmlFor={`svc-body-${idx}`}>Description</label>
            <Textarea id={`svc-body-${idx}`} value={svc.body} rows={2} onChange={(e) => update(idx, 'body', e.target.value)} />
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => remove(idx)}>Remove</Button>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add}>+ Add service</Button>
    </div>
  );
}

ServicesForm.propTypes = { data: PropTypes.array.isRequired, onChange: PropTypes.func.isRequired };

/**
 * Catalogue section: groups with items (pricing tables).
 */
function CatalogueForm({ data, onChange }) {
  const updateGroup = (gIdx, key, val) => {
    const next = [...data];
    next[gIdx] = { ...next[gIdx], [key]: val };
    onChange(next);
  };
  const updateItem = (gIdx, iIdx, key, val) => {
    const next = [...data];
    const items = [...next[gIdx].items];
    items[iIdx] = { ...items[iIdx], [key]: val };
    next[gIdx] = { ...next[gIdx], items };
    onChange(next);
  };
  const addItem = (gIdx) => {
    const next = [...data];
    next[gIdx] = { ...next[gIdx], items: [...next[gIdx].items, { name: '', price: '' }] };
    onChange(next);
  };
  const removeItem = (gIdx, iIdx) => {
    const next = [...data];
    next[gIdx] = { ...next[gIdx], items: next[gIdx].items.filter((_, i) => i !== iIdx) };
    onChange(next);
  };

  return (
    <div className="cms-form__stack">
      {data.map((group, gIdx) => (
        <fieldset key={group.id || gIdx} className="cms-form__fieldset">
          <legend className="admin-ui__field-label">{group.title || 'Group'}</legend>
          <div className="cms-form__row">
            <div className="admin-ui__field" style={{ flex: 1 }}>
              <label className="admin-ui__field-label">Title</label>
              <Input value={group.title || ''} onChange={(e) => updateGroup(gIdx, 'title', e.target.value)} />
            </div>
            <div className="admin-ui__field" style={{ flex: 1 }}>
              <label className="admin-ui__field-label">Note</label>
              <Input value={group.note || ''} onChange={(e) => updateGroup(gIdx, 'note', e.target.value)} />
            </div>
          </div>
          <table className="cms-form__table">
            <thead>
              <tr><th>Item name</th><th>Price</th><th></th></tr>
            </thead>
            <tbody>
              {group.items?.map((item, iIdx) => (
                <tr key={iIdx}>
                  <td><Input value={item.name} onChange={(e) => updateItem(gIdx, iIdx, 'name', e.target.value)} /></td>
                  <td><Input value={item.price} onChange={(e) => updateItem(gIdx, iIdx, 'price', e.target.value)} /></td>
                  <td><Button type="button" variant="danger" size="sm" onClick={() => removeItem(gIdx, iIdx)}>✕</Button></td>
                </tr>
              ))}
            </tbody>
          </table>
          <Button type="button" variant="ghost" size="sm" onClick={() => addItem(gIdx)}>+ Add item</Button>
        </fieldset>
      ))}
    </div>
  );
}

CatalogueForm.propTypes = { data: PropTypes.array.isRequired, onChange: PropTypes.func.isRequired };

/**
 * About section: story + features.
 */
function AboutForm({ data, onChange }) {
  const updateField = (key, val) => onChange({ ...data, [key]: val });
  const updateFeature = (idx, key, val) => {
    const features = [...data.features];
    features[idx] = { ...features[idx], [key]: val };
    onChange({ ...data, features });
  };
  const addFeature = () => onChange({ ...data, features: [...data.features, { title: '', body: '' }] });
  const removeFeature = (idx) => onChange({ ...data, features: data.features.filter((_, i) => i !== idx) });

  return (
    <div className="cms-form__stack">
      <div className="admin-ui__field">
        <label className="admin-ui__field-label">Title</label>
        <Input value={data.title || ''} onChange={(e) => updateField('title', e.target.value)} />
      </div>
      <div className="admin-ui__field">
        <label className="admin-ui__field-label">Intro</label>
        <Textarea value={data.intro || ''} rows={3} onChange={(e) => updateField('intro', e.target.value)} />
      </div>
      <fieldset className="cms-form__fieldset">
        <legend className="admin-ui__field-label">Features / Promises</legend>
        {data.features?.map((f, idx) => (
          <div key={idx} className="cms-form__row cms-form__row--stack">
            <Input placeholder="Title" value={f.title} onChange={(e) => updateFeature(idx, 'title', e.target.value)} />
            <Textarea placeholder="Description" value={f.body} rows={2} onChange={(e) => updateFeature(idx, 'body', e.target.value)} />
            <Button type="button" variant="danger" size="sm" onClick={() => removeFeature(idx)}>Remove</Button>
          </div>
        ))}
        <Button type="button" variant="ghost" size="sm" onClick={addFeature}>+ Add feature</Button>
      </fieldset>
    </div>
  );
}

AboutForm.propTypes = { data: PropTypes.object.isRequired, onChange: PropTypes.func.isRequired };

/**
 * Testimonials section: multiple quotes managed as a list.
 */
function TestimonialForm({ data, onChange }) {
  const testimonials = Array.isArray(data) ? data : [data];
  const update = (idx, key, val) => {
    const next = [...testimonials];
    next[idx] = { ...next[idx], [key]: val };
    onChange(next);
  };
  const add = () => onChange([...testimonials, { quote: '', author: '', location: '' }]);
  const remove = (idx) => onChange(testimonials.filter((_, i) => i !== idx));

  return (
    <div className="cms-form__stack">
      {testimonials.map((t, idx) => (
        <fieldset key={idx} className="cms-form__fieldset">
          <legend className="admin-ui__field-label">Testimonial {idx + 1}</legend>
          <div className="admin-ui__field">
            <label className="admin-ui__field-label">Quote</label>
            <Textarea value={t.quote || ''} rows={3} onChange={(e) => update(idx, 'quote', e.target.value)} />
          </div>
          <div className="cms-form__row">
            <div className="admin-ui__field" style={{ flex: 1 }}>
              <label className="admin-ui__field-label">Author</label>
              <Input value={t.author || ''} onChange={(e) => update(idx, 'author', e.target.value)} />
            </div>
            <div className="admin-ui__field" style={{ flex: 1 }}>
              <label className="admin-ui__field-label">Location</label>
              <Input value={t.location || ''} onChange={(e) => update(idx, 'location', e.target.value)} />
            </div>
          </div>
          <Button type="button" variant="danger" size="sm" onClick={() => remove(idx)}>Remove</Button>
        </fieldset>
      ))}
      <Button type="button" variant="ghost" size="sm" onClick={add}>+ Add testimonial</Button>
    </div>
  );
}

TestimonialForm.propTypes = { data: PropTypes.oneOfType([PropTypes.array, PropTypes.object]).isRequired, onChange: PropTypes.func.isRequired };

/* ─── Form registry ───────────────────────────────────────────────────── */

const FORM_REGISTRY = {
  brand: BrandForm,
  home: HomeForm,
  steps: StepsForm,
  services: ServicesForm,
  catalogue: CatalogueForm,
  about: AboutForm,
  testimonials: TestimonialForm,
};

/* ─── Main editor component ───────────────────────────────────────────── */

/**
 * Form-based CMS editor that renders user-friendly fields instead of raw JSON.
 *
 * The form still submits the same `section` + `payload` (JSON string) contract
 * to the `saveContentSection` server action, so validation and persistence
 * remain unchanged.
 *
 * @param {object} props
 * @param {string} props.section - Content section key.
 * @param {*} props.value - Current section value.
 */
const ContentFormEditor = ({ section, value }) => {
  const [state, formAction] = useFormState(saveContentSection, INITIAL_STATE);
  const [data, setData] = useState(value);

  const handleChange = useCallback((newData) => setData(newData), []);

  const FormComponent = FORM_REGISTRY[section];
  const payload = JSON.stringify(data);

  return (
    <form className="cms__editor" action={formAction}>
      <Input type="hidden" name="section" value={section} />
      <Input type="hidden" name="payload" value={payload} />

      {FormComponent ? (
        <FormComponent data={data} onChange={handleChange} />
      ) : (
        <p>No form editor available for this section. Contact your developer.</p>
      )}

      <div className="cms__bar">
        <SubmitButton />
        {state.error && (
          <span className="cms__status cms__status--err" role="alert">{state.error}</span>
        )}
        {state.ok && state.message && (
          <span className="cms__status cms__status--ok" role="status">{state.message}</span>
        )}
      </div>
    </form>
  );
};

ContentFormEditor.propTypes = {
  section: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};

export default ContentFormEditor;
