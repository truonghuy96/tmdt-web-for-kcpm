import React, { useState, useRef, useEffect } from "react";
import {
  X,
  Upload,
  FileText,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  ArrowDownToLine,
} from "lucide-react";
import * as XLSX from "xlsx";
import { Product } from "../../types";

interface CsvImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  templateHeaders: string[]; // e.g. ["name", "price", "category", "image", "description", "specs"]
  templateRows: string[][]; // Sample rows to download/view
  onImport: (parsedData: any[]) => void;
  isDarkMode?: boolean;
  products: Product[];
}

export default function CsvImportExportModal({
  isOpen,
  onClose,
  title = "Nhập dữ liệu từ tệp CSV",
  templateHeaders,
  templateRows,
  onImport,
  isDarkMode = false,
  products,
}: CsvImportExportModalProps) {
  const d = isDarkMode;
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<any[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  // Lock body scroll when modal is open to prevent background scrolling
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  // CSV Parser supporting quotes and comma separation
  const parseCSV = (text: string) => {
    try {
      const lines: string[] = [];
      let currentLine = "";
      let inQuotes = false;

      for (let i = 0; i < text.length; i++) {
        const char = text[i];
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === "\n" && !inQuotes) {
          lines.push(currentLine.trim());
          currentLine = "";
        } else if (char === "\r") {
          // Skip
        } else {
          currentLine += char;
        }
      }
      if (currentLine) {
        lines.push(currentLine.trim());
      }

      if (lines.length === 0) {
        setErrors(["Tệp CSV rỗng."]);
        return;
      }

      // Header parse
      const headers = lines[0]
        .split(",")
        .map((h) => h.replace(/^"|"$/g, "").trim().toLowerCase());

      const missingHeaders = templateHeaders.filter(
        (h) => !headers.includes(h.toLowerCase()),
      );

      if (missingHeaders.length > 0) {
        setErrors([
          `Tệp CSV thiếu các cột bắt buộc: ${missingHeaders.join(", ")}`,
        ]);
        return;
      }

      const data: any[] = [];
      const parseErrors: string[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i]) continue;

        const values: string[] = [];
        let currentValue = "";
        let valueInQuotes = false;

        for (let j = 0; j < lines[i].length; j++) {
          const char = lines[i][j];
          if (char === '"') {
            valueInQuotes = !valueInQuotes;
          } else if (char === "," && !valueInQuotes) {
            values.push(currentValue.replace(/^"|"$/g, "").trim());
            currentValue = "";
          } else {
            currentValue += char;
          }
        }
        values.push(currentValue.replace(/^"|"$/g, "").trim());

        const rowObj: any = {};
        headers.forEach((header, index) => {
          rowObj[header] = values[index] || "";
        });

        if (templateHeaders.includes("name") && !rowObj.name) {
          parseErrors.push(`Dòng ${i + 1}: Thiếu tên sản phẩm ("name").`);
        }
        if (templateHeaders.includes("price") && isNaN(Number(rowObj.price))) {
          parseErrors.push(
            `Dòng ${i + 1}: Cột giá bán ("price") phải là một số hợp lệ.`,
          );
        }

        data.push(rowObj);
      }

      if (parseErrors.length > 0) {
        setErrors(parseErrors.slice(0, 5));
      } else {
        setParsedData(data);
        setErrors([]);
      }
    } catch (err) {
      console.error(err);
      setErrors(["Lỗi khi đọc cấu trúc dữ liệu CSV."]);
    }
  };

  // Excel (.xlsx) Parser supporting multiple columns
  const parseExcel = (arrayBuffer: ArrayBuffer) => {
    try {
      const workbook = XLSX.read(arrayBuffer, { type: "array" });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        defval: "",
      });

      if (jsonData.length === 0) {
        setErrors(["Tệp Excel rỗng hoặc không có dữ liệu."]);
        return;
      }

      const headers = Object.keys(jsonData[0]);
      const missingHeaders = templateHeaders.filter(
        (h) =>
          !headers.some(
            (headerName) =>
              headerName.trim().toLowerCase() === h.trim().toLowerCase(),
          ),
      );

      if (missingHeaders.length > 0) {
        setErrors([
          `Tệp Excel thiếu các cột bắt buộc: ${missingHeaders.join(", ")}`,
        ]);
        return;
      }

      const data: any[] = [];
      const parseErrors: string[] = [];

      jsonData.forEach((row, index) => {
        const rowObj: any = {};

        headers.forEach((header) => {
          const matchedHeader = templateHeaders.find(
            (th) => th.trim().toLowerCase() === header.trim().toLowerCase(),
          );
          if (matchedHeader) {
            rowObj[matchedHeader] = row[header];
          }
        });

        if (templateHeaders.includes("name") && !rowObj.name) {
          parseErrors.push(`Dòng ${index + 2}: Thiếu tên sản phẩm ("name").`);
        }
        if (templateHeaders.includes("price") && isNaN(Number(rowObj.price))) {
          parseErrors.push(
            `Dòng ${index + 2}: Cột giá bán ("price") phải là một số hợp lệ.`,
          );
        }

        data.push(rowObj);
      });

      if (parseErrors.length > 0) {
        setErrors(parseErrors.slice(0, 5));
      } else {
        setParsedData(data);
        setErrors([]);
      }
    } catch (err) {
      console.error(err);
      setErrors(["Lỗi khi đọc cấu trúc dữ liệu Excel."]);
    }
  };

  const handleFile = (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    setErrors([]);
    setParsedData([]);

    const name = file.name.toLowerCase();
    const reader = new FileReader();

    if (name.endsWith(".csv")) {
      reader.onload = (e) => {
        const text = e.target?.result as string;
        parseCSV(text);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setErrors(["Không thể đọc tập tin CSV."]);
        setIsProcessing(false);
      };
      reader.readAsText(file);
    } else if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
      reader.onload = (e) => {
        const buffer = e.target?.result as ArrayBuffer;
        parseExcel(buffer);
        setIsProcessing(false);
      };
      reader.onerror = () => {
        setErrors(["Không thể đọc tập tin Excel."]);
        setIsProcessing(false);
      };
      reader.readAsArrayBuffer(file);
    } else {
      setErrors([
        "Định dạng tệp không được hỗ trợ. Hãy tải lên tệp .csv hoặc .xlsx/.xls",
      ]);
      setIsProcessing(false);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  // Generate template Excel (.xlsx) file for download
  const handleDownloadTemplate = () => {
    const dataRows = [templateHeaders, ...templateRows];
    const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Import Template");
    worksheet["!cols"] = templateHeaders.map(() => ({ wch: 25 }));
    XLSX.writeFile(workbook, "techvie_product_import_template.xlsx");
  };

  // Generate template CSV for download
  const handleDownloadCsvTemplate = () => {
    const csvContent =
      "\uFEFF" + // Add UTF-8 BOM to prevent Vietnamese font corruption in Excel
      templateHeaders.join(",") +
      "\n" +
      templateRows
        .map((row) =>
          row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","),
        )
        .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "techvie_product_import_template.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportExcel = () => {
    try {
      const headers = ["name", "price", "category", "image", "description", "specs"];
      const rows = products.map((p) => {
        const specsStr = p.specs.map((s) => `${s.label}: ${s.value}`).join(" | ");
        return [
          p.name,
          p.price.toString(),
          p.category,
          p.image,
          p.description,
          specsStr,
        ];
      });

      const dataRows = [headers, ...rows];
      const worksheet = XLSX.utils.aoa_to_sheet(dataRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Products Export");
      worksheet["!cols"] = headers.map(() => ({ wch: 25 }));
      XLSX.writeFile(workbook, `techvie_products_export_${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (err: any) {
      alert("Lỗi xuất Excel: " + err.message);
    }
  };

  const handleExportCsv = () => {
    try {
      const headers = ["name", "price", "category", "image", "description", "specs"];
      const rows = products.map((p) => {
        const specsStr = p.specs.map((s) => `${s.label}: ${s.value}`).join(" | ");
        return [
          p.name,
          p.price.toString(),
          p.category,
          p.image,
          p.description,
          specsStr,
        ];
      });

      const csvContent =
        "\uFEFF" + // Add UTF-8 BOM to prevent Vietnamese font corruption in Excel
        headers.join(",") +
        "\n" +
        rows
          .map((row) =>
            row.map((val) => `"${val.replace(/"/g, '""')}"`).join(","),
          )
          .join("\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `techvie_products_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err: any) {
      alert("Lỗi xuất CSV: " + err.message);
    }
  };

  const handleImportClick = () => {
    if (parsedData.length > 0) {
      onImport(parsedData);
      onClose();
      // Reset state
      setSelectedFile(null);
      setParsedData([]);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full max-w-lg rounded-[2.5rem] border p-8 text-left font-sans shadow-2xl transition-all duration-300 ${
          d
            ? "border border-[#30363d] bg-[#161b22] text-white"
            : "text-gray-955 border border-gray-200 bg-white"
        }`}
      >
        <button
          type="button"
          onClick={onClose}
          className={`absolute top-6 right-6 flex h-8 w-8 cursor-pointer items-center justify-center rounded-full border transition-all ${
            d
              ? "border-[#30363d] text-gray-400 hover:bg-[#21262d] hover:text-white"
              : "border-gray-200 text-gray-500 hover:bg-gray-50 hover:text-black"
          }`}
        >
          <X size={14} />
        </button>

        <h3
          className={`mb-5 border-b border-gray-200/10 pb-3 text-sm font-extrabold tracking-wider uppercase ${d ? "text-white" : "text-gray-955"}`}
        >
          {title}
        </h3>

        <div className="space-y-5">
          {/* File Template Download (Excel & CSV) */}
          <div className="space-y-3">
            {/* Excel Template */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d
                  ? "border-[#30363d] bg-[#0d1117]/60"
                  : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText
                  className={`h-5 w-5 ${d ? "text-emerald-400" : "text-emerald-600"}`}
                />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Tập tin Excel mẫu
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Tải về file cấu trúc Excel (.xlsx)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 ${
                  d
                    ? "border-emerald-900/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/35"
                    : "border-emerald-150 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Tải Mẫu .xlsx
              </button>
            </div>

            {/* CSV Template */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d
                  ? "border-[#30363d] bg-[#0d1117]/60"
                  : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText
                  className={`h-5 w-5 ${d ? "text-indigo-400" : "text-indigo-600"}`}
                />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Tập tin CSV mẫu
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Tải về file cấu trúc CSV (.csv)
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleDownloadCsvTemplate}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 ${
                  d
                    ? "border-indigo-900/30 bg-indigo-950/20 text-indigo-400 hover:bg-indigo-900/35"
                    : "border-indigo-150 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                Tải Mẫu .csv
              </button>
            </div>
          </div>

          <h4 className="text-xs font-black tracking-widest text-indigo-500 uppercase pt-2">
            Xuất dữ liệu hiện tại
          </h4>

          <div className="space-y-3">
            {/* Export Excel */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText
                  className={`h-5 w-5 ${d ? "text-emerald-400" : "text-emerald-600"}`}
                />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Xuất ra tệp Excel (.xlsx)
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Xuất danh sách sản phẩm hiện tại ra file Excel
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportExcel}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 ${
                  d
                    ? "border-emerald-900/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/35"
                    : "border-emerald-150 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Xuất Excel
              </button>
            </div>

            {/* Export CSV */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileText
                  className={`h-5 w-5 ${d ? "text-indigo-400" : "text-indigo-600"}`}
                />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Xuất ra tệp CSV (.csv)
                  </span>
                  <span
                    className={`mt-0.5 block text-[10px] ${d ? "text-gray-400" : "text-gray-500"}`}
                  >
                    Xuất danh sách sản phẩm hiện tại ra file CSV
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExportCsv}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 ${
                  d
                    ? "border-indigo-900/30 bg-indigo-950/20 text-indigo-400 hover:bg-indigo-900/35"
                    : "border-indigo-150 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                Xuất CSV
              </button>
            </div>
          </div>

          <h4 className="text-xs font-black tracking-widest text-indigo-500 uppercase pt-2">
            Nhập dữ liệu mới
          </h4>

          {/* Drag & Drop Area */}
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-8 transition-all ${
              dragActive
                ? "border-indigo-500 bg-indigo-500/5"
                : d
                  ? "border-[#30363d] bg-[#0d1117]/30 hover:bg-[#161b22]"
                  : "border-gray-250 bg-slate-50/50 hover:bg-slate-100/50"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileChange}
              className="hidden"
            />
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-full ${d ? "bg-[#21262d]" : "bg-white"} border shadow-sm ${d ? "border-[#30363d]" : "border-gray-150"}`}
            >
              <Upload
                className={`h-5 w-5 ${d ? "text-gray-400" : "text-gray-500"}`}
              />
            </div>
            <div className="text-center">
              <p className="text-[11px] font-bold tracking-wider uppercase">
                Kéo thả file vào đây hoặc bấm để chọn
              </p>
              <p
                className={`mt-1 text-[9px] ${d ? "text-gray-500" : "text-gray-400"}`}
              >
                Hỗ trợ định dạng file .xlsx, .xls
              </p>
            </div>
          </div>

          {/* File selection status */}
          {selectedFile && (
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                errors.length > 0
                  ? d
                    ? "border-rose-900/30 bg-rose-950/20 text-rose-400"
                    : "border-rose-100 bg-rose-50 text-rose-700"
                  : d
                    ? "border-emerald-900/30 bg-emerald-950/20 text-emerald-400"
                    : "border-emerald-100 bg-emerald-50 text-emerald-700"
              }`}
            >
              <div className="flex items-center gap-3">
                {errors.length > 0 ? (
                  <AlertCircle className="h-5 w-5" />
                ) : (
                  <CheckCircle className="h-5 w-5" />
                )}
                <div className="text-left">
                  <span className="block max-w-xs truncate text-[11px] font-black tracking-wider uppercase">
                    {selectedFile.name}
                  </span>
                  <span className="mt-0.5 block text-[10px]">
                    {isProcessing
                      ? "Đang xử lý..."
                      : errors.length > 0
                        ? "Lỗi định dạng tệp tin"
                        : `Đã đọc thành công ${parsedData.length} dòng dữ liệu.`}
                  </span>
                </div>
              </div>
              {isProcessing && <RefreshCw className="h-4 w-4 animate-spin" />}
            </div>
          )}

          {/* Errors list */}
          {errors.length > 0 && (
            <div className="space-y-1.5 text-left">
              <span className="block text-[9px] font-black tracking-widest text-rose-500 uppercase">
                Chi tiết lỗi phát hiện:
              </span>
              <ul className="list-inside list-disc space-y-0.5 text-[10px] text-rose-400">
                {errors.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className={`flex-1 cursor-pointer rounded-xl border py-3 text-center text-xs font-black uppercase transition-all ${
                d
                  ? "border-[#30363d] text-gray-300 hover:bg-[#21262d]"
                  : "text-gray-555 border-gray-200 hover:bg-gray-50"
              }`}
            >
              Hủy bỏ
            </button>
            <button
              type="button"
              disabled={parsedData.length === 0 || errors.length > 0}
              onClick={handleImportClick}
              className={`flex-1 cursor-pointer rounded-xl py-3 text-center font-sans text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
                d
                  ? "bg-white! text-black hover:bg-gray-100!"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              Bắt đầu Nhập
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
