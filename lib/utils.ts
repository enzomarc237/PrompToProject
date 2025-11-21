/**
 * Escapes special characters in strings for safe use in PocketBase filter queries
 * Prevents filter injection by escaping backslashes and quotes
 */
export const escapeFilter = (str: string): string => {
  return str.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
};
