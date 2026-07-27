import { json } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader() {
  return json({ jobs: [
    { id: "1", title: "Senior Engineer", company: "Lunx", salary: "$180k", type: "remote" },
    { id: "2", title: "Product Designer", company: "Qwik Labs", salary: "$140k", type: "hybrid" },
    { id: "3", title: "DevRel Engineer", company: "Astro Inc", salary: "$160k", type: "remote" },
  ]});
}

export default function Index() {
  const { jobs } = useLoaderData<typeof loader>();
  return <main><h1>Lunx Job Board</h1>{jobs.map(j => <article key={j.id}><h2>{j.title}</h2><p>{j.company} · {j.salary} · {j.type}</p></article>)}</main>;
}
