import { useState, useEffect, useCallback, Fragment } from "react";
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

// Cached across opens/closes so re-opening Settings doesn't re-fetch the chunk.
let xlsxModulePromise = null;
const loadXLSX = () => {
  if (!xlsxModulePromise) {
    xlsxModulePromise = import("xlsx/dist/xlsx.mini.min.js");
  }
  return xlsxModulePromise;
};

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
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [importData, setImportData] = useState(null);
  const [storageInfo, setStorageInfo] = useState({ used: 0, total: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [exportFileInfo, setExportFileInfo] = useState(null);
  const [isDragInvalid, setIsDragInvalid] = useState(false);

  // XLSX is loaded lazily (only when Settings is actually opened), and
  // cached at module scope so it isn't re-fetched on every open.
  const [XLSX, setXLSX] = useState(null);

  useEffect(() => {
    if (isOpen && !XLSX) {
      loadXLSX().then(setXLSX);
    }
  }, [isOpen, XLSX]);

  const formatBytes = (bytes, decimals = 2) => {
    if (!+bytes) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
  };

  const parseDateCell = useCallback(
    (cellValue) => {
      if (cellValue === null || cellValue === undefined) {
        return null;
      }
      if (typeof cellValue === "number") {
        const d = XLSX.SSF.parse_date_code(cellValue);
        if (d) {
          return new Date(Date.UTC(d.y, d.m - 1, d.d));
        }
      }
      if (cellValue instanceof Date && !isNaN(cellValue)) {
        return new Date(
          Date.UTC(
            cellValue.getFullYear(),
            cellValue.getMonth(),
            cellValue.getDate()
          )
        );
      }
      if (typeof cellValue === "string") {
        const str = cellValue.trim();
        if (str === "") return null;
        let parts;
        parts = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{2}|\d{4})$/);
        if (parts) {
          let year = parseInt(parts[3], 10);
          const month = parseInt(parts[1], 10) - 1;
          const day = parseInt(parts[2], 10);
          if (year < 100) {
            year += 2000;
          }
          if (month >= 0 && month < 12 && day > 0 && day <= 31) {
            return new Date(Date.UTC(year, month, day));
          }
        }
        parts = str.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})/);
        if (parts) {
          const year = parseInt(parts[1], 10);
          const month = parseInt(parts[2], 10) - 1;
          const day = parseInt(parts[3], 10);
          if (month >= 0 && month < 12 && day > 0 && day <= 31) {
            return new Date(Date.UTC(year, month, day));
          }
        }
      }
      return null;
    },
    [XLSX]
  );

  const totalEntries = expenses
    ? Object.values(expenses).reduce(
        (total, dayEntries) => total + dayEntries.length,
        0
      )
    : 0;

  useEffect(() => {
    if (isOpen) {
      updateStorageInfo();
    } else {
      setShowConfirmDelete(false);
      setDeleteConfirmationInput("");
      setShowConfirmImport(false);
      setImportData(null);
    }
  }, [isOpen, budgets]);

  const generateExportWorkbook = useCallback(() => {
    const sortedDates = Object.keys(expenses).sort(
      (a, b) => new Date(a) - new Date(b)
    );

    const dataToExport = sortedDates.flatMap((date) => {
      return expenses[date].map((item) => ({
        date,
        name: item.name,
        amount: item.amount,
        category: item.category,
      }));
    });

    const headers = ["Date", "Description", "Amount", "Category"];
    const dataWithHeaders = [
      headers,
      ...dataToExport.map((item) => {
        const parts = item.date.split("-");
        const dateObject = new Date(
          Date.UTC(parts[0], parseInt(parts[1], 10) - 1, parts[2])
        );
        return [dateObject, item.name, item.amount, item.category];
      }),
    ];

    const ws = XLSX.utils.aoa_to_sheet(dataWithHeaders);
    ws["!cols"] = [{ wpx: 120 }, { wpx: 100 }, { wpx: 100 }, { wpx: 100 }];

    const range = XLSX.utils.decode_range(ws["!ref"]);
    for (let R = range.s.r + 1; R <= range.e.r; ++R) {
      const cell_ref = XLSX.utils.encode_cell({ c: 0, r: R });
      if (ws[cell_ref] && (ws[cell_ref].t === "d" || ws[cell_ref].t === "n")) {
        ws[cell_ref].z = "yyyy-mm-dd";
      }
    }

    for (let col = range.s.c; col <= range.e.c; col++) {
      const cell = ws[XLSX.utils.encode_cell({ r: 0, c: col })];
      if (cell) {
        cell.s = { font: { bold: true } };
      }
    }

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Expenses");
    return wb;
  }, [expenses, XLSX]);

  useEffect(() => {
    if (isOpen && totalEntries > 0 && XLSX) {
      try {
        const wb = generateExportWorkbook();
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

        setExportFileInfo({
          name: "Expense Tracker Data.xlsx",
          size: formatBytes(wbout.byteLength),
        });
      } catch (error) {
        console.error("Error calculating export file size:", error);
        setExportFileInfo(null);
      }
    } else {
      setExportFileInfo(null);
    }
  }, [isOpen, expenses, XLSX, totalEntries, generateExportWorkbook]);

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

  const handleClearRecords = () => {
    if (!expenses || Object.keys(expenses).length === 0) {
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

  const handleExport = async () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className="text-red-400" /> No records to export.
        </span>
      );
      return;
    }

    // Defensive fallback in case the effect hasn't resolved yet.
    const xlsx = XLSX || (await loadXLSX());
    if (!XLSX) setXLSX(xlsx);

    const wb = generateExportWorkbook();
    const fileName = "Expense Tracker Data.xlsx";
    xlsx.writeFile(wb, fileName);

    setNotification(
      <div className="flex items-center gap-2 max-w-sm">
        <Check size={20} className="text-green-500 shrink-0" />
        <span className="leading-tight">
          Successfully exported your data to &quot;{fileName}&quot;.
        </span>
      </div>
    );
  };

  const processImportFile = (file) => {
    if (!file) return;

    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={20} className="text-red-400" />
          File too large. Maximum size is 10MB.
        </span>
      );
      return;
    }

    const allowedTypes = [
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "application/vnd.ms-excel",
      "text/csv",
    ];
    if (
      !allowedTypes.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={20} className="text-red-400" />
          Unsupported file. Upload Excel or CSV.
        </span>
      );
      return;
    }

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const xlsx = XLSX || (await loadXLSX());
        if (!XLSX) setXLSX(xlsx);

        const data = new Uint8Array(e.target.result);
        const workbook = xlsx.read(data, { type: "array", cellDates: true });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = xlsx.utils.sheet_to_json(worksheet, { raw: false });

        if (!json || json.length === 0) {
          setNotification(
            <span className="flex items-center gap-2">
              <CircleX size={20} className="text-red-400" />
              File is empty or contains no data rows.
            </span>
          );
          return;
        }

        const expectedHeaders = ["Date", "Description", "Amount", "Category"];
        const actualHeaders = Object.keys(json[0] || {});
        const headerMapping = {};
        const headerVariants = {
          Date: ["date", "transaction date", "trans date", "dt"],
          Description: [
            "description",
            "desc",
            "details",
            "transaction",
            "memo",
            "note",
          ],
          Amount: ["amount", "value", "sum", "total", "cost", "price"],
          Category: ["category", "cat", "type", "classification"],
        };

        for (const expectedHeader of expectedHeaders) {
          const variants = headerVariants[expectedHeader].map((v) =>
            v.toLowerCase()
          );
          const matchedHeader = actualHeaders.find(
            (header) =>
              variants.includes(header.toLowerCase()) ||
              header.toLowerCase() === expectedHeader.toLowerCase()
          );
          if (matchedHeader) {
            headerMapping[expectedHeader] = matchedHeader;
          }
        }

        const missingHeaders = expectedHeaders.filter(
          (header) => !headerMapping[header]
        );
        if (missingHeaders.length > 0) {
          setNotification(
            <div className="flex items-start gap-2 max-w-sm">
              <CircleX size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <div className="font-medium">Missing required columns:</div>
                <div className="text-sm text-stone-300 mt-1">
                  {missingHeaders.join(", ")}
                </div>
                <div className="text-xs text-stone-400 mt-2">
                  Found columns: {actualHeaders.join(", ")}
                </div>
              </div>
            </div>
          );
          return;
        }

        const validCategories = [
          "Food",
          "Transport",
          "Shopping",
          "Bills",
          "Credit",
          "Other",
        ];
        const validCategoriesLower = validCategories.map((cat) =>
          cat.toLowerCase()
        );
        const validationErrors = [];
        const processedData = [];

        json.forEach((item, index) => {
          const rowNumber = index + 2;
          const errors = [];
          const rawDate = item[headerMapping.Date];
          const description = item[headerMapping.Description];
          const amount = item[headerMapping.Amount];
          const category = item[headerMapping.Category];

          const parsedDate = parseDateCell(rawDate);
          if (rawDate === null || rawDate === undefined) {
            errors.push("Missing date");
          } else if (!parsedDate) {
            errors.push(`Invalid date format: "${String(rawDate)}"`);
          }

          if (!description || String(description).trim() === "") {
            errors.push("Missing description");
          }

          const numericAmount = parseFloat(amount);
          if (isNaN(numericAmount)) {
            errors.push("Invalid amount (must be a number)");
          } else if (numericAmount < 0) {
            errors.push("Amount cannot be negative");
          } else if (numericAmount > 1000000) {
            errors.push("Amount cannot exceed 1,000,000");
          }

          const categoryLower = String(category || "")
            .toLowerCase()
            .trim();
          if (!categoryLower) {
            errors.push("Missing category");
          } else if (!validCategoriesLower.includes(categoryLower)) {
            errors.push(`Invalid category "${category}"`);
          }

          if (errors.length > 0) {
            validationErrors.push({
              row: rowNumber,
              description: String(description || "").substring(0, 30),
              errors: errors,
            });
          } else {
            const categoryIndex = validCategoriesLower.indexOf(categoryLower);
            const normalizedCategory = validCategories[categoryIndex];
            processedData.push({
              date: parsedDate.toISOString().split("T")[0],
              name: String(description).trim(),
              amount: numericAmount,
              category: normalizedCategory,
            });
          }
        });

        if (validationErrors.length > 0) {
          const errorSummary = validationErrors
            .slice(0, 3)
            .map(
              (error) =>
                `Row ${error.row}: ${error.errors.join(", ")} (${error.description})`
            )
            .join("\n");
          const moreText =
            validationErrors.length > 3
              ? `\n...and ${validationErrors.length - 3} more errors`
              : "";
          setNotification(
            <div className="flex items-start gap-2 max-w-sm">
              <CircleX size={20} className="text-red-400 shrink-0 mt-0.5" />
              <div className="leading-tight">
                <div className="font-medium">
                  Found {validationErrors.length} error
                  {validationErrors.length > 1 ? "s" : ""}:
                </div>
                <div className="text-sm text-stone-300 mt-1 whitespace-pre-line font-mono">
                  {errorSummary}
                  {moreText}
                </div>
                <div className="text-xs text-stone-400 mt-2">
                  Valid categories: {validCategories.join(", ")}
                </div>
              </div>
            </div>
          );
          return;
        }

        const existingEntries = new Set();
        const duplicateEntries = [];
        Object.entries(expenses).forEach(([date, dayExpenses]) => {
          dayExpenses.forEach((expense) => {
            existingEntries.add(
              `${date}-${expense.name.toLowerCase()}-${expense.category.toLowerCase()}`
            );
          });
        });

        processedData.forEach((item, index) => {
          const key = `${item.date}-${item.name.toLowerCase()}-${item.category.toLowerCase()}`;
          if (existingEntries.has(key)) {
            duplicateEntries.push({ ...item, importIndex: index });
          }
        });

        if (duplicateEntries.length > 0) {
          setImportData({ processedData, duplicateEntries, file });
          setShowConfirmImport(true);
          return;
        }

        const importedExpenses = { ...expenses };
        processedData.forEach((item) => {
          if (!importedExpenses[item.date]) {
            importedExpenses[item.date] = [];
          }
          importedExpenses[item.date].push({
            name: item.name,
            amount: item.amount,
            category: item.category,
          });
        });
        setExpenses(importedExpenses);
        setNotification(
          <div className="flex items-center gap-2 max-w-sm">
            <Check size={20} className="text-green-500 shrink-0" />
            <span className="leading-tight">
              Successfully imported{" "}
              <span className="text-green-400">{processedData.length}</span>{" "}
              items from &quot;{file.name}&quot;.
            </span>
          </div>
        );
        updateStorageInfo();
        setIsOpen(false);
      } catch (error) {
        console.error("Import error:", error);
        setNotification(
          <span className="flex items-center gap-2">
            <CircleX size={20} className="text-red-400" />
            Error importing file: {error.message}
          </span>
        );
      }
    };
    reader.onerror = () => {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={20} className="text-red-400" />
          Error reading file. Please try again.
        </span>
      );
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileSelect = (event) => {
    const file = event.target.files[0];
    processImportFile(file);
    if (event.target) {
      event.target.value = null;
    }
  };

  const handleDrop = (event) => {
    event.preventDefault();
    event.stopPropagation();
    setIsDragging(false);
    setIsDragInvalid(false);
    const file = event.dataTransfer.files[0];
    if (file) {
      processImportFile(file);
    }
  };

  const handleDragOver = (event) => {
    event.preventDefault();
  };

  const handleDragEnter = (event) => {
    event.preventDefault();
    setIsDragging(true);

    const items = event.dataTransfer.items;
    if (items && items.length > 0) {
      const item = items[0];
      const allowedTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        "application/vnd.ms-excel",
        "text/csv",
      ];
      if (item.kind === "file") {
        if (item.type && !allowedTypes.includes(item.type)) {
          setIsDragInvalid(true);
        } else {
          setIsDragInvalid(false);
        }
      } else {
        setIsDragInvalid(true);
      }
    }
  };

  const handleDragLeave = (event) => {
    event.preventDefault();
    if (event.currentTarget.contains(event.relatedTarget)) {
      return;
    }
    setIsDragging(false);
    setIsDragInvalid(false);
  };

  const handleImportAction = (action) => {
    if (!importData) return;

    const { processedData, duplicateEntries, file } = importData;

    if (action === "skip") {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={20} className="text-yellow-500" />
          Import cancelled by user.
        </span>
      );
      setShowConfirmImport(false);
      setImportData(null);
      return;
    }

    const finalExpenses = { ...expenses };
    let itemsToAdd = [];
    let notificationMessage = "";

    if (action === "replace") {
      duplicateEntries.forEach((duplicate) => {
        const existingDayExpenses = finalExpenses[duplicate.date] || [];
        finalExpenses[duplicate.date] = existingDayExpenses.filter(
          (expense) =>
            !(
              expense.name.toLowerCase() === duplicate.name.toLowerCase() &&
              expense.category.toLowerCase() ===
                duplicate.category.toLowerCase()
            )
        );
      });
      itemsToAdd = processedData;
      notificationMessage = `Successfully imported ${processedData.length} item${processedData.length !== 1 ? "s" : ""}, updating ${duplicateEntries.length} duplicate${duplicateEntries.length !== 1 ? "s" : ""}.`;
    } else if (action === "merge") {
      itemsToAdd = processedData;
      notificationMessage = `Successfully merged ${processedData.length} items from "${file.name}".`;
    } else if (action === "skip_duplicates") {
      const duplicateKeys = new Set(
        duplicateEntries.map(
          (d) => `${d.date}-${d.name.toLowerCase()}-${d.category.toLowerCase()}`
        )
      );
      const newItems = processedData.filter((item) => {
        const itemKey = `${item.date}-${item.name.toLowerCase()}-${item.category.toLowerCase()}`;
        return !duplicateKeys.has(itemKey);
      });
      itemsToAdd = newItems;
      notificationMessage = `Imported ${newItems.length} new item${newItems.length !== 1 ? "s" : ""} and skipped ${duplicateEntries.length} duplicate${duplicateEntries.length !== 1 ? "s" : ""}.`;
    }

    if (itemsToAdd.length > 0) {
      itemsToAdd.forEach((item) => {
        if (!finalExpenses[item.date]) {
          finalExpenses[item.date] = [];
        }
        finalExpenses[item.date].push({
          name: item.name,
          amount: item.amount,
          category: item.category,
        });
      });
      setExpenses(finalExpenses);
    }

    setNotification(
      <div className="flex items-center gap-2 max-w-sm">
        <Check size={20} className="text-green-500 shrink-0" />
        <span className="leading-tight">{notificationMessage}</span>
      </div>
    );

    updateStorageInfo();
    setShowConfirmImport(false);
    setImportData(null);
    setIsOpen(false);
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