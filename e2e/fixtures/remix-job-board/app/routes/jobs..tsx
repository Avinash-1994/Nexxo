import { json, LoaderFunctionArgs } from "@remix-run/node";
import { useLoaderData } from "@remix-run/react";

export async function loader({ params }: LoaderFunctionArgs) {
  const jobs: Record<string, { id: string; title: string; company: string; salary: string; description: string; }> = {
    "1": { id: "1", title: "Senior Engineer", company: "Lunx", salary: "$180k", description: "Build next-gen build tooling." },
    "2": { id: "2", title: "Product Designer", company: "Qwik Labs", salary: "$140k", description: "Design the future of resumable UIs." },
  };
  const job = jobs[params.id || ""] || null;
  if (!job) throw new Response("Not Found", { status: 404 });
  return json({ job });
}

export default function JobDetail() {
  const { job } = useLoaderData<typeof loader>();
  return <article><h1>{job.title}</h1><p>{job.company} — {job.salary}</p><p>{job.description}</p></article>;
}
