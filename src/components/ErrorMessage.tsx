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
    <div className="app-error rounded-3xl p-6 shadow-sm">
      <p className="text-sm font-semibold uppercase tracking-[0.2em]">
        Error state
      </p>
      <h2 className="mt-2 text-xl font-semibold">{title}</h2>
      <p className="app-error-copy mt-3 text-sm leading-7">{message}</p>
      {actionLabel && onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="app-danger-button mt-5 rounded-full px-4 py-2 text-sm font-semibold transition"
        >
          {actionLabel}
        </button>
      ) : null}
    </div>
  );
}
