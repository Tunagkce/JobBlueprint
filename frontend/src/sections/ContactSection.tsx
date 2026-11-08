import { useEffect, useState } from 'react';
import { api } from '../api';
import { Combobox } from '../components/Combobox';
import { Field, FormActions, useForm } from '../components/form';
import { LoadingState, SectionCard } from '../components/SectionCard';
import { CITIES } from '../data/cities';
import { blankToNull, flagFor, formatPhone, safeHref } from '../format';
import type { ContactProfile, Country } from '../types';

const EMPTY = {
  fullName: '',
  email: '',
  phone: '',
  phoneCountryIso: '',
  country: '',
  city: '',
  linkedInUrl: '',
  portfolioUrl: '',
  professionalSummary: '',
};
type Values = typeof EMPTY;

function toValues(profile: ContactProfile | null): Values {
  if (!profile) return EMPTY;
  return Object.fromEntries(
    Object.keys(EMPTY).map((key) => [key, profile[key as keyof ContactProfile] ?? '']),
  ) as Values;
}

const countryLabel = (country: Country) => `${flagFor(country.iso)}  ${country.name}`;
const dialLabel = (country: Country) => `${flagFor(country.iso)}  ${country.dial} · ${country.name}`;

export function ContactSection({ onFilled }: { onFilled: (filled: boolean) => void }) {
  // undefined = loading, null = never saved.
  const [profile, setProfile] = useState<ContactProfile | null | undefined>(undefined);
  const [countries, setCountries] = useState<Country[]>([]);
  const [editing, setEditing] = useState(false);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    Promise.all([api.get<Country[]>('/api/metadata/countries'), api.getOptional<ContactProfile>('/api/profile')])
      .then(([countryList, saved]) => {
        setCountries(countryList);
        setProfile(saved);
        setEditing(!saved);
      })
      .catch((error: unknown) => setLoadError(error instanceof Error ? error.message : 'Could not load your details.'));
  }, []);

  useEffect(() => {
    if (profile !== undefined) onFilled(Boolean(profile?.fullName && profile.email));
  }, [profile, onFilled]);

  return (
    <SectionCard
      id="contact"
      kicker="CONTACT DETAILS"
      title={profile?.fullName || 'The essentials'}
      action={
        profile && !editing ? (
          <button className="secondary-button" type="button" onClick={() => setEditing(true)}>
            Edit details
          </button>
        ) : (
          <span className="optional-label">All fields optional</span>
        )
      }
    >
      {profile === undefined ? (
        <LoadingState error={loadError} />
      ) : editing ? (
        <ContactForm
          profile={profile}
          countries={countries}
          onSaved={(saved) => {
            setProfile(saved);
            setEditing(false);
          }}
          onCancel={profile ? () => setEditing(false) : undefined}
        />
      ) : (
        profile && <ContactView profile={profile} />
      )}
    </SectionCard>
  );
}

function ContactView({ profile }: { profile: ContactProfile }) {
  const rows: [string, string, boolean][] = [
    ['Email', profile.email ?? '', false],
    ['Phone', profile.phone ? `${profile.phoneCountryCode ?? ''} ${profile.phone}`.trim() : '', false],
    ['Location', [profile.city, profile.country].filter(Boolean).join(', '), false],
    ['LinkedIn', profile.linkedInUrl ?? '', true],
    ['Website', profile.portfolioUrl ?? '', true],
  ];
  const shown = rows.filter(([, value]) => value);
  return (
    <>
      {shown.length > 0 ? (
        <dl className="profile-details">
          {shown.map(([label, value, isLink]) => {
            const href = isLink ? safeHref(value) : null;
            return (
              <div className="profile-row" key={label}>
                <dt>{label}</dt>
                <dd>
                  {href ? (
                    <a href={href} target="_blank" rel="noopener noreferrer">
                      {value}
                    </a>
                  ) : (
                    value
                  )}
                </dd>
              </div>
            );
          })}
        </dl>
      ) : (
        <p className="empty-state">No contact details yet.</p>
      )}
      {profile.professionalSummary && <p className="profile-summary">{profile.professionalSummary}</p>}
    </>
  );
}

function ContactForm({
  profile,
  countries,
  onSaved,
  onCancel,
}: {
  profile: ContactProfile | null;
  countries: Country[];
  onSaved: (profile: ContactProfile) => void;
  onCancel?: () => void;
}) {
  const form = useForm<Values>(toValues(profile));
  const { values, set, errors } = form;

  const country = countries.find((item) => item.name === values.country);
  const phoneCountry = countries.find((item) => item.iso === values.phoneCountryIso);
  const [countryText, setCountryText] = useState(country ? countryLabel(country) : values.country);
  const [dialText, setDialText] = useState(phoneCountry ? dialLabel(phoneCountry) : '');
  const cities = country ? (CITIES[country.iso] ?? []) : [];

  function save(current: Values) {
    return api
      .put<ContactProfile>('/api/profile', {
        fullName: blankToNull(current.fullName),
        email: blankToNull(current.email),
        phone: phoneCountry ? blankToNull(current.phone) : null,
        phoneCountryIso: phoneCountry?.iso ?? null,
        phoneCountryCode: phoneCountry?.dial ?? null,
        country: blankToNull(current.country),
        city: blankToNull(current.city),
        linkedInUrl: blankToNull(current.linkedInUrl),
        portfolioUrl: blankToNull(current.portfolioUrl),
        professionalSummary: blankToNull(current.professionalSummary),
      })
      .then(onSaved);
  }

  return (
    <form
      onSubmit={(event) => {
        event.preventDefault();
        void form.submit(save);
      }}
      noValidate
    >
      <div className="field-grid">
        <Field label="Full name" wide error={errors.fullName}>
          {(a11y) => (
            <input {...a11y} autoComplete="name" placeholder="e.g. Alex Morgan" value={values.fullName} onChange={(e) => set('fullName', e.target.value)} />
          )}
        </Field>
        <Field label="Email address" error={errors.email}>
          {(a11y) => (
            <input {...a11y} type="email" autoComplete="email" placeholder="alex@example.com" value={values.email} onChange={(e) => set('email', e.target.value)} />
          )}
        </Field>

        <Field label="Phone number" wide error={errors.phone} hint={phoneCountry ? `Format: ${phoneCountry.format} (without ${phoneCountry.dial})` : 'Select a country code to see its number format.'}>
          {(a11y) => (
            <div className="phone-row">
              <Combobox
                aria-label="Telephone country code"
                text={dialText}
                onTextChange={(text) => {
                  setDialText(text);
                  set('phoneCountryIso', '');
                }}
                options={countries}
                getKey={(c) => c.iso}
                getLabel={(c) => `${c.dial}  ${c.name}`}
                getDetail={(c) => c.iso}
                getSearchText={(c) => `${c.name} ${c.iso} ${c.dial}`}
                onSelect={(c) => {
                  setDialText(dialLabel(c));
                  set('phoneCountryIso', c.iso);
                  set('phone', formatPhone(values.phone, c.format));
                }}
                placeholder="Search code or country"
              />
              <input
                {...a11y}
                type="tel"
                inputMode="numeric"
                autoComplete="tel-national"
                disabled={!phoneCountry}
                placeholder={phoneCountry?.format ?? 'Choose a country code first'}
                value={values.phone}
                onChange={(e) => set('phone', phoneCountry ? formatPhone(e.target.value, phoneCountry.format) : e.target.value)}
              />
            </div>
          )}
        </Field>

        <Field label="Country" error={errors.country}>
          {(a11y) => (
            <Combobox
              {...a11y}
              text={countryText}
              onTextChange={(text) => {
                setCountryText(text);
                set('country', '');
                set('city', '');
              }}
              options={countries}
              getKey={(c) => c.iso}
              getLabel={countryLabel}
              getDetail={(c) => c.iso}
              getSearchText={(c) => `${c.name} ${c.iso}`}
              onSelect={(c) => {
                setCountryText(countryLabel(c));
                set('country', c.name);
                if (c.name !== values.country) set('city', '');
              }}
              placeholder="Search countries"
            />
          )}
        </Field>
        <Field
          label="City"
          error={errors.city}
          hint={!country ? 'Choose a country to see its city list.' : cities.length ? `Common cities in ${country.name}. You can type any other city.` : 'Type your city.'}
        >
          {(a11y) => (
            <Combobox
              {...a11y}
              text={values.city}
              onTextChange={(text) => set('city', text)}
              options={cities}
              getKey={(city) => city}
              getLabel={(city) => city}
              getSearchText={(city) => city}
              onSelect={(city) => set('city', city)}
              disabled={!country}
              allowCustom
              placeholder={country ? `Search cities in ${country.name}` : 'Choose a country first'}
            />
          )}
        </Field>

        <Field label="LinkedIn profile" optional wide error={errors.linkedInUrl}>
          {(a11y) => (
            <input {...a11y} type="url" autoComplete="url" placeholder="https://linkedin.com/in/your-name" value={values.linkedInUrl} onChange={(e) => set('linkedInUrl', e.target.value)} />
          )}
        </Field>
        <Field label="Portfolio or personal website" optional wide error={errors.portfolioUrl}>
          {(a11y) => (
            <input {...a11y} type="url" placeholder="https://your-portfolio.com" value={values.portfolioUrl} onChange={(e) => set('portfolioUrl', e.target.value)} />
          )}
        </Field>
        <Field label="Professional summary" optional wide error={errors.professionalSummary} hint="Keep it factual. JobTracker will tailor it for each role later.">
          {(a11y) => (
            <textarea
              {...a11y}
              rows={5}
              maxLength={5000}
              placeholder="A few sentences about your experience, strengths, and the work you’re looking for."
              value={values.professionalSummary}
              onChange={(e) => set('professionalSummary', e.target.value)}
            />
          )}
        </Field>
      </div>
      <FormActions busy={form.busy} onCancel={onCancel} submitLabel="Save details" status={form.status} />
    </form>
  );
}
