import { useId, useState, type ReactNode } from 'react';
import { ApiError } from '../api';

export type Status = { kind: '' | 'success' | 'error'; text: string };

/**
 * Holds a form's string values plus the server's field errors. `submit` runs the save, shows the
 * server's message on failure and highlights the fields it named.
 */
export function useForm<V extends Record<string, string | boolean>>(initial: V) {
  const [values, setValues] = useState<V>(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [status, setStatus] = useState<Status>({ kind: '', text: '' });
  const [busy, setBusy] = useState(false);

  function set<K extends keyof V>(key: K, value: V[K]) {
    setValues((current) => ({ ...current, [key]: value }));
    setErrors((current) => {
      if (!((key as string) in current)) return current;
      const { [key as string]: _removed, ...rest } = current;
      return rest;
    });
  }

  async function submit(save: (values: V) => Promise<void>, successText = '') {
    setBusy(true);
    setErrors({});
    setStatus({ kind: '', text: 'Saving…' });
    try {
      await save(values);
      setStatus({ kind: successText ? 'success' : '', text: successText });
    } catch (error) {
      if (error instanceof ApiError) {
        setErrors(error.fieldErrors);
        setStatus({ kind: 'error', text: error.message });
      } else {
        setStatus({ kind: 'error', text: 'Could not reach JobTracker. Check your connection and try again.' });
      }
    } finally {
      setBusy(false);
    }
  }

  return { values, set, setValues, errors, status, setStatus, busy, submit };
}

/** Server messages are terse ("must not be blank"); show them as a sentence. */
function sentence(message: string): string {
  const text = message.charAt(0).toUpperCase() + message.slice(1);
  return /[.!?]$/.test(text) ? text : `${text}.`;
}

interface FieldProps {
  label: string;
  error?: string;
  hint?: string;
  optional?: boolean;
  wide?: boolean;
  children: (props: { id: string; 'aria-invalid'?: true; 'aria-describedby'?: string }) => ReactNode;
}

/** A labelled field. Children receive the id/aria props to spread onto their input. */
export function Field({ label, error, hint, optional, wide, children }: FieldProps) {
  const id = useId();
  const noteId = `${id}-note`;
  const note = error ? sentence(error) : hint;
  return (
    <div className={`field${wide ? ' field-wide' : ''}${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>
        {label}
        {optional && <em>optional</em>}
      </label>
      {children({ id, ...(error ? { 'aria-invalid': true } : {}), ...(note ? { 'aria-describedby': noteId } : {}) })}
      {note && (
        <span id={noteId} className={error ? 'field-error' : 'field-hint'}>
          {note}
        </span>
      )}
    </div>
  );
}

export function Select<T extends string>({
  value,
  onChange,
  options,
  placeholder,
  ...rest
}: {
  value: T | '';
  onChange: (value: T | '') => void;
  options: Record<T, string>;
  placeholder: string;
  id?: string;
  required?: boolean;
}) {
  return (
    <select value={value} onChange={(event) => onChange(event.target.value as T | '')} {...rest}>
      <option value="">{placeholder}</option>
      {(Object.entries(options) as [T, string][]).map(([key, label]) => (
        <option key={key} value={key}>
          {label}
        </option>
      ))}
    </select>
  );
}

export function StatusText({ status }: { status: Status }) {
  return (
    <p className={`save-status ${status.kind}`.trim()} role="status" aria-live="polite">
      {status.text}
    </p>
  );
}

export function FormActions({ busy, onCancel, submitLabel, status }: { busy: boolean; onCancel?: () => void; submitLabel: string; status: Status }) {
  return (
    <div className="form-footer">
      <StatusText status={status} />
      <div className="editor-actions">
        {onCancel && (
          <button className="secondary-button" type="button" onClick={onCancel} disabled={busy}>
            Cancel
          </button>
        )}
        <button type="submit" disabled={busy}>
          <span>{busy ? 'Saving…' : submitLabel}</span>
          <span aria-hidden="true">↗</span>
        </button>
      </div>
    </div>
  );
}
