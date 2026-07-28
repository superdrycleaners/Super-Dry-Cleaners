'use client';

import PropTypes from 'prop-types';

const DEFAULT_INPUT_MAX_LENGTH = 10000;
const EMAIL_MAX_LENGTH = 254;
const PASSWORD_MAX_LENGTH = 256;
const HIDDEN_INPUT_MAX_LENGTH = 1000;

/**
 * Keep native input limits finite so client-side controls provide a bounded
 * editing surface without replacing authoritative server-side validation.
 *
 * @param {number|undefined} maxLength - Requested native maximum length.
 * @param {number} fallback - Default maximum for the input type.
 * @returns {number} A non-negative maximum within the primitive ceiling.
 */
const getBoundedMaxLength = (maxLength, fallback) => {
  if (!Number.isFinite(maxLength)) return fallback;
  return Math.min(Math.max(Math.trunc(maxLength), 0), DEFAULT_INPUT_MAX_LENGTH);
};

/**
 * Admin-scoped native input primitive for labeled form controls.
 *
 * Labels are associated by consumers through `htmlFor` and `id`, or through an
 * accessible `aria-label`/`aria-labelledby` attribute. Password values are
 * passed directly to the browser control and are never copied, rendered, or
 * persisted by this primitive.
 *
 * @param {object} props - Input configuration and forwarded input attributes.
 * @param {'email'|'password'|'hidden'|'text'} [props.type='text'] - Supported admin input type.
 * @param {string} [props.id] - Optional identifier associated with a label.
 * @param {string} [props.name] - Optional native form field name.
 * @param {string} [props.value] - Controlled native input value.
 * @param {string} [props.defaultValue] - Initial uncontrolled input value.
 * @param {number} [props.maxLength] - Requested maximum; capped by the primitive.
 * @param {boolean} [props.invalid=false] - Marks the control as invalid accessibly.
 * @param {boolean} [props.disabled=false] - Whether the control is disabled.
 * @param {string} [props.className] - Additional classes appended to admin styles.
 * @returns {JSX.Element} A native, admin-styled input element.
 */
const Input = ({
  type = 'text',
  id,
  name,
  value,
  defaultValue,
  maxLength,
  invalid = false,
  disabled = false,
  className = '',
  'aria-invalid': ariaInvalid,
  ...otherProps
}) => {
  const fallbackMaxLength =
    type === 'email'
      ? EMAIL_MAX_LENGTH
      : type === 'password'
        ? PASSWORD_MAX_LENGTH
        : type === 'hidden'
          ? HIDDEN_INPUT_MAX_LENGTH
          : DEFAULT_INPUT_MAX_LENGTH;
  const boundedMaxLength = getBoundedMaxLength(maxLength, fallbackMaxLength);
  const inputClassName = ['admin-ui__input', className].filter(Boolean).join(' ');

  return (
    <input
      {...otherProps}
      type={type}
      id={id}
      name={name}
      value={value}
      defaultValue={defaultValue}
      maxLength={boundedMaxLength}
      disabled={disabled}
      aria-invalid={invalid ? true : ariaInvalid}
      className={inputClassName}
    />
  );
};

Input.propTypes = {
  type: PropTypes.oneOf(['email', 'password', 'hidden', 'text']),
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  defaultValue: PropTypes.string,
  maxLength: PropTypes.number,
  invalid: PropTypes.bool,
  disabled: PropTypes.bool,
  className: PropTypes.string,
  'aria-invalid': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default Input;
