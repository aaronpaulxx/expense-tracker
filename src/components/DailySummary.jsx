import PropTypes from "prop-types";
import { Wallet } from "lucide-react";
import { CATEGORIES } from "../constants/categories";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const DailySummary = ({ categoryTotals, totalForDay, date }) => {
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
  }).format(date);

  return (
    <div className="mt-auto p-2 rounded-xl border-border border text-sm h-auto shadow-md shadow-stone-950">
      <h3 className="text-sm font-medium text-accent mb-2 pb-2 border-b border-border flex justify-between items-center">
        <span>Daily Summary</span>
        <span className="text-muted-foreground font-style">{dayName}</span>
      </h3>

      <div className="space-y-2">
        {Object.entries(CATEGORIES).map(([category, { icon: Icon, color }]) => (
          <div
            key={category}
            className="flex justify-between items-center transform transition-transform duration-200"
          >
            <div className="flex items-center gap-2">
              <Icon size={20} className={color} />
              <span className="text-muted-foreground">{category}</span>
            </div>
            <span className="text-muted-foreground text-[15px]">
              ₱{formatNumber(categoryTotals?.[category] || 0)}
            </span>
          </div>
        ))}
        <div className="pt-1.5 border-t border-border flex justify-between font-semibold">
          <span className="text-muted-foreground flex items-center gap-1 text-[20px]">
            <Wallet size={20} className="text-[#cfc80e]" />
            Total
          </span>
          <span className="text-accent text-[20px]">
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