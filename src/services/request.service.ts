export class RequestService {
    private static async fetchResource(url: string, options?: RequestInit): Promise<Response> {
        return await fetch(url, options)
    };

    public static async request(url: string, options?: RequestInit) {
        const response = await this.fetchResource(url, options)
        return response
    }
}
