import React, { useState, useEffect, useRef } from "react";
import { Product } from "../../types";
import { API_BASE_URL } from "../../services/api";
import {
  Trash2,
  Plus,
  UploadCloud,
  Smartphone,
  Laptop,
  Watch,
  Volume2,
  Keyboard,
  Package,
  Layers,
  Sparkles,
  Zap,
  Award,
  Clock,
} from "lucide-react";

const categoryIconMap: Record<string, React.ReactNode> = {
  "Điện thoại": <Smartphone className="w-4 h-4" strokeWidth={1.5} />,
  Laptop: <Laptop className="w-4 h-4" strokeWidth={1.5} />,
  "Đồng hồ": <Watch className="w-4 h-4" strokeWidth={1.5} />,
  "Âm thanh": <Volume2 className="w-4 h-4" strokeWidth={1.5} />,
  "Bàn phím": <Keyboard className="w-4 h-4" strokeWidth={1.5} />,
};

const badgeConfigMap: Record<string, { label: string; icon: React.ReactNode; style: string }> = {
  NORMAL: {
    label: "NORMAL (Không nhãn)",
    icon: <Package className="w-4 h-4" strokeWidth={1.5} />,
    style: "bg-gray-100 text-gray-700 border-gray-200",
  },
  PREMIUM: {
    label: "PREMIUM (Cao cấp)",
    icon: <Sparkles className="w-4 h-4" strokeWidth={1.5} />,
    style: "bg-indigo-50 border-indigo-200 text-indigo-700",
  },
  TRENDY: {
    label: "TRENDY (Xu hướng)",
    icon: <Zap className="w-4 h-4" strokeWidth={1.5} />,
    style: "bg-emerald-50 border-emerald-200 text-emerald-700",
  },
  FLAGSHIP: {
    label: "FLAGSHIP (Đầu bảng)",
    icon: <Award className="w-4 h-4" strokeWidth={1.5} />,
    style: "bg-rose-50 border-rose-200 text-rose-700",
  },
  LIMITED: {
    label: "LIMITED (Giới hạn)",
    icon: <Clock className="w-4 h-4" strokeWidth={1.5} />,
    style: "bg-amber-50 border-amber-200 text-amber-700",
  },
};

interface ProductFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  editingProduct: Product | null;
  onSave: (productData: any, imageFile: File | null) => void;
  isDarkMode?: boolean;
}

export default function ProductFormModal({
  isOpen,
  onClose,
  editingProduct,
  onSave,
  isDarkMode = false,
}: ProductFormModalProps) {
  // Input fields local states
  const [prodName, setProdName] = useState("");
  const [prodPrice, setProdPrice] = useState<number>(0);
  const [prodStock, setProdStock] = useState<number>(0);
  const [prodCategory, setProdCategory] = useState("");
  const [prodImage, setProdImage] = useState("");
  const [prodDesc, setProdDesc] = useState("");
  const [prodColors, setProdColors] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [prodBadge, setProdBadge] = useState("NORMAL");
  const [categoriesList, setCategoriesList] = useState<
    { name: string; icon: React.ReactNode }[]
  >([]);

  const d = isDarkMode;

  // Helper functions for formatting price with dots (thousands separator) without cursor jumping
  const formatPriceWithDots = (num: number): string => {
    if (num === 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart || 0;
    const valueBeforeCursor = input.value.slice(0, selectionStart);
    const digitsBefore = valueBeforeCursor.replace(/\D/g, "").length;

    const rawValue = input.value.replace(/\D/g, "");
    const parsedValue = parseInt(rawValue, 10) || 0;

    setProdPrice(parsedValue);

    const formatted = formatPriceWithDots(parsedValue);

    setTimeout(() => {
      let newCursorPos = 0;
      let digitCount = 0;
      for (let i = 0; i < formatted.length; i++) {
        if (formatted[i] !== ".") {
          digitCount++;
        }
        newCursorPos = i + 1;
        if (digitCount === digitsBefore) {
          break;
        }
      }
      input.setSelectionRange(newCursorPos, newCursorPos);
    }, 0);
  };

  // Dynamic Specifications representation matching user's dynamic specs requirement
  const [formSpecs, setFormSpecs] = useState<
    { label: string; value: string }[]
  >([]);

  // Custom Dropdown State & Ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Custom Dropdown State & Ref for Badge
  const [isBadgeDropdownOpen, setIsBadgeDropdownOpen] = useState(false);
  const badgeDropdownRef = useRef<HTMLDivElement>(null);

  // Xử lý sự kiện click ra ngoài để tự động đóng menu
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        badgeDropdownRef.current &&
        !badgeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsBadgeDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/api/categories`);
        const data = await response.json();
        if (data.success && data.categories) {
          const fetchedCategories = data.categories.map((cat: any) => ({
            name: cat.name,
            icon: categoryIconMap[cat.name] || (
              <Package className="w-4 h-4" strokeWidth={1.5} />
            ),
          }));
          setCategoriesList(fetchedCategories);

          // Set default category if none selected and not editing
          if (
            !prodCategory &&
            fetchedCategories.length > 0 &&
            !editingProduct
          ) {
            setProdCategory(fetchedCategories[0].name);
          }
        }
      } catch (error) {
        console.error("Lỗi lấy danh mục:", error);
      }
    };

    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, editingProduct, prodCategory]);

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

  // Prefill form states when modal is opened or editingProduct is changed
  useEffect(() => {
    if (isOpen) {
      setImageFile(null);
      if (editingProduct) {
        setProdName(editingProduct.name);
        setProdPrice(editingProduct.price);
        setProdStock(editingProduct.stock ?? 0);
        setProdCategory(editingProduct.category);
        setProdImage(editingProduct.image);
        setProdDesc(editingProduct.description || "");
        setFormSpecs(editingProduct.specs || []);
        setProdColors(editingProduct.colors ? editingProduct.colors.join(", ") : "");
        setProdBadge(editingProduct.badge || "NORMAL");
      } else {
        setProdName("");
        setProdPrice(0);
        setProdStock(0);
        setProdCategory("");
        setProdImage("");
        setProdDesc("");
        setFormSpecs([]);
        setProdColors("");
        setProdBadge("NORMAL");
      }
    }
  }, [isOpen, editingProduct]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodName.trim()) return;

    const productData = {
      id: editingProduct?.id,
      name: prodName,
      price: prodPrice,
      stock: prodStock,
      category: prodCategory,
      image: prodImage,
      description: prodDesc,
      specs: formSpecs,
      colors: prodColors.split(',').map(c => c.trim()).filter(Boolean),
      badge: prodBadge,
    };

    onSave(productData, imageFile);
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-[6px] z-[100] flex items-center justify-center p-4 overflow-y-auto scrollbar-none"
      style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <style>{`
        .scrollbar-none::-webkit-scrollbar {
          display: none;
        }
      `}</style>
      <div
        className={`rounded-[2.5rem] p-6 md:p-10 max-w-7xl w-full relative font-sans text-xs my-auto transition-all duration-300 ${
          d
            ? "bg-[#161b22] border border-[#30363d] text-white shadow-[0_24px_70px_rgba(0,0,0,0.4)]"
            : "bg-white border border-gray-200 text-gray-955 shadow-[0_24px_70px_rgba(0,0,0,0.12)]"
        }`}
      >
        {/* Top-Right Action Control Area next to close button */}
        <div className="absolute top-6 right-6 md:top-10 md:right-10 flex items-center gap-3.5 z-10">
          <button
            type="button"
            onClick={onClose}
            className={`px-5 py-2.5 rounded-xl border transition-all font-sans text-xs font-black uppercase cursor-pointer ${
              d
                ? "border-[#30363d] text-gray-100 hover:bg-[#21262d] hover:text-white"
                : "border-gray-200 text-gray-655 hover:bg-gray-50 hover:text-black"
            }`}
          >
            Hủy bỏ
          </button>
          <button
            type="submit"
            form="product-form-modal-form"
            className={`px-5 py-2.5 rounded-xl font-sans text-xs uppercase tracking-widest font-black transition-all shadow active:scale-95 cursor-pointer ${
              d
                ? "bg-white! hover:bg-gray-100! text-black"
                : "bg-black hover:bg-gray-900 text-white"
            }`}
          >
            {editingProduct ? "thay đổi sản phẩm" : "đăng bán sản phẩm"}
          </button>
          <button
            type="button"
            onClick={onClose}
            className={`w-10 h-10 rounded-full border flex items-center justify-center transition-colors cursor-pointer shrink-0 ${
              d
                ? "border-[#30363d] hover:border-white text-gray-400 hover:text-white"
                : "border-gray-200 hover:border-black text-gray-500 hover:text-black"
            }`}
            title="Đóng bảng chỉnh sửa"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <h2
          className={`text-2xl font-black uppercase tracking-tight mb-6 text-left pr-60 ${d ? "text-white" : "text-gray-900"}`}
        >
          {editingProduct ? "Hiệu chỉnh đặc tả độc bản" : "Chế tác nguyên mẫu"}
        </h2>

        <form
          id="product-form-modal-form"
          onSubmit={handleSubmit}
          className="space-y-6"
        >
          {/* Prominent Section 1: Thông tin chung */}
          <section
            className={`border rounded-3xl p-6 text-left transition-all duration-300 ${
              d ? "bg-[#0d1117]/60 border-[#30363d]" : "bg-slate-50 border-gray-100"
            }`}
          >
            <div className="flex items-center gap-2 mb-4">
              <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                01 / Thông tin chung
              </span>
              <div
                className={`h-px flex-1 ${d ? "bg-[#30363d]/60" : "bg-gray-200/60"}`}
              ></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Name field */}
              <div className="lg:col-span-12 space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Tên thiết bị *
                </label>
                <input
                  type="text"
                  required
                  value={prodName}
                  onChange={(e) => setProdName(e.target.value)}
                  placeholder="Ví dụ: TechVie Ultra Book X"
                  className={`w-full focus:outline-none focus:ring-1 rounded-xl px-4 py-3 text-xs transition-all font-semibold ${
                    d
                      ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                      : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Pricing field */}
              <div className="lg:col-span-6 space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Giá bán niêm yết (VND) *
                </label>
                <input
                  type="text"
                  required
                  value={formatPriceWithDots(prodPrice)}
                  onChange={handlePriceChange}
                  placeholder="0"
                  className={`w-full focus:outline-none focus:ring-1 rounded-xl px-4 py-3 text-xs transition-all font-mono font-bold ${
                    d
                      ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                      : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905 placeholder-gray-400"
                  }`}
                />
              </div>

              {/* Stock field with big increase/decrease buttons */}
              <div className="lg:col-span-6 space-y-2">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Tồn kho
                </label>
                <div className="flex items-center w-full gap-2">
                  <button
                    type="button"
                    onClick={() => setProdStock(prev => Math.max(0, prev - 1))}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-lg transition-all active:scale-90 cursor-pointer flex-shrink-0 ${
                      d
                        ? "border-[#30363d] bg-[#21262d] text-white hover:bg-white/10"
                        : "border-gray-250 bg-gray-50 text-gray-700 hover:bg-gray-150"
                    }`}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={0}
                    value={prodStock}
                    onChange={(e) => setProdStock(Math.max(0, parseInt(e.target.value) || 0))}
                    placeholder="0"
                    className={`flex-1 text-center focus:outline-none focus:ring-1 rounded-xl py-3 text-xs transition-all font-mono font-bold [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none min-w-0 ${
                      d
                        ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                        : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905 placeholder-gray-400"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setProdStock(prev => prev + 1)}
                    className={`w-11 h-11 rounded-xl border flex items-center justify-center font-bold text-lg transition-all active:scale-90 cursor-pointer flex-shrink-0 ${
                      d
                        ? "border-[#30363d] bg-[#21262d] text-white hover:bg-white/10"
                        : "border-gray-250 bg-gray-50 text-gray-700 hover:bg-gray-150"
                    }`}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* Category selector */}
              <div className="lg:col-span-6 relative" ref={dropdownRef}>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Phân loại thiết bị
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${
                      d
                        ? isDropdownOpen
                          ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                          : "bg-[#161b22] border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                        : isDropdownOpen
                          ? "bg-white border-black text-gray-905 shadow-sm"
                          : "bg-white border-gray-200 text-gray-905 hover:border-gray-300 hover:bg-gray-50/50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1 rounded-lg transition-colors ${
                        isDropdownOpen
                          ? d
                            ? "bg-[#21262d] text-white"
                            : "bg-slate-100 text-black"
                          : d
                            ? "bg-[#0d1117] text-gray-400"
                            : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {
                        (
                          categoriesList.find((c) => c.name === prodCategory) ||
                          categoriesList[0] || {
                            icon: (
                              <Package className="w-4 h-4" strokeWidth={1.5} />
                            ),
                          }
                        ).icon
                      }
                    </span>
                    <span
                      className={`font-bold text-xs ${d ? "text-white" : "text-gray-900"}`}
                    >
                      {prodCategory}
                    </span>
                  </div>

                  {/* Chevron Arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-black" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className={`absolute top-full left-0 z-50 w-full mt-2 rounded-2xl shadow-xl py-2 animate-fade-in text-xs transition-all duration-350 border ${
                      d
                        ? "bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                        : "bg-white border-gray-200 text-gray-900 shadow-xl"
                    }`}
                  >
                    <ul
                      className="max-h-60 overflow-auto scrollbar-none space-y-1"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {categoriesList.map((category) => (
                        <li
                          key={category.name}
                          onClick={() => {
                            setProdCategory(category.name);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors mx-2 rounded-xl group
                            ${
                              prodCategory === category.name
                                ? d
                                  ? "bg-[#21262d] text-white font-black hover:bg-white/10 hover:text-white"
                                  : "bg-slate-100 text-black font-black hover:bg-black hover:text-white"
                                : d
                                  ? "text-gray-350 hover:bg-[#21262d] hover:text-white font-bold"
                                  : "text-gray-600 hover:bg-black hover:text-white font-bold"
                            }
                          `}
                        >
                          <span
                            className={`${prodCategory === category.name ? (d ? "text-white" : "text-black") : "text-slate-400"} group-hover:text-white transition-colors`}
                          >
                            {category.icon}
                          </span>
                          <span className="flex-1 text-xs">
                            {category.name}
                          </span>

                          {/* Checkmark indicator */}
                          {prodCategory === category.name && (
                            <svg
                              className={`w-4 h-4 group-hover:text-white transition-colors ${d ? "text-white" : "text-black"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Badge selector */}
              <div className="lg:col-span-6 relative" ref={badgeDropdownRef}>
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                  Nhãn dán quảng bá (Product Badge)
                </label>

                {/* Custom Trigger Button */}
                <button
                  type="button"
                  onClick={() => setIsBadgeDropdownOpen(!isBadgeDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-2 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${
                      d
                        ? isBadgeDropdownOpen
                          ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                          : "bg-[#161b22] border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                        : isBadgeDropdownOpen
                          ? "bg-white border-black text-gray-905 shadow-sm"
                          : "bg-white border-gray-200 text-gray-905 hover:border-gray-300 hover:bg-gray-50/50"
                    }
                  `}
                >
                  <div className="flex items-center gap-3">
                    <span
                      className={`p-1 rounded-lg transition-colors ${
                        isBadgeDropdownOpen
                          ? d
                            ? "bg-[#21262d] text-white"
                            : "bg-slate-100 text-black"
                          : d
                            ? "bg-[#0d1117] text-gray-400"
                            : "bg-slate-50 text-slate-500"
                      }`}
                    >
                      {(badgeConfigMap[prodBadge] || badgeConfigMap["NORMAL"]).icon}
                    </span>
                    <span
                      className={`font-bold text-xs ${d ? "text-white" : "text-gray-900"}`}
                    >
                      {(badgeConfigMap[prodBadge] || badgeConfigMap["NORMAL"]).label}
                    </span>
                  </div>

                  {/* Chevron Arrow */}
                  <svg
                    className={`w-4 h-4 text-gray-400 transition-transform duration-300 ${isBadgeDropdownOpen ? "rotate-180 text-black" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {/* Dropdown Menu */}
                {isBadgeDropdownOpen && (
                  <div
                    className={`absolute top-full left-0 z-50 w-full mt-2 rounded-2xl shadow-xl py-2 animate-fade-in text-xs transition-all duration-350 border ${
                      d
                        ? "bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                        : "bg-white border-gray-200 text-gray-900 shadow-xl"
                    }`}
                  >
                    <ul
                      className="max-h-60 overflow-auto scrollbar-none space-y-1"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      {Object.entries(badgeConfigMap).map(([key, config]) => (
                        <li
                          key={key}
                          onClick={() => {
                            setProdBadge(key);
                            setIsBadgeDropdownOpen(false);
                          }}
                          className={`flex items-center gap-3 px-4 py-2.5 cursor-pointer transition-colors mx-2 rounded-xl group
                            ${
                              prodBadge === key
                                ? d
                                  ? "bg-[#21262d] text-white font-black hover:bg-white/10 hover:text-white"
                                  : "bg-slate-100 text-black font-black hover:bg-black hover:text-white"
                                : d
                                  ? "text-gray-350 hover:bg-[#21262d] hover:text-white font-bold"
                                  : "text-gray-600 hover:bg-black hover:text-white font-bold"
                            }
                          `}
                        >
                          <span
                            className={`${prodBadge === key ? (d ? "text-white" : "text-black") : "text-slate-400"} group-hover:text-white transition-colors`}
                          >
                            {config.icon}
                          </span>
                          <span className="flex-1 text-xs">
                            {config.label}
                          </span>

                          {/* Checkmark indicator */}
                          {prodBadge === key && (
                            <svg
                              className={`w-4 h-4 group-hover:text-white transition-colors ${d ? "text-white" : "text-black"}`}
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2.5}
                                d="M5 13l4 4L19 7"
                              />
                            </svg>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Colors input */}
              <div className="lg:col-span-12 space-y-2 mt-4">
                <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider">
                  Màu sắc khả dụng (Phân cách bằng dấu phẩy)
                </label>
                <input
                  type="text"
                  value={prodColors}
                  onChange={(e) => setProdColors(e.target.value)}
                  placeholder="Ví dụ: Đen, Trắng, Xanh Dương, Titan Tự Nhiên"
                  className={`w-full focus:outline-none focus:ring-1 rounded-xl px-4 py-3 text-xs transition-all font-semibold ${
                    d
                      ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                      : "bg-white border border-gray-250 focus:border-black focus:ring-black text-gray-905 placeholder-gray-400"
                  }`}
                />
              </div>
            </div>
          </section>

          {/* Grid Bottom: Description & Image on one row, Specs on full width below */}
          <div className="space-y-6 mt-6">
            {/* Row 1: 02 / Description and 03 / Image & Render */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
              {/* Column 1: Description */}
              <section
                className={`border rounded-3xl p-6 flex flex-col text-left transition-all duration-300 ${
                  d
                    ? "bg-[#0d1117]/60 border-[#30363d]"
                    : "bg-slate-50 border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    02 / Mô tả sản phẩm
                  </span>
                  <div
                    className={`h-px flex-1 ${d ? "bg-[#30363d]/60" : "bg-gray-200/60"}`}
                  ></div>
                </div>
                <div className="flex-1 flex flex-col">
                  <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Mô tả đặc tính cốt lõi
                  </label>
                  <textarea
                    value={prodDesc}
                    onChange={(e) => setProdDesc(e.target.value)}
                    placeholder="Nhập những đặc điểm nổi bật đặc biệt nhất của thiết bị..."
                    className={`w-full flex-1 min-h-[220px] focus:outline-none focus:ring-1 rounded-xl px-4 py-3 text-xs transition-all resize-none leading-relaxed ${
                      d
                        ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                        : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-900 placeholder-gray-400"
                    }`}
                  />
                </div>
              </section>

              {/* Column 2: Media/Image upload preview */}
              <section
                className={`border rounded-3xl p-6 flex flex-col text-left transition-all duration-300 ${
                  d
                    ? "bg-[#0d1117]/60 border-[#30363d]"
                    : "bg-slate-50 border-gray-100"
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                    03 / Hình ảnh & Render
                  </span>
                  <div
                    className={`h-px flex-1 ${d ? "bg-[#30363d]/60" : "bg-gray-200/60"}`}
                  ></div>
                </div>
                <div className="flex-1 flex flex-col space-y-3">
                  {/* Hidden File Input */}
                  <input
                    type="file"
                    id="product-image-file-input"
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setImageFile(e.target.files[0]);
                      }
                    }}
                    className="hidden"
                  />

                  {/* Preview & Upload Dropzone Container */}
                  <div
                    className={`relative group border border-dashed rounded-2xl p-4 flex-1 flex flex-col items-center justify-center gap-2 transition-all min-h-[170px] ${
                      d
                        ? "border-[#30363d] bg-[#161b22] hover:bg-[#21262d]/45"
                        : "border-gray-200 bg-white hover:bg-slate-50"
                    }`}
                  >
                    {imageFile || prodImage ? (
                      <div className="relative w-full h-full flex flex-col items-center justify-center overflow-hidden min-h-[130px]">
                        <img
                          referrerPolicy="no-referrer"
                          src={
                            imageFile ? URL.createObjectURL(imageFile) : prodImage
                          }
                          alt="Mockup preview"
                          className={`max-h-[110px] object-contain p-1 group-hover:scale-105 transition-transform duration-300 ${d ? "" : "mix-blend-multiply"}`}
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none";
                          }}
                        />
                        <div
                          className={`absolute top-0 left-0 px-1.5 py-0.5 rounded border text-[8px] font-mono tracking-widest font-bold uppercase flex items-center gap-0.5 ${
                            d
                              ? "bg-[#0d1117] border-[#30363d] text-gray-400"
                              : "bg-gray-50 border-gray-200 text-gray-500"
                          }`}
                        >
                          preview
                        </div>

                        {/* Button chọn ảnh mới gọn gàng ngay bên dưới preview */}
                        <label
                          htmlFor="product-image-file-input"
                          className={`mt-2 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[11px] font-bold tracking-wide transition-all cursor-pointer shadow-sm active:scale-95 ${
                            d
                              ? "bg-[#21262d] border-[#30363d] text-gray-200 hover:bg-[#30363d] hover:text-white"
                              : "bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-150 hover:text-black"
                          }`}
                        >
                          <UploadCloud className="w-3.5 h-3.5" />
                          <span>Tải ảnh mới từ máy</span>
                        </label>
                      </div>
                    ) : (
                      <label
                        htmlFor="product-image-file-input"
                        className="flex flex-col items-center justify-center gap-2 cursor-pointer w-full h-full p-2"
                      >
                        <div className={`p-3 rounded-2xl ${d ? "bg-[#21262d]" : "bg-slate-100"}`}>
                          <UploadCloud className="text-gray-400 animate-pulse" size={22} />
                        </div>

                        <div className="text-center space-y-0.5">
                          <span className="text-xs font-bold text-gray-700 dark:text-gray-200 block">
                            Nhấn vào đây để tải ảnh từ máy
                          </span>
                          <span className="text-[10px] text-gray-400 font-medium block">
                            Hỗ trợ PNG, JPG, WEBP, SVG
                          </span>
                        </div>
                      </label>
                    )}
                  </div>

                  {/* Input nhập URL giữ nguyên phía dưới */}
                  <div className="space-y-1">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">
                      Hoặc dán URL Đường dẫn ảnh
                    </label>
                    <input
                      type="text"
                      value={prodImage}
                      onChange={(e) => setProdImage(e.target.value)}
                      placeholder="Dán liên kết hình ảnh"
                      className={`w-full focus:outline-none focus:ring-1 rounded-xl px-3 py-2 text-xs transition-all font-mono ${
                        d
                          ? "bg-[#161b22] border border-[#30363d] focus:!border-white focus:!ring-white !text-white placeholder-gray-500"
                          : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-900 placeholder-gray-400"
                      }`}
                    />
                  </div>
                </div>
              </section>
            </div>

            {/* Row 2: 04 / Technical specifications (Full Width) */}
            <section
              className={`border rounded-3xl p-6 flex flex-col text-left transition-all duration-300 ${
                d
                  ? "bg-[#0d1117]/60 border-[#30363d]"
                  : "bg-slate-50 border-gray-100"
              }`}
            >
              <div className="flex items-center gap-2 mb-4">
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  04 / Thông số kỹ thuật
                </span>
                <div
                  className={`h-px flex-1 ${d ? "bg-[#30363d]/60" : "bg-gray-200/60"}`}
                ></div>
              </div>
              <div className="space-y-3 flex-1 pr-1">
                {formSpecs.map((spec, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-2xl group transition-all flex gap-3 items-center shadow-[0_2px_6px_rgba(0,0,0,0.01)] border ${
                      d
                        ? "bg-[#161b22] border-[#30363d] hover:border-white/20"
                        : "bg-white border-gray-200 hover:border-black/15"
                    }`}
                  >
                    <div className="flex-1 min-w-0 grid grid-cols-2 gap-4">
                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">
                          Tên thông số
                        </span>
                        <textarea
                          required
                          rows={2}
                          value={spec.label}
                          onChange={(e) => {
                            const newSpecs = [...formSpecs];
                            newSpecs[index].label = e.target.value;
                            setFormSpecs(newSpecs);
                          }}
                          className={`w-full bg-transparent border-0 p-0 text-xs font-black focus:outline-none focus:ring-0 resize-none leading-normal whitespace-pre-wrap break-words scrollbar-none ${
                            d
                              ? "text-slate-200 placeholder-slate-600"
                              : "text-slate-800 placeholder-slate-350"
                          }`}
                          placeholder="Nhập vào đây..."
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        />
                      </div>

                      <div className="space-y-0.5">
                        <span className="text-[8px] uppercase font-black text-slate-400 tracking-wider block">
                          Giá trị
                        </span>
                        <textarea
                          required
                          rows={2}
                          value={spec.value}
                          onChange={(e) => {
                            const newSpecs = [...formSpecs];
                            newSpecs[index].value = e.target.value;
                            setFormSpecs(newSpecs);
                          }}
                          className={`w-full bg-transparent border-0 p-0 text-xs font-semibold focus:outline-none focus:ring-0 resize-none leading-normal whitespace-pre-wrap break-words scrollbar-none ${
                            d
                              ? "text-white placeholder-slate-600"
                              : "text-slate-900 placeholder-slate-350"
                          }`}
                          placeholder="Giá trị..."
                          style={{
                            scrollbarWidth: "none",
                            msOverflowStyle: "none",
                          }}
                        />
                      </div>
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={() => {
                        const newSpecs = formSpecs.filter(
                          (_, i) => i !== index,
                        );
                        setFormSpecs(newSpecs);
                      }}
                      className={`w-7 h-7 rounded-lg border flex items-center justify-center transition-all duration-200 active:scale-95 shrink-0 cursor-pointer ${
                        d
                          ? "bg-[#21262d] text-gray-400 hover:bg-rose-950/40 hover:text-rose-400 border-[#30363d]"
                          : "bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 border-slate-100"
                      }`}
                      title="Gỡ bỏ thông số"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}

                {/* Add new spec dynamic button */}
                <button
                  type="button"
                  onClick={() =>
                    setFormSpecs([...formSpecs, { label: "", value: "" }])
                  }
                  className={`w-full py-3.5 border border-dashed rounded-2xl text-[10px] font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer mt-2 ${
                    d
                      ? "border-transparent bg-white! text-black hover:bg-gray-100!"
                      : "border-gray-250 text-slate-500 hover:border-black/20 hover:bg-slate-100/30 hover:text-black"
                  }`}
                >
                  <Plus size={12} />
                  <span>Thêm thông số mới</span>
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}
