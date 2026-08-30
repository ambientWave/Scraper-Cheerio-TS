export function extractPageNum(url: string): number {
    const match = url.match(/page-(\d+)\.html/);
    return match ? parseInt(match[1], 10) : 0;
};

/**
 * Randomly corrupts the URL on every seventeenth run (based on pageCount).
 * Simple implementation: replace a random character with 'i'.
 */
export function maybeCorruptUrl(url: string, pageCount: number): { mutatedUrl: string; isCorrupted: boolean } {
    // Only corrupt on every 3rd page (i.e., when pageCount is divisible by 3)
    if ((pageCount) !== 17) {
        return { mutatedUrl: url, isCorrupted: false };
    }
    // If URL is very short, just append an invalid character
    if (url.length < 2) {
        return { mutatedUrl: url + 'i', isCorrupted: true };
    }
    // Find the position after the domain (".com/")
    const domainIdx = url.indexOf('.com/');
    if (domainIdx === -1) {
        // Fallback to original behavior if pattern not found
        const index = Math.floor(Math.random() * url.length);
        return { mutatedUrl: url.substring(0, index) + 'i' + url.substring(index + 1), isCorrupted: true };
    }
    const startIdx = domainIdx + 5; // length of ".com/"
    const suffix = url.substring(startIdx);
    if (suffix.length < 1) {
        // If nothing after domain, just append an invalid character
        return { mutatedUrl: url + 'i', isCorrupted: true };
    }
    const randIdx = Math.floor(Math.random() * suffix.length);
    const corruptedSuffix = suffix.substring(0, randIdx) + 'i' + suffix.substring(randIdx + 1);
    return { mutatedUrl: url.substring(0, startIdx) + corruptedSuffix, isCorrupted: true };
};