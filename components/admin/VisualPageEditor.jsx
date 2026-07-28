'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import Card from '@/components/admin/ui/Card';
import ContentFormEditor from '@/components/admin/ContentFormEditor';

/**
 * Section order matching the public site layout hierarchy.
 * Each entry has a key, a user-friendly title, and a description
 * of where it appears on the live website.
 */
const SITE_SECTIONS = [
  { key: 'brand', title: 'Brand & Contact', description: 'Navigation bar, footer, and business details.' },
  { key: 'home', title: 'Hero Section', description: 'The main headline, intro text, and stats visitors see first.' },
  { key: 'steps', title: 'How It Works', description: 'The 4-step process cards below the hero.' },
  { key: 'services', title: 'Our Services', description: 'Service cards shown in the services section.' },
  { key: 'catalogue', title: 'Pricing & Offers', description: 'All pricing tables and special offers.' },
  { key: 'about', title: 'About Us', description: 'The story, promises, and features in the dark section.' },
  { key: 'testimonials', title: 'Customer Testimonials', description: 'Rotating customer quotes displayed in the carousel before the booking form.' },
];

/**
 * A single collapsible section card in the visual page editor.
 */
function SectionCard({ sectionKey, title, description, value }) {
  const [open, setOpen] = useState(false);

  return (
    <Card className="cms-visual__card">
      <Card.Header
        className="cms-visual__header"
        onClick={() => setOpen((v) => !v)}
        style={{ cursor: 'pointer' }}
      >
        <div className="cms-visual__header-content">
          <Card.Title as="h3" className="cms-visual__title">
            {title}
          </Card.Title>
          <Card.Description>{description}</Card.Description>
        </div>
        <span className={`cms-visual__chevron ${open ? 'cms-visual__chevron--open' : ''}`}>
          ▾
        </span>
      </Card.Header>
      {open && (
        <Card.Content>
          <ContentFormEditor section={sectionKey} value={value} />
        </Card.Content>
      )}
    </Card>
  );
}

SectionCard.propTypes = {
  sectionKey: PropTypes.string.isRequired,
  title: PropTypes.string.isRequired,
  description: PropTypes.string.isRequired,
  value: PropTypes.any.isRequired,
};

/**
 * Visual page editor: single scrolling page mirroring the public site layout.
 *
 * Each section appears as a collapsible card in the same order visitors see
 * on the live website. The admin expands a section to edit it and saves
 * independently per section.
 *
 * @param {object} props
 * @param {object} props.content - Full CMS content object keyed by section.
 */
const VisualPageEditor = ({ content }) => {
  return (
    <div className="cms-visual">
      <div className="cms-visual__page-label">
        <span className="cms-visual__dot" /> Live website layout — top to bottom
      </div>
      {SITE_SECTIONS.map((section) => {
        const value = content[section.key];
        if (!value) return null;
        return (
          <SectionCard
            key={section.key}
            sectionKey={section.key}
            title={section.title}
            description={section.description}
            value={value}
          />
        );
      })}
    </div>
  );
};

VisualPageEditor.propTypes = {
  content: PropTypes.object.isRequired,
};

export default VisualPageEditor;
