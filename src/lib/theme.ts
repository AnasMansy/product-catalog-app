export type AppTheme = "light" | "dark";

export const THEME_STORAGE_KEY = "catalog-pilot-theme";
export const DEFAULT_THEME: AppTheme = "light";
export const THEME_CHANGE_EVENT = "catalog-pilot-theme-change";

function isThemeValue(value: string | null): value is AppTheme {
  return value === "light" || value === "dark";
}

export function getStoredTheme(): AppTheme | null {
  if (typeof window === "undefined") {
    return null;
  }

  const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);

  return isThemeValue(storedTheme) ? storedTheme : null;
}

export function getSystemTheme(): AppTheme {
  if (typeof window === "undefined") {
    return DEFAULT_THEME;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getResolvedTheme(): AppTheme {
  return getStoredTheme() ?? getSystemTheme();
}

export function applyTheme(theme: AppTheme) {
  if (typeof document === "undefined") {
    return;
  }

  const root = document.documentElement;
  root.classList.remove("theme-light", "theme-dark");
  root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
  root.style.colorScheme = theme;
}

export function setTheme(theme: AppTheme) {
  if (typeof window !== "undefined") {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  }

  applyTheme(theme);

  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent(THEME_CHANGE_EVENT));
  }
}

export function subscribeToTheme(callback: () => void): () => void {
  if (typeof window === "undefined") {
    return () => undefined;
  }

  const handleStorage = (event: StorageEvent) => {
    if (event.key === THEME_STORAGE_KEY) {
      callback();
    }
  };

  const handleThemeChange = () => {
    callback();
  };

  window.addEventListener("storage", handleStorage);
  window.addEventListener(THEME_CHANGE_EVENT, handleThemeChange);

  return () => {
    window.removeEventListener("storage", handleStorage);
    window.removeEventListener(THEME_CHANGE_EVENT, handleThemeChange);
  };
}

export function getThemeInitializationScript(): string {
  return `(() => {
    try {
      const storageKey = "${THEME_STORAGE_KEY}";
      const storedTheme = window.localStorage.getItem(storageKey);
      const theme =
        storedTheme === "dark" || storedTheme === "light"
          ? storedTheme
          : window.matchMedia("(prefers-color-scheme: dark)").matches
            ? "dark"
            : "light";

      const root = document.documentElement;
      root.classList.remove("theme-light", "theme-dark");
      root.classList.add(theme === "dark" ? "theme-dark" : "theme-light");
      root.style.colorScheme = theme;
    } catch {
      document.documentElement.classList.add("theme-light");
      document.documentElement.style.colorScheme = "light";
    }
  })();`;
}
