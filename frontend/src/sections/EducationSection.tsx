import { useEffect, useState } from 'react';
import { Field, FormActions, useForm } from '../components/form';
import { EmptyState, ItemActions, LoadingState, SectionCard } from '../components/SectionCard';
import { blankToNull, formatPeriod } from '../format';
import type { Education } from '../types';
import { useCollection } from '../useCollection';

type Editing = { mode: 'new' } | { mode: 'edit'; item: Education } | null;

export function EducationSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  const schools = useCollection<Education>('/api/career/education');
  const [editing, setEditing] = useState<Editing>(null);

  useEffect(() => {
    if (schools.items) onFilled(schools.items.length > 0);
  }, [schools.items, onFilled]);

  async function remove(item: Education) {
    if (!window.confirm(`Delete ${item.institution}?`)) return;
    await schools.remove(item.id).catch((error: Error) => window.alert(error.message));
  }

  return (
    <SectionCard
      id="education"
      kicker="EDUCATION"
      title="Where you studied"
      action={
        !editing && (
          <button className="secondary-button" type="button" onClick={() => setEditing({ mode: 'new' })}>
            + Add education
          </button>
        )
      }
    >
      {editing?.mode === 'new' && (
        <EducationForm
          onSave={async (body) => {
            await schools.create(body);
            setEditing(null);
          }}
          onCancel={() => setEditing(null)}
        />
      )}
      {!schools.items ? (
        <LoadingState error={schools.loadError} />
      ) : schools.items.length === 0 ? (
        editing?.mode !== 'new' && <EmptyState>Add universities, schools, bootcamps or certification programmes.</EmptyState>
      ) : (
        <ul className="item-list">
          {schools.items.map((item) =>
            editing?.mode === 'edit' && editing.item.id === item.id ? (
              <li key={item.id} className="item editing">
                <EducationForm
                  initial={item}
                  onSave={async (body) => {
                    await schools.update(item.id, body);
                    setEditing(null);
                  }}
                  onCancel={() => setEditing(null)}
                />
              </li>
            ) : (
              <li key={item.id} className="item">
                <div className="item-main">
                  <h3>{item.institution}</h3>
                  {(item.degree || item.fieldOfStudy) && <p className="item-sub">{[item.degree, item.fieldOfStudy].filter(Boolean).join(', ')}</p>}
                  <p className="item-meta">
                    {formatPeriod(item.startDate, item.endDate)}
                    {item.grade && <span className="pill">{item.grade}</span>}
                  </p>
                  {item.description && <p className="item-text">{item.description}</p>}
                </div>
                {!editing && <ItemActions label={item.institution} onEdit={() => setEditing({ mode: 'edit', item })} onDelete={() => void remove(item)} />}
              </li>
            ),
          )}
        </ul>
      )}
    </SectionCard>
  );
}

function EducationForm({ initial, onSave, onCancel }: { initial?: Education; onSave: (body: unknown) => Promise<void>; onCancel: () => void }) {
  const form = useForm({
    institution: initial?.institution ?? '',
    degree: initial?.degree ?? '',
    fieldOfStudy: initial?.fieldOfStudy ?? '',
    startDate: initial?.startDate ?? '',
    endDate: initial?.endDate ?? '',
    grade: initial?.grade ?? '',
    description: initial?.description ?? '',
  });
  const { values, set, errors } = form;

  return (
    <form
      className="item-form"
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit((v) =>
          onSave({
            institution: v.institution,
            degree: blankToNull(v.degree),
            fieldOfStudy: blankToNull(v.fieldOfStudy),
            startDate: v.startDate || null,
            endDate: v.endDate || null,
            grade: blankToNull(v.grade),
            description: blankToNull(v.description),
          }),
        );
      }}
    >
      <div className="field-grid">
        <Field label="School or institution" wide error={errors.institution}>
          {(a11y) => <input {...a11y} required maxLength={200} placeholder="e.g. Middle East Technical University" value={values.institution} onChange={(e) => set('institution', e.target.value)} />}
        </Field>
        <Field label="Degree" optional error={errors.degree}>
          {(a11y) => <input {...a11y} maxLength={200} placeholder="e.g. BSc, MSc, High school diploma" value={values.degree} onChange={(e) => set('degree', e.target.value)} />}
        </Field>
        <Field label="Field of study" optional error={errors.fieldOfStudy}>
          {(a11y) => <input {...a11y} maxLength={200} placeholder="e.g. Computer Engineering" value={values.fieldOfStudy} onChange={(e) => set('fieldOfStudy', e.target.value)} />}
        </Field>
        <Field label="Start date" optional error={errors.startDate}>
          {(a11y) => <input {...a11y} type="date" value={values.startDate} onChange={(e) => set('startDate', e.target.value)} />}
        </Field>
        <Field label="End date" optional error={errors.endDate} hint="Use your expected date if you’re still studying.">
          {(a11y) => <input {...a11y} type="date" min={values.startDate || undefined} value={values.endDate} onChange={(e) => set('endDate', e.target.value)} />}
        </Field>
        <Field label="Grade" optional error={errors.grade}>
          {(a11y) => <input {...a11y} maxLength={50} placeholder="e.g. 3.45 / 4.00" value={values.grade} onChange={(e) => set('grade', e.target.value)} />}
        </Field>
        <Field label="Notes" optional wide error={errors.description} hint="Thesis, honours, relevant courses, activities.">
          {(a11y) => <textarea {...a11y} rows={3} maxLength={2000} value={values.description} onChange={(e) => set('description', e.target.value)} />}
        </Field>
      </div>
      <FormActions busy={form.busy} onCancel={onCancel} submitLabel={initial ? 'Save education' : 'Add education'} status={form.status} />
    </form>
  );
}
