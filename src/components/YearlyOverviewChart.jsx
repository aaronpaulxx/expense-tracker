import { useState, useMemo } from "react";
import PropTypes from "prop-types";
import { Switch } from "@headlessui/react";
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  Tooltip,
  Brush,
} from "recharts";
import { ArrowBigUp, ArrowBigDown } from "lucide-react";

// --- Constants and Helper Functions ---

const COLORS = {
  Food: "#34d399",
  Transport: "#fbbf24",
  Shopping: "#3b82f6",
  Credit: "#ef4444",
  Bills: "#a78bfa",
  Other: "#9ca3af",
};

const formatYearlyData = (expenses, selectedYear) => {
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const monthlyData = months.reduce((acc, month) => {
    acc[month] = {
      month,
      Food: 0,
      Transport: 0,
      Shopping: 0,
      Credit: 0,
      Bills: 0,
      Other: 0,
    };
    return acc;
  }, {});

  Object.entries(expenses).forEach(([date, expenseList]) => {
    const expenseDate = new Date(date);
    const month = expenseDate.toLocaleString("default", { month: "short" });
    const year = expenseDate.getFullYear();
    if (year !== selectedYear) return;
    expenseList.forEach((expense) => {
      if (
        monthlyData[month] &&
        monthlyData[month][expense.category] !== undefined
      ) {
        monthlyData[month][expense.category] += expense.amount;
      }
    });
  });

  return Object.values(monthlyData);
};

// --- Custom Components ---

const CustomYearlyTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const currentMonthIndex = data.findIndex((item) => item.month === label);
    const previousMonthData =
      currentMonthIndex > 0 ? data[currentMonthIndex - 1] : null;
    const sortedPayload = [...payload].sort((a, b) => b.value - a.value);

    const total = payload.reduce((acc, entry) => acc + entry.value, 0);

    return (
      <div
        className="p-2 rounded-lg shadow-lg border border-stone-600 text-white"
        style={{ background: "linear-gradient(to bottom, #171717, #3f3f3f)" }}
      >
        <p className="label text-lg text-stone-300 font-bold">{`${label}`}</p>
        {sortedPayload.map((entry, index) => (
          <div
            key={`tooltip-${index}`}
            className="flex justify-between items-center text-stone-300 py-0.5"
          >
            <div className="flex items-center">
              {entry.color && (
                <div
                  className="w-3 h-3 rounded-xs mr-2"
                  style={{ backgroundColor: entry.color }}
                ></div>
              )}
              <span className="capitalize text-xs">{entry.name}:</span>
            </div>
            <div className="flex items-center text-xs ml-5">
              ₱{entry.value.toLocaleString()}
              {previousMonthData &&
                previousMonthData[entry.name] !== undefined &&
                (entry.value > previousMonthData[entry.name] ? (
                  <ArrowBigUp className="h-5 w-5 text-green-500 fill-green-500 ml-1" />
                ) : entry.value < previousMonthData[entry.name] ? (
                  <ArrowBigDown className="h-5 w-5 text-red-500 fill-red-500 ml-1" />
                ) : null)}
            </div>
          </div>
        ))}
        <hr className=" border-stone-600" />
        <div className="flex justify-between items-center text-stone-200 py-1 font-semibold">
          <span className="text-sm">Total:</span>
          <span className="text-sm mr-1">₱{total.toLocaleString()}</span>
        </div>
      </div>
    );
  }
  return null;
};

CustomYearlyTooltip.propTypes = {
  active: PropTypes.bool,
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      value: PropTypes.number,
      color: PropTypes.string,
    }),
  ),
  label: PropTypes.string,
  data: PropTypes.arrayOf(PropTypes.object).isRequired,
};

const CategoryTotalTooltip = ({ total, color }) => {
  return (
    <div
      className="p-2 rounded-lg text-white pointer-events-none"
      style={{
        position: "absolute",
        top: "15%",
        left: "75%",
        zIndex: 100,
        background: "linear-gradient(to bottom, #171717, #3f3f3f)",
        border: `1.5px solid ${color || "#57534e"}`,
        textAlign: "center",
      }}
    >
      <div className="text-xs text-stone-200">
        Total: ₱{total.toLocaleString()}
      </div>
    </div>
  );
};

CategoryTotalTooltip.propTypes = {
  total: PropTypes.number.isRequired,
  color: PropTypes.string,
};

const MinimalTraveller = (props) => {
  const { x, y, width, height } = props;
  const handleWidth = 8;
  const handleHeight = height + 15;
  const handleX = x + width / 2 - handleWidth / 2;
  const handleY = y - 7;

  return (
    <rect
      x={handleX}
      y={handleY}
      width={handleWidth}
      height={handleHeight}
      fill="#10b981"
      rx="4"
    />
  );
};

MinimalTraveller.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

// --- MODIFICATION START: New custom legend component ---
const CustomLegend = ({
  payload,
  onMouseEnter,
  onMouseLeave,
  hoveredCategory,
}) => {
  return (
    <div className="flex justify-center items-center pt-3 pb-1 pl-10">
      {payload.map((entry, index) => {
        const { dataKey, color, value } = entry;
        const isHovered = hoveredCategory === dataKey;

        return (
          <div
            key={`item-${index}`}
            className="flex items-center mr-4 pt-2 "
            onMouseEnter={() => onMouseEnter(entry)}
            onMouseLeave={() => onMouseLeave(entry)}
          >
            <div
              className="w-3 h-3 mr-1"
              style={{
                backgroundColor: color,
                borderRadius: "3px", // Your custom radius!
              }}
            />
            <span
              className="text-xs transition-colors"
              style={{
                color: "#e7e5e4", // Fallback to stone-400 (#a8a29e)
                borderBottom: isHovered
                  ? `1px solid ${color}`
                  : "1px solid transparent",
              }}
            >
              {value}
            </span>
          </div>
        );
      })}
    </div>
  );
};

CustomLegend.propTypes = {
  payload: PropTypes.arrayOf(
    PropTypes.shape({
      dataKey: PropTypes.string,
      color: PropTypes.string,
      value: PropTypes.string,
    }),
  ).isRequired,
  onMouseEnter: PropTypes.func.isRequired,
  onMouseLeave: PropTypes.func.isRequired,
  hoveredCategory: PropTypes.string,
};
// --- MODIFICATION END ---

// --- Main Chart Component ---

const YearlyOverviewChart = ({ expenses, selectedYear }) => {
  const [chartType, setChartType] = useState("area");
  const [hoveredCategory, setHoveredCategory] = useState(null);

  const data = useMemo(
    () => formatYearlyData(expenses, selectedYear),
    [expenses, selectedYear],
  );

  const categoryTotals = useMemo(() => {
    const totals = {};
    Object.keys(COLORS).forEach((category) => {
      totals[category] = data.reduce(
        (acc, month) => acc + (month[category] || 0),
        0,
      );
    });
    return totals;
  }, [data]);

  const [brushRange, setBrushRange] = useState({
    startIndex: 0,
    endIndex: data.length - 1,
  });

  const handleLegendMouseEnter = (o) => {
    setHoveredCategory(o.dataKey);
  };

  const handleLegendMouseLeave = () => {
    setHoveredCategory(null);
  };

  const handleBrushChange = (newRange) => {
    if (
      newRange.startIndex !== brushRange.startIndex ||
      newRange.endIndex !== brushRange.endIndex
    ) {
      setBrushRange({
        startIndex: newRange.startIndex,
        endIndex: newRange.endIndex,
      });
    }
  };

  // --- MODIFICATION: The renderLegendWithGlow function is no longer needed ---

  return (
    <div className="chart-container relative py-2 px-2 border border-stone-500 bg-stone-950 rounded-xl">
      <div className="flex justify-between items-center mb-5 pb-2 border-b border-stone-500 w-full">
        <h3 className="text-sm font-medium text-stone-200">
          {selectedYear
            ? `Yearly Overview - ${selectedYear}`
            : "Yearly Overview"}
        </h3>
        <Switch
          checked={chartType === "area"}
          onChange={(checked) => setChartType(checked ? "area" : "line")}
          className={`relative inline-flex items-center h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer ${
            chartType === "area" ? "bg-indigo-500" : "bg-green-500"
          }`}
        >
          <span className="sr-only">Switch between line and area chart</span>
          <span
            aria-hidden="true"
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              chartType === "area" ? "translate-x-full" : "translate-x-0"
            }`}
          />
        </Switch>
      </div>

      {hoveredCategory && categoryTotals[hoveredCategory] > 0 && (
        <CategoryTotalTooltip
          category={hoveredCategory}
          total={categoryTotals[hoveredCategory]}
          color={COLORS[hoveredCategory]}
        />
      )}

      <ResponsiveContainer width="100%" height={200}>
        {chartType === "line" ? (
          <LineChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a3a3a3" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#a3a3a3" }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomYearlyTooltip data={data} />} />
            {/* --- MODIFICATION: Using the content prop for the custom legend --- */}
            <Legend
              verticalAlign="bottom"
              content={
                <CustomLegend
                  onMouseEnter={handleLegendMouseEnter}
                  onMouseLeave={handleLegendMouseLeave}
                  hoveredCategory={hoveredCategory}
                />
              }
            />
            {Object.keys(COLORS).map((category) => (
              <Line
                key={`line-${category}`}
                type="monotone"
                dataKey={category}
                stroke={COLORS[category]}
                strokeWidth={hoveredCategory === category ? 2.5 : 1.5}
                strokeOpacity={
                  hoveredCategory === null || hoveredCategory === category
                    ? 1
                    : 0.2
                }
                dot={false}
                animationDuration={300}
              />
            ))}
            <Brush
              dataKey="month"
              height={8}
              stroke="#5eead4"
              fill="#0c0a09"
              traveller={<MinimalTraveller />}
              tickFormatter={() => ""}
              startIndex={brushRange.startIndex}
              endIndex={brushRange.endIndex}
              onChange={handleBrushChange}
            />
          </LineChart>
        ) : (
          <AreaChart
            data={data}
            margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
          >
            <defs>
              {Object.keys(COLORS).map((category) => (
                <linearGradient
                  key={`gradient-${category}`}
                  id={`color${category}`}
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop
                    offset="5%"
                    stopColor={COLORS[category]}
                    stopOpacity={0.7}
                  />
                  <stop
                    offset="95%"
                    stopColor={COLORS[category]}
                    stopOpacity={0.1}
                  />
                </linearGradient>
              ))}
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#4a4a4a" />
            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#a3a3a3" }} />
            <YAxis
              tick={{ fontSize: 11, fill: "#a3a3a3" }}
              tickFormatter={(value) => `₱${value.toLocaleString()}`}
            />
            <Tooltip content={<CustomYearlyTooltip data={data} />} />
            {/* --- MODIFICATION: Using the content prop for the custom legend --- */}
            <Legend
              verticalAlign="bottom"
              content={
                <CustomLegend
                  onMouseEnter={handleLegendMouseEnter}
                  onMouseLeave={handleLegendMouseLeave}
                  hoveredCategory={hoveredCategory}
                />
              }
            />
            {Object.keys(COLORS).map((category) => (
              <Area
                key={`area-${category}`}
                type="monotone"
                dataKey={category}
                stackId="1"
                stroke={COLORS[category]}
                strokeWidth={1.5}
                fill={`url(#color${category})`}
                strokeOpacity={
                  hoveredCategory === null || hoveredCategory === category
                    ? 1
                    : 0.2
                }
                fillOpacity={
                  hoveredCategory === null || hoveredCategory === category
                    ? 1
                    : 0.2
                }
                animationDuration={300}
              />
            ))}
            <Brush
              dataKey="month"
              height={8}
              stroke="#5eead4"
              fill="#0c0a09"
              traveller={<MinimalTraveller />}
              tickFormatter={() => ""}
              startIndex={brushRange.startIndex}
              endIndex={brushRange.endIndex}
              onChange={handleBrushChange}
            />
          </AreaChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

YearlyOverviewChart.propTypes = {
  expenses: PropTypes.object,
  selectedYear: PropTypes.number,
};

export default YearlyOverviewChart;