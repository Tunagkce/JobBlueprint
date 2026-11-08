import { useEffect, useState } from 'react';
import { Field, FormActions, Select, useForm } from '../components/form';
import { EmptyState, ItemActions, LoadingState, SectionCard } from '../components/SectionCard';
import { blankToNull, formatPeriod } from '../format';
import { EMPLOYMENT_TYPES, type EmploymentType, type WorkExperience } from '../types';
import { useCollection } from '../useCollection';

type Editing = { mode: 'new' } | { mode: 'edit'; item: WorkExperience } | null;

export function ExperienceSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  const roles = useCollection<WorkExperience>('/api/career/experience');
  const [editing, setEditing] = useState<Editing>(null);

  useEffect(() => {
    if (roles.items) onFilled(roles.items.length > 0);
  }, [roles.items, onFilled]);

  async function remove(role: WorkExperience) {
    if (!window.confirm(`Delete ${role.title} at ${role.company}?`)) return;
    await roles.remove(role.id).catch((error: Error) => window.alert(error.message));
  }

  return (
    <SectionCard
      id="experience"
      kicker="WORK EXPERIENCE"
      title="Where you’ve worked"
      action={
        !editing && (
          <button className="secondary-button" type="button" onClick={() => setEditing({ mode: 'new' })}>
            + Add role
          </button>
        )
      }
    >
      {editing?.mode === 'new' && (
        <ExperienceForm
          onSave={async (body) => {
            await roles.create(body);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {!roles.items ? (
        <LoadingState error={roles.loadError} />
      ) : roles.items.length === 0 ? (
        editing?.mode !== 'new' && <EmptyState>Add your roles, newest first. They become the backbone of every tailored resume.</EmptyState>
      ) : (
        <ul className="item-list">
          {roles.items.map((role) =>
            editing?.mode === 'edit' && editing.item.id === role.id ? (
              <li key={role.id} className="item editing">
                <ExperienceForm
                  initial={role}
                  onSave={async (body) => {
                    await roles.update(role.id, body);
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={role.id} className="item">
                <div className="item-main">
                  <h3>{role.title}</h3>
                  <p className="item-sub">
                    {role.company}
                    {role.employmentType && ` · ${EMPLOYMENT_TYPES[role.employmentType]}`}
                    {role.location && ` · ${role.location}`}
                  </p>
                  <p className="item-meta">
                    {formatPeriod(role.startDate, role.endDate, role.current)}
                    {role.current && <span className="pill">Current</span>}
                  </p>
                  {role.description && <p className="item-text">{role.description}</p>}
                </div>
                {!editing && <ItemActions label={`${role.title} at ${role.company}`} onEdit={() => setEditing({ mode: 'edit', item: role })} onDelete={() => void remove(role)} />}
              </li>
            ),
          )}
        </ul>
      )}
    </SectionCard>
  );
}

function ExperienceForm({ initial, onSave, onCancel }: { initial?: WorkExperience; onSave: (body: unknown) => Promise<void>; onCancel: () => void }) {
  const form = useForm({
    company: initial?.company ?? '',
    title: initial?.title ?? '',
    location: initial?.location ?? '',
    employmentType: (initial?.employmentType ?? '') as EmploymentType | '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    current: initial?.current ?? false,
    description: initial?.description ?? '',
  });
  const { values, set, errors } = form;
  const today = new Date().toLocaleDateString('sv'); // YYYY-MM-DD in local time

  return (
    <form
      className="item-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit((v) =>
          onSave({
            company: v.company,
            title: v.title,
            location: blankToNull(v.location),
            employmentType: v.employmentType || null,
            startDate: v.startDate || null,
            endDate: v.current ? null : v.endDate || null,
            current: v.current,
            description: blankToNull(v.description),
          }),
        );
      }}
    >
      <div className="field-grid">
        <Field label="Job title" error={errors.title}>
          {(a11y) => <input {...a11y} required maxLength={200} placeholder="e.g. Backend Developer" value={values.title} onChange={(e) => set('title', e.target.value)} />}
        </Field>
        <Field label="Company" error={errors.company}>
          {(a11y) => <input {...a11y} required maxLength={200} placeholder="e.g. Acme" value={values.company} onChange={(e) => set('company', e.target.value)} />}
        </Field>
        <Field label="Employment type" optional error={errors.employmentType}>
          {(a11y) => <Select {...a11y} value={values.employmentType} onChange={(value) => set('employmentType', value)} options={EMPLOYMENT_TYPES} placeholder="Select a type" />}
        </Field>
        <Field label="Location" optional error={errors.location}>
          {(a11y) => <input {...a11y} maxLength={200} placeholder="e.g. Istanbul, Turkey · Remote" value={values.location} onChange={(e) => set('location', e.target.value)} />}
        </Field>
        <Field label="Start date" error={errors.startDate}>
          {(a11y) => <input {...a11y} type="date" required max={today} value={values.startDate} onChange={(e) => set('startDate', e.target.value)} />}
        </Field>
        <Field label="End date" error={errors.endDate} hint={values.current ? 'Not needed for your current role.' : undefined}>
          {(a11y) => (
            <input {...a11y} type="date" min={values.startDate || undefined} disabled={values.current} value={values.current ? '' : values.endDate} onChange={(e) => set('endDate', e.target.value)} />
          )}
        </Field>
        <label className="check-field field-wide">
          <input type="checkbox" checked={values.current} onChange={(e) => set('current', e.target.checked)} />
          <span>I currently work here</span>
        </label>
        <Field label="What you did" optional wide error={errors.description} hint="Responsibilities and results, one per line. Numbers help: “cut build time by 40%”.">
          {(a11y) => <textarea {...a11y} rows={5} maxLength={5000} value={values.description} onChange={(e) => set('description', e.target.value)} />}
        </Field>
      </div>
      <FormActions busy={form.busy} onCancel={onCancel} submitLabel={initial ? 'Save role' : 'Add role'} status={form.status} />
    </form>
  );
}
