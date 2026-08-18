import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft } from 'lucide-react';
import { API_BASE_URL } from '../../services/api';

import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import DemoLoginPanel from '../../demo/DemoLoginPanel';
import { IS_DEMO_ENABLED } from '../../demo/demoConfig';
import ForgotPassword from './ForgotPassword';
import SocialConnect from './SocialConnect';


const userImage = "https://res.cloudinary.com/dxrenbivs/image/upload/v1782828396/jakub-zerdzicki-VfZj-4H5D48-unsplash_jwnyq3.jpg";

interface AuthPageProps {
  initialMode: 'login' | 'register';
  onNavigate: (tab: any) => void;
  onLoginSuccess: (email: string, token?: string) => void;
  onRegisterSuccess: (email: string, name: string, token?: string) => void;
}

export default function AuthPage({ 
  initialMode, 
  onNavigate, 
  onLoginSuccess, 
  onRegisterSuccess 
}: AuthPageProps) {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Register form states
  const [regFullName, setRegFullName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [showRegConfirmPassword, setShowRegConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (!loginEmail || !loginPassword) {
      setLoginError('Vui lòng điền đầy đủ email và mật khẩu.');
      return;
    }

    if (loginPassword.length < 6) {
      setLoginError('Mật khẩu hệ thống TechVie ID yêu cầu tối thiểu từ 6 ký tự.');
      return;
    }

    setIsLoggingIn(true);
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: loginEmail, password: loginPassword })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.message || 'Sai thông tin đăng nhập!'); });
        }
        return res.json();
      })
      .then(data => {
        setIsLoggingIn(false);
        if (data.success && data.token) {
          onLoginSuccess(loginEmail, data.token);
        } else {
          setLoginError(data.message || 'Sai thông tin đăng nhập!');
        }
      })
      .catch(err => {
        setIsLoggingIn(false);
        setLoginError(err.message || 'Lỗi kết nối máy chủ!');
      });
  };

  const handleDemoLogin = (email: string, password: string) => {
    setLoginEmail(email);
    setLoginPassword(password);
    setIsLoggingIn(true);
    fetch(`${API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
      .then(res => res.json())
      .then(data => {
        setIsLoggingIn(false);
        if (data.success && data.token) {
          onLoginSuccess(email, data.token);
        } else {
          setLoginError(data.message || 'Sai thông tin đăng nhập tài khoản demo!');
        }
      })
      .catch((err) => {
        setIsLoggingIn(false);
        setLoginError(err.message || 'Lỗi kết nối máy chủ!');
      });
  };

  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError('');

    if (!regFullName || !regEmail || !regPassword || !regConfirmPassword) {
      setRegisterError('Vui lòng điền đầy đủ tất cả các trường.');
      return;
    }

    if (regPassword.length < 6) {
      setRegisterError('Mật khẩu bảo mật TechVie ID yêu cầu tối thiểu từ 6 ký tự.');
      return;
    }

    if (regPassword !== regConfirmPassword) {
      setRegisterError('Xác nhận lại mật khẩu chưa trùng khớp.');
      return;
    }

    if (!agreeTerms) {
      setRegisterError('Bạn cần chấp thuận Điều khoản dịch vụ & Chính sách bảo mật.');
      return;
    }

    setIsRegistering(true);
    fetch(`${API_BASE_URL}/api/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: regFullName, email: regEmail, password: regPassword })
    })
      .then(res => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.message || 'Đăng ký thất bại!'); });
        }
        return res.json();
      })
      .then(data => {
        setIsRegistering(false);
        if (data.success) {
          onRegisterSuccess(regEmail, regFullName, data.token);
        } else {
          setRegisterError(data.message || 'Đăng ký thất bại!');
        }
      })
      .catch(err => {
        setIsRegistering(false);
        console.warn('Backend registration failed, using fallback mock.', err);
        setRegisterError(err.message || 'Lỗi kết nối máy chủ!');
      });
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
          border-left: 1px solid rgba(0, 0, 0, 0.05);
          border-bottom: 2px solid rgba(0, 0, 0, 0.12);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          color: #000000;
        }
        .glass-input:hover {
          background: rgba(255, 255, 255, 0.25);
          border-bottom-color: rgba(0, 0, 0, 0.25);
        }
        .glass-input:focus {
          background: rgba(255, 255, 255, 0.4);
          border-bottom-color: #000000;
          box-shadow: 
            0 10px 25px -10px rgba(0, 0, 0, 0.08),
            0 0 12px 2px rgba(255, 255, 255, 0.9);
          transform: translateY(-1px);
        }

        /* High-Intensity Glow Buttons with Fluid Shadows */
        .glow-button {
          box-shadow: 
            0 0 0 1px rgba(0,0,0,1),
            0 12px 24px -8px rgba(0,0,0,0.45),
            0 25px 50px -12px rgba(0,0,0,0.2),
            inset 0 1px 1px rgba(255,255,255,0.4);
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .glow-button:hover {
          box-shadow: 
            0 0 0 1px rgba(0,0,0,1),
            0 18px 36px -10px rgba(0,0,0,0.55),
            0 35px 70px -15px rgba(0,0,0,0.3),
            0 0 45px 5px rgba(255,255,255,0.95);
          transform: translateY(-2px);
        }

        /* Liquid flowing orbs in background container */
        .aurora-bg {
          background: linear-gradient(135deg, #f3f4f6 0%, #e2e8f0 45%, #cbd5e1 100%);
          position: relative;
          overflow: hidden;
        }
        
        /* Floating abstract oil glass blobs (Liquid Glass feel) */
        .liquid-orb-1 {
          position: absolute;
          width: 450px;
          height: 450px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(147, 197, 253, 0.5) 0%, rgba(191, 219, 254, 0.15) 50%, transparent 80%);
          filter: blur(40px);
          animation: floatOrb1 28s infinite alternate ease-in-out;
          pointer-events: none;
          z-index: 1;
        }
        .liquid-orb-2 {
          position: absolute;
          width: 500px;
          height: 500px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(251, 191, 36, 0.35) 0%, rgba(254, 243, 199, 0.1) 60%, transparent 80%);
          filter: blur(50px);
          animation: floatOrb2 34s infinite alternate ease-in-out;
          pointer-events: none;
          z-index: 1;
        }
        .liquid-orb-3 {
          position: absolute;
          width: 380px;
          height: 380px;
          border-radius: 50%;
          background: radial-gradient(circle at center, rgba(224, 231, 255, 0.6) 0%, rgba(238, 242, 255, 0.2) 50%, transparent 80%);
          filter: blur(30px);
          animation: floatOrb3 24s infinite alternate ease-in-out;
          pointer-events: none;
          z-index: 1;
        }

        @keyframes floatOrb1 {
          0% { transform: translate(-10%, -20%) scale(1) rotate(0deg); }
          50% { transform: translate(30%, 15%) scale(1.15) rotate(180deg); }
          100% { transform: translate(-5%, 35%) scale(0.9) rotate(360deg); }
        }
        @keyframes floatOrb2 {
          0% { transform: translate(40%, 30%) scale(1.1) rotate(360deg); }
          50% { transform: translate(-20%, -10%) scale(0.85) rotate(180deg); }
          100% { transform: translate(15%, -25%) scale(1.05) rotate(0deg); }
        }
        @keyframes floatOrb3 {
          0% { transform: translate(15%, -30%) scale(0.9) rotate(180deg); }
          50% { transform: translate(-30%, 20%) scale(1.12) rotate(0deg); }
          100% { transform: translate(25%, 15%) scale(1) rotate(360deg); }
        }

        .small-caps {
          font-variant: all-small-caps;
          letter-spacing: 0.12em;
        }

        /* Refractive Glass Card */
        .glass-floating-card {
          border-radius: 32px;
          background: rgba(255, 255, 255, 0.38);
          backdrop-filter: blur(40px) saturate(180%);
          -webkit-backdrop-filter: blur(40px) saturate(180%);
          box-shadow: 
            0 4px 30px rgba(0, 0, 0, 0.03),
            0 25px 60px -15px rgba(0, 0, 0, 0.1),
            inset 0 1px 3px rgba(255, 255, 255, 0.6);
        }

        @keyframes shimmer {
          0% { transform: translateX(-150%) skewX(-15deg); }
          50% { transform: translateX(150%) skewX(-15deg); }
          100% { transform: translateX(150%) skewX(-15deg); }
        }
        .glass-shimmer-sweep {
          animation: shimmer 1.8s infinite ease-in-out;
        }
      `}</style>

      {/* Floating Home Back Button */}
      <a
        href="#home"
        onClick={(e) => {
          e.preventDefault();
          onNavigate('home');
        }}
        className="group absolute top-6 left-6 md:left-12 z-50 flex items-center gap-2 px-5 py-3 rounded-full bg-white/[0.12] hover:bg-white/[0.22] text-white border border-white/20 hover:border-white/40 transition-all text-[11px] font-bold tracking-wider backdrop-blur-2xl active:scale-95 cursor-pointer shadow-[0_8px_32px_rgba(0,0,0,0.25)] hover:shadow-[0_12px_44px_rgba(255,255,255,0.18)] uppercase font-jakarta overflow-hidden"
      >
        {/* Shimmer sweep glass effect */}
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-white/40 to-transparent -translate-x-full group-hover:glass-shimmer-sweep pointer-events-none" />
        
        {/* Sparkle border reflex */}
        <span className="absolute inset-0 rounded-full border border-white/10 pointer-events-none group-hover:border-white/30 transition-colors" />

        <ArrowLeft size={13} className="text-white group-hover:-translate-x-0.5 transition-transform duration-200" />
        <span className="relative z-10 text-white/90 group-hover:text-white drop-shadow-[0_1px_2px_rgba(0,0,0,0.2)]">Trở lại Trang chủ</span>
      </a>

      {/* Left Column: Full-bleed high precision product image (60vw on desktop, hidden on mobile) */}
      <div className="hidden lg:block lg:w-[60vw] h-screen relative overflow-hidden bg-black">
        {/* Dynamic Light source ambient orbs for real-time backdrop refraction */}
        <div 
          className="absolute right-[-120px] top-[15%] w-[420px] h-[420px] rounded-full bg-gradient-to-br from-amber-400/20 to-blue-400/25 filter blur-[40px] opacity-70 z-10 pointer-events-none"
          style={{ mixBlendMode: 'plus-lighter', animation: 'floatOrb1 32s infinite alternate ease-in-out' }}
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
        
        {/* Stunning Progressive Liquid Glass Refraction Plates (reversing X gradient to the left) */}
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

      {/* 
        CENTRAL SPLIT AXIS: LIQUID GLASS BLEND CORRIDOR
        Creates a seamless, ultra-premium organic gradient blur transition 
        between the hyper-sharp structural image on the left and 
        the vibrant flowing glass aesthetics on the right.
      */}
      <div className="hidden lg:block absolute left-[60vw] -translate-x-[160px] w-[320px] h-full pointer-events-none z-30">
        {/* Layer 1: Progressive Refractive Blur */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(45px) saturate(180%) contrast(102%)',
            WebkitBackdropFilter: 'blur(45px) saturate(180%) contrast(102%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 10%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 10%, rgba(0,0,0,0.5) 45%, rgba(0,0,0,0.9) 75%, rgba(0,0,0,1) 100%)'
          }}
        />

        {/* Layer 2: Extreme Liquid glass Refraction */}
        <div 
          className="absolute inset-0"
          style={{
            backdropFilter: 'blur(90px) saturate(220%) brightness(1.05) contrast(110%)',
            WebkitBackdropFilter: 'blur(90px) saturate(220%) brightness(1.05) contrast(110%)',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,0) 45%, rgba(0,0,0,0.3) 65%, black 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,0) 45%, rgba(0,0,0,0.3) 65%, black 100%)'
          }}
        />

        {/* Layer 3: Chromatic light spectrum accent */}
        <div 
          className={`absolute inset-y-0 left-[100px] right-0 opacity-35 mix-blend-color-dodge bg-gradient-to-r transition-all duration-1000 ${
            mode === 'login' 
              ? 'from-amber-400/25 via-blue-500/25 to-transparent' 
              : mode === 'register'
                ? 'from-emerald-400/25 via-cyan-500/25 to-transparent'
                : 'from-rose-500/25 via-purple-500/25 to-transparent'
          }`}
          style={{
            maskImage: 'linear-gradient(to right, transparent, black 40%, transparent 95%)',
            WebkitMaskImage: 'linear-gradient(to right, transparent, black 40%, transparent 95%)'
          }}
        />

        {/* Layer 4: Physical solid crystal edge Chamfer highlights */}
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
        <div className="liquid-orb-3 opacity-75" />
        
        <motion.div 
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="liquid-glass-slab glass-edge glass-sheen-container w-full h-full max-h-[850px] lg:max-h-full rounded-[28px] sm:rounded-[36px] lg:border-none px-6 py-8 sm:px-12 md:px-14 lg:px-10 xl:px-14 flex flex-col justify-center z-10 overflow-y-auto"
        >
          {/* Header Section */}
          <div className="mb-7 mt-3 relative z-10">
            <h2 className="font-sans text-3xl sm:text-4xl text-black font-extrabold tracking-tighter mb-7">
              {mode === 'login' ? 'Chào mừng trở lại' : mode === 'register' ? 'Mời Bạn Tham Gia TechVie' : 'Khôi phục mật khẩu'}
            </h2>

            {/* Tab Switcher with Sleek Glassy Styling */}
            {mode !== 'forgot' && (
              <div className="flex border-b border-black/5 relative p-0.5">
                <button 
                  type="button"
                  className={`flex-1 py-4 font-jakarta text-[13px] font-bold tracking-[0.15em] relative z-20 transition-all cursor-pointer ${
                    mode === 'login' ? 'text-black border-b-2 border-black font-extrabold' : 'text-black/40 border-b-2 border-transparent hover:text-black/70'
                  }`}
                  onClick={() => {
                    setMode('login');
                    onNavigate('login');
                  }}
                >
                  ĐĂNG NHẬP
                </button>
                <button 
                  type="button"
                  className={`flex-1 py-4 font-jakarta text-[13px] font-bold tracking-[0.15em] relative z-20 transition-all cursor-pointer ${
                    mode === 'register' ? 'text-black border-b-2 border-black font-extrabold' : 'text-black/40 border-b-2 border-transparent hover:text-black/70'
                  }`}
                  onClick={() => {
                    setMode('register');
                    onNavigate('register');
                  }}
                >
                  ĐĂNG KÝ
                </button>
              </div>
            )}
          </div>

          {/* Form Switcher with slide animations */}
          <div className="relative overflow-visible z-10">
            <AnimatePresence mode="wait">
              {mode === 'login' ? (
                <LoginForm
                  loginEmail={loginEmail}
                  setLoginEmail={setLoginEmail}
                  loginPassword={loginPassword}
                  setLoginPassword={setLoginPassword}
                  showLoginPassword={showLoginPassword}
                  setShowLoginPassword={setShowLoginPassword}
                  isLoggingIn={isLoggingIn}
                  loginError={loginError}
                  onSubmit={handleLoginSubmit}
                  onForgotPassword={() => setMode('forgot')}
                />
              ) : mode === 'register' ? (
                <RegisterForm
                  regFullName={regFullName}
                  setRegFullName={setRegFullName}
                  regEmail={regEmail}
                  setRegEmail={setRegEmail}
                  regPassword={regPassword}
                  setRegPassword={setRegPassword}
                  regConfirmPassword={regConfirmPassword}
                  setRegConfirmPassword={setRegConfirmPassword}
                  showRegPassword={showRegPassword}
                  setShowRegPassword={setShowRegPassword}
                  showRegConfirmPassword={showRegConfirmPassword}
                  setShowRegConfirmPassword={setShowRegConfirmPassword}
                  agreeTerms={agreeTerms}
                  setAgreeTerms={setAgreeTerms}
                  isRegistering={isRegistering}
                  registerError={registerError}
                  onSubmit={handleRegisterSubmit}
                />
              ) : (
                <ForgotPassword
                  onBackToLogin={() => setMode('login')}
                />
              )}
            </AnimatePresence>
          </div>

          {/* Social Connect */}
          {mode !== 'forgot' && (
            <SocialConnect
              mode={mode}
              onLoginSuccess={(email) => onLoginSuccess(email, 'Bearer mock_user_token')}
              onRegisterSuccess={onRegisterSuccess}
            />
          )}
        </motion.div>
      </div>

      {/* Floating Developer Quick-Login Panel */}
      {IS_DEMO_ENABLED && <DemoLoginPanel onDemoLogin={handleDemoLogin} />}
    </div>
  );
}
