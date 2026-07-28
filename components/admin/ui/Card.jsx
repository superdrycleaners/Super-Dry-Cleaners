import PropTypes from 'prop-types';

/**
 * Admin-scoped grouping surface for panels, forms, and related content.
 *
 * The root and its parts only provide layout classes. Consumers choose the
 * appropriate semantic element through `as`, so headings and descriptions
 * keep their meaning in the surrounding document structure.
 *
 * @param {object} props - Card configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='div'] - Root element used for the grouping surface.
 * @param {React.ReactNode} props.children - Card content.
 * @param {string} [props.className] - Additional classes appended to the card classes.
 * @returns {JSX.Element} A semantic, admin-styled grouping surface.
 */
const Card = ({ as: Element = 'div', children, className = '', ...otherProps }) => {
  const cardClassName = ['admin-ui__card', className].filter(Boolean).join(' ');

  return (
    <Element {...otherProps} className={cardClassName}>
      {children}
    </Element>
  );
};

Card.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Layout-only header region for a Card.
 *
 * @param {object} props - Header configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='div'] - Element used for the header region.
 * @param {React.ReactNode} props.children - Header content.
 * @param {string} [props.className] - Additional classes appended to the header classes.
 * @returns {JSX.Element} A layout-only Card header.
 */
const CardHeader = ({ as: Element = 'div', children, className = '', ...otherProps }) => {
  const headerClassName = ['admin-ui__card-header', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element {...otherProps} className={headerClassName}>
      {children}
    </Element>
  );
};

CardHeader.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Layout-only title wrapper for a Card.
 *
 * Consumers select the heading level with `as` when the title represents a
 * document heading; the default is a heading so its meaning is explicit.
 *
 * @param {object} props - Title configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='h3'] - Element used for the title.
 * @param {React.ReactNode} props.children - Title content.
 * @param {string} [props.className] - Additional classes appended to the title classes.
 * @returns {JSX.Element} A Card title element.
 */
const CardTitle = ({ as: Element = 'h3', children, className = '', ...otherProps }) => {
  const titleClassName = ['admin-ui__card-title', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element {...otherProps} className={titleClassName}>
      {children}
    </Element>
  );
};

CardTitle.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Layout-only descriptive text wrapper for a Card.
 *
 * @param {object} props - Description configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='p'] - Element used for the description.
 * @param {React.ReactNode} props.children - Description content.
 * @param {string} [props.className] - Additional classes appended to the description classes.
 * @returns {JSX.Element} A Card description element.
 */
const CardDescription = ({
  as: Element = 'p',
  children,
  className = '',
  ...otherProps
}) => {
  const descriptionClassName = ['admin-ui__card-description', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element {...otherProps} className={descriptionClassName}>
      {children}
    </Element>
  );
};

CardDescription.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Layout-only content region for a Card.
 *
 * @param {object} props - Content configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='div'] - Element used for the content region.
 * @param {React.ReactNode} props.children - Main Card content.
 * @param {string} [props.className] - Additional classes appended to the content classes.
 * @returns {JSX.Element} A Card content region.
 */
const CardContent = ({ as: Element = 'div', children, className = '', ...otherProps }) => {
  const contentClassName = ['admin-ui__card-content', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element {...otherProps} className={contentClassName}>
      {children}
    </Element>
  );
};

CardContent.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Layout-only action region for a Card.
 *
 * @param {object} props - Footer configuration and forwarded element attributes.
 * @param {React.ElementType} [props.as='div'] - Element used for the footer region.
 * @param {React.ReactNode} props.children - Footer content.
 * @param {string} [props.className] - Additional classes appended to the footer classes.
 * @returns {JSX.Element} A Card footer region.
 */
const CardFooter = ({ as: Element = 'div', children, className = '', ...otherProps }) => {
  const footerClassName = ['admin-ui__card-footer', className]
    .filter(Boolean)
    .join(' ');

  return (
    <Element {...otherProps} className={footerClassName}>
      {children}
    </Element>
  );
};

CardFooter.propTypes = {
  as: PropTypes.elementType,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
