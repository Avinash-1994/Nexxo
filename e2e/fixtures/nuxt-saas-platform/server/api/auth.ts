
export default defineEventHandler((event) => {
  return { authenticated: true, user: 'admin' };
});
