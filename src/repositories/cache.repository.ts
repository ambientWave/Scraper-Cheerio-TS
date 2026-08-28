import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import type { CacheEntry } from '../dto/cache.dto';
import { ParseRepository } from './parse.repository';
import * as cheerio from 'cheerio';

export class CacheRepository {
    private cache: Map<string, CacheEntry> = new Map();
    private cacheDir: string = path.join(process.cwd(), 'cache');
    private static maxCacheSize: number = 1000; // Max number of entries in cache
    private static cacheTTL: number = 86400000; // Cache TTL in milliseconds (24 hours)

    /**
     * Initialize the cache by loading existing files from the cache directory.
     */
    constructor() {
        this.initialize();
    }
    public async initialize(): Promise<void> {
        try {
            await fs.mkdir(this.cacheDir, { recursive: true });
            const files = await fs.readdir(this.cacheDir);

            for (const file of files) {
                const filePath = path.join(this.cacheDir, file);
                const stats = await fs.stat(filePath);
                if (stats.isFile()) {
                    const content = await fs.readFile(filePath, 'utf-8');
                    const url = this.fileNameToUrl(file);
                    const $ = cheerio.load(content);
                    this.cache.set(url, {
                        $,
                        lastAccessed: stats.mtimeMs,
                    });
                }
            }
            console.log(`Cache initialized with ${this.cache.size} entries.`);
        } catch (error) {
            console.error('Failed to initialize cache:', error);
            throw error;
        }
    }

    /**
     * Get the Cheerio instance for a cached URL.
     */
    public async get(url: string): Promise<cheerio.CheerioAPI | null> {
        const entry = this.cache.get(url);
        if (!entry) {
            return null;
        }

        // Update last accessed time
        entry.lastAccessed = Date.now();
        this.cache.set(url, entry);

        return entry.$;
    };

    public async set(url: string, content: string): Promise<void> {
        const fileName = CacheRepository.urlToFileName(url);
        const filePath = path.join(this.cacheDir, fileName);

        // Write to disk
        await fs.writeFile(filePath, content, 'utf-8');

        // Parse and cache in memory
        const $ = ParseRepository.parseHtml(content);
        this.cache.set(url, {
            $,
            lastAccessed: Date.now(),
        });
        return;
    };


    public async delete(key: string): Promise<void> {
        const filePath: string = path.join(this.cacheDir, `${key}.html`);
        try {
            await fs.unlink(filePath);
        } catch (error) {
            console.error(`Failed to delete key ${key}:`, error);
        }
    };

    private static urlToFileName(url: string): string {
        return encodeURIComponent(url) + '.html';
    }

    private fileNameToUrl(fileName: string): string {
        return decodeURIComponent(fileName.replace('.html', ''));
    }
};