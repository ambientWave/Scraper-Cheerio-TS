import { CheerioAPI } from 'cheerio';

export interface CacheEntry {
    $: CheerioAPI;
    lastAccessed: number;
}