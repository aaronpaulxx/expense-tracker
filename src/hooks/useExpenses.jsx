import { useState } from "react";
import { useLocalStorage } from "./useLocalStorage";

const getDateKey = (date) =>
  new Date(date.toLocaleString("en-US", { timeZone: "Asia/Manila" }))
    .toISOString()
    .split("T")[0];

/**
 * Owns all expense data + CRUD logic: the persisted expenses object,
 * the in-progress "new expense" form state, validation, and the
 * add/update/delete/clear/quick-fill handlers.
 *
 * Extracted out of App.jsx so App stays focused on layout/composition
 * and this logic can be reasoned about (and tested) on its own.
 */
export const useExpenses = (date) => {
  const [expenses, setExpenses] = useLocalStorage("expenses", {});
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "Food",
  });
  const [errors, setErrors] = useState({});
  const [deletingIndex, setDeletingIndex] = useState(null);
  const [newlyAddedId, setNewlyAddedId] = useState(null);
  // null = form is in "add" mode; a number = editing that index of
  // currentDateKey's list, and newExpense holds the in-progress edits.
  const [editingIndex, setEditingIndex] = useState(null);

  const currentDateKey = getDateKey(date);
  const isEditing = editingIndex !== null;

  const validateForm = () => {
    const newErrors = {};
    if (!newExpense.name.trim()) {
      newErrors.name = "Description is required";
    }
    if (!newExpense.amount || parseFloat(newExpense.amount) <= 0) {
      newErrors.amount = "Amount must be greater than 0";
    } else {
      const amount = parseFloat(newExpense.amount);
      if (isNaN(amount)) {
        newErrors.amount = "Amount must be a valid number";
      } else if (amount > 1000000) {
        newErrors.amount = "Amount cannot exceed 1,000,000";
      } else if (!Number.isInteger(amount * 100)) {
        newErrors.amount = "Amount cannot have more than 2 decimal places";
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const resetForm = () => {
    setNewExpense({ name: "", amount: "", category: "Food" });
    setErrors({});
    setEditingIndex(null);
  };

  const handleUpdateExpense = (index, updatedExpense) => {
    setExpenses((prev) => {
      // Copy the inner day-array too, not just the outer object — a
      // shallow `{ ...prev }` still shares the same array reference for
      // any key that wasn't reassigned.
      const dayExpenses = [...(prev[currentDateKey] || [])];
      dayExpenses[index] = updatedExpense;
      return { ...prev, [currentDateKey]: dayExpenses };
    });
  };

  // Single submit handler for the form, used for both adding a new
  // expense and saving an edit — which one happens depends on whether
  // editingIndex is set.
  const handleSubmitExpense = () => {
    if (!validateForm()) return;

    const amount = parseFloat(newExpense.amount);

    if (isEditing) {
      handleUpdateExpense(editingIndex, { ...newExpense, amount });
      resetForm();
      return;
    }

    const expenseId = Date.now().toString();

    // Side effects (resetting the form, clearing errors, the newly-added
    // animation flag) happen here, outside the setExpenses updater —
    // React can invoke updater functions more than once (e.g. Strict Mode
    // in dev), which would previously have double-fired these.
    setExpenses((prev) => ({
      ...prev,
      [currentDateKey]: [
        { ...newExpense, amount, id: expenseId },
        ...(prev[currentDateKey] || []),
      ],
    }));

    resetForm();
    setNewlyAddedId(expenseId);
    setTimeout(() => setNewlyAddedId(null), 300);
  };

  const handleStartEdit = (expense, index) => {
    setEditingIndex(index);
    setNewExpense({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
    });
    setErrors({});
  };

  const handleCancelEdit = () => {
    resetForm();
  };

  const handleDeleteExpense = (index) => {
    // If the expense being deleted is the one currently being edited
    // (or is above it in the list, shifting its index), bail out of
    // edit mode so the form doesn't end up pointing at the wrong row.
    if (isEditing && index <= editingIndex) {
      resetForm();
    }
    setDeletingIndex(index);
    setTimeout(() => {
      setExpenses((prev) => ({
        ...prev,
        [currentDateKey]: prev[currentDateKey].filter((_, i) => i !== index),
      }));
      setDeletingIndex(null);
    }, 400);
  };

  const clearRecords = () => {
    // Was `setExpenses([])` — an array — even though expenses is an
    // object everywhere else in the app (expenses[currentDateKey],
    // Object.keys(expenses), etc.). Fixed to match the real shape.
    setExpenses({});
    localStorage.removeItem("expenses");
    resetForm();
  };

  const handleQuickFill = (expenseData) => {
    // Quick Fill always starts a fresh add, even if an edit was in
    // progress — otherwise submitting would overwrite whatever
    // expense was being edited with the quick-filled data instead.
    setEditingIndex(null);
    setErrors({});
    setNewExpense({
      name: expenseData.name,
      amount: expenseData.amount,
      category: expenseData.category,
    });
  };

  return {
    expenses,
    setExpenses,
    newExpense,
    setNewExpense,
    errors,
    deletingIndex,
    newlyAddedId,
    currentDateKey,
    isEditing,
    editingIndex,
    handleSubmitExpense,
    handleStartEdit,
    handleCancelEdit,
    handleDeleteExpense,
    handleUpdateExpense,
    clearRecords,
    handleQuickFill,
  };
};
