import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

interface ForgotPasswordProps {
  onBackToLogin: () => void;
}

export default function ForgotPassword({ onBackToLogin }: ForgotPasswordProps) {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  
  // Anti-spam states
  const [sendCount, setSendCount] = useState(0);
  const [cooldown, setCooldown] = useState(0);

  React.useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cooldown > 0) return;

    setMessage('');
    setError('');
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || 'Một liên kết đặt lại mật khẩu đã được gửi tới email của bạn!');
        
        const newCount = sendCount + 1;
        setSendCount(newCount);
        
        // Nếu gửi từ lần thứ 2 trở đi, chặn 2 phút (120s), ngược lại là 60s
        if (newCount >= 2) {
          setCooldown(120);
          setError('Bạn đã gửi yêu cầu 2 lần. Vui lòng đợi 2 phút trước khi gửi lại.');
        } else {
          setCooldown(60);
        }
      } else {
        setError(data.message || 'Có lỗi xảy ra, vui lòng thử lại.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      key="forgot-password-form"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.3 }}
      className="flex flex-col gap-5"
    >
      <div className="flex items-center gap-2 mb-2">
        <button 
          type="button" 
          onClick={onBackToLogin}
          className="p-2 hover:bg-black/5 rounded-lg transition-colors cursor-pointer flex items-center justify-center"
        >
          <ArrowLeft size={16} />
        </button>
        <span className="font-jakarta text-[11px] font-bold tracking-wider uppercase text-black/60">Quay lại đăng nhập</span>
      </div>

      <p className="font-jakarta text-xs text-black/60 leading-relaxed mb-2">
        Nhập địa chỉ email tài khoản của bạn dưới đây. Chúng tôi sẽ gửi một liên kết an toàn để bạn thiết lập lại mật khẩu mới.
      </p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl font-jakarta">
            {error}
          </div>
        )}
        {message && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 text-xs rounded-xl font-jakarta">
            {message}
          </div>
        )}

        <div className="space-y-1.5">
          <label className="font-jakarta text-[12px] uppercase tracking-widest text-black/60 font-semibold block ml-0.5">
            Email của bạn
          </label>
          <input 
            type="email"
            required
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full glass-input px-4 py-3 rounded-xl font-jakarta text-sm outline-none placeholder-black/35"
          />
        </div>

        <button 
          type="submit"
          disabled={isLoading || cooldown > 0}
          className="w-full py-4.5 bg-black text-white rounded-xl font-jakarta text-xs font-bold tracking-[0.2em] mt-2 active:scale-[0.98] transition-all glow-button uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Đang gửi...' : cooldown > 0 ? `Gửi lại sau ${cooldown}s` : 'Gửi liên kết khôi phục'}
        </button>
      </form>
    </motion.div>
  );
}
