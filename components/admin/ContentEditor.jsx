'use client';

import { useState } from 'react';
import { useFormState, useFormStatus } from 'react-dom';
import PropTypes from 'prop-types';
import { saveContentSection } from '@/app/admin/(dashboard)/actions';
import Button from '@/components/admin/ui/Button';
import Input from '@/components/admin/ui/Input';
import Textarea from '@/components/admin/ui/Textarea';

/** Initial state for the save action. */
const INITIAL_STATE = { ok: false };

/**
 * Internal submit button that reads pending state from the form.
 *
 * useFormStatus must be called inside the form, so the submit button is its
 * own component. While pending, it exposes aria-busy and prevents duplicates.
 *
 * @param {object} props
 * @param {boolean} props.disabled - Whether the button is disabled (invalid JSON).
 */
function SubmitButton({ disabled }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="primary"
      disabled={disabled}
      pending={pending}
    >
      {pending ? 'Saving…' : 'Save changes'}
    </Button>
  );
}

SubmitButton.propTypes = {
  disabled: PropTypes.bool.isRequired,
};

/**
 * Structured JSON editor for a CMS content section.
 *
 * Content sections vary in shape (objects, arrays of cards, nested pricing),
 * so the editor exposes the section as formatted, editable JSON with live
 * client-side validation before submitting to the `saveContentSection` server
 * action (which re-validates and persists). This keeps a single, reliable
 * editing surface for every section.
 *
 * @param {object} props
 * @param {string} props.section - The content section key being edited.
 * @param {*} props.value - Current value of the section.
 */
const ContentEditor = ({ section, value }) => {
  const [state, formAction] = useFormState(saveContentSection, INITIAL_STATE);
  const [text, setText] = useState(() => JSON.stringify(value, null, 2));
  const [jsonError, setJsonError] = useState('');

  /**
   * Validate JSON as the admin types, so errors surface before saving.
   * @param {import('react').ChangeEvent<HTMLTextAreaElement>} e - Change event.
   */
  const handleChange = (e) => {
    const next = e.target.value;
    setText(next);
    try {
      JSON.parse(next);
      setJsonError('');
    } catch {
      setJsonError('Not valid JSON yet…');
    }
  };

  /**
   * Re-indent the JSON for readability (Tidy JSON).
   */
  const handleFormat = () => {
    try {
      setText(JSON.stringify(JSON.parse(text), null, 2));
      setJsonError('');
    } catch {
      setJsonError('Cannot format — invalid JSON.');
    }
  };

  const disabled = Boolean(jsonError);

  return (
    <form className="cms__editor" action={formAction}>
      {/* Hidden fields carry section key and current JSON to the server action. */}
      <Input type="hidden" name="section" value={section} />
      <Input type="hidden" name="payload" value={text} />

      <div className="admin-ui__field">
        <label htmlFor="content-json" className="admin-ui__field-label">
          Section data (JSON)
        </label>
        <Textarea
          id="content-json"
          value={text}
          onChange={handleChange}
          spellCheck={false}
          rows={22}
          invalid={Boolean(jsonError)}
          aria-describedby="json-hint json-error"
          style={{ fontFamily: 'ui-monospace, SFMono-Regular, Menlo, monospace', fontSize: '0.85rem' }}
        />
        <span id="json-hint" className="cms__hint">
          Edit values between the quotes. Keep the structure (keys, brackets) intact.
        </span>
      </div>

      <div className="cms__bar">
        <SubmitButton disabled={disabled} />
        <Button type="button" variant="ghost" onClick={handleFormat}>
          Tidy JSON
        </Button>

        {/* Live parse feedback — role="alert" so AT announces validation issues */}
        {jsonError && (
          <span id="json-error" className="cms__status cms__status--err" role="alert">
            {jsonError}
          </span>
        )}

        {/* Server-side error (not a parse issue) */}
        {!jsonError && state.error && (
          <span className="cms__status cms__status--err" role="alert">
            {state.error}
          </span>
        )}

        {/* Successful save — role="status" for polite announcement */}
        {!jsonError && state.ok && state.message && (
          <span className="cms__status cms__status--ok" role="status">
            {state.message}
          </span>
        )}
      </div>
    </form>
  );
};

ContentEditor.propTypes = {
  section: PropTypes.string.isRequired,
  // Value shape varies per section, so any JSON-serializable value is allowed.
  // eslint-disable-next-line react/forbid-prop-types
  value: PropTypes.any.isRequired,
};

export default ContentEditor;
