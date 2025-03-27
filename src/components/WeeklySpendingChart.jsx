import React from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";

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
      startDateFormatted: startDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      }),
      endDateFormatted: endDate.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric' 
      })
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
  const weeklyData = weekDetails.map(weekInfo => ({
    week: weekInfo.week,
    startDate: weekInfo.startDate,
    endDate: weekInfo.endDate,
    startDateFormatted: weekInfo.startDateFormatted,
    endDateFormatted: weekInfo.endDateFormatted,
    Total: 0
  }));

  Object.entries(expenses).forEach(([date, dayExpenses]) => {
    const expenseDate = new Date(date);
    
    if (expenseDate.getFullYear() === year && expenseDate.getMonth() === month) {
      const weekIndex = getWeekNumber(expenseDate) - 1;
      weeklyData[weekIndex].Total += dayExpenses.reduce(
        (sum, exp) => sum + exp.amount,
        0
      );
    }
  });

  return weeklyData.map(week => ({
    ...week,
    Total: Number(week.Total.toFixed(2))
  }));
};

export const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload || !payload.length) {
    return null;
  }

  const weekData = payload[0].payload;

  return (
    <div
      className="p-3 rounded-lg shadow-lg border border-stone-600 text-white"
      style={{
        background: "linear-gradient(to bottom, #171717, #3f3f3f)", // Black-to-gray gradient
      }}
    >
      <p className="font-medium text-md">{weekData.week}</p>
      <p className="text-stone-300 text-sm mb-3">
        {weekData.startDateFormatted} - {weekData.endDateFormatted}
      </p>
      <div className="flex items-center gap-2 text-sm">
        <span>Total: ₱{weekData.Total.toLocaleString()}</span>
      </div>
    </div>
  );
};

const WeeklySpendingChart = ({ expenses, selectedMonth }) => {
  const weeklyTrendData = React.useMemo(
    () => formatWeeklyTrend(expenses, selectedMonth),
    [expenses, selectedMonth]
  );

  return (
    <div className="border-stone-500 border-1 rounded-xl p-2 shadow-md shadow-stone-950">
      <h3 className="text-sm font-medium text-stone-300 mb-5 pb-2 border-b border-stone-500 flex justify-between items-center">
        <span>Weekly Spending</span>
        <span className="text-stone-300">
          {selectedMonth
            ? new Date(selectedMonth).toLocaleString("en-US", {
                month: "long",
                year: "numeric",
              })
            : ""}
        </span>
      </h3>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart
          data={weeklyTrendData}
          margin={{ top: 20, right: 20, left: -10, bottom: 10 }}
        >
          <CartesianGrid strokeDasharray="2 2" stroke="#e7e5e4" opacity={0.4} />

          <XAxis
            dataKey="week"
            tick={{ fontSize: 12, fill: "#d6d3d1" }}
            tickLine={{ stroke: "#4A5568" }}
          />

          <YAxis
            tick={{ fontSize: 12, fill: "#d6d3d1" }}
            tickLine={{ stroke: "#4A5568" }}
            tickFormatter={(value) => `₱${value.toLocaleString()}`}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ fill: "rgba(16, 185, 129, 0.1)" }}
          />

          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity={0.9} />
              <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.5} />
            </linearGradient>
          </defs>

          <Bar
            dataKey="Total"
            fill="url(#colorTotal)"
            radius={[8, 8, 0, 0]}
            barSize={30}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WeeklySpendingChart;