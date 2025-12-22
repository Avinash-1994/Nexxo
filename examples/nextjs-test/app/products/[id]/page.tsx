export default function Product({ params }: { params: { id: string } }) {
  return (
    <div>
      <h1>Product {params.id}</h1>
      <p>App Router dynamic route</p>
    </div>
  );
}
