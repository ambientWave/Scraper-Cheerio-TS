import { RequestService } from './services/request.service';
import { CacheService } from './services/cache.service';
import { ParseService } from './services/parse.service';
import * as cheerio from 'cheerio';
import { OutputService } from './services/output.service';
import { ReportService } from './services/report.service';
import { maybeCorruptUrl } from './middleware/parse-utils';
import { getCachedHtml } from './middleware/cache-utils';
import { fetchAndCacheHtml } from './middleware/request-utils';
import type { CatalogueRecord } from './dto/parse.dto';

async function main(catalogueUrl: string, stoppingAfterPages: number = 2) {
    const cacheService: CacheService = new CacheService();
    const parseService: ParseService = new ParseService();
    const outputService = new OutputService();
    const reportService = new ReportService();

    const startTime = new Date();
    let pagesFetched = 0;
    let cacheHits = 0;
    let failedPages = 0;

    let nextPageUrl: string | null = catalogueUrl;
    let pageCount: number = 0;
    let resourceCount: number = 0;
    let htmlContent: string = "";
    let catalogueData: Set<CatalogueRecord> = new Set();
    /**
     * fetch the catalogue page
     * extract data from the whole catalogue using extractCatalogueData in parse.service
     * for each entry, fetch its url then extract resource data using extractResourceData in parse.service
     * validate and combine catalogue record and resource record using constructValidatedRecord in parse.service
     * get next page url using getNextPageUrl in parse.service
     * repeat until stoppingAfterPages
     * 
     */
    while (pageCount <= stoppingAfterPages) {
        if (!catalogueUrl) break;
        // Try cache first, then fetch from origin
        console.log(`Fetching ${catalogueUrl} for ${pageCount}`);
        const { html: cachedHtml, hit: cacheHit } = await getCachedHtml(catalogueUrl, cacheService);
        if (cacheHit) {
            cacheHits++;
            htmlContent = cachedHtml;
        } else {
            try {
                htmlContent = await fetchAndCacheHtml(catalogueUrl, cacheService);
                pagesFetched++;
            } catch (e) {
                console.log(`Failed to fetch ${catalogueUrl}:`, e);
                failedPages++;
                nextPageUrl = null;
                continue;
            }
        }
        pageCount++;
        // start parsing
        // extract all items from the catalogue page
        const parsedCatalogueContent: cheerio.CheerioAPI = parseService.parseCatalogueHtml(htmlContent);
        catalogueData = parseService.extractCatalogueData(catalogueUrl, parsedCatalogueContent);
        // for each item extract its details page data
        for (const entry of catalogueData) { // TODO: should be in a separate block because it is a nested loop
            const { mutatedUrl, isCorrupted } = maybeCorruptUrl(entry?.product_url || "", resourceCount);
            const { html: cachedHtml, hit: cacheHit } = await getCachedHtml(mutatedUrl, cacheService);
            if (cacheHit) {
                cacheHits++;
                htmlContent = cachedHtml;
            } else {
                try {
                    htmlContent = await fetchAndCacheHtml(mutatedUrl, cacheService);
                    pagesFetched++;
                } catch (e) {
                    console.log(`Failed to fetch ${mutatedUrl}:`, e);
                    failedPages++;
                    continue;
                }
            }
            const parsedResourcePage: cheerio.CheerioAPI = parseService.parseResourceHtml(htmlContent);
            const extractedResourceData: {} = parseService.extractResourceData(parsedResourcePage);
            parseService.constructValidatedRecord(entry, extractedResourceData);
            resourceCount++;
        }
        nextPageUrl = parseService.getNextPageUrl(catalogueUrl);
        catalogueUrl = nextPageUrl || "";
        resourceCount = 0;
    };
    /** CHECKPOINT — the script prints catalogue_pages=3 , discovered=60 , unique_urls=60 — and a second run
    reports the same numbers, mostly from cache. */
    const stageTwoFinalReport: {} = {
        catalogue_pages: pageCount,
        discovered: catalogueData.size,
        unique_urls: catalogueData.size
    };
    console.log(stageTwoFinalReport);

    // Write output files via OutputService
    await outputService.writeResults(
        parseService.getValidatedRecords(),
        parseService.getErrorRecords()
    );

    const endTime = new Date();
    const report = {
        start_time: startTime.toISOString(),
        duration_ms: endTime.getTime() - startTime.getTime(),
        pages_fetched: pagesFetched,
        cache_hits: cacheHits,
        valid_records: parseService.getValidatedRecords().length,
        invalid_records: parseService.getErrorRecords().length,
        failed_pages: failedPages
    };
    await reportService.writeReport(report);
}

main("https://books.toscrape.com/catalogue/page-1.html", 3);
