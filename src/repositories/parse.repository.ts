import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { z } from "zod";
import { extractPageNum } from "../middleware/parse-utils";
import { CatalogueRecord } from '../dto/parse.dto';

const validatedRecordSchema = z.object({
    title: z.string().nullable(),
    product_url: z.url().nullable(),
    rating_text: z.string().nullable(),
    price_text: z.string().nullable(),
    price_gbp: z.number().nullable(),
    source_page: z.url().nullable(),
    fetched_at: z.iso.datetime().nullable(),
    availability_text: z.string().nullable(),
    description: z.string().nullable(),
});

export class ParseRepository {
    public pageContentElements: Set<CatalogueRecord> = new Set();
    private parsedCataloguePage: cheerio.CheerioAPI = cheerio.load("");
    private parsedResourcePage: cheerio.CheerioAPI = cheerio.load("");
    private errorRecords: Array<{ record: any; error: string }> = [];
    private validatedRecords: Map<string, any> = new Map();

    public getValidatedRecords(): any[] {
        return Array.from(this.validatedRecords.values());
    }

    public getErrorRecords(): any[] {
        return this.errorRecords;
    }

    /**
     * Parse the HTML content.
     */
    public parseCatalogueHtml(html: string, parsedPage?: cheerio.CheerioAPI): cheerio.CheerioAPI {
        this.parsedCataloguePage = parsedPage || cheerio.load(html);
        return this.parsedCataloguePage;
    };

    /**
     * Parse the HTML content.
     */
    public parseResourceHtml(html: string, parsedPage?: cheerio.CheerioAPI): cheerio.CheerioAPI {
        this.parsedResourcePage = parsedPage || cheerio.load(html);
        return this.parsedResourcePage;
    };

    /**
     * Get URLs of all resources.
     * @param baseUrl The base URL.
     * @param resourceSet The set of link elements.
     * @returns The set of resource URLs.
     */
    public getCatalogueData(baseUrl: string, parsedContent: cheerio.CheerioAPI): Set<CatalogueRecord> {
        const resourceElements = parsedContent('article.product_pod');
        const h3ChildElements = parsedContent("h3");
        const ratingElements = parsedContent("p.star-rating");
        const priceElements = parsedContent("p.price_color");
        for (let i = 0; i < resourceElements.length; i++) {
            const parsedRawRecord = {
                title: h3ChildElements.eq(i).children().first().attr('title') || null,
                product_url: new URL((h3ChildElements.eq(i).children().first().attr('href') || ""), baseUrl).href || null,
                rating_text: ratingElements.eq(i).attr('class')?.split(" ")?.[1] || null,
                price_text: priceElements.eq(i).text() || null,
                price_gbp: parseFloat(priceElements.eq(i).text().replace("£", "")) || null,
                source_page: baseUrl || null,
                fetched_at: new Date().toISOString() || null,
            };
            this.pageContentElements.add(parsedRawRecord);
        }
        // Return set of validated records for backward compatibility
        return this.pageContentElements;
    };

    public getResourceData(parsedContent: cheerio.CheerioAPI): {} {
        const availability_textElement = parsedContent("table.table tbody tr:nth-child(6) td");
        const descriptionElement = parsedContent("#product_description").next();
        const parsedResourceDetails: {} = {
            availability_text: availability_textElement.text().trim() || null,
            description: descriptionElement.text() || null
        };
        return parsedResourceDetails;
    };


    public constructValidatedRecord(catalogueRecord: {}, resourceRecord: {}): {} | null {
        const joinedRecord: {} = {
            ...catalogueRecord,
            ...resourceRecord
        };
        try {
            const validatedRecord = validatedRecordSchema.parse(joinedRecord);
            // Use product_url as unique key for idempotency
            if (validatedRecord.product_url) {
                this.validatedRecords.set(validatedRecord.product_url, validatedRecord);
            }
            return validatedRecord;
        } catch (e: any) {
            this.errorRecords.push({ record: joinedRecord, error: e.message });
            return null;
        }
    }
    /**
     * Get the next page URL.
     */
    public getNextPageUrl(baseUrl: string): string | null {
        // Find the <a> inside <li class="next">
        const nextAnchor = this.parsedCataloguePage('li.next > a').first();
        const href = nextAnchor.attr('href');
        if (!href) {
            return null;
        }
        const nextPageUrl = new URL(href, baseUrl).href;
        // Ensure the next page number is greater than the current page number to avoid looping backwards
        const currentNum = extractPageNum(baseUrl);
        const nextNum = extractPageNum(nextPageUrl);
        if (nextNum <= currentNum) {
            return null;
        }
        return nextPageUrl;
    };

};