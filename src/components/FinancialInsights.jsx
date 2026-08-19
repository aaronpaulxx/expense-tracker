import { useState, useMemo, lazy, Suspense } from "react";
import PropTypes from "prop-types";
import { CalendarDays, BarChart3, PieChart, AreaChart } from "lucide-react";
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from "@headlessui/react";
import Summary from "./Summary";

// Chart components (and the recharts they import) are only pulled into a
// separate chunk and fetched when their tab is actually opened, instead of
// being parsed/compiled into the main bundle on every app launch.
const WeeklySpendingChart = lazy(() => import("./WeeklySpendingChart"));
const ExpenseCategoriesChart = lazy(() => import("./ExpenseCategoriesChart"));
const YearlyOverviewChart = lazy(() => import("./YearlyOverviewChart"));

// Same dynamic imports as above, exposed separately so hovering/focusing a
// tab can start the fetch before the user actually clicks it — by the time
// the click lands, the chunk is usually already loaded, avoiding the blink.
const prefetchers = {
  weekly: () => import("./WeeklySpendingChart"),
  monthly: () => import("./ExpenseCategoriesChart"),
  yearly: () => import("./YearlyOverviewChart"),
};

const FinancialInsights = ({
  categoryTotals,
  categoryTotalsForToday,
  totalForToday,
  expenses,
  selectedMonth,
  selectedYear,
  date,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  const tabs = useMemo(
    () => [
      {
        label: "Daily",
        key: "daily",
        icon: CalendarDays,
        component: (
          <Summary
            categoryTotals={categoryTotalsForToday}
            totalForDay={totalForToday}
            date={date}
          />
        ),
      },
      {
        label: "Weekly",
        key: "weekly",
        icon: BarChart3,
        component: (
          <WeeklySpendingChart
            expenses={expenses}
            selectedMonth={selectedMonth}
            date={date}
          />
        ),
      },
      {
        label: "Monthly",
        key: "monthly",
        icon: PieChart,
        component: (
          <ExpenseCategoriesChart
            categoryTotals={categoryTotals}
            selectedMonth={selectedMonth}
          />
        ),
      },
      {
        label: "Yearly",
        key: "yearly",
        icon: AreaChart,
        component: (
          <YearlyOverviewChart
            expenses={expenses}
            selectedYear={selectedYear}
          />
        ),
      },
    ],
    [
      categoryTotals,
      categoryTotalsForToday,
      totalForToday,
      expenses,
      selectedMonth,
      selectedYear,
      date,
    ],
  );

  return (
    <div className="w-full flex flex-col gap-2">
      <TabGroup selectedIndex={activeIndex} onChange={setActiveIndex}>
        {/* Navigation Tabs */}
        <TabList className="flex w-full border-b border-stone-500 text-stone-400 relative">
          {tabs.map(({ label, key, icon: Icon }, index) => (
            <Tab
              key={key}
              onMouseEnter={() => prefetchers[key]?.()}
              onFocus={() => prefetchers[key]?.()}
              className={`relative flex-1 px-4 py-3 text-xs font-medium flex items-center justify-center gap-2 transition-transform duration-300 outline-none rounded-t-md ${
                activeIndex === index
                  ? "text-green-300 scale-105"
                  : "text-stone-300 hover:text-stone-100 hover:scale-105 group"
              }`}
            >
              <Icon
                size={18}
                className={`transition-transform duration-300 ${
                  activeIndex === index
                    ? "text-green-300 scale-105"
                    : "text-stone-300 group-hover:text-stone-100 group-hover:scale-105"
                }`}
              />
              {label}
            </Tab>
          ))}
          {/* Sliding underline — one shared element, shifted via transform instead
              of framer-motion's layoutId shared-layout animation. */}
          <div
            className="absolute bottom-0 left-0 h-0.5 bg-green-300 rounded-full transition-transform duration-300 ease-in-out"
            style={{
              width: `${100 / tabs.length}%`,
              transform: `translateX(${activeIndex * 100}%)`,
            }}
          />
        </TabList>

        <TabPanels className="w-full p-2">
          <Suspense
            fallback={
              <div className="w-full h-67 flex items-center justify-center text-stone-500 text-sm">
                Loading…
              </div>
            }
          >
            {tabs.map(({ key, component }) => (
              <TabPanel key={key} className="animate-tab-fade-in">
                {component}
              </TabPanel>
            ))}
          </Suspense>
        </TabPanels>
      </TabGroup>
    </div>
  );
};

FinancialInsights.propTypes = {
  categoryTotals: PropTypes.object,
  categoryTotalsForToday: PropTypes.object,
  totalForToday: PropTypes.number,
  expenses: PropTypes.object,
  selectedMonth: PropTypes.string,
  selectedYear: PropTypes.number,
  date: PropTypes.instanceOf(Date),
};

export default FinancialInsights;