import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { CustomTooltip } from "./CustomTooltip";

const COLORS = {
  Food: "#34d399",
  Transport: "#fbbf24",
  Shopping: "#3b82f6",
  Credit: "#ef4444",
  Bills: "#a78bfa",
  Other: "#9ca3af",
};

const formatCategoryData = (categoryTotals) => {
  const baseCategories = Object.keys(COLORS).map((category) => ({
    name: category,
    value: 0, // Default to 0 for smooth transition
    color: COLORS[category],
  }));

  return baseCategories.map((entry) => ({
    ...entry,
    value: categoryTotals?.[entry.name]
      ? Number(categoryTotals[entry.name].toFixed(2))
      : 0,
  }));
};

const ExpenseCategoriesChart = ({ categoryTotals, selectedMonth }) => {
  const formattedData = useMemo(
    () => formatCategoryData(categoryTotals),
    [categoryTotals]
  );
  const [animatedData, setAnimatedData] = useState(formattedData);

  // Animate from the previous values to the new ones
  useEffect(() => {
    let animationFrame;
    const duration = 500; // Animation duration in ms
    const startTime = performance.now();

    const animate = (time) => {
      const progress = Math.min((time - startTime) / duration, 1);
      const newData = formattedData.map((entry, index) => ({
        ...entry,
        value:
          animatedData[index].value +
          (entry.value - animatedData[index].value) * progress,
      }));

      setAnimatedData(newData);

      if (progress < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };

    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [formattedData]);

  return (
    <div className="bg-gray-800 rounded p-2 flex flex-col shadow-md shadow-gray-950">
      <h3 className="text-sm font-medium text-gray-300 mb-2">
        {selectedMonth
          ? `Monthly Category Breakdown - ${new Date(
              selectedMonth
            ).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}`
          : "Monthly Category Breakdown"}
      </h3>

      <div className="flex-1 flex items-center justify-center">
        {animatedData.some((entry) => entry.value > 0) ? (
          <div className="flex w-full items-center justify-center gap-5">
            {/* Custom Legend with better alignment */}
            <div className="w-40">
              {animatedData.map((entry) => {
                const total = animatedData.reduce(
                  (sum, item) => sum + item.value,
                  0
                );
                const percentage =
                  total > 0 ? ((entry.value / total) * 100).toFixed(1) : "0.0";

                return (
                  <div
                    key={entry.name}
                    className="flex items-center text-gray-300 text-sm mb-1 pl-5"
                  >
                    {/* Category Color Indicator */}
                    <div
                      className="w-2 h-4 rounded-full mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>

                    {/* Label and Percentage in a fixed grid */}
                    <div className="flex w-full justify-between">
                      <span className="w-20 text-left">{entry.name}</span>
                      <span className="text-gray-400 w-12 text-right">
                        ({percentage}%)
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pie Chart */}
            <div className="flex-1 flex justify-center">
              <ResponsiveContainer height={200}>
                <PieChart>
                  <Pie
                    data={animatedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={40}
                    outerRadius={70}
                    paddingAngle={2}
                    isAnimationActive={false} // Turn off default Recharts animation
                  >
                    {animatedData.map((entry) => (
                      <Cell
                        key={entry.name}
                        fill={entry.color}
                        stroke="#1f2937"
                        strokeWidth={1}
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomTooltip />} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-gray-400 min-h-[200px]">
            No data available for this month
          </div>
        )}
      </div>
    </div>
  );
};

export default ExpenseCategoriesChart;
