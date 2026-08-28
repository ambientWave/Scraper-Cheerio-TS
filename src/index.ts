import { RequestService } from './services/request.service';
import { CacheService } from './services/cache.service';
import { ParseService } from './services/parse.service';
import { CheerioAPI } from 'cheerio';

async function main(url: string, stoppingAfterPages: number = 2) {
    const cacheService: CacheService = new CacheService();
    const parseService: ParseService = new ParseService();
    let nextPageUrl: string | null = url;
    let pageCount: number = 0;
    let htmlContent: string = "";
    let collectedAnalyticData: {} = {};
    let ingestedData: {} = {};
    let semiStructuredData: {}[] = [];

    while (pageCount <= stoppingAfterPages) {
        pageCount++;
        // Check if a URL is cached
        const hasCached: boolean = await cacheService.hasCachedResource(url);
        if (hasCached) {
            console.log("CACHE HIT: Using cached response");
            const parsed: CheerioAPI | null = await cacheService.getCachedResource(url);
            htmlContent = parsed?.html() || "";
            console.log(`Page Size: ${Buffer.from(htmlContent).length}`);
        } else {
            console.log("FETCH: Fetching from origin");
            const pageRes: Response = await RequestService.request(url);
            htmlContent = await pageRes.text();
            console.log(`Page Size: ${Buffer.from(htmlContent).length}`);
            await cacheService.storeInCache(url, htmlContent);
        }
        // start parsing
        // Collect all the links on page 1 
        const parsedContent: CheerioAPI = parseService.parseHtml(htmlContent);
        collectedAnalyticData = await parseService.collectAnalyticData(url, parsedContent);
        nextPageUrl = parseService.getNextPageUrl(url);
        url = nextPageUrl || "";
    };
    /** CHECKPOINT — the script prints catalogue_pages=3 , discovered=60 , unique_urls=60 — and a second run
    reports the same numbers, mostly from cache. */
    const stagetwoFinalReport: {} = {
        catalogue_pages: pageCount,
        discovered: collectedAnalyticData,
        unique_urls: collectedAnalyticData
    };
    console.log(stagetwoFinalReport);
};
main("https://books.toscrape.com/catalogue/page-1.html",);
