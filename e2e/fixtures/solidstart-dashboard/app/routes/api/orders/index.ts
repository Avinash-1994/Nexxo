// app/routes/api/orders/index.ts — server API route
export async function GET() {
  return new Response(JSON.stringify({ orders: [{ id: 'ORD-001', total: 99 }] }), {
    headers: { 'Content-Type': 'application/json' }
  });
}
export async function POST({ request }: { request: Request }) {
  const body = await request.json();
  return new Response(JSON.stringify({ success: true, orderId: 'ORD-' + Date.now(), ...body }), {
    status: 201, headers: { 'Content-Type': 'application/json' }
  });
}
