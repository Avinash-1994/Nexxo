import { component$ } from '@builder.io/qwik';
import { routeAction$ } from '@builder.io/qwik-city';

export const useCheckout = routeAction$(async (data) => {
  return { orderId: `ORD-QWK-${Date.now()}`, address: data.address, total: '$199.00' };
});

export default component$(() => {
  return <section><h1>Shopping Cart</h1><p>Your cart is empty.</p></section>;
});
