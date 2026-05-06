'use client';

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppSelector } from "@/store/hooks";

export default function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const { isHydrated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isHydrated || token) {
      return;
    }

    const redirectTarget = pathname
      ? `/login?redirectTo=${encodeURIComponent(pathname)}`
      : "/login";

    router.replace(redirectTarget);
  }, [isHydrated, pathname, router, token]);

  if (!isHydrated) {
    return <LoadingSpinner label="Restoring your session..." fullscreen />;
  }

  if (!token) {
    return <LoadingSpinner label="Redirecting to login..." fullscreen />;
  }

  return <>{children}</>;
}
