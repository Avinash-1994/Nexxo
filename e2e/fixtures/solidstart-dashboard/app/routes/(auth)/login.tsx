// app/routes/(auth)/login.tsx — layout group, no URL segment
import { useAction } from 'solid-start';
export async function loginAction(form: FormData) {
  return { success: true, token: 'solid-jwt-test' };
}
export default function Login() {
  return <main><h1>Login</h1></main>;
}
