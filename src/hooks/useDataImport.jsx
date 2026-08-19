import toast from "react-hot-toast";
import { useState, useCallback } from "react";
import { loadXLSX } from "../lib/loadXLSX";
import {
  notifySuccess,
  notifyError,
  notifyWarning,
  notifyLoading,
} from "../lib/toast";

const VALID_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Credit",
  "Other",
];

const HEADER_VARIANTS = {
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

const ALLOWED_MIME_TYPES = [
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-excel",
  "text/csv",
];

const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Owns everything related to importing expenses from an .xlsx/.xls/.csv
 * file: drag-and-drop state, file validation, date/column parsing,
 * row-level validation, duplicate detection, and the resulting merge
 * strategies (replace / merge / skip duplicates / cancel).
 */
export const useDataImport = ({
  expenses,
  setExpenses,
  XLSX,
  setXLSX,
  updateStorageInfo,
  setIsOpen,
}) => {
  const [showConfirmImport, setShowConfirmImport] = useState(false);
  const [importData, setImportData] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isDragInvalid, setIsDragInvalid] = useState(false);

  const resetImportState = () => {
    setShowConfirmImport(false);
    setImportData(null);
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
            cellValue.getDate(),
          ),
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
    [XLSX],
  );

  const processImportFile = (file) => {
    if (!file) return;

    if (file.size > MAX_FILE_SIZE) {
      notifyError("File too large. Maximum size is 10MB.", {
        id: "import",
      });
      return;
    }

    if (
      !ALLOWED_MIME_TYPES.includes(file.type) &&
      !file.name.match(/\.(xlsx|xls|csv)$/i)
    ) {
      notifyError("Unsupported file. Upload Excel or CSV.", {
        id: "import",
      });
      return;
    }

    notifyLoading("Reading file...", { id: "import" });

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
          notifyError("File is empty or contains no data rows.", {
            id: "import",
          });
          return;
        }

        const expectedHeaders = ["Date", "Description", "Amount", "Category"];
        const actualHeaders = Object.keys(json[0] || {});
        const headerMapping = {};

        for (const expectedHeader of expectedHeaders) {
          const variants = HEADER_VARIANTS[expectedHeader].map((v) =>
            v.toLowerCase(),
          );
          const matchedHeader = actualHeaders.find(
            (header) =>
              variants.includes(header.toLowerCase()) ||
              header.toLowerCase() === expectedHeader.toLowerCase(),
          );
          if (matchedHeader) {
            headerMapping[expectedHeader] = matchedHeader;
          }
        }

        const missingHeaders = expectedHeaders.filter(
          (header) => !headerMapping[header],
        );
        if (missingHeaders.length > 0) {
          notifyError(
            <div className="leading-tight">
              <div className="font-medium">Missing required columns:</div>
              <div className="text-sm text-stone-300 mt-1">
                {missingHeaders.join(", ")}
              </div>
              <div className="text-xs text-stone-400 mt-2">
                Found columns: {actualHeaders.join(", ")}
              </div>
            </div>,
            { id: "import" },
          );
          return;
        }

        const validCategoriesLower = VALID_CATEGORIES.map((cat) =>
          cat.toLowerCase(),
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
            const normalizedCategory = VALID_CATEGORIES[categoryIndex];
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
                `Row ${error.row}: ${error.errors.join(", ")} (${error.description})`,
            )
            .join("\n");
          const moreText =
            validationErrors.length > 3
              ? `\n...and ${validationErrors.length - 3} more errors`
              : "";
          notifyError(
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
                Valid categories: {VALID_CATEGORIES.join(", ")}
              </div>
            </div>,
            { id: "import" },
          );
          return;
        }

        const existingEntries = new Set();
        Object.entries(expenses).forEach(([date, dayExpenses]) => {
          dayExpenses.forEach((expense) => {
            existingEntries.add(
              `${date}-${expense.name.toLowerCase()}-${expense.category.toLowerCase()}`,
            );
          });
        });

        const duplicateEntries = [];
        processedData.forEach((item, index) => {
          const key = `${item.date}-${item.name.toLowerCase()}-${item.category.toLowerCase()}`;
          if (existingEntries.has(key)) {
            duplicateEntries.push({ ...item, importIndex: index });
          }
        });

        if (duplicateEntries.length > 0) {
          toast.dismiss("import");
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
        notifySuccess(
          <span className="leading-tight">
            Successfully imported{" "}
            <span className="text-green-400">{processedData.length}</span> items
            from &quot;{file.name}&quot;.
          </span>,
          { id: "import" },
        );
        updateStorageInfo();
        setIsOpen(false);
      } catch (error) {
        console.error("Import error:", error);
        notifyError(`Error importing file: ${error.message}`, {
          id: "import",
        });
      }
    };
    reader.onerror = () => {
      notifyError("Error reading file. Please try again.", {
        id: "import",
      });
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
      if (item.kind === "file") {
        if (item.type && !ALLOWED_MIME_TYPES.includes(item.type)) {
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
      notifyWarning("Import cancelled by user.");
      resetImportState();
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
            ),
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
          (d) =>
            `${d.date}-${d.name.toLowerCase()}-${d.category.toLowerCase()}`,
        ),
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

    notifySuccess(notificationMessage);

    updateStorageInfo();
    resetImportState();
    setIsOpen(false);
  };

  return {
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
  };
};
