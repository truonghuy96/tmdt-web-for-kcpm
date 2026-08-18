import React, { useState, useEffect, useRef } from 'react';
import { Ticket, Plus } from 'lucide-react';

interface Promo {
  code: string;
  discount: number;
  description: string;
  usedCount: number;
  minOrderVal: number;
  isActive: boolean;
}

interface PromoManagerProps {
  promos: Promo[];
  onAddPromo: (promo: Promo) => void;
  onTogglePromoStatus: (code: string) => void;
  onDeletePromo: (code: string) => void;
  isDarkMode?: boolean;
}

export default function PromoManager({
  promos,
  onAddPromo,
  onTogglePromoStatus,
  onDeletePromo,
  isDarkMode = false,
}: PromoManagerProps) {
  // Local states for Promo Creation form
  const [newPromoCode, setNewPromoCode] = useState('');
  const [newPromoDiscount, setNewPromoDiscount] = useState<number>(10); // in percent
  const [newPromoDesc, setNewPromoDesc] = useState('');
  const [newPromoMinOrder, setNewPromoMinOrder] = useState<number>(0);
  
  // Custom Dropdown State & Ref
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Helper functions for formatting price with dots (thousands separator) without cursor jumping
  const formatPriceWithDots = (num: number): string => {
    if (num === 0) return "";
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const handleMinOrderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target;
    const selectionStart = input.selectionStart || 0;
    const valueBeforeCursor = input.value.slice(0, selectionStart);
    const digitsBefore = valueBeforeCursor.replace(/\D/g, "").length;

    const rawValue = input.value.replace(/\D/g, "");
    const parsedValue = parseInt(rawValue, 10) || 0;

    setNewPromoMinOrder(parsedValue);

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

  // Close dropdown on click outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPromoCode.trim()) return;
    const upperCode = newPromoCode.trim().toUpperCase();

    const newPromo = {
      code: upperCode,
      discount: newPromoDiscount / 100, // convert percentage to fraction
      description: newPromoDesc.trim() || `Giảm giá toàn sàn ${newPromoDiscount}%`,
      usedCount: 0,
      minOrderVal: newPromoMinOrder,
      isActive: true
    };

    onAddPromo(newPromo);
    setNewPromoCode('');
    setNewPromoDesc('');
    setNewPromoMinOrder(0);
  };

  const d = isDarkMode;

  return (
    <div className="space-y-8 animate-fade-in font-sans">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Form to create coupon (4 cols) */}
        <div className={`lg:col-span-4 p-6 sm:p-8 rounded-3xl shadow-sm space-y-4 border transition-all duration-300 ${
          d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
        }`}>
          <div>
            <h3 className={`font-extrabold text-base uppercase tracking-wider text-left transition-colors duration-300 ${d ? 'text-white' : 'text-gray-950'}`}>Ban hành Voucher mới</h3>
            <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed text-left transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-405'}`}>Thiết lập các tham số giảm đặt chuẩn cho toàn sành giao quy đổi.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5 flex flex-col text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400">Mã Coupon (In hoa) *</label>
              <input
                type="text"
                required
                value={newPromoCode}
                onChange={(e) => setNewPromoCode(e.target.value.toUpperCase())}
                placeholder="Ví dụ: SUMMEROOF"
                className={`w-full rounded-xl px-4 py-3 outline-none text-xs font-mono font-bold uppercase transition-all duration-300 border ${
                  d
                    ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:border-indigo-500 placeholder-gray-500'
                    : 'bg-slate-50 border-slate-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="space-y-1.5 flex flex-col text-left" ref={dropdownRef}>
              <label className="text-[10px] uppercase font-bold text-gray-400">Mức chiết khấu (%)</label>
              
              <div className="relative w-full">
                {/* Custom Dropdown Trigger */}
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border text-left transition-all duration-200 cursor-pointer
                    ${
                      d
                        ? isDropdownOpen
                          ? "bg-[#161b22] border-indigo-500 text-white shadow-sm"
                          : "bg-[#0d1117]/60 border-[#30363d] text-white hover:border-gray-700 hover:bg-[#21262d]/50"
                        : isDropdownOpen
                          ? "bg-white border-black text-gray-905 shadow-sm"
                          : "bg-slate-50 border-slate-200 text-gray-905 hover:border-gray-300 hover:bg-gray-50/50"
                    }
                  `}
                >
                  <span className="font-bold text-xs">
                    Giảm {newPromoDiscount}%
                  </span>
                  
                  {/* Arrow Icon */}
                  <svg
                    className={`w-4 h-4 text-gray-450 transition-transform duration-300 ${isDropdownOpen ? "rotate-180 text-black" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {/* Custom Dropdown Menu */}
                {isDropdownOpen && (
                  <div
                    className={`absolute top-full left-0 z-50 w-full mt-2 rounded-2xl shadow-xl py-2 animate-fade-in text-xs transition-all duration-350 border ${
                      d
                        ? "bg-[#161b22] border-[#30363d] text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)]"
                        : "bg-white border-gray-200 text-gray-900 shadow-xl"
                    }`}
                  >
                    <ul className="max-h-60 overflow-auto scrollbar-none space-y-1">
                      {[5, 10, 15, 20, 25, 30, 50].map((discountVal) => (
                        <li
                          key={discountVal}
                          onClick={() => {
                            setNewPromoDiscount(discountVal);
                            setIsDropdownOpen(false);
                          }}
                          className={`flex items-center justify-between px-4 py-2.5 cursor-pointer transition-colors mx-2 rounded-xl group
                            ${
                              newPromoDiscount === discountVal
                                ? d
                                  ? "bg-[#21262d] text-white font-black hover:bg-white/10"
                                  : "bg-slate-100 text-black font-black hover:bg-black hover:text-white"
                                : d
                                  ? "text-gray-350 hover:bg-[#21262d] hover:text-white font-bold"
                                  : "text-gray-600 hover:bg-black hover:text-white font-bold"
                            }
                          `}
                        >
                          <span>
                            {discountVal === 50 ? 'Giảm cực hạn 50%' : `Giảm ${discountVal}%`}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-1.5 flex flex-col text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400">Hạn định đơn tối thiểu (VND)</label>
              <input
                type="text"
                value={formatPriceWithDots(newPromoMinOrder)}
                onChange={handleMinOrderChange}
                placeholder="Ví dụ: 10.000.000"
                className={`w-full rounded-xl px-4 py-3 outline-none text-xs font-mono font-bold transition-all duration-300 border ${
                  d
                    ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:border-indigo-500 placeholder-gray-500'
                    : 'bg-slate-50 border-slate-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                }`}
              />
            </div>

            <div className="space-y-1.5 flex flex-col text-left">
              <label className="text-[10px] uppercase font-bold text-gray-400">Mô tả đặc quyền</label>
              <textarea
                rows={2}
                value={newPromoDesc}
                onChange={(e) => setNewPromoDesc(e.target.value)}
                placeholder="Viết lời mô tả ngắn cho ưu đãi này..."
                className={`w-full rounded-xl px-4 py-2.5 outline-none text-xs transition-all duration-300 border ${
                  d
                    ? 'bg-[#0d1117]/60 border-[#30363d] text-white focus:bg-[#161b22] focus:border-indigo-500 placeholder-gray-500'
                    : 'bg-slate-50 border-slate-200 focus:border-black focus:bg-white text-gray-905 placeholder-gray-400'
                }`}
              />
            </div>

            <button
              type="submit"
              className={`w-full h-12 px-6 font-sans text-xs uppercase tracking-widest font-black rounded-xl transition-all duration-300 shadow active:scale-95 cursor-pointer flex items-center justify-center gap-2 ${
                d ? 'bg-white! hover:bg-gray-100! text-black' : 'bg-black hover:bg-slate-900 text-white'
              }`}
            >
              Công định Voucher
            </button>
          </form>
        </div>

        {/* List with all created coupons (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className={`p-6 sm:p-8 rounded-3xl shadow-sm flex justify-between items-center border transition-all duration-300 ${
            d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
          }`}>
            <div className="text-left">
              <h3 className={`font-extrabold text-base uppercase tracking-wider transition-colors duration-300 ${d ? 'text-white' : 'text-gray-955'}`}>Danh sách chiến dịch hoạt động</h3>
              <p className={`text-xs md:text-[13px] font-sans mt-1.5 leading-relaxed transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-405'}`}>Tổng hợp mã đang nằm trong danh sách kiểm duyệt toàn diện.</p>
            </div>
            <span className={`text-xs font-mono font-bold px-4 py-2 rounded-full border transition-all duration-300 ${
              d ? 'bg-indigo-950/40 text-indigo-400 border-indigo-900/40' : 'bg-indigo-50 text-indigo-700 border-indigo-100'
            }`}>
              {promos.length} Chiến dịch
            </span>
          </div>

          {promos.length === 0 ? (
            <div className={`text-center py-20 rounded-[2rem] p-6 border transition-all duration-300 ${
              d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
            }`}>
              <Ticket size={40} className="text-gray-300 mx-auto mb-3" />
              <p className={`text-sm font-extrabold transition-colors duration-300 ${d ? 'text-white' : 'text-gray-808'}`}>Chưa có mã khuyến mãi nào</p>
              <p className={`text-xs transition-colors duration-300 ${d ? 'text-gray-400' : 'text-gray-400'}`}>Hãy chế tác mã đầu tiên ở bảng bên trái.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {promos.map((p) => (
                <div 
                  key={p.code} 
                  className={`p-5 rounded-3xl shadow-sm transition-all duration-300 flex flex-col justify-between h-[180px] border ${
                    d ? 'bg-[#161b22] border-[#30363d]' : 'bg-white border-gray-200'
                  } ${p.isActive ? 'hover:border-black/15' : 'opacity-60'}`}
                >
                  <div className="text-left">
                    {/* Header card info */}
                    <div className={`flex justify-between items-center border-b pb-2 mb-2.5 transition-all duration-300 ${
                      d ? 'border-[#30363d]' : 'border-gray-100'
                    }`}>
                      <code className={`px-2.5 py-1 rounded-lg font-mono font-black text-xs tracking-wider ${d ? 'bg-[#21262d] text-cyan-400' : 'bg-gray-100 text-cyan-600'}`}>
                        {p.code}
                      </code>
                      <span className={`text-xs font-mono font-extrabold transition-colors duration-300 ${d ? 'text-indigo-400' : 'text-indigo-600'}`}>
                        Giảm {p.discount * 100}%
                      </span>
                    </div>
                    <p className={`font-bold text-xs mb-1 truncate transition-colors duration-300 ${d ? 'text-gray-250' : 'text-gray-800'}`}>{p.description}</p>
                    
                    {p.minOrderVal > 0 && (
                      <p className={`text-[10px] font-mono transition-colors duration-300 ${d ? 'text-gray-400' : 'text-slate-400'}`}>
                        Đơn tối thiểu: {p.minOrderVal.toLocaleString('vi-VN')}₫
                      </p>
                    )}
                    <p className={`text-[10px] mt-1 flex items-center gap-1 transition-colors duration-300 ${d ? 'text-gray-400' : 'text-slate-400'}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
                      Đã sử dụng: <strong className={`font-mono font-black transition-colors duration-300 ${d ? 'text-gray-200' : 'text-gray-707'}`}>{p.usedCount || 0} lượt</strong>
                    </p>
                  </div>

                  {/* Bottom action bar inside card */}
                  <div className={`flex items-center justify-between pt-3 border-t text-xs transition-all duration-300 ${
                    d ? 'border-[#30363d]' : 'border-gray-50'
                  }`}>
                    <button
                      type="button"
                      onClick={() => onTogglePromoStatus(p.code)}
                      className={`font-black uppercase tracking-wider text-[10px] cursor-pointer ${
                        p.isActive ? 'text-amber-600 hover:text-amber-800' : 'text-emerald-600 hover:text-emerald-800'
                      }`}
                    >
                      {p.isActive ? 'Tạm dừng' : 'Kích hoạt'}
                    </button>
                    <button
                      type="button"
                      onClick={() => onDeletePromo(p.code)}
                      className="text-rose-500 hover:text-rose-700 font-black uppercase tracking-wider text-[10px] cursor-pointer"
                    >
                      Gỡ bỏ
                    </button>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
