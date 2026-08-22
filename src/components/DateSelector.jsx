// src/components/DateSelector.jsx
import PropTypes from "prop-types";
import DatePicker from "react-datepicker";
import { ChevronLeft, ChevronRight } from "lucide-react";
import "../styles/datepicker.css";

const DateSelector = ({
  date,
  setDate,
  onYearChange,
  dateInputRef,
  handleDateClick,
}) => {
  const handleDateChange = (newDate) => {
    setDate(newDate);
    onYearChange(newDate.getFullYear()); // Send the selected year
  };

  const CustomHeader = ({
    date,
    decreaseMonth,
    increaseMonth,
    prevMonthButtonDisabled,
    nextMonthButtonDisabled,
    changeYear,
    changeMonth,
    months,
  }) => (
    <div className="flex items-center justify-between px-2 py-2 text-white rounded-t-lg ">
      {/* Previous Month Button */}
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 mr-2 rounded-full transition-colors cursor-pointer"
      >
        <ChevronLeft
          size={24}
          strokeWidth={3}
          className="text-stone-400 hover:text-emerald-300"
        />
      </button>

      {/* Month & Year Dropdowns */}
      <div className="flex items-center gap-2">
        {/* Month Dropdown */}
        <select
          value={date.getMonth()}
          onChange={({ target: { value } }) => changeMonth(parseInt(value))}
          className="dp-month-select"
        >
          {months.map((month, index) => (
            <option key={index} value={index}>
              {month}
            </option>
          ))}
        </select>

        {/* Year Dropdown */}
        <select
          value={date.getFullYear()}
          onChange={({ target: { value } }) => changeYear(parseInt(value))}
          className="dp-year-select"
        >
          {Array.from(
            { length: 100 },
            (_, i) => new Date().getFullYear() - 50 + i,
          ).map((year) => (
            <option key={year} value={year}>
              {year}
            </option>
          ))}
        </select>
      </div>

      {/* Next Month Button */}
      <button
        onClick={increaseMonth}
        disabled={nextMonthButtonDisabled}
        className="p-1 ml-2 rounded-full transition-colors cursor-pointer"
      >
        <ChevronRight
          size={24}
          strokeWidth={3}
          className="text-stone-400 hover:text-emerald-300"
        />
      </button>
    </div>
  );

  CustomHeader.propTypes = {
    date: PropTypes.instanceOf(Date).isRequired,
    decreaseMonth: PropTypes.func.isRequired,
    increaseMonth: PropTypes.func.isRequired,
    prevMonthButtonDisabled: PropTypes.bool,
    nextMonthButtonDisabled: PropTypes.bool,
    changeYear: PropTypes.func.isRequired,
    changeMonth: PropTypes.func.isRequired,
    months: PropTypes.arrayOf(PropTypes.string).isRequired,
  };

  return (
    <div className="flex items-center">
      {/* Previous Day Button */}
      <button
        onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}
        className="h-12.5 group px-3 py-2 text-white duration-200 hover:bg-stone-800 hover:text-emerald-300 text-sm flex items-center justify-center cursor-pointer "
      >
        {/* Tooltip */}
        <div className="absolute left-1 top-15 bg-stone-800 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Previous Day
        </div>
        <ChevronLeft
          size={30}
          strokeWidth={3}
          className="mr-1 transition-transform duration-300 ease-in-out group-hover:scale-130"
        />
      </button>

      {/* Date Display with Tooltip */}
      <div
        onClick={handleDateClick}
        className="relative flex-1 px-5 py-2 rounded-lg text-center transition-all duration-300 cursor-pointer flex items-center justify-center gap-x-3 group"
      >
        {/* Tooltip */}
        <div className="absolute top-14 bg-stone-800 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Click to change date
        </div>

        {/* Weekday Container */}
        <div>
          <span className="text-lg text-emerald-300 uppercase">
            - {date.toLocaleDateString("en-US", { weekday: "long" })} -
          </span>
        </div>

        {/* Date Container */}
        <div>
          <span className="text-lg text-white uppercase">
            {date.toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Date Picker with Month & Year Dropdowns */}
      <DatePicker
        selected={date}
        onChange={(date) => {
          setDate(date);
          handleDateChange(date);
        }}
        dateFormat="MMMM dd, yyyy"
        ref={dateInputRef}
        className="hidden"
        calendarClassName="shadow-xl border-0"
        renderCustomHeader={(props) => (
          <CustomHeader
            {...props}
            months={Array.from({ length: 12 }, (_, i) =>
              new Date(0, i).toLocaleString("en", { month: "long" }),
            )}
          />
        )}
        inline={false}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperClassName="react-datepicker-popper"
      />

      {/* Next Day Button */}
      <button
        onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}
        className="h-12.5 group px-3 py-2 text-white duration-200 hover:bg-stone-800 hover:text-emerald-300 text-sm flex items-center justify-center cursor-pointer "
      >
        {/* Tooltip */}
        <div className="absolute right-1 top-15 bg-stone-800 text-white text-xs px-3 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
          Next Day
        </div>
        <ChevronRight
          size={30}
          strokeWidth={3}
          className="ml-1 transition-transform duration-300 ease-in-out group-hover:scale-130"
        />
      </button>
    </div>
  );
};

DateSelector.propTypes = {
  date: PropTypes.instanceOf(Date).isRequired,
  setDate: PropTypes.func.isRequired,
  onYearChange: PropTypes.func.isRequired,
  dateInputRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.any }),
  ]),
  handleDateClick: PropTypes.func.isRequired,
};

export default DateSelector;
