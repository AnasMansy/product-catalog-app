'use client';

interface ErrorMessageProps {
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
}

export default function ErrorMessage({
  title = "Something went wrong",
  message,
  actionLabel,
  onAction,
}: ErrorMessageProps) {
  return (
    <div className="rounded-3xl border border-rose-200 bg-rose-50 p-6 text-rose-900 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em] text-rose-500">
        Error state
      </p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="mt-3 text-sm leading-7 text-rose-800/80">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="mt-5 rounded-full bg-rose-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-700"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
