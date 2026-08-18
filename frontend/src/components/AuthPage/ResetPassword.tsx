import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Eye, EyeOff, CheckCircle } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

const userImage = "https://res.cloudinary.com/dxrenbivs/image/upload/v1782828396/jakub-zerdzicki-VfZj-4H5D48-unsplash_jwnyq3.jpg";

interface ResetPasswordProps {
  token: string;
  onNavigate: (tab: any) => void;
}

export default function ResetPassword({ token, onNavigate }: ResetPasswordProps) {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 6) {
      setError('Mật khẩu mới yêu cầu tối thiểu từ 6 ký tự.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Xác nhận mật khẩu chưa trùng khớp.');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      });
      const data = await response.json();
      if (response.ok) {
        setIsSuccess(true);
      } else {
        setError(data.message || 'Có lỗi xảy ra khi đặt lại mật khẩu.');
      }
    } catch (err) {
      setError('Lỗi kết nối tới máy chủ!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen w-full flex overflow-hidden bg-white select-none">
      {/* Styles for Premium Liquid Glass Theme */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=Playfair+Display:ital,wght@0,300..900;1,300..900&display=swap');

        .font-jakarta {
          font-family: 'Plus Jakarta Sans', sans-serif;
        }
        .font-playfair {
          font-family: 'Playfair Display', serif;
        }

        /* Deep Liquid Refraction Effect */
        .liquid-glass-slab {
          background: rgba(255, 255, 255, 0.32);
          backdrop-filter: blur(50px) saturate(190%) contrast(105%);
          -webkit-backdrop-filter: blur(50px) saturate(190%) contrast(105%);
          box-shadow: 
            0 30px 60px -15px rgba(0, 0, 0, 0.15),
            inset 0 1px 2px rgba(255, 255, 255, 0.45);
        }

        /* Liquid Sheen (Refractive light sweep anim) */
        .glass-sheen-container {
          position: relative;
          overflow: hidden;
        }
        .glass-sheen-container::after {
          content: '';
          position: absolute;
          top: -150%;
          left: -150%;
          width: 300%;
          height: 300%;
          background: linear-gradient(
            135deg,
            rgba(255, 255, 255, 0) 40%,
            rgba(255, 255, 255, 0.35) 48%,
            rgba(255, 255, 255, 0.5) 50%,
            rgba(255, 255, 255, 0.35) 52%,
            rgba(255, 255, 255, 0) 60%
          );
          transform: rotate(25deg);
          transition: transform 1.2s cubic-bezier(0.16, 1, 0.3, 1);
          pointer-events: none;
          z-index: 5;
        }
        .glass-sheen-container:hover::after {
          transform: translate(120%, 120%) rotate(25deg);
        }

        /* Glass border highlight line */
        .glass-edge {
          position: relative;
        }
        .glass-edge::before {
          content: "";
          position: absolute;
          inset: 0;
          border: 1px solid transparent;
          background: linear-gradient(
            145deg, 
            rgba(255,255,255,0.85) 0%, 
            rgba(255,255,255,0.1) 35%, 
            rgba(0,0,0,0.05) 60%, 
            rgba(255,255,255,0.45) 100%
          ) border-box;
          -webkit-mask: linear-gradient(#fff 0 0) padding-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          pointer-events: none;
          border-radius: inherit;
        }

        /* Premium Glass Input Fields */
        .glass-input {
          background: rgba(255, 255, 255, 0.15);
          border: 1px solid rgba(0, 0, 0, 0.08);
          border-top: 1px solid rgba(0, 0, 0, 0.04);
          box-shadow: 
            0 2px 5px rgba(0,0,0,0.02),
            inset 0 1px 1.5px rgba(255,255,255,0.6);
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.3);
          border-color: rgba(0, 0, 0, 0.25);
          box-shadow: 
            0 10px 25px -5px rgba(0,0,0,0.05),
            inset 0 1px 1px rgba(255,255,255,0.8);
        }

        /* Liquid flowing background animations */
        @keyframes floatOrb1 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(40px, -60px) scale(1.08); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(0, 0) scale(1); }
          100% { transform: translate(-50px, 40px) scale(0.93); }
        }

        .liquid-orb-1 {
          position: absolute;
          top: -5%;
          right: -5%;
          width: 550px;
          height: 550px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(244,63,94,0.15) 0%, rgba(244,63,94,0) 70%);
          filter: blur(40px);
          animation: floatOrb1 22s infinite alternate ease-in-out;
          pointer-events: none;
        }
        .liquid-orb-2 {
          position: absolute;
          bottom: -10%;
          left: 10%;
          width: 600px;
          height: 600px;
          border-radius: 50%;
          background: radial-gradient(circle, rgba(99,102,241,0.14) 0%, rgba(99,102,241,0) 70%);
          filter: blur(50px);
          animation: floatOrb2 26s infinite alternate ease-in-out;
          pointer-events: none;
        }
        .aurora-bg {
          background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        }
      `}</style>

      {/* Left Column - Hero Image & Branding (60vw width, hidden on mobile) */}
      <div className="hidden lg:block w-[60vw] h-screen relative overflow-hidden bg-zinc-950">
        {/* Floating background spectral glows */}
        <div 
          className="absolute right-[15%] top-[15%] w-[450px] h-[450px] rounded-full bg-gradient-to-tr from-rose-500/20 to-violet-500/10 filter blur-[60px] opacity-70 z-10 pointer-events-none"
          style={{ mixBlendMode: 'plus-lighter', animation: 'floatOrb1 24s infinite alternate ease-in-out' }}
        />
        <div 
          className="absolute left-[10%] bottom-[10%] w-[380px] h-[380px] rounded-full bg-gradient-to-tr from-cyan-400/25 to-indigo-400/15 filter blur-[50px] opacity-60 z-10 pointer-events-none"
          style={{ mixBlendMode: 'plus-lighter', animation: 'floatOrb2 28s infinite alternate ease-in-out' }}
        />

        <motion.img 
          initial={{ scale: 1.05 }}
          animate={{ scale: [1, 1.04, 1] }}
          transition={{ duration: 40, repeat: Infinity, ease: 'easeInOut' }}
          alt="TechVie Architectural Tech Backdrop" 
          className="w-full h-full object-cover opacity-85 ease-in-out" 
          src={userImage} 
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent pointer-events-none" />
        
        {/* Stunning Progressive Liquid Glass Refraction Plates */}
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            backdropFilter: 'blur(32px) saturate(190%) contrast(106%) brightness(1.04)',
            WebkitBackdropFilter: 'blur(32px) saturate(190%) contrast(106%) brightness(1.04)',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0) 100%)'
          }}
        />
        <div 
          className="absolute inset-0 z-20 pointer-events-none"
          style={{
            backdropFilter: 'blur(16px) saturate(145%) brightness(1.02)',
            WebkitBackdropFilter: 'blur(16px) saturate(145%) brightness(1.02)',
            maskImage: 'linear-gradient(to left, rgba(0,0,0,0.65) 5%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 100%)',
            WebkitMaskImage: 'linear-gradient(to left, rgba(0,0,0,0.65) 5%, rgba(0,0,0,0.2) 65%, rgba(0,0,0,0) 100%)'
          }}
        />

        {/* Branding Overlay */}
        <div className="absolute bottom-16 left-16 z-30">
          <h1 className="text-white font-playfair text-6xl leading-tight font-black tracking-tighter mix-blend-difference select-none">
            TECHVIE
          </h1>
          <p className="text-white/60 font-jakarta text-[11px] tracking-[0.4em] uppercase mt-4 font-semibold select-none small-caps">
            Refractive Excellence
          </p>
        </div>
      </div>

      {/* CENTRAL SPLIT AXIS: LIQUID GLASS BLEND CORRIDOR */}
      <div className="hidden lg:block absolute left-[60vw] -translate-x-[160px] w-[320px] h-full pointer-events-none z-30">
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(45px) saturate(180%) contrast(102%)',
            WebkitBackdropFilter: 'blur(45px) saturate(180%) contrast(102%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 10%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 10%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,1) 100%)'
          }}
        />
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(90px) saturate(220%) brightness(1.05) contrast(110%)',
            WebkitBackdropFilter: 'blur(90px) saturate(220%) brightness(1.05) contrast(110%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 45%, rgba(0,0,0,0.3) 65%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 45%, rgba(0,0,0,0.3) 65%, black 100%)'
          }}
        />
        
        {/* Layer 3: Chromatic light spectrum accent (Violet & Fuchsia for Reset Password) */}
        <div 
          className="absolute inset-y-0 left-[100px] right-0 opacity-35 mix-blend-color-dodge bg-gradient-to-r from-violet-500/25 via-fuchsia-500/25 to-transparent"
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 40%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%, transparent 95%)'
          }}
        />

        <div className="absolute inset-y-0 left-[160px] w-[1px] bg-white/40 shadow-[0_0_12px_rgba(255,255,255,0.7)]" />
        <div className="absolute inset-y-0 left-[161px] w-[1px] bg-black/10" />
      </div>

      {/* Right Column: Unified Auth Panel with Refractive Frost Effect */}
      <div className="w-full lg:w-[40vw] h-screen aurora-bg relative flex flex-col items-center justify-center font-jakarta p-4 sm:p-6 lg:p-8 overflow-hidden z-40">
        {/* Highly blurred continuation background of the left image */}
        <div 
          className="absolute inset-0 bg-cover pointer-events-none scale-110 opacity-75"
          style={{ 
            backgroundImage: `url(${userImage})`,
            backgroundPosition: 'right center',
            filter: 'blur(75px) saturate(180%) brightness(0.97)',
          }}
        />

        {/* Rich Flowing Liquid Orbs */}
        <div className="liquid-orb-1 opacity-70" />
        <div className="liquid-orb-2 opacity-60" />

        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass-slab glass-edge glass-sheen-container w-full h-full max-h-[850px] lg:max-h-full rounded-[28px] sm:rounded-[36px] lg:border-none px-6 py-8 sm:px-12 md:px-14 lg:px-10 xl:px-14 flex flex-col justify-center z-10 overflow-y-auto"
        >
          <div className="relative z-10">
            {isSuccess ? (
              <div className="text-center">
                <div className="flex justify-center mb-6 text-black">
                  <CheckCircle size={56} className="animate-bounce" />
                </div>
                <h3 className="text-3xl font-extrabold text-black mb-3 tracking-tight">ĐẶT LẠI THÀNH CÔNG!</h3>
                <p className="text-xs text-black/60 leading-relaxed mb-8 max-w-sm mx-auto">
                  Mật khẩu của bạn đã được cập nhật thành công. Bây giờ bạn có thể đăng nhập bằng mật khẩu mới của mình.
                </p>
                <button
                  type="button"
                  onClick={() => onNavigate('login')}
                  className="w-full py-4.5 bg-black text-white rounded-xl text-xs font-bold tracking-[0.2em] active:scale-[0.98] transition-all uppercase cursor-pointer glow-button"
                >
                  Đăng nhập ngay
                </button>
              </div>
            ) : (
              <>
                <div className="text-center mb-7">
                  <h2 className="text-3xl sm:text-4xl font-extrabold text-black tracking-tight uppercase">Mật khẩu mới</h2>
                  <p className="text-[11px] text-black/40 tracking-[0.3em] uppercase mt-2 font-semibold">TechVie ID Security</p>
                </div>

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                  {error && (
                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
                      {error}
                    </div>
                  )}

                  {/* New Password */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold block ml-0.5">
                      Mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full glass-input pl-4 pr-11 py-3 rounded-xl text-sm outline-none placeholder-black/35"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-opacity cursor-pointer flex items-center justify-center"
                      >
                        {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  {/* Confirm Password */}
                  <div className="space-y-1.5">
                    <label className="text-[12px] uppercase tracking-widest text-black/60 font-semibold block ml-0.5">
                      Xác nhận mật khẩu mới
                    </label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        placeholder="••••••••"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full glass-input pl-4 pr-11 py-3 rounded-xl text-sm outline-none placeholder-black/35"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-black/45 hover:text-black transition-opacity cursor-pointer flex items-center justify-center"
                      >
                        {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-4.5 bg-black text-white rounded-xl text-xs font-bold tracking-[0.2em] mt-2 active:scale-[0.98] transition-all glow-button uppercase cursor-pointer"
                  >
                    {isLoading ? 'Đang cập nhật...' : 'Xác nhận thay đổi'}
                  </button>
                </form>
              </>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
