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
        ? "linear-gradient(to right, #166534, #115e59)"
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

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        handleSubmit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [newExpense, handleAddExpense]); // Added dependencies

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
              errors.name
                ? "border-red-400"
                : "border-stone-500 border-1 focus:border-stone-300"
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
                errors.amount
                  ? "border-red-400"
                  : "border-stone-500 border-1 focus:border-stone-300"
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
        <div className="animated-border-wrapper">
          <button
            onClick={handleSubmit}
            className="cursor-pointer flex gap-2 group 
  group-hover:before:duration-500 group-hover:after:duration-500 
  after:duration-500 
  hover:border-emerald-300 active:border-orange-400

  hover:before:[box-shadow:_20px_20px_20px_30px_#1c74af,_-15px_-15px_15px_25px_#ec4899] 
  active:before:[box-shadow:_10px_10px_20px_20px_#f97316,_-10px_-10px_20px_20px_#fb923c] 
  before:[box-shadow:_-10px_-10px_10px_20px_#ec4899] 

  duration-500 before:duration-500 hover:duration-500 
  hover:after:-right-8 
  hover:before:right-12 hover:before:-bottom-8 
  hover:before:blur origin-left 
  hover:decoration-2 
  hover:text-stone-50 active:text-orange-300

  relative bg-stone-950 h-auto w-full border-0 text-left p-3 
  text-stone-100 text-base font-bold rounded-lg overflow-hidden 

  before:absolute before:w-12 before:h-12 before:content-[''] before:right-1 before:top-1 before:z-10 
  before:bg-indigo-500 active:before:bg-orange-500 before:rounded-full before:blur-lg 

  after:absolute after:z-10 after:w-20 after:h-20 after:content-[''] 
  after:bg-emerald-300 active:after:bg-orange-300 after:right-8 after:top-3 after:rounded-full after:blur-lg"
          >
            <Plus
              size={23}
              className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
            />
            Add Expense
          </button>
        </div>
      </div>
    </>
  );
};

export default ExpenseForm;
