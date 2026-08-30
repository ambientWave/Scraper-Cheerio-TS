import * as fs from 'fs';
import * as path from 'path';

/**
 * Service responsible for writing a run report JSON file containing execution metrics.
 */
export class ReportService {
    private readonly outputDir: string;

    constructor() {
        // Resolve to <project_root>/output (same as OutputService)
        this.outputDir = path.join(process.cwd(), 'output');
        fs.mkdirSync(this.outputDir, { recursive: true });
    }

    /**
     * Write the supplied report object to `run-report.json` inside the output directory.
     * @param report An object containing the run statistics.
     */
    async writeReport(report: Record<string, unknown>): Promise<void> {
        const reportPath = path.join(this.outputDir, 'run-report.json');
        await fs.promises.writeFile(reportPath, JSON.stringify(report, null, 2), 'utf-8');
        console.log(`Run report written to ${reportPath}`);
    }
};
