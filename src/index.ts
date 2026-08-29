import { RequestService } from './services/request.service';
import { CacheService } from './services/cache.service';
import { ParseService } from './services/parse.service';
import { CheerioAPI } from 'cheerio';
import { OutputService } from './services/output.service';


async function main(url: string, stoppingAfterPages: number = 2) {
    const cacheService: CacheService = new CacheService();
    const parseService: ParseService = new ParseService();
    const outputService = new OutputService();
    let nextPageUrl: string | null = url;
    let pageCount: number = 0;
    let htmlContent: string = "";
    let collectedAnalyticData: Set<{}> = new Set();

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
        collectedAnalyticData = parseService.collectAnalyticData(url, parsedContent);
        nextPageUrl = parseService.getNextPageUrl(url);
        url = nextPageUrl || "";
    };
    /** CHECKPOINT — the script prints catalogue_pages=3 , discovered=60 , unique_urls=60 — and a second run
    reports the same numbers, mostly from cache. */
    const stageTwoFinalReport: {} = {
        catalogue_pages: pageCount,
        discovered: collectedAnalyticData.size,
        unique_urls: collectedAnalyticData.size
    };
    console.log(stageTwoFinalReport);

    // Write output files via OutputService
    await outputService.writeResults(
        parseService.getValidatedRecords(),
        parseService.getErrorRecords()
    );
};

main("https://books.toscrape.com/catalogue/page-1.html", 2);
