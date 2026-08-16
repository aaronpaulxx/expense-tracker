import { useState, useCallback, useEffect } from "react";
import { CircleX, Check } from "lucide-react";
import { loadXLSX } from "../lib/loadXLSX";

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
  setNotification,
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

  // Preview the export file's size while Settings is open, so the user
  // sees it before actually clicking Export.
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

  const handleExport = async () => {
    if (!expenses || Object.keys(expenses).length === 0) {
      setNotification(
        <span className="flex items-center gap-2">
          <CircleX size={28} className="text-red-400" /> No records to export.
        </span>,
      );
      return;
    }

    // Defensive fallback in case the lazy-load effect hasn't resolved yet.
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
      </div>,
    );
  };

  return { exportFileInfo, handleExport };
};

export { formatBytes };
