export default {
  options: (yargs: any) => {
    return yargs.option('yes', {
      type: 'boolean',
      description: 'Apply all migrations without prompting',
      default: false
    });
  },
  handler: async (args: any) => {
    const { runMigrate } = await import('../../commands/migrate.js');
    await runMigrate(process.cwd(), { yes: args.yes });
  }
};
