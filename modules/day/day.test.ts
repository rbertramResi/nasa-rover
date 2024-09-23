import { expect, test } from "bun:test";
import { DateAbbreviatedMonthHyphenatedSchema, DateApiSchema, DateLongSchema, DateTwoDigitHyphenSchema } from "./day";

test("DateTwoDigitHyphenSchema", () => {
  expect(DateTwoDigitHyphenSchema.safeParse('02/27/17').success).toBeTrue();
  expect(DateTwoDigitHyphenSchema.safeParse('13/27/17').success).toBeFalse();
  expect(DateTwoDigitHyphenSchema.safeParse('022717').success).toBeFalse();
  expect(DateTwoDigitHyphenSchema.safeParse('').success).toBeFalse();
});

test("DateLongSchema", () => {
  expect(DateLongSchema.safeParse('June 2, 2018').success).toBeTrue();
  expect(DateLongSchema.safeParse('Jun 2, 2018').success).toBeFalse();
  expect(DateLongSchema.safeParse('Foo 2, 2018').success).toBeFalse();
  expect(DateLongSchema.safeParse('').success).toBeFalse();
});

test("DateAbbreviatedMonthHyphenatedSchema", () => {
  expect(DateAbbreviatedMonthHyphenatedSchema.safeParse('Jul-13-2016').success).toBeTrue();
  expect(DateAbbreviatedMonthHyphenatedSchema.safeParse('Jig-13-2016').success).toBeFalse();
  expect(DateAbbreviatedMonthHyphenatedSchema.safeParse('Jul-13-16').success).toBeFalse();
  expect(DateAbbreviatedMonthHyphenatedSchema.safeParse('').success).toBeFalse();
});

test("DateApiSchema", () => {
  expect(DateApiSchema.safeParse('2016-07-16').success).toBeTrue();
  expect(DateApiSchema.safeParse('2016-16-07').success).toBeFalse();
  expect(DateApiSchema.safeParse('2016-1607').success).toBeFalse();
  expect(DateApiSchema.safeParse('20161607').success).toBeFalse();
  expect(DateApiSchema.safeParse('').success).toBeFalse();
});
