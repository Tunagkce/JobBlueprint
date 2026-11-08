import { useCallback, useMemo, useState } from 'react';
import { ContactSection } from './sections/ContactSection';
import { EducationSection } from './sections/EducationSection';
import { ExperienceSection } from './sections/ExperienceSection';
import { LanguagesSection } from './sections/LanguagesSection';
import { PreferencesSection } from './sections/PreferencesSection';
import { SkillsSection } from './sections/SkillsSection';

const SECTIONS = [
  { id: 'contact', label: 'Contact details', Component: ContactSection },
  { id: 'experience', label: 'Work experience', Component: ExperienceSection },
  { id: 'education', label: 'Education', Component: EducationSection },
  { id: 'skills', label: 'Skills', Component: SkillsSection },
  { id: 'languages', label: 'Languages', Component: LanguagesSection },
  { id: 'preferences', label: 'Application answers', Component: PreferencesSection },
] as const;
type SectionId = (typeof SECTIONS)[number]['id'];

export function ProfilePage() {
  const [filled, setFilled] = useState<Partial<Record<SectionId, boolean>>>({});

  // One stable callback per section, so sections can report status from effects without loops.
  const reporters = useMemo(
    () =>
      Object.fromEntries(
        SECTIONS.map(({ id }) => [id, (value: boolean) => setFilled((current) => (current[id] === value ? current : { ...current, [id]: value }))]),
      ) as Record<SectionId, (value: boolean) => void>,
    [],
  );
  const complete = SECTIONS.filter(({ id }) => filled[id]).length;
  const jumpTo = useCallback((id: string) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' }), []);

  return (
    <>
      <section className="intro" aria-labelledby="page-title">
        <p className="eyebrow">
          YOUR CAREER PROFILE <span>STEP 01</span>
        </p>
        <h1 id="page-title">Your profile.</h1>
        <p className="intro-copy">
          Everything JobTracker uses to tailor your resume and fill in application forms. The more complete it is, the less you’ll type
          later.
        </p>
      </section>

      <div className="content-grid">
        <aside className="side-note profile-nav" aria-label="Profile sections">
          <div className="progress" aria-label={`${complete} of ${SECTIONS.length} sections complete`}>
            <div className="progress-label">
              <span>Profile strength</span>
              <strong>
                {complete}/{SECTIONS.length}
              </strong>
            </div>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${(complete / SECTIONS.length) * 100}%` }} />
            </div>
          </div>
          <ol className="section-links">
            {SECTIONS.map(({ id, label }) => (
              <li key={id}>
                <a
                  href={`#${id}`}
                  onClick={(event) => {
                    event.preventDefault();
                    jumpTo(id);
                  }}
                >
                  <span className={`section-dot${filled[id] ? ' done' : ''}`} aria-hidden="true">
                    {filled[id] ? '✓' : ''}
                  </span>
                  {label}
                  <span className="visually-hidden">{filled[id] ? ' (complete)' : ' (not started)'}</span>
                </a>
              </li>
            ))}
          </ol>
          <div className="note-rule" />
          <p className="small-note">
            <span aria-hidden="true">↳</span> Only you can see your profile. Nothing is sent to an employer without your review.
          </p>
        </aside>

        <div className="section-stack">
          {SECTIONS.map(({ id, Component }) => (
            <Component key={id} onFilled={reporters[id]} />
          ))}
        </div>
      </div>
    </>
  );
}
