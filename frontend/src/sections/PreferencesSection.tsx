import { useEffect, useState } from 'react';
import { api } from '../api';
import { Field, FormActions, Select, useForm } from '../components/form';
import { LoadingState, SectionCard } from '../components/SectionCard';
import { blankToNull, numberOrNull } from '../format';
import { MILITARY_STATUSES, WORK_MODES, type ApplicationPreferences, type MilitaryServiceStatus, type WorkMode } from '../types';

const YES_NO = { true: 'Yes', false: 'No' } as const;
type YesNo = keyof typeof YES_NO;

const toYesNo = (value: boolean | null): YesNo | '' => (value == null ? '' : value ? 'true' : 'false');
const fromYesNo = (value: YesNo | ''): boolean | null => (value === '' ? null : value === 'true');
const text = (value: string | number | null) => (value == null ? '' : String(value));

function toValues(saved: ApplicationPreferences) {
  return {
    desiredTitles: text(saved.desiredTitles),
    preferredWorkMode: (saved.preferredWorkMode ?? '') as WorkMode | '',
    willingToRelocate: toYesNo(saved.willingToRelocate),
    workAuthorization: text(saved.workAuthorization),
    requiresSponsorship: toYesNo(saved.requiresSponsorship),
    noticePeriodDays: text(saved.noticePeriodDays),
    availableFrom: text(saved.availableFrom),
    salaryMin: text(saved.salaryMin),
    salaryMax: text(saved.salaryMax),
    salaryCurrency: text(saved.salaryCurrency),
    militaryServiceStatus: (saved.militaryServiceStatus ?? '') as MilitaryServiceStatus | '',
    drivingLicense: text(saved.drivingLicense),
  };
}
type Values = ReturnType<typeof toValues>;

export function PreferencesSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  const [saved, setSaved] = useState<ApplicationPreferences | null>(null);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    api
      .get<ApplicationPreferences>('/api/career/preferences')
      .then(setSaved)
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Could not load your answers.'));
  }, []);

  useEffect(() => {
    if (saved) onFilled(Boolean(saved.desiredTitles || saved.preferredWorkMode));
  }, [saved, onFilled]);

  return (
    <SectionCard id="preferences" kicker="APPLICATION ANSWERS" title="Questions employers ask" action={<span className="optional-label">All fields optional</span>}>
      <p className="section-intro">Answer once and JobTracker reuses these on application forms. You still review every application before it’s sent.</p>
      {saved ? <PreferencesForm saved={saved} onSaved={setSaved} /> : <LoadingState error={loadError} />}
    </SectionCard>
  );
}

function PreferencesForm({ saved, onSaved }: { saved: ApplicationPreferences; onSaved: (saved: ApplicationPreferences) => void }) {
  const form = useForm<Values>(toValues(saved));
  const { values, set, errors } = form;

  function save(v: Values) {
    return api
      .put<ApplicationPreferences>('/api/career/preferences', {
        desiredTitles: blankToNull(v.desiredTitles),
        preferredWorkMode: v.preferredWorkMode || null,
        willingToRelocate: fromYesNo(v.willingToRelocate),
        workAuthorization: blankToNull(v.workAuthorization),
        requiresSponsorship: fromYesNo(v.requiresSponsorship),
        noticePeriodDays: numberOrNull(v.noticePeriodDays),
        availableFrom: v.availableFrom || null,
        salaryMin: numberOrNull(v.salaryMin),
        salaryMax: numberOrNull(v.salaryMax),
        salaryCurrency: blankToNull(v.salaryCurrency),
        militaryServiceStatus: v.militaryServiceStatus || null,
        drivingLicense: blankToNull(v.drivingLicense),
      })
      .then(onSaved);
  }

  return (
    <form
      noValidate
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit(save, 'Your answers are saved.');
      }}
    >
      <fieldset className="field-group">
        <legend>The job you want</legend>
        <div className="field-grid">
          <Field label="Job titles you’re targeting" wide error={errors.desiredTitles} hint="Separate titles with commas.">
            {(a11y) => <input {...a11y} maxLength={1000} placeholder="e.g. Backend Developer, Java Engineer" value={values.desiredTitles} onChange={(e) => set('desiredTitles', e.target.value)} />}
          </Field>
          <Field label="Work mode" error={errors.preferredWorkMode}>
            {(a11y) => <Select {...a11y} value={values.preferredWorkMode} onChange={(value) => set('preferredWorkMode', value)} options={WORK_MODES} placeholder="No preference" />}
          </Field>
          <Field label="Willing to relocate?" error={errors.willingToRelocate}>
            {(a11y) => <Select {...a11y} value={values.willingToRelocate} onChange={(value) => set('willingToRelocate', value)} options={YES_NO} placeholder="Not specified" />}
          </Field>
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>Salary and availability</legend>
        <div className="field-grid field-grid-3">
          <Field label="Minimum salary (yearly)" error={errors.salaryMin}>
            {(a11y) => <input {...a11y} type="number" min={0} step={1000} inputMode="numeric" value={values.salaryMin} onChange={(e) => set('salaryMin', e.target.value)} />}
          </Field>
          <Field label="Maximum salary (yearly)" error={errors.salaryMax}>
            {(a11y) => <input {...a11y} type="number" min={0} step={1000} inputMode="numeric" value={values.salaryMax} onChange={(e) => set('salaryMax', e.target.value)} />}
          </Field>
          <Field label="Currency" error={errors.salaryCurrency}>
            {(a11y) => (
              <input
                {...a11y}
                maxLength={3}
                list="currency-options"
                placeholder="TRY, EUR…"
                value={values.salaryCurrency}
                onChange={(e) => set('salaryCurrency', e.target.value.toUpperCase())}
              />
            )}
          </Field>
          <datalist id="currency-options">
            {['TRY', 'EUR', 'USD', 'GBP', 'CHF', 'PLN', 'SEK', 'NOK', 'DKK', 'CZK', 'HUF', 'RON'].map((code) => (
              <option key={code} value={code} />
            ))}
          </datalist>
          <Field label="Notice period (days)" error={errors.noticePeriodDays}>
            {(a11y) => <input {...a11y} type="number" min={0} max={365} inputMode="numeric" value={values.noticePeriodDays} onChange={(e) => set('noticePeriodDays', e.target.value)} />}
          </Field>
          <Field label="Available from" error={errors.availableFrom}>
            {(a11y) => <input {...a11y} type="date" value={values.availableFrom} onChange={(e) => set('availableFrom', e.target.value)} />}
          </Field>
        </div>
      </fieldset>

      <fieldset className="field-group">
        <legend>Eligibility</legend>
        <div className="field-grid">
          <Field label="Work authorization" wide error={errors.workAuthorization} hint="Where you can already work, e.g. “Turkish citizen; EU Blue Card holder (Germany)”.">
            {(a11y) => <input {...a11y} maxLength={500} value={values.workAuthorization} onChange={(e) => set('workAuthorization', e.target.value)} />}
          </Field>
          <Field label="Need visa sponsorship?" error={errors.requiresSponsorship}>
            {(a11y) => <Select {...a11y} value={values.requiresSponsorship} onChange={(value) => set('requiresSponsorship', value)} options={YES_NO} placeholder="Not specified" />}
          </Field>
          <Field label="Military service" error={errors.militaryServiceStatus} hint="Often asked by employers in Turkey.">
            {(a11y) => <Select {...a11y} value={values.militaryServiceStatus} onChange={(value) => set('militaryServiceStatus', value)} options={MILITARY_STATUSES} placeholder="Not specified" />}
          </Field>
          <Field label="Driving licence" error={errors.drivingLicense}>
            {(a11y) => <input {...a11y} maxLength={50} placeholder="e.g. B" value={values.drivingLicense} onChange={(e) => set('drivingLicense', e.target.value)} />}
          </Field>
        </div>
      </fieldset>

      <FormActions busy={form.busy} submitLabel="Save answers" status={form.status} />
    </form>
  );
}
