export function loader({ params }: any) {
  return { username: params.username };
}

export default function Profile() {
  return <h1>Profile</h1>;
}
