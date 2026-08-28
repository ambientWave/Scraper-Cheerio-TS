import * as cheerio from 'cheerio';
import type { AnyNode, Element } from 'domhandler';

export class ParseRepository {
    public pageContentElements: Set<{}>;
    private parsedPage: cheerio.CheerioAPI;

    constructor() {
        this.pageContentElements = new Set();
        this.parsedPage = cheerio.load("");
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
            this.pageContentElements.add({
                title: h3ChildElements.eq(i).children().first().attr('title') || null,
                product_url: new URL((h3ChildElements.eq(i).children().first().attr('href') || ""), baseUrl).href,
                rating_text: ratingElements.eq(i).attr('class')?.split(" ")?.[1] || null,
                price_text: priceElements.eq(i).text() || null,
                availability_text: availability_textElements.eq(i).text().trim() || null,
                description: descriptionElements.eq(i).text() || null,
                source_page: baseUrl,
                fetched_at: new Date().toISOString()
            });
        }
        return this.pageContentElements;
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