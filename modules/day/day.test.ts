import { expect, test } from "bun:test";
import { DateHyphenSchema, DateApiSchema, DateLongSchema, DateTwoDigitSlashSchema, toApiSchema } from "./day";

test("DateTwoDigitSlashSchema", () => {
  expect(DateTwoDigitSlashSchema.safeParse('02/27/17').success).toBeTrue();
  expect(DateTwoDigitSlashSchema.safeParse('13/27/17').success).toBeFalse();
  expect(DateTwoDigitSlashSchema.safeParse('022717').success).toBeFalse();
  expect(DateTwoDigitSlashSchema.safeParse('').success).toBeFalse();
});

test("DateLongSchema", () => {
  expect(DateLongSchema.safeParse('June 2, 2018').success).toBeTrue();
  expect(DateLongSchema.safeParse('Jun 2, 2018').success).toBeFalse();
  expect(DateLongSchema.safeParse('Foo 2, 2018').success).toBeFalse();
  expect(DateLongSchema.safeParse('').success).toBeFalse();
});

test("DateHyphenSchema", () => {
  expect(DateHyphenSchema.safeParse('Jul-13-2016').success).toBeTrue();
  expect(DateHyphenSchema.safeParse('Jig-13-2016').success).toBeFalse();
  expect(DateHyphenSchema.safeParse('Jul-13-16').success).toBeFalse();
  expect(DateHyphenSchema.safeParse('').success).toBeFalse();
});

test("DateApiSchema", () => {
  expect(DateApiSchema.safeParse('2016-07-16').success).toBeTrue();
  expect(DateApiSchema.safeParse('2016-16-07').success).toBeFalse();
  expect(DateApiSchema.safeParse('2016-1607').success).toBeFalse();
  expect(DateApiSchema.safeParse('20161607').success).toBeFalse();
  expect(DateApiSchema.safeParse('').success).toBeFalse();
});

test('toApiSchema', () => {
  expect(toApiSchema('2016-07-16').value).toBe('2016-07-16');
  expect(toApiSchema('2016-07-16').ok).toBeTrue();
  expect(toApiSchema('Jul-18-2016').value).toBe('2016-07-18');
  expect(toApiSchema('July 18, 2016').value).toBe('2016-07-18');
  expect(toApiSchema('07/18/16').value).toBe('2016-07-18');

  expect(toApiSchema('070716').ok).toBeFalse();
});
