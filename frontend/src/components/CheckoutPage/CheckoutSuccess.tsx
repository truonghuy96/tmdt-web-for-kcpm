import React from 'react';
import { motion } from 'motion/react';
import { CartItem } from '../../types';
import {
  CheckCircle2,
  Clock3,
  RefreshCw,
  Printer,
  ShieldCheck,
  QrCode,
  ZoomIn,
  ChevronRight,
  Copy,
  Check,
} from 'lucide-react';
import { simulateSepayPayment } from '../../services/api';
import { generateVietQrUrl, SEPAY_CONFIG } from '../../config/paymentConfig';
import ImageZoomModal from '../shared/ImageZoomModal';
import { IS_DEMO_ENABLED } from '../../demo/demoConfig';
import DemoPaymentPanel from '../../demo/DemoPaymentPanel';
import { showSuccess } from '../../utils/toast';
// @ts-ignore
import logoImage from '../../assets/logopage/logo-b-w-techvie.png';

interface CheckoutSuccessProps {
  email: string;
  serverOrderId: number | string | null;
  paymentDetails?: any;
  fullName: string;
  phone: string;
  address: string;
  deliveryMethod: 'standard' | 'express';
  cart: CartItem[];
  subtotal: number;
  appliedDiscount: number;
  discountAmount: number;
  deliveryFee: number;
  finalTotal: number;
  onFinish: () => void;
  onRefreshPaymentStatus: () => void;
  isCheckingPayment: boolean;
  paymentStatusMessage: string;
  onNavigate: (tab: any) => void;
}

export default function CheckoutSuccess({
  email,
  serverOrderId,
  paymentDetails,
  fullName,
  phone,
  address,
  deliveryMethod,
  cart,
  subtotal,
  appliedDiscount,
  discountAmount,
  deliveryFee,
  finalTotal,
  onFinish,
  onRefreshPaymentStatus,
  isCheckingPayment,
  paymentStatusMessage,
  onNavigate,
}: CheckoutSuccessProps) {
  const [isSimulating, setIsSimulating] = React.useState(false);
  const [isQrZoomed, setIsQrZoomed] = React.useState(false);
  const [copied, setCopied] = React.useState(false);

  const handleCopyNote = () => {
    navigator.clipboard.writeText(cleanNote);
    setCopied(true);
    showSuccess("Đã sao chép nội dung chuyển khoản!");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulatePayment = async () => {
    if (!serverOrderId) return;
    setIsSimulating(true);
    try {
      const res = await simulateSepayPayment(serverOrderId);
      if (res.success) {
        onRefreshPaymentStatus();
      } else {
        alert(res.message || 'Lỗi giả lập thanh toán.');
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsSimulating(false);
    }
  };

  const provider = paymentDetails?.provider || paymentDetails?.paymentProvider || '';
  const paymentStatus = paymentDetails?.status || paymentDetails?.paymentStatus || 'pending';
  const paymentReference = paymentDetails?.reference || paymentDetails?.paymentReference || '';
  const paymentNote = paymentDetails?.note || paymentDetails?.paymentNote || '';
  const paymentStatusLabel = paymentDetails?.statusLabel || paymentDetails?.paymentStatusLabel || (paymentStatus === 'paid' ? 'Đã thanh toán' : 'Chờ thanh toán');
  const paymentMethodLabel = provider === 'bank_transfer'
    ? 'Chuyển khoản ngân hàng'
    : provider === 'momo'
      ? 'Ví điện tử MoMo'
      : provider === 'vnpay'
        ? 'Cổng thanh toán VNPAY'
        : provider === 'cod'
          ? 'Thanh toán khi nhận hàng'
          : 'Phương thức thanh toán';
  const cleanNote = paymentNote || paymentReference || `TECHVIE-${serverOrderId}`;
  const paymentQrSrc = provider === 'bank_transfer'
    ? generateVietQrUrl(finalTotal, cleanNote)
    : '';
  const isWaitingPayment = paymentStatus !== 'paid' && provider !== 'cod';

  return (
    <motion.div
      key="checkout-step-success"
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto max-w-2xl space-y-8 py-8 text-center"
    >
      {/* Internal styles for receipt paper look & CSS barcode */}
      <style dangerouslySetInnerHTML={{ __html: `
        .receipt-paper {
          background-color: #ffffff;
          position: relative;
        }
        .jagged-top {
          mask-image: radial-gradient(circle at 6px 0px, transparent 6px, black 7px);
          mask-size: 12px 10px;
          mask-repeat: repeat-x;
          mask-position: top;
          -webkit-mask-image: radial-gradient(circle at 6px 0px, transparent 6px, black 7px);
          -webkit-mask-size: 12px 10px;
          -webkit-mask-repeat: repeat-x;
          -webkit-mask-position: top;
        }
        .jagged-bottom {
          mask-image: radial-gradient(circle at 6px 10px, transparent 6px, black 7px);
          mask-size: 12px 10px;
          mask-repeat: repeat-x;
          mask-position: bottom;
          -webkit-mask-image: radial-gradient(circle at 6px 10px, transparent 6px, black 7px);
          -webkit-mask-size: 12px 10px;
          -webkit-mask-repeat: repeat-x;
          -webkit-mask-position: bottom;
        }
        .css-barcode {
          background-image: repeating-linear-gradient(
            to right,
            #111 0, #111 2px,
            transparent 2px, transparent 4px,
            #111 4px, #111 5px,
            transparent 5px, transparent 8px,
            #111 8px, #111 12px,
            transparent 12px, transparent 15px,
            #111 15px, #111 16px,
            transparent 16px, transparent 20px
          );
        }
        .paper-texture {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.03'/%3E%3C/svg%3E");
        }
      `}} />

      {/* Header Status */}
      <div className="text-center">
        <div className="mx-auto mb-4 flex justify-center">
          {!isWaitingPayment ? (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 shadow-inner"
            >
              <CheckCircle2 size={40} strokeWidth={2.5} className="animate-bounce" />
            </motion.div>
          ) : (
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              className="flex h-20 w-20 items-center justify-center rounded-full bg-amber-100 text-amber-600 shadow-inner"
            >
              <Clock3 size={40} strokeWidth={2.5} />
            </motion.div>
          )}
        </div>
        <h1 className="text-2xl font-black tracking-tight text-gray-900 uppercase md:text-3xl">
          {!isWaitingPayment ? "THANH TOÁN THÀNH CÔNG" : "ĐANG CHỜ THANH TOÁN"}
        </h1>
        <p className="mt-2 text-xs text-gray-505 font-sans leading-relaxed max-w-md mx-auto">
          {!isWaitingPayment 
            ? `Đơn hàng đã được xác nhận thanh toán thành công! Biên lai điện tử đã gửi tới: ${email || 'khachhang@techvie.com'}`
            : `Yêu cầu của bạn đã được ghi nhận. Vui lòng chuyển khoản thanh toán để TechVie đối soát và xử lý giao nhận.`}
        </p>
      </div>

      {/* THE RECEIPT - Tờ hóa đơn in nhiệt */}
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.5 }}
        className="mx-auto max-w-xl filter drop-shadow-2xl relative"
      >
        {/* Đầu tờ giấy */}
        <div className="h-3 w-full bg-white jagged-top"></div>
        
        <div className="receipt-paper paper-texture px-5 md:px-8 py-6 text-gray-800 rounded-sm text-left">
          
          {/* Watermark/Stamp nếu đã thanh toán */}
          {!isWaitingPayment && (
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-10">
              <div className="rotate-[-35deg] transform rounded-lg border-[6px] border-emerald-600 px-8 py-2 text-6xl font-black tracking-widest text-emerald-600">
                PAID
              </div>
            </div>
          )}

          {/* Receipt Header */}
          <div className="text-center">
            <div className="flex justify-center mb-3">
              <img src={logoImage} alt={SEPAY_CONFIG.store} className="h-20 object-contain" />
            </div>
            <p className="mt-1 font-mono text-[10px] text-gray-500 uppercase">
              {SEPAY_CONFIG.address}
            </p>
          </div>

          <div className="my-6 border-b-2 border-dashed border-gray-300"></div>

          {/* Order Meta */}
          <div className="grid grid-cols-2 gap-4 font-mono text-xs">
            <div>
              <p className="text-[10px] text-gray-400 uppercase">Ngày giờ đặt</p>
              <p className="font-semibold">{new Date().toLocaleString('vi-VN')}</p>
            </div>
            <div className="text-right">
              <p className="text-[10px] text-gray-400 uppercase">Mã đơn hàng</p>
              <p className="font-black text-black break-all">{serverOrderId || 'TECHVIE-ORDER'}</p>
            </div>
          </div>

          <div className="my-6 border-b-2 border-dashed border-gray-300"></div>

          {/* Customer Info */}
          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-gray-500">Khách hàng:</span>
              <span className="font-bold text-black text-right">{fullName || 'Khách hàng TechVie'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Số điện thoại:</span>
              <span className="font-bold text-black text-right">{phone || '0900000000'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-500">Phương thức:</span>
              <span className="font-bold text-black text-right uppercase">{paymentMethodLabel}</span>
            </div>
            <div className="flex justify-between gap-3">
              <span className="text-gray-500 flex-shrink-0">Địa chỉ:</span>
              <span className="font-bold text-black text-right truncate max-w-[200px]" title={address}>
                {address || 'Đang cập nhật'}
              </span>
            </div>
          </div>

          <div className="my-6 border-b-2 border-dashed border-gray-300"></div>

          {/* Items Table */}
          <div className="space-y-4">
            <div className="flex justify-between font-mono text-[10px] font-bold text-gray-400 uppercase tracking-wider">
              <span>Sản phẩm</span>
              <span>Thành tiền</span>
            </div>
            
            <div className="space-y-3">
              {cart.map((item, idx) => (
                <div key={idx} className="flex justify-between items-start font-mono text-xs gap-4">
                  <div className="min-w-0 flex-grow">
                    <div className="font-bold text-black truncate" title={item.product.name}>
                      {item.product.name}
                    </div>
                    <div className="text-[10px] text-gray-500 mt-0.5">
                      {item.quantity} x {item.product.price.toLocaleString('vi-VN')}₫
                    </div>
                  </div>
                  <div className="font-semibold text-black flex-shrink-0 text-right">
                    {(item.quantity * item.product.price).toLocaleString('vi-VN')}₫
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="my-6 border-b-2 border-dashed border-gray-300"></div>

          {/* Totals */}
          <div className="space-y-2 font-mono text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Tổng phụ</span>
              <span>{subtotal.toLocaleString('vi-VN')}₫</span>
            </div>
            {appliedDiscount > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Giảm giá</span>
                <span>-{discountAmount.toLocaleString('vi-VN')}₫</span>
              </div>
            )}
            <div className="flex justify-between text-gray-600">
              <span>Vận chuyển ({deliveryMethod === 'express' ? 'Hỏa tốc' : 'Tiêu chuẩn'})</span>
              <span>{deliveryFee === 0 ? "MIỄN PHÍ" : `${deliveryFee.toLocaleString('vi-VN')}₫`}</span>
            </div>
            
            <div className="pt-2">
              <div className="flex items-end justify-between border-t-2 border-black pt-2">
                <span className="font-sans text-sm font-black uppercase tracking-wider text-black">Tổng cộng</span>
                <span className="font-mono text-2xl font-black text-indigo-700">
                  {finalTotal.toLocaleString('vi-VN')}₫
                </span>
              </div>
            </div>
          </div>

          {/* Payment Action Area (If Pending & waiting for payment) */}
          {isWaitingPayment && provider === 'bank_transfer' && paymentQrSrc && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-8 overflow-hidden rounded-xl border border-gray-200 bg-gray-50 p-4 shadow-inner"
            >
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-bold text-indigo-700">
                <QrCode size={18} />
                <span>QUÉT MÃ ĐỂ THANH TOÁN</span>
              </div>
              
              {/* Interactive Zoom QR block */}
              <div 
                onClick={() => setIsQrZoomed(true)}
                className="mx-auto mb-4 h-40 w-40 rounded-lg border-2 border-dashed border-gray-300 bg-white p-2 cursor-zoom-in group relative overflow-hidden flex items-center justify-center"
              >
                <img 
                  src={paymentQrSrc} 
                  alt="QR thanh toán"
                  className="h-full w-full object-contain transition-transform duration-200 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                  <ZoomIn size={18} className="text-white opacity-0 group-hover:opacity-100 transition-opacity bg-black/40 p-1.5 rounded-full w-8 h-8" />
                </div>
              </div>

              <div 
                onClick={handleCopyNote}
                className="rounded bg-white p-3 font-mono text-xs text-center border border-gray-200 shadow-sm cursor-pointer hover:bg-gray-50 active:scale-98 transition-all group"
                title="Nhấp để sao chép nội dung"
              >
                <p className="text-gray-500 mb-1 flex items-center justify-center gap-1">
                  <span>Nội dung chuyển khoản:</span>
                  {copied ? (
                    <Check size={12} className="text-emerald-600" />
                  ) : (
                    <Copy size={12} className="text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity" />
                  )}
                </p>
                <p className="font-bold text-black text-sm break-all">
                  {cleanNote}
                </p>
              </div>
            </motion.div>
          )}

          {isWaitingPayment && provider === 'momo' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-8 overflow-hidden rounded-xl border border-pink-100 bg-pink-50/40 p-5 shadow-inner space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-pink-700">
                <span className="text-[12px] font-black h-4 w-4 bg-pink-600 text-white rounded flex items-center justify-center">M</span>
                <span>THANH TOÁN QUA MOMO SANDBOX</span>
              </div>
              <p className="text-gray-550 text-[11px] leading-relaxed max-w-sm mx-auto">
                Hệ thống hỗ trợ thanh toán thử nghiệm qua ví MoMo. Vui lòng nhấn vào liên kết bên dưới để tiến hành giả lập thanh toán.
              </p>
              <a 
                href="https://developers.momo.vn/v2/#/docs/testing_information?id=%e1%bb%a8ng-d%e1%bb%a5ng-momo" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-[#a50064] px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-md hover:bg-[#80004e] transition-all hover:scale-102 active:scale-98"
              >
                Mở MoMo Sandbox Test
              </a>
            </motion.div>
          )}

          {isWaitingPayment && provider === 'vnpay' && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-8 overflow-hidden rounded-xl border border-blue-150 bg-blue-50/40 p-5 shadow-inner space-y-4"
            >
              <div className="flex items-center justify-center gap-2 text-sm font-bold text-blue-700">
                <span className="text-[9px] font-black h-4 px-1 bg-blue-600 text-white rounded flex items-center justify-center">VNPAY</span>
                <span>THANH TOÁN QUA VNPAY SANDBOX</span>
              </div>
              <p className="text-gray-550 text-[11px] leading-relaxed max-w-sm mx-auto">
                Nhấn nút bên dưới để chuyển tiếp đến cổng thanh toán giả lập VNPAY Sandbox (Sử dụng thẻ ngân hàng NCB test được cung cấp sẵn tại trang demo).
              </p>
              <a 
                href="http://sandbox.vnpayment.vn/tryitnow/Home/CreateOrder" 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex cursor-pointer items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-xs font-black tracking-widest text-white uppercase shadow-md hover:bg-blue-700 transition-all hover:scale-102 active:scale-98"
              >
                Mở Cổng VNPAY Sandbox
              </a>
            </motion.div>
          )}

          {/* Footer / Barcode */}
          <div className="mt-8 flex flex-col items-center">
            <div className="flex items-center gap-1 font-sans text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">
              <ShieldCheck size={12} />
              TechVie Secure Checkout
            </div>
            
            {/* CSS Barcode */}
            <div className="css-barcode h-12 w-full max-w-[250px] opacity-85"></div>
            <p className="mt-1 font-mono text-[9px] tracking-[0.25em] text-gray-500 uppercase">
              *{String(serverOrderId || 'TECHVIE').replace(/-/g, '').slice(-12)}*
            </p>
          </div>

        </div>
        
        {/* Cuối tờ giấy */}
        <div className="h-3 w-full bg-white jagged-bottom shadow-md"></div>
      </motion.div>

      {/* Action Status Message */}
      {paymentStatusMessage && (
        <p className={`mt-6 text-center text-xs font-sans font-bold ${
          paymentStatus === 'paid' ? 'text-emerald-600' : 'text-amber-700'
        }`}>
          {paymentStatusMessage}
        </p>
      )}

      {/* Actions Outside Receipt */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row"
      >
        {isWaitingPayment ? (
          <>
            <button 
              type="button"
              onClick={onRefreshPaymentStatus}
              disabled={isCheckingPayment}
              className="group flex w-full items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-black px-8 py-4 font-sans text-sm font-bold tracking-wide text-white transition-all hover:bg-gray-800 active:scale-95 disabled:opacity-60 cursor-pointer sm:w-auto"
            >
              <RefreshCw size={18} className={isCheckingPayment ? "animate-spin" : ""} />
              {isCheckingPayment ? "Đang kiểm tra..." : "Kiểm tra"}
            </button>
            <button 
              type="button"
              onClick={() => {
                onFinish();
                onNavigate("account");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-8 py-4 font-sans text-sm font-bold tracking-wide text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95 cursor-pointer sm:w-auto"
            >
              Lịch sử đơn hàng
            </button>
          </>
        ) : (
          <>
            <button 
              type="button"
              onClick={onFinish}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-transparent bg-black px-8 py-4 font-sans text-sm font-bold tracking-wide text-white transition-all hover:bg-gray-800 active:scale-95 cursor-pointer sm:w-auto"
            >
              Tiếp tục mua sắm
              <ChevronRight size={18} />
            </button>
            <button 
              type="button"
              onClick={() => {
                onFinish();
                onNavigate("account");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-indigo-200 bg-indigo-50 px-8 py-4 font-sans text-sm font-bold tracking-wide text-indigo-700 transition-all hover:bg-indigo-100 active:scale-95 cursor-pointer sm:w-auto"
            >
              Lịch sử đơn hàng
            </button>
          </>
        )}
      </motion.div>

      {/* Image zoom overlay */}
      <ImageZoomModal
        isOpen={isQrZoomed}
        onClose={() => setIsQrZoomed(false)}
        imageSrc={paymentQrSrc}
        altText={`QR ${paymentMethodLabel}`}
      />

      {/* Floating developer payment panel */}
      {IS_DEMO_ENABLED && isWaitingPayment && (
        <DemoPaymentPanel
          serverOrderId={serverOrderId}
          isSimulating={isSimulating}
          isChecking={isCheckingPayment}
          onSimulate={handleSimulatePayment}
          onRefresh={onRefreshPaymentStatus}
        />
      )}
    </motion.div>
  );
}
