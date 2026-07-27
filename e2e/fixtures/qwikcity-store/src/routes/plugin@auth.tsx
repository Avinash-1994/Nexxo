import type { RequestHandler } from '@builder.io/qwik-city';

export const onRequest: RequestHandler = async ({ cookie, next }) => {
  const session = cookie.get('session');
  if (session) { await next(); return; }
  await next();
};
