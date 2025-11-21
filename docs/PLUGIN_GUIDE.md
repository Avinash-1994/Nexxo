Plugin Guide — Writing a simple plugin

What is a plugin?
- A plugin extends the build tool by hooking into steps like `transform`.

Simple plugin example (JS): `src/plugins/samplePlugin.js`

exports.name = 'sample-plugin';
exports.transform = async function (code, id) {
  return `/* transformed by sample-plugin ${id} */\n` + code;
};

How to test your plugin
- Place your plugin in `src/plugins/`.
- Run the plugin sandbox test:

  node dist/plugins/testSandbox.js

Security and sandboxing
- Plugins run in separate worker processes to reduce risk. Avoid executing untrusted code.
