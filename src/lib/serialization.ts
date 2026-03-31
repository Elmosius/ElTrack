export function serializeDate(value: Date | string | null | undefined) {
  if (value == null) {
    return value;
  }

  return value instanceof Date ? value.toISOString() : value;
}

export function stringifyId(value: unknown) {
  return String(value);
}
