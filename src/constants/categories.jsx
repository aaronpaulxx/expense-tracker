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
  },
  Transport: {
    icon: Car,
    color: "text-yellow-400",
    hoverGradient: "hover:from-yellow-900 hover:to-yellow-800/25",
    hoverBorder: "hover:border-yellow-800/50",
  },
  Shopping: {
    icon: ShoppingCart,
    color: "text-blue-400",
    hoverGradient: "hover:from-blue-900 hover:to-blue-800/25",
    hoverBorder: "hover:border-blue-800/50",
  },
  Credit: {
    icon: CreditCard,
    color: "text-red-400",
    hoverGradient: "hover:from-red-900 hover:to-red-800/25",
    hoverBorder: "hover:border-red-800/50",
  },
  Bills: {
    icon: Home,
    color: "text-purple-400",
    hoverGradient: "hover:from-purple-900 hover:to-purple-800/25",
    hoverBorder: "hover:border-purple-800/50",
  },
  Other: {
    icon: Package,
    color: "text-gray-400",
    hoverGradient: "hover:from-gray-700 hover:to-gray-700/25",
    hoverBorder: "hover:border-gray-700/50",
  },
};
