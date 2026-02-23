/**
 * Vegetable seed scraper for rareseeds.com
 *
 * Phase 1: Crawl all vegetable category pages, extract product names and URL slugs.
 * Phase 2: Visit each product URL to extract detailed growing data.
 *
 * Usage:
 *   npx playwright install chromium
 *   node scripts/scrape-vegetables.mjs
 *
 * Output:
 *   scripts/output/vegetable-urls.json    (Phase 1)
 *   scripts/output/vegetable-details.json (Phase 2)
 */

import { chromium } from 'playwright';
import { writeFile, readFile, mkdir } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  randomDelay,
  retry,
  extractSlug,
  parseDaysToMaturity,
  parseGermination,
  extractImagePath,
} from './scrape-utils.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR = join(__dirname, 'output');
const OUTPUT_FILE = join(OUTPUT_DIR, 'vegetable-urls.json');
const DETAILS_FILE = join(OUTPUT_DIR, 'vegetable-details.json');

const BASE_URL = 'https://www.rareseeds.com';

/**
 * All verified vegetable category URLs with subcategories.
 * Source: research.json verified_vegetable_category_urls
 */
const CATEGORIES = [
  { name: 'Amaranth', url: '/store/plants-seeds/vegetable-seeds/amaranth-seeds' },
  { name: 'Artichoke & Cardoon', url: '/store/plants-seeds/vegetable-seeds/artichoke-seeds' },
  { name: 'Arugula', url: '/store/plants-seeds/vegetable-seeds/arugula-seeds' },
  { name: 'Asparagus', url: '/store/plants-seeds/vegetable-seeds/asparagus-seeds' },
  {
    name: 'Beans', url: '/store/plants-seeds/vegetable-seeds/beans-seeds',
    subcategories: [
      { name: 'Common/Green Beans', url: '/store/plants-seeds/vegetable-seeds/beans-seeds/beans-common-seeds' },
      { name: 'Fava & Broad Beans', url: '/store/plants-seeds/vegetable-seeds/beans-seeds/fava-and-broad-beans-seeds' },
      { name: 'Runner Beans', url: '/store/plants-seeds/vegetable-seeds/beans-seeds/runner-bean-seeds' },
      { name: 'Soybeans', url: '/store/plants-seeds/vegetable-seeds/beans-seeds/soya-bean-seeds' },
    ],
  },
  { name: 'Beets', url: '/store/plants-seeds/vegetable-seeds/beetroot-seeds' },
  { name: 'Bitter Melon', url: '/store/plants-seeds/vegetable-seeds/bitter-melon-seeds' },
  { name: 'Broccoli', url: '/store/plants-seeds/vegetable-seeds/broccoli-seeds' },
  { name: 'Brussels Sprouts', url: '/store/plants-seeds/vegetable-seeds/brussels-sprouts-seeds' },
  { name: 'Buckwheat', url: '/store/plants-seeds/vegetable-seeds/buckwheat-seeds' },
  { name: 'Cabbage', url: '/store/plants-seeds/vegetable-seeds/cabbage-seeds' },
  { name: 'Carrots', url: '/store/plants-seeds/vegetable-seeds/carrots-seeds' },
  { name: 'Cauliflower', url: '/store/plants-seeds/vegetable-seeds/cauliflower-seeds' },
  { name: 'Corn', url: '/store/plants-seeds/vegetable-seeds/corn-seeds' },
  { name: 'Cucumbers', url: '/store/plants-seeds/vegetable-seeds/cucumber-seeds' },
  { name: 'Eggplant', url: '/store/plants-seeds/vegetable-seeds/eggplant-seeds' },
  { name: 'Jelly Melon', url: '/store/plants-seeds/vegetable-seeds/jelly-melon-seeds' },
  { name: 'Kale', url: '/store/plants-seeds/vegetable-seeds/kale-seeds' },
  { name: 'Kohlrabi', url: '/store/plants-seeds/vegetable-seeds/kohlrabi-seeds' },
  { name: 'Leeks', url: '/store/plants-seeds/vegetable-seeds/leek-seeds' },
  { name: 'Lettuce', url: '/store/plants-seeds/vegetable-seeds/lettuce-seeds' },
  { name: 'Melons', url: '/store/plants-seeds/vegetable-seeds/melon-seeds' },
  { name: 'Okra', url: '/store/plants-seeds/vegetable-seeds/okra-seeds' },
  { name: 'Onions', url: '/store/plants-seeds/vegetable-seeds/onion-seeds' },
  { name: 'Parsnips', url: '/store/plants-seeds/vegetable-seeds/parsnip-seeds' },
  { name: 'Peanuts', url: '/store/plants-seeds/vegetable-seeds/peanut-seeds' },
  { name: 'Peas', url: '/store/plants-seeds/vegetable-seeds/pea-seeds' },
  {
    name: 'Peppers', url: '/store/plants-seeds/vegetable-seeds/pepper-seeds',
    subcategories: [
      { name: 'Hot Peppers', url: '/store/plants-seeds/vegetable-seeds/pepper-seeds/hot-pepper-seeds' },
      { name: 'Sweet Peppers', url: '/store/plants-seeds/vegetable-seeds/pepper-seeds/sweet-pepper-seeds' },
    ],
  },
  { name: 'Potatoes', url: '/store/plants-seeds/vegetable-seeds/potatoes' },
  { name: 'Radishes', url: '/store/plants-seeds/vegetable-seeds/radish-seeds' },
  { name: 'Rutabaga', url: '/store/plants-seeds/vegetable-seeds/rutabaga-seeds' },
  { name: 'Spinach', url: '/store/plants-seeds/vegetable-seeds/spinach-seeds' },
  {
    name: 'Squash', url: '/store/plants-seeds/vegetable-seeds/squash-seeds',
    subcategories: [
      { name: 'Summer Squash', url: '/store/plants-seeds/vegetable-seeds/squash-seeds/summer-squash-seeds' },
      { name: 'Winter Squash', url: '/store/plants-seeds/vegetable-seeds/squash-seeds/winter-squash-seeds' },
    ],
  },
  {
    name: 'Tomatoes', url: '/store/plants-seeds/vegetable-seeds/heirloom-tomato-seeds',
    subcategories: [
      { name: 'Blue & Purple', url: '/store/plants-seeds/plants/heirloom-tomato-seeds/blue-tomato-seeds' },
      { name: 'Cherry & Grape', url: '/store/plants-seeds/plants/heirloom-tomato-seeds/cherry-tomato-seeds' },
      { name: 'Pink & Red', url: '/store/plants-seeds/plants/heirloom-tomato-seeds/pink-tomato-seeds' },
      { name: 'Striped', url: '/store/plants-seeds/plants/heirloom-tomato-seeds/striped-tomato-seeds' },
    ],
  },
  { name: 'Turnips', url: '/store/plants-seeds/vegetable-seeds/turnip-seeds' },
  { name: 'Watermelons', url: '/store/plants-seeds/vegetable-seeds/watermelon-seeds' },
  { name: 'Wheat', url: '/store/plants-seeds/vegetable-seeds/wheat-seeds' },
];

/**
 * Extract product links from a category listing page.
 * Returns an array of { name, url, slug } objects.
 */
async function extractProductLinks(page) {
  return page.$$eval(
    'a[href]',
    (anchors, baseUrl) => {
      const products = [];
      const seen = new Set();

      for (const a of anchors) {
        const href = a.getAttribute('href') || '';
        const text = (a.textContent || '').trim();

        // Product links are root-level URLs (no /store/ prefix)
        // They appear as absolute URLs or relative paths like /product-slug
        const fullUrl = href.startsWith('http') ? href : `${baseUrl}${href}`;

        // Skip non-product links
        if (
          href.includes('/store/') ||
          href.includes('/customer/') ||
          href.includes('/checkout/') ||
          href.includes('/catalogsearch/') ||
          href.includes('#') ||
          href.includes('javascript:') ||
          href === '/' ||
          !text ||
          text.length < 3
        ) {
          continue;
        }

        // Product URLs should match rareseeds.com root-level pattern
        try {
          const url = new URL(fullUrl);
          if (url.hostname !== 'www.rareseeds.com') continue;

          const path = url.pathname.replace(/\/+$/, '');
          const segments = path.split('/').filter(Boolean);

          // Product URLs are single-segment root paths (e.g., /tomato-brandywine)
          if (segments.length !== 1) continue;

          const slug = segments[0];

          // Skip common non-product root pages
          if (['store', 'customer', 'checkout', 'cart', 'about', 'contact', 'blog'].includes(slug)) {
            continue;
          }

          if (seen.has(slug)) continue;
          seen.add(slug);

          products.push({
            name: text.replace(/\s+/g, ' ').trim(),
            url: `${baseUrl}/${slug}`,
            slug,
          });
        } catch {
          // Skip invalid URLs
        }
      }

      return products;
    },
    BASE_URL,
  );
}

/**
 * Check for a "next page" link and return its URL, or null if none.
 */
async function getNextPageUrl(page) {
  return page.evaluate((baseUrl) => {
    // Look for pagination next links
    const selectors = [
      'a.action.next',
      'a[title="Next"]',
      'li.pages-item-next a',
      '.pages .next',
      'a[rel="next"]',
    ];

    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) {
        const href = el.getAttribute('href');
        if (href) {
          return href.startsWith('http') ? href : `${baseUrl}${href}`;
        }
      }
    }

    return null;
  }, BASE_URL);
}

/**
 * Scrape all products from a single category page URL, following pagination.
 */
async function scrapeCategory(page, categoryUrl, categoryName, subcategoryName) {
  const allProducts = [];
  let currentUrl = `${BASE_URL}${categoryUrl}`;
  let pageNum = 1;

  while (currentUrl) {
    const label = subcategoryName
      ? `${categoryName} > ${subcategoryName} (page ${pageNum})`
      : `${categoryName} (page ${pageNum})`;

    const products = await retry(
      async () => {
        await page.goto(currentUrl, { waitUntil: 'networkidle', timeout: 30000 });
        return extractProductLinks(page);
      },
      { maxAttempts: 3, label: `Scrape ${label}` },
    );

    allProducts.push(...products);

    const nextUrl = await getNextPageUrl(page);
    if (nextUrl && nextUrl !== currentUrl) {
      currentUrl = nextUrl;
      pageNum++;
      await randomDelay(1000, 2000);
    } else {
      currentUrl = null;
    }
  }

  return allProducts;
}

/**
 * Phase 1: Crawl all vegetable category URLs and extract product links.
 * Categories with subcategories are crawled at the subcategory level.
 */
async function phase1CrawlCategories(browser) {
  const page = await browser.newPage();
  const results = [];
  const globalSeen = new Set();

  for (const category of CATEGORIES) {
    const urlsToScrape = category.subcategories
      ? category.subcategories.map((sub) => ({
          url: sub.url,
          categoryName: category.name,
          subcategoryName: sub.name,
        }))
      : [{ url: category.url, categoryName: category.name, subcategoryName: null }];

    for (const { url, categoryName, subcategoryName } of urlsToScrape) {
      try {
        const products = await scrapeCategory(page, url, categoryName, subcategoryName);

        for (const product of products) {
          if (globalSeen.has(product.slug)) continue;
          globalSeen.add(product.slug);

          results.push({
            ...product,
            category: categoryName,
            subcategory: subcategoryName,
          });
        }
      } catch (err) {
        const label = subcategoryName ? `${categoryName} > ${subcategoryName}` : categoryName;
        process.stderr.write(`Error scraping ${label}: ${err.message}\n`);
      }

      await randomDelay(1500, 3000);
    }
  }

  await page.close();
  return results;
}

/**
 * Extract product details from a single product page.
 * Returns { name, description, imagePath, daysToMaturity, germination }.
 */
async function extractProductDetails(page) {
  return page.evaluate(() => {
    const name = (document.querySelector('h1.page-title span, h1.page-title, h1')?.textContent || '').trim();

    // Description from product info area
    const descEl = document.querySelector(
      '.product.attribute.description .value, .product.info .product-description, .product.attribute.overview .value',
    );
    const description = (descEl?.textContent || '').replace(/\s+/g, ' ').trim();

    // Main product image src
    const imgEl = document.querySelector(
      '.gallery-placeholder img, .product.media img, .fotorama__img, img.gallery-placeholder__image',
    );
    const imageSrc = imgEl?.getAttribute('src') || '';

    return { name, description, imageSrc };
  });
}

/**
 * Phase 2: Visit each product URL and extract detailed growing data.
 * Reads product list from Phase 1 output, visits each page, and collects details.
 */
async function phase2ScrapeDetails(browser) {
  let urlData;
  try {
    const raw = await readFile(OUTPUT_FILE, 'utf-8');
    urlData = JSON.parse(raw);
  } catch (err) {
    throw new Error(`Cannot read Phase 1 output (${OUTPUT_FILE}): ${err.message}`);
  }

  const products = urlData.products || [];
  if (products.length === 0) {
    throw new Error('No products found in Phase 1 output');
  }

  const page = await browser.newPage();
  const details = [];
  const total = products.length;

  for (let i = 0; i < total; i++) {
    const product = products[i];
    const progress = `[${i + 1}/${total}]`;

    try {
      const raw = await retry(
        async () => {
          await page.goto(product.url, { waitUntil: 'networkidle', timeout: 30000 });
          return extractProductDetails(page);
        },
        { maxAttempts: 3, label: `${progress} ${product.slug}` },
      );

      const imagePath = extractImagePath(raw.imageSrc);
      const daysToMaturity = parseDaysToMaturity(raw.description);
      const germination = parseGermination(raw.description);

      details.push({
        slug: product.slug,
        name: raw.name || product.name,
        category: product.category,
        subcategory: product.subcategory || null,
        url: product.url,
        description: raw.description,
        imagePath,
        daysToMaturity,
        germination,
      });

      if ((i + 1) % 25 === 0) {
        process.stderr.write(`${progress} Scraped ${product.slug}\n`);
      }
    } catch (err) {
      process.stderr.write(`${progress} Error scraping ${product.slug}: ${err.message}\n`);
      details.push({
        slug: product.slug,
        name: product.name,
        category: product.category,
        subcategory: product.subcategory || null,
        url: product.url,
        description: '',
        imagePath: '',
        daysToMaturity: null,
        germination: { days: null, tempF: null },
        error: err.message,
      });
    }

    await randomDelay(1000, 2000);
  }

  await page.close();
  return details;
}

/**
 * Save results to JSON file.
 */
async function saveResults(data, filePath) {
  await mkdir(dirname(filePath), { recursive: true });
  await writeFile(filePath, JSON.stringify(data, null, 2));
}

/**
 * Main entry point.
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  if (dryRun) {
    process.stderr.write('Dry run mode: will not launch browser\n');
    process.stderr.write(`Categories to scrape: ${CATEGORIES.length}\n`);
    const totalUrls = CATEGORIES.reduce(
      (sum, cat) => sum + (cat.subcategories ? cat.subcategories.length : 1),
      0,
    );
    process.stderr.write(`Total URLs to visit: ${totalUrls}\n`);
    return;
  }

  process.stderr.write('Launching browser...\n');
  const browser = await chromium.launch({ headless: true });

  try {
    process.stderr.write('Phase 1: Crawling vegetable category pages...\n');
    const products = await phase1CrawlCategories(browser);

    process.stderr.write(`Found ${products.length} unique products across ${CATEGORIES.length} categories\n`);

    await saveResults(
      {
        scraped_at: new Date().toISOString(),
        total_products: products.length,
        categories: CATEGORIES.map((c) => c.name),
        products,
      },
      OUTPUT_FILE,
    );

    process.stderr.write(`Phase 1 results saved to ${OUTPUT_FILE}\n`);

    process.stderr.write('Phase 2: Scraping product details...\n');
    const details = await phase2ScrapeDetails(browser);

    const successCount = details.filter((d) => !d.error).length;
    process.stderr.write(`Scraped ${successCount}/${details.length} product details successfully\n`);

    await saveResults(
      {
        scraped_at: new Date().toISOString(),
        total_products: details.length,
        successful: successCount,
        products: details,
      },
      DETAILS_FILE,
    );

    process.stderr.write(`Phase 2 results saved to ${DETAILS_FILE}\n`);
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  process.stderr.write(`Fatal error: ${err.message}\n`);
  process.exit(1);
});
