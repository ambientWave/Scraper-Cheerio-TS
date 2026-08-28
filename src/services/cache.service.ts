import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import * as cheerio from 'cheerio';

interface CacheEntry {
    $: cheerio.CheerioAPI; // Cheerio instance for the parsed HTML
    lastAccessed: number;
}

export class CacheService {
    private static cache: Map<string, CacheEntry> = new Map();
    private static cacheDir: string = path.join(process.cwd(), 'cache');
    private static maxCacheSize: number = 1000; // Max number of entries in cache
    private static cacheTTL: number = 86400000; // Cache TTL in milliseconds (24 hours)

    /**
     * Initialize the cache by loading existing files from the cache directory.
     */
    public static async initialize(): Promise<void> {
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
    public static async get(url: string): Promise<cheerio.CheerioAPI | null> {
        const entry = this.cache.get(url);
        if (!entry) {
            return null;
        }

        // Update last accessed time
        entry.lastAccessed = Date.now();
        this.cache.set(url, entry);

        return entry.$;
    }

    /**
     * Set cached content for a URL.
     */
    public static async set(url: string, content: string): Promise<void> {
        if (this.cache.size >= this.maxCacheSize) {
            await this.evict();
        }

        const fileName = this.urlToFileName(url);
        const filePath = path.join(this.cacheDir, fileName);

        // Write to disk
        await fs.writeFile(filePath, content, 'utf-8');

        // Parse and cache in memory
        const $ = cheerio.load(content);
        this.cache.set(url, {
            $,
            lastAccessed: Date.now(),
        });
    }

    /**
     * Check if a URL is cached.
     */
    public static async has(url: string): Promise<boolean> {
        return this.cache.has(url);
    }

    /**
     * Clear the entire cache (both in-memory and on disk).
     */
    public static async clear(): Promise<void> {
        this.cache.clear();
        const files = await fs.readdir(this.cacheDir);
        await Promise.all(
            files.map((file) => fs.unlink(path.join(this.cacheDir, file)))
        );
    }

    /**
     * Evict the least recently used entry from the cache.
     */
    private static async evict(): Promise<void> {
        const oldestEntry = Array.from(this.cache.entries()).reduce((oldest, [url, entry]) => {
            return entry.lastAccessed < oldest.lastAccessed ? { url, ...entry } : oldest;
        }, { url: '', lastAccessed: Infinity });

        if (oldestEntry.url) {
            const fileName = this.urlToFileName(oldestEntry.url);
            await fs.unlink(path.join(this.cacheDir, fileName));
            this.cache.delete(oldestEntry.url);
        }
    }

    /**
     * Convert a URL to a safe file name.
     */
    private static urlToFileName(url: string): string {
        return encodeURIComponent(url) + '.html';
    }

    /**
     * Convert a file name back to a URL.
     */
    private static fileNameToUrl(fileName: string): string {
        return decodeURIComponent(fileName.replace('.html', ''));
    }
}
