import { useState, useMemo, memo } from "react";
import PropTypes from "prop-types";
import { ClipboardX } from "lucide-react";
import { List } from "react-window";
import {
  DndContext,
  DragOverlay,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import DeleteConfirmationModal from "./DeleteConfirmationModal";
import ExpenseRow from "./ExpenseRow";
import ExpenseRowOverlay from "./ExpenseRowOverlay";
import { notifySuccess, pluralize } from "../lib/toast";
import ToastCount from "./ToastCount";

// Height (px) reserved per row slot, including the gap below it.
const ROW_HEIGHT = 68;
const ROW_GAP = 12;

const VirtualizedRow = memo(function VirtualizedRow({
  index,
  style,
  expensesWithIds,
  deletingIndex,
  newlyAddedId,
  onQuickFill,
  onEditClick,
  handleDeleteExpense,
}) {
  const expense = expensesWithIds[index];
  return (
    <div style={{ ...style, boxSizing: "border-box", paddingBottom: ROW_GAP }}>
      <ExpenseRow
        expense={expense}
        index={index}
        deletingIndex={deletingIndex}
        newlyAddedId={newlyAddedId}
        onQuickFill={onQuickFill}
        onEditClick={onEditClick}
        handleDeleteExpense={handleDeleteExpense}
      />
    </div>
  );
});

VirtualizedRow.propTypes = {
  index: PropTypes.number.isRequired,
  style: PropTypes.object.isRequired,
  expensesWithIds: PropTypes.array.isRequired,
  deletingIndex: PropTypes.number,
  newlyAddedId: PropTypes.string,
  onQuickFill: PropTypes.func,
  onEditClick: PropTypes.func.isRequired,
  handleDeleteExpense: PropTypes.func.isRequired,
};

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
  const [activeId, setActiveId] = useState(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    }),
  );

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
    notifySuccess(
      <span className="leading-snug">
        Deleted <ToastCount>{deletedCount}</ToastCount>{" "}
        {pluralize(deletedCount, "expense")} for{" "}
        {new Intl.DateTimeFormat("en-US", {
          day: "numeric",
          month: "long",
        }).format(toastDate)}
        .
      </span>,
      { id: "delete-all" },
    );
  };

  const handleCancelDeleteAll = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDragStart = (event) => {
    setActiveId(event.active.id);
  };

  const handleDragEnd = (result) => {
    setActiveId(null);
    const { active, over } = result;
    if (!over || active.id === over.id) {
      return;
    }

    const items = Array.from(expenses[currentDateKey]);
    const oldIndex = items.findIndex(
      (expense, index) =>
        String(expense.id || `expense-${currentDateKey}-${index}`) ===
        active.id,
    );
    const newIndex = items.findIndex(
      (expense, index) =>
        String(expense.id || `expense-${currentDateKey}-${index}`) === over.id,
    );
    if (oldIndex === -1 || newIndex === -1) {
      return;
    }

    setExpenses((prev) => ({
      ...prev,
      [currentDateKey]: arrayMove(items, oldIndex, newIndex),
    }));
  };

  const handleDragCancel = () => {
    setActiveId(null);
  };

  // Get current expenses and ensure they all have valid IDs
  const currentExpenses = expenses[currentDateKey];
  const expensesWithIds = useMemo(
    () =>
      (currentExpenses || []).map((expense, index) => ({
        ...expense,
        // Ensure each expense has a unique ID - fallback to index if ID is missing
        id: expense.id || `expense-${currentDateKey}-${index}`,
      })),
    [currentExpenses, currentDateKey],
  );
  const sortableIds = useMemo(
    () => expensesWithIds.map((expense) => String(expense.id)),
    [expensesWithIds],
  );
  const activeExpense = expensesWithIds.find(
    (expense) => String(expense.id) === activeId,
  );

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

        <div className="p-2 h-90 sm:h-90 rounded-xl border border-stone-500 bg-stone-950 transition-colors duration-200">
          {expensesWithIds.length ? (
            <DndContext
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragStart={handleDragStart}
              onDragEnd={handleDragEnd}
              onDragCancel={handleDragCancel}
            >
              <SortableContext
                items={sortableIds}
                strategy={verticalListSortingStrategy}
              >
                <List
                  rowComponent={VirtualizedRow}
                  rowCount={expensesWithIds.length}
                  rowHeight={ROW_HEIGHT}
                  rowProps={{
                    expensesWithIds,
                    deletingIndex,
                    newlyAddedId,
                    onQuickFill,
                    onEditClick,
                    handleDeleteExpense,
                  }}
                  style={{ height: "100%" }}
                  className="custom-scrollbar overflow-x-hidden"
                />
              </SortableContext>

              <DragOverlay>
                {activeExpense ? (
                  <ExpenseRowOverlay expense={activeExpense} />
                ) : null}
              </DragOverlay>
            </DndContext>
          ) : (
            <div className="text-center text-stone-500 py-20 flex flex-col items-center">
              <div className="p-4 rounded-full bg-stone-800/50 mb-4">
                <ClipboardX size={48} className="opacity-60" />
              </div>
              <h3 className="text-lg font-medium mb-2">No expenses yet</h3>
              <p className="text-sm opacity-80">
                Start tracking your daily expenses
              </p>
            </div>
          )}
        </div>
      </div>

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
