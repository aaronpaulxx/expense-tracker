import toast from "react-hot-toast";
import { useState, useCallback, useEffect, useRef } from "react";
import { loadXLSX } from "../lib/loadXLSX";
import {
  notifyError,
  notifySuccess,
  notifyLoading,
  pluralize,
} from "../lib/toast";
import ToastCount from "../components/ToastCount";

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Owns everything related to exporting expenses to an .xlsx file:
 * generating the workbook, previewing the resulting file size while
 * Settings is open, and the actual export/download action.
 */
export const useDataExport = ({
  isOpen,
  expenses,
  totalEntries,
  XLSX,
  setXLSX,
}) => {
  const [exportFileInfo, setExportFileInfo] = useState(null);

  const generateExportWorkbook = useCallback(() => {
    const sortedDates = Object.keys(expenses).sort(
      (a, b) => new Date(a) - new Date(b),
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
          Date.UTC(parts[0], parseInt(parts[1], 10) - 1, parts[2]),
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

  const sizePreviewCache = useRef({ expenses: null, info: null });

  useEffect(() => {
    if (!isOpen || totalEntries === 0 || !XLSX) {
      setExportFileInfo(null);
      return;
    }

    if (sizePreviewCache.current.expenses === expenses) {
      setExportFileInfo(sizePreviewCache.current.info);
      return;
    }

    let cancelled = false;
    const computeSize = () => {
      if (cancelled) return;
      try {
        const wb = generateExportWorkbook();
        const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });
        const info = {
          name: "Expense Tracker Data.xlsx",
          size: formatBytes(wbout.byteLength),
        };
        sizePreviewCache.current = { expenses, info };
        setExportFileInfo(info);
      } catch (error) {
        console.error("Error calculating export file size:", error);
        setExportFileInfo(null);
      }
    };

    const idleId = window.requestIdleCallback
      ? window.requestIdleCallback(computeSize, { timeout: 500 })
      : window.setTimeout(computeSize, 0);

    return () => {
      cancelled = true;
      (window.cancelIdleCallback || window.clearTimeout)(idleId);
    };
  }, [isOpen, expenses, XLSX, totalEntries, generateExportWorkbook]);

  const handleExport = async () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      notifyError("No records to export.", { id: "export" });
      return;
    }

    const fileName = "Expense Tracker Data.xlsx";
    const recordCount = totalEntries;

    notifyLoading("Exporting...", { id: "export" });

    try {
      const xlsx = XLSX || (await loadXLSX());
      if (!XLSX) setXLSX(xlsx);

      const wb = generateExportWorkbook();
      const buffer = xlsx.write(wb, { bookType: "xlsx", type: "buffer" });

      const result = await window.electronAPI.exportFile(buffer, fileName);

      if (result.canceled) {
        toast.dismiss("export");
        return;
      }

      notifySuccess(
        <span>
          Exported <ToastCount>{recordCount}</ToastCount>{" "}
          {pluralize(recordCount, "record")} to &quot;{fileName}&quot;.
        </span>,
        { id: "export" },
      );
    } catch (error) {
      notifyError(`Failed to export: ${error.message}`, { id: "export" });
    }
  };

  return { exportFileInfo, handleExport };
};

export { formatBytes };
