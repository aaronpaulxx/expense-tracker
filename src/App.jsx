import { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./components/Header";
import BudgetPanel from "./components/BudgetPanel";
import DateSelector from "./components/DateSelector";
import ExpenseForm from "./components/ExpenseForm";

import ExpenseList from "./components/ExpenseList";
import FinancialInsights from "./components/FinancialInsights";

import { useLocalStorage } from "./hooks/useLocalStorage";
import { useExpenseCalculations } from "./hooks/useExpenseCalculations";

const App = () => {
  const [date, setDate] = useState(new Date());
  const [budgets, setBudgets] = useLocalStorage("budgets", {
    firstHalf: 7379.31,
    secondHalf: 8488.75,
  });
  const [expenses, setExpenses] = useLocalStorage("expenses", {});
  const [newExpense, setNewExpense] = useState({
    name: "",
    amount: "",
    category: "Food",
  });
  const [errors, setErrors] = useState({});
  const [deletingIndex, setDeletingIndex] = useState(null);
  const dateInputRef = useRef(null);

  const [selectedYear, setSelectedYear] = useState(date.getFullYear());

  const [loading, setLoading] = useState(true);

  // Option 1: Using toLocaleDateString
  const currentDateKey = date.toLocaleDateString("en-CA", {
    timeZone: "Asia/Manila",
  }); // Will output YYYY-MM-DD format
  const currentDay = date.getDate();
  const isFirstHalf = currentDay <= 15;
  const currentBudget = isFirstHalf ? budgets.firstHalf : budgets.secondHalf;

  const [newlyAddedId, setNewlyAddedId] = useState(null);

  const {
    calculatePeriodExpenses,
    categoryTotals,
    categoryTotalsForToday,
    totalForToday,
  } = useExpenseCalculations(expenses, date);

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
    if (validateForm()) {
      const amount = parseFloat(newExpense.amount);
      // Generate unique ID using current date and time
      const expenseId = Date.now().toString();

      setExpenses((prev) => {
        const updatedExpenses = {
          ...prev,
          [currentDateKey]: [
            {
              ...newExpense,
              amount,
              id: expenseId,
            },
            ...(prev[currentDateKey] || []),
          ],
        };

        setNewExpense({ name: "", amount: "", category: "Food" });
        setErrors({});

        // Set the newly added ID instead of a boolean
        setNewlyAddedId(expenseId);

        // Clear the newly added ID after animation completes
        setTimeout(() => setNewlyAddedId(null), 300);

        return updatedExpenses;
      });
    }
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
    const newExpenses = { ...expenses };
    newExpenses[currentDateKey][index] = updatedExpense;
    setExpenses(newExpenses);
  };

  const handleDateClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.setOpen(true);
    }
  };

  const clearRecords = () => {
    setExpenses([]);
    localStorage.removeItem("expenses");
  };

  const selectedMonth = date.toLocaleString("default", {
    month: "short",
    year: "numeric",
  });

  useEffect(() => {
    // Add a minimum loading time of 1 second for better UX
    const minimumLoadingTime = 500;
    const startTime = Date.now();

    // Check if data is ready
    const isDataReady = () => {
      return budgets && Object.keys(budgets).length > 0 && expenses !== null;
    };

    // Function to end loading after minimum time
    const endLoading = () => {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minimumLoadingTime - elapsedTime);

      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    };

    // If data is ready, start ending loading sequence
    if (isDataReady()) {
      endLoading();
    }
  }, [budgets, expenses]); // Dependencies

  return (
    <div className="max-w-full h-screen bg-stone-950 flex flex-col custom-scrollbar">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-[rgba(33,33,33,0.85)] z-50 transition-opacity duration-500 ease-in-out">
          {/* Centered content (Spinner + Title on the Right) */}
          <div className="flex items-center z-50">
            {/* Lucky Falcon Spinner */}
            <div className="spinner mr-4">
              <div className="spinner1"></div>
            </div>

            {/* Title and Author Information */}
            <div className="flex flex-col items-start text-left z-50">
              <h1 className="text-3xl font-bold titleh1">
                <span className="bg-gradient-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                  Expense Tracker
                </span>
              </h1>
            </div>
          </div>
        </div>
      )}

      <Header
        budgets={budgets}
        setBudgets={setBudgets}
        clearRecords={clearRecords}
        expenses={expenses}
      />

      {/* Date Selector - Fixed at the top after header */}
      <div className="sticky top-0 z-1 bg-stone-950 border-b border-stone-600">
        <DateSelector
          date={date}
          setDate={setDate}
          dateInputRef={dateInputRef}
          onYearChange={setSelectedYear}
          handleDateClick={handleDateClick}
        />
      </div>

      <div className="flex flex-1 overflow-auto flex-col">
        {/* Budget Panel */}
        <div className="w-full p-2 flex flex-col gap-2 mb-2">
          <BudgetPanel
            budgets={budgets}
            setBudgets={setBudgets}
            calculatePeriodExpenses={calculatePeriodExpenses}
            currentBudget={currentBudget}
            isFirstHalf={isFirstHalf}
            expenses={expenses}
            date={date}
          />
        </div>

        {/* Expense Entry Section */}
        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full pl-2">
            <label className="text-md border-l-4 pl-2 border-stone-300 font-bold text-stone-100 block w-full">
              Expense Details
            </label>
          </div>

          <ExpenseForm
            newExpense={newExpense}
            setNewExpense={setNewExpense}
            errors={errors}
            handleAddExpense={handleAddExpense}
          />
        </div>

        {/* Today's Expenses Section */}
        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full pl-2 mb-1">
            <label className="text-md border-l-4 pl-2 border-stone-300 font-bold text-stone-100 block w-full">
              Today&apos;s Expenses
            </label>
          </div>
          <ExpenseList
            date={date}
            expenses={expenses}
            currentDateKey={currentDateKey}
            newlyAddedId={newlyAddedId}
            deletingIndex={deletingIndex}
            handleDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
          />
        </div>

        {/* Financial Insights Section */}
        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full pl-2 mt-3">
            <label className="text-md border-l-4 pl-2 border-stone-300 font-bold text-stone-100 block w-full">
              Financial Insights
            </label>
          </div>
          {/* Financial Insights Section */}
          <FinancialInsights
            expenses={expenses}
            selectedMonth={selectedMonth}
            selectedYear={selectedYear}
            categoryTotals={categoryTotals}
            categoryTotalsForToday={categoryTotalsForToday}
            totalForToday={totalForToday}
            date={date}
          />
          <div className="w-full flex justify-center mt-3">
            <span className="text-xs text-stone-400 mb-4">
              Created by{" "}
              <span className="font-medium text-stone-300">APZR</span> ©{" "}
              {new Date().getFullYear()}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
