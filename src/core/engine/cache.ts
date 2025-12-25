
import { BuildCache, CachedResult } from './types.js';

export class InMemoryBuildCache implements BuildCache {
    private store = new Map<string, CachedResult>();

    get(key: string): CachedResult | null {
        return this.store.get(key) || null;
    }

    set(key: string, value: CachedResult): void {
        this.store.set(key, value);
    }

    clear() {
        this.store.clear();
    }
}
