#!/usr/bin/env node
import { createNexxoProject } from './create/index.js';

const projectName = process.argv[2];
createNexxoProject(projectName).catch((err) => {
    console.error(err);
    process.exit(1);
});
