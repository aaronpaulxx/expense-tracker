import PropTypes from "prop-types";
import { CATEGORIES } from "../constants/categories";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const truncateText = (text, maxLength = 20) => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
};

// Rendered by DragOverlay only - a plain visual clone that follows the
// cursor. Not sortable itself, so it skips useSortable and the options
// menu (nothing in it can be clicked while a drag is active anyway).
const ExpenseRowOverlay = ({ expense }) => {
  const CategoryIcon = CATEGORIES[expense.category]?.icon;

  return (
    <div className="relative flex items-center justify-between p-2 rounded-xl bg-linear-to-r from-stone-800 to-stone-800/95 shadow-2xl ring-2 ring-emerald-300 cursor-grabbing overflow-hidden">
      <div className="flex items-center gap-5 min-w-0 flex-1">
        <div className="rounded-xl p-2 bg-stone-950/90 shrink-0">
          {CategoryIcon && (
            <CategoryIcon
              size={24}
              className={CATEGORIES[expense.category]?.color || "text-gray-400"}
            />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span className="font-medium text-white text-sm truncate">
            {truncateText(expense.name)}
          </span>
          <span className="text-xs text-stone-400 capitalize">
            {expense.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="inline-flex items-baseline gap-1 text-emerald-300 font-semibold text-md px-3 py-1.5 bg-emerald-900/30 rounded-full shadow-sm whitespace-nowrap border border-emerald-800/30">
          <span className="text-md opacity-80">₱</span>
          <span>{formatNumber(expense.amount)}</span>
        </div>
      </div>
    </div>
  );
};

ExpenseRowOverlay.propTypes = {
  expense: PropTypes.object.isRequired,
};

export default ExpenseRowOverlay;
