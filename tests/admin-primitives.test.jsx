import React from 'react';
import PropTypes from 'prop-types';
import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import Badge from '../components/admin/ui/Badge';
import Button from '../components/admin/ui/Button';
import Card from '../components/admin/ui/Card';
import Input from '../components/admin/ui/Input';
import Select from '../components/admin/ui/Select';
import Table from '../components/admin/ui/Table';
import Textarea from '../components/admin/ui/Textarea';

/**
 * Render primitives beneath the same boundary used by admin styles so checks
 * cover the intended isolated markup without importing public-site modules.
 *
 * @param {React.ReactNode} children - Primitive fixture content.
 * @returns {JSX.Element} Admin-scoped test fixture.
 */
const AdminFixture = ({ children }) => (
  <div data-admin-ui="true">{children}</div>
);

AdminFixture.propTypes = {
  children: PropTypes.node.isRequired,
};

const expectAttribute = (element, name, value) => {
  expect(element.getAttribute(name)).toBe(value);
};

const expectClasses = (element, ...classNames) => {
  classNames.forEach((className) => expect(element.classList.contains(className)).toBe(true));
};

const expectDisabled = (element) => {
  expect(element.disabled).toBe(true);
};

const expectContained = (container, element) => {
  expect(container.contains(element)).toBe(true);
};

describe('admin UI primitives', () => {
  it('renders a native button with forwarded attributes and all variants and sizes', () => {
    const variants = ['primary', 'secondary', 'ghost', 'danger', 'link'];
    const sizes = ['sm', 'md', 'lg'];

    const { rerender } = render(
      <AdminFixture>
        <Button
          aria-label="Save changes"
          data-testid="save-button"
          type="submit"
          variant="danger"
          size="lg"
          onClick={() => {}}
        >
          Save
        </Button>
      </AdminFixture>
    );

    const button = screen.getByRole('button', { name: 'Save changes' });
    expect(button.tagName).toBe('BUTTON');
    expectAttribute(button, 'type', 'submit');
    expectAttribute(button, 'data-testid', 'save-button');
    expectClasses(button, 'admin-ui__button--danger', 'admin-ui__button--lg');

    variants.forEach((variant) => {
      sizes.forEach((size) => {
        rerender(
          <AdminFixture>
            <Button variant={variant} size={size}>
              Action
            </Button>
          </AdminFixture>
        );
        expectClasses(
          screen.getByRole('button', { name: 'Action' }),
          `admin-ui__button--${variant}`,
          `admin-ui__button--${size}`
        );
      });
    });
  });

  it('announces pending and disabled states while preventing duplicate activation', () => {
    const { rerender } = render(
      <AdminFixture>
        <Button pending aria-label="Saving changes">
          Saving…
        </Button>
      </AdminFixture>
    );

    const button = screen.getByRole('button', { name: 'Saving changes' });
    expectDisabled(button);
    expectAttribute(button, 'aria-disabled', 'true');
    expectAttribute(button, 'aria-busy', 'true');

    rerender(
      <AdminFixture>
        <Button disabled aria-label="Unavailable action">
          Unavailable
        </Button>
      </AdminFixture>
    );
    const unavailableButton = screen.getByRole('button', { name: 'Unavailable action' });
    expectDisabled(unavailableButton);
    expectAttribute(unavailableButton, 'aria-disabled', 'true');
  });

  it('keeps Card parts semantic and forwards attributes', () => {
    render(
      <AdminFixture>
        <Card as="section" aria-labelledby="panel-title" data-testid="panel">
          <Card.Header as="header" data-testid="panel-header">
            <Card.Title as="h2" id="panel-title">
              Orders
            </Card.Title>
            <Card.Description>Recent collection requests.</Card.Description>
          </Card.Header>
          <Card.Content as="article">Panel content</Card.Content>
          <Card.Footer as="footer">Panel actions</Card.Footer>
        </Card>
      </AdminFixture>
    );

    expect(screen.getByTestId('panel').tagName).toBe('SECTION');
    expect(screen.getByRole('heading', { name: 'Orders', level: 2 })).toBeTruthy();
    expect(screen.getByTestId('panel-header').tagName).toBe('HEADER');
    expect(screen.getByText('Panel content').tagName).toBe('ARTICLE');
    expect(screen.getByText('Panel actions').tagName).toBe('FOOTER');
  });

  it('renders labeled native inputs and textareas with invalid state and bounded values', () => {
    render(
      <AdminFixture>
        <label htmlFor="email">Email</label>
        <Input
          id="email"
          name="email"
          type="email"
          aria-describedby="email-help"
          invalid
          maxLength={999999}
        />
        <span id="email-help">Use the admin email.</span>
        <label htmlFor="password">Password</label>
        <Input id="password" name="password" type="password" />
        <label htmlFor="payload">Content JSON</label>
        <Textarea
          id="payload"
          name="payload"
          rows={999}
          maxLength={999999}
          spellCheck={false}
          invalid
        />
      </AdminFixture>
    );

    const email = screen.getByLabelText('Email');
    expectAttribute(email, 'type', 'email');
    expectAttribute(email, 'name', 'email');
    expectAttribute(email, 'aria-describedby', 'email-help');
    expectAttribute(email, 'aria-invalid', 'true');
    expectAttribute(email, 'maxlength', '10000');
    expectAttribute(screen.getByLabelText('Password'), 'type', 'password');

    const textarea = screen.getByLabelText('Content JSON');
    expect(textarea.tagName).toBe('TEXTAREA');
    expectAttribute(textarea, 'rows', '100');
    expectAttribute(textarea, 'maxlength', '100000');
    expectAttribute(textarea, 'spellcheck', 'false');
    expectAttribute(textarea, 'aria-invalid', 'true');
  });

  it('renders native select semantics, forwarded attributes, and disabled state', () => {
    render(
      <AdminFixture>
        <label htmlFor="status">Order status</label>
        <Select
          id="status"
          name="status"
          value="ready"
          aria-describedby="status-help"
          disabled
          data-testid="status-select"
          onChange={() => {}}
        >
          <option value="pending">Pending</option>
          <option value="ready">Ready</option>
        </Select>
        <span id="status-help">Choose the next status.</span>
      </AdminFixture>
    );

    const select = screen.getByLabelText('Order status');
    expect(select.tagName).toBe('SELECT');
    expect(select.value).toBe('ready');
    expectAttribute(select, 'name', 'status');
    expectAttribute(select, 'aria-describedby', 'status-help');
    expectDisabled(select);
  });

  it('exposes readable status text and a non-color marker for every order state', () => {
    const statuses = [
      ['pending', 'Pending'],
      ['confirmed', 'Confirmed'],
      ['collected', 'Collected'],
      ['in-progress', 'In progress'],
      ['ready', 'Ready'],
      ['delivered', 'Delivered'],
      ['cancelled', 'Cancelled'],
    ];

    render(
      <AdminFixture>
        {statuses.map(([variant]) => (
          <Badge key={variant} variant={variant} />
        ))}
        <Badge variant="not-a-status" />
      </AdminFixture>
    );

    statuses.forEach(([, label]) => {
      expect(screen.getByText(label)).toBeTruthy();
    });
    const unknownStatus = screen.getByText('Unknown status');
    expectClasses(unknownStatus, 'admin-ui__badge--unknown');
    statuses.forEach(([variant, label]) => {
      expectClasses(
        screen.getByText(label),
        `admin-ui__badge--${variant}`
      );
    });
  });

  it('keeps native table associations inside an intentionally scrollable region', () => {
    render(
      <AdminFixture>
        <Table caption="Collection requests" scrollLabel="Scrollable collection requests">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Name</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            <Table.Row>
              <Table.Cell>Customer</Table.Cell>
              <Table.Cell>
                <Button size="sm">Update</Button>
              </Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table>
      </AdminFixture>
    );

    const table = screen.getByRole('table', { name: 'Collection requests' });
    const region = screen.getByRole('region', { name: 'Scrollable collection requests' });
    expectContained(table, screen.getByRole('columnheader', { name: 'Name' }));
    expectContained(table, screen.getByRole('cell', { name: 'Customer' }));
    expectContained(region, table);
    expectAttribute(region, 'tabindex', '0');
    expectClasses(region, 'admin-ui__table-wrap');
    expectClasses(table, 'admin-ui__table');
  });
});
