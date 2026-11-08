import { describe, expect, it } from 'vitest';
import { toApiError } from './api';
import { blankToNull, formatMonth, formatPeriod, formatPhone, normalizeForSearch, numberOrNull, safeHref } from './format';

describe('dates', () => {
  it('formats ISO dates as month and year without timezone drift', () => {
    expect(formatMonth('2022-03-01')).toBe('Mar 2022');
    expect(formatMonth('2024-12-31')).toBe('Dec 2024');
    expect(formatMonth(null)).toBe('');
  });

  it('describes periods', () => {
    expect(formatPeriod('2022-03-01', null, true)).toBe('Mar 2022 – Present');
    expect(formatPeriod('2020-01-15', '2021-06-01')).toBe('Jan 2020 – Jun 2021');
    expect(formatPeriod(null, '2021-06-01')).toBe('Jun 2021');
    expect(formatPeriod(null, null)).toBe('');
  });
});

describe('form values', () => {
  it('maps blanks to null', () => {
    expect(blankToNull('  ')).toBeNull();
    expect(blankToNull(' Acme ')).toBe('Acme');
    expect(numberOrNull('')).toBeNull();
    expect(numberOrNull('30')).toBe(30);
    expect(numberOrNull('abc')).toBeNull();
  });

  it('searches without case or accents', () => {
    expect(normalizeForSearch('İzmir')).toContain('izmir');
    expect(normalizeForSearch('Málaga')).toBe('malaga');
  });

  it('only links http(s) URLs', () => {
    expect(safeHref('https://linkedin.com/in/me')).toBe('https://linkedin.com/in/me');
    expect(safeHref('javascript:alert(1)')).toBeNull();
    expect(safeHref('not a url')).toBeNull();
  });
});

describe('formatPhone', () => {
  it('applies a country template as digits are typed', () => {
    expect(formatPhone('5321234567', 'xxx xxx xx xx')).toBe('532 123 45 67');
    expect(formatPhone('532', 'xxx xxx xx xx')).toBe('532');
    expect(formatPhone('5321', 'xxx xxx xx xx')).toBe('532 1');
    expect(formatPhone('53212345678999', 'xxx xxx xx xx')).toBe('532 123 45 67');
    expect(formatPhone('20 7946-0958', '(xx) xxxx xxxx')).toBe('(20) 7946 0958');
    expect(formatPhone('', 'xxx')).toBe('');
  });
});

describe('toApiError', () => {
  it('reads the server message and field errors', () => {
    const error = toApiError(400, JSON.stringify({ message: 'Please correct the highlighted fields.', fieldErrors: { company: 'must not be blank' } }));
    expect(error.message).toBe('Please correct the highlighted fields.');
    expect(error.fieldErrors).toEqual({ company: 'must not be blank' });
  });

  it('falls back to a readable message for non-JSON bodies', () => {
    expect(toApiError(409, '<html>').message).toBe('That item already exists.');
    expect(toApiError(502, '').message).toContain('502');
  });
});
