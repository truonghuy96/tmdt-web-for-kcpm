import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';

interface ImageZoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageSrc: string;
  altText?: string;
}

export default function ImageZoomModal({ isOpen, onClose, imageSrc, altText = 'Hình ảnh' }: ImageZoomModalProps) {
  // Listen for ESC key press to close the modal
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        className="fixed inset-0 z-[200] flex cursor-zoom-out items-center justify-center bg-black/92 p-4 backdrop-blur-xl"
      >
        {/* Close button with nice rotation hover effect */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 z-10 flex h-11 w-11 cursor-pointer items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-all duration-200 hover:scale-105 hover:bg-white/25 group"
          title="Đóng (Esc)"
        >
          <X size={18} className="group-hover:rotate-90 transition-transform" />
        </button>

        {/* Zoomed Image */}
        <motion.img
          src={imageSrc}
          alt={altText}
          referrerPolicy="no-referrer"
          onClick={(e) => e.stopPropagation()}
          initial={{ scale: 0.85, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.85, opacity: 0, y: 20 }}
          transition={{ type: "spring", damping: 22, stiffness: 280 }}
          className="max-h-[88vh] max-w-[90vw] cursor-default object-contain rounded-2xl drop-shadow-2xl border border-white/10"
        />
      </motion.div>
    </AnimatePresence>,
    document.body
  );
}
