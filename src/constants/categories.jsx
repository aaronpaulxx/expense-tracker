import {
  Utensils,
  Car,
  ShoppingCart,
  CreditCard,
  Home,
  Package,
} from "lucide-react";

export const CATEGORIES = {
  Food: {
    icon: Utensils,
    color: "text-green-400",
    hex: "#4ade80", // green-400
    overlayGradient: "from-green-800 to-green-800/25",
    hoverBg: "hover:bg-green-800 data-active:bg-green-800",
  },
  Transport: {
    icon: Car,
    color: "text-yellow-400",
    hex: "#fbbf24", // yellow-400
    overlayGradient: "from-yellow-800 to-yellow-800/25",
    hoverBg: "hover:bg-yellow-800 data-active:bg-yellow-800",
  },
  Shopping: {
    icon: ShoppingCart,
    color: "text-blue-400",
    hex: "#60a5fa", // blue-400
    overlayGradient: "from-blue-800 to-blue-800/25",
    hoverBg: "hover:bg-blue-800 data-active:bg-blue-800",
  },
  Credit: {
    icon: CreditCard,
    color: "text-red-400",
    hex: "#f87171", // red-400
    overlayGradient: "from-red-800 to-red-800/25",
    hoverBg: "hover:bg-red-800 data-active:bg-red-800",
  },
  Bills: {
    icon: Home,
    color: "text-purple-400",
    hex: "#c084fc", // purple-400
    overlayGradient: "from-purple-800 to-purple-800/25",
    hoverBg: "hover:bg-purple-800 data-active:bg-purple-800",
  },
  Other: {
    icon: Package,
    color: "text-gray-400",
    hex: "#9ca3af", // gray-400
    overlayGradient: "from-gray-600 to-gray-600/25",
    hoverBg: "hover:bg-gray-700 data-active:bg-gray-700",
  },
};

export const CATEGORY_COLORS = Object.fromEntries(
  Object.entries(CATEGORIES).map(([name, { hex }]) => [name, hex]),
);