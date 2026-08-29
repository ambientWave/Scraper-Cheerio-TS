import * as cheerio from 'cheerio';
import { ParseRepository } from '../repositories/parse.repository';

export class ParseService {
    private parseRepository: ParseRepository;
    constructor() {
        this.parseRepository = new ParseRepository();
    }

    public parseHtml(content: string): cheerio.CheerioAPI {
        const parsedRes: cheerio.CheerioAPI = this.parseRepository.parseHtml(content);
        return parsedRes;
    };

    public collectAnalyticData(baseUrl: string, parsedContent: cheerio.CheerioAPI): Set<{}> {
        const resourceData: Set<{}> = this.parseRepository.getResourceData(baseUrl, parsedContent);
        return resourceData;
    };

    public getNextPageUrl(baseUrl: string): string | null {
        const nextPageUrl: string | null = this.parseRepository.getNextPageUrl(baseUrl);
        return nextPageUrl;
    };

    public getValidatedRecords(): any[] {
        return this.parseRepository.getValidatedRecords();
    };

    public getErrorRecords(): any[] {
        return this.parseRepository.getErrorRecords();
    };
};