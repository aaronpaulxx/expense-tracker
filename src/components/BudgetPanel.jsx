import React, { useEffect, useState } from "react";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const getPeriodLabel = (isFirstHalf, selectedDate) => {
  const date = new Date(selectedDate);

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    console.error("Invalid date provided:", selectedDate);
    return isFirstHalf ? "1st-15th" : "16th-??th"; // Fallback for debugging
  }

  const lastDayOfMonth = new Date(
    date.getFullYear(),
    date.getMonth() + 1,
    0
  ).getDate();

  // Function to determine the correct ordinal suffix
  const getOrdinalSuffix = (day) => {
    if (day >= 11 && day <= 13) return `${day}th`; // Special case for 11-13
    const lastDigit = day % 10;
    switch (lastDigit) {
      case 1:
        return `${day}st`;
      case 2:
        return `${day}nd`;
      case 3:
        return `${day}rd`;
      default:
        return `${day}th`;
    }
  };

  return isFirstHalf ? "1st-15th" : `16th-${getOrdinalSuffix(lastDayOfMonth)}`;
};

const BudgetPanel = ({
  budgets,
  calculatePeriodExpenses,
  currentBudget,
  isFirstHalf,
  expenses, // Raw expenses for direct tracking
  date,
}) => {
  // State to track current period expenses
  const [periodExpenses, setPeriodExpenses] = useState(0);

  // Update period expenses whenever calculatePeriodExpenses or expenses change
  useEffect(() => {
    // Use the appropriate total from calculatePeriodExpenses
    const total = isFirstHalf
      ? calculatePeriodExpenses.firstHalfTotal
      : calculatePeriodExpenses.secondHalfTotal;

    setPeriodExpenses(total);
  }, [calculatePeriodExpenses, isFirstHalf, expenses]); // Include raw expenses in dependencies

  // Derived calculations based on periodExpenses state
  const remainingBudget = currentBudget - periodExpenses;
  const budgetProgress = (periodExpenses / currentBudget) * 100;

  return (
    <div className="p-2 bg-gray-800 rounded-lg shadow-md shadow-gray-950">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-2">
        <div>
          <label className="text-xs font-medium text-gray-300">
            1st-15th Budget
          </label>
          <p className="text-xl font-bold text-green-300 bg-gray-900 px-4 py-1 rounded-md shadow-md shadow-gray-950">
            ₱{formatNumber(budgets.firstHalf)}
          </p>
        </div>
        <div>
          <label className="text-xs font-medium text-gray-300">
            {getPeriodLabel(false, date)} Budget
          </label>
          <p className="text-xl font-bold text-blue-300 bg-gray-900 px-4 py-1 rounded-md shadow-md shadow-gray-950">
            ₱{formatNumber(budgets.secondHalf)}
          </p>
        </div>
      </div>

      <div className="text-xs space-y-1">
        <div className="flex justify-between">
          <span className="text-gray-300">
            {getPeriodLabel(isFirstHalf, date)}
          </span>

          <span className="text-gray-300">
            ₱{formatNumber(periodExpenses)} / ₱{formatNumber(currentBudget)}
          </span>
        </div>
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${
              budgetProgress > 100
                ? "bg-red-500"
                : budgetProgress > 90
                ? "bg-orange-500"
                : budgetProgress > 80
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
          ></div>
        </div>
        <div className="flex justify-between">
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
            Remaining: ₱{formatNumber(remainingBudget)}
          </span>
          <span
            className={`${
              budgetProgress > 100
                ? "text-red-400"
                : budgetProgress > 90
                ? "text-orange-400"
                : budgetProgress > 80
                ? "text-yellow-400"
                : "text-gray-300"
            }`}
          >
            {budgetProgress.toFixed(1)}%
          </span>
        </div>
      </div>
    </div>
  );
};

export default BudgetPanel;
