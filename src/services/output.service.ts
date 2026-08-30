import * as fs from 'fs';
import * as path from 'path';

export class OutputService {
    private readonly outputDir: string;

    constructor() {
        // Resolve to <project_root>/output
        this.outputDir = path.join(process.cwd(), 'output');
        // Ensure the directory exists
        fs.mkdirSync(this.outputDir, { recursive: true });
    }

    /**
     * Write the validated and error records to JSON files.
     * @param goodRecords Array of successfully validated records.
     * @param errorRecords Array of records that failed validation, each with an error message.
     */
    async writeResults(goodRecords: any[], errorRecords: any[]): Promise<void> {
        const booksPath = path.join(this.outputDir, 'books.json');
        const errorsPath = path.join(this.outputDir, 'errors.json');
        await fs.promises.writeFile(booksPath, JSON.stringify(goodRecords, null, 2), 'utf-8');
        await fs.promises.writeFile(errorsPath, JSON.stringify(errorRecords, null, 2), 'utf-8');
        console.log(`Wrote ${goodRecords.length} valid records to ${booksPath}`);
        console.log(`Wrote ${errorRecords.length} error records to ${errorsPath}`);
    }
}
