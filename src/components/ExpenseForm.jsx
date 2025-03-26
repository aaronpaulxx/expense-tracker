import React, { useState, useEffect } from "react";
import { Plus, AlertCircle, X } from "lucide-react";
import Select from "react-select";
import { CATEGORIES } from "../constants/categories";

const colourStyles = {
  control: (styles, { isFocused }) => ({
    ...styles,
    backgroundColor: "#0c0a09", // stone-800
    borderColor: "#78716c", // Same border color regardless of focus state
    borderRadius: "9px", // Add border-radius
    borderWidth: "1px", // Same border width regardless of focus state
    "&:hover": {
      backgroundColor: "#292524", // stone-800
    },
    boxShadow: "none", // Removed focus ring shadow
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
    color: isFocused ? "#22c55e" : "#9ca3af",
    transition: "color 200ms",
    "&:hover": {
      color: "#22c55e",
    },
  }),
  menu: (styles) => ({
    ...styles,
    backgroundColor: "#292524",
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
      ? "linear-gradient(to right, #166534, #115e59)" // Green to Teal
      : isFocused
      ? "#57534e"
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
  const [notification, setNotification] = useState("");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Combine all error messages
      const errorMessages = Object.values(errors).filter(Boolean).join("\n"); // Uses line breaks instead of "|"

      setNotification(errorMessages);
    }
  }, [errors]);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => {
        // Start closing animation before removing
        setIsClosing(true);

        // Wait for animation to complete before clearing notification
        setTimeout(() => {
          setNotification("");
          setIsClosing(false);
        }, 300); // Match this with the CSS animation duration
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [notification]);

  const closeNotification = () => {
    setIsClosing(true);
    setTimeout(() => {
      setNotification("");
      setIsClosing(false);
    }, 300);
  };

  const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
    value: category,
    label: category,
    icon: CATEGORIES[category].icon,
  }));

  const handleSubmit = () => {
    handleAddExpense();
  };

  return (
    <>
      {notification && (
        <div
          className={`fixed bottom-4 right-5 bg-stone-900 text-white p-2 rounded-lg text-sm border-1 border-stone-600 shadow-lg flex items-center gap-4 z-50 ${
            isClosing
              ? "animate-[slideOut_0.3s_ease-in_forwards]"
              : "animate-[slideIn_0.2s_ease-out]"
          }`}
        >
          <AlertCircle size={28} className="text-red-400" />
          <div className="flex-1 -ml-2 whitespace-pre-wrap">{notification}</div>

          <button
            onClick={closeNotification}
            className="text-white hover:text-stone-300 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}

      <div className="space-y-3 p-2">
        <div>
          <input
            value={newExpense.name}
            onChange={(e) =>
              setNewExpense((prev) => ({ ...prev, name: e.target.value }))
            }
            maxLength={20}
            className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
              errors.name ? "border-red-400" : "border-stone-500 border-1"
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
              className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
                errors.amount ? "border-red-400" : "border-stone-500 border-1"
              } rounded-lg text-white text-sm`}
              placeholder="Amount"
              type="number"
              min="0"
              step="0.01"
            />
          </div>

          <div className="w-1/2">
            <Select
              className="shadow-md shadow-stone-950 border-amber-400"
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
          onClick={handleSubmit}
          className="w-full inline-flex items-center justify-center gap-2 py-0.5 px-0.5 mb-2 me-2 overflow-hidden text-sm font-medium text-stone-900 rounded-lg group bg-gradient-to-br from-teal-600 to-green-500 group-hover:from-teal-600 group-hover:to-green-500 hover:text-white dark:text-white shadow-md shadow-stone-950 hover:shadow-teal-500/50 dark:shadow-lg hover:dark:shadow-teal-800/80 cursor-pointer"
        >
          <span className="w-full flex items-center justify-center gap-2 px-5 py-2.5 transition-all ease-in duration-75 bg-white dark:bg-stone-950 rounded-md group-hover:bg-transparent group-hover:dark:bg-transparent">
            <Plus
              size={20}
              className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
            />
            Add Expense
          </span>
        </button>
      </div>
    </>
  );
};

export default ExpenseForm;
