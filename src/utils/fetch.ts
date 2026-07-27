let cachedFetch: typeof fetch | null = null;

export async function getFetch(): Promise<typeof fetch> {
  if (cachedFetch) return cachedFetch;

  if (typeof globalThis.fetch === 'function') {
    cachedFetch = globalThis.fetch.bind(globalThis) as typeof fetch;
    return cachedFetch;
  }

  try {
    const nodeFetch = await import('node-fetch');
    const fetchFn = (nodeFetch.default ?? nodeFetch) as typeof fetch;

    if (typeof fetchFn !== 'function') {
      throw new Error('node-fetch did not export a fetch function');
    }

    cachedFetch = fetchFn;
    return cachedFetch;
  } catch (error) {
    throw new Error(
      'No fetch implementation available. Install node-fetch or run on Node 18+ with global fetch support.'
    );
  }
}
