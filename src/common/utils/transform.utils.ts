/**
 * Convert snake_case to camelCase
 */
export function toCamelCase(obj: any): any {
  if (!obj) return obj;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    result[camelKey] = value;
  }
  return result;
}

/**
 * Convert camelCase to snake_case
 */
export function toSnakeCase(obj: any): any {
  if (!obj) return obj;
  const result: any = {};
  for (const [key, value] of Object.entries(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    result[snakeKey] = value;
  }
  return result;
}
