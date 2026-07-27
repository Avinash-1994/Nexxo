import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const usePost = routeLoader$(async ({ params }) => ({ slug: params.slug, title: `Post: ${params.slug}` }));

export default component$(() => {
  const post = usePost();
  return <article><h1>{post.value.title}</h1></article>;
});
