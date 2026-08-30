import * as cheerio from 'cheerio';
import { ParseRepository } from '../repositories/parse.repository';
import { CatalogueRecord } from '../dto/parse.dto';

export class ParseService {
    private parseRepository: ParseRepository;
    constructor() {
        this.parseRepository = new ParseRepository();
    }

    public parseCatalogueHtml(content: string): cheerio.CheerioAPI {
        const parsedRes: cheerio.CheerioAPI = this.parseRepository.parseCatalogueHtml(content);
        return parsedRes;
    };

    public parseResourceHtml(content: string): cheerio.CheerioAPI {
        const parsedRes: cheerio.CheerioAPI = this.parseRepository.parseResourceHtml(content);
        return parsedRes;
    };

    public extractCatalogueData(baseUrl: string, parsedContent: cheerio.CheerioAPI): Set<CatalogueRecord> {
        const catalogueData: Set<CatalogueRecord> = this.parseRepository.getCatalogueData(baseUrl, parsedContent);
        return catalogueData;
    };

    public extractResourceData(parsedContent: cheerio.CheerioAPI): {} {
        const resourceData: {} = this.parseRepository.getResourceData(parsedContent);
        return resourceData;
    };

    public constructValidatedRecord(catalogueRecord: {}, resourceRecord: {}): {} | null {
        const validatedRecord: {} | null = this.parseRepository.constructValidatedRecord(catalogueRecord, resourceRecord);
        return validatedRecord;
    };

    public getNextPageUrl(baseUrl: string): string | null {
        // make sure that page number is greater than the current page number
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