
/**
 * Nexxo ISR Logic (Data Stale-While-Revalidate)
 * Day 23: Framework-Agnostic SSR Lock
 */

export interface CacheEntry {
    html: string;
    timestamp: number;
    revalidate: number; // Seconds
}

export class ISRCache {
    private cache = new Map<string, CacheEntry>();

    get(url: string): string | null {
        const entry = this.cache.get(url);
        if (!entry) return null;

        const age = (Date.now() - entry.timestamp) / 1000;

        if (age > entry.revalidate) {
            // Stale: Return stale content but trigger background revalidate
            // In a real server, we'd emit an event here
            console.log(`[ISR] ${url} is stale. Revalidating...`);
            return entry.html;
        }

        return entry.html;
    }

    set(url: string, html: string, revalidate: number) {
        this.cache.set(url, {
            html,
            timestamp: Date.now(),
            revalidate
        });
    }
}
