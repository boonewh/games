// Story dates are stored as plain calendar dates ("2026-11-21").
// `new Date("2026-11-21")` reads that as midnight UTC, which displays as the
// previous day anywhere west of Greenwich. Parse it as a local date instead.
export function storyDate(value: string): Date {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value)
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]))
  return new Date(value)
}
