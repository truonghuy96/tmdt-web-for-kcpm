import React, { useState } from "react";
import { X, ArrowDownToLine, FileJson } from "lucide-react";
import { API_BASE_URL } from "../../services/api";

interface OrderExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  isDarkMode?: boolean;
}

export default function OrderExportModal({
  isOpen,
  onClose,
  isDarkMode = false,
}: OrderExportModalProps) {
  const d = isDarkMode;
  const [exporting, setExporting] = useState(false);

  if (!isOpen) return null;

  const handleExport = async () => {
    setExporting(true);
    try {
      const token = localStorage.getItem("techvie_token") || "";
      const cleanToken = token.startsWith("Bearer ") ? token : `Bearer ${token}`;

      const response = await fetch(`${API_BASE_URL}/api/orders`, {
        headers: {
          Authorization: cleanToken,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error("Không thể tải danh sách đơn hàng.");
      const data = await response.json();
      const orders = data.orders || [];

      // Structure formatted orders export data
      const formattedOrders = orders.map((ord: any) => ({
        orderId: ord.orderId,
        fullName: ord.fullName,
        phone: ord.phone,
        email: ord.email,
        address: ord.address,
        notes: ord.notes || "",
        paymentMethod: ord.paymentMethod,
        deliveryMethod: ord.deliveryMethod || "",
        totalPrice: ord.totalPrice || 0,
        finalTotal: ord.finalTotal,
        status: ord.status,
        statusType: ord.statusType,
        paymentStatus: ord.paymentStatus || "pending",
        createdAt: ord.createdAt,
        items: ord.items?.map((item: any) => ({
          product: {
            id: item.product?.id || item.product?._id,
            name: item.product?.name,
            price: item.product?.price,
            category: item.product?.category,
          },
          quantity: item.quantity,
        })) || [],
      }));

      const blob = new Blob([JSON.stringify(formattedOrders, null, 2)], {
        type: "application/json;charset=utf-8;",
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `techvie_orders_export_${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onClose();
    } catch (err: any) {
      alert("Lỗi xuất dữ liệu đơn hàng: " + err.message);
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
        className={`relative w-full max-w-md rounded-[2.5rem] border p-8 text-left font-sans shadow-2xl transition-all duration-300 ${
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
          Xuất Sổ Đơn Hàng Sang JSON
        </h3>

        <div className="space-y-5">
          <div
            className={`rounded-2xl border p-4 flex items-center justify-between ${
              d ? "border-[#30363d] bg-[#0d1117]/60" : "border-gray-150 bg-slate-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <FileJson className="h-5 w-5 text-indigo-400" />
              <div className="text-left">
                <span className="block text-[11px] font-black tracking-wider uppercase">
                  Tập tin JSON Đơn hàng
                </span>
                <span className={`mt-0.5 block text-[9px] ${d ? "text-gray-400" : "text-gray-500"}`}>
                  Tải về toàn bộ lịch sử giao dịch dưới định dạng .json
                </span>
              </div>
            </div>
            <button
              type="button"
              disabled={exporting}
              onClick={handleExport}
              className={`flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl border transition-all active:scale-95 ${
                d
                  ? "border-[#30363d] bg-[#21262d] text-emerald-400 hover:bg-[#30363d]"
                  : "border-gray-150 bg-indigo-50 text-indigo-700 hover:bg-indigo-100"
              }`}
              title="Xuất JSON"
            >
              <ArrowDownToLine size={18} className={exporting ? "animate-bounce" : ""} />
            </button>
          </div>

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
              disabled={exporting}
              onClick={handleExport}
              className={`flex-1 cursor-pointer rounded-xl py-3 text-center font-sans text-xs font-black tracking-widest uppercase shadow transition-all active:scale-95 ${
                d
                  ? "bg-indigo-600 hover:bg-indigo-700 text-white"
                  : "bg-indigo-600 text-white hover:bg-indigo-700"
              }`}
            >
              {exporting ? "Đang xuất..." : "Xuất File"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
