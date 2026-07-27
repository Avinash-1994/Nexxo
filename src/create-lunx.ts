#!/usr/bin/env node
import { createLunxProject } from './create/index.js';

const projectName = process.argv[2];
createLunxProject(projectName).catch((err) => {
    console.error(err);
    process.exit(1);
});
