
export async function load({ cookies }) {
  const session = cookies.get('session');
  if (!session) {
    const error = new Error('Redirect');
    error.status = 302;
    error.location = '/login';
    throw error;
  }
  return {
    userData: { id: 1, name: 'SvelteKit Admin', email: 'admin@acme.com' }
  };
}
