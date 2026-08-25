import { useState, useEffect, useMemo, useCallback, useId } from "react";
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
import { ArrowBigUp, ArrowBigDown, ClipboardX } from "lucide-react";
import { CATEGORY_COLORS } from "../constants/categories.jsx";

// --- Constants and Helper Functions ---

const COLORS = CATEGORY_COLORS;
const CATEGORY_NAMES = Object.keys(COLORS);
const MONTHS = [
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

const emptyMonthEntry = (month) => {
  const entry = { month };
  CATEGORY_NAMES.forEach((category) => {
    entry[category] = 0;
  });
  return entry;
};

const formatYearlyData = (expenses, selectedYear) => {
  const monthlyData = MONTHS.reduce((acc, month) => {
    acc[month] = emptyMonthEntry(month);
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

  const fullYearData = Object.values(monthlyData);

  const monthHasData = (monthEntry) =>
    CATEGORY_NAMES.some((category) => monthEntry[category] > 0);

  const firstIndex = fullYearData.findIndex(monthHasData);

  if (firstIndex === -1) {
    // No expenses at all this year — fall back to showing the full year
    return fullYearData;
  }

  const lastIndex =
    fullYearData.length -
    1 -
    [...fullYearData].reverse().findIndex(monthHasData);

  let adjustedFirstIndex = firstIndex;
  let adjustedLastIndex = lastIndex;

  if (firstIndex === lastIndex) {
    // Only one month has data — pad with an adjacent month so the Line/Area
    // has two points to draw and the Brush has a non-zero-width range.
    if (firstIndex > 0) {
      adjustedFirstIndex = firstIndex - 1;
    } else if (lastIndex < fullYearData.length - 1) {
      adjustedLastIndex = lastIndex + 1;
    }
  }

  return fullYearData.slice(adjustedFirstIndex, adjustedLastIndex + 1);
};

// --- Custom Components ---

const CustomYearlyTooltip = ({ active, payload, label, data }) => {
  if (active && payload && payload.length) {
    const currentMonthIndex = data.findIndex((item) => item.month === label);
    const previousMonthData =
      currentMonthIndex > 0 ? data[currentMonthIndex - 1] : null;

    // Categories with nothing spent that month just clutter the tooltip —
    // only show ones that actually contributed.
    const nonZeroPayload = payload.filter((entry) => entry.value > 0);
    const sortedPayload = [...nonZeroPayload].sort((a, b) => b.value - a.value);

    const total = payload.reduce((acc, entry) => acc + entry.value, 0);

    return (
      <div
        className="p-2 rounded-lg shadow-lg border border-border text-foreground"
        style={{
          background:
            "linear-gradient(to bottom, var(--chart-card-gradient-start), var(--chart-card-gradient-end))",
        }}
      >
        <p className="label text-lg text-foreground font-bold">{`${label}`}</p>
        {sortedPayload.length === 0 ? (
          <p className="text-xs text-muted-foreground py-1">No expenses</p>
        ) : (
          sortedPayload.map((entry, index) => (
            <div
              key={`tooltip-${index}`}
              className="flex justify-between items-center text-foreground py-0.5"
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
                    <ArrowBigUp className="h-5 w-5 text-destructive fill-destructive ml-1" />
                  ) : entry.value < previousMonthData[entry.name] ? (
                    <ArrowBigDown className="h-5 w-5 text-success fill-success ml-1" />
                  ) : null)}
              </div>
            </div>
          ))
        )}
        <hr className=" border-border" />
        <div className="flex justify-between items-center text-foreground py-1 font-semibold">
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
      className="p-2 rounded-lg pointer-events-none"
      style={{
        position: "absolute",
        top: "0.5rem",
        right: "0.5rem",
        zIndex: 100,
        background:
          "linear-gradient(to bottom, var(--chart-card-gradient-start), var(--chart-card-gradient-end))",
        border: `1.5px solid ${color || "var(--border)"}`,
        textAlign: "center",
      }}
    >
      <div className="text-xs text-foreground">
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

  // Recharts can call this with unmeasured (NaN/undefined) dimensions on the
  // very first render, before ResponsiveContainer has measured its size.
  if (![x, y, width, height].every((value) => Number.isFinite(value))) {
    return null;
  }

  const handleWidth = 10;
  const handleHeight = height + 10;
  const handleX = x + width / 2 - handleWidth / 2;
  const handleY = y - 5;
  const centerX = handleX + handleWidth / 2;
  const centerY = handleY + handleHeight / 2;

  return (
    <g>
      <rect
        x={handleX}
        y={handleY}
        width={handleWidth}
        height={handleHeight}
        fill="var(--chart-accent)"
        stroke="var(--chart-outline)"
        strokeWidth={1}
        rx={handleWidth / 2}
      />
      {/* Grip mark for drag affordance */}
      <line
        x1={centerX - 1.5}
        y1={centerY - 4}
        x2={centerX - 1.5}
        y2={centerY + 4}
        stroke="var(--chart-outline)"
        strokeWidth={1}
        strokeLinecap="round"
      />
      <line
        x1={centerX + 1.5}
        y1={centerY - 4}
        x2={centerX + 1.5}
        y2={centerY + 4}
        stroke="var(--chart-outline)"
        strokeWidth={1}
        strokeLinecap="round"
      />
    </g>
  );
};

MinimalTraveller.propTypes = {
  x: PropTypes.number.isRequired,
  y: PropTypes.number.isRequired,
  width: PropTypes.number.isRequired,
  height: PropTypes.number.isRequired,
};

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
            className="flex items-center mr-4 pt-2 cursor-pointer"
            role="button"
            tabIndex={0}
            onMouseEnter={() => onMouseEnter(entry)}
            onMouseLeave={() => onMouseLeave(entry)}
            onFocus={() => onMouseEnter(entry)}
            onBlur={() => onMouseLeave(entry)}
          >
            <div
              className="w-3 h-3 mr-1"
              style={{
                backgroundColor: color,
                borderRadius: "3px",
              }}
            />
            <span
              className="text-xs transition-colors"
              style={{
                color: "var(--chart-tick)",
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

// --- Main Chart Component ---

const YearlyOverviewChart = ({ expenses, selectedYear }) => {
  const [chartType, setChartType] = useState("area");
  const [hoveredCategory, setHoveredCategory] = useState(null);
  // Namespaces the gradient <linearGradient> ids so two chart instances on
  // the same page (e.g. a "compare years" view) never fight over one id.
  const gradientId = useId();

  const data = useMemo(
    () => formatYearlyData(expenses, selectedYear),
    [expenses, selectedYear],
  );

  const hasAnyExpenses = useMemo(
    () => data.some((month) => CATEGORY_NAMES.some((c) => month[c] > 0)),
    [data],
  );

  const categoryTotals = useMemo(() => {
    const totals = {};
    CATEGORY_NAMES.forEach((category) => {
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

  const [brushKey, setBrushKey] = useState(0);

  useEffect(() => {
    setBrushRange({
      startIndex: 0,
      endIndex: data.length - 1,
    });
  }, [data]);

  const handleLegendMouseEnter = useCallback((o) => {
    setHoveredCategory(o.dataKey);
  }, []);

  const handleLegendMouseLeave = useCallback(() => {
    setHoveredCategory(null);
  }, []);

  const MIN_BRUSH_MONTHS = 2;

  const handleBrushChange = useCallback(
    (newRange) => {
      const maxDataIndex = Math.max(data.length - 1, 0);
      const minGap = MIN_BRUSH_MONTHS - 1;

      let startIndex = Math.min(Math.max(newRange.startIndex, 0), maxDataIndex);
      let endIndex = Math.min(Math.max(newRange.endIndex, 0), maxDataIndex);
      if (startIndex > endIndex) {
        [startIndex, endIndex] = [endIndex, startIndex];
      }

      const rawStartIndex = startIndex;
      const rawEndIndex = endIndex;

      if (endIndex - startIndex < minGap) {
        const startMoved = startIndex !== brushRange.startIndex;
        const endMoved = endIndex !== brushRange.endIndex;

        if (startMoved && !endMoved) {
          startIndex = Math.max(0, endIndex - minGap);
          if (endIndex - startIndex < minGap) {
            endIndex = Math.min(maxDataIndex, startIndex + minGap);
          }
        } else {
          endIndex = Math.min(maxDataIndex, startIndex + minGap);
          if (endIndex - startIndex < minGap) {
            startIndex = Math.max(0, endIndex - minGap);
          }
        }
      }

      if (
        startIndex !== brushRange.startIndex ||
        endIndex !== brushRange.endIndex
      ) {
        setBrushRange({ startIndex, endIndex });
      }

      if (startIndex !== rawStartIndex || endIndex !== rawEndIndex) {
        setBrushKey((k) => k + 1);
      }
    },
    [data.length, brushRange.startIndex, brushRange.endIndex],
  );

  const maxIndex = Math.max(data.length - 1, 0);
  const clampedStartIndex = Math.min(brushRange.startIndex, maxIndex);
  const clampedEndIndex = Math.min(brushRange.endIndex, maxIndex);

  // --- Shared chart chrome, identical across both chart types ---
  const sharedGrid = (
    <CartesianGrid strokeDasharray="3 3" stroke="var(--chart-grid)" />
  );
  const sharedXAxis = (
    <XAxis dataKey="month" tick={{ fontSize: 12, fill: "var(--chart-tick)" }} />
  );
  const sharedYAxis = (
    <YAxis
      tick={{ fontSize: 11, fill: "var(--chart-tick)" }}
      tickFormatter={(value) => `₱${value.toLocaleString()}`}
    />
  );
  const sharedTooltip = (
    <Tooltip content={<CustomYearlyTooltip data={data} />} />
  );
  const sharedLegend = (
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
  );
  const sharedBrush = (
    <Brush
      key={brushKey}
      dataKey="month"
      height={15}
      stroke="var(--chart-accent-alt)"
      fill="var(--chart-outline)"
      traveller={<MinimalTraveller />}
      tickFormatter={() => ""}
      startIndex={clampedStartIndex}
      endIndex={clampedEndIndex}
      onChange={handleBrushChange}
    />
  );

  return (
    <div className="chart-container relative py-2 px-2 border border-border rounded-xl">
      <div className="flex justify-between items-center mb-5 pb-2 border-b border-border w-full">
        <h3 className="text-sm font-medium text-muted-foreground">
          {selectedYear
            ? `Yearly Overview - ${selectedYear}`
            : "Yearly Overview"}
        </h3>
        <Switch
          checked={chartType === "area"}
          onChange={(checked) => setChartType(checked ? "area" : "line")}
          className={`relative inline-flex items-center h-5 w-9 rounded-full p-0.5 transition-colors cursor-pointer ${
            chartType === "area" ? "bg-emerald-500" : "bg-muted"
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
          total={categoryTotals[hoveredCategory]}
          color={COLORS[hoveredCategory]}
        />
      )}

      {!hasAnyExpenses ? (
        <div className="text-muted-foreground min-h-50 py-8 flex flex-col items-center justify-center">
          <ClipboardX size={55} className="opacity-70 mb-5" />
          <span className="text-sm">
            No data available{selectedYear ? ` for ${selectedYear}` : ""}
          </span>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={200}>
          {chartType === "line" ? (
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              {sharedGrid}
              {sharedXAxis}
              {sharedYAxis}
              {sharedTooltip}
              {sharedLegend}
              {CATEGORY_NAMES.map((category) => (
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
              {sharedBrush}
            </LineChart>
          ) : (
            <AreaChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <defs>
                {CATEGORY_NAMES.map((category) => (
                  <linearGradient
                    key={`gradient-${category}`}
                    id={`${gradientId}-color${category}`}
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

              {sharedGrid}
              {sharedXAxis}
              {sharedYAxis}
              {sharedTooltip}
              {sharedLegend}
              {CATEGORY_NAMES.map((category) => (
                <Area
                  key={`area-${category}`}
                  type="monotone"
                  dataKey={category}
                  stackId="1"
                  stroke={COLORS[category]}
                  strokeWidth={0}
                  fill={`url(#${gradientId}-color${category})`}
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
              {sharedBrush}
            </AreaChart>
          )}
        </ResponsiveContainer>
      )}
    </div>
  );
};

YearlyOverviewChart.propTypes = {
  expenses: PropTypes.object,
  selectedYear: PropTypes.number,
};

export default YearlyOverviewChart;
