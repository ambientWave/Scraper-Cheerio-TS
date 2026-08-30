# TypeScript HTML Scraper using Cheerio

## Screenshots

<img width="1806" height="840" alt="" src="https://github.com/user-attachments/assets/0c62904d-3ca0-496d-8e52-874e0c565eea" />


## Target Classification

* **Lane:** JavaScript and TypeScript
* **Site:** books.toscrape.com
* **Why:** This site is explicitly designed as a sandbox for web scraping practice and educational purposes.
* **Data Collected:** Book titles, prices, and availability information.
* **Appropriateness:** Scraping this site is appropriate because it is a designated practice environment intended to handle automated requests safely.

## Robots Result

When requesting `https://books.toscrape.com/robots.txt`, no robots file was found (returned a 404 Not Found error).


## Run

```bash
npm install
npx tsx src/index.ts
```


## Record Schema

```typescript
const validatedRecordSchema = z.object({
    title: z.string().nullable(),
    product_url: z.url().nullable(),
    rating_text: z.string().nullable(),
    price_text: z.string().nullable(),
    price_gbp: z.number().nullable(),
    source_page: z.url().nullable(),
    fetched_at: z.iso.datetime().nullable(),
    availability_text: z.string().nullable(),
    description: z.string().nullable(),
});
```

## Politeness Rules

* **User-Agent:** `FlyRankInternship-A9/1.0 (https://github.com/ambientWave/Scraper-Cheerio-TS)`
* **Delay:** 1 second retry delay for 5xx errors
* **Timeout:** 3 seconds per request
* **Cache:** File-based cache in `./cache`, prevents re-fetching within the same run and across runs

## Error-Proof Workflow Demonstration

The code includes an intentional **URL defector** (`maybeCorruptUrl` in `src/middleware/parse-utils.ts`) that randomly corrupts URLs (e.g., changing `catalogue` to `cataloiue`, `index.html` to `index.itml`) to simulate real-world broken links. This proves the error-proof workflow: failed fetches are caught, logged, stored in `errors.json`, and never cached — while valid records continue processing unaffected.

## Limitation

The scraper only extracts data from static HTML. If the target site ever switches to client-side rendering or adds JavaScript-dependent content, this scraper would fail to capture that data without a headless browser e.g. Chromium Embedded Framework (https://github.com/chromiumembedded/cef), a multi-browser driver e.g. Playwright (https://github.com/microsoft/playwright) and Selenium (http://seleniumhq.org/), or a chromium driver e.g. Puppeteer (https://github.com/GoogleChrome/puppeteer).

**Additional Limitation:** The book detail scraping uses a nested loop (catalogue pages → book URLs) resulting in O(n²) complexity. Per the TODO in `src/index.ts:61`, this should be refactored into a separate processing block to decouple catalogue traversal from detail fetching, enabling better parallelism and error isolation.

## Run Report (Proof)

```json
{
  "start_time": "2026-08-30T21:10:03.003Z",
  "duration_ms": 5306,
  "pages_fetched": 1,
  "cache_hits": 199,
  "valid_records": 79,
  "invalid_records": 0,
  "failed_pages": 4
}
```

This assignment needed no browser because the data is already in the HTML the server sends, so a browser would only add cost.

## Ethics & Usage

When using this code, please adhere to the following guidelines:
* Use official APIs whenever available.
* Respect site boundaries; do not bypass logins, paywalls, or blocks.
* Practice data minimization by collecting only necessary information.
* Always review a website's terms of service and robots.txt before applying this code to a new target.
