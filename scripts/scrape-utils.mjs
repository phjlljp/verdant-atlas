/**
 * Shared scraping utilities for rareseeds.com vegetable data collection.
 * Used by scrape-vegetables.mjs and other scraper scripts.
 */

/**
 * Wait for a specified number of milliseconds.
 * @param {number} ms - Milliseconds to wait
 * @returns {Promise<void>}
 */
export function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Random delay between min and max milliseconds (inclusive).
 * Useful for polite scraping with jitter.
 * @param {number} min - Minimum ms
 * @param {number} max - Maximum ms
 * @returns {Promise<void>}
 */
export function randomDelay(min = 1000, max = 3000) {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return delay(ms);
}

/**
 * Retry an async function up to `maxAttempts` times with exponential backoff.
 * @param {Function} fn - Async function to retry
 * @param {object} options
 * @param {number} [options.maxAttempts=3] - Maximum number of attempts
 * @param {number} [options.baseDelay=2000] - Base delay in ms before first retry
 * @param {string} [options.label='operation'] - Label for error messages
 * @returns {Promise<*>} Result of fn()
 */
export async function retry(fn, { maxAttempts = 3, baseDelay = 2000, label = 'operation' } = {}) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err) {
      if (attempt === maxAttempts) {
        throw new Error(`${label} failed after ${maxAttempts} attempts: ${err.message}`);
      }
      const waitMs = baseDelay * Math.pow(2, attempt - 1);
      await delay(waitMs);
    }
  }
}

/**
 * Extract a URL slug from a full rareseeds.com product URL.
 * e.g. "https://www.rareseeds.com/tomato-brandywine" -> "tomato-brandywine"
 * @param {string} url - Full product URL or path
 * @returns {string} The slug portion
 */
export function extractSlug(url) {
  const cleaned = url.replace(/\/+$/, '');
  const parts = cleaned.split('/');
  return parts[parts.length - 1];
}

/**
 * Parse days-to-maturity from a product description string.
 * Looks for patterns like "65 days", "70-80 days to maturity", "matures in 60 days".
 * @param {string} text - Product description text
 * @returns {number|null} Days to maturity or null if not found
 */
export function parseDaysToMaturity(text) {
  if (!text) return null;

  const patterns = [
    /(\d{2,3})\s*[-–]\s*(\d{2,3})\s*days?\s*(?:to\s+)?(?:maturity|harvest|mature)/i,
    /(?:maturity|matures?|harvest|ready)\s*(?:in\s+)?(\d{2,3})\s*[-–]\s*(\d{2,3})\s*days?/i,
    /(\d{2,3})\s*[-–]\s*(\d{2,3})\s*days?/i,
    /(\d{2,3})\s*days?\s*(?:to\s+)?(?:maturity|harvest|mature)/i,
    /(?:maturity|matures?|harvest|ready)\s*(?:in\s+)?(\d{2,3})\s*days?/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        return Math.round((parseInt(match[1], 10) + parseInt(match[2], 10)) / 2);
      }
      return parseInt(match[1], 10);
    }
  }

  return null;
}

/**
 * Parse germination information from a product description.
 * Looks for patterns like "germination 7-14 days", "germinates in 10 days".
 * @param {string} text - Product description text
 * @returns {{ days: number|null, tempF: number|null }} Germination data
 */
export function parseGermination(text) {
  if (!text) return { days: null, tempF: null };

  let days = null;
  let tempF = null;

  const dayPatterns = [
    /germinat\w*\s*(?:in\s+)?(\d{1,3})\s*[-–]\s*(\d{1,3})\s*days?/i,
    /germinat\w*\s*(?:in\s+)?(\d{1,3})\s*days?/i,
    /(\d{1,3})\s*[-–]\s*(\d{1,3})\s*days?\s*(?:to\s+)?germinat/i,
    /(\d{1,3})\s*days?\s*(?:to\s+)?germinat/i,
  ];

  for (const pattern of dayPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        days = Math.round((parseInt(match[1], 10) + parseInt(match[2], 10)) / 2);
      } else {
        days = parseInt(match[1], 10);
      }
      break;
    }
  }

  const tempPatterns = [
    /germinat\w*[^.]*?(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°?\s*F/i,
    /germinat\w*[^.]*?(\d{2,3})\s*°?\s*F/i,
    /(\d{2,3})\s*[-–]\s*(\d{2,3})\s*°?\s*F[^.]*?germinat/i,
  ];

  for (const pattern of tempPatterns) {
    const match = text.match(pattern);
    if (match) {
      if (match[2]) {
        tempF = Math.round((parseInt(match[1], 10) + parseInt(match[2], 10)) / 2);
      } else {
        tempF = parseInt(match[1], 10);
      }
      break;
    }
  }

  return { days, tempF };
}

/**
 * Extract a Cloudinary image path from a full image src URL.
 * Strips the rareseeds Cloudinary base prefix, returning the relative path.
 * @param {string} src - Full image URL
 * @returns {string} Relative path suitable for IMAGE_MAP
 */
export function extractImagePath(src) {
  if (!src) return '';

  // Strip known Cloudinary base patterns
  const cloudinaryPattern = /\/v\d+\//;
  const match = src.match(cloudinaryPattern);
  if (match) {
    return src.slice(match.index + match[0].length);
  }

  // Fallback: extract path after the domain
  try {
    const url = new URL(src);
    return url.pathname.replace(/^\//, '');
  } catch {
    return src;
  }
}
