import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronUp } from "lucide-react";

interface BackToTopButtonProps {
  activeTab?: string;
}

export default function BackToTopButton({ activeTab = "" }: BackToTopButtonProps) {
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 80);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Exclude admin dashboard, login, and registration pages
  if (
    String(activeTab).startsWith("admin") ||
    activeTab === "login" ||
    activeTab === "register"
  ) {
    return null;
  }

  const handleScrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        .premium-glass-btn {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          cursor: pointer;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(0, 0, 0, 0.2);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          padding: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 
              0 4px 20px 0 rgba(0, 0, 0, 0.1),
              inset 0 1px 2px 0 rgba(255, 255, 255, 0.1);
          transition: all 0.25s ease;
        }

        .premium-glass-btn:hover {
          background: rgba(0, 0, 0, 0.55);
          border-color: rgba(255, 255, 255, 0.18);
          box-shadow: 
              0 6px 24px 0 rgba(0, 0, 0, 0.15),
              inset 0 1px 2px 0 rgba(255, 255, 255, 0.2);
        }
      `}</style>

      <AnimatePresence>
        {showScrollTop && (
          <motion.button
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-8 right-8 z-[40] premium-glass-btn"
            title="Lên đầu trang"
            onClick={handleScrollToTop}
          >
            <ChevronUp 
              size={22} 
              strokeWidth={1.5} 
              className="text-white opacity-85" 
            />
          </motion.button>
        )}
      </AnimatePresence>
    </>
  );
}
