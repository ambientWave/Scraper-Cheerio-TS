import { RequestService } from './services/request.service.ts';

async function main() {
    const robotsRes = await RequestService.request("https://books.toscrape.com/robots.txt");
    if (robotsRes.status !== 200) {
        console.log("no robots file found");
    }
};

main();


