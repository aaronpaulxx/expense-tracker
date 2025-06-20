import React, { useState, useEffect, useRef } from "react";
import Select from "react-select";
import {
  Trash,
  PencilLine,
  X,
  Ban,
  Check,
  Save,
  AlertCircle,
  MoreVertical,
  Copy,
  ClipboardX,
} from "lucide-react";
import { CATEGORIES } from "../constants/categories";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { Dialog, Transition } from "@headlessui/react";
import { Fragment } from "react";

const Toast = ({ message, onClose }) => {
  const [isClosing, setIsClosing] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Set a timer to start the closing animation after a certain duration
    const timer = setTimeout(() => setIsClosing(true), 4700);
  });

  const handleClose = () => {
    setIsClosing(true);
  };

  const handleAnimationEnd = (e) => {
    if (e.animationName === "slideOut") {
      setIsVisible(false);
      onClose(); // Notify parent to unmount after animation
    }
  };
  return (
    // Only render if isVisible is true
    isVisible && (
      <div
        className={`fixed bottom-4 right-4 z-50 ${
          isClosing
            ? "animate-[slideOut_0.3s_ease-in_forwards]"
            : "animate-[slideIn_0.2s_ease-out]"
        }`}
        onAnimationEnd={handleAnimationEnd}
      >
        <div className="bg-stone-900 border border-stone-600 text-sm text-white p-2 rounded-lg shadow-lg flex items-center gap-2">
          <Check size={28} className="w-6 h-6 text-green-500" />
          <span>{message}</span>
          <button
            onClick={handleClose}
            className="cursor-pointer text-stone-400 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>
      </div>
    )
  );
};

const DeleteConfirmationModal = ({
  isOpen,
  onClose,
  onConfirm,
  date,
  expenseCount,
}) => {
  const dayName = new Intl.DateTimeFormat("en-US", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);

  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-xl bg-stone-900 p-6 text-left align-middle shadow-xl transition-all border border-stone-500">
                <Dialog.Title
                  as="h3"
                  className="text-xl font-semibold leading-6 text-white border-b border-stone-500 pb-3 mb-4 flex items-center gap-2"
                >
                  <AlertCircle size={35} className="text-red-500" /> Confirm
                  Deletion
                </Dialog.Title>
                <div className="mt-2">
                  <p className="text-sm text-stone-300">
                    Are you sure you want to delete all{" "}
                    <span className="font-semibold text-red-500 text-lg">
                      {expenseCount}
                    </span>{" "}
                    expenses for{" "}
                    <span className="font-semibold text-stone-200">
                      {dayName}
                    </span>
                    ? This action cannot be undone.
                  </p>
                </div>

                <div className="mt-4 flex justify-end gap-3">
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-stone-700 px-4 py-2 text-sm font-normal text-stone-200 hover:bg-stone-500 focus:outline-none focus-visible:ring-2 focus-visible:ring-stone-500 focus-visible:ring-offset-2 transition-colors duration-200"
                    onClick={onClose}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="cursor-pointer inline-flex justify-center rounded-full border border-transparent bg-red-700 px-4 py-2 text-sm font-normal text-white hover:bg-red-500 active:bg-red-800 transition-colors duration-200"
                    onClick={onConfirm}
                  >
                    Confirm
                  </button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
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
  setExpenses,
  onQuickFill,
}) => {
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
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
  const [showDeleteAllToast, setShowDeleteAllToast] = useState(null);

  // --- State for the floating action menu ---
  const [openActionMenuIndex, setOpenActionMenuIndex] = useState(null);
  const [activeExpense, setActiveExpense] = useState(null);
  const [menuPosition, setMenuPosition] = useState(null);
  const menuRef = useRef(null);
  // ---

  const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
    value: category,
    label: category,
    icon: CATEGORIES[category].icon,
  }));

  const colourStyles = {
    control: (styles, { isFocused }) => ({
      ...styles,
      backgroundColor: "#1c1917", // Example: yellow on focus
      borderColor: "#78716c",
      borderRadius: "9px",
      borderWidth: "1px",
      "&:hover": { backgroundColor: "#292524" },
      boxShadow: "none",
      transition: "all 200ms",
      minHeight: "30px",
      height: "33px",
    }),
    valueContainer: (styles) => ({ ...styles, padding: "0px 8px" }),
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
      "&:hover": { color: "#22c55e" },
    }),
    menu: (styles) => ({
      ...styles,
      backgroundColor: "#292524",
      border: "1px solid #374151",
      borderRadius: "8px",
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
    placeholder: (styles) => ({ ...styles, color: "#9ca3af", margin: "0" }),
  };

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

  const closeActionMenu = () => {
    setOpenActionMenuIndex(null);
    setMenuPosition(null);
    setActiveExpense(null);
  };

  const toggleActionMenu = (index, expense, event) => {
    event.stopPropagation();
    if (openActionMenuIndex === index) {
      closeActionMenu();
    } else {
      const buttonRect = event.currentTarget.getBoundingClientRect();
      setOpenActionMenuIndex(index);
      setActiveExpense(expense);
      // Position the menu based on the button's location
      setMenuPosition({
        top: buttonRect.bottom + window.scrollY + 4, // Add 4px offset from the button
        right: window.innerWidth - buttonRect.right, // Align right edges
      });
    }
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
    closeActionMenu();
  };

  const handleQuickFillClick = (expense) => {
    if (onQuickFill) {
      onQuickFill(expense);
    }
    closeActionMenu();
  };

  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Close if the menu is open and the click is not on the menu itself
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        closeActionMenu();
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []); // Empty dependency array ensures this runs only once

  const handleClose = () => {
    setIsDialogOpen(false);
    setEditingExpense(null);
    setOriginalExpense(null);
    setErrors({});
  };

  const handleSave = () => {
    if (validateForm() && hasChanges()) {
      const amount = parseFloat(editForm.amount);
      onUpdateExpense(editingExpense, { ...editForm, amount });
      handleClose(); // Close the dialog first
      setShowToast(true);
      setTimeout(() => setShowToast(false), 5000);
    }
  };

  const handleDeleteAllToday = () => {
    setIsDeleteConfirmOpen(true);
  };

  const handleConfirmDeleteAll = () => {
    const deletedCount = expensesWithIds.length;
    setExpenses((prev) => {
      const updatedExpenses = { ...prev };
      delete updatedExpenses[currentDateKey];
      return updatedExpenses;
    });
    setIsDeleteConfirmOpen(false);
    const toastDate = new Date(date); // Ensure date is a Date object
    setShowDeleteAllToast({ count: deletedCount, date: toastDate });
    setTimeout(() => setShowDeleteAllToast(false), 5000);
  };

  const handleCancelDeleteAll = () => {
    setIsDeleteConfirmOpen(false);
  };

  const handleDragEnd = (result) => {
    // dropped outside the list
    if (!result.destination) {
      return;
    }

    const items = Array.from(expenses[currentDateKey]);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setExpenses((prev) => ({
      ...prev,
      [currentDateKey]: items,
    }));
  };

  // Get current expenses and ensure they all have valid IDs
  const currentExpenses = expenses[currentDateKey] || [];
  const expensesWithIds = currentExpenses.map((expense, index) => ({
    ...expense,
    // Ensure each expense has a unique ID - fallback to index if ID is missing
    id: expense.id || `expense-${currentDateKey}-${index}`,
  }));


  

  return (
    <>
      <div className="ml-2 mr-2">
        {expensesWithIds.length >= 0 && (
          <div className="flex justify-between items-center mb-3">
            <label className="text-lg border-l-4 pl-2 border-stone-300 font-semibold text-stone-100">
              Today&apos;s Expenses
            </label>
            <button
              disabled={expensesWithIds.length === 0}
              onClick={handleDeleteAllToday}
              className={`delete-button-small ${expensesWithIds.length === 0 ? "disabled" : ""}`}
            >
              <svg viewBox="0 0 448 512" className="svgIcon">
                <path d="M135.2 17.7L128 32H32C14.3 32 0 46.3 0 64S14.3 96 32 96H416c17.7 0 32-14.3 32-32s-14.3-32-32-32H320l-7.2-14.3C307.4 6.8 296.3 0 284.2 0H163.8c-12.1 0-23.2 6.8-28.6 17.7zM416 128H32L53.2 467c1.6 25.3 22.6 45 47.9 45H346.9c25.3 0 46.3-19.7 47.9-45L416 128z" />
              </svg>
            </button>
          </div>
        )}
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="expenses">
            {(provided, snapshot) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className={`flex-1 p-2 space-y-3 overflow-y-auto min-h-[360px] max-h-[360px] sm:max-h-[360px] overflow-x-hidden custom-scrollbar rounded-xl border transition-colors duration-200 ${
                  snapshot.isDraggingOver
                    ? "border-stone-400 bg-stone-950"
                    : "border-stone-500 bg-stone-950"
                }`}
              >
                {expensesWithIds.map((expense, index) => {
                  const CategoryIcon = CATEGORIES[expense.category]?.icon;
                  const uniqueId = String(expense.id);

                  return (
                    <Draggable
                      key={uniqueId}
                      draggableId={uniqueId}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          className={`relative flex items-center justify-between p-2 rounded-xl bg-gradient-to-r from-stone-800 to-stone-800/95 hover:from-stone-700 hover:to-stone-700/95 backdrop-blur-sm shadow-lg border border-stone-700/50 group cursor-grab overflow-hidden ${
                            deletingIndex === index
                              ? "animate-[slideOut_0.4s_cubic-bezier(0.68,-0.55,0.27,1.55)_forwards]"
                              : ""
                          } ${
                            newlyAddedId === expense.id
                              ? "animate-[fadeIn_0.5s_cubic-bezier(0.26,0.53,0.74,1.48)] scale-100 opacity-100"
                              : ""
                          } ${
                            snapshot.isDragging
                              ? "ring-2 ring-stone-300 shadow-2xl"
                              : ""
                          }`}
                        >
                          {/* Category color blob */}
                          <div
                            className={`absolute -left-3 top-0 w-16 h-16 rounded-full blur-lg opacity-70 transition-opacity duration-300 group-hover:opacity-100 -z-1 ${
                              expense.category === "Transport"
                                ? "bg-yellow-400"
                                : expense.category === "Shopping"
                                  ? "bg-blue-400"
                                  : expense.category === "Food"
                                    ? "bg-green-400"
                                    : expense.category === "Bills"
                                      ? "bg-purple-400"
                                      : expense.category === "Credit"
                                        ? "bg-red-400"
                                        : expense.category === "Other"
                                        ? "bg-gray-300"
                                        : "bg-gray-400"
                            }`}
                          />
                          <div
                            className="flex items-center gap-5 min-w-0 flex-1"
                            {...provided.dragHandleProps}
                          >
                            <div className="rounded-xl p-2 bg-stone-950/90  flex-shrink-0 group-hover:scale-110 transition-transform duration-200">
                              {CategoryIcon && (
                                <CategoryIcon
                                  size={24}
                                  className={`${CATEGORIES[expense.category]?.color || "text-gray-400"} transition-colors duration-200`}
                                />
                              )}
                            </div>
                            <div className="flex flex-col min-w-0 flex-1">
                              <span
                                className="font-medium text-white text-sm truncate group-hover:text-stone-100 transition-colors duration-200"
                                title={expense.name}
                              >
                                {truncateText(expense.name)}
                              </span>
                              <span className="text-xs text-stone-400 capitalize">
                                {expense.category}
                              </span>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0">
                            <div className="text-right">
                              <div className="inline-flex items-baseline gap-1 text-emerald-300 font-semibold text-md px-3 py-1.5 bg-emerald-900/30 rounded-full shadow-sm whitespace-nowrap border border-emerald-800/30">
                                <span className="text-xs opacity-80">₱</span>
                                <span>{formatNumber(expense.amount)}</span>
                              </div>
                            </div>

                            <button
                              onClick={(e) =>
                                toggleActionMenu(index, expense, e)
                              }
                              className={`relative p-2 rounded-lg transition-all duration-200 ${
                                openActionMenuIndex === index
                                  ? "bg-stone-600 text-stone-100 scale-105"
                                  : "text-stone-400 hover:bg-stone-600 hover:text-stone-100 hover:scale-105"
                              }`}
                              aria-label="More options"
                            >
                              <MoreVertical size={18} className="cursor-pointer"/>
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  );
                })}
                {provided.placeholder}

                {!expensesWithIds.length && (
                  <div className="text-center text-stone-500 py-20 flex flex-col items-center">
                    <div className="p-4 rounded-full bg-stone-800/50 mb-4">
                      <ClipboardX size={48} className="opacity-60" />
                    </div>
                    <h3 className="text-lg font-medium mb-2">
                      No expenses yet
                    </h3>
                    <p className="text-sm opacity-80">
                      Start tracking your daily expenses
                    </p>
                  </div>
                )}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      </div>

      {/* --- This is the single, floating Action Menu --- */}
      {openActionMenuIndex !== null && menuPosition && (
        <div
          ref={menuRef} // Keep menuRef here for outside click detection
          style={{
            position: "fixed",
            top: `${menuPosition.top}px`,
            right: `${menuPosition.right}px`,
          }}
          className="z-50 w-36 origin-top-right rounded-md bg-stone-800 shadow-lg ring-1 ring-stone-500 focus:outline-none animate-[fadeIn_0.1s_ease-out]"
        >
          <div className="py-1">
            <button
              onClick={() => handleQuickFillClick(activeExpense)}
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <Copy size={18} className="mr-2 text-blue-400" /> Quick Fill
            </button>
            <button
              onClick={() =>
                handleEditClick(activeExpense, openActionMenuIndex)
              }
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <PencilLine size={18} className="mr-2 text-yellow-400" /> Edit
            </button>
            <button
              onClick={() => {
                handleDeleteExpense(openActionMenuIndex);
                closeActionMenu();
              }}
              className="cursor-pointer flex items-center w-full px-4 py-2 text-sm text-left text-stone-300 hover:bg-stone-700 hover:text-white"
            >
              <Trash size={18} className="mr-2 text-red-400" /> Delete
            </button>
          </div>
        </div>
      )}

      {/* Edit Expense Dialog Modal */}
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
                <Dialog.Panel className="w-auto max-w-md transform overflow-hidden rounded-xl bg-stone-900 p-4 text-left align-middle shadow-xl transition-all border border-stone-500">
                  <Dialog.Title
                    as="div"
                    className="flex justify-between items-center mb-4 border-b border-stone-400"
                  >
                    <h2 className="text-xl font-semibold text-white flex items-center gap-2">
                      <PencilLine size={24} className="text-stone-300" /> Edit
                      Expense
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
                        Description
                      </label>
                      <input
                        type="text"
                        value={editForm.name}
                        maxLength={20}
                        onChange={(e) =>
                          handleFormChange("name", e.target.value)
                        }
                        className={`w-full px-2 py-1 border outline-none transition-all duration-200 focus:bg-stone-950 ${errors.name ? "border-red-400" : "border-stone-500"} rounded-lg text-white text-sm bg-stone-900`}
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
                        className={`w-full px-2 py-1 border outline-none transition-all duration-200 focus:bg-stone-950 ${errors.amount ? "border-red-400" : "border-stone-500"} rounded-lg text-white text-sm bg-stone-900`}
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
                          menuPortal: (base) => ({ ...base, zIndex: 9999 }),
                        }}
                        menuPortalTarget={document.body}
                        menuShouldScrollIntoView={false}
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
                        className="w-auto h-9 px-5 text-sm font-medium text-white bg-stone-600 hover:bg-stone-500 active:bg-red-800 rounded-full transition-colors duration-200 flex items-center gap-2 cursor-pointer"
                      >
                        Cancel
                      </button>

                      <button
                        onClick={handleSave}
                        disabled={
                          !hasChanges() || Object.keys(errors).length > 0
                        }
                        className={`w-auto inline-flex items-center justify-center gap-2 px-5 py-1 text-sm font-medium text-white rounded-full shadow-sm transition-colors duration-200 ${
                          !hasChanges() || Object.keys(errors).length > 0
                            ? "opacity-50 bg-stone-600"
                            : "bg-green-700 hover:bg-green-600 active:bg-green-800 cursor-pointer"
                        }`}
                      >
                        <Save size={16} className="text-white" />
                        Save Changes
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
      {showDeleteAllToast && (
        <Toast
          message={
            <>
              <span className="font-semibold text-red-500 text-lg">
                {showDeleteAllToast.count}
              </span>{" "}
              expense{showDeleteAllToast.count !== 1 ? "s" : ""} for{" "}
              <span className="font-semibold text-stone-200">
                {new Intl.DateTimeFormat("en-US", {
                  day: "numeric",
                  month: "long",
                }).format(showDeleteAllToast.date)}
              </span>{" "}
              deleted successfully
            </>
          }
          onClose={() => setShowDeleteAllToast(false)}
        />
      )}

      <DeleteConfirmationModal
        isOpen={isDeleteConfirmOpen}
        onClose={handleCancelDeleteAll}
        onConfirm={handleConfirmDeleteAll}
        date={date}
        expenseCount={expensesWithIds.length}
      />
    </>
  );
};

export default ExpenseList;
