import React from 'react';
import PropTypes from 'prop-types';
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import ContentEditor from '../components/admin/ContentEditor';

// Mock the server action to avoid server-only imports in test env.
vi.mock('../app/admin/(dashboard)/actions', () => ({
  saveContentSection: vi.fn(),
}));

// Mock useFormState and useFormStatus from react-dom since they rely on
// React server internals unavailable in the jsdom test environment.
vi.mock('react-dom', async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useFormState: (_action, initialState) => [initialState, vi.fn()],
    useFormStatus: () => ({ pending: false }),
  };
});

/**
 * Admin-scoped test wrapper matching the production data-admin-ui root.
 *
 * @param {object} props
 * @param {React.ReactNode} props.children - Test content.
 */
const AdminFixture = ({ children }) => (
  <div data-admin-ui="true">{children}</div>
);

AdminFixture.propTypes = {
  children: PropTypes.node.isRequired,
};

const SAMPLE_VALUE = { headline: 'Welcome', tagline: 'Best service' };

describe('ContentEditor migration', () => {
  it('renders a visible label for the JSON textarea', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const label = screen.getByText('Section data (JSON)');
    expect(label).toBeTruthy();
    expect(label.tagName.toLowerCase()).toBe('label');
    expect(label.getAttribute('for')).toBe('content-json');
  });

  it('renders initial value as formatted JSON', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    expect(textarea.value).toBe(JSON.stringify(SAMPLE_VALUE, null, 2));
  });

  it('uses Textarea primitive with bounded rows', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    expect(textarea.tagName.toLowerCase()).toBe('textarea');
    expect(textarea.classList.contains('admin-ui__textarea')).toBe(true);
    expect(textarea.getAttribute('rows')).toBe('22');
  });

  it('provides live JSON parse feedback with role="alert"', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: '{ invalid' } });

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Not valid JSON yet…');
  });

  it('clears parse error when JSON becomes valid', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: '{ invalid' } });
    expect(screen.getByRole('alert')).toBeTruthy();

    fireEvent.change(textarea, { target: { value: '{"valid": true}' } });
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('Tidy JSON button reformats valid JSON', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: '{"a":1,"b":2}' } });

    const tidyBtn = screen.getByRole('button', { name: 'Tidy JSON' });
    fireEvent.click(tidyBtn);

    expect(textarea.value).toBe(JSON.stringify({ a: 1, b: 2 }, null, 2));
  });

  it('Tidy JSON shows error for invalid JSON', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: '{ broken' } });

    const tidyBtn = screen.getByRole('button', { name: 'Tidy JSON' });
    fireEvent.click(tidyBtn);

    const alert = screen.getByRole('alert');
    expect(alert.textContent).toBe('Cannot format — invalid JSON.');
  });

  it('disables Save when JSON is invalid', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: 'not json' } });

    const saveBtn = screen.getByRole('button', { name: 'Save changes' });
    expect(saveBtn.disabled).toBe(true);
  });

  it('enables Save when JSON is valid', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const saveBtn = screen.getByRole('button', { name: 'Save changes' });
    expect(saveBtn.disabled).toBe(false);
  });

  it('renders hidden inputs with section and payload FormData names', () => {
    render(
      <AdminFixture>
        <ContentEditor section="brand" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const form = screen.getByRole('button', { name: 'Save changes' }).closest('form');
    const hiddenInputs = form.querySelectorAll('input[type="hidden"]');
    const names = Array.from(hiddenInputs).map((i) => i.name);
    expect(names).toContain('section');
    expect(names).toContain('payload');

    const sectionInput = form.querySelector('input[name="section"]');
    expect(sectionInput.value).toBe('brand');
  });

  it('uses Button primitives for Save and Tidy JSON', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const saveBtn = screen.getByRole('button', { name: 'Save changes' });
    expect(saveBtn.classList.contains('admin-ui__button')).toBe(true);
    expect(saveBtn.classList.contains('admin-ui__button--primary')).toBe(true);

    const tidyBtn = screen.getByRole('button', { name: 'Tidy JSON' });
    expect(tidyBtn.classList.contains('admin-ui__button')).toBe(true);
    expect(tidyBtn.classList.contains('admin-ui__button--ghost')).toBe(true);
  });

  it('does not render unsanitized HTML in textarea content', () => {
    const xssValue = { key: '<script>alert("xss")</script>' };
    render(
      <AdminFixture>
        <ContentEditor section="home" value={xssValue} />
      </AdminFixture>
    );

    // The script tag should appear as escaped text inside the textarea value,
    // not rendered as a DOM element.
    expect(document.querySelector('script')).toBeNull();
    const textarea = screen.getByLabelText('Section data (JSON)');
    expect(textarea.value).toContain('<script>');
  });

  it('marks textarea as aria-invalid when JSON is invalid', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    fireEvent.change(textarea, { target: { value: '{ broken' } });
    expect(textarea.getAttribute('aria-invalid')).toBe('true');
  });

  it('spellCheck is disabled on the JSON textarea', () => {
    render(
      <AdminFixture>
        <ContentEditor section="home" value={SAMPLE_VALUE} />
      </AdminFixture>
    );

    const textarea = screen.getByLabelText('Section data (JSON)');
    expect(textarea.getAttribute('spellcheck')).toBe('false');
  });
});
