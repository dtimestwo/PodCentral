/**
 * Validation and sanitization utilities
 */

/**
 * Sanitizes a search query for use in Supabase/PostgREST .or() filters.
 * Removes characters that could be used for filter injection.
 */
export function sanitizeSearchQuery(query: string): string {
  return query
    // Remove PostgREST filter syntax characters
    .replace(/[,().]/g, ' ')
    // Escape SQL LIKE wildcards that user might input
    .replace(/[%_]/g, '\\$&')
    // Collapse multiple spaces
    .replace(/\s+/g, ' ')
    // Trim whitespace
    .trim()
    // Limit length to prevent abuse
    .slice(0, 100);
}

/**
 * Validates if a string is a valid UUID v4 format
 */
export function isValidUUID(id: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
}

/**
 * Validates and clamps a number within a range
 */
export function validateRange(value: number, min: number, max: number, defaultValue: number): number {
  if (isNaN(value)) return defaultValue;
  return Math.min(max, Math.max(min, value));
}

/**
 * Sanitizes a string for safe database storage
 * Removes null bytes and limits length
 */
export function sanitizeString(str: string, maxLength: number = 1000): string {
  return str
    .replace(/\0/g, '') // Remove null bytes
    .slice(0, maxLength);
}
