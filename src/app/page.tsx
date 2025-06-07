import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';

export default async function page() {
  const isUserAuthenticated = await isAuthenticated();
  return isUserAuthenticated ? redirect("/dashboard") : redirect("sign-in")
}
