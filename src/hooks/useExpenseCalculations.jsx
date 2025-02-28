import { useMemo } from "react";

export const useExpenseCalculations = (expenses, date) => {
  const currentDay = date.getDate();
  const isFirstHalf = currentDay <= 15;
  const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD

  // Force recalculation by including the entire expenses object in dependencies
  const { firstHalfTotal, secondHalfTotal, totalForToday } = useMemo(() => {
    const currentMonth = date.getMonth();
    const currentYear = date.getFullYear();

    // Create date objects for period boundaries
    const firstHalfStart = new Date(currentYear, currentMonth, 1);
    const firstHalfEnd = new Date(
      currentYear,
      currentMonth,
      15,
      23,
      59,
      59,
      999
    ); // End of day on the 15th

    const secondHalfStart = new Date(currentYear, currentMonth, 16);
    const secondHalfEnd = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999
    ); // End of last day

    let firstHalfTotal = 0;
    let secondHalfTotal = 0;
    let totalForToday = 0;

    // Process each day's expenses
    Object.entries(expenses).forEach(([key, dayExpenses]) => {
      // Create Date object with time set to noon to avoid timezone issues
      const expenseDate = new Date(key + "T12:00:00");

      // Check if the date is in the current month
      const isCurrentMonth =
        expenseDate.getMonth() === currentMonth &&
        expenseDate.getFullYear() === currentYear;

      if (!isCurrentMonth) return;

      // Calculate day total
      const dayTotal = dayExpenses.reduce((sum, exp) => sum + exp.amount, 0);

      // Assign to proper half
      if (expenseDate >= firstHalfStart && expenseDate <= firstHalfEnd) {
        firstHalfTotal += dayTotal;
      } else if (
        expenseDate >= secondHalfStart &&
        expenseDate <= secondHalfEnd
      ) {
        secondHalfTotal += dayTotal;
      }

      // Today's total
      if (key === dateKey) {
        totalForToday = dayTotal;
      }
    });

    return {
      firstHalfTotal,
      secondHalfTotal,
      totalForToday,
    };
  }, [expenses, date, dateKey]); // Include the entire expenses object

  const categoryTotals = useMemo(() => {
    return Object.entries(expenses).reduce((acc, [key, dayExpenses]) => {
      const expenseDate = new Date(key);
      if (
        expenseDate.getMonth() === date.getMonth() &&
        expenseDate.getFullYear() === date.getFullYear()
      ) {
        dayExpenses.forEach((exp) => {
          acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
        });
      }
      return acc;
    }, {});
  }, [expenses, date]);

  const categoryTotalsForToday = useMemo(() => {
    return (expenses[dateKey] || []).reduce((acc, exp) => {
      acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      return acc;
    }, {});
  }, [expenses, dateKey]);

  return {
    calculatePeriodExpenses: {
      firstHalfTotal,
      secondHalfTotal,
      totalForToday,
    },
    categoryTotals,
    categoryTotalsForToday,
    totalForToday,
    isFirstHalf,
  };
};
