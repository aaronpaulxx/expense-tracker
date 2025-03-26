import React, { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

const COLORS = {
  Food: "#34d399",
  Transport: "#fbbf24",
  Shopping: "#3b82f6",
  Credit: "#ef4444",
  Bills: "#a78bfa",
  Other: "#9ca3af",
};

// Function to format expenses into monthly categories
const formatYearlyData = (expenses, selectedYear) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];

  const monthlyData = months.reduce((acc, month) => {
    acc[month] = {
      month,
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Credit: 0,
      Bills: 0,
      Other: 0,
    };
    return acc;
  }, {});

  Object.entries(expenses).forEach(([date, expenseList]) => {
    const expenseDate = new Date(date);
    const month = expenseDate.toLocaleString("default", { month: "short" });
    const year = expenseDate.getFullYear();

    if (year !== selectedYear) return;

    expenseList.forEach((expense) => {
      if (monthlyData[month]) {
        monthlyData[month][expense.category] += expense.amount;
      }
    });
  });

  return Object.values(monthlyData);
};

const YearlyOverviewChart = ({ expenses, selectedYear }) => {
  const [chartType, setChartType] = useState("line"); // "line" or "area"

  // 🧠 Memoize data to prevent unnecessary recalculations
  const data = useMemo(
    () => formatYearlyData(expenses, selectedYear),
    [expenses, selectedYear]
  );

  return (
    <div className="chart-container p-2 border-stone-500 border-1 rounded-xl shadow-md shadow-stone-950">
      <div className="flex justify-between items-center mb-5 border-b-1 border-stone-500 w-full">
        <h3 className="text-sm font-medium text-stone-300 mb-2 ">
          {selectedYear
            ? `Yearly Overview - ${selectedYear}`
            : "Yearly Overview"}
        </h3>

        {/* Toggle Switch */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input
            type="checkbox"
            checked={chartType === "area"}
            onChange={() =>
              setChartType(chartType === "line" ? "area" : "line")
            }
            className="sr-only peer"
          />
          <div className="mb-2 w-9 h-5 bg-green-500 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-4 peer-checked:bg-red-500 relative after:absolute after:top-0.5 after:left-0.5 after:bg-white after:border after:border-stone-300 after:rounded-full after:h-4 after:w-4 after:transition-all"></div>
        </label>
      </div>

      <ResponsiveContainer width="100%" height={200}>
        {chartType === "line" ? (
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            animateNewValues={true}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />

            <Legend
              verticalAlign="bottom"
              wrapperStyle={{
                display: "flex",
                justifyContent: "center",
                width: "100%",
                fontSize: "10px",
              }}
            />

            {/* 🟢 Generate Lines Dynamically */}
            {Object.keys(COLORS).map((category) => (
              <Line
                key={`line-${category}`} // 🔑 Ensures smooth updates
                type="monotone"
                dataKey={category}
                stroke={COLORS[category]}
              />
            ))}
          </LineChart>
        ) : (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
            animateNewValues={true}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#9ca3af" }} />
            <YAxis
              tick={{ fontSize: 12, fill: "#9ca3af" }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <Legend
              verticalAlign="bottom"
              wrapperStyle={{ fontSize: "10px" }}
            />

            {/* 🔵 Generate Areas Dynamically */}
            {Object.keys(COLORS).map((category, index) => (
              <Area
                key={`area-${category}`}
                type="monotone"
                dataKey={category}
                stackId={`${index + 1}`} // Stack categories separately
                stroke="none"
                fill={COLORS[category]}
                fillOpacity={0.3}
              />
            ))}
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default YearlyOverviewChart;
