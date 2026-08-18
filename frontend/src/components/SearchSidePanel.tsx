import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { Product, TabType } from '../types';
import { Search, X, History, Loader2 } from 'lucide-react';
import { getProducts, getPopularSearches, getSearchHistory } from '../services/api';
import ProductDetail from './ProductPage/ProductDetail';

interface SearchSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  products?: Product[];
  onNavigate: (tab: TabType) => void;
  onAddToCart: (product: Product, selectedColor?: string) => void;
}

export default function SearchSidePanel({ isOpen, onClose, products, onNavigate, onAddToCart }: SearchSidePanelProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [popularSearches, setPopularSearches] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const allProducts = products || [];

  // Load popular searches and search history from backend when panel is opened
  useEffect(() => {
    if (!isOpen) return;

    const loadData = async () => {
      try {
        const [popRes, histRes] = await Promise.all([
          getPopularSearches(),
          getSearchHistory()
        ]);
        if (popRes.success) setPopularSearches(popRes.popular);
        if (histRes.success) setSearchHistory(histRes.history);
      } catch (err) {
        console.error("Lỗi tải lịch sử/phổ biến từ backend:", err);
      }
    };

    loadData();
  }, [isOpen]);

  // Effect to query backend for search results with 300ms debounce
  useEffect(() => {
    if (!isOpen) return;
    if (searchQuery.trim() === '') {
      setSearchResults([]);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const res = await getProducts(searchQuery);
        if (res.success) {
          setSearchResults(res.products);
          
          // Tự động tải lại lịch sử tìm kiếm từ backend để phản ánh từ khóa vừa tìm
          const histRes = await getSearchHistory();
          if (histRes.success) {
            setSearchHistory(histRes.history);
          }
        }
      } catch (err) {
        console.error("Lỗi tìm kiếm từ backend:", err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchQuery, isOpen]);

  const filteredProducts = searchResults;

  const handleOpenDetail = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleCloseDetail = () => {
    setSelectedProduct(null);
  };

  return (
    <>
      {/* ProductDetail modal — portal to document.body for full-screen overlay */}
      {createPortal(
        <AnimatePresence>
          {selectedProduct && (
            <ProductDetail
              product={selectedProduct}
              onClose={handleCloseDetail}
              onAddToCart={(product, selectedColor) => {
                onAddToCart(product, selectedColor);
              }}
              onNavigate={onNavigate}
              isLoggedIn={!!localStorage.getItem('techvie_token')}
            />
          )}
        </AnimatePresence>,
        document.body
      )}

      <AnimatePresence>
        {isOpen && (
          <>
            {/* Glass Overlay, clicking closes search */}
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/30 backdrop-blur-[12px] z-[60]"
            />

            {/* 70% Width Slide-out Panel from the left as described in Viet mockup */}
            <motion.aside 
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 220 }}
              className="fixed top-0 left-0 bottom-0 z-[70] w-[85vw] md:w-[70vw] bg-linear-to-bl from-white to-slate-200 backdrop-blur-[90px] saturate-[200%] border-r border-white/20 flex flex-col shadow-[0_0_100px_rgba(0,0,0,0.15)] overflow-hidden"
            >
              {/* Header */}
              <div className="p-8 md:px-14 md:py-10 flex justify-between items-center border-b border-black/15">
                <h2 className="text-4xl md:text-5xl font-sans tracking-tighter text-gray-950 font-black uppercase">
                  Tìm kiếm
                </h2>
                <button 
                  onClick={onClose}
                  className="w-12 h-12 rounded-full flex items-center justify-center hover:bg-black/5 transition-all border border-black/10 group cursor-pointer"
                >
                  <X size={20} className="group-hover:rotate-90 transition-transform" />
                </button>
              </div>

              {/* Content area */}
              <div className="flex-grow overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-8 md:px-14 pb-20 pt-8 space-y-12">
                {/* Search Box */}
                <div className="relative group/search">
                  <input 
                    type="text" 
                    autoFocus
                    placeholder="" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-transparent border-b-2 border-black/10 focus:border-black outline-none font-sans text-lg md:text-2xl lg:text-3xl py-4 pb-2 pr-12 tracking-tight transition-colors relative z-10"
                  />
                  
                  {/* Sliding Matrix Ticker Placeholder */}
                  {searchQuery === '' && (
                    <div className="absolute inset-x-0 bottom-0 top-0 pr-12 flex items-center pointer-events-none overflow-hidden select-none z-0">
                      <div className="animate-marquee whitespace-nowrap flex gap-16 text-black/15 font-sans text-lg md:text-2xl lg:text-3xl tracking-tight uppercase font-extrabold">
                        <span>• ỐP LƯNG CUSTOM ĐỘC BẢN • GIÁ ĐỠ LAPTOP CÔNG THÁI HỌC • CÁP SẠC NHANH TỰ NGẮT • ĐÈN LED DECOR RGB • TÚI CHỐNG SỐC AESTHETIC • COMBO SETUP BỨT PHÁ •</span>
                        <span> ỐP LƯNG CUSTOM ĐỘC BẢN • GIÁ ĐỠ LAPTOP CÔNG THÁI HỌC • CÁP SẠC NHANH TỰ NGẮT • ĐÈN LED DECOR RGB • TÚI CHỐNG SỐC AESTHETIC • COMBO SETUP BỨT PHÁ </span>
                      </div>
                    </div>
                  )}
                  
                  {isLoading ? (
                    <Loader2 size={24} className="absolute right-2 top-5 text-black/40 animate-spin z-20" />
                  ) : (
                    <Search size={24} className="absolute right-2 top-5 text-black/20 pointer-events-none z-20" />
                  )}
                </div>

                {/* Suggestions panels shown when search is empty */}
                {searchQuery.trim() === '' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                    <section>
                      <h3 className="text-[16px] uppercase font-bold tracking-[0.2em] text-black/40 mb-4 border-b border-black/5 pb-2">
                        Tìm kiếm phổ biến
                      </h3>
                      <ul className="space-y-3">
                        {popularSearches.map((p, idx) => (
                          <li key={idx}>
                            <button 
                              onClick={() => setSearchQuery(p)}
                              className="font-sans text-sm text-black/60 hover:text-black transition-colors block text-left hover:font-bold font-medium cursor-pointer"
                            >
                              {p}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <section>
                      <h3 className="text-[16px] uppercase font-bold tracking-[0.2em] text-black/40 mb-4 border-b border-black/5 pb-2">
                        Lịch sử tìm kiếm
                      </h3>
                      <ul className="space-y-3">
                        {searchHistory.map((h, idx) => (
                          <li key={idx}>
                            <button 
                              onClick={() => setSearchQuery(h)}
                              className="font-sans text-sm text-black/60 hover:text-black flex items-center gap-2 hover:font-bold font-medium cursor-pointer"
                            >
                              <History size={16} />
                              {h}
                            </button>
                          </li>
                        ))}
                      </ul>
                    </section>
                  </div>
                ) : (
                  /* Search Results display */
                  <section>
                    <h3 className="text-[16px] uppercase font-bold tracking-[0.2em] text-black/40 mb-6 border-b border-black/5 pb-2">
                      Kết quả tìm thấy ({filteredProducts.length})
                    </h3>

                    {filteredProducts.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {filteredProducts.map((p) => (
                          <div 
                            key={p.id}
                            onClick={() => handleOpenDetail(p)}
                            className="bg-white/40 border border-black/5 hover:border-black/20 p-5 rounded-2xl flex gap-4 transition-all hover:bg-white cursor-pointer group"
                          >
                            <img 
                              src={p.image} 
                              alt={p.name} 
                              referrerPolicy="no-referrer"
                              className="w-16 h-16 object-contain mix-blend-multiply shrink-0 group-hover:scale-105 transition-transform"
                            />
                            <div className="flex-grow min-w-0">
                              <h4 className="font-semibold text-sm text-gray-900 truncate group-hover:underline underline-offset-2">{p.name}</h4>
                              <p className="text-xs text-gray-500 font-sans truncate">{p.description}</p>
                              <div className="flex justify-between items-center mt-2">
                                <span className="font-bold text-xs">{p.price.toLocaleString('vi-VN')}₫</span>
                                <button 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onAddToCart(p);
                                    onClose();
                                  }}
                                  className="text-[10px] uppercase font-black text-indigo-600 hover:text-indigo-800 cursor-pointer"
                                >
                                  Đặt mua
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-10">
                        <p className="text-sm text-gray-500">Không tìm thấy thiết bị nào khớp với từ khoá.</p>
                        <button 
                          onClick={() => {
                            setSearchQuery('');
                            onNavigate('products');
                            onClose();
                          }}
                          className="text-xs text-indigo-650 hover:underline font-bold uppercase tracking-wider mt-2"
                        >
                          Khám phá tất cả sản phẩm
                        </button>
                      </div>
                    )}
                  </section>
                )}

                {/* Recommended hardware item shortcut blocks */}
                <section className="pt-6 border-t border-black/5">
                  <h3 className="text-[16px] uppercase font-bold tracking-[0.2em] text-black/40 mb-6">
                    Gợi ý thêm sản phẩm
                  </h3>

                  <div className="grid grid-cols-3 gap-4">
                    {allProducts.slice(0, 3).map((p) => (
                      <div 
                        key={p.id}
                        onClick={() => handleOpenDetail(p)}
                        className="cursor-pointer group bg-white/20 hover:bg-white p-4 rounded-2xl border border-black/5 hover:border-black/15 transition-all flex flex-col items-center text-center"
                      >
                        <div className="w-12 h-12 flex items-center justify-center mb-2">
                          <img 
                            src={p.image} 
                            alt={p.name} 
                            referrerPolicy="no-referrer"
                            className="max-h-full object-contain mix-blend-multiply group-hover:scale-105 transition-transform"
                          />
                        </div>
                        <h4 className="font-semibold text-[11px] text-gray-900 truncate w-full">{p.name}</h4>
                      </div>
                    ))}
                  </div>
                </section>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
