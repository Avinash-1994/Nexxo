import { json, ActionFunctionArgs } from "@remix-run/node";
import { Form, useActionData } from "@remix-run/react";

export async function action({ request }: ActionFunctionArgs) {
  const form = await request.formData();
  const name = form.get("name") as string;
  const email = form.get("email") as string;
  const jobId = form.get("jobId") as string;
  if (!name || !email) return json({ error: "Name and email required" }, { status: 400 });
  return json({ success: true, applicationId: `APP-${Date.now()}`, name, email, jobId });
}

export default function Apply() {
  const data = useActionData<typeof action>();
  return (
    <main>
      <h1>Apply for a Job</h1>
      <Form method="post">
        <input name="name" placeholder="Full Name" required />
        <input name="email" type="email" placeholder="Email" required />
        <input name="jobId" placeholder="Job ID" />
        <button type="submit">Apply</button>
      </Form>
      {data?.success && <p>Applied! ID: {data.applicationId}</p>}
    </main>
  );
}
