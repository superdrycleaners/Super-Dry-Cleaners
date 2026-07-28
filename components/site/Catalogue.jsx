'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Reveal from './Reveal';

/**
 * Filterable price catalogue.
 *
 * Renders category tabs plus grouped price lists. Filtering is client-side
 * over the already-fetched groups (the data itself comes from the CMS layer
 * on the server and is passed in as props).
 *
 * @param {object} props
 * @param {Array<object>} props.groups - Catalogue groups, each with id, title,
 *   note, optional `wide`, and an `items` array of { name, sub?, price,
 *   priceSuffix?, feature? }.
 */
const Catalogue = ({ groups }) => {
  const [filter, setFilter] = useState('all');

  const tabs = [
    { id: 'all', label: 'All' },
    ...groups.map((g) => ({ id: g.id, label: g.title })),
  ];

  return (
    <>
      <div className="cat__tabs" role="tablist" aria-label="Catalogue categories">
        {tabs.map((tab) => {
          const active = filter === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              role="tab"
              aria-selected={active}
              className={`cat__tab${active ? ' is-active' : ''}`}
              onClick={() => setFilter(tab.id)}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="cat">
        {groups.map((group) => {
          const hidden = filter !== 'all' && filter !== group.id;
          return (
            <Reveal
              key={group.id}
              className={`cat__group${group.wide ? ' cat__group--wide' : ''}${group.id === 'offers' ? ' cat__group--offers' : ''}${hidden ? ' is-hidden' : ''}`}
              data-cat={group.id}
            >
              <div className="cat__grouphead">
                <h3>{group.title}</h3>
                <span>{group.note}</span>
              </div>
              <ul className="cat__list">
                {group.items.map((item) => (
                  <li
                    key={item.name}
                    className={`cat__row${item.feature ? ' cat__row--feature' : ''}`}
                  >
                    <span className="cat__name">
                      {item.name}
                      {item.sub && <small>{item.sub}</small>}
                    </span>
                    <span className="cat__dots" />
                    <span className="cat__price">
                      {item.price}
                      {item.priceSuffix && <small>{item.priceSuffix}</small>}
                    </span>
                  </li>
                ))}
              </ul>
            </Reveal>
          );
        })}
      </div>
    </>
  );
};

Catalogue.propTypes = {
  groups: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
      note: PropTypes.string,
      wide: PropTypes.bool,
      items: PropTypes.arrayOf(
        PropTypes.shape({
          name: PropTypes.string.isRequired,
          sub: PropTypes.string,
          price: PropTypes.string.isRequired,
          priceSuffix: PropTypes.string,
          feature: PropTypes.bool,
        }),
      ).isRequired,
    }),
  ).isRequired,
};

export default Catalogue;
