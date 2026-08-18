import React, { useState, useRef, useEffect } from "react";
import { X, Upload, CheckCircle, AlertCircle, FileJson, ArrowDownToLine, Check, AlertTriangle } from "lucide-react";
import JSZip from "jszip";
import { Product } from "../../types";
import { API_BASE_URL } from "../../services/api";

interface JsonImportExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportCompleted: () => void;
  isDarkMode?: boolean;
}

export default function JsonImportExportModal({
  isOpen,
  onClose,
  onImportCompleted,
  isDarkMode = false,
}: JsonImportExportModalProps) {
  const d = isDarkMode;
  const jsonFileInputRef = useRef<HTMLInputElement>(null);
  const imagesFileInputRef = useRef<HTMLInputElement>(null);

  const [jsonFile, setJsonFile] = useState<File | null>(null);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [parsedProducts, setParsedProducts] = useState<any[]>([]);
  const [matchedCount, setMatchedCount] = useState(0);
  const [unmatchedProducts, setUnmatchedProducts] = useState<string[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [importLogs, setImportLogs] = useState<string[]>([]);
  const [exporting, setExporting] = useState(false);

  const [jsonDragActive, setJsonDragActive] = useState(false);
  const [imagesDragActive, setImagesDragActive] = useState(false);

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

  const processJsonFile = (file: File) => {
    setJsonFile(file);
    setErrors([]);
    setParsedProducts([]);
    setMatchedCount(0);
    setUnmatchedProducts([]);

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsed = JSON.parse(content);
        if (!Array.isArray(parsed)) {
          setErrors(["Tệp JSON phải chứa một mảng các sản phẩm."]);
          return;
        }
        
        // Verify fields
        const validationErrors: string[] = [];
        parsed.forEach((prod, index) => {
          if (!prod.name) {
            validationErrors.push(`Sản phẩm dòng ${index + 1}: Thiếu thuộc tính "name".`);
          }
          if (prod.price === undefined || isNaN(Number(prod.price))) {
            validationErrors.push(`Sản phẩm dòng ${index + 1}: Giá trị "price" không hợp lệ.`);
          }
          if (!prod.category) {
            validationErrors.push(`Sản phẩm dòng ${index + 1}: Thiếu thuộc tính "category".`);
          }
        });

        if (validationErrors.length > 0) {
          setErrors(validationErrors.slice(0, 5));
        } else {
          setParsedProducts(parsed);
          // Auto match if images are already selected
          matchImages(parsed, imageFiles);
        }
      } catch (err) {
        setErrors(["Tệp JSON không hợp lệ hoặc bị lỗi cú pháp."]);
      }
    };
    reader.readAsText(file);
  };

  const handleJsonFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processJsonFile(e.target.files[0]);
    }
  };

  const handleJsonDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setJsonDragActive(true);
    } else if (e.type === "dragleave") {
      setJsonDragActive(false);
    }
  };

  const handleJsonDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setJsonDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.toLowerCase().endsWith(".json")) {
        processJsonFile(file);
      } else {
        setErrors(["Định dạng tệp không được hỗ trợ. Hãy kéo thả tệp products.json."]);
      }
    }
  };

  const handleImagesDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setImagesDragActive(true);
    } else if (e.type === "dragleave") {
      setImagesDragActive(false);
    }
  };

  const handleImagesDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setImagesDragActive(false);

    if (e.dataTransfer.files) {
      const filesArray = Array.from(e.dataTransfer.files);
      setImageFiles(filesArray);
      if (parsedProducts.length > 0) {
        matchImages(parsedProducts, filesArray);
      }
    }
  };

  const handleImagesChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setImageFiles(filesArray);
      if (parsedProducts.length > 0) {
        matchImages(parsedProducts, filesArray);
      }
    }
  };

  const matchImages = (products: any[], files: File[]) => {
    const fileMap = new Map<string, File>();
    files.forEach((file) => {
      // Key can be full path or name
      const name = file.name.toLowerCase();
      fileMap.set(name, file);
    });

    let matched = 0;
    const unmatched: string[] = [];

    products.forEach((prod) => {
      if (prod.image) {
        const imgName = prod.image.toLowerCase();
        const baseImgName = imgName.substring(imgName.lastIndexOf("/") + 1);
        if (fileMap.has(imgName) || fileMap.has(baseImgName)) {
          matched++;
        } else {
          unmatched.push(`${prod.name} (cần: ${prod.image})`);
        }
      } else {
        unmatched.push(`${prod.name} (không khai báo ảnh)`);
      }
    });

    setMatchedCount(matched);
    setUnmatchedProducts(unmatched);
  };

  const handleImport = async () => {
    if (parsedProducts.length === 0) return;
    setIsProcessing(true);
    setImportLogs(["Bắt đầu nhập sản phẩm..."]);

    const fileMap = new Map<string, File>();
    imageFiles.forEach((file) => {
      const name = file.name.toLowerCase();
      fileMap.set(name, file);
    });

    const token = localStorage.getItem("techvie_token") || "";
    const cleanToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < parsedProducts.length; i++) {
      const prod = parsedProducts[i];
      setImportLogs((prev) => [...prev, `Đang xử lý [${i + 1}/${parsedProducts.length}]: ${prod.name}...`]);

      try {
        const formData = new FormData();
        formData.append("name", prod.name);
        formData.append("price", String(prod.price));
        formData.append("category", prod.category);
        formData.append("description", prod.description || "");
        if (prod.specs) {
          formData.append("specs", JSON.stringify(prod.specs));
        }
        if (prod.colors) {
          formData.append("colors", JSON.stringify(prod.colors));
        }

        // Find file
        let matchedFile: File | undefined;
        if (prod.image) {
          const imgName = prod.image.toLowerCase();
          const baseImgName = imgName.substring(imgName.lastIndexOf("/") + 1);
          matchedFile = fileMap.get(imgName) || fileMap.get(baseImgName);
        }

        if (matchedFile) {
          formData.append("imageFile", matchedFile);
        } else if (prod.image && (prod.image.startsWith("http://") || prod.image.startsWith("https://"))) {
          // If it's a URL, send as image string attribute
          formData.append("image", prod.image);
        }

        const response = await fetch(`${API_BASE_URL}/api/products`, {
          method: "POST",
          headers: {
            Authorization: cleanToken,
          },
          body: formData,
        });

        const data = await response.json();
        if (response.ok && data.success) {
          successCount++;
          setImportLogs((prev) => [...prev, `✓ Thành công: ${prod.name}`]);
        } else {
          failCount++;
          setImportLogs((prev) => [...prev, `✗ Lỗi: ${prod.name} (${data.message || "Không xác định"})`]);
        }
      } catch (err: any) {
        failCount++;
        setImportLogs((prev) => [...prev, `✗ Thất bại: ${prod.name} (Lỗi kết nối: ${err.message})`]);
      }
    }

    setImportLogs((prev) => [
      ...prev,
      `--- Hoàn tất ---`,
      `Nhập thành công: ${successCount} / Thất bại: ${failCount}`,
    ]);
    setIsProcessing(false);
    onImportCompleted();
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/products?includeDeleted=true`);
      if (!response.ok) throw new Error("Không thể tải danh sách sản phẩm.");
      const products: Product[] = await response.json();

      const zip = new JSZip();
      const imagesFolder = zip.folder("images");

      const productsJsonData = products.map((prod) => {
        // Change image URLs to reference local files inside the ZIP
        let localImageName = "";
        if (prod.image) {
          const parts = prod.image.split("/");
          localImageName = parts[parts.length - 1];
        }
        return {
          name: prod.name,
          price: prod.price,
          category: prod.category,
          image: localImageName ? `images/${localImageName}` : "",
          description: prod.description,
          specs: prod.specs,
          colors: (prod as any).colors || [],
        };
      });

      zip.file("products.json", JSON.stringify(productsJsonData, null, 2));

      // Fetch images and add them to zip
      for (const prod of products) {
        if (prod.image && (prod.image.startsWith("http://") || prod.image.startsWith("https://"))) {
          try {
            const imgRes = await fetch(prod.image);
            if (imgRes.ok) {
              const blob = await imgRes.blob();
              const parts = prod.image.split("/");
              const imgName = parts[parts.length - 1];
              imagesFolder?.file(imgName, blob);
            }
          } catch (err) {
            console.error("Lỗi khi tải ảnh xuất:", prod.image, err);
          }
        }
      }

      const content = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(content);
      const link = document.createElement("a");
      link.href = url;
      link.download = `techvie_products_export_${new Date().toISOString().slice(0, 10)}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Lỗi xuất dữ liệu: " + err.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[101] flex items-center justify-center bg-black/50 p-4 backdrop-blur-[6px]"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div
        className={`relative w-full max-w-2xl rounded-[2.5rem] border p-8 text-left font-sans shadow-2xl transition-all duration-300 ${
          d
            ? "border-[#30363d] bg-[#161b22] text-white"
            : "text-gray-955 border-gray-200 bg-white"
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
          className={`mb-5 border-b border-gray-200/10 pb-3 text-sm font-extrabold tracking-wider uppercase ${
            d ? "text-white" : "text-gray-955"
          }`}
        >
          Nhập / Xuất Sản Phẩm Qua JSON & Thư Mục Ảnh
        </h3>

        <div className="space-y-4">
          {/* Template Download Panel */}
          <div className="space-y-3">
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <FileJson className="h-5 w-5 text-indigo-400" />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Tải mẫu JSON + Thư mục ảnh
                  </span>
                  <span className={`mt-0.5 block text-[9px] ${d ? "text-gray-400" : "text-gray-500"}`}>
                    Tải xuống tệp ZIP chứa products.json mẫu & thư mục ảnh mẫu
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={async () => {
                  try {
                    const zip = new JSZip();
                    const sampleJson = [
                      {
                        name: "Laptop Asus ZenBook 14 Mẫu",
                        price: 24990000,
                        category: "Laptop",
                        image: "images/asus-zenbook-14-sample.jpg",
                        description: "Laptop Asus ZenBook 14 mỏng nhẹ, hiệu năng cao phục vụ văn phòng và đồ họa nhẹ.",
                        specs: [
                          { label: "CPU", value: "AMD Ryzen 5 7530U" },
                          { label: "RAM", value: "16GB LPDDR4X" },
                          { label: "SSD", value: "512GB PCIe NVMe" }
                        ],
                        colors: ["Xám vũ trụ", "Xanh đại dương"]
                      },
                      {
                        name: "Bàn phím cơ Custom TechVie Mẫu",
                        price: 3500000,
                        category: "Bàn phím",
                        image: "images/techvie-custom-keyboard-sample.jpg",
                        description: "Bàn phím cơ custom cao cấp gõ êm mượt, hot-swap.",
                        specs: [
                          { label: "Layout", value: "75% compact" },
                          { label: "Switches", value: "Linear Gateron Oil King" }
                        ],
                        colors: ["Trắng sữa", "Xám Graphite"]
                      }
                    ];
                    zip.file("products.json", JSON.stringify(sampleJson, null, 2));

                    // Add empty dummy images into images/ folder
                    const imgFolder = zip.folder("images");
                    
                    // Helper to create a solid color 1x1 pixel PNG blob
                    const createDummyImageBlob = () => {
                      const canvas = document.createElement("canvas");
                      canvas.width = 100;
                      canvas.height = 100;
                      const ctx = canvas.getContext("2d");
                      if (ctx) {
                        ctx.fillStyle = "#6366f1";
                        ctx.fillRect(0, 0, 100, 100);
                        ctx.fillStyle = "#ffffff";
                        ctx.font = "bold 12px sans-serif";
                        ctx.textAlign = "center";
                        ctx.textBaseline = "middle";
                        ctx.fillText("TechVie", 50, 50);
                      }
                      return new Promise<Blob>((resolve) => canvas.toBlob((b) => resolve(b || new Blob()), "image/jpeg"));
                    };

                    const dummyBlob = await createDummyImageBlob();
                    imgFolder?.file("asus-zenbook-14-sample.jpg", dummyBlob);
                    imgFolder?.file("techvie-custom-keyboard-sample.jpg", dummyBlob);

                    const content = await zip.generateAsync({ type: "blob" });
                    const url = URL.createObjectURL(content);
                    const link = document.createElement("a");
                    link.href = url;
                    link.download = "techvie_product_import_sample.zip";
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                  } catch (err: any) {
                    alert("Lỗi tải tệp mẫu: " + err.message);
                  }
                }}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 ${
                  d
                    ? "border-emerald-900/30 bg-emerald-950/20 text-emerald-400 hover:bg-emerald-900/35"
                    : "border-emerald-150 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                }`}
              >
                Tải File Mẫu (.zip)
              </button>
            </div>

            {/* Export ZIP Card */}
            <div
              className={`flex items-center justify-between rounded-2xl border p-4 ${
                d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-100 bg-slate-50"
              }`}
            >
              <div className="flex items-center gap-3">
                <ArrowDownToLine className="h-5 w-5 text-indigo-400" />
                <div className="text-left">
                  <span className="block text-[11px] font-black tracking-wider uppercase">
                    Xuất JSON + Ảnh sản phẩm
                  </span>
                  <span className={`mt-0.5 block text-[9px] ${d ? "text-gray-400" : "text-gray-500"}`}>
                    Tải về file ZIP chứa dữ liệu JSON và toàn bộ hình ảnh của sản phẩm hiện tại
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleExport}
                disabled={exporting}
                className={`cursor-pointer rounded-lg border px-3 py-1.5 text-[9px] font-bold tracking-wider uppercase transition-all active:scale-95 disabled:opacity-40 disabled:cursor-not-allowed ${
                  d
                    ? "border-indigo-900/30 bg-indigo-950/20 text-indigo-400 hover:bg-indigo-900/35"
                    : "border-indigo-150 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
                }`}
              >
                {exporting ? "Đang xuất..." : "Xuất File ZIP"}
              </button>
            </div>
          </div>

          <h4 className="text-xs font-black tracking-widest text-indigo-500 uppercase pt-2">
            Nhập từ JSON + Ảnh
          </h4>

          {/* JSON & Image Select Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* JSON File Drag & Drop Card */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                Bước 1: Cấu trúc sản phẩm (.json)
              </label>
              <div
                onClick={() => jsonFileInputRef.current?.click()}
                onDragEnter={handleJsonDrag}
                onDragOver={handleJsonDrag}
                onDragLeave={handleJsonDrag}
                onDrop={handleJsonDrop}
                className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 transition-all min-h-[160px] text-center cursor-pointer ${
                  jsonDragActive
                    ? "border-indigo-500 bg-indigo-500/5 scale-[1.01]"
                    : d
                      ? "border-[#30363d] bg-[#0d1117]/40 hover:bg-[#161b22] hover:border-gray-650"
                      : "border-gray-250 bg-slate-50/50 hover:bg-slate-100/50 hover:border-gray-400"
                }`}
              >
                <input
                  ref={jsonFileInputRef}
                  type="file"
                  accept=".json"
                  onChange={handleJsonFileChange}
                  className="hidden"
                />
                <div className={`p-3 rounded-full ${d ? "bg-[#21262d]" : "bg-white"} border shadow-sm`}>
                  <FileJson className="h-5 w-5 text-indigo-400 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[11px] font-bold tracking-wider uppercase">
                    {jsonFile ? jsonFile.name : "Tải lên products.json"}
                  </span>
                  <span className={`block text-[9px] ${d ? "text-gray-500" : "text-gray-400"}`}>
                    Kéo thả file hoặc bấm để chọn tệp tin cấu trúc
                  </span>
                </div>
              </div>
            </div>

            {/* Images Folder Drag & Drop Card */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider block">
                Bước 2: Tài nguyên hình ảnh (Folder)
              </label>
              <div
                onClick={() => imagesFileInputRef.current?.click()}
                onDragEnter={handleImagesDrag}
                onDragOver={handleImagesDrag}
                onDragLeave={handleImagesDrag}
                onDrop={handleImagesDrop}
                className={`flex flex-col items-center justify-center gap-3 rounded-3xl border-2 border-dashed p-6 transition-all min-h-[160px] text-center cursor-pointer ${
                  imagesDragActive
                    ? "border-emerald-500 bg-emerald-500/5 scale-[1.01]"
                    : d
                      ? "border-[#30363d] bg-[#0d1117]/40 hover:bg-[#161b22] hover:border-gray-650"
                      : "border-gray-250 bg-slate-50/50 hover:bg-slate-100/50 hover:border-gray-400"
                }`}
              >
                <input
                  ref={imagesFileInputRef}
                  type="file"
                  multiple
                  // @ts-ignore
                  webkitdirectory=""
                  directory=""
                  onChange={handleImagesChange}
                  className="hidden"
                />
                <div className={`p-3 rounded-full ${d ? "bg-[#21262d]" : "bg-white"} border shadow-sm`}>
                  <Upload className="h-5 w-5 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-0.5">
                  <span className="block text-[11px] font-bold tracking-wider uppercase">
                    {imageFiles.length > 0
                      ? `Đã chọn ${imageFiles.length} hình ảnh`
                      : "Chọn thư mục chứa ảnh"}
                  </span>
                  <span className={`block text-[9px] ${d ? "text-gray-500" : "text-gray-400"}`}>
                    Kéo thả thư mục hoặc chọn hàng loạt ảnh mockup
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Validation & Matching Info */}
          {parsedProducts.length > 0 && (
            <div
              className={`rounded-2xl border p-4 text-xs space-y-2 ${
                d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-150 bg-slate-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span>Số sản phẩm đã đọc:</span>
                <strong className="font-mono text-indigo-400">{parsedProducts.length}</strong>
              </div>
              <div className="flex items-center justify-between">
                <span>Ảnh khớp khớp:</span>
                <strong className="font-mono text-emerald-400">{matchedCount}</strong>
              </div>
              {unmatchedProducts.length > 0 && (
                <div className="mt-2 text-[10px]">
                  <span className="flex items-center gap-1 text-amber-500 font-bold uppercase">
                    <AlertTriangle size={12} /> Thiếu ảnh:
                  </span>
                  <ul className="mt-1 max-h-24 overflow-y-auto list-disc list-inside space-y-0.5 text-gray-400">
                    {unmatchedProducts.map((u, i) => (
                      <li key={i}>{u}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {errors.length > 0 && (
            <div className="rounded-xl border border-rose-900/30 bg-rose-950/20 p-3 text-[10px] text-rose-400">
              {errors.map((err, idx) => (
                <div key={idx} className="flex gap-1.5 items-start">
                  <AlertCircle size={12} className="mt-0.5 flex-shrink-0" />
                  <span>{err}</span>
                </div>
              ))}
            </div>
          )}

          {/* Logs */}
          {importLogs.length > 0 && (
            <div className="flex flex-col min-h-36">
              <span className="block text-[10px] font-bold text-gray-400 uppercase mb-1.5">
                Tiến trình Nhập:
              </span>
              <div
                className={`flex-1 rounded-2xl border p-3 font-mono text-[9px] max-h-40 overflow-y-auto space-y-1 ${
                  d ? "border-[#30363d] bg-[#0d1117]/80 text-emerald-400" : "border-gray-200 bg-gray-900 text-emerald-400"
                }`}
              >
                {importLogs.map((log, i) => (
                  <div key={i}>{log}</div>
                ))}
              </div>
            </div>
          )}

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
              disabled={parsedProducts.length === 0 || isProcessing}
              onClick={handleImport}
              className={`flex-1 cursor-pointer rounded-xl py-3 text-center text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 disabled:pointer-events-none disabled:opacity-40 ${
                d
                  ? "bg-white! text-black hover:bg-gray-100!"
                  : "bg-black text-white hover:bg-gray-900"
              }`}
            >
              {isProcessing ? "Đang tiến hành..." : "Bắt đầu Nhập"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
