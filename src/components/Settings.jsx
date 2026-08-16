import { useState, useEffect, Fragment } from "react";
import PropTypes from "prop-types";
import {
  Settings as SettingsIcon,
  Check,
  X,
  Trash,
  Database,
  MonitorDown,
  Download,
  Upload,
  MonitorUp,
  Trash2,
  CircleX,
} from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { loadXLSX } from "../lib/loadXLSX.js";
import { useDataExport } from "../hooks/useDataExport";
import { useDataImport } from "../hooks/useDataImport";

const Settings = ({
  isOpen,
  setIsOpen,
  budgets,
  clearRecords,
  expenses,
  setNotification,
  setExpenses,
}) => {
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleteConfirmationInput, setDeleteConfirmationInput] = useState("");
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });

  // XLSX is loaded lazily (only when Settings is actually opened), and
  // cached at module scope so it isn't re-fetched on every open. Shared
  // between the export and import hooks below.
  const [XLSX, setXLSX] = useState(null);

  useEffect(() => {
    if (isOpen && !XLSX) {
      loadXLSX().then(setXLSX);
    }
  }, [isOpen, XLSX]);

  const totalEntries = expenses
    ? Object.values(expenses).reduce(
        (total, dayEntries) => total + dayEntries.length,
        0,
      )
    : 0;

  const updateStorageInfo = () => {
    let used = 0;
    const estimatedTotal = 5 * 1024;
    for (let key in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
        used += localStorage[key].length * 2;
      }
    }
    setStorageInfo({
      used: (used / 1024).toFixed(2),
      total: estimatedTotal.toFixed(2),
      percentage: ((used / (estimatedTotal * 1024)) * 100).toFixed(1),
    });
  };

  useEffect(() => {
    if (isOpen) {
      updateStorageInfo();
    } else {
      setShowConfirmDelete(false);
      setDeleteConfirmationInput("");
    }
  }, [isOpen, budgets]);

  const { exportFileInfo, handleExport } = useDataExport({
    isOpen,
    expenses,
    totalEntries,
    XLSX,
    setXLSX,
    setNotification,
  });

  const {
    showConfirmImport,
    importData,
    isDragging,
    isDragInvalid,
    handleFileSelect,
    handleDrop,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleImportAction,
  } = useDataImport({
    expenses,
    setExpenses,
    XLSX,
    setXLSX,
    setNotification,
    updateStorageInfo,
    setIsOpen,
  });

  const handleClearRecords = () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className=" text-red-400" /> No records found.
        </span>,
      );
    } else {
      clearRecords();
      setShowConfirmDelete(false);
      setNotification(
        <span className="flex items-center gap-2">
          <Check size={28} className="w-6 h-6 text-green-500" /> All records
          deleted successfully.
        </span>,
      );
      updateStorageInfo();
    }
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
            <Dialog.Panel className="relative bg-stone-900 p-5 rounded-xl shadow-lg w-[40rem] max-w-[90%] max-h-[90vh] overflow-y-auto border-stone-500 border-1 custom-scrollbar">
              <div className="flex justify-between items-center border-b border-stone-500">
                <Dialog.Title className="text-xl font-semibold text-white">
                  <div className="flex items-center gap-2 mb-2">
                    <SettingsIcon size={30} className="text-stone-300" />{" "}
                    Settings
                  </div>
                </Dialog.Title>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-stone-400 hover:text-white transition-all duration-200 cursor-pointer"
                >
                  <X size={24} />
                </button>
              </div>
              <div className="mt-4 space-y-4">
                <div className="border-stone-700">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-stone-300" />
                    <h2 className="text-sm font-normal text-white">
                      Storage Usage
                    </h2>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-stone-700 rounded-full h-3.5 overflow-hidden">
                      <div
                        className={`bg-emerald-300 h-3.5 ${storageInfo.percentage < 8 ? "rounded-full" : "rounded-l-full"}`}
                        style={{
                          width: `${Math.min(storageInfo.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span className="text-xs text-stone-400">
                        {storageInfo.used} KB used
                      </span>
                      <span className="text-xs text-stone-400">
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

                <div className="border-t border-stone-700 pt-3">
                  <div className="flex items-center gap-2">
                    <MonitorDown size={20} className="text-stone-300" />
                    <h2 className="text-sm font-normal text-white">
                      Export Data
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <div className="flex-grow">
                      <span className="text-sm text-stone-400">
                        Download your expense records as an Excel spreadsheet.
                      </span>
                      <div className="flex items-center flex-wrap gap-4 mt-2">
                        {exportFileInfo && (
                          <div className="flex flex-col md:flex-row md:items-center md:gap-6 text-xs text-stone-500">
                            <p>
                              <span className="font-normal text-stone-300 italic">
                                {exportFileInfo.name}
                              </span>
                            </p>
                            <p>
                              <span className="font-normal text-stone-300 italic">
                                {exportFileInfo.size}
                              </span>
                            </p>
                          </div>
                        )}
                        <button
                          onClick={handleExport}
                          disabled={totalEntries === 0}
                          className="ml-auto cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-stone-600 text-white text-sm font-medium shadow-sm hover:bg-stone-500 active:bg-stone-700 transition-colors duration-200 disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-auto"
                        >
                          <Download size={18} />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="border-t border-stone-700 pt-3">
                  <div className="flex items-center gap-2">
                    <MonitorUp size={20} className="text-stone-300" />
                    <h2 className="text-sm font-normal text-white">
                      Import Data
                    </h2>
                  </div>
                  <div className="flex flex-col mt-2">
                    <label
                      htmlFor="import-file"
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragEnter={handleDragEnter}
                      onDragLeave={handleDragLeave}
                      className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg cursor-pointer transition-colors duration-200 ${
                        isDragInvalid
                          ? "border-red-500 bg-red-500/10"
                          : isDragging
                            ? "border-emerald-400 bg-emerald-500/10"
                            : "border-stone-600 hover:border-stone-500 hover:bg-stone-800/50"
                      }`}
                    >
                      <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                        <Upload
                          size={32}
                          className={`mb-4 transition-colors duration-200 ${
                            isDragInvalid
                              ? "text-red-400"
                              : isDragging
                                ? "text-emerald-400"
                                : "text-stone-400"
                          }`}
                        />
                        <p
                          className={`mb-2 text-sm ${
                            isDragInvalid
                              ? "text-red-300"
                              : isDragging
                                ? "text-white"
                                : "text-stone-400"
                          }`}
                        >
                          {isDragInvalid ? (
                            <span className="font-medium text-red-400">
                              Invalid File Type
                            </span>
                          ) : (
                            <>
                              <span className="font-medium text-emerald-300">
                                Click to upload
                              </span>{" "}
                              or drag and drop
                            </>
                          )}
                        </p>
                        <p className="text-xs text-stone-500">
                          XLSX, XLS, or CSV (MAX. 10MB)
                        </p>
                      </div>
                      <input
                        type="file"
                        id="import-file"
                        accept=".xlsx, .xls, .csv"
                        onChange={handleFileSelect}
                        className="hidden"
                      />
                    </label>
                  </div>
                  {showConfirmImport && importData && (
                    <div className="mt-5 bg-white/5 backdrop-blur-sm p-5 rounded-2xl border border-white/10">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-2 h-2 rounded-full bg-amber-400"></div>
                        <p className="text-sm font-medium text-white/90">
                          {importData.duplicateEntries.length} duplicate{" "}
                          {importData.duplicateEntries.length > 1
                            ? "entries"
                            : "entry"}{" "}
                          found
                        </p>
                      </div>

                      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                        <button
                          onClick={() => handleImportAction("replace")}
                          className="cursor-pointer group relative px-1 py-1 rounded-xl bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500/20 hover:border-blue-500/40 transition-all duration-200"
                        >
                          <div className="text-sm font-medium text-blue-400 group-hover:text-blue-300">
                            Update
                          </div>
                          <div className="text-xs text-blue-400/80 ">
                            Replace existing
                          </div>
                        </button>

                        <button
                          onClick={() => handleImportAction("merge")}
                          className="cursor-pointer group relative px-1 py-1 rounded-xl bg-green-500/10 border border-green-500/20 hover:bg-green-500/20 hover:border-green-500/40 transition-all duration-200"
                        >
                          <div className="text-sm font-medium text-green-400 group-hover:text-green-300">
                            Keep
                          </div>
                          <div className="text-xs text-green-400/80 ">
                            Preserve both
                          </div>
                        </button>

                        <button
                          onClick={() => handleImportAction("skip_duplicates")}
                          className="cursor-pointer group relative px-px-1 py-1 rounded-xl bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 hover:border-teal-500/40 transition-all duration-200"
                        >
                          <div className="text-sm font-medium text-teal-400 group-hover:text-teal-300">
                            Skip
                          </div>
                          <div className="text-xs text-teal-400/80 ">
                            Ignore duplicates
                          </div>
                        </button>

                        <button
                          onClick={() => handleImportAction("skip")}
                          className="cursor-pointer group relative px-1 py-1 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-200"
                        >
                          <div className="text-sm font-medium text-white/80 group-hover:text-white">
                            Cancel
                          </div>
                          <div className="text-xs text-white/50 ">
                            Abort import
                          </div>
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div className="border-t border-stone-700 pt-3">
                  <div className="flex items-center gap-2">
                    <Trash2 size={20} className="text-stone-300" />
                    <h2 className="text-sm font-normal text-white">
                      Delete Records
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <span className="text-sm text-stone-400">
                      Remove all expense records permanently
                    </span>
                    <div className="w-full flex flex-col items-end md:w-auto mt-0 md:mt-0">
                      <button
                        onClick={() => setShowConfirmDelete(true)}
                        disabled={totalEntries === 0}
                        className="cursor-pointer mt-2 md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-red-700 text-white text-sm font-medium shadow-sm hover:bg-red-500 active:bg-red-800 transition-colors duration-200 disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-auto"
                      >
                        <Trash size={18} />
                        Delete All
                      </button>
                      {totalEntries === 0 && (
                        <span className="flex items-center gap-1 text-xs text-stone-500 mt-1.5">
                          <CircleX size={14} />
                          No records found.
                        </span>
                      )}
                    </div>
                  </div>
                  {showConfirmDelete && (
                    <div className="mt-4 bg-white/5 p-4 rounded-lg border border-white/10">
                      <p className="text-sm text-stone-300">
                        Are you sure you want to delete all{" "}
                        <span className="font-medium text-white">
                          {totalEntries}
                        </span>{" "}
                        records?
                      </p>
                      <p className="text-sm text-stone-300 mt-1">
                        To proceed, type &quot;
                        <span className="font-semibold text-white">
                          confirm
                        </span>
                        &quot; in the box below.
                      </p>
                      <p className="text-sm text-red-400 mt-1">
                        This action cannot be undone.
                      </p>
                      <div className="mt-3">
                        <input
                          type="text"
                          value={deleteConfirmationInput}
                          onChange={(e) =>
                            setDeleteConfirmationInput(e.target.value)
                          }
                          className="w-full bg-stone-800 border border-stone-600 rounded-lg px-2 py- text-white text-center placeholder-stone-500 focus:outline-none focus:ring-1 focus:ring-stone-500 transition"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-center space-x-4 mt-3">
                        <button
                          onClick={() => {
                            setShowConfirmDelete(false);
                            setDeleteConfirmationInput("");
                          }}
                          className="px-4 py-1 rounded-full bg-stone-700 text-white hover:bg-stone-600 transition cursor-pointer w-full"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => {
                            handleClearRecords();
                            setShowConfirmDelete(false);
                            setIsOpen(false);
                          }}
                          disabled={
                            deleteConfirmationInput.toLowerCase() !== "confirm"
                          }
                          className="px-4 py-1 rounded-full bg-red-700 text-white hover:bg-red-500 active:bg-red-800 transition cursor-pointer w-full disabled:bg-stone-700 disabled:text-stone-400 disabled:cursor-auto"
                        >
                          Confirm Delete
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

Settings.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  setIsOpen: PropTypes.func.isRequired,
  budgets: PropTypes.object,
  clearRecords: PropTypes.func.isRequired,
  expenses: PropTypes.object,
  setNotification: PropTypes.func.isRequired,
  setExpenses: PropTypes.func.isRequired,
};

export default Settings;
