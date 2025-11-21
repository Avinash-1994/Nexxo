exports.name = 'sample-plugin';
exports.transform = async function (code, id) {
  // naive transform: prepend a comment with plugin name and id
  return `/* transformed by sample-plugin ${id} */\n` + code.replace(/console\.log/g, 'console.debug');
};
