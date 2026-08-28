import { RequestRepository } from "../repositories/request.repository";

export class RequestService {

    public static async request(url: string, options?: RequestInit) {
        if (!url) {
            throw new Error("URL is required");
        }
        const reqOptions: RequestInit = { ...options };
        reqOptions.headers = {
            ...options?.headers,
            "User-Agent": "FlyRankInternship-A9/1.0 (https://github.com/ambientWave/Scraper-Cheerio-TS)"
        };
        reqOptions.signal = AbortSignal.timeout(3000);
        const urlRoot: string = new URL(url).origin;
        const robotsRes: Response = await RequestRepository.fetchResource((urlRoot + "/robots.txt"), reqOptions);
        console.log(`Robots Response Code: ${robotsRes.status}`);
        if (robotsRes.status !== 200) {
            console.log("no robots file found");
        }
        const response: Response = await RequestRepository.fetchResource(url, reqOptions);
        console.log(`Page Response Code: ${response.status}`);
        if (response.status !== 200) {
            throw new Error("Request failed");
        }
        return response
    }
};
