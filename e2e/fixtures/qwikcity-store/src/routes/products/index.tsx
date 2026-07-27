import { component$ } from '@builder.io/qwik';
import { routeLoader$, routeAction$, Form } from '@builder.io/qwik-city';

export const useProducts = routeLoader$(async () => [
  { id: '1', name: 'Lunx Pro Kit', price: 99 },
  { id: '2', name: 'Qwik Builder', price: 149 },
  { id: '3', name: 'Enterprise Bundle', price: 499 },
]);

export const useAddToCart = routeAction$(async (data) => {
  return { success: true, productId: data.productId };
});

export default component$(() => {
  const products = useProducts();
  const addToCart = useAddToCart();
  return (
    <section>
      <h1>Products</h1>
      {products.value.map(p => (
        <div key={p.id}>
          <h2>{p.name}</h2>
          <p>${p.price}</p>
          <Form action={addToCart}>
            <input type="hidden" name="productId" value={p.id} />
            <button type="submit">Add to Cart</button>
          </Form>
        </div>
      ))}
    </section>
  );
});
