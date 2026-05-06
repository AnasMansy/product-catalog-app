'use client';

import ErrorMessage from "@/components/ErrorMessage";

export default function GlobalError({
  error,
  reset,
}: Readonly<{
  error: Error & { digest?: string };
  reset: () => void;
}>) {
  return (
    <html lang="en">
      <body className="mx-auto flex min-h-screen max-w-3xl items-center px-4 py-10">
        <ErrorMessage
          title="Application error"
          message={error.message || "An unexpected error interrupted the app."}
          actionLabel="Try again"
          onAction={reset}
        />
      </body>
    </html>
  );
}
