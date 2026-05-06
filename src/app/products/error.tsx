'use client';

import ErrorMessage from "@/components/ErrorMessage";

export default function ProductsError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <ErrorMessage
      title="Products route error"
      message={error.message || "The products view failed to render."}
      actionLabel="Retry"
      onAction={reset}
    />
  );
}
