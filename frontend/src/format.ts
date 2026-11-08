/** Parses "YYYY-MM-DD" as a local calendar date (new Date("...") would shift it by the UTC offset). */
function parseIsoDate(value: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  return match ? new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3])) : null;
}

const monthYear = new Intl.DateTimeFormat('en-GB', { month: 'short', year: 'numeric' });

/** "2022-03-01" → "Mar 2022". */
export function formatMonth(value: string | null | undefined): string {
  if (!value) return '';
  const date = parseIsoDate(value);
  return date ? monthYear.format(date) : value;
}

/** "Mar 2022 – Present", "Mar 2022 – Jan 2024", or "" when nothing is known. */
export function formatPeriod(start: string | null, end: string | null, current = false): string {
  const from = formatMonth(start);
  const to = current ? 'Present' : formatMonth(end);
  if (from && to) return `${from} – ${to}`;
  return from || to;
}

/** Form inputs hold strings; the API expects null for "not provided". */
export function blankToNull(value: string): string | null {
  const trimmed = value.trim();
  return trimmed === '' ? null : trimmed;
}

export function numberOrNull(value: string): number | null {
  const trimmed = value.trim();
  if (trimmed === '') return null;
  const parsed = Number(trimmed);
  return Number.isFinite(parsed) ? parsed : null;
}

/** Case- and accent-insensitive text for searching ("İzmir" matches "izmir"). */
export function normalizeForSearch(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '').toLocaleLowerCase('en');
}

/** "TR" → 🇹🇷 */
export function flagFor(iso: string): string {
  return [...iso.toUpperCase()].map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0))).join('');
}

/**
 * Formats digits into a country template where "x" is a digit, e.g. ("5321234567", "xxx xxx xx xx")
 * → "532 123 45 67". Extra digits beyond the template are dropped.
 */
export function formatPhone(input: string, template: string): string {
  const groups = template.match(/x+/g) ?? ['x'.repeat(15)];
  const separators = template.split(/x+/);
  const digits = input.replace(/\D/g, '').slice(0, groups.join('').length);
  let result = digits.length && separators[0] ? separators[0] : '';
  let offset = 0;
  for (let index = 0; index < groups.length && offset < digits.length; index += 1) {
    const part = digits.slice(offset, offset + groups[index].length);
    result += part;
    offset += part.length;
    if (offset < digits.length) result += separators[index + 1] ?? '';
  }
  return result;
}

/** Turns an http(s) URL into a link target; anything else is shown as plain text. */
export function safeHref(value: string): string | null {
  try {
    const url = new URL(value);
    return url.protocol === 'https:' || url.protocol === 'http:' ? url.href : null;
  } catch {
    return null;
  }
}
