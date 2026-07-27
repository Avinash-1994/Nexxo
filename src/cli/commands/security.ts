/**
 * Security command — all 8 subcommands consolidated
 * audit | scan | cve | sbom | plugin-audit | fix | headers | report
 */
export default {
  builder: (yargs: any) => {
    return yargs
      .command(
        'audit',
        'Audit lockfile integrity and scan dist/ for secrets',
        () => {},
        async () => {
          const { runSecurityAudit } = await import('../../commands/security.js');
          const res = await runSecurityAudit();
          if (res?.exitCode) process.exit(res.exitCode);
        }
      )
      .command(
        'scan',
        'Scan source files for leaked secrets',
        (y: any) => y
          .option('dir', { type: 'string', default: 'src', description: 'Directory to scan' })
          .option('include-dist', { type: 'boolean', default: false, description: 'Also scan dist/' })
          .option('allowlist', { type: 'string', description: 'Regex pattern to allowlist lines' })
          .option('ci', { type: 'boolean', default: false, description: 'Exit 1 on any finding (CI mode)' }),
        async (args: any) => {
          const { runSecurityScan } = await import('../../commands/security.js');
          const res = await runSecurityScan(args);
          if (res?.exitCode) process.exit(res.exitCode);
        }
      )
      .command(
        'cve',
        'Check dependencies against CVE database (OSV.dev)',
        (y: any) => y
          .option('severity', {
            type: 'string',
            choices: ['critical', 'high', 'medium', 'low', 'off'],
            default: 'high',
            description: 'Minimum severity to report'
          })
          .option('no-cache', { type: 'boolean', default: false, description: 'Bypass CVE cache' })
          .option('json', { type: 'boolean', default: false, description: 'Output as JSON' }),
        async (args: any) => {
          const { runCVEScan } = await import('../../commands/security.js');
          const res = await runCVEScan(args);
          if (res?.exitCode) process.exit(res.exitCode);
        }
      )
      .command(
        'sbom',
        'Generate Software Bill of Materials (CycloneDX 1.5)',
        () => {},
        async () => {
          const { runSBOMCommand } = await import('../../commands/security.js');
          await runSBOMCommand();
        }
      )
      .command(
        'plugin-audit',
        'Audit installed Lunx plugin permissions',
        () => {},
        async () => {
          const { runPluginAuditCommand } = await import('../../commands/security.js');
          await runPluginAuditCommand();
        }
      )
      .command(
        'fix',
        'Auto-fix: npm audit fix + process.env → import.meta.env rewrite',
        () => {},
        async () => {
          const { runSecurityFix } = await import('../../commands/security.js');
          await runSecurityFix();
        }
      )
      .command(
        'headers',
        'Generate security headers for your server',
        (y: any) => y
          .option('format', {
            type: 'string',
            choices: ['nginx', 'vercel', 'netlify', 'cloudflare', 'apache'],
            default: 'vercel',
            description: 'Output format'
          })
          .option('strict', { type: 'boolean', default: false, description: 'Disable unsafe-inline in CSP' })
          .option('output', { type: 'string', description: 'Write to file instead of stdout' }),
        async (args: any) => {
          const { runSecurityHeaders } = await import('../../commands/security.js');
          await runSecurityHeaders(args);
        }
      )
      .command(
        'report',
        'Generate full security report (HTML or JSON)',
        (y: any) => y
          .option('format', {
            type: 'string',
            choices: ['html', 'json', 'pdf'],
            default: 'html',
            description: 'Report format'
          })
          .option('output', { type: 'string', description: 'Output file path' }),
        async (args: any) => {
          const { runSecurityReport } = await import('../../commands/security.js');
          await runSecurityReport(args);
        }
      )
      .demandCommand(1,
        'Specify a security subcommand: audit, scan, cve, sbom, plugin-audit, fix, headers, report'
      );
  }
};
