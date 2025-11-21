export const name = 'sample-plugin-esm';
export async function transform(code, id) {
  return `/* transformed by sample-plugin-esm ${id} */\n` + code.replace(/console\.log/g, 'console.debug');
}
