'use client';

import { useState, useTransition, useRef } from 'react';
import PropTypes from 'prop-types';
import { ORDER_STATUSES, STATUS_LABELS } from '@/lib/data/orders';
import { changeOrderStatus } from '@/app/admin/(dashboard)/actions';
import Select from '@/components/admin/ui/Select';

/**
 * Inline dropdown to change an order's status.
 *
 * Uses the shared Select primitive and submits through the `changeOrderStatus`
 * server action inside a transition so the UI stays responsive. Reverts the
 * local value if the server rejects the change. Exposes pending and error
 * states through accessible announcements without relying on color alone.
 *
 * @param {object} props
 * @param {string} props.id - Order id to update.
 * @param {string} props.status - Current persisted status value.
 */
const StatusSelect = ({ id, status }) => {
  const [value, setValue] = useState(status);
  const [pending, startTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Track whether a transition is in-flight to prevent duplicate submissions.
  const inflightRef = useRef(false);

  /**
   * Handle a status selection: optimistically set it, then persist.
   * Prevents duplicate submissions while a transition is already pending.
   *
   * @param {import('react').ChangeEvent<HTMLSelectElement>} e - Change event.
   */
  const handleChange = (e) => {
    const next = e.target.value;

    // Prevent duplicate submissions while a transition is pending.
    if (inflightRef.current) return;
    if (next === value) return;

    const previous = value;
    setValue(next);
    setStatusMessage('');
    setErrorMessage('');
    inflightRef.current = true;

    const formData = new FormData();
    formData.set('id', id);
    formData.set('status', next);

    startTransition(async () => {
      try {
        const result = await changeOrderStatus(formData);

        if (!result.ok) {
          // Roll back the visible selection on server rejection.
          setValue(previous);
          setErrorMessage(result.error || 'Status update failed.');
          setStatusMessage('');
        } else {
          setStatusMessage(`Status updated to ${STATUS_LABELS[next] || next}.`);
          setErrorMessage('');
        }
      } catch {
        // Network or unexpected error — roll back silently with alert.
        setValue(previous);
        setErrorMessage('Status update failed.');
        setStatusMessage('');
      } finally {
        inflightRef.current = false;
      }
    });
  };

  return (
    <span className="admin-ui__status-control">
      <Select
        value={value}
        onChange={handleChange}
        disabled={pending}
        aria-label={`Change status for order ${id}`}
        aria-busy={pending || undefined}
        className="admin-ui__status-select"
      >
        {ORDER_STATUSES.map((s) => (
          <option key={s} value={s}>
            {STATUS_LABELS[s]}
          </option>
        ))}
      </Select>

      {/* Accessible pending announcement — not color-dependent */}
      {pending && (
        <span role="status" className="admin-ui__status-pending">
          Updating…
        </span>
      )}

      {/* Accessible success announcement */}
      {statusMessage && !pending && (
        <span role="status" className="admin-ui__status-success">
          {statusMessage}
        </span>
      )}

      {/* Accessible error announcement — role="alert" for immediate reading */}
      {errorMessage && !pending && (
        <span role="alert" className="admin-ui__status-error">
          {errorMessage}
        </span>
      )}
    </span>
  );
};

StatusSelect.propTypes = {
  id: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
};

export default StatusSelect;
