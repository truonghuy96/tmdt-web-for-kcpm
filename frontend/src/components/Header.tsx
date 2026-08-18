import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Link } from "react-router-dom";
import { TabType } from "../types";
import { Search, ShoppingBag, Menu, X, User } from "lucide-react";
import Logo from "../assets/logopage/logo-b-w-techvie.png";

interface HeaderProps {
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
  navigationItems: Array<{ id: TabType; label: string }>;
  isSearchOpen: boolean;
  setIsSearchOpen: (open: boolean) => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  totalCartCount: number;
  isLoggedIn: boolean;
  userProfile: { name: string };
  isMobileMenuOpen: boolean;
  setIsMobileMenuOpen: (open: boolean) => void;
}

export default function Header({
  activeTab,
  setActiveTab,
  navigationItems,
  setIsSearchOpen,
  setIsCartOpen,
  totalCartCount,
  isLoggedIn,
  userProfile,
  isMobileMenuOpen,
  setIsMobileMenuOpen,
}: HeaderProps) {
  const [prevCartCount, setPrevCartCount] = useState(totalCartCount);
  const [cartBadgePop, setCartBadgePop] = useState(false);
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [scrolled, setScrolled] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Scroll Visibility & Shrink effect handler
  useEffect(() => {
    const onScroll = () => {
      const currentScrollY = window.scrollY;
      setScrolled(currentScrollY > 48);

      if (currentScrollY < 10) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 100) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY) {
        setIsVisible(true);
      }
      setLastScrollY(currentScrollY);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [lastScrollY]);

  // Auto-close dropdown on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        setShowUserDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Cart badge pop animation when count increases
  useEffect(() => {
    if (totalCartCount > prevCartCount) {
      setCartBadgePop(true);
      const t = setTimeout(() => setCartBadgePop(false), 500);
      setPrevCartCount(totalCartCount);
      return () => clearTimeout(t);
    }
    setPrevCartCount(totalCartCount);
  }, [totalCartCount]);

  return (
    <header
      className={`sticky top-0 z-50 w-full transition-all duration-300 select-none ${
        scrolled
          ? "border-b border-white/30 bg-white/85 shadow-[0_8px_32px_0_rgba(0,0,0,0.06)] backdrop-blur-xl"
          : "border-b border-white/20 bg-white/70 shadow-[0_8px_32px_0_rgba(0,0,0,0.02)] backdrop-blur-md"
      }`}
      style={{
        transform: isVisible ? "translateY(0)" : "translateY(-100%)",
        transition:
          "transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background-color 0.3s ease, border-color 0.3s ease, box-shadow 0.3s ease",
      }}
    >
      <style>{`
        .nav-btn {
          position: relative;
          transition: color 0.25s cubic-bezier(0.25, 1, 0.5, 1);
          cursor: pointer;
          background: transparent;
          border: none;
          z-index: 1;
        }

        .nav-btn::before {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 2px;
          width: 0;
          background-color: #000000;
          transition: width 0.22s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: 2;
        }

        .nav-btn::after {
          content: "";
          position: absolute;
          left: 0;
          bottom: 0;
          height: 0;
          width: 100%;
          background-color: #000000;
          transition: height 0.28s cubic-bezier(0.25, 1, 0.5, 1);
          z-index: -1;
        }

        /* Hover states */
        .nav-btn:hover {
          color: #ffffff !important;
        }

        .nav-btn:hover::before {
          width: 100%;
        }

        .nav-btn:hover::after {
          height: 100%;
        }

        /* Active state */
        .nav-btn-active {
          color: #000000;
        }

        .nav-btn-active::before {
          width: 100%;
        }

        /* Cart badge pop keyframe */
        @keyframes badge-pop {
          0% { transform: scale(1); }
          40% { transform: scale(1.45); }
          70% { transform: scale(0.88); }
          100% { transform: scale(1); }
        }
        .badge-pop { animation: badge-pop 0.42s cubic-bezier(0.22, 1, 0.36, 1); }
      `}</style>

      <div className="relative mx-auto flex h-18 w-full max-w-none items-center justify-between px-4 md:px-8 lg:px-10">
        {/* Brand Logo */}
        <Link
          to="/"
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          className="font-sans text-2xl font-black tracking-tighter text-black transition-opacity hover:opacity-80 md:text-3xl"
        >
          <img
            src={Logo}
            alt="TechVie Logo"
            className="h-12 w-auto cursor-pointer object-contain md:h-14 lg:h-16"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden items-center space-x-3 md:flex lg:space-x-8 xl:space-x-10">
          {navigationItems.map((item) => (
            <Link
              key={item.id}
              to={item.id === "home" ? "/" : `/${item.id}`}
              onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
              className={`nav-btn inline-block cursor-pointer rounded-sm px-4 py-2 font-sans text-[11px] font-extrabold tracking-widest transition-all duration-300 lg:text-[13px] ${
                activeTab === item.id ? "nav-btn-active" : "text-gray-500"
              }`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-2 sm:space-x-4">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-gray-200 active:scale-95"
            title="Tìm kiếm thiết bị"
          >
            <Search size={20} className="text-gray-900" />
          </button>

          <button
            onClick={() => setIsCartOpen(true)}
            className="relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-gray-200 hover:backdrop-blur-sm"
            title="Giỏ hàng TechVie"
          >
            <ShoppingBag size={20} className="text-gray-900" />
            <AnimatePresence>
              {totalCartCount > 0 && (
                <motion.span
                  key={totalCartCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: "spring", stiffness: 500, damping: 20 }}
                  className={`absolute top-1.5 right-1.5 flex h-4.5 w-4.5 items-center justify-center rounded-full border border-white bg-indigo-600 font-mono text-[9px] font-bold text-white ${cartBadgePop ? "badge-pop" : ""}`}
                >
                  {totalCartCount}
                </motion.span>
              )}
            </AnimatePresence>
          </button>

          <div className="flex items-center space-x-2">
            {isLoggedIn && (
              <span className="border-indigo-150 hidden rounded-full border bg-indigo-50 px-3 py-1.5 font-mono text-[10px] font-black tracking-widest text-black uppercase lg:inline-block">
                Chào, {userProfile.name.split(" ").pop()?.toUpperCase()}
              </span>
            )}

            <div
              ref={dropdownRef}
              className="relative flex items-center"
              onMouseEnter={() => setShowUserDropdown(true)}
              onMouseLeave={() => setShowUserDropdown(false)}
            >
              <Link
                to={!isLoggedIn ? "/login" : "/account"}
                onClick={() => {
                  setShowUserDropdown(false);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className={`relative flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 ${
                  activeTab === "account" ||
                  activeTab === "login" ||
                  activeTab === "register"
                    ? "bg-black text-white shadow-md"
                    : "border border-transparent/0 text-gray-950 hover:bg-gray-200 hover:backdrop-blur-sm"
                }`}
                title="Tài khoản TechVie ID"
              >
                <User size={20} className="transition-all duration-300" />
              </Link>

              <AnimatePresence>
                {!isLoggedIn && showUserDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                    className="border-gray-150 absolute top-full right-0 z-[60] mt-2 flex w-48 flex-col gap-2 rounded-2xl border bg-white p-3 shadow-2xl"
                  >
                    {/* Tiny arrow pointing up */}
                    <div className="border-gray-150 absolute -top-1.5 right-4 z-10 h-3 w-3 rotate-45 border-t border-l bg-white" />

                    <Link
                      to="/login"
                      onClick={() => setShowUserDropdown(false)}
                      className="block w-full cursor-pointer rounded-xl bg-black py-2.5 text-center font-sans text-[11px] font-black tracking-widest text-white uppercase transition-all hover:bg-neutral-800 active:scale-95"
                    >
                      Đăng Nhập
                    </Link>

                    <Link
                      to="/register"
                      onClick={() => setShowUserDropdown(false)}
                      className="block w-full cursor-pointer rounded-xl border border-gray-200 bg-white py-2.5 text-center font-sans text-[11px] font-black tracking-widest text-gray-900 uppercase transition-all hover:bg-gray-100 active:scale-95"
                    >
                      Đăng Ký
                    </Link>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-12 w-12 cursor-pointer items-center justify-center rounded-full transition-all duration-300 hover:bg-gray-200 hover:backdrop-blur-sm md:hidden"
            title="Danh mục menu"
          >
            <AnimatePresence mode="wait" initial={false}>
              {isMobileMenuOpen ? (
                <motion.span
                  key="close"
                  initial={{ rotate: -90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: 90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <X size={20} />
                </motion.span>
              ) : (
                <motion.span
                  key="menu"
                  initial={{ rotate: 90, opacity: 0 }}
                  animate={{ rotate: 0, opacity: 1 }}
                  exit={{ rotate: -90, opacity: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  <Menu size={20} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu — stagger items */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0, y: -8 }}
            animate={{ opacity: 1, height: "auto", y: 0 }}
            exit={{ opacity: 0, height: 0, y: -8 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-gray-100 bg-white/95 backdrop-blur-xl md:hidden"
          >
            <div className="flex flex-col space-y-1 px-6 py-5">
              {navigationItems.map((item, idx) => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{
                    delay: idx * 0.045,
                    duration: 0.25,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                >
                  <Link
                    to={item.id === "home" ? "/" : `/${item.id}`}
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black tracking-widest uppercase transition-all duration-200 ${
                      activeTab === item.id
                        ? "bg-gray-100 text-black"
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    {activeTab === item.id && (
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-black" />
                    )}
                    {item.label}
                  </Link>
                </motion.div>
              ))}

              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  delay: navigationItems.length * 0.045,
                  duration: 0.25,
                }}
                className="mt-2 flex flex-col gap-1 border-t border-gray-100 pt-3"
              >
                {!isLoggedIn ? (
                  <>
                    <Link
                      to="/login"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black tracking-widest uppercase transition-all duration-200 ${
                        activeTab === "login"
                          ? "bg-gray-100 text-black"
                          : "text-gray-500 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      ĐĂNG NHẬP
                    </Link>
                    <Link
                      to="/register"
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black tracking-widest uppercase transition-all duration-200 ${
                        activeTab === "register"
                          ? "bg-gray-100 text-black"
                          : "text-gray-500 hover:bg-gray-50 hover:text-black"
                      }`}
                    >
                      ĐĂNG KÝ
                    </Link>
                  </>
                ) : (
                  <Link
                    to="/account"
                    onClick={() => {
                      setIsMobileMenuOpen(false);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className={`flex items-center gap-3 rounded-xl px-3 py-3 text-left text-sm font-black tracking-widest uppercase transition-all duration-200 ${
                      activeTab === "account"
                        ? "bg-gray-100 text-black"
                        : "text-gray-500 hover:bg-gray-50 hover:text-black"
                    }`}
                  >
                    <User size={16} />
                    TÀI KHOẢN (
                    {userProfile.name.split(" ").pop()?.toUpperCase()})
                  </Link>
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
