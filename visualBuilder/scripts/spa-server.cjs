#!/usr/bin/env node
const express = require('express');
const path = require('path');
const app = express();
const port = process.env.PORT || 5001;
const root = path.resolve(__dirname, '..', 'build_output');

app.use(express.static(root, { index: false }));
// SPA fallback: for any request not matched by static files, return index.html
app.use((req, res) => {
  res.sendFile(path.join(root, 'index.html'));
});

const server = app.listen(port, () => {
  console.log(`SPA server serving ${root} on http://localhost:${port}`);
});

process.on('SIGINT', () => server.close(() => process.exit(0)));
