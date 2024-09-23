export type Result<Ok, Err> = { ok: true, value: Ok } | { ok: false, value: Err };
export type Nullish<T> = T | null | undefined;
