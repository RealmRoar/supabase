export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

export function hasStringProperty(
  obj: Record<string, unknown>,
  propName: string
): boolean {
  return propName in obj && typeof obj[propName] === "string";
}
