import { useState, useEffect, useMemo, Fragment } from "react";
import PropTypes from "prop-types";
import {
  X,
  Trash,
  Database,
  MonitorDown,
  Download,
  Upload,
  MonitorUp,
  Trash2,
} from "lucide-react";
import { Dialog, Transition, CloseButton } from "@headlessui/react";
import { loadXLSX } from "../lib/loadXLSX.js";
import { useDataExport } from "../hooks/useDataExport";
import { useDataImport } from "../hooks/useDataImport";
import { notifySuccess, notifyError, pluralize } from "../lib/toast";
import ToastCount from "./ToastCount.jsx";

const Settings = ({
  isOpen,
  setIsOpen,
  clearRecords,
  expenses,
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

  const totalEntries = useMemo(
    () =>
      expenses
        ? Object.values(expenses).reduce(
            (total, dayEntries) => total + dayEntries.length,
            0,
          )
        : 0,
    [expenses],
  );

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
    resetImportState,
  } = useDataImport({
    expenses,
    setExpenses,
    XLSX,
    setXLSX,
    updateStorageInfo,
    setIsOpen,
  });

  useEffect(() => {
    if (isOpen) {
      updateStorageInfo();
    } else {
      setShowConfirmDelete(false);
      setDeleteConfirmationInput("");
      resetImportState();
    }
  }, [isOpen, resetImportState]);

  const { exportFileInfo, handleExport } = useDataExport({
    isOpen,
    expenses,
    totalEntries,
    XLSX,
    setXLSX,
  });

  const handleClearRecords = () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      notifyError("No records found.", { id: "clear-records" });
    } else {
      const deletedCount = totalEntries;
      clearRecords();
      setShowConfirmDelete(false);
      notifySuccess(
        <span>
          Deleted <ToastCount>{deletedCount}</ToastCount>{" "}
          {pluralize(deletedCount, "record")}.
        </span>,
        { id: "clear-records" },
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
          <div className="fixed inset-0 backdrop-blur-xs transition-all" />
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
            <Dialog.Panel className="relative bg-card p-5 rounded-xl shadow-lg w-160 max-w-[90%] max-h-[95vh] overflow-y-auto border-transparent border custom-scrollbar">
              <div className="flex justify-between items-center border-b border-border">
                <Dialog.Title className="text-xl font-semibold text-foreground">
                  <div className="mb-4 flex items-center gap-2 border-l-4 pl-2 border-accent">
                    Settings
                  </div>
                </Dialog.Title>
                <CloseButton className="mb-4 text-muted-foreground hover:text-foreground transition-all duration-200 cursor-pointer">
                  <X size={24} />
                </CloseButton>
              </div>
              <div className="mt-4 space-y-4">
                {/* STORAGE SECTION */}
                <div className="border-border">
                  <div className="flex items-center gap-2">
                    <Database size={20} className="text-muted-foreground" />
                    <h2 className="text-md font-medium text-foreground">
                      Storage Usage
                    </h2>
                  </div>
                  <div className="mt-2">
                    <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 ${storageInfo.percentage < 8 ? "rounded-full" : "rounded-l-full"} ${
                          parseFloat(storageInfo.used) >= storageInfo.total
                            ? "bg-destructive"
                            : parseFloat(storageInfo.used) >= 4800
                              ? "bg-warning"
                              : "bg-accent"
                        }`}
                        style={{
                          width: `${Math.min(storageInfo.percentage, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <div className="flex justify-between mt-1">
                      <span
                        className={`text-xs ${
                          parseFloat(storageInfo.used) >= storageInfo.total
                            ? "text-destructive"
                            : parseFloat(storageInfo.used) >= 4800
                              ? "text-warning"
                              : "text-muted-foreground"
                        }`}
                      >
                        {(storageInfo.used / 1024).toFixed(2)} MB used
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {(storageInfo.total / 1024).toFixed(2)} MB total
                      </span>
                    </div>
                  </div>
                </div>

                {/* EXPORT SECTION */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <MonitorDown size={20} className="text-muted-foreground" />
                    <h2 className="text-md font-medium text-foreground">
                      Export Data
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <div className="w-full">
                      <span className="text-sm text-muted-foreground">
                        Download your expense records as an Excel spreadsheet.
                      </span>
                      <div className="flex items-center flex-wrap gap-4 mt-2">
                        {exportFileInfo && (
                          <div className="flex flex-col text-xs ">
                            <p>
                              <span className="font-normal text-accent italic">
                                {exportFileInfo.name}
                              </span>
                            </p>
                            <p>
                              <span className="font-normal text-muted-foreground italic">
                                {exportFileInfo.size}
                              </span>
                            </p>
                          </div>
                        )}
                        <button
                          onClick={handleExport}
                          disabled={totalEntries === 0}
                          className="ml-auto cursor-pointer inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary text-secondary-foreground text-sm font-medium shadow-sm hover:bg-secondary/80 active:bg-secondary/60 transition-colors duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-auto"
                        >
                          <Download size={18} />
                          Export
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* IMPORT SECTION */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <MonitorUp size={20} className="text-muted-foreground" />
                    <h2 className="text-md font-medium text-foreground">
                      Import Data
                    </h2>
                  </div>
                  {!(showConfirmImport && importData) && (
                    <div className="flex flex-col mt-2">
                      <label
                        htmlFor="import-file"
                        onDrop={showConfirmDelete ? undefined : handleDrop}
                        onDragOver={
                          showConfirmDelete ? undefined : handleDragOver
                        }
                        onDragEnter={
                          showConfirmDelete ? undefined : handleDragEnter
                        }
                        onDragLeave={
                          showConfirmDelete ? undefined : handleDragLeave
                        }
                        className={`flex flex-col items-center justify-center p-4 border-2 border-dashed rounded-2xl transition-colors duration-200 ${
                          showConfirmDelete
                            ? "opacity-50 cursor-not-allowed pointer-events-none"
                            : "cursor-pointer"
                        } ${
                          isDragInvalid
                            ? "border-destructive bg-destructive/10"
                            : isDragging
                              ? "border-accent bg-accent/10"
                              : "border-border hover:border-muted-foreground hover:bg-muted/10"
                        }`}
                      >
                        <div className="flex flex-col items-center justify-center text-center pointer-events-none">
                          <Upload
                            size={32}
                            className={`mb-2 transition-colors duration-200 ${
                              isDragInvalid
                                ? "text-destructive"
                                : isDragging
                                  ? "text-accent"
                                  : "text-muted-foreground"
                            }`}
                          />
                          <p
                            className={`mb-1 text-sm ${
                              isDragInvalid
                                ? "text-destructive"
                                : isDragging
                                  ? "text-foreground"
                                  : "text-muted-foreground"
                            }`}
                          >
                            {isDragInvalid ? (
                              <span className="font-medium text-destructive">
                                Invalid File Type
                              </span>
                            ) : (
                              <>
                                <span className="font-medium text-accent">
                                  Click to upload
                                </span>{" "}
                                or drag and drop
                              </>
                            )}
                          </p>
                          <p className="text-xs text-muted-foreground">
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
                  )}
                  {showConfirmImport && importData && (
                    <div className="mt-2 bg-popover p-5 rounded-2xl border border-border">
                      <div className=" mb-4">
                        <p className="text-xs text-white/90">
                          <span className="text-sm text-warning">
                            {importData.duplicateEntries.length.toLocaleString()}
                          </span>{" "}
                          duplicate{" "}
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

                {/* DELETE SECTION */}
                <div className="border-t border-border pt-3">
                  <div className="flex items-center gap-2">
                    <Trash2 size={20} className="text-muted-foreground" />
                    <h2 className="text-md font-medium text-foreground">
                      Delete Data
                    </h2>
                  </div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center mt-2">
                    <div className="w-full">
                      {!showConfirmDelete && (
                        <>
                          <span className="text-sm text-muted-foreground">
                            Remove all expense records permanently.
                          </span>
                          <div className="flex items-center flex-wrap gap-4 mt-2">
                            <div className="flex flex-col text-xs text-muted-foreground">
                              {totalEntries === 0 && (
                                <span className="font-normal text-muted-foreground italic">
                                  No records found.
                                </span>
                              )}
                              {totalEntries > 0 && (
                                <p className="text-xs text-muted-foreground italic">
                                  Delete all{" "}
                                  <span className="font-medium text-sm text-destructive">
                                    {totalEntries.toLocaleString()}
                                  </span>{" "}
                                  {totalEntries === 1 ? "record" : "records"}
                                </p>
                              )}
                            </div>

                            <button
                              onClick={() => setShowConfirmDelete(true)}
                              disabled={
                                totalEntries === 0 ||
                                (showConfirmImport && importData)
                              }
                              className="ml-auto cursor-pointer md:mt-0 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive text-white text-sm font-medium shadow-sm hover:bg-destructive/80 active:bg-destructive/60 transition-colors duration-200 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-auto"
                            >
                              <Trash size={18} />
                              Erase All Data
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                  {showConfirmDelete && !(showConfirmImport && importData) && (
                    <div className="mt-1 p-4 rounded-2xl border bg-popover border-destructive">
                      <p className="text-sm text-muted-foreground">
                        To proceed, type &quot;
                        <span className="font-medium text-foreground">
                          confirm
                        </span>
                        &quot; in the box below.
                      </p>
                      <p className="text-sm text-destructive">
                        This action cannot be undone.
                      </p>
                      <div className="mt-1">
                        <input
                          type="text"
                          value={deleteConfirmationInput}
                          onChange={(e) =>
                            setDeleteConfirmationInput(e.target.value)
                          }
                          onPaste={(e) => e.preventDefault()}
                          maxLength={15}
                          className="w-full bg-transparent border-0 border-b border-border px-2 py-1 text-foreground text-center placeholder-muted-foreground focus:outline-none focus:border-muted-foreground transition"
                          autoFocus
                        />
                      </div>
                      <div className="flex justify-center gap-4 mt-2">
                        <button
                          onClick={() => {
                            setShowConfirmDelete(false);
                            setDeleteConfirmationInput("");
                          }}
                          className="text-sm font-medium px-4 py-2 rounded-full bg-secondary text-secondary-foreground hover:bg-secondary/80 active:bg-secondary/60 transition cursor-pointer w-full"
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
                          className="text-sm font-medium px-4 py-2 rounded-full bg-destructive text-white hover:bg-destructive/80 active:bg-destructive/60 transition cursor-pointer w-full disabled:bg-muted disabled:text-muted-foreground disabled:cursor-auto"
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
  clearRecords: PropTypes.func.isRequired,
  expenses: PropTypes.object,
  setExpenses: PropTypes.func.isRequired,
};

export default Settings;