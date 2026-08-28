import { RequestService } from './services/request.service';
import { CacheService } from './services/cache.service';
import { CheerioAPI } from 'cheerio';

async function main(url: string) {
    // Initialize the cache
    await CacheService.initialize();

    // Check if a URL is cached
    const hasCached: boolean = await CacheService.has(url);
    if (hasCached) {
        console.log("CACHE HIT: Using cached response");
        const cachedContent: CheerioAPI | null = await CacheService.get(url);
        console.log(`Page Size: ${Buffer.from(cachedContent?.text() || "").length}`);
        return;
    };
    console.log("FETCH: Fetching from origin");
    const pageRes: Response = await RequestService.request(url);
    const htmlContent: string = await pageRes.text();
    console.log(`Page Size: ${Buffer.from(htmlContent).length}`);
    await CacheService.set(url, htmlContent);
};

main("https://books.toscrape.com/catalogue/page-1.html");
