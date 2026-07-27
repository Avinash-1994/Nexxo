// react-router.config.ts — Lunx Phase 2.9
import type { Config } from '@react-router/dev/config';

export default {
  appDirectory: 'app',
  ssr: true,
  // Prerender static routes at build time
  async prerender() {
    return ['/', '/about'];
  },
} satisfies Config;
