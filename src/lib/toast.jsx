import toast from "react-hot-toast";
import { Check, CircleX, AlertCircle } from "lucide-react";

const ACCENT = {
  success: "#22c55e", // green-500
  error: "#f87171", // red-400
  warning: "#fbbf24", // amber-400
  loading: "#60a5fa", // blue-400
};

const baseOptions = {
  duration: 5000,
  style: {
    background: "#1c1917", // stone-900
    color: "#fff",
    border: "1px solid #57534e", // stone-600
    borderRadius: "0.5rem",
    fontSize: "0.875rem",
    boxShadow:
      "0 10px 15px -3px rgb(0 0 0 / 0.3), 0 4px 6px -4px rgb(0 0 0 / 0.3)",
    cursor: "pointer", // click-to-dismiss, wired up in App.jsx's
    // custom Toaster renderer
  },
};

// Merges the shared base style with a type-specific left-border accent,
// letting a caller's own `options.style` win if provided.
const styleWithAccent = (accent, extra = {}, overrides = {}) => ({
  ...baseOptions.style,
  borderLeft: `3px solid ${accent}`,
  ...extra,
  ...overrides,
});

export const notifySuccess = (message, options = {}) =>
  toast.success(message, {
    ...baseOptions,
    ...options,
    style: styleWithAccent(ACCENT.success, {}, options.style),
    icon: <Check size={28} className="text-green-500 shrink-0" />,
  });

export const notifyError = (message, options = {}) =>
  toast.error(message, {
    ...baseOptions,
    duration: 8000,
    ...options,
    style: styleWithAccent(ACCENT.error, {}, options.style),
    icon: <CircleX size={28} className="text-red-400 shrink-0" />,
  });

export const notifyWarning = (message, options = {}) =>
  toast(message, {
    ...baseOptions,
    ...options,
    style: styleWithAccent(ACCENT.warning, {}, options.style),
    icon: <AlertCircle size={28} className="text-amber-400 shrink-0" />,
  });

export const notifyLoading = (message, options = {}) =>
  toast.loading(message, {
    ...baseOptions,
    ...options,
    style: styleWithAccent(
      ACCENT.loading,
      { cursor: "default" },
      options.style,
    ),
  });

export const notifyPromise = (promise, messages, options = {}) =>
  toast.promise(promise, messages, {
    ...baseOptions,
    ...options,
    loading: {
      style: styleWithAccent(ACCENT.loading, { cursor: "default" }),
      ...options.loading,
    },
    success: {
      style: styleWithAccent(ACCENT.success),
      icon: <Check size={28} className="text-green-500 shrink-0" />,
      ...options.success,
    },
    error: {
      style: styleWithAccent(ACCENT.error),
      icon: <CircleX size={28} className="text-red-400 shrink-0" />,
      duration: 8000,
      ...options.error,
    },
  });

export const pluralize = (count, word) => `${word}${count !== 1 ? "s" : ""}`;