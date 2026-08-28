import * as cheerio from 'cheerio';
import type { AnyNode, Document, Element, ParentNode } from 'domhandler';

export class ParseRepository {
    public pageLinkElements: Set<Element>;

    constructor() {
        this.pageLinkElements = new Set();
    }

    /**
     * Parse the HTML content.
     */
    public static parseHtml(html: string): cheerio.CheerioAPI {
        return cheerio.load(html);
    };

    public getPageLinks(baseUrl: string, parsedContent: cheerio.CheerioAPI): Set<Element> {
        parsedContent('a').each((i, el) => {
            this.pageLinkElements.add(el);
            // const link: string | undefined = el.attr('href') || '';
        });
        return this.pageLinkElements;
    };

    /**
     * Get URLs of all resources.
     * @param baseUrl The base URL.
     * @param linksSet The set of link elements.
     * @returns The set of resource URLs.
     */
    public static getResourceUrls(baseUrl: string, linksSet: Set<Element>): Set<string> {
        const resourceUrls: Set<string> = new Set();
        linksSet.forEach((linkElement) => {
            const firstChild: AnyNode | undefined = linkElement.childNodes[0];
            if ((firstChild as Element).name === 'img') {
                resourceUrls.add(new URL(linkElement.attribs['href'], baseUrl).href);
            }
        });
        return resourceUrls;
    };

    /**
     * Get the next page URL.
     */
    public static getNextPageUrl(baseUrl: string, linksSet: Set<Element>): string | null {
        let nextPageUrl: string | null = null;
        linksSet.forEach((linkElement) => {
            if ((linkElement.attribs['href'].includes('page-'))) { //  && linkElement.attribs['text'].includes('next')
                nextPageUrl = new URL(linkElement.attribs['href'], baseUrl).href;
            }
        });
        return nextPageUrl;
    };

};