#!/usr/bin/env node
import { createUrjaProject } from './create/index.js';

const projectName = process.argv[2];
createUrjaProject(projectName).catch((err) => {
    console.error(err);
    process.exit(1);
});
