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
    <div className="border-stone-500 border-1 rounded-xl p-2 shadow-md shadow-stone-950">
      <h3 className="text-sm font-medium text-stone-300 mb-5 pb-2 border-b border-stone-500 flex justify-between items-center">
        <span>Weekly Spending</span>
        <span className="text-stone-300">
          {selectedMonth
            ? new Date(selectedMonth).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={weeklyTrendData}
          margin={{ top: 20, right: 20, left: -10, bottom: 10 }} // More space for labels
        >
          {/* Subtle Grid for a Clean Look */}
          <CartesianGrid strokeDasharray="2 2" stroke="#e7e5e4" opacity={0.4} />

          {/* X-Axis (Weeks) */}
          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#d6d3d1" }} // Lighter color for readability
            tickLine={{ stroke: "#4A5568" }}
          />

          {/* Y-Axis (Values) */}
          <YAxis
            tick={{ fontSize: 12, fill: "#d6d3d1" }}
            tickLine={{ stroke: "#4A5568" }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
          />

          {/* Tooltip */}
          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(16, 185, 129, 0.1)" }} // green-500 with 10% opacity
          />

          {/* Modern Gradient Bar with Hover Effect */}
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />{" "}
              {/* Green-500 */}
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.5} />{" "}
              {/* Teal-500 */}
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
