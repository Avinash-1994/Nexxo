import { json } from "@remix-run/node";

export async function loader() {
  return json([
    { id: "1", title: "Senior Engineer", company: "Lunx" },
    { id: "2", title: "Product Designer", company: "Qwik Labs" },
    { id: "3", title: "DevRel Engineer", company: "Astro Inc" },
  ]);
}
