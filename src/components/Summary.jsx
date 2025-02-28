import React from "react";
import { Wallet } from "lucide-react";
import { CATEGORIES } from "../constants/categories";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const Summary = ({ categoryTotals, totalForDay, date }) => {
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
  }).format(date);

  return (
    <div className="mt-auto p-2 rounded bg-gray-800 text-sm h-auto shadow-md shadow-gray-950">
      <h3 className="text-sm font-medium text-gray-300 mb-2">
        Daily Summary - {dayName}
      </h3>
      <div className="space-y-1.5">
        {Object.entries(CATEGORIES).map(([category, { icon: Icon, color }]) => (
          <div
            key={category}
            className="flex justify-between items-center transform transition-transform duration-200"
          >
            <div className="flex items-center gap-2">
              <Icon size={20} className={color} />
              <span className="text-gray-300">{category}</span>
            </div>
            <span className="text-green-400 text-[15px]">
              ₱{formatNumber(categoryTotals?.[category] || 0)}
            </span>
          </div>
        ))}
        <div className="pt-3 border-t border-gray-700 flex justify-between font-semibold">
          <span className="text-white flex items-center gap-1 text-[20px]">
            <Wallet size={20} className="text-[#cfc80e]" />
            Total
          </span>
          <span className="text-green-400 text-[20px]">
            ₱{formatNumber(totalForDay)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default Summary;
