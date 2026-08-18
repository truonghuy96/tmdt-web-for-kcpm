import { useState, useEffect, useRef } from 'react';
import { DollarSign, ShoppingBag, Package, MessageSquare, Boxes } from 'lucide-react';

interface DashboardStatsProps {
  totalRevenue: number;
  ordersCount: number;
  processingOrdersCount: number;
  productsCount: number;
  messagesCount: number;
  totalStock: number;
  lowStockCount: number;
  isDarkMode?: boolean;
}

/** Animates a number from 0 to `target` over `duration` ms */
function useCountUp(target: number, duration = 900, enabled = true) {
  const [value, setValue] = useState(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    if (!enabled) { setValue(target); return; }
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      // ease-out cubic
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * target));
      if (progress < 1) frameRef.current = requestAnimationFrame(tick);
    };
    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, [target, duration, enabled]);

  return value;
}

export default function DashboardStats({
  totalRevenue,
  ordersCount,
  processingOrdersCount,
  productsCount,
  messagesCount,
  totalStock,
  lowStockCount,
  isDarkMode = false,
}: DashboardStatsProps) {
  const d = isDarkMode;

  // Animate on first mount
  const [mounted, setMounted] = useState(false);
  useEffect(() => { const t = setTimeout(() => setMounted(true), 80); return () => clearTimeout(t); }, []);

  const animRevenue = useCountUp(totalRevenue, 1200, mounted);
  const animOrders = useCountUp(ordersCount, 800, mounted);
  const animProducts = useCountUp(productsCount, 700, mounted);
  const animMessages = useCountUp(messagesCount, 700, mounted);
  const animStock = useCountUp(totalStock, 1000, mounted);

  const formatRevenue = (value: number) => {
    if (value >= 1_000_000_000) return (value / 1_000_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ ₫';
    if (value >= 1_000_000) return (value / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' triệu ₫';
    return value.toLocaleString('vi-VN') + '₫';
  };

  const cardBase = `admin-stat-card border rounded-3xl p-5 xl:p-6 flex items-center justify-between transition-all duration-300 min-w-0 cursor-default`;
  const cardLight = `bg-white border-gray-200 text-gray-900`;
  const cardDark = `bg-[#161b22] border-[#30363d] text-white`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 xl:gap-6">

      {/* Stat 1: Revenue */}
      <div className={`${cardBase} ${d ? cardDark : cardLight} xl:col-span-1`}>
        <div className="space-y-1 min-w-0 flex-grow">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans block">DOANH THU ƯỚC TÍNH</span>
          <strong
            className={`text-xl sm:text-2xl font-black font-mono tracking-tight block truncate ${d ? 'text-white' : 'text-gray-900'}`}
            title={totalRevenue.toLocaleString('vi-VN') + '₫'}
          >
            {formatRevenue(animRevenue)}
          </strong>
          <span className="text-[9px] text-[#4f46e5] block font-mono">
            T.bình {animOrders > 0 ? Math.round(animRevenue / animOrders).toLocaleString('vi-VN') : 0}₫ / đơn hàng
          </span>
        </div>
        <div className={`group w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ml-3 transition-transform duration-200 hover:scale-110 ${d ? 'bg-indigo-950/40 text-indigo-400' : 'bg-[#e0e7ff] text-[#4f46e5]'}`}>
          <DollarSign size={18} />
        </div>
      </div>

      {/* Stat 2: Orders */}
      <div className={`${cardBase} ${d ? cardDark : cardLight}`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans block">SỔ ĐƠN ĐÃ LỌC</span>
          <strong className={`text-xl sm:text-2xl font-black font-mono tracking-tight block ${d ? 'text-white' : 'text-gray-900'}`}>
            {animOrders} đơn hàng
          </strong>
          <span className="text-[9px] text-gray-400 block font-mono">
            Gồm {processingOrdersCount} đơn đang xử lý
          </span>
        </div>
        <div className={`group w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center ml-3 transition-transform duration-200 hover:scale-110 ${d ? 'bg-indigo-950/40 text-indigo-400' : 'bg-indigo-50 text-indigo-600'}`}>
          <ShoppingBag size={18} />
        </div>
      </div>

      {/* Stat 3: Products */}
      <div className={`${cardBase} ${d ? cardDark : cardLight}`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans block">ACTIVE CATALOGUE</span>
          <strong className={`text-xl sm:text-2xl font-black font-mono tracking-tight block ${d ? 'text-white' : 'text-gray-900'}`}>
            {animProducts} danh mục
          </strong>
          <span className="text-[9px] text-emerald-600 block font-mono">
            Gồm {animProducts} sản phẩm sẵn có
          </span>
        </div>
        <div className={`group w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center ml-3 transition-transform duration-200 hover:scale-110 ${d ? 'bg-emerald-950/40 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
          <Package size={18} />
        </div>
      </div>

      {/* Stat 4: Messages */}
      <div className={`${cardBase} ${d ? cardDark : cardLight}`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans block">THƯ LIÊN HỆ GÓP Ý</span>
          <strong className={`text-xl sm:text-2xl font-black font-mono tracking-tight block ${d ? 'text-white' : 'text-gray-900'}`}>
            {animMessages} thư phản hồi
          </strong>
          <span className="text-[9px] text-amber-600 block font-mono">
            Nhận và phản hồi SMTP trực tiếp
          </span>
        </div>
        <div className={`group w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center ml-3 transition-transform duration-200 hover:scale-110 ${d ? 'bg-amber-950/40 text-amber-500' : 'bg-amber-50 text-amber-500'}`}>
          <MessageSquare size={18} />
        </div>
      </div>

      {/* Stat 5: Stock */}
      <div className={`${cardBase} ${d ? cardDark : cardLight} sm:col-span-2 md:col-span-2 lg:col-span-1 xl:col-span-1`}>
        <div className="space-y-1">
          <span className="text-[10px] uppercase font-bold text-gray-400 tracking-wider font-sans block">TỔNG TỒN KHO</span>
          <strong className={`text-xl sm:text-2xl font-black font-mono tracking-tight block ${d ? 'text-white' : 'text-gray-900'}`}>
            {animStock.toLocaleString('vi-VN')} chiếc
          </strong>
          <span className={`text-[9px] block font-mono flex items-center gap-1 ${lowStockCount > 0 ? 'text-amber-500' : 'text-violet-600'}`}>
            {lowStockCount > 0 ? (
              <>
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse inline-block" />
                {lowStockCount} sản phẩm sắp hết hàng
              </>
            ) : 'Kho hàng ổn định'}
          </span>
        </div>
        <div className={`group w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center ml-3 transition-transform duration-200 hover:scale-110 ${d ? 'bg-violet-950/40 text-violet-400' : 'bg-violet-50 text-violet-600'}`}>
          <Boxes size={18} />
        </div>
      </div>
    </div>
  );
}
