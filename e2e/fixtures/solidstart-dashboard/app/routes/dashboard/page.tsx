// app/routes/dashboard/page.tsx — protected dashboard
import { createServerData$ } from 'solid-start/server';
export const routeData = createServerData$(async (_, { request }) => {
  const session = request.headers.get('cookie')?.includes('session') ?? false;
  if (!session) throw new Response('Redirect', { status: 302, headers: { Location: '/login' } });
  return { user: { name: 'SolidStart Admin', email: 'admin@acme.com' }, role: 'admin' };
});
export default function Dashboard() {
  return <main><h1>Dashboard</h1></main>;
}
