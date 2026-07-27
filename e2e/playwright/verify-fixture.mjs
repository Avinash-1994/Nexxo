// Standalone SSR verifier — renders a fixture's entry-ssr.js via the real
// Lunx SSR runner (no dev server needed, so it is safe to run in parallel)
// and checks visible-text length + DOM markers the way the browser test does.
//
// Usage:
//   node verify-fixture.mjs <fixtureDir> <route> <minBody> <marker1> [marker2...]
// Markers are substrings that must appear in the rendered HTML.
import path from 'path';

const BUILD = path.resolve(path.dirname(new URL(import.meta.url).pathname), '../../');
const { SsrRunner } = await import(path.join(BUILD, 'packages/lunx-ssr/dist/runner.js'));

const [dir, route, minBodyStr, ...markers] = process.argv.slice(2);
const minBody = parseInt(minBodyStr, 10);
const fixture = path.join(BUILD, 'e2e/fixtures', dir);
const entry = path.join(fixture, 'src', 'entry-ssr.js');

const r = await new SsrRunner().renderToString(entry, { url: route }, { root: fixture });
const html = r.html || '';
// Approximate browser innerText: drop <script>/<style> bodies, strip tags,
// collapse whitespace.
const visible = html
  .replace(/<script[\s\S]*?<\/script>/gi, '')
  .replace(/<style[\s\S]*?<\/style>/gi, '')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const markerHits = markers.filter((m) => html.includes(m));
const bodyOk = visible.length > minBody;
const markerOk = markerHits.length > 0;
const pass = bodyOk && markerOk && !r.error;

console.log(`fixture:      ${dir}  route:${route}`);
console.log(`html bytes:   ${html.length}`);
console.log(`visible text: ${visible.length} (min ${minBody}) ${bodyOk ? 'OK' : 'BELOW MIN'}`);
console.log(`markers:      [${markerHits.join(', ') || 'NONE FOUND'}]  ${markerOk ? 'OK' : 'ABSENT'}`);
if (r.error) console.log(`render error: ${r.error.message}`);
console.log(pass ? 'RESULT: PASS' : 'RESULT: FAIL');
process.exit(pass ? 0 : 1);
