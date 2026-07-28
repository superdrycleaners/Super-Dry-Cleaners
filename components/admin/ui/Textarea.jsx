'use client';

import PropTypes from 'prop-types';

const DEFAULT_TEXTAREA_MAX_LENGTH = 100000;
const MAX_TEXTAREA_ROWS = 100;

/**
 * Clamp textarea dimensions and payload length to finite browser-friendly
 * values. Server validation remains authoritative for CMS content.
 *
 * @param {number|undefined} value - Requested numeric value.
 * @param {number} fallback - Value used when the request is not finite.
 * @param {number} maximum - Inclusive upper bound.
 * @returns {number} A bounded non-negative integer.
 */
const getBoundedNumber = (value, fallback, maximum) => {
  if (!Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.trunc(value), 0), maximum);
};

/**
 * Admin-scoped native multiline control for labeled CMS and text entry.
 *
 * Labels are associated by consumers through `htmlFor` and `id`, or through an
 * accessible `aria-label`/`aria-labelledby` attribute. Text is kept in native
 * form state and bounded for usability; no value is copied to storage, logs,
 * URLs, telemetry, or client-visible error details by this primitive.
 *
 * @param {object} props - Textarea configuration and forwarded attributes.
 * @param {string} [props.id] - Optional identifier associated with a label.
 * @param {string} [props.name] - Optional native form field name.
 * @param {string} [props.value] - Controlled native textarea value.
 * @param {string} [props.defaultValue] - Initial uncontrolled textarea value.
 * @param {number} [props.rows=4] - Visible row count, bounded to 100.
 * @param {number} [props.maxLength] - Maximum payload length, capped at 100,000.
 * @param {boolean|string} [props.spellCheck] - Native spell-check preference.
 * @param {boolean} [props.invalid=false] - Marks the control as invalid accessibly.
 * @param {boolean} [props.disabled=false] - Whether multiline editing is disabled.
 * @param {string} [props.className] - Additional classes appended to admin styles.
 * @returns {JSX.Element} A native, admin-styled textarea element.
 */
const Textarea = ({
  id,
  name,
  value,
  defaultValue,
  rows = 4,
  maxLength,
  spellCheck,
  invalid = false,
  disabled = false,
  className = '',
  'aria-invalid': ariaInvalid,
  ...otherProps
}) => {
  const boundedRows = getBoundedNumber(rows, 4, MAX_TEXTAREA_ROWS);
  const boundedMaxLength = getBoundedNumber(
    maxLength,
    DEFAULT_TEXTAREA_MAX_LENGTH,
    DEFAULT_TEXTAREA_MAX_LENGTH
  );
  const textareaClassName = ['admin-ui__textarea', className]
    .filter(Boolean)
    .join(' ');

  return (
    <textarea
      {...otherProps}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      rows={boundedRows}
      maxLength={boundedMaxLength}
      spellCheck={spellCheck}
      disabled={disabled}
      aria-invalid={invalid ? true : ariaInvalid}
      className={textareaClassName}
    />
  );
};

Textarea.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  rows: PropTypes.number,
  maxLength: PropTypes.number,
  spellCheck: PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  'aria-invalid': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default Textarea;
