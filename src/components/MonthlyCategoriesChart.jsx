import { useState, useMemo } from "react";
import PropTypes from "prop-types";
// --- MODIFIED: Import Sector for the active shape ---
import { PieChart, Pie, Cell, ResponsiveContainer, Sector } from "recharts";

import { ClipboardX } from "lucide-react";
import { CATEGORY_COLORS } from "../constants/categories.jsx";

const COLORS = CATEGORY_COLORS;

const BASE_OUTER_RADIUS = 85;

const formatCategoryData = (categoryTotals) => {
  return Object.keys(COLORS).map((category) => ({
    name: category,
    value: categoryTotals?.[category]
      ? Number(categoryTotals[category].toFixed(2))
      : 0,
    color: COLORS[category],
  }));
};

// --- NEW: Custom component to render the enlarged, active slice ---
const renderActiveShape = (props) => {
  const { cx, cy, innerRadius, outerRadius, startAngle, endAngle, fill } =
    props;

  return (
    <g>
      <Sector
        cx={cx}
        cy={cy}
        innerRadius={innerRadius}
        outerRadius={outerRadius + 5} // Pop out the slice
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

const ExpenseCategoriesChart = ({ categoryTotals, selectedMonth }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const formattedData = useMemo(
    () => formatCategoryData(categoryTotals),
    [categoryTotals],
  );

  const totalAmount = useMemo(
    () => formattedData.reduce((sum, item) => sum + item.value, 0),
    [formattedData],
  );

  // --- NEW: Calculate the index of the active slice ---
  const activeIndex = useMemo(
    () => formattedData.findIndex((entry) => entry.name === hoveredCategory),
    [formattedData, hoveredCategory],
  );

  let displayAmount = totalAmount;
  let displayLabel = "Total";
  let displayColor = "#ffffff";

  if (hoveredCategory) {
    const hoveredData = formattedData.find(
      (item) => item.name === hoveredCategory,
    );
    if (hoveredData) {
      displayAmount = hoveredData.value;
      displayLabel = hoveredData.name;
      displayColor = hoveredData.color;
    }
  }

  const integerDigits = Math.floor(displayAmount).toString().length;
  const dynamicFontSize = integerDigits > 6 ? 15 : integerDigits > 4 ? 17 : 20;

  return (
    <div className="rounded-xl p-2 flex flex-col border border-border">
      <h3 className="text-sm font-medium text-muted-foreground mb-5 pb-2 border-b border-border flex justify-between items-center">
        <span>Monthly Category Breakdown</span>
        {selectedMonth && (
          <span className="text-muted-foreground">
            {new Date(selectedMonth).toLocaleString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </span>
        )}
      </h3>

      <div className="flex-1 flex items-center justify-center">
        {totalAmount > 0 ? (
          // --- MODIFIED: Add onMouseLeave to the shared container ---
          <div
            className="flex w-full items-center justify-center gap-5"
            onMouseLeave={() => setHoveredCategory(null)}
          >
            {/* Custom Legend with Hover Effect */}
            <div className="w-45">
              {formattedData.map((entry) => {
                const percentage =
                  totalAmount > 0
                    ? ((entry.value / totalAmount) * 100).toFixed(1)
                    : "0.0";

                const isDimmed =
                  hoveredCategory && hoveredCategory !== entry.name;

                return (
                  <div
                    key={entry.name}
                    className="flex items-center text-muted-foreground text-sm mb-3 pl-5 transition-opacity duration-200"
                    style={{ opacity: isDimmed ? 0.5 : 1 }}
                    onMouseEnter={() => setHoveredCategory(entry.name)}
                  >
                    <div
                      className="w-3 h-3 rounded-[1.8px] mr-2"
                      style={{ backgroundColor: entry.color }}
                    ></div>
                    <div className="flex w-full justify-between">
                      <span className="w-20 text-left">{entry.name}</span>
                      <span className="text-muted-foreground w-12 text-right">
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
                    data={formattedData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={BASE_OUTER_RADIUS} // --- MODIFIED: Use static base radius
                    paddingAngle={0}
                    isAnimationActive={true}
                    // --- NEW: Props for handling active slice ---
                    activeIndex={activeIndex}
                    activeShape={renderActiveShape}
                    onMouseEnter={(_, index) => {
                      setHoveredCategory(formattedData[index].name);
                    }}
                  >
                    {formattedData.map((entry) => {
                      const isDimmed =
                        hoveredCategory && hoveredCategory !== entry.name;
                      return (
                        <Cell
                          key={`cell-${entry.name}`}
                          fill={entry.color}
                          fillOpacity={isDimmed ? 0.4 : 1}
                          stroke="var(--chart-outline)"
                          strokeWidth={0.2}
                        />
                      );
                    })}
                  </Pie>

                  <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                  >
                    <tspan
                      fontSize={dynamicFontSize}
                      fontWeight="bold"
                      fill={displayColor}
                    >
                      ₱
                      {displayAmount.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </tspan>
                    <tspan x="50%" y="60%" fontSize="15" fill={CATEGORY_COLORS.Other}>
                      {displayLabel}
                    </tspan>
                  </text>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          <div className="text-muted-foreground min-h-50 py-8 flex flex-col items-center">
            <ClipboardX size={40} className="opacity-70 mb-5" />
            <span className="text-sm">No data available for this month.</span>
          </div>
        )}
      </div>
    </div>
  );
};

ExpenseCategoriesChart.propTypes = {
  categoryTotals: PropTypes.objectOf(PropTypes.number),
  selectedMonth: PropTypes.string,
};

export default ExpenseCategoriesChart;