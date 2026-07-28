'use client';

import PropTypes from 'prop-types';

/**
 * Admin-scoped native select primitive.
 *
 * Native option selection is intentional so keyboard behavior and mobile
 * platform pickers remain available without a custom popover or client-side
 * storage layer.
 *
 * @param {object} props - Select configuration and forwarded select attributes.
 * @param {string} [props.id] - Optional identifier associated with a label.
 * @param {string} [props.name] - Optional native form field name.
 * @param {string} [props.value] - Controlled native select value.
 * @param {(event: import('react').ChangeEvent<HTMLSelectElement>) => void} [props.onChange] - Native change handler.
 * @param {boolean} [props.disabled=false] - Whether native selection is disabled.
 * @param {React.ReactNode} props.children - Native option elements.
 * @param {string} [props.className] - Additional classes appended to admin styles.
 * @returns {JSX.Element} A native, accessible select element.
 */
const Select = ({
  id,
  name,
  value,
  onChange,
  disabled = false,
  children,
  className = '',
  ...otherProps
}) => {
  const selectClassName = ['admin-ui__select', className]
    .filter(Boolean)
    .join(' ');

  return (
    <select
      {...otherProps}
      id={id}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      className={selectClassName}
    >
      {children}
    </select>
  );
};

Select.propTypes = {
  id: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.string,
  onChange: PropTypes.func,
  disabled: PropTypes.bool,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

export default Select;
