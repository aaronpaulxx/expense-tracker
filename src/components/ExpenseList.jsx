import React, { useState, useEffect } from "react";
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

const Toast = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300); // Match this with the CSS animation duration
  };

  return (
    <div
      className={`fixed bottom-4 right-4 z-50 ${
        isClosing
          ? "animate-[slideOut_0.3s_ease-in_forwards]"
          : "animate-[slideIn_0.2s_ease-out]"
      }`}
    >
      <div className="bg-stone-900 border-1 text-sm border-stone-600 text-white p-2 rounded-lg shadow-lg flex items-center gap-2">
        <Check size={28} className="w-6 h-6 text-green-500" />
        <span>{message}</span>
        <button onClick={handleClose} className="cursor-pointer">
          <X size={18} />
        </button>
      </div>
    </div>
  );
};

const formatNumber = (num) =>
  num.toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const ExpenseList = ({
  expenses,
  currentDateKey,
  newlyAddedId,
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
      backgroundColor: "#1c1917", // stone-800
      borderColor: "#78716c", // Same border color regardless of focus state
      borderRadius: "9px", // Add border-radius
      borderWidth: "1px", // Same border width regardless of focus state
      "&:hover": {
        backgroundColor: "#292524", // stone-800
      },
      boxShadow: "none", // Removed focus ring shadow
      transition: "all 200ms",
      minHeight: "30px",
      height: "33px",
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
      color: isFocused ? "#14b8a680" : "#9ca3af",
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
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  return (
    <>
      <div className="ml-2 mr-2 flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px] max-h-[200px] sm:max-h-[200px] overflow-x-hidden custom-scrollbar rounded-xl border-1 border-stone-500">
        {expenses[currentDateKey]?.map((expense, index) => {
          const CategoryIcon = CATEGORIES[expense.category].icon;

          return (
            <div
              key={expense.id} // Use the unique ID as the key instead of index
              className={`flex items-center justify-between px-2 py-1 rounded-lg bg-stone-800 backdrop-blur-sm shadow-md shadow-stone-950 group
            ${
              deletingIndex === index
                ? "animate-[slideOut_0.4s_cubic-bezier(0.68,-0.55,0.27,1.55)_forwards]"
                : ""
            }
            hover:bg-stone-700/80 hover:border-stone-300 hover:border-1.5 transition-all duration-200
            ${
              newlyAddedId === expense.id
                ? "animate-[fadeIn_0.5s_cubic-bezier(0.26,0.53,0.74,1.48)] scale-100 opacity-100"
                : ""
            }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1 ">
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
                  <span className="text-[12px] text-stone-400">
                    {expense.category}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <span className="text-green-400 font-medium text-md px-3 py-1 bg-green-400/10 rounded-md whitespace-nowrap ">
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
          <div className="text-center text-stone-500 py-8 flex flex-col items-center">
            <ClipboardX size={40} className="opacity-70 mb-5" />
            <span className="text-sm">No expenses recorded for this day.</span>
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
                <Dialog.Panel className="w-auto max-w-md transform overflow-hidden rounded-xl bg-stone-900 p-4 text-left align-middle shadow-xl transition-all border-stone-500 border-1">
                  <Dialog.Title
                    as="div"
                    className="flex justify-between items-center mb-4 border-b border-white"
                  >
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                      <PencilLine size={24} className="text-stone-300" />
                      Edit Expense
                    </h2>
                    <button
                      onClick={handleClose}
                      className="text-stone-400 hover:text-stone-200 p-2 transition-all duration-200 cursor-pointer"
                    >
                      <X size={24} />
                    </button>
                  </Dialog.Title>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-stone-200 mb-2">
                        Name
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        maxLength={20}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
                          errors.name
                            ? "border-red-400"
                            : "border-stone-500 border-1"
                        } rounded-lg text-white text-sm`}
                        placeholder="Enter expense description"
                      />
                      {errors.name && (
                        <div className="mt-1 flex items-center gap-1 text-red-400">
                          <AlertCircle size={15} />
                          <p className="text-xs">{errors.name}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-200 mb-2">
                        Amount
                      </label>
                      <input
                        type="number"
                        value={editForm.amount}
                        onChange={(e) =>
                          handleFormChange("amount", e.target.value)
                        }
                        className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
                          errors.amount
                            ? "border-red-400"
                            : "border-stone-500 border-1"
                        } rounded-lg text-white text-sm`}
                        placeholder="Enter amount"
                      />
                      {errors.amount && (
                        <div className="mt-1 flex items-center gap-1 text-red-400">
                          <AlertCircle size={15} />
                          <p className="text-xs">{errors.amount}</p>
                        </div>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-stone-200 mb-2">
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

                    <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-stone-500">
                      <button
                        onClick={handleClose}
                        className="h-10 px-4 text-sm font-medium text-stone-300 hover:text-stone-200 bg-stone-700 hover:bg-red-500 rounded-lg focus:outline-none  transition-all duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        <Ban size={16} />
                        Cancel
                      </button>
                      <button
                        onClick={handleSave}
                        disabled={
                          !hasChanges() || Object.keys(errors).length > 0
                        }
                        className={`w-full  inline-flex items-center justify-center gap-2 py-0.5 px-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-teal-600 to-green-500 group-hover:from-teal-600 group-hover:to-green-500 hover:text-white dark:text-white shadow-lg hover:shadow-teal-500/50 duration-200 ${
                          !hasChanges() || Object.keys(errors).length > 0
                            ? "opacity-50 cursor-not-allowed"
                            : "cursor-pointer"
                        }`}
                      >
                        <span className="flex items-center justify-center gap-2 px-3 py-2 transition-all ease-in duration-75 bg-white dark:bg-stone-900 rounded-md group-hover:bg-transparent w-full">
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
