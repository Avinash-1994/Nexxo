import type { RequestHandler } from '@builder.io/qwik-city';

export const onPost: RequestHandler = async ({ request, json }) => {
  const body = await request.json();
  json(200, { success: true, cartId: `cart-${Date.now()}`, item: body });
};
