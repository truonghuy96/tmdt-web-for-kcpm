import { useState } from "react";
import {
  RotateCcw,
  AlertCircle,
  MapPin,
  Phone,
  Mail,
  Clock,
  Truck,
  CheckCircle,
  X,
  Package,
  Laptop,
  Smartphone,
  Watch,
  Headphones,
  Keyboard,
  FileSpreadsheet,
  FileText,
  FileJson,
} from "lucide-react";
import { Product } from "../../types";
import * as XLSX from "xlsx";
import OrderExportModal from "./OrderExportModal";

interface OrderManagerProps {
  orders: any[];
  isLoadingOrders: boolean;
  onRefreshOrders: () => void;
  onUpdateOrderStatus: (
    orderId: number,
    status: string,
    statusType: string,
  ) => void;
  onUpdatePaymentStatus?: (
    orderId: number | string,
    paymentStatus: "pending" | "paid" | "failed" | "cancelled",
  ) => void;
  isDarkMode?: boolean;
  products?: Product[];
}

// Sub-component for product image rendering with elegant fallbacks
interface OrderProductImageProps {
  item: any;
  products?: Product[];
  isDarkMode: boolean;
}

function OrderProductImage({
  item,
  products,
  isDarkMode,
}: OrderProductImageProps) {
  const [imgError, setImgError] = useState(false);

  // Find product dynamically by ID to resolve the image URL
  const resolvedProduct = products?.find(
    (p) => p.id === item.product?.id || p.id === item.product?._id,
  );
  const imageUrl = resolvedProduct?.image || item.product?.image;
  const productName = item.product?.name || "Sản phẩm";

  // Determine fallback icon based on category or name
  const category = (resolvedProduct?.category || "").toLowerCase();
  const name = productName.toLowerCase();

  let IconComponent = Package;
  if (
    category.includes("laptop") ||
    name.includes("laptop") ||
    name.includes("book")
  ) {
    IconComponent = Laptop;
  } else if (
    category.includes("điện thoại") ||
    category.includes("phone") ||
    name.includes("phone") ||
    name.includes("ultra")
  ) {
    IconComponent = Smartphone;
  } else if (
    category.includes("đồng hồ") ||
    category.includes("watch") ||
    name.includes("watch")
  ) {
    IconComponent = Watch;
  } else if (
    category.includes("âm thanh") ||
    category.includes("tai nghe") ||
    name.includes("buds") ||
    name.includes("sound") ||
    name.includes("headphone")
  ) {
    IconComponent = Headphones;
  } else if (
    category.includes("bàn phím") ||
    category.includes("keyboard") ||
    name.includes("keyboard") ||
    name.includes("zenboard")
  ) {
    IconComponent = Keyboard;
  }

  const d = isDarkMode;

  if (!imageUrl || imgError) {
    return (
      <div
        className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border transition-all duration-300 ${
          d
            ? "border-[#30363d] bg-gradient-to-br from-[#21262d]/80 to-[#161b22]/80 text-gray-400"
            : "text-gray-450 border-gray-200 bg-gradient-to-br from-gray-50 to-gray-100"
        }`}
        title={productName}
      >
        <IconComponent size={18} className="opacity-80" />
      </div>
    );
  }

  return (
    <div
      className={`flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border transition-all duration-300 ${
        d ? "border-[#30363d] bg-[#21262d]" : "border-gray-150 bg-white"
      }`}
    >
      <img
        src={imageUrl}
        alt={productName}
        onError={() => setImgError(true)}
        className={`h-full w-full object-cover ${d ? "" : "mix-blend-multiply"}`}
      />
    </div>
  );
}

const getStatusBadgeClass = (status: string, statusType: string, d: boolean) => {
  const type = String(statusType).toLowerCase();
  const st = String(status).toLowerCase();
  
  if (type === "success" || st.includes("hoàn tất")) {
    return d
      ? "border border-emerald-900/40 bg-emerald-950/30 text-emerald-400"
      : "border border-emerald-200/50 bg-emerald-50 text-emerald-700";
  }
  if (type === "shipping" || st.includes("giao hàng") || st.includes("bưu tá")) {
    return d
      ? "border border-blue-900/40 bg-blue-950/30 text-blue-400"
      : "border border-blue-200/50 bg-blue-50 text-blue-700";
  }
  if (type === "cancelled" || st.includes("hủy") || st.includes("thất bại")) {
    return d
      ? "border border-rose-900/40 bg-rose-950/30 text-rose-400"
      : "border border-rose-200/50 bg-rose-50 text-rose-700";
  }
  if (type === "processing" || st.includes("chuẩn bị") || st.includes("xác nhận") || st.includes("lắp ráp")) {
    return d
      ? "border border-purple-900/40 bg-purple-950/30 text-purple-400"
      : "border border-purple-200/50 bg-purple-50 text-purple-700";
  }
  return d
    ? "border border-amber-900/40 bg-amber-950/30 text-amber-400"
    : "border border-amber-200/50 bg-amber-50 text-amber-700";
};

export default function OrderManager({
  orders,
  isLoadingOrders,
  onRefreshOrders,
  onUpdateOrderStatus,
  onUpdatePaymentStatus,
  isDarkMode = false,
  products = [],
}: OrderManagerProps) {
  const d = isDarkMode;
  const [confirmAction, setConfirmAction] = useState<{
    [orderId: number]: "success" | "cancelled" | null;
  }>({});
  const [isExportJsonOpen, setIsExportJsonOpen] = useState(false);

  const handleExportExcel = () => {
    if (!orders || orders.length === 0) {
      console.log("Không có dữ liệu đơn hàng để xuất Excel.");
      return;
    }

    // Map dữ liệu đơn hàng sang format bảng biểu đẹp mắt
    const excelRows = orders.map((ord: any) => {
      // Nối danh sách sản phẩm thành một chuỗi text duy nhất
      const productsText =
        ord.items
          ?.map((item: any) => {
            const name = item.product?.name || "Sản phẩm không rõ";
            return `${name} (SL: ${item.quantity})`;
          })
          .join("\n") || "";

      // Định dạng trạng thái tiếng Việt
      let statusVi = ord.status;
      if (ord.statusType === "pending") statusVi = "Chờ xử lý";
      else if (ord.statusType === "processing") statusVi = "Đang chuẩn bị gửi";
      else if (ord.statusType === "shipping") statusVi = "Đang giao bưu tá";
      else if (ord.statusType === "success") statusVi = "Hoàn tất bàn giao";
      else if (ord.statusType === "cancelled") statusVi = "Đã hủy đơn";

      return {
        "Mã Đơn Hàng": `#${ord.orderId}`,
        "Họ Tên Khách Hàng": ord.fullName,
        "Số Điện Thoại": ord.phone,
        "Địa Chỉ Giao Hàng": ord.address,
        "Chi Tiết Sản Phẩm": productsText,
        "Tổng Tiền (VNĐ)":
          ord.totalPrice ||
          ord.items?.reduce(
            (acc: number, item: any) => acc + item.price * item.quantity,
            0,
          ) ||
          0,
        "Trạng Thái Đơn Hàng": statusVi,
        "Phương Thức Thanh Toán":
          ord.paymentMethod === "cod"
            ? "Thanh toán COD"
            : "Chuyển khoản Banking",
        "Thời Gian Đặt Hàng": new Date(ord.createdAt).toLocaleString("vi-VN"),
      };
    });

    // Tạo worksheet và workbook từ mảng đối tượng
    const worksheet = XLSX.utils.json_to_sheet(excelRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sổ Đơn Hàng");

    // Tự động căn rộng cột tương ứng với độ dài dữ liệu
    const maxColsWidth = [
      { wch: 15 }, // Mã Đơn Hàng
      { wch: 25 }, // Họ Tên Khách Hàng
      { wch: 15 }, // Số Điện Thoại
      { wch: 45 }, // Địa Chỉ Giao Hàng
      { wch: 40 }, // Chi Tiết Sản Phẩm
      { wch: 18 }, // Tổng Tiền (VNĐ)
      { wch: 20 }, // Trạng Thái Đơn Hàng
      { wch: 25 }, // Phương Thức Thanh Toán
      { wch: 22 }, // Thời Gian Đặt Hàng
    ];
    worksheet["!cols"] = maxColsWidth;

    // Kích hoạt trình tải xuống file Excel
    const fileName = `Bao_cao_don_hang_${new Date().toISOString().slice(0, 10)}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    console.log(`Xuất thành công file Excel báo cáo đơn hàng: ${fileName}`);
  };

  const handleExportCsv = () => {
    if (!orders || orders.length === 0) {
      console.log("Không có dữ liệu đơn hàng để xuất CSV.");
      return;
    }

    const headers = [
      "Mã Đơn Hàng",
      "Họ Tên Khách Hàng",
      "Số Điện Thoại",
      "Địa Chỉ Giao Hàng",
      "Chi Tiết Sản Phẩm",
      "Tổng Tiền (VNĐ)",
      "Trạng Thái Đơn Hàng",
      "Phương Thức Thanh Toán",
      "Thời Gian Đặt Hàng",
    ];

    const csvRows = orders.map((ord: any) => {
      const productsText =
        ord.items
          ?.map((item: any) => {
            const name = item.product?.name || "Sản phẩm không rõ";
            return `${name} (SL: ${item.quantity})`;
          })
          .join("; ") || "";

      let statusVi = ord.status;
      if (ord.statusType === "pending") statusVi = "Chờ xử lý";
      else if (ord.statusType === "processing") statusVi = "Đang chuẩn bị gửi";
      else if (ord.statusType === "shipping") statusVi = "Đang giao bưu tá";
      else if (ord.statusType === "success") statusVi = "Hoàn tất bàn giao";
      else if (ord.statusType === "cancelled") statusVi = "Đã hủy đơn";

      const totalPrice =
        ord.totalPrice ||
        ord.items?.reduce(
          (acc: number, item: any) => acc + item.price * item.quantity,
          0,
        ) ||
        0;

      // Escape quotes and wrap with double quotes to support CSV structure
      return [
        `"${ord.orderId}"`,
        `"${ord.fullName.replace(/"/g, '""')}"`,
        `"${ord.phone}"`,
        `"${ord.address.replace(/"/g, '""')}"`,
        `"${productsText.replace(/"/g, '""')}"`,
        totalPrice,
        `"${statusVi}"`,
        `"${ord.paymentMethod === "cod" ? "Thanh toán COD" : "Chuyển khoản Banking"}"`,
        `"${new Date(ord.createdAt).toLocaleString("vi-VN")}"`,
      ].join(",");
    });

    // Merge headers and rows with UTF-8 BOM to prevent Vietnamese font corruption in Excel
    const csvContent = "\uFEFF" + headers.join(",") + "\n" + csvRows.join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    const fileName = `Bao_cao_don_hang_${new Date().toISOString().slice(0, 10)}.csv`;

    link.setAttribute("href", url);
    link.setAttribute("download", fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    console.log(`Xuất thành công file CSV báo cáo đơn hàng: ${fileName}`);
  };

  return (
    <div className="animate-fade-in space-y-6 font-sans">
      <div
        className={`flex flex-col justify-between gap-4 rounded-3xl border p-6 shadow-sm transition-all duration-300 sm:flex-row sm:items-center sm:p-8 ${
          d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
        }`}
      >
        <div>
          <h3
            className={`text-base font-extrabold tracking-wider uppercase ${d ? "text-white" : "text-gray-955"}`}
          >
            Theo dõi Sổ bưu kiện đặt hàng
          </h3>
          <p
            className={`mt-1.5 font-sans text-xs leading-relaxed md:text-[13px] ${d ? "text-gray-400" : "text-gray-405"}`}
          >
            Thực hiện phê duyệt lộ trình đơn hàng thực tế lưu trữ tại máy phản
            hồi của Express server.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={handleExportExcel}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-8 text-xs font-bold tracking-wider uppercase transition-all ${
              d
                ? "border-[#30363d] bg-[#21262d] text-emerald-400 hover:bg-[#30363d]"
                : "border-gray-200 bg-white text-emerald-600 shadow-xs hover:bg-gray-50"
            }`}
            title="Xuất báo cáo định dạng Excel (.xlsx)"
          >
            <FileSpreadsheet size={16} />
            <span>Xuất Excel</span>
          </button>

          <button
            onClick={handleExportCsv}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-8 text-xs font-bold tracking-wider uppercase transition-all ${
              d
                ? "border-[#30363d] bg-[#21262d] text-indigo-400 hover:bg-[#30363d]"
                : "border-gray-200 bg-white text-indigo-600 shadow-xs hover:bg-gray-50"
            }`}
            title="Xuất báo cáo định dạng CSV (.csv)"
          >
            <FileText size={16} />
            <span>Xuất CSV</span>
          </button>

          <button
            onClick={() => setIsExportJsonOpen(true)}
            className={`flex h-12 cursor-pointer items-center justify-center gap-2 rounded-xl border px-8 text-xs font-bold tracking-wider uppercase transition-all ${
              d
                ? "border-[#30363d] bg-[#21262d] text-amber-400 hover:bg-[#30363d]"
                : "border-gray-200 bg-white text-amber-600 shadow-xs hover:bg-gray-50"
            }`}
            title="Xuất dữ liệu định dạng JSON (.json)"
          >
            <FileJson size={16} />
            <span>Xuất JSON</span>
          </button>

          <button
            onClick={onRefreshOrders}
            className={`flex h-12 w-12 cursor-pointer items-center justify-center rounded-xl border transition-all ${
              d
                ? "border-[#30363d] bg-[#21262d] text-white hover:bg-[#30363d]"
                : "border-gray-200 bg-white hover:bg-gray-50"
            }`}
            title="Tải lại sổ"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      {/* Sổ đặt hàng Table list */}
      {isLoadingOrders ? (
        <div
          className={`rounded-3xl border py-20 text-center ${
            d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
          }`}
        >
          <div
            className={`mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-3 ${
              d
                ? "border-white/15 border-t-white"
                : "border-black/15 border-t-black"
            }`}
          />
          <p className={`text-xs ${d ? "text-gray-400" : "text-gray-500"}`}>
            Đang đồng bộ sổ đơn hàng máy chủ...
          </p>
        </div>
      ) : orders.length === 0 ? (
        <div
          className={`rounded-3xl border p-6 py-16 text-center ${
            d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
          }`}
        >
          <AlertCircle
            size={36}
            className="mx-auto mb-3 animate-bounce text-gray-400"
          />
          <p
            className={`text-sm font-extrabold ${d ? "text-white" : "text-gray-805"}`}
          >
            Sổ Đơn Hàng Đang Trống
          </p>
          <p
            className={`mx-auto mt-1 max-w-[320px] text-xs leading-relaxed ${d ? "text-gray-400" : "text-gray-405"}`}
          >
            Chưa có đơn hàng nào được kích hoạt. Hãy dùng chức năng "Tạo đơn
            ngẫu nhiên" hoặc thêm giỏ hàng thanh toán bên cửa hàng.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((ord: any) => (
            <div
              key={ord.orderId}
              className={`overflow-hidden rounded-[1.8rem] border font-sans text-xs shadow-sm ${
                d ? "border-[#30363d] bg-[#161b22]" : "border-gray-200 bg-white"
              }`}
            >
              {/* Row 1 Header */}
              <div
                className={`flex flex-col justify-between gap-4 border-b p-5 md:flex-row md:items-center ${
                  d
                    ? "border-[#30363d] bg-[#0d1117]/60"
                    : "border-gray-150/80 bg-gray-50/70"
                }`}
              >
                {/* Grid layout chia 4 cột: 1. Mã đơn, 2. Khách hàng, 3. Thời gian, 4. Thành tiền */}
                <div className="grid w-full max-w-4xl grid-cols-2 items-center gap-4 sm:grid-cols-4 sm:gap-8">
                  {/* Cột 1: Mã đơn hàng */}
                  <div className="flex flex-col">
                    <span
                      className={`mb-1.5 block text-[9px] font-bold tracking-wider uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Mã đơn hàng
                    </span>
                    <strong
                      className={`block truncate font-mono text-sm font-extrabold ${d ? "text-white" : "text-gray-955"}`}
                      title={ord.orderId}
                    >
                      #{ord.orderId}
                    </strong>
                  </div>

                  {/* Cột 2: Khách hàng */}
                  <div className="flex flex-col">
                    <span
                      className={`mb-1.5 block text-[9px] font-bold tracking-wider uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Khách hàng
                    </span>
                    <strong
                      className={`block truncate text-sm font-bold ${d ? "text-white" : "text-gray-900"}`}
                      title={ord.fullName}
                    >
                      {ord.fullName}
                    </strong>
                  </div>

                  {/* Cột 3: Thời gian */}
                  <div className="flex flex-col">
                    <span
                      className={`mb-1.5 block text-[9px] font-bold tracking-wider uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Thời gian
                    </span>
                    <strong
                      className={`block font-mono text-sm font-bold ${d ? "text-gray-300" : "text-gray-900"}`}
                    >
                      {new Date(ord.createdAt).toLocaleString("vi-VN")}
                    </strong>
                  </div>

                  {/* Cột 4: Thành tiền */}
                  <div className="flex flex-col">
                    <span
                      className={`mb-1.5 block text-[9px] font-bold tracking-wider uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
                    >
                      Thành tiền
                    </span>
                    <strong
                      className={`block font-mono text-sm font-black text-indigo-500 ${d ? "text-indigo-400" : "text-indigo-600"}`}
                    >
                      {typeof ord.finalTotal === "number"
                        ? ord.finalTotal.toLocaleString("vi-VN") + "₫"
                        : parseInt(
                            String(ord.finalTotal || "0").replace(
                              /[^0-9]/g,
                              "",
                            ),
                          ).toLocaleString("vi-VN") + "₫"}
                    </strong>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[9px] font-black uppercase ${getStatusBadgeClass(ord.status, ord.statusType, d)}`}
                  >
                    {ord.status}
                  </span>
                </div>
              </div>

              {/* Row 2 Details */}
              <div className="grid grid-cols-1 gap-6 p-5 lg:grid-cols-12">
                <div
                  className={`space-y-2 border-b pb-4 lg:col-span-4 lg:border-r lg:border-b-0 lg:pr-6 lg:pb-0 ${
                    d ? "border-[#30363d]" : "border-gray-150"
                  }`}
                >
                  <h4
                    className={`text-[10px] font-bold tracking-wider uppercase ${d ? "text-gray-400" : "text-gray-450"}`}
                  >
                    Thông tin liên hệ nhận hàng
                  </h4>
                  <div
                    className={`space-y-1.5 text-[11px] ${d ? "text-gray-300" : "text-gray-600"}`}
                  >
                    <p className="flex items-center gap-1.5">
                      <Phone
                        size={12}
                        className={d ? "text-gray-500" : "text-gray-400"}
                      />
                      <strong className={`shrink-0 ${d ? "text-gray-200" : "text-gray-800"}`}>
                        SĐT:
                      </strong>{" "}
                      <span>{ord.phone}</span>
                    </p>
                    <p className="flex items-center gap-1.5">
                      <Mail
                        size={12}
                        className={d ? "text-gray-500" : "text-gray-400"}
                      />
                      <strong className={`shrink-0 ${d ? "text-gray-200" : "text-gray-800"}`}>
                        Email:
                      </strong>{" "}
                      <span>{ord.email}</span>
                    </p>
                    <p className="flex items-start gap-1.5">
                      <MapPin
                        size={12}
                        className={`mt-0.5 shrink-0 ${d ? "text-gray-500" : "text-gray-400"}`}
                      />
                      <strong
                        className={`shrink-0 ${d ? "text-gray-200" : "text-gray-800"}`}
                      >
                        Địa chỉ:
                      </strong>{" "}
                      <span className="break-words">{ord.address}</span>
                    </p>
                    {ord.notes && (
                      <p
                        className={`mt-1 rounded-lg border p-2 text-[10px] italic ${
                          d
                            ? "border-amber-900/20 bg-amber-950/20 text-amber-300"
                            : "border-amber-200/20 bg-amber-50 text-amber-700/90"
                        }`}
                      >
                        " {ord.notes} "
                      </p>
                    )}
                  </div>
                </div>

                {/* Bought Items list */}
                <div className="space-y-3 lg:col-span-5">
                  <h4
                    className={`text-[10px] font-bold tracking-wider uppercase ${d ? "text-gray-400" : "text-gray-450"}`}
                  >
                    Danh mục thiết bị bưu kiện
                  </h4>
                  <div className="max-h-[140px] space-y-2 overflow-y-auto">
                    {ord.cart?.map((item: any, idx: number) => (
                      <div
                        key={idx}
                        className={`flex items-center justify-between rounded-xl border p-2.5 transition-all duration-300 ${
                          d
                            ? "border-[#30363d] bg-[#0d1117]/40 hover:border-indigo-500/40 hover:bg-[#161b22]/40"
                            : "border-gray-150 bg-gray-50/50 hover:border-indigo-500/30 hover:bg-white hover:shadow-sm"
                        }`}
                      >
                        <div className="flex min-w-0 items-center gap-2.5">
                          <OrderProductImage
                            item={item}
                            products={products}
                            isDarkMode={d}
                          />
                          <div className="min-w-0">
                            <h5
                              className={`truncate text-[11px] font-extrabold ${d ? "text-white" : "text-gray-900"}`}
                            >
                              {item.product?.name}
                            </h5>
                            <div className="mt-0.5 flex flex-wrap items-center gap-1.5">
                              <span className="font-mono text-[9px] text-gray-400">
                                Đơn giá:{" "}
                                {item.product?.price?.toLocaleString("vi-VN")}₫
                              </span>
                            </div>
                          </div>
                        </div>

                        <span
                          className={`ml-2 shrink-0 rounded border px-2.5 py-1 font-mono font-bold ${
                            d
                              ? "border-[#30363d] bg-[#21262d] text-gray-200"
                              : "text-gray-850 border-gray-200 bg-white"
                          }`}
                        >
                          SL: {item.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Update Status Actions */}
                <div
                  className={`flex flex-col justify-center gap-2 rounded-2xl border p-4 lg:col-span-3 ${
                    d
                      ? "border-[#30363d] bg-[#0d1117]/30"
                      : "border-gray-150 bg-gray-50/30"
                  }`}
                >
                  <h4
                    className={`text-center text-[9px] font-bold tracking-wider uppercase ${d ? "text-gray-500" : "text-gray-400"}`}
                  >
                    Hệ luyên phê duyệt chuyển trạng thái
                  </h4>

                  <button
                    onClick={() =>
                      onUpdateOrderStatus(
                        ord.orderId,
                        "Đang lắp ráp chuẩn bị gửi",
                        "processing",
                      )
                    }
                    className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                      d
                        ? "border-[#30363d] bg-[#21262d] text-gray-200 hover:bg-[#30363d]"
                        : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                    }`}
                  >
                    <Clock size={11} /> Lắp ráp bưu phẩm
                  </button>

                  <button
                    onClick={() =>
                      onUpdateOrderStatus(
                        ord.orderId,
                        "Đang bàn giao bưu tá Express",
                        "shipping",
                      )
                    }
                    className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                      d
                        ? "border-blue-900/30 bg-blue-950/40 text-blue-400 hover:bg-blue-900/60"
                        : "border-blue-200/40 bg-blue-50 text-blue-700 hover:bg-blue-100"
                    }`}
                  >
                    <Truck size={11} /> Giao bưu tá
                  </button>

                  {confirmAction[ord.orderId] === "success" ? (
                    <div className="space-y-1.5 rounded-xl border border-emerald-500/25 bg-emerald-500/5 p-2">
                      <p className="text-center text-[9px] font-bold text-emerald-500 uppercase">
                        Xác nhận hoàn tất đơn hàng?
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(
                              ord.orderId,
                              "Hoàn tất bàn giao",
                              "success",
                            );
                            setConfirmAction((prev) => ({
                              ...prev,
                              [ord.orderId]: null,
                            }));
                          }}
                          className="flex-1 cursor-pointer rounded bg-emerald-600 py-1.5 text-[9px] font-bold tracking-wider text-white uppercase hover:bg-emerald-700"
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction((prev) => ({
                              ...prev,
                              [ord.orderId]: null,
                            }))
                          }
                          className={`flex-1 cursor-pointer rounded py-1.5 text-[9px] font-bold tracking-wider uppercase ${
                            d
                              ? "bg-[#21262d] text-gray-300 hover:bg-[#30363d]"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : confirmAction[ord.orderId] === "cancelled" ? (
                    <div className="space-y-1.5 rounded-xl border border-rose-500/25 bg-rose-500/5 p-2">
                      <p className="text-center text-[9px] font-bold text-rose-500 uppercase">
                        Xác nhận hủy đơn hàng?
                      </p>
                      <div className="flex gap-1.5">
                        <button
                          onClick={() => {
                            onUpdateOrderStatus(
                              ord.orderId,
                              "Hủy bỏ",
                              "cancelled",
                            );
                            setConfirmAction((prev) => ({
                              ...prev,
                              [ord.orderId]: null,
                            }));
                          }}
                          className="flex-1 cursor-pointer rounded bg-rose-600 py-1.5 text-[9px] font-bold tracking-wider text-white uppercase hover:bg-rose-700"
                        >
                          Đồng ý
                        </button>
                        <button
                          onClick={() =>
                            setConfirmAction((prev) => ({
                              ...prev,
                              [ord.orderId]: null,
                            }))
                          }
                          className={`flex-1 cursor-pointer rounded py-1.5 text-[9px] font-bold tracking-wider uppercase ${
                            d
                              ? "bg-[#21262d] text-gray-300 hover:bg-[#30363d]"
                              : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-100"
                          }`}
                        >
                          Hủy
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <button
                        onClick={() =>
                          setConfirmAction((prev) => ({
                            ...prev,
                            [ord.orderId]: "success",
                          }))
                        }
                        className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                          d
                            ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60"
                            : "border-emerald-200/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                        }`}
                      >
                        <CheckCircle size={11} /> Đóng dấu Hoàn tất
                      </button>

                      <button
                        onClick={() =>
                          setConfirmAction((prev) => ({
                            ...prev,
                            [ord.orderId]: "cancelled",
                          }))
                        }
                        className={`flex w-full cursor-pointer items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                          d
                            ? "bg-rose-950/30 text-rose-400 hover:bg-rose-900/40"
                            : "bg-rose-50 text-rose-600 hover:bg-rose-100"
                        }`}
                      >
                        <X size={11} /> Hủy bỏ đơn
                      </button>

                      {onUpdatePaymentStatus && (
                        <>
                          <div
                            className={`my-1 h-px ${d ? "bg-[#30363d]" : "bg-gray-200"}`}
                          />

                          <button
                            disabled={ord.paymentStatus === "paid"}
                            onClick={() =>
                              onUpdatePaymentStatus(ord.orderId, "paid")
                            }
                            className={`flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                              ord.paymentStatus === "paid"
                                ? d
                                  ? "border-emerald-950 bg-emerald-950/20 text-emerald-500/50 cursor-not-allowed"
                                  : "border-emerald-100 bg-emerald-50/50 text-emerald-600/50 cursor-not-allowed"
                                : d
                                  ? "border-emerald-900/30 bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/60 cursor-pointer"
                                  : "border-emerald-200/40 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 cursor-pointer"
                            }`}
                          >
                            <CheckCircle size={11} /> {ord.paymentStatus === "paid" ? "Đã xác nhận trả" : "Xác nhận đã trả"}
                          </button>

                          <button
                            disabled={ord.paymentStatus === "paid"}
                            onClick={() =>
                              onUpdatePaymentStatus(ord.orderId, "pending")
                            }
                            className={`flex w-full items-center justify-center gap-1 rounded-lg border py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                              ord.paymentStatus === "paid"
                                ? d
                                  ? "border-[#21262d] bg-[#161b22] text-gray-600 cursor-not-allowed"
                                  : "border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed"
                                : d
                                  ? "border-[#30363d] bg-[#21262d] text-gray-200 hover:bg-[#30363d] cursor-pointer"
                                  : "border-gray-200 bg-white text-gray-700 hover:bg-gray-100 cursor-pointer"
                            }`}
                          >
                            <Clock size={11} /> Chờ thanh toán
                          </button>

                          <button
                            disabled={ord.paymentStatus === "paid"}
                            onClick={() =>
                              onUpdatePaymentStatus(ord.orderId, "failed")
                            }
                            className={`flex w-full items-center justify-center gap-1 rounded-lg py-2 text-[10px] font-bold tracking-wider uppercase transition-colors ${
                              ord.paymentStatus === "paid"
                                ? d
                                  ? "bg-rose-950/10 text-rose-500/30 cursor-not-allowed"
                                  : "bg-rose-50/30 text-rose-600/35 cursor-not-allowed"
                                : d
                                  ? "bg-rose-950/30 text-rose-400 hover:bg-rose-900/40 cursor-pointer"
                                  : "bg-rose-50 text-rose-600 hover:bg-rose-100 cursor-pointer"
                            }`}
                          >
                            <X size={11} /> Thanh toán lỗi
                          </button>
                        </>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <OrderExportModal
        isOpen={isExportJsonOpen}
        onClose={() => setIsExportJsonOpen(false)}
        isDarkMode={d}
      />
    </div>
  );
}
