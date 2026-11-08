import type { ReactNode } from 'react';

interface SectionCardProps {
  id: string;
  kicker: string;
  title: string;
  action?: ReactNode;
  children: ReactNode;
}

export function SectionCard({ id, kicker, title, action, children }: SectionCardProps) {
  return (
    <section className="form-card section-card" id={id} aria-labelledby={`${id}-title`}>
      <div className="card-heading">
        <div>
          <p className="section-kicker">{kicker}</p>
          <h2 id={`${id}-title`}>{title}</h2>
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return <p className="empty-state">{children}</p>;
}

export function LoadingState({ error }: { error: string }) {
  return error ? <p className="save-status error">{error}</p> : <p className="empty-state">Loading…</p>;
}

/** Edit/Delete links shown on each saved item. */
export function ItemActions({ label, onEdit, onDelete }: { label: string; onEdit?: () => void; onDelete: () => void }) {
  return (
    <div className="item-actions">
      {onEdit && (
        <button type="button" className="link-button" onClick={onEdit} aria-label={`Edit ${label}`}>
          Edit
        </button>
      )}
      <button type="button" className="link-button danger" onClick={onDelete} aria-label={`Delete ${label}`}>
        Delete
      </button>
    </div>
  );
}
