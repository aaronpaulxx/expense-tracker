import { useState, useRef, useEffect } from "react";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./components/Header";
import BudgetPanel from "./components/BudgetPanel";
import DateSelector from "./components/DateSelector";
import ExpenseForm from "./components/ExpenseForm";
import Summary from "./components/Summary";
import ExpenseList from "./components/ExpenseList";
import WeeklySpendingChart from "./components/WeeklySpendingChart";
import ExpenseCategoriesChart from "./components/ExpenseCategoriesChart";
import YearlyOverviewChart from "./components/YearlyOverviewChart";
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

  const [isNewlyAdded, setIsNewlyAdded] = useState(false);

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
      setExpenses((prev) => {
        const updatedExpenses = {
          ...prev,
          [currentDateKey]: [
            { ...newExpense, amount },
            ...(prev[currentDateKey] || []),
          ],
        };
        setNewExpense({ name: "", amount: "", category: "Food" });
        setErrors({});
        setIsNewlyAdded(true);

        setTimeout(() => setIsNewlyAdded(false), 200);
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
    }, 300);
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
    const minimumLoadingTime = 1000; // 1 second
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
    <div className="h-screen w-screen bg-gray-950 flex flex-col overflow-auto">
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
              <h1 className="text-5xl font-bold titleh1">
                <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
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

      <div className="flex flex-1 h-[calc(100vh-8px)] overflow-auto p-2 flex-col sm:flex-row sm:h-auto">
        {/* Left Panel */}
        <div className="w-full sm:w-1/3 bg-gray-900 rounded-lg p-3 flex flex-col gap-2 sm:mr-2 mb-2 sm:mb-0">
          <BudgetPanel
            budgets={budgets}
            setBudgets={setBudgets}
            calculatePeriodExpenses={calculatePeriodExpenses}
            currentBudget={currentBudget}
            isFirstHalf={isFirstHalf}
            expenses={expenses}
            date={date}
          />

          <DateSelector
            date={date}
            setDate={setDate}
            dateInputRef={dateInputRef}
            onYearChange={setSelectedYear}
            handleDateClick={handleDateClick}
          />

          <ExpenseForm
            newExpense={newExpense}
            setNewExpense={setNewExpense}
            errors={errors}
            handleAddExpense={handleAddExpense}
          />

          <h2 className="text-lg font-semibold mb-2 text-white">
            Today&apos;s Expenses
          </h2>
          <ExpenseList
            date={date}
            expenses={expenses}
            currentDateKey={currentDateKey}
            isNewlyAdded={isNewlyAdded}
            deletingIndex={deletingIndex}
            handleDeleteExpense={handleDeleteExpense}
            onUpdateExpense={handleUpdateExpense}
          />
        </div>

        {/* Right Panel */}
        <div className="w-full sm:w-2/3 flex flex-col bg-gray-900 rounded-lg">
          <h2 className="text-lg font-semibold text-gray-100 p-2 pb-0">
            Financial Insights
          </h2>
          {/* 2x2 Grid Container */}
          <div className="grid grid-cols-1 md:grid-cols-2 h-full -mt-1.5">
            {/* Weekly Spending Card */}
            <div className="rounded p-3">
              <WeeklySpendingChart
                expenses={expenses}
                selectedMonth={selectedMonth}
                date={date}
              />
            </div>

            {/* Expense Categories Card */}
            <div className="rounded p-3">
              <ExpenseCategoriesChart
                categoryTotals={categoryTotals}
                selectedMonth={selectedMonth}
              />
            </div>

            {/* Summary Card */}
            <div className=" rounded p-3">
              <Summary
                categoryTotals={categoryTotalsForToday}
                totalForDay={totalForToday}
                date={date}
              />
            </div>

            {/* Yearly Overview Card */}
            <div className="rounded p-3">
              <YearlyOverviewChart
                expenses={expenses}
                selectedYear={selectedYear}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
