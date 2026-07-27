// app/routes/api/users.ts — server API route
export async function GET() {
  return new Response(JSON.stringify({ users: ['admin', 'guest', 'editor'] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
