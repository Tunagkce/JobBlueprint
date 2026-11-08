import { useEffect } from 'react';
import { Field, Select, StatusText, useForm } from '../components/form';
import { EmptyState, LoadingState, SectionCard } from '../components/SectionCard';
import { SKILL_LEVELS, type Skill, type SkillLevel } from '../types';
import { useCollection } from '../useCollection';

export function SkillsSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  const skills = useCollection<Skill>('/api/career/skills');
  const form = useForm({ name: '', level: '' as SkillLevel | '' });
  const { values, set, errors } = form;

  useEffect(() => {
    if (skills.items) onFilled(skills.items.length > 0);
  }, [skills.items, onFilled]);

  async function remove(skill: Skill) {
    await skills.remove(skill.id).catch((error: Error) => form.setStatus({ kind: 'error', text: error.message }));
  }

  return (
    <SectionCard id="skills" kicker="SKILLS" title="What you’re good at">
      <form
        className="inline-form"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.submit(async (v) => {
            await skills.create({ name: v.name, level: v.level || null });
            form.setValues({ name: '', level: '' });
          });
        }}
      >
        <Field label="Skill" error={errors.name}>
          {(a11y) => <input {...a11y} maxLength={100} placeholder="e.g. Java, Figma, Negotiation" value={values.name} onChange={(e) => set('name', e.target.value)} />}
        </Field>
        <Field label="Level" optional error={errors.level}>
          {(a11y) => <Select {...a11y} value={values.level} onChange={(value) => set('level', value)} options={SKILL_LEVELS} placeholder="Any level" />}
        </Field>
        <button type="submit" disabled={form.busy || !values.name.trim()}>
          <span>Add skill</span>
          <span aria-hidden="true">+</span>
        </button>
      </form>
      <StatusText status={form.status} />

      {!skills.items ? (
        <LoadingState error={skills.loadError} />
      ) : skills.items.length === 0 ? (
        <EmptyState>Add the tools, technologies and strengths you want employers to see.</EmptyState>
      ) : (
        <ul className="chip-list">
          {skills.items.map((skill) => (
            <li key={skill.id} className="chip">
              <span>{skill.name}</span>
              {skill.level && <span className="chip-detail">{SKILL_LEVELS[skill.level]}</span>}
              <button type="button" className="chip-remove" onClick={() => void remove(skill)} aria-label={`Remove ${skill.name}`}>
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </SectionCard>
  );
}
