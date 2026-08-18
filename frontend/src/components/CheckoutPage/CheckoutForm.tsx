import React from "react";
import { motion, AnimatePresence } from "motion/react";
import { CartItem } from "../../types";
import {
  ArrowLeft,
  Truck,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  QrCode,
  Gift,
  Smartphone,
  Info,
  CircleDot,
  CreditCard,
} from "lucide-react";
import SepayFields from "./PaymentMethods/SepayFields";
import CodFields from "./PaymentMethods/CodFields";
import MomoFields from "./PaymentMethods/MomoFields";
import VnpayFields from "./PaymentMethods/VnpayFields";

interface CheckoutFormProps {
  cart: CartItem[];
  fullName: string;
  setFullName: (val: string) => void;
  phone: string;
  setPhone: (val: string) => void;
  email: string;
  setEmail: (val: string) => void;
  address: string;
  setAddress: (val: string) => void;
  notes: string;
  setNotes: (val: string) => void;

  paymentMethod: "bank" | "cod";
  setPaymentMethod: (method: "bank" | "cod") => void;
  deliveryMethod: "standard" | "express";
  setDeliveryMethod: (method: "standard" | "express") => void;

  // Promo states
  promoCode: string;
  setPromoCode: (val: string) => void;
  appliedDiscount: number;
  promoError: string;
  promoSuccess: string;
  handleApplyPromo: (e: React.FormEvent) => void;

  // Calculations
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  finalTotal: number;

  apiError: string;
  onSubmit: (e: React.FormEvent) => void;
  onNavigate: (tab: any) => void;
}

export default function CheckoutForm({
  cart,
  fullName,
  setFullName,
  phone,
  setPhone,
  email,
  setEmail,
  address,
  setAddress,
  notes,
  setNotes,
  paymentMethod,
  setPaymentMethod,
  deliveryMethod,
  setDeliveryMethod,
  promoCode,
  setPromoCode,
  appliedDiscount,
  promoError,
  promoSuccess,
  handleApplyPromo,
  subtotal,
  deliveryFee,
  discountAmount,
  finalTotal,
  apiError,
  onSubmit,
  onNavigate,
}: CheckoutFormProps) {
  const [zoomImageSrc, setZoomImageSrc] = React.useState<string | null>(null);

  // Preload background images to eliminate lag on tab switch
  React.useEffect(() => {
    const img1 = new Image();
    img1.src = "/src/assets/images/checkout-form/ruwell-salatan-kqo8P16y0YY-unsplash (small).jpg";
    const img2 = new Image();
    img2.src = "/src/assets/images/checkout-form/sumup-Z-o7nk0joVQ-unsplash.jpg";
  }, []);

  // Render sub-sections based on payment selection
  const renderPaymentFields = () => {
    switch (paymentMethod) {
      case "bank":
        return <SepayFields finalTotal={finalTotal} />;
      case "momo":
        return <MomoFields finalTotal={finalTotal} />;
      case "vnpay":
        return <VnpayFields finalTotal={finalTotal} />;
      case "cod":
        return <CodFields finalTotal={finalTotal} />;
      default:
        return null;
    }
  };

  return (
    <>
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-12">
      <div className="space-y-8 lg:col-span-7">
        {/* Top Navigation / Breadcrumb */}
        <div className="border-gray-150 flex items-center justify-between border-b pb-4">
          <button
            onClick={() => onNavigate("products")}
            className="flex items-center gap-2 font-sans text-xs font-bold tracking-widest text-gray-500 uppercase transition-colors hover:text-black"
          >
            <ArrowLeft size={14} /> Trở Lại
          </button>
          <span className="text-indigo-505 font-mono text-[10px] font-bold tracking-widest uppercase">
            BƯỚC QUYẾT TOÁN 1/2
          </span>
        </div>

        {/* Title Header */}
        <div>
          <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase md:text-3xl">
            THANH TOÁN ĐƠN HÀNG
          </h1>
          <p className="mt-2 font-sans text-xs text-gray-500">
            Xác thực địa chỉ giao hàng và lựa chọn phương thức ủy nhiệm thanh
            toán.
          </p>
        </div>

        {/* Major Billing/Shipping Form */}
        <form onSubmit={onSubmit} className="space-y-6">
          {/* Section 1: Customer info */}
          <div className="space-y-5 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)] md:p-8">
            <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="h-3.5 w-1.5 rounded-full bg-black" />
              <h3 className="text-xs font-black tracking-widest text-gray-800 uppercase">
                I. Thông Tin Khách Hàng Giao Nhận
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div>
                <label className="mb-2 block font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Họ và tên người nhận <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Nguyễn Văn A"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 font-sans text-xs transition-all outline-none focus:border-black focus:bg-white"
                />
              </div>
              <div>
                <label className="mb-2 block font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                  Số điện thoại liên lạc <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  required
                  placeholder="0912 345 678"
                  value={phone}
                  onChange={(e) =>
                    setPhone(e.target.value.replace(/[^0-9+\s-]/g, ""))
                  }
                  className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 font-sans text-xs transition-all outline-none focus:border-black focus:bg-white"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Địa chỉ nhận email (nhận hóa đơn điện tử){" "}
                <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="email@example.com"
                value={email}
                disabled
                className="w-full rounded-xl border border-gray-200 bg-gray-100 px-4 py-3 font-sans text-xs outline-none cursor-not-allowed text-gray-500"
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Địa chỉ giao hàng chi tiết{" "}
                <span className="text-red-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                placeholder="Số nhà, Tên tòa nhà/Ngõ, Tên đường, Phường/Xã, Quận/Huyện, Tỉnh thành..."
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 font-sans text-xs transition-all outline-none focus:border-black focus:bg-white"
              />
            </div>

            <div>
              <label className="mb-2 block font-sans text-[10px] font-bold tracking-wider text-gray-400 uppercase">
                Ghi chú đặc biệt cho nhân viên bưu tá giao nhận (Tùy chọn)
              </label>
              <textarea
                rows={2}
                placeholder="Ví dụ: Lưu ý bọc xốp dày chống sốc, chỉ giao vào giờ hành chính..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 font-sans text-xs transition-all outline-none focus:border-black focus:bg-white"
              />
            </div>
          </div>

          {/* Section 2: Shipping speeds / Delivery method */}
          <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)] md:p-8">
            <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="h-3.5 w-1.5 rounded-full bg-black" />
              <h3 className="text-xs font-black tracking-widest text-gray-800 uppercase">
                II. Phương Thức Vận Chuyển TechVie
              </h3>
            </div>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {/* Method 1: Standard */}
              <div
                onClick={() => setDeliveryMethod("standard")}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 font-sans transition-all ${
                  deliveryMethod === "standard"
                    ? "border-black bg-black/[0.01] shadow-[0_0_12px_rgba(0,0,0,0.02)]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="mt-1">
                  {deliveryMethod === "standard" ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                      <CircleDot size={10} />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                </div>
                <div className="text-xs">
                  <div className="flex items-center justify-between font-extrabold text-gray-900">
                    <span>Vận Chuyển Tiêu Chuẩn</span>
                    <span className="font-mono text-[10px] font-bold text-emerald-600 uppercase">
                      Miễn phí
                    </span>
                  </div>
                  <p className="text-gray-550 mt-1 leading-relaxed">
                    Nhận sau 2-4 ngày làm việc. Đóng gói bọc xốp và chống va đập
                    toàn điện.
                  </p>
                </div>
              </div>

              {/* Method 2: Express */}
              <div
                onClick={() => setDeliveryMethod("express")}
                className={`flex cursor-pointer items-start gap-4 rounded-xl border p-4 font-sans transition-all ${
                  deliveryMethod === "express"
                    ? "border-black bg-black/[0.01] shadow-[0_0_12px_rgba(0,0,0,0.02)]"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="mt-1">
                  {deliveryMethod === "express" ? (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-black text-[10px] text-white">
                      <CircleDot size={10} />
                    </div>
                  ) : (
                    <div className="h-4 w-4 rounded-full border border-gray-300" />
                  )}
                </div>
                <div className="text-xs">
                  <div className="flex items-center justify-between gap-1 font-extrabold text-gray-900">
                    <span>Ship Hoả Tốc Toàn Quốc</span>
                    <span className="font-mono font-extrabold text-gray-900">
                      120.000₫
                    </span>
                  </div>
                  <p className="text-gray-555 mt-1 leading-relaxed">
                    Cam kết giao trong 24H. Vận chuyển siêu tốc đóng bọc chống
                    va đập theo tiêu chuẩn cao cấp nghiêm ngặt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Payment method picker */}
          <div className="space-y-4 rounded-2xl border border-gray-200/80 bg-white p-6 shadow-[0_4px_24px_-10px_rgba(0,0,0,0.03)] md:p-8">
            <div className="mb-2 flex items-center gap-2 border-b border-gray-100 pb-3">
              <span className="h-3.5 w-1.5 rounded-full bg-black" />
              <h3 className="text-xs font-black tracking-widest text-gray-800 uppercase">
                III. Phương Thức Thanh Toán
              </h3>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <button
                type="button"
                onClick={() => setPaymentMethod("bank")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 font-sans text-[10px] font-black tracking-wider uppercase transition-all ${
                  paymentMethod === "bank"
                    ? "border-black bg-black text-white"
                    : "text-gray-650 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <QrCode size={16} />
                VietQR
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("momo")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 font-sans text-[10px] font-black tracking-wider uppercase transition-all ${
                  paymentMethod === "momo"
                    ? "border-black bg-black text-white"
                    : "text-gray-650 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <span className="text-[13px] leading-none h-4 flex items-center justify-center font-extrabold font-sans">M</span>
                MoMo
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("vnpay")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 font-sans text-[10px] font-black tracking-wider uppercase transition-all ${
                  paymentMethod === "vnpay"
                    ? "border-black bg-black text-white"
                    : "text-gray-650 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <CreditCard size={16} />
                VNPAY
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("cod")}
                className={`flex flex-col items-center gap-2 rounded-xl border px-3 py-3.5 font-sans text-[10px] font-black tracking-wider uppercase transition-all ${
                  paymentMethod === "cod"
                    ? "border-black bg-black text-white"
                    : "text-gray-650 border-gray-200 hover:bg-gray-50"
                }`}
              >
                <Smartphone size={16} />
                COD
              </button>
            </div>

            {/* Dynamic Render Details for Payment Method */}
            <div className="mt-4">{renderPaymentFields()}</div>
          </div>

          {/* Footer Controls */}
          <div className="space-y-3 pt-2">
            {apiError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border-rose-150 rounded-xl border bg-rose-50 p-4 text-xs font-semibold text-rose-700"
              >
                {apiError}
              </motion.div>
            )}
            <p className="pb-2 text-[12px] text-gray-500 italic">
              * Khách hàng đảm bảo các thông tin cung cấp là đúng sự thật.
              TechVie không chịu trách nhiệm cho các sai sót phát sinh từ thông
              tin do khách hàng nhập.
            </p>
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl bg-black py-5 font-sans text-xs font-black tracking-widest text-white uppercase shadow-lg transition-all hover:bg-gray-900 active:scale-[0.99]"
            >
              Tạo đơn & chờ xác nhận thanh toán (
              {finalTotal.toLocaleString("vi-VN")}₫)
              <CheckCircle2 size={16} />
            </button>
          </div>
        </form>
      </div>

      {/* Right column: Sticky Checkout cart summaries */}
      <div className="space-y-6 lg:col-span-5">
        {/* Box: Order items check-up */}
        <div className="sticky top-28 space-y-5 rounded-2xl border border-gray-200 bg-white p-6 shadow-sm md:p-8">
          <h3 className="mb-4 border-b border-gray-100 pb-3 text-xs font-black tracking-[0.2em] text-gray-400 uppercase">
            ĐƠN ĐẶT HÀNG CỦA BẠN
          </h3>

          {/* Item checklist loop */}
          <div className="max-h-[300px] space-y-4 divide-y divide-gray-100 overflow-y-auto pr-2">
            {cart.map((item, idx) => (
              <div
                key={item.product.id}
                className={`flex gap-4 pt-3 ${idx === 0 ? "pt-0" : ""}`}
              >
                <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-lg border border-gray-100 bg-gray-50 p-1">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    className="h-12 w-12 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0 flex-grow font-sans text-xs">
                  <h4 className="truncate font-extrabold text-gray-900">
                    {item.product.name}
                  </h4>
                  <p className="mt-0.5 text-[9px] tracking-widest text-gray-400 uppercase">
                    {item.product.category}
                  </p>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="font-mono font-medium text-gray-500">
                      Qty: {item.quantity}
                    </span>
                    <span className="font-mono font-bold text-gray-900">
                      {(item.product.price * item.quantity).toLocaleString(
                        "vi-VN",
                      )}
                      ₫
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Promo Input Field panel */}
          <form
            onSubmit={handleApplyPromo}
            className="border-t border-gray-100 pt-4 font-sans"
          >
            <label className="mb-2 block text-[10px] font-bold tracking-wider text-gray-400 uppercase">
              Mã ưu đãi / Phiếu quà tặng
            </label>
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="TECHVIE2026, VIPLAB..."
                value={promoCode}
                onChange={(e) => setPromoCode(e.target.value)}
                className="flex-grow rounded-lg border border-gray-200 bg-gray-50 px-3 py-2 font-mono text-xs font-bold uppercase outline-none focus:border-black focus:bg-white"
              />
              <button
                type="submit"
                className="rounded-lg border border-black bg-white px-4 font-sans text-[10px] font-extrabold tracking-wider uppercase transition-colors hover:bg-black hover:text-white"
              >
                ÁP DỤNG
              </button>
            </div>
            {promoError && (
              <p className="mt-1 text-[10px] font-medium text-rose-500">
                {promoError}
              </p>
            )}
            {promoSuccess && (
              <p className="mt-1 text-[10px] font-extrabold text-emerald-600">
                {promoSuccess}
              </p>
            )}
          </form>

          {/* Financial tallies breakdown */}
          <div className="text-gray-650 space-y-3 border-t border-gray-100 pt-5 font-sans text-xs">
            <div className="flex items-center justify-between">
              <span>Tổng phụ sản phẩm</span>
              <span className="font-mono font-semibold text-gray-900">
                {subtotal.toLocaleString("vi-VN")}₫
              </span>
            </div>

            {appliedDiscount > 0 && (
              <div className="flex items-center justify-between text-emerald-600">
                <span className="flex items-center gap-1">
                  <Gift size={12} /> Ưu đãi giảm giá{" "}
                </span>
                <span className="font-mono font-bold">
                  -{discountAmount.toLocaleString("vi-VN")}₫
                </span>
              </div>
            )}

            <div className="flex items-center justify-between">
              <span>Đóng gói & Chuyên chở quang học</span>
              <span className="font-mono text-gray-900">
                {deliveryFee === 0 ? (
                  <span className="text-[10px] font-extrabold text-emerald-600 uppercase">
                    Miễn Phí
                  </span>
                ) : (
                  `${deliveryFee.toLocaleString("vi-VN")}₫`
                )}
              </span>
            </div>

            <div className="border-gray-150 flex items-baseline justify-between border-t pt-4">
              <span className="text-sm font-bold text-gray-800">
                Cần thanh toán
              </span>
              <span className="font-mono text-2xl font-black text-black">
                {finalTotal.toLocaleString("vi-VN")}₫
              </span>
            </div>
          </div>

          {/* Protection badges */}
          <div className="bg-gray-55/80 flex items-start gap-3 rounded-2xl border border-gray-100 p-4 font-sans text-[10px] leading-relaxed text-gray-500">
            <ShieldCheck
              size={20}
              className="mt-0.5 flex-shrink-0 text-emerald-500"
            />
            <div>
              <h5 className="font-bold text-gray-800">Cam Kết TechVie Guard</h5>
              <p>
                Mọi sản phẩm thiết bị điện tử chính hãng mua trực tiếp tại
                website của TechVie được hưởng chế độ bảo hành vàng 1 đổi 1
                trong 12 tháng bứt phá, hỗ trợ kỹ thuật và cài đặt cấu hình hoàn
                toàn miễn phí.
              </p>
            </div>
          </div>

          {/* Coupon helper for the user to try out! */}
          <div className="flex items-center gap-2 rounded-lg border border-indigo-100 bg-indigo-50/50 p-2.5 font-sans text-[10px] text-indigo-700">
            <Sparkles
              size={14}
              className="animate-spin"
              style={{ animationDuration: "3s" }}
            />
            <span>
              Mẹo: Hãy nhập mã{" "}
              <strong className="font-mono font-extrabold text-indigo-900 shadow-none">
                TECHVIE2026
              </strong>{" "}
              hoặc{" "}
              <strong className="font-mono font-extrabold text-indigo-900 shadow-none">
                VIPLAB
              </strong>{" "}
              để nhận chiết khấu!
            </span>
          </div>
        </div>
      </div>
    </div>
      
      {/* Zoom Image Modal */}
      <AnimatePresence>
        {zoomImageSrc && (
          <div 
            onClick={() => setZoomImageSrc(null)}
            className="fixed inset-0 z-[9999] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative max-w-sm w-full bg-white p-5 rounded-3xl shadow-2xl border border-gray-100 text-center"
              onClick={(e) => e.stopPropagation()}
            >
              <h4 className="font-sans font-black text-sm uppercase tracking-wide text-gray-900 mb-3">
                Mã QR Thanh Toán Phóng To
              </h4>
              <img 
                src={zoomImageSrc} 
                alt="QR Code Zoomed" 
                className="w-full h-auto rounded-2xl max-h-[70vh] object-contain border border-gray-100 shadow-inner" 
              />
              <p className="text-center font-sans text-[11px] text-gray-400 font-bold mt-4">
                Chạm bên ngoài hoặc bấm nút dưới để đóng
              </p>
              <button 
                onClick={() => setZoomImageSrc(null)}
                className="mt-4 w-full bg-black hover:bg-gray-800 text-white py-3.5 rounded-xl font-sans text-xs font-black uppercase tracking-wider transition-all active:scale-98"
              >
                Đóng ảnh
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
