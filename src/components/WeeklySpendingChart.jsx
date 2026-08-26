import React from "react";
import PropTypes from "prop-types";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { ClipboardX } from "lucide-react";

const getWeekDetails = (year, month) => {
  const weeks = [];
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const weekLength = Math.ceil(daysInMonth / 4);

  for (let week = 1; week <= 4; week++) {
    const startDay = (week - 1) * weekLength + 1;
    const endDay = Math.min(week * weekLength, daysInMonth);

    const startDate = new Date(year, month, startDay);
    const endDate = new Date(year, month, endDay);

    weeks.push({
      week: `Week ${week}`,
      startDate,
      endDate,
      startDateFormatted: startDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
      endDateFormatted: endDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
      }),
    });
  }

  return weeks;
};

const getWeekNumber = (date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const totalDays = new Date(year, month + 1, 0).getDate(); // Total days in the month

  const weekLength = Math.ceil(totalDays / 4); // Distribute days into 4 weeks
  return Math.min(Math.ceil(date.getDate() / weekLength), 4); // Assign week number
};

const formatWeeklyTrend = (expenses, selectedMonth) => {
  const selectedDate = new Date(selectedMonth);
  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();

  const weekDetails = getWeekDetails(year, month);
  const weeklyData = weekDetails.map((weekInfo) => ({
    week: weekInfo.week,
    startDate: weekInfo.startDate,
    endDate: weekInfo.endDate,
    startDateFormatted: weekInfo.startDateFormatted,
    endDateFormatted: weekInfo.endDateFormatted,
    Total: 0,
  }));

  Object.entries(expenses).forEach(([date, dayExpenses]) => {
    const expenseDate = new Date(date);

    if (
      expenseDate.getFullYear() === year &&
      expenseDate.getMonth() === month
    ) {
      const weekIndex = getWeekNumber(expenseDate) - 1;
      weeklyData[weekIndex].Total += dayExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0,
      );
    }
  });

  return weeklyData.map((week) => ({
    ...week,
    Total: Number(week.Total.toFixed(2)),
  }));
};

export const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const weekData = payload[0].payload;

  return (
    <div
      className="p-3 rounded-lg shadow-lg text-foreground"
      style={{
        background:
          "linear-gradient(to bottom, var(--chart-card-gradient-start), var(--chart-card-gradient-end))",
      }}
    >
      <p className="font-bold text-md text-foreground">{weekData.week}</p>
      <p className="text-muted-foreground text-xs mb-3">
        ({weekData.startDateFormatted} - {weekData.endDateFormatted})
      </p>
      <div className="flex items-center gap-2 text-sm font-medium">
        <span>Total: ₱{weekData.Total.toLocaleString()}</span>
      </div>
    </div>
  );
};

CustomTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      payload: PropTypes.shape({
        week: PropTypes.string,
        startDateFormatted: PropTypes.string,
        endDateFormatted: PropTypes.string,
        Total: PropTypes.number,
      }),
    }),
  ),
};

// --- Chart chrome shared across renders — fully static (no dependency on
// props or state), so defined once at module scope instead of being
// rebuilt as new React elements on every render.
const sharedGrid = (
  <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
);
const sharedXAxis = (
  <XAxis
    dataKey="week"
    tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
    tickLine={{ stroke: "var(--chart-grid)" }}
  />
);
const sharedYAxis = (
  <YAxis
    tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
    tickLine={{ stroke: "var(--chart-grid)" }}
    tickFormatter={(value) => `₱${value.toLocaleString()}`}
  />
);
const sharedTooltip = (
  <Tooltip
    content={<CustomTooltip />}
    cursor={{ fill: "var(--chart-accent)", fillOpacity: 0.1 }}
  />
);
const sharedDefs = (
  <defs>
    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={0.9} />
      <stop
        offset="100%"
        stopColor="var(--chart-accent-alt)"
        stopOpacity={0.5}
      />
    </linearGradient>
    <linearGradient id="colorTotalActive" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="var(--chart-accent)" stopOpacity={1} />
      <stop offset="100%" stopColor="var(--chart-accent-alt)" stopOpacity={1} />
    </linearGradient>
  </defs>
);
const sharedBar = (
  <Bar
    dataKey="Total"
    fill="url(#colorTotal)"
    activeBar={{ fill: "url(#colorTotalActive)" }}
    radius={[8, 8, 0, 0]}
    barSize={30}
  />
);

const WeeklySpendingChart = ({ expenses, selectedMonth }) => {
  const weeklyTrendData = React.useMemo(
    () => formatWeeklyTrend(expenses, selectedMonth),
    [expenses, selectedMonth],
  );

  const hasAnyExpenses = React.useMemo(
    () => weeklyTrendData.some((week) => week.Total > 0),
    [weeklyTrendData],
  );

  return (
    <div className="border-border border rounded-xl p-2 shadow-md shadow-stone-950">
      <h3 className="text-sm font-medium text-muted-foreground mb-5 pb-2 border-b border-border flex justify-between items-center">
        <span>Weekly Spending</span>
        <span className="text-muted-foreground">
          {selectedMonth
            ? new Date(selectedMonth).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
      </h3>

      {!hasAnyExpenses ? (
        <div className="text-muted-foreground min-h-50 py-8 flex flex-col items-center justify-center">
          <ClipboardX size={55} className="opacity-70 mb-5" />
          <span className="text-sm">
            No data available
            {selectedMonth
              ? ` for ${new Date(selectedMonth).toLocaleString("en-US", {
                  month: "long",
                })}`
              : ""}{" "}
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={weeklyTrendData}
            margin={{ top: 20, right: 20, left: 10, bottom: 10 }}
          >
            {sharedGrid}
            {sharedXAxis}
            {sharedYAxis}
            {sharedTooltip}
            {sharedDefs}
            {sharedBar}
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
};

WeeklySpendingChart.propTypes = {
  expenses: PropTypes.object,
  selectedMonth: PropTypes.string,
};

export default WeeklySpendingChart;