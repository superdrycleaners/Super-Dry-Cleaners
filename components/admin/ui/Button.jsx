'use client';

import PropTypes from 'prop-types';

/**
 * Admin-scoped native button primitive with consistent visual variants and
 * accessible disabled and pending states.
 *
 * Pending content is supplied by the consumer so actions can retain meaningful
 * labels such as "Signing in…" or "Saving…" while duplicate submissions are
 * prevented through the native disabled state.
 *
 * @param {object} props - Button configuration and forwarded button attributes.
 * @param {'primary'|'secondary'|'ghost'|'danger'|'link'} [props.variant='primary'] - Visual treatment.
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size.
 * @param {'button'|'submit'|'reset'} [props.type='button'] - Native button type.
 * @param {boolean} [props.disabled=false] - Permanently disables the button.
 * @param {boolean} [props.pending=false] - Disables the button and exposes an in-progress state.
 * @param {React.ReactNode} props.children - Consumer-supplied button content and pending label.
 * @param {string} [props.className] - Additional classes appended to the admin button classes.
 * @returns {JSX.Element} A native admin button element.
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  type = 'button',
  disabled = false,
  pending = false,
  children,
  className = '',
  'aria-disabled': ariaDisabled,
  'aria-busy': ariaBusy,
  ...otherProps
}) => {
  const isDisabled = disabled || pending;
  const buttonClassName = [
    'admin-ui__button',
    `admin-ui__button--${variant}`,
    `admin-ui__button--${size}`,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      {...otherProps}
      type={type}
      className={buttonClassName}
      disabled={isDisabled}
      aria-disabled={isDisabled ? true : ariaDisabled}
      aria-busy={pending ? true : ariaBusy}
    >
      {children}
    </button>
  );
};

Button.propTypes = {
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost', 'danger', 'link']),
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  disabled: PropTypes.bool,
  pending: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  'aria-disabled': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
  'aria-busy': PropTypes.oneOfType([PropTypes.bool, PropTypes.string]),
};

export default Button;
