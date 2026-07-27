import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const useProduct = routeLoader$(async ({ params }) => {
  return { id: params.id, name: `Product ${params.id}`, price: 99 + Number(params.id) * 10 };
});

export default component$(() => {
  const product = useProduct();
  return <div><h1>{product.value.name}</h1><p>${product.value.price}</p></div>;
});
