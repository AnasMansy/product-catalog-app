'use client';

interface SearchBarProps {
  value: string;
  isDisabled?: boolean;
  onValueChange: (value: string) => void;
}

export default function SearchBar({
  value,
  isDisabled = false,
  onValueChange,
}: SearchBarProps) {
  return (
    <div className="rounded-[2rem] border border-black/10 bg-white/80 p-2 shadow-sm backdrop-blur">
      <label className="flex items-center gap-3 rounded-[1.5rem] bg-slate-50 px-4 py-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="h-5 w-5 text-slate-500"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.8"
        >
          <path d="m21 21-4.35-4.35" strokeLinecap="round" />
          <circle cx="11" cy="11" r="6" />
        </svg>
        <input
          type="search"
          value={value}
          disabled={isDisabled}
          placeholder="Search products by title, brand, or category"
          onChange={(event) => onValueChange(event.target.value)}
          className="w-full bg-transparent text-sm text-slate-900 outline-none placeholder:text-slate-400"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            className="rounded-full bg-slate-200 px-3 py-1 text-xs font-semibold text-slate-700 transition hover:bg-slate-300"
          >
            Clear
          </button>
        ) : null}
      </label>
    </div>
  );
}
