import React, { useState, useEffect, Fragment } from "react";
import {
  Settings as SettingsIcon,
  Edit,
  Check,
  X,
  RotateCcw,
  Trash,
  Ban,
  CircleX,
  Database,
  WalletMinimal,
  Trash2,
  MonitorDown,
  FileDown,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import * as XLSX from "xlsx";

const Settings = ({
  isOpen,
  setIsOpen,
  budgets,
  setBudgets,
  clearRecords,
  expenses,
  setNotification,
}) => {
  const [tempBudgets, setTempBudgets] = useState({ ...budgets });
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });

  useEffect(() => {
    if (isOpen) {
      setTempBudgets({ ...budgets });
      setIsEditingBudget(false);
      setHasChanges(false);
      updateStorageInfo();
    } else {
      setShowConfirmDelete(false);
    }
  }, [isOpen, budgets]);

  const updateStorageInfo = () => {
    let used = 0;
    const estimatedTotal = 5 * 1024; // 5MB in KB

    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        used += localStorage[key].length * 2; // Count characters as bytes
      }
    }

    setStorageInfo({
      used: (used / 1024).toFixed(2), // Convert used from bytes to KB
      total: estimatedTotal.toFixed(2), // Total is already in KB
      percentage: ((used / (estimatedTotal * 1024)) * 100).toFixed(1), // Adjust for KB to byte conversion
    });
  };

  // Validate to ensure only two decimals
  const handleBudgetChange = (field, value) => {
    // Match up to two decimal points using regex
    const regex = /^[0-9]*(\.[0-9]{0,2})?$/;
    if (regex.test(value)) {
      setTempBudgets({
        ...tempBudgets,
        [field]: Math.max(0, parseFloat(value) || 0),
      });
      setHasChanges(true);
    }
  };

  const toggleEditBudget = () => {
    if (isEditingBudget && !hasChanges) {
      setIsEditingBudget(false);
    } else if (isEditingBudget && hasChanges) {
      setBudgets(tempBudgets);
      setIsEditingBudget(false);
      setHasChanges(false);
      setNotification(
        <span>
          <Check size={28} className="inline text-green-500" /> Budget settings
          saved successfully.
        </span>
      );
    } else {
      setIsEditingBudget(true);
    }
  };

  const handleReset = () => {
    setTempBudgets({ ...budgets });
    setHasChanges(false);
  };

  const handleClearRecords = () => {
    if (!expenses || expenses.length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className=" text-red-400" /> No records found.
        </span>
      );
    } else {
      clearRecords();
      setShowConfirmDelete(false);
      setNotification(
        <span className="flex items-center gap-2">
          <Check size={28} className="w-6 h-6 text-green-500" /> All records
          deleted successfully.
        </span>
      );
      updateStorageInfo();
    }
  };

  const handleExportData = () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className="text-red-400" /> No records to export.
        </span>
      );
      return;
    }

    // Flatten the data (if there are multiple dates) and sort by date
    const sortedDates = Object.keys(expenses).sort(
      (a, b) => new Date(a) - new Date(b)
    ); // Sort dates in ascending order

    // Map the sorted dates to their corresponding expenses
    const dataToExport = sortedDates.flatMap((date) => {
      return expenses[date].map((item) => ({
        date, // Add the date to each item
        name: item.name,
        amount: item.amount,
        category: item.category,
      }));
    });

    if (dataToExport.length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className="text-red-400" /> No records to export.
        </span>
      );
      return;
    }

    // Define custom headers, including date
    const headers = ["Date", "Description", "Amount", "Category"];

    // Add headers to the data
    const dataWithHeaders = [
      headers,
      ...dataToExport.map((item) => [
        item.date,
        item.name,
        item.amount,
        item.category,
      ]),
    ];

    // Convert the data to a worksheet with custom headers
    const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);

    // Set column widths
    const columnWidths = [
      { wpx: 120 }, // Date column width
      { wpx: 100 }, // Name column width
      { wpx: 100 }, // Amount column width
      { wpx: 100 }, // Category column width
    ];
    ws["!cols"] = columnWidths;

    // Make the first row (headers) bold
    const range = XLSX.utils.decode_range(ws["!ref"]); // Get range of the worksheet
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = { r: 0, c: col }; // First row (header)
      const cell = ws[XLSX.utils.encode_cell(cellAddress)];
      if (cell) {
        cell.s = {
          font: {
            bold: true,
          },
        };
      }
    }

    // Create a new workbook and append the worksheet
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");

    // Export the workbook to an Excel file
    XLSX.writeFile(wb, "expenses-data.xlsx");
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog
        as="div"
        className="relative z-50"
        onClose={() => setIsOpen(false)}
      >
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#333333]/30 backdrop-blur-sm transition-all" />
        </Transition.Child>

        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 scale-95"
            enterTo="opacity-100 scale-100"
            leave="ease-in duration-100"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <Dialog.Panel className="relative bg-gray-900 p-5 rounded-xl shadow-lg w-[40rem] max-w-[90%] max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center border-b border-white">
                <Dialog.Title className="text-xl font-bold text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <SettingsIcon size={24} className="text-purple-300" />{" "}
                    Settings
                  </div>
                </Dialog.Title>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-gray-400 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="mt-4 space-y-4">
                {/* Budget Settings */}
                <div className="pb-0 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <WalletMinimal size={16} className="text-purple-300" />
                    <h2 className="text-sm font-medium text-white ">
                      Budget Settings
                    </h2>
                  </div>
                  <div className="flex space-x-2">
                    {hasChanges && (
                      <button
                        onClick={handleReset}
                        className="text-gray-400 hover:text-white transition cursor-pointer"
                        title="Reset changes"
                      >
                        <RotateCcw
                          size={18}
                          className="transition-transform duration-200 hover:scale-120"
                        />
                      </button>
                    )}
                    <button
                      onClick={toggleEditBudget}
                      className="text-gray-400 hover:text-white transition cursor-pointer"
                      title={
                        isEditingBudget
                          ? hasChanges
                            ? "Save changes"
                            : "Cancel editing"
                          : "Edit budget"
                      }
                      disabled={showConfirmDelete}
                    >
                      {isEditingBudget ? (
                        hasChanges ? (
                          <Check
                            size={18}
                            className="text-green-500 transition-transform duration-200 hover:scale-120"
                          />
                        ) : (
                          <Ban
                            size={18}
                            className="text-red-500 transition-transform duration-200 hover:scale-120"
                          />
                        )
                      ) : (
                        <Edit
                          size={18}
                          className="text-yellow-500 transition-transform duration-200 hover:scale-120"
                        />
                      )}
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div>
                    <label className="text-xs font-medium text-gray-300">
                      1st to 15th Budget
                    </label>
                    <input
                      type="number"
                      value={tempBudgets.firstHalf}
                      disabled={!isEditingBudget}
                      onChange={(e) =>
                        handleBudgetChange("firstHalf", e.target.value)
                      }
                      className={`w-full px-3 py-1 border rounded-lg text-sm text-white 
                      ${
                        isEditingBudget
                          ? "bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"
                          : "bg-gray-700 border-gray-600"
                      }`}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-gray-300">
                      16th to End Budget
                    </label>
                    <input
                      type="number"
                      value={tempBudgets.secondHalf}
                      disabled={!isEditingBudget}
                      onChange={(e) =>
                        handleBudgetChange("secondHalf", e.target.value)
                      }
                      className={`w-full px-3 py-1 border rounded-lg text-sm text-white 
                      ${
                        isEditingBudget
                          ? "bg-gray-800 border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-400/50 transition-all duration-200"
                          : "bg-gray-700 border-gray-600"
                      }`}
                    />
                  </div>
                </div>
                {/* Storage Information Section */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex items-center gap-2">
                    <Database size={16} className="text-purple-300" />
                    <h2 className="text-sm font-medium text-white">
                      Storage Usage
                    </h2>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                      <div
                        className="bg-purple-300 h-2.5 rounded-full"
                        style={{
                          width: `${Math.min(storageInfo.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-gray-400">
                        {storageInfo.used} KB used
                      </span>
                      <span className="text-xs text-gray-400">
                        {storageInfo.total} KB total
                      </span>
                    </div>
                    {parseFloat(storageInfo.used) >= 4800 && (
                      <p className="text-sm text-red-400 bg-red-400/10 px-3 py-2 rounded-lg">
                        Warning: Local storage usage is nearing its limit!
                      </p>
                    )}
                  </div>
                </div>

                {/* Export Data Section */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex items-center gap-2">
                    <MonitorDown size={16} className="text-purple-300" />
                    <h2 className="text-sm font-medium text-white">
                      Export Data
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <span className="text-sm text-gray-400">
                      Download your expense records as an Excel spreadsheet
                    </span>

                    <button
                      onClick={handleExportData}
                      className="w-full md:w-auto mt-3 md:mt-0 cursor-pointer inline-flex items-center justify-center gap-2 py-0.5 px-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-purple-600 to-blue-500 group-hover:from-purple-600 group-hover:to-blue-500 hover:text-white dark:text-white shadow-lg hover:shadow-purple-500/50 duration-200"
                    >
                      <span className="flex items-center justify-center gap-2 px-3 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md hover:bg-transparent w-full">
                        <FileDown size={18} className="text-gray-300" />
                        Export
                      </span>
                    </button>
                  </div>
                </div>

                {/* Delete Records Section */}
                <div className="border-t border-gray-700 pt-3">
                  <div className="flex items-center gap-2">
                    <Trash2 size={16} className="text-purple-300" />
                    <h2 className="text-sm font-medium text-white">
                      Delete Records
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <span className="text-sm text-gray-400">
                      Remove all expense records permanently
                    </span>
                    <button
                      onClick={() => {
                        setShowConfirmDelete(true);
                        setIsEditingBudget(false);
                        setHasChanges(false);
                        setTempBudgets({ ...budgets });
                      }}
                      className="w-full md:w-auto mt-3 md:mt-0 cursor-pointer inline-flex items-center justify-center gap-2 py-0.5 px-0.5 overflow-hidden text-sm font-medium text-white rounded-lg group bg-gradient-to-br from-red-400 to-red-500 shadow-lg hover:shadow-red-500/50 duration-200"
                    >
                      <span className="flex items-center justify-center gap-2 px-3 py-1.5 transition-all ease-in duration-75 bg-white dark:bg-gray-900 rounded-md hover:bg-transparent w-full">
                        <Trash size={18} />
                        Delete All
                      </span>
                    </button>
                  </div>
                  {showConfirmDelete && (
                    <div className="mt-4 bg-red-500/10 p-4 rounded-lg border border-red-500/20">
                      <p className="text-sm text-red-300">
                        Are you sure you want to delete all records? This action
                        cannot be undone.
                      </p>
                      <div className="flex justify-end space-x-4 mt-2">
                        <button
                          onClick={() => setShowConfirmDelete(false)}
                          className="px-4 py-1 rounded-md bg-gray-700 text-white hover:bg-gray-600 transition cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleClearRecords();
                            setShowConfirmDelete(false); // Close the confirm delete dialog
                          }}
                          className="px-4 py-1 rounded-md bg-red-600 text-white hover:bg-red-500 transition cursor-pointer"
                        >
                          Confirm
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default Settings;
