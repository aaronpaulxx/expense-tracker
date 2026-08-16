import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import {
  Plus,
  Save,
  AlertCircle,
  X,
  ChevronsUpDown,
  Check,
} from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { CATEGORIES } from "../constants/categories";

const categoryOptions = Object.keys(CATEGORIES).map((category) => ({
  value: category,
  label: category,
  icon: CATEGORIES[category].icon,
}));

const ExpenseForm = ({
  newExpense,
  setNewExpense,
  errors,
  onSubmit,
  isEditing,
  onCancelEdit,
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

  const handleSubmit = () => {
    onSubmit();
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Enter") {
        onSubmit();
      }
      // Escape cancels an in-progress edit, same as clicking Cancel.
      if (event.key === "Escape" && isEditing) {
        onCancelEdit();
      }
    };
    document.addEventListener("keydown", handleKeyDown);

    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSubmit, isEditing, onCancelEdit]);

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
            <Listbox
              value={newExpense.category}
              onChange={(value) =>
                setNewExpense((prev) => ({ ...prev, category: value }))
              }
            >
              {({ open }) => {
                const selected = categoryOptions.find(
                  (option) => option.value === newExpense.category,
                );
                return (
                  <div className="relative">
                    <ListboxButton className="shadow-md shadow-stone-950 w-full h-[30px] flex items-center justify-between gap-2 px-2 bg-stone-800 border border-stone-500 rounded-lg text-sm text-white cursor-pointer transition-colors duration-200 hover:bg-stone-700 focus:outline-none">
                      <span className="flex items-center gap-2 truncate">
                        {selected?.icon && (
                          <selected.icon
                            size={16}
                            className={CATEGORIES[selected.value].color}
                          />
                        )}
                        {selected?.label || (
                          <span className="text-stone-400">Category</span>
                        )}
                      </span>
                      <ChevronsUpDown
                        size={16}
                        className={`shrink-0 transition-colors duration-200 ${
                          open ? "text-green-500" : "text-stone-400"
                        }`}
                      />
                    </ListboxButton>
                    <ListboxOptions
                      anchor="bottom start"
                      transition
                      className="w-[var(--button-width)] mt-1 bg-stone-800 border border-stone-700 rounded-lg shadow-lg z-50 focus:outline-none p-1 origin-top transition duration-150 ease-out data-[closed]:opacity-0 data-[closed]:scale-95"
                    >
                      {categoryOptions.map((option) => (
                        <ListboxOption
                          key={option.value}
                          value={option.value}
                          className="group flex items-center gap-2 px-2 py-1.5 text-sm text-white cursor-pointer rounded-md data-[focus]:bg-stone-700 data-[selected]:bg-gradient-to-r data-[selected]:from-green-800 data-[selected]:to-teal-800"
                        >
                          <option.icon
                            size={16}
                            className={CATEGORIES[option.value].color}
                          />
                          {option.label}
                          <Check
                            size={16}
                            className="ml-auto hidden text-green-400 group-data-[selected]:block"
                          />
                        </ListboxOption>
                      ))}
                    </ListboxOptions>
                  </div>
                );
              }}
            </Listbox>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="animated-border-wrapper flex-1">
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
              {isEditing ? (
                <Save
                  size={23}
                  className="transition-transform duration-200 group-hover:scale-110"
                />
              ) : (
                <Plus
                  size={23}
                  className="transition-transform duration-200 group-hover:rotate-90 group-hover:scale-110"
                />
              )}
              {isEditing ? "Update Expense" : "Add Expense"}
            </button>
          </div>
          {isEditing && (
            <button
              onClick={onCancelEdit}
              className="cursor-pointer flex items-center gap-2 px-5 rounded-lg border border-stone-500 text-stone-300 text-sm font-medium hover:bg-stone-700 hover:text-white transition-colors duration-200"
            >
              <X size={18} />
              Cancel
            </button>
          )}
        </div>
      </div>
    </>
  );
};

ExpenseForm.propTypes = {
  newExpense: PropTypes.shape({
    name: PropTypes.string,
    amount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    category: PropTypes.string,
  }).isRequired,
  setNewExpense: PropTypes.func.isRequired,
  errors: PropTypes.shape({
    name: PropTypes.string,
    amount: PropTypes.string,
  }).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isEditing: PropTypes.bool,
  onCancelEdit: PropTypes.func,
};

export default ExpenseForm;
