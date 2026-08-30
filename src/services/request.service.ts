import { RequestRepository } from "../repositories/request.repository";

export class RequestService {

    public static async request(url: string, options?: RequestInit, attempt: number = 1): Promise<Response> {
        if (!url) {
            throw new Error('URL is required');
        }
        const reqOptions: RequestInit = { ...options };
        reqOptions.headers = {
            ...(options?.headers || {}),
            'User-Agent': 'FlyRankInternship-A9/1.0 (https://github.com/ambientWave/Scraper-Cheerio-TS)'
        };
        // 3‑second timeout for each request
        reqOptions.signal = AbortSignal.timeout(3000);
        const urlRoot = new URL(url).origin;
        // Try to fetch robots.txt but ignore failures – it’s just polite logging
        try {
            const robotsRes = await RequestRepository.fetchResource(`${urlRoot}/robots.txt`, reqOptions);
            console.log(`Robots Response Code: ${robotsRes.status}`);
            if (robotsRes.status !== 200) {
                console.log("no robots file found");
            }
            const resp = await RequestRepository.fetchResource(url, options);
            // Retry once for 5xx errors
            if (resp.status >= 500 && resp.status < 600 && attempt === 1) {
                console.log('Server error, retrying after short delay...');
                await new Promise(r => setTimeout(r, 1000));
                return await this.request(url, options, 2);
            }
            // 404 and 403 are considered final – no retry
            if (resp.status === 404 || resp.status === 403) {
                console.log(`Non‑retryable status ${resp.status}`);
                throw new Error('Non‑retryable status');
            }
            // Any other non‑OK status is treated as failure
            if (!resp.ok) {
                throw new Error('Request failed');
            }
            return resp;
        } catch (error) {
            console.log(error);
            throw error;
        }
    };
};
