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
    hoverGradient: "hover:from-green-800 hover:to-green-800/25",
    hoverBorder: "hover:border-green-800/50",
    hoverBg: "hover:bg-green-800 data-active:bg-green-800",
  },
  Transport: {
    icon: Car,
    color: "text-yellow-400",
    hoverGradient: "hover:from-yellow-900 hover:to-yellow-800/25",
    hoverBorder: "hover:border-yellow-800/50",
    hoverBg: "hover:bg-yellow-800 data-active:bg-yellow-800",
  },
  Shopping: {
    icon: ShoppingCart,
    color: "text-blue-400",
    hoverGradient: "hover:from-blue-900 hover:to-blue-800/25",
    hoverBorder: "hover:border-blue-800/50",
    hoverBg: "hover:bg-blue-800 data-active:bg-blue-800",
  },
  Credit: {
    icon: CreditCard,
    color: "text-red-400",
    hoverGradient: "hover:from-red-900 hover:to-red-800/25",
    hoverBorder: "hover:border-red-800/50",
    hoverBg: "hover:bg-red-800 data-active:bg-red-800",
  },
  Bills: {
    icon: Home,
    color: "text-purple-400",
    hoverGradient: "hover:from-purple-900 hover:to-purple-800/25",
    hoverBorder: "hover:border-purple-800/50",
    hoverBg: "hover:bg-purple-800 data-active:bg-purple-800",
  },
  Other: {
    icon: Package,
    color: "text-gray-400",
    hoverGradient: "hover:from-gray-700 hover:to-gray-700/25",
    hoverBorder: "hover:border-gray-700/50",
    hoverBg: "hover:bg-gray-700 data-active:bg-gray-700",
  },
};
