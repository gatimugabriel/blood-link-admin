import { ReactNode, Suspense } from "react";
import { PageLoading } from "@/components/page-loading";

const AuthLayout = ({ children }: { children: ReactNode }) => {
  return (
    <div className="auth-layout">
      <Suspense fallback={<PageLoading message="Loading..." />}>
        {children}
      </Suspense>
    </div>
  );
};

export default AuthLayout;