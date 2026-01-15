/**
 * Nexxo Test API
 * Lightweight implementation of Vitest/Jest API
 */

export type TestFn = () => void | Promise<void>;

export interface TestContext {
    name: string;
    fn: TestFn;
    status: 'pending' | 'passed' | 'failed' | 'skipped';
    error?: Error;
    duration?: number;
}

export interface SuiteContext {
    name: string;
    tests: TestContext[];
    suites: SuiteContext[];
}

let currentSuite: SuiteContext = { name: 'root', tests: [], suites: [] };
let rootSuites: SuiteContext[] = [];

export function describe(name: string, fn: () => void) {
    const parent = currentSuite;
    const newSuite: SuiteContext = { name, tests: [], suites: [] };

    // If we are at root (and not inside another suite), push to rootSuites
    if (parent.name === 'root') {
        rootSuites.push(newSuite);
    } else {
        parent.suites.push(newSuite);
    }

    currentSuite = newSuite;
    try {
        fn();
    } finally {
        currentSuite = parent;
    }
}

export function it(name: string, fn: TestFn) {
    currentSuite.tests.push({
        name,
        fn,
        status: 'pending'
    });
}

export const test = it;

// --- Expectation Matchers ---

class Expectation<T> {
    constructor(private actual: T, private isNot: boolean = false) { }

    get not() {
        return new Expectation(this.actual, !this.isNot);
    }

    toBe(expected: T) {
        const pass = this.actual === expected;
        this.assert(pass, `Expected ${this.actual} to be ${expected}`);
    }

    toEqual(expected: T) {
        const pass = JSON.stringify(this.actual) === JSON.stringify(expected);
        this.assert(pass, `Expected ${JSON.stringify(this.actual)} to equal ${JSON.stringify(expected)}`);
    }

    toBeTruthy() {
        const pass = !!this.actual;
        this.assert(pass, `Expected ${this.actual} to be truthy`);
    }

    toBeFalsy() {
        const pass = !this.actual;
        this.assert(pass, `Expected ${this.actual} to be falsy`);
    }

    toContain(item: any) {
        let pass = false;
        if (Array.isArray(this.actual)) {
            pass = this.actual.includes(item);
        } else if (typeof this.actual === 'string') {
            pass = this.actual.includes(item);
        }
        this.assert(pass, `Expected ${this.actual} to contain ${item}`);
    }

    private assert(pass: boolean, message: string) {
        if (this.isNot) pass = !pass;
        if (!pass) {
            throw new Error(this.isNot ? message.replace('to', 'not to') : message);
        }
    }
}

export function expect<T>(actual: T) {
    return new Expectation(actual);
}

// --- Mocking (Simple) ---

export const vi = {
    fn: (impl?: (...args: any[]) => any) => {
        const mockFn = (...args: any[]) => {
            mockFn.calls.push(args);
            return impl ? impl(...args) : undefined;
        };
        mockFn.calls = [] as any[][];
        mockFn.mockImplementation = (newImpl: any) => { impl = newImpl; };
        return mockFn;
    },
    mock: (moduleName: string, factory: any) => {
        // This relies on the runner to intercept imports
        (globalThis as any).__NEXXO_MOCKS__ = (globalThis as any).__NEXXO_MOCKS__ || {};
        (globalThis as any).__NEXXO_MOCKS__[moduleName] = factory;
    }
};

// Internal API to retrieve collected suites
export function __getCollectedSuites() {
    const suites = rootSuites;
    rootSuites = []; // partial cleanup
    return suites;
}
