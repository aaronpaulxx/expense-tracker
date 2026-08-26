import { useState } from "react";
import PropTypes from "prop-types";
import { CATEGORIES } from "../constants/categories";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const DailySummary = ({ categoryTotals, totalForDay, date }) => {
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);

  return (
    <div className="min-h-70 bg-linear-to-r from-expense-gradient to-expense-gradient2/90 mt-auto p-3 rounded-xl text-sm h-auto shadow-sm shadow-stone-950">
      <h3 className="text-base font-semibold text-foreground mb-2 pb-2 border-b border-border flex justify-between items-center">
        <span>Daily Summary</span>
        <span className="text-accent font-style">{dayName}</span>
      </h3>

      <div className="space-y-2" onMouseLeave={() => setHoveredCategory(null)}>
        {Object.entries(CATEGORIES).map(([category, { icon: Icon, color }]) => {
          const isHovered = hoveredCategory === category;
          const isDimmed = hoveredCategory && !isHovered;

          return (
            <div
              key={category}
              className="flex justify-between items-center transform transition-all duration-200 mb-2"
              style={{ opacity: isDimmed ? 0.4 : 1 }}
              onMouseEnter={() => setHoveredCategory(category)}
            >
              <div className="flex items-center gap-2">
                <Icon size={20} className={color} />
                <span
                  className={`text-sm transition-colors duration-200 ${
                    isHovered ? color : "text-foreground"
                  }`}
                >
                  {category}
                </span>
              </div>
              <span
                className={`text-sm transition-colors duration-200 ${
                  isHovered ? "text-accent" : "text-foreground"
                }`}
              >
                ₱{formatNumber(categoryTotals?.[category] || 0)}
              </span>
            </div>
          );
        })}
        <div className="pt-3 border-t border-border flex justify-between font-semibold">
          <span className="text-foreground flex items-center gap-1 text-2xl">
            Total
          </span>
          <span className="text-accent text-2xl">
            ₱{formatNumber(totalForDay)}
          </span>
        </div>
      </div>
    </div>
  );
};

DailySummary.propTypes = {
  categoryTotals: PropTypes.objectOf(PropTypes.number),
  totalForDay: PropTypes.number.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
};

export default DailySummary;
