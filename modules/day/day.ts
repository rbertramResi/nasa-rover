import { z } from "zod";



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
export const DateTwoDigitHyphenSchema = z.custom<`${string}/${string}/${string}`>((val) => {
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
  return m.length === 2 && d.length === 2 && y.length === 2;
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
export const DateAbbreviatedMonthHyphenatedSchema = z.custom<`${string}-${string}-${string}`>((val) => {
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
