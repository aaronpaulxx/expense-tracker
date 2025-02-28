import React, { useState } from "react";
import Select from "react-select";
import {
  Trash,
  PencilLine,
  X,
  Ban,
  Check,
  Save,
  AlertCircle,
  ClipboardX,
} from "lucide-react";
import { CATEGORIES } from "../constants/categories";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const Toast = ({ message, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 animate-[slideIn_0.2s_ease-out]">
    <div className="bg-gray-700 text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-2">
      <Check size={28} className="w-6 h-6 text-green-500" />
      <span>{message}</span>
      <button onClick={onClose} className="cursor-pointer">
        <X size={18} />
      </button>
    </div>
  </div>
);

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ExpenseList = ({
  expenses,
  currentDateKey,
  isNewlyAdded,
  deletingIndex,
  handleDeleteExpense,
  date,
  onUpdateExpense,
}) => {
  const [editingExpense, setEditingExpense] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [originalExpense, setOriginalExpense] = useState(null);
  const [editForm, setEditForm] = useState({
    name: "",
    amount: "",
    category: "",
  });
  const [errors, setErrors] = useState({});
  const [showToast, setShowToast] = useState(false);

  const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
    value: category,
    label: category,
    icon: CATEGORIES[category].icon,
  }));

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
      minHeight: "34px", // Slightly taller for the edit form
      height: "34px",
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
      overflow: "hidden", // Ensures rounded corners work properly
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

  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  const hasChanges = () => {
    if (!originalExpense) return false;
    return (
      editForm.name !== originalExpense.name ||
      parseFloat(editForm.amount) !== originalExpense.amount ||
      editForm.category !== originalExpense.category
    );
  };

  const truncateText = (text, maxLength = 20) => {
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  const validateField = (field, value) => {
    const newErrors = { ...errors };

    switch (field) {
      case "name":
        if (!value.trim()) {
          newErrors.name = "Description is required";
        } else {
          delete newErrors.name;
        }
        break;
      case "amount":
        if (!value || parseFloat(value) <= 0) {
          newErrors.amount = "Amount must be greater than 0";
        } else {
          const amount = parseFloat(value);
          if (isNaN(amount)) {
            newErrors.amount = "Amount must be a valid number";
          } else if (amount > 1000000) {
            newErrors.amount = "Amount cannot exceed 1,000,000";
          } else if (!Number.isInteger(amount * 100)) {
            newErrors.amount = "Amount cannot exceed 2 decimal places";
          } else {
            delete newErrors.amount;
          }
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFormChange = (field, value) => {
    const newForm = { ...editForm, [field]: value };
    setEditForm(newForm);
    validateField(field, value);
  };

  const validateForm = () => {
    let isValid = true;
    isValid = validateField("name", editForm.name) && isValid;
    isValid = validateField("amount", editForm.amount) && isValid;
    return isValid;
  };

  const handleEditClick = (expense, index) => {
    setEditingExpense(index);
    setOriginalExpense(expense);
    setEditForm({
      name: expense.name,
      amount: expense.amount,
      category: expense.category,
    });
    setErrors({});
    setIsDialogOpen(true);
  };

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setOriginalExpense(null);
    setErrors({});
  };

  const handleSave = () => {
    if (validateForm() && hasChanges()) {
      const amount = parseFloat(editForm.amount);
      onUpdateExpense(editingExpense, {
        ...editForm,
        amount,
      });
      handleClose();
      setShowToast(true);
      setTimeout(() => setShowToast(false), 3000);
    }
  };

  return (
    <>
      <div className="flex-1 space-y-2 overflow-y-auto max-h-[200px] sm:max-h-[200px] md:max-h-full overflow-x-hidden custom-scrollbar rounded-lg">
        {expenses[currentDateKey]?.map((expense, index) => {
          const CategoryIcon = CATEGORIES[expense.category].icon;

          return (
            <div
              key={index}
              className={`flex items-center justify-between px-2 py-1 rounded-lg bg-gray-800/80 backdrop-blur-sm border border-gray-700/50 shadow-md shadow-gray-950 group
              ${
                deletingIndex === index
                  ? "translate-x-full opacity-0 transition-all duration-200"
                  : ""
              }
              hover:bg-gray-700/80 hover:border-gray-600/50 transition-all duration-200
              ${
                isNewlyAdded && !deletingIndex
                  ? "animate-[fadeIn_0.2s_ease-in-out]"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="rounded-lg flex-shrink-0">
                  <CategoryIcon
                    size={28}
                    className={`${
                      CATEGORIES[expense.category].color
                    } group-hover:scale-110 transition-all duration-200`}
                  />
                </div>
                <div className="flex flex-col min-w-0">
                  <span
                    className="font-medium text-white text-sm truncate"
                    title={expense.name}
                  >
                    {truncateText(expense.name)}
                  </span>
                  <span className="text-[12px] text-gray-400">
                    {expense.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-green-400 font-medium text-md px-3 py-1 bg-green-400/10 rounded-md whitespace-nowrap">
                  ₱{formatNumber(expense.amount)}
                </span>
                <button
                  onClick={() => handleEditClick(expense, index)}
                  className="cursor-pointer px-2 py-1.5 text-yellow-500 hover:text-yellow-200 hover:bg-yellow-500/20 rounded-md transition-all duration-200"
                >
                  <PencilLine size={22} />
                </button>
                <button
                  onClick={() => handleDeleteExpense(index)}
                  className="cursor-pointer px-2 py-1.5 text-red-500 hover:text-red-300 hover:bg-red-500/20 rounded-md transition-all duration-200"
                >
                  <Trash size={22} />
                </button>
              </div>
            </div>
          );
        })}
        {!expenses[currentDateKey]?.length && (
          <div className="text-center text-gray-400 py-8 flex flex-col items-center">
            <ClipboardX size={50} className="opacity-50" />
            <span className="text-sm">No expenses recorded for this day:</span>
            <span className="text-sm">{dayName}</span>
            <span className="text-sm opacity-75 mt-2">
              Add an expense using the form above
            </span>
          </div>
        )}
      </div>

      <Transition appear show={isDialogOpen} as={Fragment}>
        <Dialog as="div" className="relative z-50" onClose={handleClose}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black/30 backdrop-blur-sm" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-auto max-w-md transform overflow-hidden rounded-xl bg-gray-900 p-4 text-left align-middle shadow-xl transition-all border border-gray-700/50">
                  <Dialog.Title
                    as="div"
                    className="flex justify-between items-center mb-4 border-b border-white"
                  >
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <PencilLine size={24} className="text-purple-300" />
                      Edit Expense
                    </h2>
                    <button
                      onClick={handleClose}
                      className="text-gray-400 hover:text-gray-200 p-2 transition-all duration-200 cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        maxLength={20}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        className={`w-full px-3 py-1 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400 transition-all duration-200 ${
                          errors.name
                            ? "border-red-500/50"
                            : "border-gray-600/50"
                        }`}
                        placeholder="Enter expense description"
                      />
                      {errors.name && (
                        <div className="mt-1 flex items-center gap-1 text-red-500">
                          <AlertCircle size={12} />
                          <p className="text-xs">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) =>
                          handleFormChange("amount", e.target.value)
                        }
                        className={`w-full px-3 py-1 bg-gray-800/50 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-400/50 text-white placeholder-gray-400 transition-all duration-200 ${
                          errors.amount
                            ? "border-red-500/50"
                            : "border-gray-600/50"
                        }`}
                        placeholder="Enter amount"
                      />
                      {errors.amount && (
                        <div className="mt-1 flex items-center gap-1 text-red-500">
                          <AlertCircle size={12} />
                          <p className="text-xs">{errors.amount}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-200 mb-2">
                        Category
                      </label>
                      <Select
                        options={categoryOptions}
                        value={categoryOptions.find(
                          (option) => option.value === editForm.category
                        )}
                        onChange={(selectedOption) =>
                          handleFormChange("category", selectedOption.value)
                        }
                        styles={{
                          ...colourStyles,
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }), // Ensures dropdown appears on top
                        }}
                        menuPortalTarget={document.body} // Render dropdown outside the modal
                        menuShouldScrollIntoView={false} // Prevents unwanted scrolling
                        isSearchable={false}
                        placeholder="Category"
                        getOptionLabel={(e) => (
                          <div className="flex items-center gap-2 text-sm">
                            {e.icon && (
                              <e.icon
                                size={16}
                                className={CATEGORIES[e.value].color}
                              />
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

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-700/50">
                      <button
                        onClick={handleClose}
                        className="px-4 py-2.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-700/50 rounded-lg hover:bg-gray-600/50 focus:outline-none focus:ring-2 focus:ring-gray-500/50 transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Ban size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={
                          !hasChanges() || Object.keys(errors).length > 0
                        }
                        className={`w-full md:w-auto mt-3 md:mt-0 inline-flex items-center justify-center gap-2 py-0.5 px-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white shadow-lg hover:shadow-purple-500/50 duration-200 ${
                          !hasChanges() || Object.keys(errors).length > 0
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2 px-3 py-2 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md hover:bg-transparent w-full">
                          <Save size={16} />
                          Save Changes
                        </span>
                      </button>
                    </div>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>

      {showToast && (
        <Toast
          message="Expense updated successfully"
          onClose={() => setShowToast(false)}
        />
      )}
    </>
  );
};

export default ExpenseList;
