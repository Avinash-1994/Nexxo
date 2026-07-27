// ── MARKER: TypeScript source at LINE 3 ──
interface User {
  id: number;       // line 4
  name: string;     // line 5
}

// ── MARKER: known function at LINE 9 ──
export function greet(user: User): string {
  const greeting = `Hello, ${user.name}!`;  // line 10 — ANCHOR
  return greeting;
}

export const VERSION = '1.7';
