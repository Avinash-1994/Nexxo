import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  json(200, [
    { id: '1', name: 'Lunx Pro Kit', price: 99, inStock: true },
    { id: '2', name: 'Qwik Builder', price: 149, inStock: true },
    { id: '3', name: 'Enterprise Bundle', price: 499, inStock: false },
  ]);
};
