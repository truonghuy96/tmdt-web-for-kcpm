import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Plus, Check, Star } from 'lucide-react';
import { Product } from '../../types';

interface ProductCardProps {
  product: Product;
  onSelect: (product: Product) => void;
  onAddToCart: (product: Product, selectedColor: string | undefined, e: React.MouseEvent<HTMLButtonElement>) => void;
  isJustAdded: boolean;
  isMagnetized: boolean;
}

export default function ProductCard({
  product,
  onSelect,
  onAddToCart,
  isJustAdded,
  isMagnetized,
}: ProductCardProps) {
  const [ripples, setRipples] = useState<{ id: number; x: number; y: number }[]>([]);

  // Calculate dynamic tag badges based on category or price
  const getBadgeText = () => {
    return product.badge || 'NORMAL';
  };

  const getBadgeStyle = () => {
    const text = getBadgeText();
    switch (text) {
      case 'PREMIUM': return 'bg-indigo-50 border-indigo-200 text-indigo-700';
      case 'TRENDY': return 'bg-emerald-50 border-emerald-200 text-emerald-700';
      case 'FLAGSHIP': return 'bg-rose-50 border-rose-200 text-rose-700';
      default: return 'bg-amber-50 border-amber-200 text-amber-700';
    }
  };

  const handleAddToCartLocal = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    const hasColors = Array.isArray(product.colors) && product.colors.length > 0;

    // Hướng 1: Nếu sản phẩm có màu → mở modal để chọn màu trước
    if (hasColors) {
      // Hướng 2: Nếu chỉ có đúng 1 màu → thêm thẳng với màu đó (không cần mở modal)
      if (product.colors!.length === 1) {
        const buttonRect = e.currentTarget.getBoundingClientRect();
        const rippleX = e.clientX - buttonRect.left;
        const rippleY = e.clientY - buttonRect.top;
        const rippleId = Date.now() + Math.random();
        setRipples(prev => [...prev, { id: rippleId, x: rippleX, y: rippleY }]);
        setTimeout(() => { setRipples(prev => prev.filter(r => r.id !== rippleId)); }, 800);
        onAddToCart(product, product.colors![0], e);
      } else {
        // Nhiều màu → buộc mở modal để chọn
        onSelect(product);
      }
      return;
    }

    // Không có màu → thêm thẳng bình thường
    const buttonRect = e.currentTarget.getBoundingClientRect();
    const rippleX = e.clientX - buttonRect.left;
    const rippleY = e.clientY - buttonRect.top;
    const rippleId = Date.now() + Math.random();
    setRipples(prev => [...prev, { id: rippleId, x: rippleX, y: rippleY }]);
    setTimeout(() => { setRipples(prev => prev.filter(r => r.id !== rippleId)); }, 800);
    onAddToCart(product, undefined, e);
  };

  return (
    <motion.div 
      whileHover={{ y: -6, scale: 1.01 }}
      animate={{ 
        scale: isMagnetized ? 0.96 : 1,
        y: isMagnetized ? -4 : 0
      }}
      transition={{ type: 'spring', damping: 20, stiffness: 300 }}
      onClick={() => onSelect(product)}
      className="group bg-white border border-gray-200 rounded-[2rem] p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-[0_20px_50px_rgba(0,0,0,0.06)] hover:border-gray-300 h-full relative overflow-hidden text-left cursor-pointer"
    >
      <div>
        {/* Header section with category badge and premium tag */}
        <div className="flex justify-between items-start mb-4 select-none">
          <div className="flex flex-wrap gap-1.5">
            <span className="text-[9px] uppercase font-mono font-black tracking-wider bg-gray-50 border border-gray-150 text-gray-500 px-3 py-1 rounded-full">
              {product.category}
            </span>
            {getBadgeText() !== 'NORMAL' && (
              <span className={`text-[9px] uppercase font-mono font-black tracking-wider border px-3 py-1 rounded-full ${getBadgeStyle()}`}>
                {getBadgeText()}
              </span>
            )}
          </div>
        </div>

        {/* Product image container with smooth scale */}
        <div 
          className="w-full aspect-[4/5] flex items-center justify-center relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-50/50 to-gray-100/30 group-hover:from-gray-100/40 group-hover:to-gray-200/20 transition-all duration-300 border border-transparent group-hover:border-gray-100 select-none" 
        >
          <div className="absolute inset-0 bg-gradient-to-tr from-white/0 via-white/5 to-white/20 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
          
          <img 
            src={product.image} 
            alt={product.name}
            referrerPolicy="no-referrer"
            className="w-full h-full object-contain mix-blend-multiply transition-all duration-750 ease-out transform group-hover:scale-108 drop-shadow-sm group-hover:drop-shadow-lg"
          />
        </div>

        {/* Text details */}
        <h3 className="text-xl font-bold text-gray-900 tracking-tight mt-6 truncate group-hover:text-black transition-colors">
          {product.name}
        </h3>
        {product.averageRating !== undefined && product.averageRating > 0 ? (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-amber-500 font-bold select-none">
            <div className="flex gap-0.5">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={11} 
                  className={star <= Math.round(product.averageRating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"} 
                />
              ))}
            </div>
            <span className="text-gray-800 text-[11px] font-mono ml-1">{product.averageRating.toFixed(1)}</span>
            <span className="text-gray-400 font-normal">({product.reviewCount})</span>
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1.5 text-xs text-gray-400 select-none">
            <span className="text-[10px]">Chưa có đánh giá</span>
          </div>
        )}
        <p className="text-gray-550 font-sans text-xs leading-relaxed mt-2 line-clamp-2 h-8">
          {product.description}
        </p>

        {/* Colors display */}
        {Array.isArray(product.colors) && product.colors.length > 0 && (
          <div className="mt-3.5 flex items-center gap-1.5 flex-wrap">
            <span className="text-[9px] uppercase font-mono tracking-wider text-gray-400 font-extrabold mr-0.5">
              Màu:
            </span>
            {product.colors.map((color, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full border border-gray-150 text-[9px] font-bold text-gray-600 bg-gray-50/50"
              >
                {color}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Basic specs indicator */}
      {product.specs && product.specs.length >= 2 && (
        <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between text-[10px] font-mono text-gray-500">
          <span>{product.specs[0].label}: <strong className="text-gray-800">{product.specs[0].value}</strong></span>
          <span>{product.specs[1].label}: <strong className="text-gray-800">{product.specs[1].value}</strong></span>
        </div>
      )}

      {/* Pricing & Add to Cart button */}
      <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between relative min-h-[48px]">
        <div className="pr-12 truncate">
          <span className="text-[9px] text-gray-400 uppercase font-black tracking-widest block font-sans">GIÁ NIÊM YẾT</span>
          <span className="text-lg sm:text-xl font-black text-gray-900 block truncate">
            {product.price.toLocaleString('vi-VN')}₫
          </span>
        </div>

        <button 
          onClick={handleAddToCartLocal}
          className={`group/btn h-10 w-10 sm:h-12 sm:w-12 rounded-full font-sans text-xs uppercase tracking-widest font-black transition-all duration-300 flex items-center justify-center overflow-hidden cursor-pointer absolute right-0 shrink-0 hover:scale-105 active:scale-95 z-10 ${
            isJustAdded
              ? 'lg:w-full bg-emerald-600 text-white w-full -translate-x-1.5'
              : 'bg-black text-white hover:bg-gray-800 xl:hover:w-full px-0 hover:px-3 sm:hover:px-4 shadow-md shadow-black/5 hover:shadow-lg hover:shadow-black/10'
          }`}
        >
          {ripples.map((ripple) => (
            <motion.span
              key={ripple.id}
              initial={{ scale: 0, opacity: 0.6 }}
              animate={{ scale: 4.5, opacity: 0 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="absolute bg-white/40 rounded-full pointer-events-none"
              style={{
                left: ripple.x,
                top: ripple.y,
                width: '24px',
                height: '24px',
                marginLeft: '-12px',
                marginTop: '-12px',
              }}
            />
          ))}
          {isJustAdded ? (
            <>
              <Check size={14} className="shrink-0 transition-transform duration-300 group-hover/btn:scale-120" />
              <span className="inline-block ml-1.5 whitespace-nowrap text-[10px] font-black tracking-wider transition-all duration-350">
                ĐÃ THÊM
              </span>
            </>
          ) : (
            <>
              <Plus size={14} className="shrink-0 transition-transform duration-500 group-hover/btn:rotate-90" />
              <span className="hidden xl:inline-block w-0 opacity-0 xl:group-hover/btn:w-24 xl:group-hover/btn:opacity-100 xl:group-hover/btn:ml-2 whitespace-nowrap overflow-hidden transition-all duration-300 ease-out text-center text-[10px] tracking-wider font-extrabold">
                THÊM VÀO GIỎ
              </span>
            </>
          )}
        </button>
      </div>
    </motion.div>
  );
}
