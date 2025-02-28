// src/components/DateSelector.jsx
import React from "react";
import DatePicker from "react-datepicker";
import { Calendar, ChevronLeft, ChevronRight } from "lucide-react";
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
    <div className="flex items-center justify-between px-2 py-2 bg-gray-800 text-white rounded-t-lg">
      {/* Previous Month Button */}
      <button
        onClick={decreaseMonth}
        disabled={prevMonthButtonDisabled}
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        <ChevronLeft size={20} className="text-gray-400 hover:text-white" />
      </button>

      {/* Month & Year Dropdowns */}
      <div className="flex items-center gap-2">
        {/* Month Dropdown */}
        <select
          value={date.getMonth()}
          onChange={({ target: { value } }) => changeMonth(parseInt(value))}
          className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm focus:outline-none cursor-pointer"
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
          className="bg-gray-700 text-white px-2 py-1 rounded-md text-sm focus:outline-none cursor-pointer"
        >
          {Array.from(
            { length: 100 },
            (_, i) => new Date().getFullYear() - 50 + i
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
        className="p-1 hover:bg-gray-700 rounded-full transition-colors"
      >
        <ChevronRight size={20} className="text-gray-400 hover:text-white" />
      </button>
    </div>
  );

  return (
    <div className="flex items-center gap-1">
      {/* Previous Day Button */}
      <button
        onClick={() => setDate(new Date(date.setDate(date.getDate() - 1)))}
        className="h-[44px] group px-3 py-2 bg-gray-800 text-white rounded-lg shadow-md duration-200 hover:bg-gray-700 text-sm flex items-center justify-center cursor-pointer shadow-gray-950"
      >
        <ChevronLeft
          size={18}
          className="transition-transform duration-300 ease-in-out group-hover:scale-130"
        />
      </button>

      {/* Date Display */}
      <div
        onClick={handleDateClick}
        className="relative flex-1 px-4 py-2 rounded-lg bg-gray-800 text-center text-xl font-semibold text-white shadow-md hover:bg-gray-700 transition-all duration-300 cursor-pointer flex items-center justify-center gap-2 shadow-gray-950"
      >
        <span>
          {date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
          })}
        </span>
        <Calendar size={18} className="text-gray-200" />
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
              new Date(0, i).toLocaleString("en", { month: "long" })
            )}
          />
        )}
        inline={false}
        showMonthDropdown
        showYearDropdown
        dropdownMode="select"
        popperClassName="react-datepicker-popper"
        popperModifiers={[
          {
            name: "offset",
            options: {
              offset: [0, 8],
            },
          },
        ]}
      />

      {/* Next Day Button */}
      <button
        onClick={() => setDate(new Date(date.setDate(date.getDate() + 1)))}
        className="h-[44px] group px-3 py-2 bg-gray-800 text-white rounded-lg shadow-md duration-200 hover:bg-gray-700 text-sm flex items-center justify-center cursor-pointer shadow-gray-950"
      >
        <ChevronRight
          size={18}
          className="transition-transform duration-300 ease-in-out group-hover:scale-130"
        />
      </button>
    </div>
  );
};

export default DateSelector;
