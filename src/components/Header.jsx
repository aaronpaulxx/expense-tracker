import React, { useState, useEffect } from "react";
import { Settings as SettingsIcon, X } from "lucide-react";
import Settings from "./Settings";

const Header = ({ budgets, setBudgets, clearRecords, expenses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [notification, setNotification] = useState("");
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(""), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <>
      <div className="py-2 border-b border-gray-800 flex justify-between items-center px-5 bg-[linear-gradient(45deg,#111827_25%,#3b82f6_50%,#8b5cf6_75%,#171717_100%)]">
        <div
          className="flex flex-col cursor-pointer leading-tight -mt-1"
          onClick={() => window.location.reload()}
        >
          <h1 className="text-3xl font-bold titleh1">
            <span className="bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
              Expense Tracker
            </span>
          </h1>
          <p className="text-xs text-white self-end -mt-1">
            by Aaron Paul Z.R.
          </p>
        </div>

        <div className="relative flex items-center">
          <div
            className={`absolute right-full mr-2 overflow-hidden transition-all duration-300 ease-in-out ${
              isHovered ? "w-20 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="text-purple-100 whitespace-nowrap">Settings</span>
          </div>
          <button
            className="text-purple-100 hover:text-white transition-transform duration-300 hover:rotate-180 cursor-pointer"
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
      />

      {notification && (
        <div className="fixed bottom-4 right-4 bg-gray-700 text-white p-4 rounded-lg shadow-lg flex items-center gap-4 z-1000">
          <div className="flex-1">{notification}</div>
          <button
            onClick={() => setNotification("")}
            className="text-white hover:text-gray-300 cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>
      )}
    </>
  );
};

export default Header;
