import { useState, useEffect, useRef } from "react";
import PropTypes from "prop-types";
import {
  Trash,
  PencilLine,
  MoreVertical,
  Copy,
  ClipboardX,
} from "lucide-react";
import { CATEGORIES } from "../constants/categories";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import Toast from "./Toast";
import DeleteConfirmationModal from "./DeleteConfirmationModal";

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ExpenseList = ({
  expenses,
  currentDateKey,
  newlyAddedId,
  deletingIndex,
  handleDeleteExpense,
  date,
  setExpenses,
  onQuickFill,
  onEditClick,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [showDeleteAllToast, setShowDeleteAllToast] = useState(null);

  // --- State for the floating action menu ---
  const [openActionMenuIndex, setOpenActionMenuIndex] = useState(null);
  const [activeExpense, setActiveExpense] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  // ---

  const truncateText = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const closeActionMenu = () => {
    setOpenActionMenuIndex(null);
    setMenuPosition(null);
    setActiveExpense(null);
  };

  const toggleActionMenu = (index, expense, event) => {
    event.stopPropagation();
    if (openActionMenuIndex === index) {
      closeActionMenu();
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setOpenActionMenuIndex(index);
      setActiveExpense(expense);
      // Position the menu based on the button's location
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY + 4, // Add 4px offset from the button
        right: window.innerWidth - buttonRect.right, // Align right edges
      });
    }
  };

  const handleEditClick = (expense, index) => {
    onEditClick(expense, index);
    closeActionMenu();
  };

  const handleQuickFillClick = (expense) => {
    if (onQuickFill) {
      onQuickFill(expense);
    }
    closeActionMenu();
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Close if the menu is open and the click is not on the menu itself
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeActionMenu();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleDeleteAllToday = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    const deletedCount = expensesWithIds.length;
    setExpenses((prev) => {
      const updatedExpenses = { ...prev };
      delete updatedExpenses[currentDateKey];
      return updatedExpenses;
    });
    setIsDeleteConfirmOpen(false);
    const toastDate = new Date(date); // Ensure date is a Date object
    setShowDeleteAllToast({ count: deletedCount, date: toastDate });
    setTimeout(() => setShowDeleteAllToast(false), 5000);
  };

  const handleCancelDeleteAll = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(expenses[currentDateKey]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setExpenses((prev) => ({
      ...prev,
      [currentDateKey]: items,
    }));
  };

  // Get current expenses and ensure they all have valid IDs
  const currentExpenses = expenses[currentDateKey] || [];
  const expensesWithIds = currentExpenses.map((expense, index) => ({
    ...expense,
    // Ensure each expense has a unique ID - fallback to index if ID is missing
    id: expense.id || `expense-${currentDateKey}-${index}`,
  }));

  return (
    <>
      <div className="ml-2 mr-2">
        {expensesWithIds.length >= 0 && (
          <div className="flex justify-between items-center mb-3">
            <label className="text-lg border-l-4 pl-2 border-stone-300 font-semibold text-stone-100">
              Today&apos;s Expenses
            </label>
            <button
              disabled={expensesWithIds.length === 0}
              onClick={handleDeleteAllToday}
              className={`delete-button-small ${expensesWithIds.length === 0 ? "disabled" : ""}`}
            >
              <svg viewBox="0 0 448 512" className="svgIcon">
                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
              </svg>
            </button>
          </div>
        )}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="expenses">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 space-y-3 overflow-y-auto min-h-[360px] max-h-[360px] sm:max-h-[360px] overflow-x-hidden custom-scrollbar rounded-xl border transition-colors duration-200 ${
                  snapshot.isDraggingOver
                    ? "border-stone-400 bg-stone-950"
                    : "border-stone-500 bg-stone-950"
                }`}
              >
                {expensesWithIds.map((expense, index) => {
                  const CategoryIcon = CATEGORIES[expense.category]?.icon;
                  const uniqueId = String(expense.id);

                  return (
                    <Draggable
                      key={uniqueId}
                      draggableId={uniqueId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-800/95 hover:from-stone-700 hover:to-stone-700/95 backdrop-blur-sm shadow-lg border border-stone-700/50 group cursor-grab overflow-hidden ${
                            deletingIndex === index
                              ? "animate-[slideOut_0.4s_cubic-bezier(0.68,-0.55,0.27,1.55)_forwards]"
                              : ""
                          } ${
                            newlyAddedId === expense.id
                              ? "animate-[fadeIn_0.5s_cubic-bezier(0.26,0.53,0.74,1.48)] scale-100 opacity-100"
                              : ""
                          } ${
                            snapshot.isDragging
                              ? "ring-2 ring-stone-300 shadow-2xl"
                              : ""
                          }`}
                        >
                          {/* Category color blob */}
                          <div
                            className={`absolute -left-3 top-0 w-16 h-16 rounded-full blur-lg opacity-70 transition-opacity duration-300 group-hover:opacity-100 -z-1 ${
                              expense.category === "Transport"
                                ? "bg-yellow-400"
                                : expense.category === "Shopping"
                                  ? "bg-blue-400"
                                  : expense.category === "Food"
                                    ? "bg-green-400"
                                    : expense.category === "Bills"
                                      ? "bg-purple-400"
                                      : expense.category === "Credit"
                                        ? "bg-red-400"
                                        : expense.category === "Other"
                                          ? "bg-gray-300"
                                          : "bg-gray-400"
                            }`}
                          />
                          <div
                            className="flex items-center gap-5 min-w-0 flex-1"
                            {...provided.dragHandleProps}
                          >
                            <div className="rounded-xl p-2 bg-stone-950/90  flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
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

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="inline-flex items-baseline gap-1 text-emerald-300 font-semibold text-md px-3 py-1.5 bg-emerald-900/30 rounded-full shadow-sm whitespace-nowrap border border-emerald-800/30">
                                <span className="text-xs opacity-80">₱</span>
                                <span>{formatNumber(expense.amount)}</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) =>
                                toggleActionMenu(index, expense, e)
                              }
                              className={`relative p-2 rounded-lg transition-all duration-200 ${
                                openActionMenuIndex === index
                                  ? "bg-stone-600 text-stone-100 scale-105"
                                  : "text-stone-400 hover:bg-stone-600 hover:text-stone-100 hover:scale-105"
                              }`}
                              aria-label="More options"
                            >
                              <MoreVertical
                                size={18}
                                className="cursor-pointer"
                              />
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {!expensesWithIds.length && (
                  <div className="text-center text-stone-500 py-20 flex flex-col items-center">
                    <div className="p-4 rounded-full bg-stone-800/50 mb-4">
                      <ClipboardX size={48} className="opacity-60" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No expenses yet
                    </h3>
                    <p className="text-sm opacity-80">
                      Start tracking your daily expenses
                    </p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* --- This is the single, floating Action Menu --- */}
      {openActionMenuIndex !== null && menuPosition && (
        <div
          ref={menuRef} // Keep menuRef here for outside click detection
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
          className="z-50 w-36 origin-top-right rounded-md bg-stone-800 shadow-lg ring-1 ring-stone-500 focus:outline-none animate-[fadeIn_0.1s_ease-out]"
        >
          <div className="py-1">
            <button
              onClick={() => handleQuickFillClick(activeExpense)}
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <Copy size={18} className="mr-2 text-blue-400" /> Quick Fill
            </button>
            <button
              onClick={() =>
                handleEditClick(activeExpense, openActionMenuIndex)
              }
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <PencilLine size={18} className="mr-2 text-yellow-400" /> Edit
            </button>
            <button
              onClick={() => {
                handleDeleteExpense(openActionMenuIndex);
                closeActionMenu();
              }}
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <Trash size={18} className="mr-2 text-red-400" /> Delete
            </button>
          </div>
        </div>
      )}

      {showDeleteAllToast && (
        <Toast
          message={
            <>
              <span className="font-semibold text-red-500 text-lg">
                {showDeleteAllToast.count}
              </span>{" "}
              expense{showDeleteAllToast.count !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-stone-200">
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "long",
                }).format(showDeleteAllToast.date)}
              </span>{" "}
              deleted successfully
            </>
          }
          onClose={() => setShowDeleteAllToast(false)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCancelDeleteAll}
        onConfirm={handleConfirmDeleteAll}
        date={date}
        expenseCount={expensesWithIds.length}
      />
    </>
  );
};

ExpenseList.propTypes = {
  expenses: PropTypes.object,
  currentDateKey: PropTypes.string.isRequired,
  newlyAddedId: PropTypes.string,
  deletingIndex: PropTypes.number,
  handleDeleteExpense: PropTypes.func.isRequired,
  date: PropTypes.instanceOf(Date).isRequired,
  setExpenses: PropTypes.func.isRequired,
  onQuickFill: PropTypes.func,
  onEditClick: PropTypes.func.isRequired,
};

export default ExpenseList;
