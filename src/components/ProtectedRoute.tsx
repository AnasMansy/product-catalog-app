'use client';

import { useEffect, useSyncExternalStore } from "react";
import { usePathname, useRouter } from "next/navigation";

import LoadingSpinner from "@/components/LoadingSpinner";
import { useAppSelector } from "@/store/hooks";

function subscribeToClientReady() {
  return () => undefined;
}

export default function ProtectedRoute({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const router = useRouter();
  const pathname = usePathname();
  const isClient = useSyncExternalStore(
    subscribeToClientReady,
    () => true,
    () => false,
  );
  const { isHydrated, token } = useAppSelector((state) => state.auth);

  useEffect(() => {
    if (!isClient || !isHydrated || token) {
      return;
    }

    const redirectTarget = pathname
      ? `/login?redirectTo=${encodeURIComponent(pathname)}`
      : "/login";

    router.replace(redirectTarget);
  }, [isClient, isHydrated, pathname, router, token]);

  if (!isClient || !isHydrated) {
    return <LoadingSpinner label="Restoring your session..." fullscreen />;
  }

  if (!token) {
    return <LoadingSpinner label="Redirecting to login..." fullscreen />;
  }

  return <>{children}</>;
}
