import { RequestService } from "../services/request.service";
import { CacheService } from "../services/cache.service";

/**
 * Fetch HTML content from the network and store it in the cache.
 * @returns The fetched HTML string.
 * @throws Re-throws any fetch errors so the caller can handle them.
 */
export async function fetchAndCacheHtml(
    url: string,
    cacheService: CacheService
): Promise<string> {
    console.log("FETCH: Fetching from origin");
    const res: Response = await RequestService.request(url);
    const html: string = await res.text();
    console.log(`Page Size: ${Buffer.from(html).length}`);
    await cacheService.storeInCache(url, html);
    return html;
}
