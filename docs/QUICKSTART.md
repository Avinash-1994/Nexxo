Urja Build Tool - Quickstart (for absolute beginners)

This quickstart will get you from nothing to a working dev server in under 5 minutes.

1) Install dependencies

   Open a terminal in the project folder and run:

   npm install

2) Start the dev server

   Run the dev server (this serves the sample `public/index.html` and watches files):

   node dist/cli.js dev

   or (from source):

   npx ts-node src/cli.ts dev

3) Open the demo page

   Visit http://localhost:5173 in your browser.

4) Build for production

   node dist/cli.js build

   The production files will be written to `build_output/` and cached under `.urja_cache/`.

That's it — you now have a running dev server and can build production artifacts.
