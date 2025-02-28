import React from "react";
import { Plus } from "lucide-react";
import Select from "react-select";
import { CATEGORIES } from "../constants/categories";

const colourStyles = {
  control: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: "#1f2937", // gray-800
    borderColor: isFocused ? "#c084fc80" : "#374151", // Purple-400 when focused
    borderRadius: "8px", // Add border-radius
    "&:hover": {
      backgroundColor: "#1f2937", // gray-800
    },
    boxShadow: isFocused ? "0 0 0 1.5px #c084fc80" : "none", // Mimic Tailwind's focus:ring-2
    transition: "all 200ms",
    minHeight: "30px",
    height: "30px",
  }),
  valueContainer: (styles) => ({
    ...styles,
    padding: "0 8px",
  }),
  input: (styles) => ({
    ...styles,
    color: "white",
    margin: "0",
    padding: "0",
  }),
  dropdownIndicator: (styles, { isFocused }) => ({
    ...styles,
    padding: "0 6px",
    color: isFocused ? "#c084fc" : "#9ca3af",
    transition: "color 200ms",
    "&:hover": {
      color: "#c084fc",
    },
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#1f2937",
    border: "1px solid #374151",
    borderRadius: "8px", // Add border-radius
    boxShadow:
      "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
  }),
  option: (styles, { data, isDisabled, isFocused, isSelected }) => ({
    ...styles,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    background: isDisabled
      ? undefined
      : isSelected
      ? "linear-gradient(to right, #644a8a, #3b82f6)" // Purple (#644a8a) to Blue (#3b82f6)
      : isFocused
      ? "#374151"
      : undefined,

    color: isDisabled ? "#6b7280" : "white",
    cursor: isDisabled ? "not-allowed" : "pointer",
    padding: "4px 8px",
  }),
  placeholder: (styles) => ({
    ...styles,
    color: "#9ca3af",
    margin: "0",
  }),
};

const ExpenseForm = ({
  newExpense,
  setNewExpense,
  errors,
  handleAddExpense,
}) => {
  const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
    value: category,
    label: category,
    icon: CATEGORIES[category].icon,
  }));

  return (
    <div className="space-y-2">
      <div>
        <input
          value={newExpense.name}
          onChange={(e) =>
            setNewExpense((prev) => ({ ...prev, name: e.target.value }))
          }
          maxLength={20}
          className={`w-full px-2 py-1 bg-gray-800 border focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 shadow-md shadow-gray-950 ${
            errors.name ? "border-red-500" : "border-gray-700"
          } rounded-lg text-white text-sm`}
          placeholder="Description"
        />
      </div>

      <div className="flex gap-2">
        <div className="w-1/2">
          <input
            value={newExpense.amount}
            onChange={(e) =>
              setNewExpense((prev) => ({ ...prev, amount: e.target.value }))
            }
            className={`w-full px-2 py-1 bg-gray-800 border focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200 shadow-md shadow-gray-950 ${
              errors.amount ? "border-red-500" : "border-gray-700"
            } rounded-lg text-white text-sm`}
            placeholder="Amount"
            type="number"
            min="0"
            step="0.01"
          />
        </div>

        <div className="w-1/2">
          <Select
            className="shadow-md shadow-gray-950"
            options={categoryOptions}
            value={categoryOptions.find(
              (option) => option.value === newExpense.category
            )}
            onChange={(selectedOption) =>
              setNewExpense((prev) => ({
                ...prev,
                category: selectedOption.value,
              }))
            }
            styles={colourStyles}
            isSearchable={false}
            placeholder="Category"
            getOptionLabel={(e) => (
              <div className="flex items-center gap-2 text-sm">
                {e.icon && (
                  <e.icon size={16} className={CATEGORIES[e.value].color} />
                )}
                {e.label}
              </div>
            )}
            components={{
              SingleValue: ({ data }) => (
                <div className="flex items-center gap-2 text-sm text-white -mt-6">
                  {data.icon && (
                    <data.icon
                      size={16}
                      className={CATEGORIES[data.value].color}
                    />
                  )}
                  {data.label}
                </div>
              ),
            }}
          />
        </div>
      </div>

      <button
        onClick={handleAddExpense}
        className="w-full inline-flex items-center justify-center gap-2 py-0.5 px-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-gray-900 rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white shadow-md shadow-gray-950 hover:shadow-purple-500/50 dark:shadow-lg hover:dark:shadow-purple-800/80 cursor-pointer"
      >
        <span className="w-full flex items-center justify-center gap-2 px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
          <Plus
            size={20}
            className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
          />
          Add Expense
        </span>
      </button>
    </div>
  );
};

export default ExpenseForm;
