import { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Package, CheckCircle2, Banknote, Smartphone, CreditCard, Truck, ZoomIn, Copy, Clock, XCircle } from 'lucide-react';
import { AnimatePresence } from 'motion/react';
import { getProducts } from '../../services/api';
import ProductDetail from '../ProductPage/ProductDetail';
import { Product } from '../../types';
import { showSuccess } from '../../utils/toast';

interface TabOrdersProps {
  orders: any[];
  onNavigate?: (tab: string) => void;
  onAddToCart?: (product: Product, selectedColor?: string) => void;
}

const PAYMENT_CONFIG: Record<string, { label: string; color: string; bg: string; Icon: any }> = {
  cod:           { label: 'COD',           color: 'text-amber-700',   bg: 'bg-amber-50 border-amber-200',     Icon: Truck },
  bank_transfer: { label: 'Chuyển khoản', color: 'text-blue-700',    bg: 'bg-blue-50 border-blue-200',       Icon: Banknote },
  momo:          { label: 'MoMo',          color: 'text-pink-700',    bg: 'bg-pink-50 border-pink-200',       Icon: Smartphone },
  vnpay:         { label: 'VNPAY',         color: 'text-indigo-700',  bg: 'bg-indigo-50 border-indigo-200',   Icon: CreditCard },
  zalopay:       { label: 'ZaloPay',       color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', Icon: CreditCard },
};

function formatVND(value: any): string {
  const num = typeof value === 'string'
    ? parseInt(value.replace(/\D/g, ''), 10)
    : Number(value);
  if (isNaN(num)) return String(value);
  return num.toLocaleString('vi-VN') + '₫';
}

const getVibrantStatusBadgeClass = (status: string, statusType: string) => {
  const type = String(statusType).toLowerCase();
  const st = String(status).toLowerCase();
  
  if (type === "success" || st.includes("hoàn tất")) {
    return "bg-emerald-500 text-white shadow-[0_2px_8px_rgba(16,185,129,0.25)] border-emerald-400";
  }
  if (type === "shipping" || st.includes("giao hàng") || st.includes("bưu tá")) {
    return "bg-blue-500 text-white shadow-[0_2px_8px_rgba(59,130,246,0.25)] border-blue-400";
  }
  if (type === "cancelled" || st.includes("hủy") || st.includes("thất bại")) {
    return "bg-rose-500 text-white shadow-[0_2px_8px_rgba(244,63,94,0.25)] border-rose-400";
  }
  if (type === "processing" || st.includes("chuẩn bị") || st.includes("xác nhận") || st.includes("lắp ráp")) {
    return "bg-purple-500 text-white shadow-[0_2px_8px_rgba(168,85,247,0.25)] border-purple-400";
  }
  return "bg-amber-500 text-white shadow-[0_2px_8px_rgba(245,158,11,0.25)] border-amber-400";
};

const renderStatusIcon = (statusType: string) => {
  const type = String(statusType).toLowerCase();
  
  if (type === "success") {
    return <CheckCircle2 size={15} className="text-emerald-500 flex-shrink-0" />;
  }
  if (type === "shipping") {
    return <Truck size={15} className="text-blue-500 flex-shrink-0 animate-bounce" />;
  }
  if (type === "cancelled") {
    return <XCircle size={15} className="text-rose-500 flex-shrink-0" />;
  }
  if (type === "processing") {
    return (
      <div className="relative flex items-center justify-center flex-shrink-0 w-4 h-4">
        <span className="animate-ping absolute inline-flex h-2.5 w-2.5 rounded-full bg-purple-400 opacity-75"></span>
        <Package size={15} className="text-purple-600 relative z-10 animate-pulse" />
      </div>
    );
  }
  return <Clock size={15} className="text-amber-500 flex-shrink-0 animate-pulse" />;
};

const normalizeProduct = (p: any): Product => {
  let safeSpecs: { label: string; value: string }[] = [];
  if (Array.isArray(p.specs)) {
    safeSpecs = p.specs.map((s: any) => ({
      label: s && typeof s.label === 'string' ? s.label : 'Thông số',
      value: s && typeof s.value === 'string' ? s.value : (typeof s === 'string' ? s : 'Đang cập nhật'),
    }));
  } else if (p.specs && typeof p.specs === 'object') {
    safeSpecs = Object.entries(p.specs).map(([key, val]) => ({ label: key, value: String(val) }));
  }
  while (safeSpecs.length < 2) safeSpecs.push({ label: 'Thông số', value: 'Đang cập nhật' });
  return {
    id: p.id || p._id || String(Math.random()),
    name: p.name || 'Sản phẩm TechVie',
    price: typeof p.price === 'number' ? p.price : Number(p.price) || 0,
    image: p.image || '',
    category: p.category || 'Thiết bị',
    description: p.description || 'Mô tả đang được cập nhật.',
    specs: safeSpecs,
    colors: Array.isArray(p.colors) ? p.colors : (typeof p.colors === 'string' ? p.colors.split(',').map((c: string) => c.trim()) : []),
    averageRating: typeof p.averageRating === 'number' ? p.averageRating : 0,
    reviewCount: typeof p.reviewCount === 'number' ? p.reviewCount : 0,
  };
};

export default function TabOrders({ orders, onNavigate, onAddToCart }: TabOrdersProps) {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [loadingProductId, setLoadingProductId] = useState<string | null>(null);

  const handleOpenProduct = useCallback(async (item: any) => {
    const productId: string | undefined = item.productId || item.product_id || item.id;
    if (!productId) return;

    setLoadingProductId(productId);
    try {
      const res = await getProducts();
      if (res.success && res.products.length > 0) {
        const found = res.products.find(
          (p: any) => (p.id || p._id) === productId
        );
        if (found) {
          setSelectedProduct(normalizeProduct(found));
          setLoadingProductId(null);
          return;
        }
      }
      // Fallback: construct minimal product from order item data
      setSelectedProduct(normalizeProduct({
        id: productId,
        name: item.name,
        image: item.image || '',
        price: item.price || 0,
        category: item.type || 'Thiết bị',
        description: '',
        specs: [],
        colors: item.color ? [item.color] : [],
      }));
    } catch {
      // Fallback on error
      setSelectedProduct(normalizeProduct({
        id: productId,
        name: item.name,
        image: item.image || '',
        price: item.price || 0,
        category: item.type || 'Thiết bị',
        description: '',
        specs: [],
      }));
    }
    setLoadingProductId(null);
  }, []);

  return (
    <>
      {/* ProductDetail modal — rendered at document.body via portal to escape overflow clipping */}
      {createPortal(
        <AnimatePresence>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              onAddToCart={onAddToCart || (() => {})}
              onNavigate={onNavigate as any || (() => {})}
              isLoggedIn={!!localStorage.getItem('techvie_token')}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      <div className="h-full bg-white/60 backdrop-blur-lg border border-white/60 rounded-xl p-6 relative overflow-hidden flex flex-col shadow-sm">
        <div className="mb-5 border-b border-white/60 pb-3">
          <h3 className="font-headline-lg text-headline-lg text-[#2d3748] tracking-widest">TIẾN TRÌNH ĐƠN HÀNG</h3>
          <p className="text-[#4a5568] mt-1 max-w-lg text-sm">Theo dõi thực tế hành trình đơn sản phẩm và trạng thái bàn giao.</p>
        </div>

        <div className="space-y-5 flex-grow">
          {orders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 px-4 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-black/5 flex items-center justify-center text-gray-400">
                <Package size={28} />
              </div>
              <div className="space-y-1">
                <h4 className="font-extrabold text-[#2d3748] text-sm uppercase tracking-wider">Không tìm thấy đơn hàng</h4>
                <p className="text-[#4a5568] max-w-xs text-[13px]">Lịch sử giao dịch của tài khoản này hiện chưa có bưu kiện nào được ghi nhận.</p>
              </div>
            </div>
          ) : (
            orders.map((ord) => {
              const payment = PAYMENT_CONFIG[ord.paymentMethod];
              const PayIcon = payment?.Icon;
              return (
                <div key={ord.id} className="bg-white/70 backdrop-blur-md border border-white/70 rounded-2xl overflow-hidden shadow-sm font-sans text-xs">

                  {/* ── Header row ── */}
                  <div className="bg-white/50 border-b border-white/60 px-5 py-4 grid grid-cols-3 gap-4 items-start">
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-black text-[#4a5568] tracking-[0.15em]">Đơn hàng</span>
                      <strong 
                        onClick={() => {
                          navigator.clipboard.writeText(ord.id);
                          showSuccess("Đã sao chép mã đơn hàng!");
                        }}
                        className="text-[#2d3748] font-extrabold text-[13px] font-mono leading-tight break-all cursor-pointer hover:text-black hover:underline active:scale-95 transition-all inline-flex items-center gap-1 group"
                        title="Click để sao chép mã đơn hàng"
                      >
                        <span>{ord.id}</span>
                        <Copy size={11} className="text-gray-400 opacity-50 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                      </strong>
                    </div>
                    <div className="flex flex-col gap-1">
                      <span className="text-[9px] uppercase font-black text-[#4a5568] tracking-[0.15em]">Ngày đặt</span>
                      <span className="font-semibold text-[#2d3748] text-[12px] leading-tight">{ord.date}</span>
                    </div>
                    <div className="flex flex-col gap-1 items-end text-right">
                      <span className="text-[9px] uppercase font-black text-[#4a5568] tracking-[0.15em]">Tổng thanh toán</span>
                      <strong className="text-black font-black font-mono text-[15px] leading-tight">
                        {formatVND(ord.total)}
                      </strong>
                      {payment && (
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase tracking-wide ${payment.color} ${payment.bg}`}>
                          {PayIcon && <PayIcon size={9} />}
                          {payment.label}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* ── Items row ── */}
                  <div className="px-5 py-4 space-y-3">
                    {ord.items.map((item: any, idx: number) => {
                      const hasProductId = !!(item.productId || item.product_id || item.id);
                      const isLoading = loadingProductId === (item.productId || item.product_id || item.id);
                      return (
                        <div
                          key={idx}
                          onClick={() => hasProductId && handleOpenProduct(item)}
                          className={`flex gap-3 items-start rounded-xl p-2 -mx-2 transition-all duration-150 ${hasProductId ? 'cursor-pointer hover:bg-black/5 group' : ''}`}
                        >
                          {/* Product thumbnail */}
                          <div className="w-12 h-12 rounded-xl overflow-hidden border border-gray-200/60 bg-gray-50 flex items-center justify-center flex-shrink-0 relative">
                            {item.image ? (
                              <>
                                <img
                                  src={item.image}
                                  alt={item.name}
                                  referrerPolicy="no-referrer"
                                  className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-110"
                                />
                                {hasProductId && (
                                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 flex items-center justify-center transition-all duration-200">
                                    {isLoading ? (
                                      <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin opacity-0 group-hover:opacity-100" />
                                    ) : (
                                      <ZoomIn size={12} className="text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <Package size={18} className="text-gray-400" />
                            )}
                          </div>

                          {/* Product info */}
                          <div className="flex flex-col gap-0.5 min-w-0 flex-grow">
                            <h4 className={`font-extrabold text-[12px] leading-tight transition-colors ${hasProductId ? 'text-[#2d3748] group-hover:text-black group-hover:underline underline-offset-2' : 'text-[#2d3748]'}`}>
                              {item.name}
                            </h4>
                            <p className="text-[9px] uppercase tracking-wider text-[#4a5568]">
                              {item.type} &bull; SL: {item.qty}
                              {item.color && <> &bull; {item.color}</>}
                            </p>
                            {item.price && (
                              <p className="text-[10px] font-bold text-[#2d3748] font-mono mt-0.5">
                                {formatVND(item.price)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}

                    {/* ── Status row ── */}
                    <div className="pt-3 border-t border-white/60 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2 text-xs text-[#2d3748]">
                        {renderStatusIcon(ord.statusType)}
                        <span className="font-semibold text-[#2d3748] flex items-center gap-1.5">
                          Trạng thái:
                          <strong className={`inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${getVibrantStatusBadgeClass(ord.status, ord.statusType)}`}>
                            {ord.status}
                          </strong>
                        </span>
                      </div>
                      {onNavigate && (
                        <button
                          onClick={() => onNavigate(`checkout?orderId=${ord.id}`)}
                          className="px-3.5 py-1.5 rounded-lg border border-black bg-black text-white hover:bg-gray-800 transition-all font-black text-[9px] uppercase tracking-widest cursor-pointer shadow-sm hover:scale-105 active:scale-95"
                        >
                          Xem biên lai / Thanh toán
                        </button>
                      )}
                    </div>
                  </div>

                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
