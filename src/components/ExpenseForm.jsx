import { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { Plus, Save, ChevronsUpDown, Check } from "lucide-react";
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from "@headlessui/react";
import { CATEGORIES } from "../constants/categories";
import { notifyError } from "../lib/toast";

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
  const [touched, setTouched] = useState({ name: false, amount: false });
  const containerRef = useRef(null);
  const nameInputRef = useRef(null);

  useEffect(() => {
    if (Object.keys(errors).length > 0) {
      // Combine all error messages, using line breaks instead of "|"
      const errorMessages = Object.values(errors).filter(Boolean).join("\n");
      notifyError(
        <span className="whitespace-pre-wrap">{errorMessages}</span>,
        {
          id: "expense-form-error",
        },
      );
    }

    setTouched({ name: false, amount: false });
  }, [errors]);

  const handleSubmit = () => {
    onSubmit();
  };
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (!containerRef.current?.contains(document.activeElement)) return;

      if (event.repeat) return;

      const target = event.target;

      if (
        target.tagName === "BUTTON" ||
        target.closest('[role="listbox"], [role="option"]')
      ) {
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        onSubmit();
      }
      if (event.key === "Escape" && isEditing) {
        document.activeElement?.blur();
        onCancelEdit();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onSubmit, isEditing, onCancelEdit]);

  useEffect(() => {
    if (isEditing) {
      nameInputRef.current?.focus();
    }
  }, [isEditing]);

  return (
    <div ref={containerRef} className="space-y-3 p-2">
      <div>
        <input
          ref={nameInputRef}
          value={newExpense.name}
          onChange={(e) =>
            setNewExpense((prev) => ({ ...prev, name: e.target.value }))
          }
          onFocus={() => setTouched((prev) => ({ ...prev, name: true }))}
          maxLength={35}
          className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
            errors.name && !touched.name
              ? "border-destructive focus:border-emerald-400"
              : "border-border border focus:border-emerald-400"
          } rounded-lg text-foreground text-sm`}
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
            onFocus={() => setTouched((prev) => ({ ...prev, amount: true }))}
            className={`w-full px-2 py-1 border outline-none transition-all duration-200 shadow-md shadow-stone-950 ${
              errors.amount && !touched.amount
                ? "border-destructive focus:border-emerald-400"
                : "border-border border focus:border-emerald-400"
            } rounded-lg text-foreground text-sm`}
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
                  <ListboxButton className="shadow-md shadow-stone-950 w-full h-7.5 flex items-center justify-between gap-2 px-2 border border-border rounded-lg text-sm text-foreground cursor-pointer transition-colors duration-200 hover:bg-popover data-focus:bg-popover focus:outline-none data-focus:border-emerald-400 data-open:border-emerald-400">
                    <span className="flex items-center gap-2 truncate">
                      {selected?.icon && (
                        <selected.icon
                          size={16}
                          className={CATEGORIES[selected.value].color}
                        />
                      )}
                      {selected?.label || (
                        <span className="text-muted-foreground">
                          Category
                        </span>
                      )}
                    </span>
                    <ChevronsUpDown
                      size={16}
                      className={`shrink-0 transition-colors duration-200 ${
                        open ? "text-emerald-500" : "text-muted-foreground"
                      }`}
                    />
                  </ListboxButton>
                  <ListboxOptions
                    anchor="bottom start"
                    transition
                    className="w-(--button-width) mt-1 bg-popover border border-border rounded-lg shadow-lg z-50 focus:outline-none px-1 origin-top transition duration-150 ease-out data-closed:opacity-0 data-closed:scale-95"
                  >
                    {categoryOptions.map((option) => (
                      <ListboxOption
                        key={option.value}
                        value={option.value}
                        className="group flex items-center mb-1 mt-1 gap-2 px-2 py-1.5 text-sm text-muted-foreground hover:text-foreground data-selected:text-foreground cursor-pointer rounded-md data-focus:bg-muted data-selected:bg-linear-to-r data-selected:from-emerald-800 data-selected:to-teal-800"
                      >
                        <option.icon
                          size={16}
                          className={CATEGORIES[option.value].color}
                        />
                        {option.label}
                        <Check
                          size={16}
                          className="ml-auto hidden text-green-400 group-data-selected:block"
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

                          hover:before:[box-shadow:20px_20px_20px_30px_#1c74af,-15px_-15px_15px_25px_#ec4899] 
                          active:before:[box-shadow:10px_10px_20px_20px_#f97316,-10px_-10px_20px_20px_#fb923c] 
                          before:[box-shadow:-10px_-10px_10px_20px_#ec4899] 

                          duration-500 before:duration-500 hover:duration-500 
                          hover:after:-right-8 
                          hover:before:right-12 hover:before:-bottom-8 
                          hover:before:blur origin-left 
                          hover:decoration-2 
                          hover:text-stone-50 active:text-orange-300

                          relative bg-background h-auto w-full border-0 text-left p-3 
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
            className="cursor-pointer px-5 rounded-lg border border-border text-muted-foreground text-md font-medium hover:bg-secondary/80 hover:text-foreground transition-colors duration-200"
          >
            Cancel
          </button>
        )}
      </div>
    </div>
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