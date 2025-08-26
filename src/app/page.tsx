import { Suspense } from 'react';
import { isAuthenticated } from '@/lib/actions/auth.action';
import { redirect } from 'next/navigation';
import { PageLoading } from '@/components/page-loading';

async function PageContent() {
  const isUserAuthenticated = await isAuthenticated();
  return isUserAuthenticated ? redirect("/dashboard") : redirect("/sign-in");
}

export default function Page() {
  return (
    <Suspense fallback={<PageLoading message="Checking authentication..." />}>
      <PageContent />
    </Suspense>
  );
}
