interface LoadingSpinnerProps {
  label?: string;
  fullscreen?: boolean;
}

export default function LoadingSpinner({
  label = "Loading...",
  fullscreen = false,
}: LoadingSpinnerProps) {
  return (
    <div
      className={[
        "app-loading flex items-center justify-center gap-3 rounded-3xl p-6 shadow-sm",
        fullscreen ? "min-h-[50vh]" : "min-h-32",
      ].join(" ")}
      role="status"
      aria-live="polite"
    >
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-teal-600 border-t-transparent" />
      <span className="text-sm font-medium">{label}</span>
    </div>
  );
}
