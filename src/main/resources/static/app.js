const cityLists = {
  AE: ['Abu Dhabi', 'Dubai', 'Sharjah', 'Ajman', 'Al Ain'],
  AR: ['Buenos Aires', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'],
  AT: ['Vienna', 'Graz', 'Linz', 'Salzburg', 'Innsbruck'],
  AU: ['Sydney', 'Melbourne', 'Brisbane', 'Perth', 'Adelaide', 'Canberra'],
  BD: ['Dhaka', 'Chattogram', 'Khulna', 'Rajshahi', 'Sylhet'],
  BE: ['Brussels', 'Antwerp', 'Ghent', 'Liège', 'Leuven'],
  BR: ['São Paulo', 'Rio de Janeiro', 'Brasília', 'Salvador', 'Belo Horizonte'],
  CA: ['Toronto', 'Vancouver', 'Montreal', 'Calgary', 'Ottawa', 'Edmonton'],
  CH: ['Zürich', 'Geneva', 'Basel', 'Bern', 'Lausanne'],
  CL: ['Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta'],
  CN: ['Shanghai', 'Beijing', 'Shenzhen', 'Guangzhou', 'Chengdu'],
  CO: ['Bogotá', 'Medellín', 'Cali', 'Barranquilla', 'Cartagena'],
  CZ: ['Prague', 'Brno', 'Ostrava', 'Plzeň', 'Liberec'],
  DE: ['Berlin', 'Munich', 'Hamburg', 'Frankfurt', 'Cologne', 'Stuttgart'],
  DK: ['Copenhagen', 'Aarhus', 'Odense', 'Aalborg', 'Esbjerg'],
  EG: ['Cairo', 'Alexandria', 'Giza', 'Luxor', 'Aswan'],
  ES: ['Madrid', 'Barcelona', 'Valencia', 'Seville', 'Málaga', 'Bilbao'],
  FI: ['Helsinki', 'Espoo', 'Tampere', 'Turku', 'Oulu'],
  FR: ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Bordeaux'],
  GB: ['London', 'Manchester', 'Birmingham', 'Edinburgh', 'Glasgow', 'Bristol'],
  GR: ['Athens', 'Thessaloniki', 'Patras', 'Heraklion', 'Larissa'],
  ID: ['Jakarta', 'Surabaya', 'Bandung', 'Medan', 'Yogyakarta'],
  IE: ['Dublin', 'Cork', 'Limerick', 'Galway', 'Waterford'],
  IL: ['Jerusalem', 'Tel Aviv', 'Haifa', 'Beer Sheva', 'Netanya'],
  IN: ['Mumbai', 'Delhi', 'Bengaluru', 'Hyderabad', 'Chennai', 'Pune', 'Kolkata'],
  IT: ['Rome', 'Milan', 'Naples', 'Turin', 'Florence', 'Bologna'],
  JP: ['Tokyo', 'Osaka', 'Yokohama', 'Nagoya', 'Kyoto', 'Fukuoka'],
  KR: ['Seoul', 'Busan', 'Incheon', 'Daegu', 'Daejeon'],
  MX: ['Mexico City', 'Guadalajara', 'Monterrey', 'Puebla', 'Mérida'],
  MY: ['Kuala Lumpur', 'George Town', 'Johor Bahru', 'Kota Kinabalu', 'Kuching'],
  NG: ['Lagos', 'Abuja', 'Kano', 'Ibadan', 'Port Harcourt'],
  NL: ['Amsterdam', 'Rotterdam', 'The Hague', 'Utrecht', 'Eindhoven'],
  NO: ['Oslo', 'Bergen', 'Trondheim', 'Stavanger', 'Tromsø'],
  NZ: ['Auckland', 'Wellington', 'Christchurch', 'Hamilton', 'Dunedin'],
  PH: ['Manila', 'Quezon City', 'Cebu City', 'Davao City', 'Makati'],
  PK: ['Karachi', 'Lahore', 'Islamabad', 'Faisalabad', 'Peshawar'],
  PL: ['Warsaw', 'Kraków', 'Wrocław', 'Gdańsk', 'Poznań'],
  PT: ['Lisbon', 'Porto', 'Braga', 'Coimbra', 'Faro'],
  RO: ['Bucharest', 'Cluj-Napoca', 'Timișoara', 'Iași', 'Brașov'],
  RU: ['Moscow', 'Saint Petersburg', 'Novosibirsk', 'Yekaterinburg', 'Kazan'],
  SA: ['Riyadh', 'Jeddah', 'Mecca', 'Medina', 'Dammam'],
  SE: ['Stockholm', 'Gothenburg', 'Malmö', 'Uppsala', 'Västerås'],
  SG: ['Singapore'],
  TH: ['Bangkok', 'Chiang Mai', 'Phuket', 'Pattaya', 'Khon Kaen'],
  TR: ['Istanbul', 'Ankara', 'İzmir', 'Bursa', 'Antalya', 'Adana', 'Konya', 'Gaziantep', 'Eskişehir', 'Trabzon'],
  UA: ['Kyiv', 'Lviv', 'Odesa', 'Dnipro', 'Kharkiv'],
  US: ['New York', 'Los Angeles', 'Chicago', 'Houston', 'Seattle', 'Boston', 'San Francisco'],
  VN: ['Ho Chi Minh City', 'Hanoi', 'Da Nang', 'Hai Phong', 'Can Tho'],
  ZA: ['Johannesburg', 'Cape Town', 'Durban', 'Pretoria', 'Gqeberha'],
};

const form = document.querySelector('#profile-form');
const statusMessage = document.querySelector('#save-status');
const saveButton = document.querySelector('#save-button');
const profileView = document.querySelector('#profile-view');
const profileEditor = document.querySelector('#profile-editor');
const profileDetails = document.querySelector('#profile-details');
const profileSummary = document.querySelector('#profile-summary');
const viewStatus = document.querySelector('#view-status');
const cancelEdit = document.querySelector('#cancel-edit');
const countrySelect = document.querySelector('#country');
const citySelect = document.querySelector('#city-choice');
const cityValue = document.querySelector('#city');
const cityHint = document.querySelector('#city-hint');
const phoneCountrySelect = document.querySelector('#phone-country');
const phoneCountryIso = document.querySelector('#phone-country-iso');
const phoneCountryCode = document.querySelector('#phone-country-code');
const phoneInput = document.querySelector('#phone');
const phoneFormat = document.querySelector('#phone-format');
let countries = [];
let selectedProfileCountry = null;

function showEditor(show, allowCancel = true) {
  profileEditor.hidden = !show;
  profileView.hidden = show;
  cancelEdit.hidden = !show || !allowCancel;
}

function renderProfile(profile) {
  document.querySelector('#profile-name').textContent = profile.fullName || 'Your profile';
  const items = [
    ['Email', profile.email],
    ['Phone', profile.phone ? `${profile.phoneCountryCode || ''} ${profile.phone}`.trim() : ''],
    ['Location', [profile.city, profile.country].filter(Boolean).join(', ')],
    ['LinkedIn', profile.linkedInUrl],
    ['Website', profile.portfolioUrl],
  ].filter(([, value]) => value);
  profileDetails.replaceChildren();
  for (const [label, value] of items) {
    const term = document.createElement('dt');
    term.textContent = label;
    const description = document.createElement('dd');
    if (label === 'LinkedIn' || label === 'Website') {
      try {
        const url = new URL(value);
        if (url.protocol === 'https:' || url.protocol === 'http:') {
          const link = document.createElement('a');
          link.href = url.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = value;
          description.append(link);
        } else {
          description.textContent = value;
        }
      } catch {
        description.textContent = value;
      }
    } else {
      description.textContent = value;
    }
    profileDetails.append(term, description);
  }
  profileSummary.textContent = profile.professionalSummary || '';
  profileSummary.hidden = !profile.professionalSummary;
  viewStatus.textContent = 'Your saved profile is up to date.';
  showEditor(false);
}

function csrfValue() {
  const cookie = document.cookie.split('; ').find((part) => part.startsWith('XSRF-TOKEN='));
  return cookie ? decodeURIComponent(cookie.slice('XSRF-TOKEN='.length)) : '';
}

async function loadCsrf() {
  const response = await fetch('/api/auth/csrf');
  if (!response.ok) return;
  const csrf = await response.json();
  document.querySelectorAll('.csrf-field').forEach((field) => {
    field.name = csrf.parameterName;
    field.value = csrf.token;
  });
}

function flagFor(iso) {
  return [...iso].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');
}

function normalizeForSearch(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function setStatus(message, kind = '') {
  statusMessage.textContent = message;
  statusMessage.className = `save-status ${kind}`.trim();
}

function formatPhoneDigits(digits, template) {
  const groups = template.match(/x+/g) ?? ['x'.repeat(15)];
  const separators = template.split(/x+/);
  let result = '';
  let offset = 0;

  if (digits.length && separators[0]) result += separators[0];
  for (let index = 0; index < groups.length; index += 1) {
    const groupDigits = digits.slice(offset, offset + groups[index].length);
    result += groupDigits;
    offset += groupDigits.length;
    if (groupDigits.length < groups[index].length) break;

    if (index < groups.length - 1) {
      const separator = separators[index + 1] ?? '';
      if (offset < digits.length) result += separator;
      else result += separator.match(/[)\]}]+/g)?.join('') ?? '';
    }
  }
  return result;
}

function countDigits(value) {
  return value.replace(/\D/g, '').length;
}

function caretAfterDigits(value, digitCount) {
  if (digitCount <= 0) return 0;
  let seen = 0;
  for (let index = 0; index < value.length; index += 1) {
    if (/\d/.test(value[index])) seen += 1;
    if (seen === digitCount) return index + 1;
  }
  return value.length;
}

function applyPhoneMask() {
  const country = countries.find((item) => item.iso === phoneCountryIso.value);
  if (!country) {
    phoneInput.value = phoneInput.value.replace(/\D/g, '').slice(0, 15);
    return;
  }

  const previousValue = phoneInput.value;
  const previousCaret = phoneInput.selectionStart ?? previousValue.length;
  const digitsBeforeCaret = countDigits(previousValue.slice(0, previousCaret));
  const digitLimit = (country.format.match(/x/g) ?? []).length;
  const digits = previousValue.replace(/\D/g, '').slice(0, digitLimit);
  const formatted = formatPhoneDigits(digits, country.format);
  phoneInput.value = formatted;
  const safeDigitCaret = Math.min(digitsBeforeCaret, digits.length);
  const newCaret = caretAfterDigits(formatted, safeDigitCaret);
  phoneInput.setSelectionRange(newCaret, newCaret);
}

phoneInput.addEventListener('input', applyPhoneMask);

function createSearchableDropdown({ input, popup, getOptions, getSearchText, getDisplayValue, renderOption, onSelect, onInput, allowCustom = false }) {
  let matches = [];
  let activeIndex = -1;

  function close() {
    popup.hidden = true;
    input.setAttribute('aria-expanded', 'false');
    input.removeAttribute('aria-activedescendant');
    activeIndex = -1;
  }

  function highlight(index) {
    if (!matches.length) return;
    activeIndex = (index + matches.length) % matches.length;
    [...popup.querySelectorAll('[role="option"]')].forEach((option, optionIndex) => {
      option.classList.toggle('active', optionIndex === activeIndex);
      option.setAttribute('aria-selected', String(optionIndex === activeIndex));
    });
    const activeOption = popup.querySelectorAll('[role="option"]')[activeIndex];
    input.setAttribute('aria-activedescendant', activeOption.id);
    activeOption.scrollIntoView({ block: 'nearest' });
  }

  function render() {
    const query = normalizeForSearch(input.value.trim());
    matches = getOptions().filter((option) => normalizeForSearch(getSearchText(option)).includes(query));
    popup.replaceChildren();
    activeIndex = -1;

    for (const [index, option] of matches.entries()) {
      const row = document.createElement('div');
      row.id = `${popup.id}-option-${index}`;
      row.className = 'combo-option';
      row.setAttribute('role', 'option');
      row.setAttribute('aria-selected', 'false');
      row.append(renderOption(option));
      row.addEventListener('mousedown', (event) => event.preventDefault());
      row.addEventListener('click', () => {
        input.value = getDisplayValue(option);
        onSelect(option);
        close();
      });
      popup.append(row);
    }

    if (!matches.length) {
      const empty = document.createElement('div');
      empty.className = 'combo-empty';
      empty.textContent = allowCustom ? 'No match. Your typed value can still be used.' : 'No matches found.';
      popup.append(empty);
    }

    popup.hidden = false;
    input.setAttribute('aria-expanded', 'true');
  }

  input.addEventListener('focus', render);
  input.addEventListener('input', () => {
    onInput?.(input.value);
    render();
  });
  input.addEventListener('keydown', (event) => {
    if (event.key === 'ArrowDown') {
      event.preventDefault();
      if (popup.hidden) render();
      highlight(activeIndex + 1);
    } else if (event.key === 'ArrowUp') {
      event.preventDefault();
      if (popup.hidden) render();
      highlight(activeIndex < 0 ? matches.length - 1 : activeIndex - 1);
    } else if (event.key === 'Enter') {
      if (activeIndex >= 0 && matches[activeIndex]) {
        event.preventDefault();
        const option = matches[activeIndex];
        input.value = getDisplayValue(option);
        onSelect(option);
        close();
      } else if (allowCustom && input.value.trim()) {
        close();
      } else if (matches.length === 1) {
        event.preventDefault();
        input.value = getDisplayValue(matches[0]);
        onSelect(matches[0]);
        close();
      }
    } else if (event.key === 'Escape') {
      close();
    }
  });
  input.addEventListener('blur', () => window.setTimeout(close, 120));

  return { refresh: render, close };
}

function optionLabel(text, detail = '') {
  const wrapper = document.createElement('span');
  wrapper.className = 'combo-option-content';
  const title = document.createElement('span');
  title.className = 'combo-option-title';
  title.textContent = text;
  wrapper.append(title);
  if (detail) {
    const subtitle = document.createElement('span');
    subtitle.className = 'combo-option-detail';
    subtitle.textContent = detail;
    wrapper.append(subtitle);
  }
  return wrapper;
}

let countryDropdown;
let phoneDropdown;
let cityDropdown;

function countryDisplay(country) {
  return `${flagFor(country.iso)}  ${country.name}`;
}

function phoneDisplay(country) {
  return `${flagFor(country.iso)}  ${country.dial} - ${country.name}`;
}

function chooseCountry(country) {
  selectedProfileCountry = country;
  countrySelect.value = countryDisplay(country);
  document.querySelector('#country-value').value = country.name;
  citySelect.disabled = false;
  citySelect.placeholder = `Search cities in ${country.name}`;
  citySelect.value = '';
  cityValue.value = '';
  cityHint.textContent = cityLists[country.iso]?.length
    ? `Showing common cities in ${country.name}. Type to search or enter another city.`
    : `No city suggestions for ${country.name} yet. Type your city here.`;
  cityDropdown.refresh();
}

function choosePhoneCountry(country) {
  phoneCountryIso.value = country.iso;
  phoneCountryCode.value = country.dial;
  phoneCountrySelect.value = phoneDisplay(country);
  phoneInput.disabled = false;
  phoneInput.placeholder = country.format;
  phoneFormat.textContent = `Format: ${country.format} (without ${country.dial})`;
  applyPhoneMask();
}

function initializeDropdowns() {
  countryDropdown = createSearchableDropdown({
    input: countrySelect,
    popup: document.querySelector('#country-options'),
    getOptions: () => countries,
    getSearchText: (country) => `${country.name} ${country.iso}`,
    getDisplayValue: countryDisplay,
    renderOption: (country) => optionLabel(countryDisplay(country), country.iso),
    onInput: () => {
      selectedProfileCountry = null;
      document.querySelector('#country-value').value = '';
      citySelect.disabled = true;
      citySelect.value = '';
      cityValue.value = '';
      citySelect.placeholder = 'Choose a country first';
      cityHint.textContent = 'Choose a country to see its city list.';
      cityDropdown?.refresh();
    },
    onSelect: chooseCountry,
  });

  phoneDropdown = createSearchableDropdown({
    input: phoneCountrySelect,
    popup: document.querySelector('#phone-country-options'),
    getOptions: () => countries,
    getSearchText: (country) => `${country.name} ${country.iso} ${country.dial}`,
    getDisplayValue: phoneDisplay,
    renderOption: (country) => optionLabel(`${country.dial}  ${country.name}`, country.iso),
    onInput: () => {
      phoneCountryIso.value = '';
      phoneCountryCode.value = '';
      phoneInput.disabled = true;
      phoneInput.placeholder = 'Choose a country code first';
      phoneFormat.textContent = 'Select a country code to see its number format.';
    },
    onSelect: choosePhoneCountry,
  });

  cityDropdown = createSearchableDropdown({
    input: citySelect,
    popup: document.querySelector('#city-options'),
    getOptions: () => (selectedProfileCountry ? (cityLists[selectedProfileCountry.iso] ?? []) : []),
    getSearchText: (city) => city,
    getDisplayValue: (city) => city,
    renderOption: (city) => optionLabel(city),
    onInput: (value) => { cityValue.value = value; },
    onSelect: (city) => { cityValue.value = city; },
    allowCustom: true,
  });
}

async function loadProfile() {
  const response = await fetch('/api/profile');
  if (response.status === 404) {
    setStatus('Your profile is ready to fill in.');
    showEditor(true, false);
    return;
  }
  if (!response.ok) throw new Error(`Could not load profile (${response.status}).`);

  const profile = await response.json();
  for (const [key, value] of Object.entries(profile)) {
    if (key === 'country' || key === 'phoneCountryIso' || key === 'phoneCountryCode' || key === 'city') continue;
    const field = form.elements.namedItem(key);
    if (field && typeof value === 'string') field.value = value;
  }
  const country = countries.find((item) => item.name === profile.country);
  if (country) chooseCountry(country);
  if (profile.city) {
    citySelect.value = profile.city;
    cityValue.value = profile.city;
  }
  const phoneCountry = countries.find((item) => item.iso === profile.phoneCountryIso);
  if (phoneCountry) choosePhoneCountry(phoneCountry);
  renderProfile(profile);
  setStatus('Your saved profile is loaded.');
}

document.querySelector('#edit-profile').addEventListener('click', () => showEditor(true));
cancelEdit.addEventListener('click', () => {
  form.reset();
  loadProfile().catch((error) => setStatus(error.message, 'error'));
});

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  saveButton.disabled = true;
  setStatus('Saving your profile…');

  const profile = Object.fromEntries(new FormData(form).entries());
  try {
    const response = await fetch('/api/profile', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'X-XSRF-TOKEN': csrfValue() },
      body: JSON.stringify(profile),
    });
    if (!response.ok) {
      const detail = await response.text();
      throw new Error(detail || `Could not save profile (${response.status}).`);
    }
    renderProfile(await response.json());
    setStatus('Profile saved on this computer.', 'success');
  } catch (error) {
    setStatus(error.message || 'Could not save your profile.', 'error');
  } finally {
    saveButton.disabled = false;
  }
});

async function initialize() {
  try {
    const response = await fetch('/api/metadata/countries');
    if (!response.ok) throw new Error(`Could not load country list (${response.status}).`);
    countries = await response.json();
    initializeDropdowns();
    await loadCsrf();
    await loadProfile();
  } catch (error) {
    setStatus(error.message || 'Could not load the profile form.', 'error');
  }
}

initialize();
