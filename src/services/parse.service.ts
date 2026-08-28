import fs from 'fs/promises';
import path from 'path';
import process from 'process';
import type { CacheEntry } from '../dto/cache.dto';
import * as cheerio from 'cheerio';
import { ParseRepository } from '../repositories/parse.repository';
import type { AnyNode, Document, Element, ParentNode } from 'domhandler';

export class ParseService {
    private pageLinks: Set<string> = new Set();
    private pageCount: number = 0;
    private discoveredBookCount: number = 0;
    private uniqueUrlCount: number = 0;
    private parseRepository: ParseRepository;
    constructor() {
        this.parseRepository = new ParseRepository();
    }

    public parseHtml(content: string): cheerio.CheerioAPI {
        const parsedRes: cheerio.CheerioAPI = ParseRepository.parseHtml(content);
        return parsedRes;
    };

    public async collectAnalyticData(baseUrl: string, parsedContent: cheerio.CheerioAPI) {
        const pageLinks: Set<Element> = this.parseRepository.getPageLinks(baseUrl, parsedContent);
        // console.log('pageLinks', pageLinks);
        const resourceUrls: Set<string> = ParseRepository.getResourceUrls(baseUrl, pageLinks);
        const totalResources: number = resourceUrls.size;
        return totalResources;
    };

    public getNextPageUrl(baseUrl: string): string | null {
        const nextPageUrl: string | null = ParseRepository.getNextPageUrl(baseUrl, this.parseRepository.pageLinkElements);
        return nextPageUrl;
    };

    /*
        * For every book page, collect this raw record:
        * {
        * "title": "A Light in the Attic",
        * "product_url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/
        * index.html",
        * "price_text": "£51.77",
        * "availability_text": "In stock (22 available)",
        * "rating_text": "Three",
        * "description": "...",
        * "source_page": "https://books.toscrape.com/catalogue/page-1.html",
        * "fetched_at": "2026-08-06T10:00:00Z"
        * }
        * Fetch and cache each detail page with the same politeness as Stage 1: user-agent, timeout, status check, delay.
        * Aim your selectors at the product area of the page, not the whole document. "The first thing that looks like a price"
        * works today and betrays you the day the page grows a second price.
        * Some books have no description. Store null — never invent text that was not on the page.
        * Keep source_page and fetched_at on every record. That is provenance — the receipt showing where and
        * when a fact came from. When a value looks wrong three weeks from now, the receipt is how you find out what
        * happened.
        * CHECKPOINT — print one complete raw record and the summary detail_pages=60 . The record shows all eight keys,
        * even when an optional value is null .
    */
    public async extractRawRecords(baseUrl: string, parsedContent: cheerio.CheerioAPI) {

    };











}