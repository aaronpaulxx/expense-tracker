import { memo } from "react";
import PropTypes from "prop-types";
import { Trash, PencilLine, MoreVertical, Copy } from "lucide-react";
import { Menu, MenuButton, MenuItems, MenuItem } from "@headlessui/react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
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

const ExpenseRow = ({
  expense,
  index,
  deletingIndex,
  newlyAddedId,
  onQuickFill,
  onEditClick,
  handleDeleteExpense,
}) => {
  const uniqueId = String(expense.id);
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: uniqueId });

  const CategoryIcon = CATEGORIES[expense.category]?.icon;
  const hoverGradient =
    CATEGORIES[expense.category]?.hoverGradient ||
    "hover:from-stone-700 hover:to-stone-700/45";
  const hoverBorder =
    CATEGORIES[expense.category]?.hoverBorder || "hover:border-stone-600";
  const menuHoverBg =
    CATEGORIES[expense.category]?.hoverBg ||
    "hover:bg-stone-600 data-active:bg-stone-600";

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`relative flex items-center justify-between p-2 rounded-xl bg-linear-to-r from-stone-800 to-stone-800/45 ${hoverGradient} shadow-lg border border-stone-700/50 ${hoverBorder} group cursor-grab overflow-hidden ${
        deletingIndex === index
          ? "animate-[slideOut_0.4s_cubic-bezier(0.68,-0.55,0.27,1.55)_forwards]"
          : ""
      } ${
        newlyAddedId === expense.id
          ? "animate-[fadeIn_0.5s_cubic-bezier(0.26,0.53,0.74,1.48)] scale-100 opacity-100"
          : ""
      } ${isDragging ? "opacity-40" : ""}`}
    >
      <div
        className="flex items-center gap-5 min-w-0 flex-1"
        {...attributes}
        {...listeners}
      >
        <div className="rounded-xl p-2 bg-stone-950/90 shrink-0 group-hover:scale-110 transition-transform duration-200">
          {CategoryIcon && (
            <CategoryIcon
              size={24}
              className={`${CATEGORIES[expense.category]?.color || "text-gray-400"} transition-colors duration-200`}
            />
          )}
        </div>
        <div className="flex flex-col min-w-0 flex-1">
          <span
            className="font-medium text-white text-sm truncate group-hover:text-stone-100 transition-colors duration-200"
            title={expense.name}
          >
            {truncateText(expense.name)}
          </span>
          <span className="text-xs text-stone-400 capitalize">
            {expense.category}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-3 shrink-0">
        <div className="text-right">
          <div className="inline-flex items-baseline gap-1 text-emerald-200 font-semibold text-md px-3 py-1.5 bg-emerald-900 rounded-full shadow-sm whitespace-nowrap border border-emerald-800/30">
            <span className="text-md opacity-80">₱</span>
            <span>{formatNumber(expense.amount)}</span>
          </div>
        </div>

        <Menu as="div" className="relative">
          <MenuButton
            className={`relative p-2 rounded-lg text-stone-400 ${menuHoverBg} hover:text-stone-100 hover:scale-105 data-active:text-stone-100 data-active:scale-105 transition-all duration-200`}
            aria-label="More options"
          >
            <MoreVertical size={18} className="cursor-pointer" />
          </MenuButton>
          <MenuItems
            anchor="bottom end"
            transition
            className="z-50 w-36 origin-top-right rounded-md bg-stone-800 shadow-lg ring-1 ring-stone-600 focus:outline-none py-1 [--anchor-gap:4px] transition duration-100 ease-out data-closed:opacity-0 data-closed:scale-95"
          >
            <MenuItem>
              <button
                onClick={() => onQuickFill && onQuickFill(expense)}
                className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 data-focus:bg-stone-700 data-focus:text-white"
              >
                <Copy size={18} className="mr-2 text-blue-400" /> Quick Fill
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => onEditClick(expense, index)}
                className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 data-focus:bg-stone-700 data-focus:text-white"
              >
                <PencilLine size={18} className="mr-2 text-yellow-400" /> Edit
              </button>
            </MenuItem>
            <MenuItem>
              <button
                onClick={() => handleDeleteExpense(index)}
                className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 data-focus:bg-stone-700 data-focus:text-white"
              >
                <Trash size={18} className="mr-2 text-red-400" /> Delete
              </button>
            </MenuItem>
          </MenuItems>
        </Menu>
      </div>
    </div>
  );
};

ExpenseRow.propTypes = {
  expense: PropTypes.object.isRequired,
  index: PropTypes.number.isRequired,
  deletingIndex: PropTypes.number,
  newlyAddedId: PropTypes.string,
  onQuickFill: PropTypes.func,
  onEditClick: PropTypes.func.isRequired,
  handleDeleteExpense: PropTypes.func.isRequired,
};

export default memo(ExpenseRow);
