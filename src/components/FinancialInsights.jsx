import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, BarChart3, PieChart, AreaChart } from "lucide-react";
import Summary from "./Summary";
import WeeklySpendingChart from "./WeeklySpendingChart";
import ExpenseCategoriesChart from "./ExpenseCategoriesChart";
import YearlyOverviewChart from "./YearlyOverviewChart";

const TabButton = ({ label, isActive, Icon, onClick }) => (
  <button
    onClick={onClick}
    className={`relative flex-1 px-4 py-3 text-xs font-medium flex items-center justify-center gap-2 transition-transform duration-300 ${
      isActive ? "text-green-300 scale-105" : "text-stone-300 hover:text-stone-100 hover:scale-105 group"
    }`}
  >
    <Icon
      size={18}
      className={`transition-transform duration-300 ${
        isActive ? "text-green-300 scale-105" : "text-stone-300 group-hover:text-stone-100 group-hover:scale-105"
      }`}
    />
    {label}
    {isActive && (
      <motion.div
      layoutId="tab-underline"
      className="absolute bottom-0 left-0 h-[2px] bg-green-300 rounded-full"
      initial={{ width: 0 }}
      animate={{ width: "100%" }}
      exit={{ width: 0 }}
      transition={{ type: "spring", stiffness: 100, damping: 20, duration: 0.1 }}
    />
    
    )}
  </button>
);

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

  const tabs = useMemo(() => [
    { 
      label: "Daily", 
      key: "daily", 
      icon: CalendarDays,
      component: <Summary categoryTotals={categoryTotalsForToday} totalForDay={totalForToday} date={date} />
    },
    { 
      label: "Weekly", 
      key: "weekly", 
      icon: BarChart3,
      component: <WeeklySpendingChart expenses={expenses} selectedMonth={selectedMonth} date={date} />
    },
    { 
      label: "Monthly", 
      key: "monthly", 
      icon: PieChart,
      component: <ExpenseCategoriesChart categoryTotals={categoryTotals} selectedMonth={selectedMonth} />
    },
    { 
      label: "Yearly", 
      key: "yearly", 
      icon: AreaChart,
      component: <YearlyOverviewChart expenses={expenses} selectedYear={selectedYear} />
    }
  ], [categoryTotals, categoryTotalsForToday, totalForToday, expenses, selectedMonth, selectedYear, date]);

  return (
    <div className="w-full flex flex-col gap-2">
      {/* Navigation Tabs */}
      <div className="flex w-full border-b border-stone-500 text-stone-400">
        {tabs.map(({ label, key, icon: Icon }) => (
          <TabButton 
            key={key} 
            label={label} 
            Icon={Icon} 
            isActive={activeTab === key} 
            onClick={() => setActiveTab(key)} 
          />
        ))}
      </div>

      {/* Content Based on Active Tab */}
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 3 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 3 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="w-full p-2"
        >
          {tabs.find(tab => tab.key === activeTab)?.component}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default FinancialInsights;
