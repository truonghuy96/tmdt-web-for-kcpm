import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { 
  BarChart3, 
  Package, 
  ShoppingBag, 
  MessageSquare, 
  Ticket, 
  Users, 
  ArrowLeft, 
  Sun, 
  Moon,
  FolderTree,
  Search,
  Star,
  Boxes,
  CreditCard,
} from 'lucide-react';

// @ts-ignore
import localLightBg from '../../assets/images/admin-sidebar/aleksandra-dementeva-aWBPQHfPwVM-unsplash.jpg';
// @ts-ignore
import localDarkBg from '../../assets/images/admin-sidebar/long-chung-uaVvEOCrq8s-unsplash.jpg';

interface AdminSidebarProps {
  activeSubTab: 'overview' | 'categories' | 'products' | 'stock' | 'orders' | 'payments' | 'messages' | 'promos' | 'users' | 'reviews';
  setActiveSubTab: (tab: 'overview' | 'categories' | 'products' | 'stock' | 'orders' | 'payments' | 'messages' | 'promos' | 'users' | 'reviews') => void;
  isDarkMode: boolean;
  setIsDarkMode: (val: boolean) => void;
  categoriesCount: number;
  productsCount: number;
  ordersCount: number;
  messagesCount: number;
  promosCount: number;
  usersCount: number;
  reviewsCount: number;
  onNavigate: (tab: any) => void;
  onSearch?: (query: string) => void;
}

export default function AdminSidebar({
  activeSubTab,
  setActiveSubTab,
  isDarkMode,
  setIsDarkMode,
  categoriesCount,
  productsCount,
  ordersCount,
  messagesCount,
  promosCount,
  usersCount,
  reviewsCount,
  onNavigate,
  onSearch
}: AdminSidebarProps) {
  const [lightBgUrl, setLightBgUrl] = useState<string>(localLightBg);
  const [darkBgUrl, setDarkBgUrl] = useState<string>(localDarkBg);
  const [localSearch, setLocalSearch] = useState('');

  useEffect(() => {
    const imgLight = new Image();
    imgLight.src = localLightBg;
    imgLight.onerror = () => {
      console.warn("Local light background image failed to load, falling back to online Unsplash URL.");
      setLightBgUrl("https://images.unsplash.com/photo-1758974643303-df01b895e6a7?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
    };

    const imgDark = new Image();
    imgDark.src = localDarkBg;
    imgDark.onerror = () => {
      console.warn("Local dark background image failed to load, falling back to online Unsplash URL.");
      setDarkBgUrl("https://images.unsplash.com/photo-1781413013976-e29dfd794b36?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D");
    };
  }, []);

  return (
    <aside className="relative w-full h-full bg-transparent border-r border-gray-250/20 flex flex-col justify-between p-4 md:p-6 xl:p-8 shrink-0 z-40 overflow-hidden">
      {/* Liquid Glass Background Image Layer */}
      <div 
        className="absolute inset-0 -z-10 transition-all duration-500 scale-100"
        style={{ 
          backgroundImage: `url(${isDarkMode ? darkBgUrl : lightBgUrl})`, 
          backgroundSize: 'cover', 
          backgroundPosition: 'center',
        }}
      />
      {/* Glassmorphic Tint Mask Overlay */}
      <div className={`absolute inset-0 -z-10 backdrop-blur-[8px] -webkit-backdrop-blur-[8px] transition-all duration-500 ${
        isDarkMode 
          ? 'bg-black/45 border-r border-white/10' 
          : 'bg-white/50 border-r border-black/5'
      }`} />

      {/* Content Wrapper */}
      <div className="space-y-8 relative z-10">
        {/* Brand/TechVie admin identity */}
        <div>
          {/* <span className="text-[10px] uppercase tracking-[0.3em]  font-extrabold mb-1.5 block">
            SYSTEM CONSOLE
          </span> */}
          <div className="flex items-center gap-2">
            <BarChart3 className={isDarkMode ? "text-white shrink-0" : "text-black shrink-0"} size={24} />
            <h1 className={`text-xl font-black uppercase tracking-tighter ${isDarkMode ? 'text-white' : 'text-gray-950'}`}>
              TECHVIE ADMIN
            </h1>
          </div>
          <div className="mt-3 flex justify-around">
            <div className={`flex items-center gap-1.5 border rounded-full px-3 py-1 w-fit ${
              isDarkMode 
                ? 'bg-indigo-950/40 border-indigo-900/55 text-zinc-50' 
                : 'bg-indigo-50 border-indigo-100 text-gray-550'
            }`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-extrabold uppercase tracking-wider font-mono">
                Quản trị viên
              </span>
            </div>
            {/* Premium Theme Switcher Button */}
            <button 
              type="button"
              onClick={() => setIsDarkMode(!isDarkMode)}
              className={`p-1.5 rounded-full transition-all cursor-pointer flex items-center justify-center border ${
                isDarkMode 
                  ? 'bg-indigo-950/40 border-indigo-900/55 hover:bg-white/10 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 border-gray-200 text-gray-700'
              }`}
              title={isDarkMode ? "Chuyển sang chế độ sáng" : "Chuyển sang chế độ tối"}
            >
              <motion.span
                key={isDarkMode ? 'sun' : 'moon'}
                initial={{ rotate: -90, opacity: 0, scale: 0.7 }}
                animate={{ rotate: 0, opacity: 1, scale: 1 }}
                transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                className="flex items-center justify-center"
              >
                {isDarkMode ? <Sun size={18} className="text-white" /> : <Moon size={18} className="text-black" />}
              </motion.span>
            </button>
          </div>
        </div>

        {/* Global Admin Search Bar */}
        <form 
          onSubmit={(e) => {
            e.preventDefault();
            console.log('Sidebar Search query submitted:', localSearch);
            onSearch?.(localSearch);
          }}
          className="relative"
        >
          <input
            type="text"
            value={localSearch}
            onChange={(e) => {
              setLocalSearch(e.target.value);
              onSearch?.(e.target.value); // Tìm kiếm real-time khi gõ
            }}
            placeholder="Tìm kiếm nhanh..."
            className={`w-full rounded-xl pl-9 pr-3 py-2 outline-none text-xs font-semibold transition-all duration-300 border ${
              isDarkMode
                ? 'bg-black/20 border-white/10 text-white focus:bg-black/35 focus:border-indigo-500 placeholder-gray-500'
                : 'bg-white/40 border-black/10 text-gray-900 focus:bg-white/80 focus:border-black placeholder-gray-400'
            }`}
          />
          <Search 
            size={14} 
            className={`absolute left-3 top-1/2 -translate-y-1/2 cursor-pointer ${
              isDarkMode ? 'text-gray-500 hover:text-white' : 'text-gray-400 hover:text-black'
            }`}
            onClick={() => onSearch?.(localSearch)}
          />
        </form>

        <div className="space-y-4">
          {/* Nhóm 1: BÁO CÁO & THỐNG KÊ */}
          <div>
            <span className={`block text-[10px] uppercase font-black tracking-[0.2em] mb-2 font-mono ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Báo cáo & Thống kê
            </span>
            <div className="space-y-1">
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.02, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setActiveSubTab('overview')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative overflow-hidden ${
                  activeSubTab === 'overview' 
                    ? (isDarkMode ? 'bg-white text-black shadow-md shadow-white/5' : 'bg-black text-white shadow-md shadow-black/10') 
                    : (isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-black')
                }`}
              >
                {activeSubTab === 'overview' && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full ${isDarkMode ? 'bg-indigo-400' : 'bg-white'}`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <BarChart3 size={14} />
                  <span>Tổng quan</span>
                </div>
              </motion.button>
            </div>
          </div>

          {/* Nhóm 2: CỬA HÀNG & KHO HÀNG */}
          <div>
            <span className={`block text-[10px] uppercase font-black tracking-[0.2em] mb-2 font-mono ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Cửa hàng & Kho hàng
            </span>
            <div className="space-y-1">
              {[
                { tab: 'categories' as const, Icon: FolderTree, label: 'Danh mục SP', count: categoriesCount },
                { tab: 'products' as const, Icon: Package, label: 'Sản phẩm', count: productsCount },
                { tab: 'stock' as const, Icon: Boxes, label: 'Kho hàng / Tồn', count: null },
                { tab: 'orders' as const, Icon: ShoppingBag, label: 'Đơn hàng', count: ordersCount },
                { tab: 'payments' as const, Icon: CreditCard, label: 'Thanh toán', count: null },
              ].map(({ tab, Icon, label, count }, i) => (
                <motion.button
                  key={tab}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.04 + i * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveSubTab(tab)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative overflow-hidden ${
                    activeSubTab === tab 
                      ? (isDarkMode ? 'bg-white text-black shadow-md shadow-white/5' : 'bg-black text-white shadow-md shadow-black/10') 
                      : (isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-black')
                  }`}
                >
                  {activeSubTab === tab && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full ${isDarkMode ? 'bg-indigo-400' : 'bg-white'}`}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Icon size={14} />
                    <span>{label}</span>
                  </div>
                  {count !== null && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                      activeSubTab === tab 
                        ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white/20 text-white') 
                        : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200/50 text-gray-600')
                    }`}>
                      {count}
                    </span>
                  )}
                </motion.button>
              ))}
            </div>
          </div>

          {/* Nhóm 3: CHĂM SÓC & CHIẾN DỊCH */}
          <div>
            <span className={`block text-[10px] uppercase font-black tracking-[0.2em] mb-2 font-mono ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Chăm sóc & Chiến dịch
            </span>
            <div className="space-y-1">
              {[
                { tab: 'messages' as const, Icon: MessageSquare, label: 'Phản hồi KH', count: messagesCount },
                { tab: 'promos' as const, Icon: Ticket, label: 'Khuyến mãi', count: promosCount },
                { tab: 'reviews' as const, Icon: Star, label: 'Đánh giá SP', count: reviewsCount },
              ].map(({ tab, Icon, label, count }, i) => (
                <motion.button
                  key={tab}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.20 + i * 0.04, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                  onClick={() => setActiveSubTab(tab)}
                  className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative overflow-hidden ${
                    activeSubTab === tab 
                      ? (isDarkMode ? 'bg-white text-black shadow-md shadow-white/5' : 'bg-black text-white shadow-md shadow-black/10') 
                      : (isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-black')
                  }`}
                >
                  {activeSubTab === tab && (
                    <motion.span
                      layoutId="sidebar-active-indicator"
                      className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full ${isDarkMode ? 'bg-indigo-400' : 'bg-white'}`}
                    />
                  )}
                  <div className="flex items-center gap-2">
                    <Icon size={14} className={tab === 'reviews' ? (activeSubTab === tab ? 'text-yellow-400 fill-yellow-400' : 'text-yellow-500') : ''} />
                    <span>{label}</span>
                  </div>
                  <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                    activeSubTab === tab 
                      ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white/20 text-white') 
                      : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200/50 text-gray-600')
                  }`}>
                    {count}
                  </span>
                </motion.button>
              ))}
            </div>
          </div>

          {/* Nhóm 4: HỆ THỐNG */}
          <div>
            <span className={`block text-[10px] uppercase font-black tracking-[0.2em] mb-2 font-mono ${
              isDarkMode ? 'text-gray-300' : 'text-gray-600'
            }`}>
              Hệ thống
            </span>
            <div className="space-y-1">
              <motion.button
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.36, duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                onClick={() => setActiveSubTab('users')}
                className={`w-full flex items-center justify-between py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer relative overflow-hidden ${
                  activeSubTab === 'users' 
                    ? (isDarkMode ? 'bg-white text-black shadow-md shadow-white/5' : 'bg-black text-white shadow-md shadow-black/10') 
                    : (isDarkMode ? 'text-gray-400 hover:bg-white/10 hover:text-white' : 'text-gray-500 hover:bg-black/5 hover:text-black')
                }`}
              >
                {activeSubTab === 'users' && (
                  <motion.span
                    layoutId="sidebar-active-indicator"
                    className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r-full ${isDarkMode ? 'bg-indigo-400' : 'bg-white'}`}
                  />
                )}
                <div className="flex items-center gap-2">
                  <Users size={14} />
                  <span>Thành viên</span>
                </div>
                <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold ${
                  activeSubTab === 'users' 
                    ? (isDarkMode ? 'bg-white/10 text-white' : 'bg-white/20 text-white') 
                    : (isDarkMode ? 'bg-white/10 text-white' : 'bg-gray-200/50 text-gray-600')
                }`}>
                  {usersCount}
                </span>
              </motion.button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom actions block inside sidebar */}
      <div className={`pt-6 border-t mt-6 md:mt-0 space-y-3 font-sans relative z-10 ${
        isDarkMode ? 'border-white/10' : 'border-gray-200/50'
      }`}>
        <button
          onClick={() => onNavigate('home')}
          className={`group w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl transition-all text-[11px] font-black uppercase tracking-wider active:scale-95 cursor-pointer shadow-sm ${
            isDarkMode 
              ? 'bg-white/5 hover:!bg-white border border-white/10 hover:border-white/20 !text-white hover:!text-black' 
              : 'bg-black/5 hover:bg-black text-gray-900 hover:text-white border border-black/10 hover:border-black'
          }`}
        >
          <ArrowLeft size={13} className={`transition-transform duration-200 group-hover:-translate-x-0.5 ${isDarkMode ? 'group-hover:!text-black' : ''}`} />
          <span className={isDarkMode ? 'group-hover:!text-black transition-colors duration-200' : ''}>Trang chủ TechVie</span>
        </button>

        <div className="text-[11px] text-center text-gray-600 font-mono">
          v1.0.0 ● TechVie Administration
        </div>
      </div>
    </aside>
  );
}
