export class RequestRepository {
    public static async fetchResource(url: string, options?: RequestInit): Promise<Response> {
        return await fetch(url, options);
    };
};