import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

const getWeekNumber = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in the month

  const weekLength = Math.ceil(totalDays / 4); // Distribute days into 4 weeks
  return Math.min(Math.ceil(date.getDate() / weekLength), 4); // Assign week number
};

const formatWeeklyTrend = (expenses, selectedMonth) => {
  const weeklyData = { "Week 1": 0, "Week 2": 0, "Week 3": 0, "Week 4": 0 };

  Object.entries(expenses).forEach(([date, dayExpenses]) => {
    const expenseDate = new Date(date);
    const monthLabel = expenseDate.toLocaleString("default", {
      month: "short",
      year: "numeric",
    });

    if (monthLabel === selectedMonth) {
      const weekKey = `Week ${getWeekNumber(expenseDate)}`;
      weeklyData[weekKey] += dayExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
    }
  });

  return Object.entries(weeklyData).map(([week, Total]) => ({
    week,
    Total: Number(Total.toFixed(2)),
  }));
};

const WeeklySpendingChart = ({ expenses, selectedMonth }) => {
  const weeklyTrendData = React.useMemo(
    () => formatWeeklyTrend(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  return (
    <div className="bg-gray-800 rounded p-2 shadow-md shadow-gray-950">
      <h3 className="text-sm font-medium text-gray-300 mb-2">
        {selectedMonth
          ? `Weekly Spending - ${new Date(selectedMonth).toLocaleString(
              "en-US",
              {
                month: "long",
                year: "numeric",
              }
            )}`
          : "Weekly Spending"}
      </h3>
      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={weeklyTrendData}
          margin={{ top: 10, right: 20, left: 10, bottom: 20 }} // More space for labels
        >
          {/* Subtle Grid for a Clean Look */}
          <CartesianGrid strokeDasharray="2 2" stroke="#8c99ad" opacity={0.4} />

          {/* X-Axis (Weeks) */}
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#9ca3af" }} // Lighter color for readability
            tickLine={{ stroke: "#4A5568" }}
          />

          {/* Y-Axis (Values) */}
          <YAxis
            tick={{ fontSize: 12, fill: "#9ca3af" }}
            tickLine={{ stroke: "#4A5568" }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
          />

          {/* Tooltip */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(129, 140, 248, 0.1)" }}
          />

          {/* Modern Gradient Bar with Hover Effect */}
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#636cf1" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#9963f1" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          <Bar
            dataKey="Total"
            fill="url(#colorTotal)"
            radius={[8, 8, 0, 0]}
            barSize={30} // Adjusts bar thickness
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySpendingChart;
