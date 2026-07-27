import type { RequestHandler } from '@builder.io/qwik-city';

export const onGet: RequestHandler = async ({ json }) => {
  json(200, [{ orderId: 'ORD-QWK-001', total: '$99.00', status: 'shipped' }]);
};

export const onPost: RequestHandler = async ({ request, json }) => {
  const body = await request.json();
  json(201, { orderId: `ORD-QWK-${Date.now()}`, ...body, status: 'pending' });
};
