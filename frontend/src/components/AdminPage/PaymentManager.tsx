import { useState } from "react";
import {
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  Search,
  Filter,
  CreditCard,
  Truck,
  RotateCcw,
} from "lucide-react";

interface PaymentManagerProps {
  orders: any[];
  onUpdatePaymentStatus: (orderId: string, status: "paid" | "failed" | "cancelled" | "pending") => Promise<boolean>;
  isDarkMode: boolean;
}

export default function PaymentManager({
  orders,
  onUpdatePaymentStatus,
  isDarkMode,
}: PaymentManagerProps) {
  const d = isDarkMode;
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [methodFilter, setMethodFilter] = useState("all");
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Helper parsing formatted string currency to raw number
  const parseTotalToNum = (totalStr: string): number => {
    if (!totalStr) return 0;
    const clean = totalStr.replace(/\D/g, "");
    return parseInt(clean, 10) || 0;
  };

  const formatCurrency = (val: number): string => {
    return val.toLocaleString("vi-VN") + "₫";
  };

  // Calculators for widgets
  const totalRevenue = orders
    .filter((o) => o.paymentStatus === "paid" && o.statusType !== "cancelled")
    .reduce((sum, o) => sum + parseTotalToNum(o.finalTotal), 0);

  const pendingTransferTotal = orders
    .filter(
      (o) =>
        o.paymentStatus === "pending" &&
        (o.paymentProvider === "bank_transfer" || o.rawPaymentMethod === "bank_transfer")
    )
    .reduce((sum, o) => sum + parseTotalToNum(o.finalTotal), 0);

  const pendingCodTotal = orders
    .filter(
      (o) =>
        o.paymentStatus === "pending" &&
        (o.paymentProvider === "cod" || o.rawPaymentMethod === "cod") &&
        o.statusType === "shipping"
    )
    .reduce((sum, o) => sum + parseTotalToNum(o.finalTotal), 0);

  // Filter orders
  const filteredOrders = orders.filter((ord) => {
    const matchesSearch =
      ord.orderId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (ord.paymentReference && ord.paymentReference.toLowerCase().includes(searchTerm.toLowerCase())) ||
      ord.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      ord.phone.includes(searchTerm);

    const matchesStatus =
      statusFilter === "all" ? true : ord.paymentStatus === statusFilter;

    const matchesMethod =
      methodFilter === "all"
        ? true
        : ord.rawPaymentMethod === methodFilter || ord.paymentProvider === methodFilter;

    return matchesSearch && matchesStatus && matchesMethod;
  });

  const handleApprovePayment = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await onUpdatePaymentStatus(orderId, "paid");
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const handleCancelPayment = async (orderId: string) => {
    setIsUpdating(orderId);
    try {
      await onUpdatePaymentStatus(orderId, "cancelled");
    } catch (e) {
      console.error(e);
    } finally {
      setIsUpdating(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "paid":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full border border-emerald-100">
            <CheckCircle2 size={10} /> Đã thanh toán
          </span>
        );
      case "pending":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 px-3 py-1 rounded-full border border-amber-100">
            <Clock size={10} /> Chờ đối soát
          </span>
        );
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-gray-50 text-gray-500 px-3 py-1 rounded-full border border-gray-150">
            <XCircle size={10} /> Đã hủy
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider bg-red-50 text-red-700 px-3 py-1 rounded-full border border-red-100">
            <XCircle size={10} /> Thất bại
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. Statistics Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Total Revenue */}
        <div
          className={`border rounded-3xl p-6 text-left flex items-center justify-between transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] ${
            d ? "bg-[#0d1117]/60 border-black" : "bg-white border-gray-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Doanh thu thực tế (Paid)
            </span>
            <h3
              className={`text-2xl font-black font-mono ${
                d ? "text-emerald-400" : "text-emerald-600"
              }`}
            >
              {formatCurrency(totalRevenue)}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              d ? "bg-emerald-950/30 text-emerald-400" : "bg-emerald-50 text-emerald-600"
            }`}
          >
            <TrendingUp size={22} />
          </div>
        </div>

        {/* Pending Bank Transfer */}
        <div
          className={`border rounded-3xl p-6 text-left flex items-center justify-between transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] ${
            d ? "bg-[#0d1117]/60 border-black" : "bg-white border-gray-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Chuyển khoản chờ duyệt
            </span>
            <h3
              className={`text-2xl font-black font-mono ${
                d ? "text-indigo-400" : "text-indigo-600"
              }`}
            >
              {formatCurrency(pendingTransferTotal)}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              d ? "bg-indigo-950/30 text-indigo-400" : "bg-indigo-50 text-indigo-600"
            }`}
          >
            <CreditCard size={22} />
          </div>
        </div>

        {/* Pending COD in Shipping */}
        <div
          className={`border rounded-3xl p-6 text-left flex items-center justify-between transition-all hover:shadow-[0_12px_30px_rgba(0,0,0,0.03)] ${
            d ? "bg-[#0d1117]/60 border-black" : "bg-white border-gray-200"
          }`}
        >
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              COD đang giao (Chờ thu)
            </span>
            <h3
              className={`text-2xl font-black font-mono ${
                d ? "text-amber-400" : "text-amber-600"
              }`}
            >
              {formatCurrency(pendingCodTotal)}
            </h3>
          </div>
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
              d ? "bg-amber-950/30 text-amber-400" : "bg-amber-50 text-amber-600"
            }`}
          >
            <Truck size={22} />
          </div>
        </div>
      </div>

      {/* 2. Controls and filters */}
      <div
        className={`border rounded-3xl p-5 ${
          d ? "bg-[#0d1117]/60 border-black" : "bg-slate-50 border-gray-150"
        }`}
      >
        <div className="flex flex-col lg:flex-row gap-4 items-stretch lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Tìm theo Mã đơn, tên KH, SĐT..."
              className={`w-full focus:outline-none focus:ring-1 rounded-2xl pl-11 pr-4 py-3 text-xs transition-all font-semibold ${
                d
                  ? "bg-[#161b22] border border-[#30363d] focus:border-white focus:ring-white text-white"
                  : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905"
              }`}
            />
          </div>

          {/* Status filter */}
          <div className="flex items-center gap-2">
            <Filter className="text-gray-400 w-4 h-4 shrink-0" />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className={`focus:outline-none focus:ring-1 rounded-2xl px-4 py-3 text-xs font-semibold ${
                d
                  ? "bg-[#161b22] border border-[#30363d] focus:border-white focus:ring-white text-white"
                  : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905"
              }`}
            >
              <option value="all">Tất cả Trạng thái</option>
              <option value="pending">Chờ đối soát (Pending)</option>
              <option value="paid">Đã thanh toán (Paid)</option>
              <option value="cancelled">Đã hủy (Cancelled)</option>
            </select>
          </div>

          {/* Method filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className={`w-full focus:outline-none focus:ring-1 rounded-2xl px-4 py-3 text-xs font-semibold ${
                d
                  ? "bg-[#161b22] border border-[#30363d] focus:border-white focus:ring-white text-white"
                  : "bg-white border border-gray-200 focus:border-black focus:ring-black text-gray-905"
              }`}
            >
              <option value="all">Tất cả Phương thức</option>
              <option value="bank_transfer">Chuyển khoản NH</option>
              <option value="cod">COD (Nhận hàng trả tiền)</option>
              <option value="momo">Ví MoMo</option>
              <option value="zalopay">Ví ZaloPay</option>
              <option value="vnpay">Cổng VNPAY</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. Transaction List Table */}
      <div
        className={`border rounded-[2rem] overflow-hidden ${
          d ? "bg-[#0d1117]/60 border-black" : "bg-white border-gray-200"
        }`}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr
                className={`border-b ${
                  d ? "border-[#30363d]/60 bg-[#161b22]/40" : "border-gray-150 bg-gray-50/50"
                }`}
              >
                <th className="py-4 px-5 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Mã giao dịch / Đơn hàng
                </th>
                <th className="py-4 px-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Khách hàng
                </th>
                <th className="py-4 px-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Phương thức
                </th>
                <th className="py-4 px-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Tổng tiền
                </th>
                <th className="py-4 px-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Ngày tạo
                </th>
                <th className="py-4 px-4 font-black uppercase tracking-wider text-[10px] text-gray-400">
                  Trạng thái
                </th>
                <th className="py-4 px-5 font-black uppercase tracking-wider text-[10px] text-gray-400 text-right">
                  Hành động
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 font-semibold">
                    Không tìm thấy giao dịch đối soát nào khớp bộ lọc.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((ord) => {
                  const methodText =
                    ord.paymentProvider === "bank_transfer" || ord.rawPaymentMethod === "bank_transfer"
                      ? "Chuyển khoản NH"
                      : ord.paymentProvider === "cod" || ord.rawPaymentMethod === "cod"
                      ? "COD"
                      : ord.paymentMethod || "Khác";

                  return (
                    <tr
                      key={ord.orderId}
                      className={`border-b last:border-0 hover:bg-gray-50/30 transition-colors ${
                        d ? "border-[#30363d]/40" : "border-gray-100"
                      }`}
                    >
                      {/* Order Code */}
                      <td className="py-4 px-5 font-mono font-bold">
                        <span className={d ? "text-gray-200" : "text-gray-900"}>
                          {ord.paymentReference || `TECHVIE-${ord.orderId.slice(-6).toUpperCase()}`}
                        </span>
                        {ord.paymentNote && (
                          <div className="text-[10px] text-gray-400 font-sans mt-0.5 max-w-[180px] truncate">
                            Nội dung: {ord.paymentNote}
                          </div>
                        )}
                      </td>

                      {/* Customer info */}
                      <td className="py-4 px-4">
                        <div className={`font-bold ${d ? "text-gray-200" : "text-gray-800"}`}>
                          {ord.fullName}
                        </div>
                        <div className="text-[10px] text-gray-400">{ord.phone}</div>
                      </td>

                      {/* Payment Method */}
                      <td className="py-4 px-4">
                        <span className="font-semibold text-gray-500">{methodText}</span>
                      </td>

                      {/* Final Total */}
                      <td className="py-4 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {ord.finalTotal}
                      </td>

                      {/* Created At */}
                      <td className="py-4 px-4 text-gray-500">
                        {new Date(ord.createdAt).toLocaleDateString("vi-VN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>

                      {/* Payment Status Badge */}
                      <td className="py-4 px-4">{getStatusBadge(ord.paymentStatus)}</td>

                      {/* Quick Actions */}
                      <td className="py-4 px-5 text-right">
                        {ord.paymentStatus === "pending" ? (
                          <div className="flex justify-end gap-2">
                            {/* Cancel payment */}
                            <button
                              disabled={isUpdating === ord.orderId}
                              onClick={() => handleCancelPayment(ord.orderId)}
                              className={`p-1.5 rounded-lg border transition-all active:scale-95 cursor-pointer disabled:opacity-50 ${
                                d
                                  ? "border-red-900/30 text-red-400 hover:bg-red-950/20"
                                  : "border-red-200 text-red-600 hover:bg-red-50"
                              }`}
                              title="Hủy thanh toán"
                            >
                              <XCircle size={14} />
                            </button>

                            {/* Approve payment */}
                            <button
                              disabled={isUpdating === ord.orderId}
                              onClick={() => handleApprovePayment(ord.orderId)}
                              className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-[10px] transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                            >
                              {isUpdating === ord.orderId ? (
                                <RotateCcw size={10} className="animate-spin" />
                              ) : (
                                <CheckCircle2 size={10} />
                              )}
                              Duyệt tiền
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-gray-400 italic">Đã chốt</span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
