import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { Settings as SettingsIcon, X } from "lucide-react";
import Settings from "./Settings";

const Header = ({
  budgets,
  setBudgets,
  clearRecords,
  expenses,
  setExpenses,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [isHovered, setIsHovered] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

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
    }, 300); // Match this with the CSS animation duration
  };

  return (
    <>
      <div
        className="py-2 border-b border-stone-800 flex justify-between items-center px-5 bg-[linear-gradient(45deg,#1f1f1f_25%,#10B98180_50%,#14B8A6_75%,#171717_100%)]
"
      >
        <div
          className="flex flex-col cursor-pointer"
          onClick={() => window.location.reload()}
        >
          <h1 className="text-[20px] font-bold titleh1">
            <span className="bg-linear-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </h1>
        </div>

        <div className="relative flex items-center">
          <div
            className={`absolute right-full mr-2 overflow-hidden transition-all duration-300 ease-in-out ${
              isHovered ? "w-12 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="text-white whitespace-nowrap text-xs">
              Settings
            </span>
          </div>
          <button
            className="text-white hover:text-white transition-transform duration-300 hover:rotate-180 cursor-pointer"
            onClick={() => setIsOpen(true)}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            <SettingsIcon size={30} />
          </button>
        </div>
      </div>

      <Settings
        isOpen={isOpen}
        setIsOpen={setIsOpen}
        budgets={budgets}
        setBudgets={setBudgets}
        clearRecords={clearRecords}
        expenses={expenses}
        setNotification={setNotification}
        setExpenses={setExpenses}
      />

      {notification && (
        <div
          className={`fixed bottom-4 right-5 bg-stone-900 text-white p-2 rounded-lg text-sm border border-stone-600 shadow-lg flex items-center gap-4 z-1000 ${
            isClosing
              ? "animate-[slideOut_0.3s_ease-in_forwards]"
              : "animate-[slideIn_0.2s_ease-out]"
          }`}
        >
          <div className="flex-1">{notification}</div>
          <button
            onClick={closeNotification}
            className="text-stone-400 hover:text-white cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
};

Header.propTypes = {
  budgets: PropTypes.object,
  setBudgets: PropTypes.func,
  clearRecords: PropTypes.func.isRequired,
  expenses: PropTypes.object,
  setExpenses: PropTypes.func.isRequired,
};

export default Header;
