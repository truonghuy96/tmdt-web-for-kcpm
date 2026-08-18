import React, { useState } from "react";
import { Product } from "../../types";
import { Plus, Edit3, Trash2, FileSpreadsheet, FileJson, RefreshCw } from "lucide-react";
import CsvImportExportModal from "./CsvImportExportModal";
import JsonImportExportModal from "./JsonImportExportModal";
import CustomAlert from "../CustomAlert";

interface ProductManagerProps {
  products: Product[];
  onOpenCreateForm: () => void;
  onOpenEditForm: (product: Product) => void;
  onDelete: (id: string, name: string) => void;
  onRestore?: (id: string) => void;
  onImportProducts: (parsedData: any[]) => void;
  isDarkMode?: boolean;
  onRefreshProducts?: () => void;
}

export default function ProductManager({
  products,
  onOpenCreateForm,
  onOpenEditForm,
  onDelete,
  onRestore,
  onImportProducts,
  isDarkMode = false,
  onRefreshProducts,
}: ProductManagerProps) {
  const d = isDarkMode;
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isJsonModalOpen, setIsJsonModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Custom alert state
  const [alertConfig, setAlertConfig] = useState<{
    isOpen: boolean;
    productId: string;
    productName: string;
  }>({
    isOpen: false,
    productId: "",
    productName: "",
  });

  const handleRefresh = async () => {
    if (!onRefreshProducts || isRefreshing) return;
    setIsRefreshing(true);
    await onRefreshProducts();
    // Giữ animation ít nhất 600ms để người dùng thấy phản hồi
    setTimeout(() => setIsRefreshing(false), 600);
  };

  const triggerDeleteConfirm = (id: string, name: string) => {
    setAlertConfig({
      isOpen: true,
      productId: id,
      productName: name,
    });
  };

  const confirmDelete = () => {
    onDelete(alertConfig.productId, alertConfig.productName);
    setAlertConfig({ isOpen: false, productId: "", productName: "" });
  };

  return (
    <div className="animate-fade-in space-y-6 font-sans">
      <div
        className={`flex flex-row items-center justify-between gap-6 rounded-3xl border p-6 shadow-sm transition-all duration-300 sm:p-8 ${
          d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
        }`}
      >
        <div className="min-w-0">
          <h3
            className={`text-base font-extrabold tracking-wider uppercase ${d ? "text-white" : "text-gray-955"}`}
          >
            Quản lý dải sản phẩm quầy hàng
          </h3>
          <p
            className={`mt-1.5 font-sans text-xs leading-relaxed md:text-[13px] ${d ? "text-gray-400" : "text-gray-405"}`}
          >
            Người quản lý có thể thêm sản phẩm mới hoặc cập nhật các đặc tả của
            sản phẩm trực tiếp.
          </p>
        </div>

        <div className="flex shrink-0 flex-row flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => setIsJsonModalOpen(true)}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 ${
              d
                ? "border-[#30363d] bg-[#21262d] text-gray-300 hover:bg-white/10 hover:text-white"
                : "border-gray-250 bg-white text-gray-700 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <FileJson size={16} className={d ? "text-emerald-400" : "text-emerald-600"} />
            <span>
              Nhập / Xuất <span className={`px-2.5 py-1 rounded-lg ml-1 ${d ? "bg-emerald-950/60 text-emerald-400 border border-emerald-900/30" : "bg-emerald-50 text-emerald-700 border border-emerald-100"}`}>JSON & Ảnh</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => setIsCsvModalOpen(true)}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-6 text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 ${
              d
                ? "border-[#30363d] bg-[#21262d] text-gray-300 hover:bg-white/10 hover:text-white"
                : "border-gray-250 bg-white text-gray-700 hover:bg-gray-50 hover:text-black"
            }`}
          >
            <FileSpreadsheet size={16} className={d ? "text-indigo-400" : "text-indigo-650"} />
            <span>
              Nhập / Xuất <span className={`px-2.5 py-1 rounded-lg ml-1 ${d ? "bg-indigo-950/60 text-indigo-400 border border-indigo-900/30" : "bg-indigo-50 text-indigo-700 border border-indigo-100"}`}>Excel / CSV</span>
            </span>
          </button>

          <button
            onClick={onOpenCreateForm}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl px-8 text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 ${
              d
                ? "bg-white! text-black hover:bg-gray-100!"
                : "bg-black text-white hover:bg-gray-900"
            }`}
          >
            <Plus size={16} />
            Thêm sản phẩm mới
          </button>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={isRefreshing || !onRefreshProducts}
            title="Đồng bộ dữ liệu sản phẩm mới nhất"
            className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border shadow transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${
              d
                ? "border-[#30363d] bg-[#21262d] text-gray-300 hover:bg-white/10 hover:text-white"
                : "border-gray-200 bg-white text-gray-500 hover:bg-gray-100 hover:text-black"
            }`}
          >
            <RefreshCw
              size={16}
              className={isRefreshing ? "animate-spin" : "transition-transform"}
            />
          </button>
        </div>
      </div>

      {/* Table list of active products */}
      <div
        className={`overflow-hidden rounded-[2rem] border shadow-sm transition-colors duration-300 ${
          d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs">
            <thead>
              <tr
                className={`border-b text-[9px] font-black tracking-wider uppercase transition-colors duration-300 ${
                  d
                    ? "border-[#30363d] bg-[#0d1117]/60 text-gray-500"
                    : "text-gray-450 border-gray-200 bg-gray-50"
                }`}
              >
                <th className="px-6 py-4.5">Định danh Ảnh / Tên</th>
                <th className="px-6 py-4.5">Phân loại</th>
                <th className="px-6 py-4.5">Giá bán</th>
                <th className="px-6 py-4.5">Tồn kho</th>
                <th className="col-span-2 px-6 py-4.5">
                  Đặc tả / Thông số tiêu biểu
                </th>
                <th className="w-36 px-6 py-4.5 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody
              className={`divide-y transition-colors duration-300 ${
                d
                  ? "divide-[#30363d] text-gray-300"
                  : "divide-gray-150 text-gray-700"
              }`}
            >
              {products.map((p) => (
                <tr
                  key={p.id}
                  className={`transition-colors duration-200 ${
                    d ? "" : "hover:bg-gray-100"
                  }`}
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3.5">
                      <div
                        className={`flex h-11 w-11 flex-shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-colors duration-300 ${
                          d
                            ? "border-[#30363d] bg-[#21262d]"
                            : "border-gray-150 bg-white"
                        }`}
                      >
                        <img
                          src={p.image}
                          alt={p.name}
                          className={`h-full w-full object-cover ${d ? "" : "mix-blend-multiply"}`}
                        />
                      </div>
                      <div className="min-w-0">
                        <span
                          className={`block flex items-center gap-2 truncate text-sm font-extrabold ${d ? "text-white" : "text-gray-900"}`}
                        >
                          {p.name}
                          {((p as any).isDeleted ||
                            (p as any).status === "DISCONTINUED") && (
                            <span
                              className={`rounded border px-1.5 py-0.5 text-[8px] font-black tracking-wider uppercase ${
                                d
                                  ? "border-rose-900/40 bg-rose-950/40 text-rose-400"
                                  : "border-rose-200 bg-rose-50 text-rose-600"
                              }`}
                            >
                              Đã xóa
                            </span>
                          )}
                        </span>
                        <span
                          className={`block truncate font-mono text-[9px] ${d ? "text-gray-500" : "text-gray-400"}`}
                        >
                          {p.id}
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`border-none text-[9px] font-bold tracking-wider uppercase transition-colors duration-300`}
                    >
                      {p.category}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <strong
                      className={`font-mono text-sm font-black transition-colors duration-300 ${
                        d ? "text-indigo-400" : "text-gray-955"
                      }`}
                    >
                      {p.price.toLocaleString("vi-VN")}₫
                    </strong>
                  </td>
                  {/* Stock column */}
                  <td className="px-6 py-4">
                    {(() => {
                      const stock = p.stock ?? 0;
                      const isLow = stock > 0 && stock <= 5;
                      const isOut = stock === 0;
                      return (
                        <span
                          className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[9px] font-black uppercase tracking-wider font-mono ${
                            isOut
                              ? d
                                ? 'bg-rose-950/40 border border-rose-900/40 text-rose-400'
                                : 'bg-rose-50 border border-rose-200 text-rose-600'
                              : isLow
                              ? d
                                ? 'bg-amber-950/40 border border-amber-900/40 text-amber-400'
                                : 'bg-amber-50 border border-amber-200 text-amber-600'
                              : d
                                ? 'bg-emerald-950/40 border border-emerald-900/40 text-emerald-400'
                                : 'bg-emerald-50 border border-emerald-200 text-emerald-600'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            isOut ? 'bg-rose-500' : isLow ? 'bg-amber-400' : 'bg-emerald-500'
                          }`} />
                          {isOut ? 'Hết hàng' : `${stock} chiếc`}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="max-w-sm px-6 py-4">
                    <span
                      className={`mb-1 line-clamp-2 block text-[11px] leading-relaxed ${
                        d ? "text-gray-400" : "text-gray-450"
                      }`}
                    >
                      {p.description}
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {p.specs.slice(0, 2).map((s, idx) => (
                        <span
                          key={idx}
                          className={`rounded px-1.5 py-0.5 font-mono text-[8px] transition-colors duration-300 ${
                            d
                              ? "border border-indigo-900/30 bg-indigo-950/40 text-indigo-400"
                              : "bg-indigo-50/50 text-indigo-700"
                          }`}
                        >
                          {s.label}: {s.value}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-1">
                      {(p as any).isDeleted ||
                      (p as any).status === "DISCONTINUED" ? (
                        <button
                          onClick={() => onRestore && onRestore(p.id)}
                          className={`flex h-8 items-center justify-center rounded-lg border px-3 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                            d
                              ? "border-emerald-900/30 text-emerald-400 hover:bg-emerald-950/40 hover:text-emerald-300"
                              : "border-emerald-200 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                          }`}
                          title="Khôi phục thiết bị"
                        >
                          Khôi phục
                        </button>
                      ) : (
                        <>
                          <button
                            onClick={() => onOpenEditForm(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              d
                                ? "text-gray-400 hover:bg-[#30363d] hover:text-white"
                                : "text-gray-500 hover:bg-gray-100 hover:text-black"
                            }`}
                            title="Sửa thông tin"
                          >
                            <Edit3 size={13} />
                          </button>
                          <button
                            onClick={() => triggerDeleteConfirm(p.id, p.name)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${
                              d
                                ? "text-rose-400 text-rose-500 hover:bg-rose-950/30"
                                : "text-rose-500 hover:bg-rose-50"
                            }`}
                            title="Xóa thiết bị"
                          >
                            <Trash2 size={13} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CsvImportExportModal
        isOpen={isCsvModalOpen}
        onClose={() => setIsCsvModalOpen(false)}
        title="Nhập / Xuất Sản Phẩm Excel & CSV"
        products={products}
        templateHeaders={[
          "name",
          "price",
          "category",
          "image",
          "description",
          "specs",
        ]}
        templateRows={[
          [
            "Bàn phím cơ Custom TechVie",
            "3500000",
            "Bàn phím",
            "https://images.unsplash.com/photo-1618384887929-16ec33fab9ef?auto=format&fit=crop&w=800&q=80",
            "Bàn phím custom chất lượng hi-end gõ cực kỳ êm ái.",
            "Switches: Linear Gateron Oil King | Layout: 75% compact",
          ],
        ]}
        onImport={(data) => {
          // Parse specs for each row from string to array of objects
          const formattedData = data.map((item) => {
            const specs: { label: string; value: string }[] = [];
            if (item.specs && typeof item.specs === "string") {
              item.specs.split("|").forEach((s: string) => {
                const parts = s.split(":");
                if (parts.length >= 2) {
                  specs.push({
                    label: parts[0].trim(),
                    value: parts.slice(1).join(":").trim(),
                  });
                }
              });
            }
            return {
              name: item.name || "",
              price: Number(item.price) || 0,
              category: item.category || "Thiết bị",
              image: item.image || "",
              description: item.description || "",
              specs: specs,
            };
          });
          onImportProducts(formattedData);
        }}
        isDarkMode={d}
      />

      <JsonImportExportModal
        isOpen={isJsonModalOpen}
        onClose={() => setIsJsonModalOpen(false)}
        onImportCompleted={() => {
          if (onRefreshProducts) onRefreshProducts();
        }}
        isDarkMode={d}
      />

      <CustomAlert
        isOpen={alertConfig.isOpen}
        type="warning"
        title="Xác nhận gỡ bỏ thiết bị"
        message={`Bạn có chắc chắn muốn xóa sản phẩm "${alertConfig.productName}" khỏi hệ thống quầy hàng hay không?`}
        onConfirm={confirmDelete}
        onCancel={() => setAlertConfig({ isOpen: false, productId: "", productName: "" })}
        confirmText="Xác nhận xóa"
        cancelText="Để tôi xem lại"
        isDarkMode={d}
      />
    </div>
  );
}
