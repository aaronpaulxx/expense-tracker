import { useEffect } from "react";
import { useLocalStorage } from "./useLocalStorage";

// Each palette overrides the same CSS custom properties defined in :root
// (src/index.css). "default" intentionally has no override block — it IS
// the :root values, so existing users see no change.
export const PALETTES = [
  {
    id: "default",
    name: "Default",
    accent: "var(--color-emerald-300)",
    accentSecondary: "var(--color-emerald-500)",
  },
  {
    id: "ocean",
    name: "Ocean",
    accent: "var(--color-blue-300)",
    accentSecondary: "var(--color-blue-500)",
  },
  {
    id: "sunset",
    name: "Sunset",
    accent: "var(--color-amber-300)",
    accentSecondary: "var(--color-orange-500)",
  },
  {
    id: "rose",
    name: "Rose",
    accent: "var(--color-rose-300)",
    accentSecondary: "var(--color-rose-500)",
  },
  {
    id: "violet",
    name: "Violet",
    accent: "var(--color-violet-300)",
    accentSecondary: "var(--color-violet-500)",
  },
];

const DEFAULT_THEME = "default";

export const useTheme = () => {
  const [theme, setTheme] = useLocalStorage("theme", DEFAULT_THEME);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  return { theme, setTheme, palettes: PALETTES };
};
