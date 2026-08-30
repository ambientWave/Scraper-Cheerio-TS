import { CacheService } from "../services/cache.service";

/**
 * Attempt to retrieve HTML content from cache for a given URL.
 * @returns An object with the cached HTML string and a boolean indicating a cache hit.
 */
export async function getCachedHtml(
    url: string,
    cacheService: CacheService
): Promise<{ html: string; hit: boolean }> {
    const hasCached: boolean = await cacheService.hasCachedResource(url);
    if (!hasCached) {
        return { html: "", hit: false };
    }
    console.log("CACHE HIT: Using cached response");
    const parsed = await cacheService.getCachedResource(url);
    const html: string = parsed?.html() || "";
    console.log(`Page Size: ${Buffer.from(html).length}`);
    return { html, hit: true };
}
