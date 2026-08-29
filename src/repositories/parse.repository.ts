import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';
import { z } from "zod";

const ResourceSchema = z.object({
    title: z.string().nullable(),
    product_url: z.url().nullable(),
    rating_text: z.string().nullable(),
    price_text: z.string().nullable(),
    price_gbp: z.number().nullable(),
    availability_text: z.string().nullable(),
    description: z.string().nullable(),
    source_page: z.url().nullable(),
    fetched_at: z.iso.datetime().nullable(),
});

export class ParseRepository {
    public pageContentElements: Set<{}> = new Set();
    private parsedPage: cheerio.CheerioAPI = cheerio.load("");
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
    public parseHtml(html: string, parsedPage?: cheerio.CheerioAPI): cheerio.CheerioAPI {
        this.parsedPage = parsedPage || cheerio.load(html);
        return this.parsedPage;
    };

    /**
     * Get URLs of all resources.
     * @param baseUrl The base URL.
     * @param resourceSet The set of link elements.
     * @returns The set of resource URLs.
     */
    public getResourceData(baseUrl: string, parsedContent: cheerio.CheerioAPI): Set<{}> {
        const resourceElements = parsedContent('article.product_pod');
        const h3ChildElements = parsedContent("h3");
        const ratingElements = parsedContent("p.star-rating");
        const priceElements = parsedContent("p.price_color");
        const availability_textElements = parsedContent("p.instock.availability");
        const descriptionElements = parsedContent("p.description");
        for (let i = 0; i < resourceElements.length; i++) {
            const rawRecord = {
                title: h3ChildElements.eq(i).children().first().attr('title') || null,
                product_url: new URL((h3ChildElements.eq(i).children().first().attr('href') || ""), baseUrl).href || null,
                rating_text: ratingElements.eq(i).attr('class')?.split(" ")?.[1] || null,
                price_text: priceElements.eq(i).text() || null,
                price_gbp: parseFloat(priceElements.eq(i).text().replace("£", "")) || null,
                availability_text: availability_textElements.eq(i).text().trim() || null,
                description: descriptionElements.eq(i).text() || null,
                source_page: baseUrl || null,
                fetched_at: new Date().toISOString() || null,
            };
            try {
                const parsed = ResourceSchema.parse(rawRecord);
                // Use product_url as unique key for idempotency
                if (parsed.product_url) {
                    this.validatedRecords.set(parsed.product_url, parsed);
                }
            } catch (e: any) {
                this.errorRecords.push({ record: rawRecord, error: e.message });
            }
        }
        // Return set of validated records for backward compatibility
        return new Set(this.validatedRecords.values());
    };

    /**
     * Get the next page URL.
     */
    public getNextPageUrl(baseUrl: string): string | null {
        let nextPageUrl: string | null = null;
        const linksSet: Set<Element> = new Set(this.parsedPage('a'));
        linksSet.forEach((linkElement: Element) => {
            if ((linkElement.attribs['href'].includes('page-'))) { //  && linkElement.attribs['text'].includes('next')
                nextPageUrl = new URL(linkElement.attribs['href'], baseUrl).href;
            }
        });
        return nextPageUrl;
    };

};