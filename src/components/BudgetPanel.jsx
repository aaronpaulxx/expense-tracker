import React, { useEffect, useState } from "react";
import { Eye, EyeOff } from "lucide-react";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const BudgetPanel = ({
  budgets,
  calculatePeriodExpenses,
  currentBudget,
  isFirstHalf,
  expenses,
  date,
}) => {
  const [periodExpenses, setPeriodExpenses] = useState(0);
  const [showBudget, setShowBudget] = useState(false);

  useEffect(() => {
    const total = isFirstHalf
      ? calculatePeriodExpenses.firstHalfTotal
      : calculatePeriodExpenses.secondHalfTotal;
    setPeriodExpenses(total);
  }, [calculatePeriodExpenses, isFirstHalf, expenses]);

  const remainingBudget = currentBudget - periodExpenses;
  const budgetProgress =
    currentBudget > 0 ? (periodExpenses / currentBudget) * 100 : 0;

  return (
    <div className="p-2">
      {/* Budget Details Header with Eye Button */}
      <div className="mb-3 w-full flex items-center justify-between">
        <label className="text-md border-l-4 pl-2 border-stone-300 font-bold text-stone-100">
          Budget Details
        </label>
        <div className="relative group">
          <button
            className={`cursor-pointer p-2 transition-all duration-200 ${
              showBudget
                ? "text-red-500 hover:text-red-300"
                : "text-stone-300 hover:text-stone-100"
            }`}
            onClick={() => setShowBudget(!showBudget)}
          >
            {showBudget ? <EyeOff size={23} /> : <Eye size={23} />}
          </button>

          {/* Tooltip */}
          <span className="absolute right-10 bg-stone-800 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
            {showBudget ? "Hide Budget" : "Show Budget"}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 mb-3">
        {/* First Half Budget */}
        <div className="p-2 rounded-lg relative">
          <label className="mb-1 text-sm font-medium text-stone-300 flex items-center justify-center text-center">
            <span className="text-base">
              1<span className="text-xs relative top-[-4px]">st</span> - 15
              <span className="text-xs relative top-[-4px]">th</span> Budget
            </span>
          </label>
          <p
            className={`text-2xl font-bold text-stone-200 px-2 py-1 border-t border-b flex items-center justify-center text-center 
    ${isFirstHalf ? "border-green-400" : "border-stone-500"}`}
          >
            <span
              style={{
                filter: showBudget ? "none" : "blur(6px)",
                transition: "filter 0.3s ease-in-out", // Smooth transition effect
              }}
            >
              ₱{formatNumber(budgets.firstHalf)}
            </span>
          </p>
        </div>

        {/* Second Half Budget */}
        <div className="p-2 rounded-lg relative">
          <label className="mb-1 text-sm font-medium text-stone-300 flex items-center justify-center text-center">
            <span className="text-base">
              16<span className="text-xs relative top-[-4px]">th</span> -{" "}
              {(() => {
                const lastDay = new Date(
                  date.getFullYear(),
                  date.getMonth() + 1,
                  0
                ).getDate();
                const ordinalSuffix = (day) => {
                  if (day >= 11 && day <= 13) return "th";
                  const lastDigit = day % 10;
                  return lastDigit === 1
                    ? "st"
                    : lastDigit === 2
                    ? "nd"
                    : lastDigit === 3
                    ? "rd"
                    : "th";
                };
                return (
                  <>
                    {lastDay}
                    <span className="text-xs relative top-[-4px]">
                      {ordinalSuffix(lastDay)}
                    </span>
                  </>
                );
              })()}{" "}
              Budget
            </span>
          </label>

          <p
            className={`text-2xl font-bold text-stone-200 px-2 py-1 border-t border-b flex items-center justify-center text-center 
    ${!isFirstHalf ? "border-green-400" : "border-stone-500"}`}
          >
            <span
              style={{
                filter: showBudget ? "none" : "blur(6px)",
                transition: "filter 0.3s ease-in-out", // Smooth blur transition
              }}
            >
              ₱{formatNumber(budgets.secondHalf)}
            </span>
          </p>
        </div>
      </div>

      {/* Remaining Budget with Eye Button Toggle */}
      <div className="text-sm space-y-1">
        <div className="flex justify-between items-center">
          <p className="text-stone-300 text-left">
            Spent Percentage:
            <span
              className={`font-bold ${
                budgetProgress >= 100
                  ? "text-red-400"
                  : budgetProgress > 90
                  ? "text-orange-400"
                  : budgetProgress > 80
                  ? "text-yellow-400"
                  : "text-green-400"
              }`}
            >
              {" "}
              {formatNumber(budgetProgress)}%
            </span>
          </p>

          {/* Remaining Budget */}
          <div className="flex items-center">
            <span
              className={`${
                remainingBudget >= 0
                  ? budgetProgress > 90
                    ? "text-orange-400"
                    : budgetProgress > 80
                    ? "text-yellow-400"
                    : "text-green-400"
                  : "text-red-400"
              }`}
            >
              <span className="text-stone-300">Remaining: </span>
              {remainingBudget <= 0 ? (
                <span className="text-red-400 font-bold">
                  {" "}
                  Budget Exceeded!
                </span>
              ) : (
                <span
                  className={`${
                    budgetProgress > 90
                      ? "text-orange-400 font-bold"
                      : budgetProgress > 80
                      ? "text-yellow-400 font-bold"
                      : "text-green-400 font-bold"
                  }`}
                >
                  <span
                    style={{
                      filter: showBudget ? "none" : "blur(6px)",
                      transition: "filter 0.3s ease-in-out",
                    }}
                  >
                    ₱{formatNumber(remainingBudget)}
                  </span>
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-stone-700 rounded-full h-3 mb-2">
          <div
            className={`h-3 rounded-full transition-all duration-300 ${
              budgetProgress >= 100
                ? "bg-red-400"
                : budgetProgress > 90
                ? "bg-orange-400"
                : budgetProgress > 80
                ? "bg-yellow-400"
                : "bg-green-400"
            }`}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          ></div>
        </div>
      </div>
    </div>
  );
};

export default BudgetPanel;
