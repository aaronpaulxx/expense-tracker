import { useState } from "react";
import Summary from "./Summary"; // Corrected path
import WeeklySpendingChart from "./WeeklySpendingChart";
import ExpenseCategoriesChart from "./ExpenseCategoriesChart";
import YearlyOverviewChart from "./YearlyOverviewChart";

const FinancialInsights = ({
  categoryTotals,
  categoryTotalsForToday,
  totalForToday,
  expenses,
  selectedMonth,
  selectedYear,
  date,
}) => {
  const [activeTab, setActiveTab] = useState("daily");

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Navigation Tabs */}
      <div className="flex w-full">
        {[
          { label: "Daily", key: "daily" },
          { label: "Weekly", key: "weekly" },
          { label: "Monthly", key: "monthly" },
          { label: "Yearly", key: "yearly" },
        ].map(({ label, key }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex-1 px-4 py-2 text-sm font-medium transition-all ${
              activeTab === key
                ? "text-green-300 border-b-2 border-green-300"
                : "text-stone-400 border-b border-stone-700 hover:text-stone-200"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <div className="w-full p-2">
        {activeTab === "daily" && (
          <Summary
            categoryTotals={categoryTotalsForToday}
            totalForDay={totalForToday}
            date={date}
          />
        )}
        {activeTab === "weekly" && (
          <WeeklySpendingChart
            expenses={expenses}
            selectedMonth={selectedMonth}
            date={date}
          />
        )}
        {activeTab === "monthly" && (
          <ExpenseCategoriesChart
            categoryTotals={categoryTotals}
            selectedMonth={selectedMonth}
          />
        )}
        {activeTab === "yearly" && (
          <YearlyOverviewChart
            expenses={expenses}
            selectedYear={selectedYear}
          />
        )}
      </div>
    </div>
  );
};

export default FinancialInsights;
