import { useEffect } from 'react';
import { Field, Select, StatusText, useForm } from '../components/form';
import { EmptyState, LoadingState, SectionCard } from '../components/SectionCard';
import { PROFICIENCIES, type Proficiency, type SpokenLanguage } from '../types';
import { useCollection } from '../useCollection';

export function LanguagesSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  const languages = useCollection<SpokenLanguage>('/api/career/languages');
  const form = useForm({ language: '', proficiency: '' as Proficiency | '' });
  const { values, set, errors } = form;

  useEffect(() => {
    if (languages.items) onFilled(languages.items.length > 0);
  }, [languages.items, onFilled]);

  async function remove(item: SpokenLanguage) {
    await languages.remove(item.id).catch((error: Error) => form.setStatus({ kind: 'error', text: error.message }));
  }

  return (
    <SectionCard id="languages" kicker="LANGUAGES" title="Languages you speak">
      <form
        className="inline-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.submit(async (v) => {
            await languages.create({ language: v.language, proficiency: v.proficiency || null });
            form.setValues({ language: '', proficiency: '' });
          });
        }}
      >
        <Field label="Language" error={errors.language}>
          {(a11y) => <input {...a11y} maxLength={80} placeholder="e.g. Turkish, English, German" value={values.language} onChange={(e) => set('language', e.target.value)} />}
        </Field>
        <Field label="Level" error={errors.proficiency}>
          {(a11y) => <Select {...a11y} value={values.proficiency} onChange={(value) => set('proficiency', value)} options={PROFICIENCIES} placeholder="Choose a level" />}
        </Field>
        <button type="submit" disabled={form.busy || !values.language.trim() || !values.proficiency}>
          <span>Add language</span>
          <span aria-hidden="true">+</span>
        </button>
      </form>
      <StatusText status={form.status} />

      {!languages.items ? (
        <LoadingState error={languages.loadError} />
      ) : languages.items.length === 0 ? (
        <EmptyState>European employers often ask for CEFR levels (A1–C2), so they’re used here.</EmptyState>
      ) : (
        <ul className="chip-list">
          {languages.items.map((item) => (
            <li key={item.id} className="chip">
              <span>{item.language}</span>
              <span className="chip-detail">{PROFICIENCIES[item.proficiency]}</span>
              <button type="button" className="chip-remove" onClick={() => void remove(item)} aria-label={`Remove ${item.language}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
