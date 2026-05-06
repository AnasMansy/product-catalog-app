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
    <div className="glass-panel rounded-[2rem] p-2">
      <label className="app-subtle-surface flex items-center gap-3 rounded-[1.5rem] px-4 py-3">
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="theme-muted h-5 w-5"
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
          className="app-input-plain w-full bg-transparent text-sm outline-none"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onValueChange("")}
            className="app-subtle-button rounded-full px-3 py-1 text-xs font-semibold transition"
          >
            Clear
          </button>
        ) : null}
      </label>
    </div>
  );
}
