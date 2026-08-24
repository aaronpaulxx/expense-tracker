import { useState } from "react";
import PropTypes from "prop-types";
import { Settings as SettingsIcon } from "lucide-react";
import Settings from "./Settings";

const Header = ({ clearRecords, expenses, setExpenses }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  return (
    <>
      <div
        className="py-2 border-b border-border flex justify-between items-center px-5 bg-[linear-gradient(45deg,#1f1f1f_25%,#10B98180_50%,#14B8A6_75%,#171717_100%)]
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
            className={`absolute right-full mr-0 overflow-hidden transition-all duration-300 ease-in-out ${
              isHovered ? "w-12 opacity-100" : "w-0 opacity-0"
            }`}
          >
            <span className="text-foreground whitespace-nowrap text-xs">
              Settings
            </span>
          </div>
          <button
            className="text-foreground hover:text-foreground transition-transform duration-300 hover:rotate-180 cursor-pointer"
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
        clearRecords={clearRecords}
        expenses={expenses}
        setExpenses={setExpenses}
      />
    </>
  );
};

Header.propTypes = {
  clearRecords: PropTypes.func.isRequired,
  expenses: PropTypes.object,
  setExpenses: PropTypes.func.isRequired,
};

export default Header;