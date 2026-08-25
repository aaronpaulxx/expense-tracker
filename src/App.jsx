import { useState, useRef, useEffect, useCallback } from "react";
import toast, { Toaster, ToastBar } from "react-hot-toast";
import "react-datepicker/dist/react-datepicker.css";
import Header from "./components/Header";
import DateSelector from "./components/DateSelector";
import ExpenseForm from "./components/ExpenseForm";

import ExpenseList from "./components/ExpenseList";
import FinancialInsights from "./components/FinancialInsights";

import { useExpenses } from "./hooks/useExpenses";
import { useExpenseCalculations } from "./hooks/useExpenseCalculations";
import Footer from "./components/Footer";

const App = () => {
  const [date, setDate] = useState(new Date());
  const {
    expenses,
    setExpenses,
    newExpense,
    setNewExpense,
    errors,
    deletingIndex,
    newlyAddedId,
    currentDateKey,
    isEditing,
    handleSubmitExpense,
    handleStartEdit,
    handleCancelEdit,
    handleDeleteExpense,
    clearRecords,
    handleQuickFill,
  } = useExpenses(date);
  const dateInputRef = useRef(null);
  const formSectionRef = useRef(null);

  const [selectedYear, setSelectedYear] = useState(date.getFullYear());

  const [loading, setLoading] = useState(true);

  const { categoryTotals, categoryTotalsForToday, totalForToday } =
    useExpenseCalculations(expenses, date);

  const handleDateClick = () => {
    if (dateInputRef.current) {
      dateInputRef.current.setOpen(true);
    }
  };

  const handleEditClick = useCallback(
    (expense, index) => {
      handleStartEdit(expense, index);
      formSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    },
    [handleStartEdit],
  );

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
      return expenses !== null;
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
  }, [expenses]); // Dependencies

  return (
    <div className="max-w-full h-screen bg-background flex flex-col custom-scrollbar">
      <Toaster position="bottom-right" gutter={8}>
        {(t) => (
          <ToastBar toast={t} position="bottom-right">
            {({ icon, message }) => (
              <div
                className="flex items-center gap-1 w-full"
                onClick={() => t.type !== "loading" && toast.dismiss(t.id)}
              >
                {icon}
                <div className="flex-1">{message}</div>
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>

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
                <span className="bg-linear-to-r from-green-500 to-teal-500 bg-clip-text text-transparent">
                  Expense Tracker
                </span>
              </h1>
            </div>
          </div>
        </div>
      )}

      <Header
        clearRecords={clearRecords}
        expenses={expenses}
        setExpenses={setExpenses}
      />

      <div className="flex flex-1 overflow-auto flex-col">
        {/* Date Selector - Sticky within the scroll area */}
        <div className="sticky top-0 z-1 backdrop-blur-xs border-b border-border">
          <DateSelector
            date={date}
            setDate={setDate}
            dateInputRef={dateInputRef}
            onYearChange={setSelectedYear}
            handleDateClick={handleDateClick}
          />
        </div>

        {/* Expense Entry Section */}
        <div className="w-full p-2 flex flex-col gap-2" ref={formSectionRef}>
          <div className="w-full pl-2">
            <label className="text-lg border-l-4 pl-2 border-border font-bold text-foreground block w-full mt-5">
              {isEditing ? "Edit Expense" : "Expense Details"}
            </label>
          </div>

          <ExpenseForm
            newExpense={newExpense}
            setNewExpense={setNewExpense}
            errors={errors}
            onSubmit={handleSubmitExpense}
            isEditing={isEditing}
            onCancelEdit={handleCancelEdit}
          />
        </div>

        {/* Today's Expenses Section */}
        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full pl-2"></div>
          <ExpenseList
            date={date}
            expenses={expenses}
            currentDateKey={currentDateKey}
            newlyAddedId={newlyAddedId}
            deletingIndex={deletingIndex}
            handleDeleteExpense={handleDeleteExpense}
            setExpenses={setExpenses}
            onQuickFill={handleQuickFill}
            onEditClick={handleEditClick}
          />
        </div>

        {/* Financial Insights Section */}
        <div className="w-full p-2 flex flex-col gap-2">
          <div className="w-full pl-2 mt-3">
            <label className="text-lg border-l-4 pl-2 border-border font-bold text-foreground block w-full">
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
            <Footer />
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;