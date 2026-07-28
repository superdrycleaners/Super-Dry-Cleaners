import PropTypes from 'prop-types';

/**
 * Admin-scoped semantic table with an intentionally scrollable narrow-viewport region.
 *
 * The wrapper is focusable so keyboard users can scroll a wide table without
 * changing the table's native semantics. Table labels remain on the native
 * table through `caption` or forwarded `aria-*` attributes.
 *
 * @param {object} props - Table configuration and forwarded table attributes.
 * @param {React.ReactNode} [props.caption] - Accessible caption for the table.
 * @param {React.ReactNode} props.children - Native table sections and rows.
 * @param {string} [props.className] - Additional classes appended to the table.
 * @param {string} [props.scrollLabel] - Accessible name for the scroll region.
 * @returns {JSX.Element} A focusable scroll wrapper containing a native table.
 */
const Table = ({
  caption,
  children,
  className = '',
  scrollLabel,
  ...otherProps
}) => {
  const tableClassName = ['admin-ui__table', className].filter(Boolean).join(' ');
  const derivedScrollLabel =
    scrollLabel ||
    (typeof caption === 'string' ? caption : undefined) ||
    otherProps['aria-label'];
  const regionProps = derivedScrollLabel
    ? { 'aria-label': derivedScrollLabel, role: 'region' }
    : {};

  return (
    <div
      {...regionProps}
      className="admin-ui__table-wrap"
      tabIndex={0}
    >
      <table {...otherProps} className={tableClassName}>
        {caption !== null && caption !== undefined ? (
          <caption>{caption}</caption>
        ) : null}
        {children}
      </table>
    </div>
  );
};

Table.propTypes = {
  caption: PropTypes.node,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  scrollLabel: PropTypes.string,
};

/**
 * Semantic table head containing column or row header rows.
 *
 * @param {object} props - Table head attributes and child rows.
 * @param {React.ReactNode} props.children - Header rows.
 * @param {string} [props.className] - Additional classes appended to the head.
 * @returns {JSX.Element} A native `thead` element.
 */
const TableHead = ({ children, className = '', ...otherProps }) => {
  const headClassName = ['admin-ui__table-head', className]
    .filter(Boolean)
    .join(' ');

  return (
    <thead {...otherProps} className={headClassName}>
      {children}
    </thead>
  );
};

TableHead.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Semantic table body containing the data rows.
 *
 * @param {object} props - Table body attributes and child rows.
 * @param {React.ReactNode} props.children - Data rows.
 * @param {string} [props.className] - Additional classes appended to the body.
 * @returns {JSX.Element} A native `tbody` element.
 */
const TableBody = ({ children, className = '', ...otherProps }) => {
  const bodyClassName = ['admin-ui__table-body', className]
    .filter(Boolean)
    .join(' ');

  return (
    <tbody {...otherProps} className={bodyClassName}>
      {children}
    </tbody>
  );
};

TableBody.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Semantic table row that preserves native table column relationships.
 *
 * @param {object} props - Table row attributes and cells.
 * @param {React.ReactNode} props.children - Header or data cells.
 * @param {string} [props.className] - Additional classes appended to the row.
 * @returns {JSX.Element} A native `tr` element.
 */
const TableRow = ({ children, className = '', ...otherProps }) => {
  const rowClassName = ['admin-ui__table-row', className]
    .filter(Boolean)
    .join(' ');

  return (
    <tr {...otherProps} className={rowClassName}>
      {children}
    </tr>
  );
};

TableRow.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

/**
 * Semantic table header cell with a column scope by default.
 *
 * @param {object} props - Header cell attributes and content.
 * @param {React.ReactNode} props.children - Header label.
 * @param {string} [props.className] - Additional classes appended to the cell.
 * @param {'col'|'row'|'colgroup'|'rowgroup'} [props.scope='col'] - Native header association.
 * @returns {JSX.Element} A native `th` element.
 */
const TableHeaderCell = ({
  children,
  className = '',
  scope = 'col',
  ...otherProps
}) => {
  const headerCellClassName = ['admin-ui__table-header-cell', className]
    .filter(Boolean)
    .join(' ');

  return (
    <th {...otherProps} className={headerCellClassName} scope={scope}>
      {children}
    </th>
  );
};

TableHeaderCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  scope: PropTypes.oneOf(['col', 'row', 'colgroup', 'rowgroup']),
};

/**
 * Semantic table data cell for escaped React content and interactive controls.
 *
 * @param {object} props - Data cell attributes and content.
 * @param {React.ReactNode} props.children - Cell content.
 * @param {string} [props.className] - Additional classes appended to the cell.
 * @returns {JSX.Element} A native `td` element.
 */
const TableCell = ({ children, className = '', ...otherProps }) => {
  const cellClassName = ['admin-ui__table-cell', className]
    .filter(Boolean)
    .join(' ');

  return (
    <td {...otherProps} className={cellClassName}>
      {children}
    </td>
  );
};

TableCell.propTypes = {
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
};

Table.Head = TableHead;
Table.Body = TableBody;
Table.Row = TableRow;
Table.HeaderCell = TableHeaderCell;
Table.Cell = TableCell;

export default Table;
