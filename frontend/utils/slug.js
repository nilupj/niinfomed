// utils/slug.js

/**
 * Generate a URL-friendly slug from a string
 */
export function generateSlug(text) {
  if (!text) return '';
  
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special characters
    .replace(/[\s_-]+/g, '-') // Replace spaces, underscores, hyphens with single hyphen
    .replace(/^-+|-+$/g, ''); // Remove leading/trailing hyphens
}

/**
 * Parse condition from URL slug
 * Returns { slug, id } from URLs like /conditions/diabetes-123
 */
export function parseConditionSlug(urlSlug) {
  if (!urlSlug) return { slug: '', id: '' };
  
  const parts = urlSlug.split('-');
  const lastPart = parts[parts.length - 1];
  
  // Check if last part is a numeric ID
  if (/^\d+$/.test(lastPart)) {
    const id = lastPart;
    const slug = parts.slice(0, -1).join('-');
    return { slug, id };
  }
  
  return { slug: urlSlug };
}

/**
 * Normalize slug for comparison (remove IDs, etc.)
 */
export function normalizeSlug(slug) {
  const { slug: cleanSlug } = parseConditionSlug(slug);
  return cleanSlug;
}

/**
 * Format condition URL with proper slug
 */
export function formatConditionUrl(title, id) {
  const slug = generateSlug(title);
  return id ? `/conditions/${slug}-${id}` : `/conditions/${slug}`;
}

/**
 * Extract slug from URL path
 */
export function getSlugFromPath(pathname) {
  const parts = pathname.split('/');
  return parts[parts.length - 1] || '';
}

/**
 * Validate if a string is a valid slug
 */
export function isValidSlug(slug) {
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Generate a unique slug for conditions
 * This would typically be used on the backend, but included for reference
 */
export function generateUniqueSlug(baseText, existingSlugs, maxLength = 60) {
  const baseSlug = generateSlug(baseText).slice(0, maxLength);
  let slug = baseSlug;
  let counter = 1;
  
  // Check for duplicates and append numbers if needed
  while (existingSlugs.includes(slug)) {
    const counterStr = `-${counter}`;
    const truncatedBase = baseSlug.slice(0, maxLength - counterStr.length);
    slug = `${truncatedBase}${counterStr}`;
    counter++;
  }
  
  return slug;
}