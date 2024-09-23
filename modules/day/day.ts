import { z } from "zod";
import type { Nullish, Result } from "../../utils/types";

const MONTHS: Readonly<Record<string, string>> = {
  january: '01',
  february: '02',
  march: '03',
  april: '04',
  may: '05',
  june: '06',
  july: '07',
  august: '08',
  september: '09',
  october: '10',
  november: '11',
  december: '12'
};

const MONTHS_ABBREV: Readonly<Record<string, string>> = {
  jan: '01',
  feb: '02',
  mar: '03',
  apr: '04',
  may: '05',
  jun: '06',
  jul: '07',
  aug: '08',
  sep: '09',
  oct: '10',
  nov: '11',
  dec: '12'
};

// 02/27/17
export const DateTwoDigitSlashSchema = z.custom<`${string}/${string}/${string}`>((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  const [m, d, y] = val.split('/');
  if (!m || !d || !y) {
    return false;
  }
  if (!Object.values(MONTHS_ABBREV).includes(m)) {
    return false;
  }
  return m.length <= 2 && d.length <= 2 && y.length === 2;
});

// June 2, 2018
export const DateLongSchema = z.custom<`${string} ${string}, ${string}`>((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  const [md, y] = val.split(', ');
  if (!md || !y) {
    return false;
  }
  const [m, d] = md.split(' ');
  if (!m || !d) {
    return false;
  }
  if (!Object.keys(MONTHS).includes(m.toLowerCase())) {
    return false;
  }
  return y.length === 4 && d.length <= 2;
});

// Jul-13-2016
export const DateHyphenSchema = z.custom<`${string}-${string}-${string}`>((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  const [m, d, y] = val.split('-');
  if (!m || !d || !y) {
    return false;
  }
  if (!Object.keys(MONTHS_ABBREV).includes(m.toLowerCase())) {
    return false;
  }
  return y.length === 4 && d.length <= 2;
});


// YYYY-MM-DD
export const DateApiSchema = z.custom<`${string}-${string}-${string}`>((val) => {
  if (typeof val !== 'string') {
    return false;
  }
  const [y, m, d] = val.split('-');
  if (!m || !d || !y) {
    return false;
  }
  if (!Object.values(MONTHS_ABBREV).includes(m.toLowerCase())) {
    return false;
  }
  return y.length === 4 && d.length <= 2;
});

export const DateInputSchema = z.union([DateApiSchema, DateHyphenSchema, DateLongSchema, DateTwoDigitSlashSchema]);
export type DateInput = z.infer<typeof DateInputSchema>;
export type DateApiFormat = z.infer<typeof DateApiSchema>;


export function toApiSchema(input: string): Result<DateApiFormat, null> {
  const apiSchemaResult = DateApiSchema.safeParse(input);
  if (apiSchemaResult.success) {
    return { ok: true, value: apiSchemaResult.data }
  }

  const slashSchemaResult = DateTwoDigitSlashSchema.safeParse(input);
  if (slashSchemaResult.success) {
    const [m, d, y] = slashSchemaResult.data.split('/');
    assertString(m);
    assertString(d);
    return { ok: true, value: `20${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` }
  }

  const longSchemaResult = DateLongSchema.safeParse(input);
  if (longSchemaResult.success) {
    const [md, y] = longSchemaResult.data.split(', ');
    assertString(md);
    const [m, d] = md.split(' ');
    assertString(m);
    assertString(d);
    return { ok: true, value: `${y}-${MONTHS[m.toLowerCase()]}-${d.padStart(2, '0')}` };
  }

  const hyphenSchemaResult = DateHyphenSchema.safeParse(input);
  if (hyphenSchemaResult.success) {
    const [m, d, y] = hyphenSchemaResult.data.split('-');
    assertString(d);
    assertString(m);
    return { ok: true, value: `${y}-${MONTHS_ABBREV[m.toLowerCase()]}-${d.padStart(2, '0')}` }

  }
  return { ok: false, value: null };
}

// assert string where schema already validated format such that we know a value will be defined
function assertString(value: Nullish<string>): asserts value is string {
  if (value == null) {
    throw new Error('unexpected nullish value');
  }
}
