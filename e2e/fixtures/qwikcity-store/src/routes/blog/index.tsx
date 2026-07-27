import { component$ } from '@builder.io/qwik';
import { routeLoader$ } from '@builder.io/qwik-city';

export const usePosts = routeLoader$(async () => [
  { slug: 'qwik-city-intro', title: 'Intro to Qwik City', date: '2025-01-01' },
  { slug: 'resumability', title: 'What is Resumability?', date: '2025-01-15' },
]);

export default component$(() => {
  const posts = usePosts();
  return <section><h1>Blog</h1>{posts.value.map(p => <article key={p.slug}><h2>{p.title}</h2></article>)}</section>;
});
