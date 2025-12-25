/**
 * Advanced Federation Fallback System
 * Implements circuit breaker, retry logic, and graceful degradation
 */

export enum CircuitState {
    CLOSED = 'CLOSED',     // Normal operation
    OPEN = 'OPEN',         // Failing, reject requests
    HALF_OPEN = 'HALF_OPEN' // Testing if service recovered
}

export interface CircuitBreakerConfig {
    failureThreshold: number;      // Failures before opening circuit
    successThreshold: number;      // Successes to close circuit
    timeout: number;               // Time before attempting recovery (ms)
    monitoringPeriod: number;      // Window for counting failures (ms)
}

export interface RetryConfig {
    maxAttempts: number;
    initialDelay: number;          // ms
    maxDelay: number;              // ms
    backoffMultiplier: number;
}

export interface FallbackConfig {
    component?: any;               // Fallback component
    strategy: 'cache' | 'component' | 'error' | 'skip';
    cacheTTL?: number;            // Cache time-to-live (ms)
}

/**
 * Circuit Breaker for remote services
 */
class CircuitBreaker {
    private state: CircuitState = CircuitState.CLOSED;
    private failures: number = 0;
    private successes: number = 0;
    private lastFailureTime: number = 0;
    private nextAttemptTime: number = 0;
    private config: CircuitBreakerConfig;

    constructor(config: Partial<CircuitBreakerConfig> = {}) {
        this.config = {
            failureThreshold: config.failureThreshold || 5,
            successThreshold: config.successThreshold || 2,
            timeout: config.timeout || 60000, // 1 minute
            monitoringPeriod: config.monitoringPeriod || 10000 // 10 seconds
        };
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttemptTime) {
                throw new Error('Circuit breaker is OPEN');
            }
            // Try to recover
            this.state = CircuitState.HALF_OPEN;
        }

        try {
            const result = await fn();
            this.onSuccess();
            return result;
        } catch (error) {
            this.onFailure();
            throw error;
        }
    }

    private onSuccess(): void {
        this.failures = 0;

        if (this.state === CircuitState.HALF_OPEN) {
            this.successes++;
            if (this.successes >= this.config.successThreshold) {
                this.state = CircuitState.CLOSED;
                this.successes = 0;
            }
        }
    }

    private onFailure(): void {
        this.lastFailureTime = Date.now();
        this.failures++;

        if (this.failures >= this.config.failureThreshold) {
            this.state = CircuitState.OPEN;
            this.nextAttemptTime = Date.now() + this.config.timeout;
            this.successes = 0;
        }
    }

    getState(): CircuitState {
        return this.state;
    }

    reset(): void {
        this.state = CircuitState.CLOSED;
        this.failures = 0;
        this.successes = 0;
    }
}

/**
 * Retry logic with exponential backoff
 */
class RetryManager {
    private config: RetryConfig;

    constructor(config: Partial<RetryConfig> = {}) {
        this.config = {
            maxAttempts: config.maxAttempts || 3,
            initialDelay: config.initialDelay || 1000,
            maxDelay: config.maxDelay || 10000,
            backoffMultiplier: config.backoffMultiplier || 2
        };
    }

    async execute<T>(fn: () => Promise<T>): Promise<T> {
        let lastError: Error | null = null;
        let delay = this.config.initialDelay;

        for (let attempt = 1; attempt <= this.config.maxAttempts; attempt++) {
            try {
                return await fn();
            } catch (error) {
                lastError = error as Error;

                if (attempt < this.config.maxAttempts) {
                    console.warn(`[Retry] Attempt ${attempt} failed, retrying in ${delay}ms...`);
                    await this.sleep(delay);
                    delay = Math.min(delay * this.config.backoffMultiplier, this.config.maxDelay);
                }
            }
        }

        throw lastError || new Error('All retry attempts failed');
    }

    private sleep(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

/**
 * Advanced Fallback Manager
 */
export class FallbackManager {
    private circuitBreakers: Map<string, CircuitBreaker> = new Map();
    private retryManagers: Map<string, RetryManager> = new Map();
    private moduleCache: Map<string, { module: any; timestamp: number }> = new Map();
    private fallbackConfigs: Map<string, FallbackConfig> = new Map();

    /**
     * Register a fallback configuration for a remote
     */
    registerFallback(remoteName: string, config: FallbackConfig): void {
        this.fallbackConfigs.set(remoteName, config);
    }

    /**
     * Get or create circuit breaker for a remote
     */
    private getCircuitBreaker(remoteName: string): CircuitBreaker {
        if (!this.circuitBreakers.has(remoteName)) {
            this.circuitBreakers.set(remoteName, new CircuitBreaker());
        }
        return this.circuitBreakers.get(remoteName)!;
    }

    /**
     * Get or create retry manager for a remote
     */
    private getRetryManager(remoteName: string): RetryManager {
        if (!this.retryManagers.has(remoteName)) {
            this.retryManagers.set(remoteName, new RetryManager());
        }
        return this.retryManagers.get(remoteName)!;
    }

    /**
     * Load module with advanced fallback strategies
     */
    async loadWithFallback<T>(
        remoteName: string,
        loadFn: () => Promise<T>
    ): Promise<T> {
        const cacheKey = remoteName;
        const fallbackConfig = this.fallbackConfigs.get(remoteName);
        const circuitBreaker = this.getCircuitBreaker(remoteName);
        const retryManager = this.getRetryManager(remoteName);

        // Strategy 1: Try cache first (if configured)
        if (fallbackConfig?.strategy === 'cache') {
            const cached = this.moduleCache.get(cacheKey);
            if (cached) {
                const age = Date.now() - cached.timestamp;
                const ttl = fallbackConfig.cacheTTL || 300000; // 5 minutes default

                if (age < ttl) {
                    console.log(`[Fallback] Using cached module for ${remoteName}`);
                    return cached.module;
                }
            }
        }

        // Strategy 2: Try loading with circuit breaker + retry
        try {
            const module = await circuitBreaker.execute(async () => {
                return await retryManager.execute(loadFn);
            });

            // Cache successful load
            if (fallbackConfig?.strategy === 'cache') {
                this.moduleCache.set(cacheKey, {
                    module,
                    timestamp: Date.now()
                });
            }

            return module;
        } catch (error) {
            console.error(`[Fallback] Failed to load ${remoteName}:`, error);

            // Strategy 3: Use fallback component
            if (fallbackConfig?.component) {
                console.warn(`[Fallback] Using fallback component for ${remoteName}`);
                return fallbackConfig.component as T;
            }

            // Strategy 4: Use stale cache (if available)
            if (fallbackConfig?.strategy === 'cache') {
                const cached = this.moduleCache.get(cacheKey);
                if (cached) {
                    console.warn(`[Fallback] Using stale cache for ${remoteName}`);
                    return cached.module;
                }
            }

            // Strategy 5: Skip (return null/empty)
            if (fallbackConfig?.strategy === 'skip') {
                console.warn(`[Fallback] Skipping ${remoteName}`);
                return null as T;
            }

            // Strategy 6: Throw error (default)
            throw error;
        }
    }

    /**
     * Get circuit breaker status for monitoring
     */
    getStatus(remoteName: string): {
        circuitState: CircuitState;
        hasCachedModule: boolean;
    } {
        const circuitBreaker = this.circuitBreakers.get(remoteName);
        const cached = this.moduleCache.has(remoteName);

        return {
            circuitState: circuitBreaker?.getState() || CircuitState.CLOSED,
            hasCachedModule: cached
        };
    }

    /**
     * Reset circuit breaker for a remote
     */
    reset(remoteName: string): void {
        this.circuitBreakers.get(remoteName)?.reset();
    }

    /**
     * Clear all caches
     */
    clearCache(): void {
        this.moduleCache.clear();
    }
}

// Export singleton instance
export const fallbackManager = new FallbackManager();
