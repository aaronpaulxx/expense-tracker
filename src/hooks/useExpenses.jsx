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

  const currentDateKey = getDateKey(date);

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

  const handleAddExpense = () => {
    if (!validateForm()) return;

    const amount = parseFloat(newExpense.amount);
    const expenseId = Date.now().toString();

    setExpenses((prev) => ({
      ...prev,
      [currentDateKey]: [
        { ...newExpense, amount, id: expenseId },
        ...(prev[currentDateKey] || []),
      ],
    }));

    setNewExpense({ name: "", amount: "", category: "Food" });
    setErrors({});
    setNewlyAddedId(expenseId);
    setTimeout(() => setNewlyAddedId(null), 300);
  };

  const handleDeleteExpense = (index) => {
    setDeletingIndex(index);
    setTimeout(() => {
      setExpenses((prev) => ({
        ...prev,
        [currentDateKey]: prev[currentDateKey].filter((_, i) => i !== index),
      }));
      setDeletingIndex(null);
    }, 400);
  };

  const handleUpdateExpense = (index, updatedExpense) => {
    setExpenses((prev) => {
      const dayExpenses = [...(prev[currentDateKey] || [])];
      dayExpenses[index] = updatedExpense;
      return { ...prev, [currentDateKey]: dayExpenses };
    });
  };

  const clearRecords = () => {
    setExpenses({});
    localStorage.removeItem("expenses");
  };

  const handleQuickFill = (expenseData) => {
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
    handleAddExpense,
    handleDeleteExpense,
    handleUpdateExpense,
    clearRecords,
    handleQuickFill,
  };
};