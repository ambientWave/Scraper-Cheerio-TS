import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import * as cheerio from 'cheerio';
import { CacheRepository } from '../repositories/cache.repository';
import type { CacheEntry } from '../dto/cache.dto';

export class CacheService {
    private cacheRepository: CacheRepository;
    constructor() {
        this.cacheRepository = new CacheRepository();
    }

    /**
     * Get the Cheerio instance for a cached URL.
     */
    public async getCachedResource(url: string): Promise<cheerio.CheerioAPI | null> {
        const cachedRes: cheerio.CheerioAPI | null = await this.cacheRepository.get(url);
        return cachedRes;
    };

    /**
     * Set cached content for a URL.
     */
    public async storeInCache(url: string, content: string): Promise<void> {
        const setRes: void = await this.cacheRepository.set(url, content);
        return;
    };

    /**
     * Check if a URL is cached.
     */
    public async hasCachedResource(url: string): Promise<boolean> {
        const cachedRes: cheerio.CheerioAPI | null = await this.cacheRepository.get(url);
        return cachedRes ? true : false;
    };
}
