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
  },
  Transport: {
    icon: Car,
    color: "text-yellow-400",
  },
  Shopping: {
    icon: ShoppingCart,
    color: "text-blue-400",
  },
  Credit: {
    icon: CreditCard,
    color: "text-red-400",
  },
  Bills: {
    icon: Home,
    color: "text-purple-400",
  },
  Other: {
    icon: Package,
    color: "text-gray-400",
  },
};
