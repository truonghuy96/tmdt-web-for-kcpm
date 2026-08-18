import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem, TabType } from '../types';
import { X, ShoppingBag, Plus, Minus, Trash2, ArrowRight, Check } from 'lucide-react';
import { localLogger } from '../utils/localLogger';

interface CartSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  cart: CartItem[];
  onQuantityChange: (productId: string, delta: number, selectedColor?: string) => void;
  onRemoveItem: (productId: string, selectedColor?: string) => void;
  onClearCart: () => void;
  onNavigate: (tab: TabType) => void;
  onUpdateItemColor?: (productId: string, oldColor?: string, newColor?: string) => void;
}

export default function CartSidePanel({
  isOpen,
  onClose,
  cart,
  onQuantityChange,
  onRemoveItem,
  onClearCart,
  onNavigate,
  onUpdateItemColor
}: CartSidePanelProps) {
  const [checkoutStep, setCheckoutStep] = useState<'idle' | 'shipping' | 'success'>('idle');
  const [shippingName, setShippingName] = useState('');
  const [shippingPhone, setShippingPhone] = useState('');
  const [shippingAddress, setShippingAddress] = useState('');
  const [editingColorKey, setEditingColorKey] = useState<string | null>(null);

  const totalPrice = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutStep('success');
    setTimeout(() => {
      onClearCart();
      setCheckoutStep('idle');
      onClose();
    }, 4000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-[6px] z-[80]"
          />

          {/* Cart sliding aside panel */}
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 220 }}
            className="fixed top-0 right-0 bottom-0 z-[90] w-full max-w-[92vw] sm:w-[420px] md:w-[450px] bg-white border-l border-gray-250 flex flex-col shadow-2xl overflow-hidden"
          >
            {/* Header */}
            <div className="p-5 sm:p-6 md:p-8 flex justify-between items-center border-b border-gray-150 relative">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 shrink-0">
                  <ShoppingBag size={18} />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl font-bold text-gray-950 tracking-tight">Giỏ hàng</h2>
                  <span className="text-xs sm:text-sm text-gray-500 font-sans">
                    ({cart.reduce((sum, item) => sum + item.quantity, 0)} sản phẩm đã được chọn)
                  </span>
                </div>
              </div>

              <button
                onClick={onClose}
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-gray-200 hover:border-black flex items-center justify-center text-gray-400 hover:text-black transition-colors cursor-pointer active:scale-95"
              >
                <X size={15} />
              </button>
            </div>

            {/* Content Switcher */}
            <div className="flex-grow overflow-y-auto p-5 sm:p-6 md:p-8">
              {checkoutStep === 'idle' && (
                <>
                  {cart.length > 0 ? (
                    <div className="space-y-4">
                      {cart.map((item, idx) => (
                        <motion.div
                          key={`${item.product.id}::${item.selectedColor ?? ''}`}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.06, duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                          className="p-3 sm:p-4 rounded-2xl border border-gray-200 hover:border-black/30 transition-colors flex flex-col gap-3"
                        >
                          <div className="flex gap-3 sm:gap-4 items-start justify-between">
                            {/* Clickable Area to view product details */}
                            <div 
                              onClick={() => {
                                localLogger.info("CartSidePanel", `Điều hướng tới trang chi tiết sản phẩm: ${item.product.name}`, { id: item.product.id });
                                onClose();
                                const searchParams = new URLSearchParams(window.location.search);
                                searchParams.set('productId', item.product.id);
                                const currentPath = window.location.pathname.replace(/^\//, '');
                                onNavigate(`${currentPath}?${searchParams.toString()}` as any);
                              }}
                              className="flex gap-3 sm:gap-4 flex-grow min-w-0 cursor-pointer group"
                            >
                              <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gray-50 border border-gray-100 rounded-lg flex items-center justify-center p-1.5 shrink-0 group-hover:bg-gray-100 transition-colors">
                                <img
                                  src={item.product.image}
                                  alt={item.product.name}
                                  referrerPolicy="no-referrer"
                                  className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform duration-300"
                                />
                              </div>

                              <div className="flex-grow min-w-0">
                                <h4 className="font-bold text-xs sm:text-sm text-gray-950 truncate group-hover:text-indigo-600 transition-colors">{item.product.name}</h4>
                                <p className="text-xs text-gray-500 font-mono mt-0.5">
                                  {item.product.price.toLocaleString('vi-VN')}₫
                                </p>
                                {/* Hiển thị màu đã chọn / Cho phép chỉnh sửa */}
                                {item.product.colors && item.product.colors.length > 0 && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const itemKey = `${item.product.id}::${item.selectedColor ?? ''}`;
                                      setEditingColorKey(editingColorKey === itemKey ? null : itemKey);
                                    }}
                                    className="inline-flex items-center gap-1 mt-1.5 px-2.5 py-1 rounded-full bg-gray-50 border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 text-[10px] font-bold text-gray-600 uppercase tracking-wide transition-all cursor-pointer"
                                  >
                                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                                    {item.selectedColor || 'Chọn màu'}
                                    <span className="text-[8px] text-gray-400 font-normal">▼</span>
                                  </button>
                                )}
                              </div>
                            </div>

                            <button
                              onClick={() => onRemoveItem(item.product.id, item.selectedColor)}
                              className="text-gray-400 hover:text-red-500 transition-colors shrink-0 cursor-pointer active:scale-90 mt-1"
                              title="Xoà khỏi giỏ"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>

                          {/* Inline color editor choices */}
                          {(() => {
                            const itemKey = `${item.product.id}::${item.selectedColor ?? ''}`;
                            const isEditing = editingColorKey === itemKey;
                            if (!isEditing || !item.product.colors || item.product.colors.length <= 1) return null;

                            return (
                              <div className="p-2.5 bg-gray-50 rounded-xl border border-gray-200 flex flex-wrap gap-1.5 items-center">
                                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mr-1">Màu:</span>
                                {item.product.colors.map((color) => {
                                  const isSelected = item.selectedColor === color;
                                  return (
                                    <button
                                      key={color}
                                      onClick={() => {
                                        if (onUpdateItemColor) {
                                          onUpdateItemColor(item.product.id, item.selectedColor, color);
                                        }
                                        setEditingColorKey(null);
                                      }}
                                      className={`px-2.5 py-1 rounded-lg text-[10px] font-extrabold uppercase tracking-wide border transition-all cursor-pointer ${
                                        isSelected
                                          ? 'bg-black text-white border-black scale-102 shadow-sm'
                                          : 'bg-white text-gray-600 border-gray-200 hover:border-black'
                                      }`}
                                    >
                                      {color}
                                    </button>
                                  );
                                })}
                                <button
                                  onClick={() => setEditingColorKey(null)}
                                  className="ml-auto px-2 py-1 rounded-lg text-[10px] font-bold text-gray-400 hover:text-black cursor-pointer"
                                >
                                  Hủy
                                </button>
                              </div>
                            );
                          })()}

                          <div className="flex justify-between items-center pt-2.5 border-t border-gray-50">
                            <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                              <button
                                onClick={() => onQuantityChange(item.product.id, -1, item.selectedColor)}
                                className="p-1 px-2 sm:px-2.5 hover:bg-gray-100 text-gray-500 cursor-pointer active:scale-90 transition-transform"
                              >
                                <Minus size={10} />
                              </button>
                              <span className="px-2.5 sm:px-3 text-xs font-bold font-mono text-gray-800 bg-gray-50">{item.quantity}</span>
                              <button
                                onClick={() => onQuantityChange(item.product.id, 1, item.selectedColor)}
                                className="p-1 px-2 sm:px-2.5 hover:bg-gray-100 text-gray-500 cursor-pointer active:scale-90 transition-transform"
                              >
                                <Plus size={10} />
                              </button>
                            </div>
                            <span className="font-black text-xs text-gray-900 font-mono">
                              {(item.product.price * item.quantity).toLocaleString('vi-VN')}₫
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="text-center py-16"
                    >
                      <motion.div
                        animate={{ y: [0, -6, 0] }}
                        transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                        className="w-16 h-16 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center mx-auto mb-4"
                      >
                        <ShoppingBag size={28} />
                      </motion.div>
                      <h3 className="text-xl sm:text-2xl font-bold text-gray-900">Giỏ hàng rỗng</h3>
                      <p className="text-xs sm:text-sm text-gray-500 mt-2 max-w-[240px] mx-auto leading-relaxed">
                        Hãy lấp đầy giỏ hàng bằng những món đồ setup đậm chất riêng để khơi nguồn cảm hứng mỗi ngày.
                      </p>
                      <button
                        onClick={() => { onClose(); onNavigate("products"); }}
                        className="text-sm text-indigo-600 font-bold uppercase tracking-widest mt-4 hover:underline cursor-pointer"
                      >
                        Bắt đầu mua sắm
                      </button>
                    </motion.div>
                  )}
                </>
              )}

              {checkoutStep === 'shipping' && (
                <form id="checkout-form" onSubmit={handleCheckoutSubmit} className="space-y-5">
                  <h3 className="text-xs uppercase font-bold tracking-widest text-gray-400 border-b border-gray-100 pb-2 mb-4">
                    Thông tin giao hàng
                  </h3>

                  {[
                    { label: 'Họ và Tên Người Nhận', type: 'text', placeholder: 'Nguyễn Văn A', value: shippingName, onChange: setShippingName },
                    { label: 'Số Điện Thoại', type: 'tel', placeholder: '0912345678', value: shippingPhone, onChange: setShippingPhone },
                  ].map(({ label, type, placeholder, value, onChange }) => (
                    <div key={label}>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 font-sans">
                        {label} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type={type}
                        required
                        placeholder={placeholder}
                        value={value}
                        onChange={(e) => onChange(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-sans transition-colors"
                      />
                    </div>
                  ))}

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-2 font-sans">
                      Địa Chỉ Nhận Thiết Bị <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      required
                      rows={3}
                      placeholder="Số nhà, Tên đường, Quận/Huyện, Tỉnh/Thành phố..."
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      className="w-full bg-gray-50 border border-gray-250 rounded-xl px-4 py-3 text-xs focus:border-black outline-none font-sans transition-colors"
                    />
                  </div>

                  <div className="bg-gray-50 border border-gray-200 rounded-2xl p-4 text-[11px] text-gray-500 font-sans">
                    * Đơn hàng thiết bị sẽ được TechVie đóng gói chống sốc an toàn nghiêm ngặt và bàn giao nguyên seal bưu tá.
                  </div>
                </form>
              )}

              {checkoutStep === 'success' && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-10"
                >
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 18, delay: 0.1 }}
                    className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4"
                  >
                    <Check size={32} />
                  </motion.div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900">Đặt hàng thành công!</h3>
                  <p className="text-xs text-gray-600 font-sans mt-3 leading-relaxed max-w-[280px] mx-auto">
                    Kính chúc mừng! Đơn đặt mua thiết bị điện tử cao cấp của bạn đã được ghi nhận trên hệ thống TechVie. Đội ngũ CSKH sẽ sớm gọi điện liên hệ xác nhận đơn giao hàng.
                  </p>
                </motion.div>
              )}
            </div>

            {/* Footer Summary & checkout trigger */}
            {cart.length > 0 && (
              <div className="p-5 sm:p-6 md:p-8 bg-gray-50 border-t border-gray-200 space-y-4">
                <div className="flex justify-between items-baseline">
                  <span className="text-sm font-bold text-gray-800">Tổng cộng</span>
                  <span className="text-xl sm:text-2xl font-black text-black font-mono">
                    {totalPrice.toLocaleString('vi-VN')}₫
                  </span>
                </div>

                <button
                  onClick={() => { onNavigate('checkout'); onClose(); }}
                  className="w-full bg-black text-white hover:bg-gray-900 py-3.5 sm:py-4 rounded-xl font-sans text-xs uppercase tracking-widest font-black transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.98] hover:shadow-lg hover:shadow-black/10"
                >
                  Tiến hành kết nối đặt hàng
                  <ArrowRight size={14} />
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
