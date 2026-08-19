import toast from "react-hot-toast";
import { Check, CircleX, AlertCircle, X } from "lucide-react";

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
  },
};

export const notifySuccess = (message, options = {}) =>
  toast.success(message, {
    ...baseOptions,
    ...options,
    icon: <Check size={28} className="text-green-500 shrink-0" />,
  });

export const notifyError = (message, options = {}) =>
  toast.error(
    (t) => (
      <div className="flex items-start gap-3 w-full">
        <div className="flex-1">{message}</div>
        <button
          onClick={() => toast.dismiss(t.id)}
          aria-label="Dismiss"
          className="shrink-0 text-stone-400 hover:text-white transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    ),
    {
      ...baseOptions,
      duration: 8000,
      ...options,
      icon: <CircleX size={28} className="text-red-400 shrink-0" />,
    },
  );

export const notifyWarning = (message, options = {}) =>
  toast(message, {
    ...baseOptions,
    ...options,
    icon: <AlertCircle size={28} className="text-amber-400 shrink-0" />,
  });

export const notifyLoading = (message, options = {}) =>
  toast.loading(message, {
    ...baseOptions,
    ...options,
  });

export const notifyPromise = (promise, messages, options = {}) =>
  toast.promise(promise, messages, {
    ...baseOptions,
    ...options,
    success: {
      icon: <Check size={28} className="text-green-500 shrink-0" />,
      ...options.success,
    },
    error: {
      icon: <CircleX size={28} className="text-red-400 shrink-0" />,
      duration: 8000,
      ...options.error,
    },
  });
