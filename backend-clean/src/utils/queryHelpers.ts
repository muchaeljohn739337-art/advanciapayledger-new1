/**
 * Utility functions to handle query parameter type issues
 * Express query parameters can be string | string[] | undefined
 */

export function getQueryString(value: string | string[] | undefined): string {
  if (Array.isArray(value)) {
    return value[0] || '';
  }
  return value || '';
}

export function getQueryStringArray(value: string | string[] | undefined): string[] {
  if (Array.isArray(value)) {
    return value;
  }
  return value ? [value] : [];
}

export function getQueryNumber(value: string | string[] | undefined): number {
  const str = getQueryString(value);
  const num = parseInt(str, 10);
  return isNaN(num) ? 0 : num;
}

export function getQueryBoolean(value: string | string[] | undefined): boolean {
  const str = getQueryString(value).toLowerCase();
  return str === 'true' || str === '1';
}
