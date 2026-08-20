import { useMemo } from "react";

export const useExpenseCalculations = (expenses, date) => {
  const currentDay = date.getDate();
  const isFirstHalf = currentDay <= 15;
  const dateKey = date.toISOString().split("T")[0]; // Format: YYYY-MM-DD
  const monthKey = dateKey.slice(0, 7); // "YYYY-MM"

  const expensesByMonth = useMemo(() => {
    const grouped = {};
    Object.entries(expenses).forEach(([key, dayExpenses]) => {
      const key_month = key.slice(0, 7);
      (grouped[key_month] ??= {})[key] = dayExpenses;
    });
    return grouped;
  }, [expenses]);

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
      999,
    ); // End of day on the 15th

    const secondHalfStart = new Date(currentYear, currentMonth, 16);
    const secondHalfEnd = new Date(
      currentYear,
      currentMonth + 1,
      0,
      23,
      59,
      59,
      999,
    ); // End of last day

    let firstHalfTotal = 0;
    let secondHalfTotal = 0;
    let totalForToday = 0;

    // Only the current month's days, not the entire expense history
    const monthExpenses = expensesByMonth[monthKey] || {};

    Object.entries(monthExpenses).forEach(([key, dayExpenses]) => {
      // Create Date object with time set to noon to avoid timezone issues
      const expenseDate = new Date(key + "T12:00:00");

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
  }, [expensesByMonth, monthKey, date, dateKey]);

  const categoryTotals = useMemo(() => {
    const monthExpenses = expensesByMonth[monthKey] || {};
    return Object.values(monthExpenses).reduce((acc, dayExpenses) => {
      dayExpenses.forEach((exp) => {
        acc[exp.category] = (acc[exp.category] || 0) + exp.amount;
      });
      return acc;
    }, {});
  }, [expensesByMonth, monthKey]);

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
