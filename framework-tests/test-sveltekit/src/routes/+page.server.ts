export const load = async () => ({
  posts: [
    { slug:'lunx-1-0-release', title:'Lunx 1.0: Production-Ready Build Tool', category:'Engineering', date:'2026-05-14', excerpt:'After 303 tests and 6 months of development, Lunx 1.0 is ready. Here\'s what changed.', tags:['release','engineering'] },
    { slug:'sveltekit-ssr-deep-dive', title:'SvelteKit SSR with Lunx: Zero Config', category:'Tutorial', date:'2026-05-10', excerpt:'How Lunx auto-detects SvelteKit and configures SSR with no config needed.', tags:['sveltekit','ssr','tutorial'] },
    { slug:'security-gate-design', title:'Designing a CVE Security Gate', category:'Security', date:'2026-05-06', excerpt:'We built a build-time CVE scanner that integrates with OSV and blocks HIGH severity by default.', tags:['security','cve','sbom'] },
    { slug:'module-federation-2026', title:'Module Federation in 2026', category:'Architecture', date:'2026-05-01', excerpt:'Lunx brings native MFE support across React, Vue, and Angular with zero configuration.', tags:['mfe','architecture'] },
  ]
});
