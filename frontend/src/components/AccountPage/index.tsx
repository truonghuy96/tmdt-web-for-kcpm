import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import AdminButton from "./AdminButton";

// Modular sub-components
import AccountAuth from "./AccountAuth";
import AccountSidebar from "./AccountSidebar";
import TabProfile from "./TabProfile";
import TabOrders from "./TabOrders";
import TabDevices from "./TabDevices";
import TabSecurity from "./TabSecurity";

import backgroundImage from "../../assets/images/account-page/huum-8fSitumSVw8-unsplash.jpg";

const defaultUserProfile = {
  name: "Khách hàng TechVie",
  email: "",
  phone: "",
  address: "",
  memberSince: "01/07/2026",
  techvieId: "TV-MEMBER",
  shieldStatus: "Đang hoạt động",
  role: "user",
};

import { getUserOrders, getUserDevices } from "../../services/api";

interface AccountPageProps {
  onNavigate: (tab: any) => void;
  isLoggedIn?: boolean;
  setIsLoggedIn?: (val: boolean) => void;
  userProfile?: any;
  setUserProfile?: (profile: any) => void;
  token?: string;
  onAddToCart?: (product: any, selectedColor?: string) => void;
}

export default function AccountPage({
  onNavigate,
  isLoggedIn: externalIsLoggedIn,
  setIsLoggedIn: externalSetIsLoggedIn,
  userProfile: externalUserProfile,
  setUserProfile: externalSetUserProfile,
  token = "",
  onAddToCart,
}: AccountPageProps) {
  const [localIsLoggedIn, localSetIsLoggedIn] = useState(false);
  const isLoggedIn =
    externalIsLoggedIn !== undefined ? externalIsLoggedIn : localIsLoggedIn;
  const setIsLoggedIn =
    externalSetIsLoggedIn !== undefined
      ? externalSetIsLoggedIn
      : localSetIsLoggedIn;



  // Active sub-tab inside dashboard
  const [accountTab, setAccountTab] = useState<
    "profile" | "orders" | "devices" | "security"
  >("profile");

  useEffect(() => {
    setTimeout(() => {
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 50);
  }, [accountTab]);

  // Interactive user data state matching Premium TechVie standards
  const [localUserProfile, localSetUserProfile] = useState(defaultUserProfile);
  const userProfile =
    externalUserProfile !== undefined ? externalUserProfile : localUserProfile;
  const setUserProfile =
    externalSetUserProfile !== undefined
      ? externalSetUserProfile
      : localSetUserProfile;

  // Real orders synced dynamically from MongoDB
  const [orders, setOrders] = useState<any[]>([]);
  const [devices, setDevices] = useState<any[]>([]);
  const [isLoadingDevices, setIsLoadingDevices] = useState(false);

  useEffect(() => {
    if (isLoggedIn && token) {
      const fetchOrders = () => {
        getUserOrders(token).then((res) => {
          if (res.success && res.orders) {
            setOrders(res.orders);
          }
        });
      };

      // Tải dữ liệu lần đầu
      fetchOrders();

      // Polling thông minh: tải lại dữ liệu đơn hàng mỗi 10 giây nếu tab trình duyệt đang hoạt động
      const intervalId = setInterval(() => {
        if (document.visibilityState === "visible") {
          fetchOrders();
        }
        // Thêm thời gian vào để quét liên tục
      }, 10000);

      setIsLoadingDevices(true);
      getUserDevices()
        .then((res) => {
          if (res.success && res.devices) {
            setDevices(res.devices);
          }
          setIsLoadingDevices(false);
        })
        .catch(() => {
          setIsLoadingDevices(false);
        });

      return () => {
        clearInterval(intervalId);
      };
    }
  }, [isLoggedIn, token]);

  const handleLogout = () => {
    setIsLoggedIn(false);
  };

  return (
    <div className="font-body-sm text-body-sm relative isolate min-h-screen w-full overflow-x-hidden pb-12 selection:bg-black selection:text-white">
      {/* Local Liquid Glass Style Definitions */}
      <style>{`
        .font-tech-label {
          font-family: 'JetBrains Mono', monospace;
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.15em;
          font-weight: 700;
        }
        .text-tech-label {
          font-size: 10px;
          line-height: 1;
          letter-spacing: 0.15em;
          font-weight: 700;
        }
        .font-headline-md {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 18px;
          line-height: 1.3;
          letter-spacing: 0.05em;
          font-weight: 800;
        }
        .text-headline-md {
          font-size: 18px;
          line-height: 1.3;
          letter-spacing: 0.05em;
          font-weight: 800;
        }
        .font-display-hero {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 48px;
          line-height: 1.1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }
        .text-display-hero {
          font-size: 48px;
          line-height: 1.1;
          letter-spacing: -0.04em;
          font-weight: 900;
        }
        .font-body-lg {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 16px;
          line-height: 1.6;
          font-weight: 400;
        }
        .text-body-lg {
          font-size: 16px;
          line-height: 1.6;
          font-weight: 400;
        }
        .font-headline-lg {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0.1em;
          font-weight: 900;
        }
        .text-headline-lg {
          font-size: 24px;
          line-height: 1.2;
          letter-spacing: 0.1em;
          font-weight: 900;
        }
        .font-body-sm {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 13px;
          line-height: 1.5;
          font-weight: 400;
        }
        .text-body-sm {
          font-size: 13px;
          line-height: 1.5;
          font-weight: 400;
        }
        .font-caption-tiny {
          font-family: 'Hanken Grotesk', sans-serif;
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.05em;
          font-weight: 900;
        }
        .text-caption-tiny {
          font-size: 9px;
          line-height: 1;
          letter-spacing: 0.05em;
          font-weight: 900;
        }
        .px-container-margin {
          padding-left: 2.5rem;
          padding-right: 2.5rem;
        }
        .p-card-padding {
          padding: 2rem;
        }
        .gap-grid-gutter {
          gap: 1.5rem;
        }
        .gap-stack-gap {
          gap: 1.5rem;
        }
        .text-glow-indigo {
          text-shadow: 0 0 10px rgba(45, 55, 72, 0.2);
        }
        .custom-glass-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-glass-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.3);
        }
        .custom-glass-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(45, 55, 72, 0.2);
          border-radius: 9999px;
        }
        .hide-scrollbar {
          scrollbar-width: none;
          -ms-overflow-style: none;
        }
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
      `}</style>

      {/* Absolute Background Layer */}
      <div
        className="absolute inset-0 -z-10 bg-cover bg-center pointer-events-none"
        style={{ backgroundImage: `url(${backgroundImage})` }}
      />
      {/* Atmospheric Blur Overlay for Text Legibility */}
      <div className="absolute inset-0 -z-10 bg-white/40 backdrop-blur-[10px] pointer-events-none" />

      {/* FULL PAGE GLASS LOADING OVERLAY */}
      <AnimatePresence>
        {isLoggedIn && userProfile.name === "" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/40 backdrop-blur-2xl pointer-events-auto"
          >
            <div className="relative w-14 h-14 mb-4 flex items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-black/10"></div>
              <div className="absolute inset-0 rounded-full border-4 border-t-black animate-spin"></div>
            </div>
            <p className="font-tech-label text-black/80 uppercase tracking-widest text-[11px] animate-pulse">
              Đang tải dữ liệu tài khoản...
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Layout Container */}
      <div className="px-container-margin relative z-10 mx-auto flex min-h-[85vh] max-w-[1400px] items-start justify-center py-12 md:py-20">
        <AnimatePresence mode="wait">
          {/* CASE 1: USER NOT SIGNED IN */}
          {!isLoggedIn ? (
            <AccountAuth onNavigate={onNavigate} />
          ) : (
            <motion.div
              key="dashboard-view"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="w-full"
            >
              {/* Liquid Glass Master Container */}
              <div className="relative w-full overflow-hidden rounded-xl border border-white/60 bg-white/85 shadow-[0_20px_50px_rgba(0,0,0,0.05)] backdrop-blur-[40px]">
                {/* Specular Highlight Top Edge */}
                <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-white/80 via-white/50 to-transparent" />

                <div className="gap-grid-gutter p-card-padding grid grid-cols-1 lg:grid-cols-12">
                  {/* LEFT SIDEBAR: User ID & Navigation */}
                  <AccountSidebar
                    userProfile={userProfile}
                    accountTab={accountTab}
                    setAccountTab={setAccountTab}
                    ordersCount={orders.length}
                    handleLogout={handleLogout}
                    onNavigate={onNavigate}
                  />

                  {/* RIGHT MAIN PANEL: Dynamic Content Section */}
                  <div className="mt-8 lg:col-span-8 lg:mt-0 pr-1">
                    <AnimatePresence mode="wait">
                      {accountTab === "profile" && (
                        <motion.div
                          key="profile-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TabProfile
                            userProfile={userProfile}
                            setUserProfile={setUserProfile}
                          />
                        </motion.div>
                      )}

                      {accountTab === "orders" && (
                        <motion.div
                          key="orders-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                        >
                          <TabOrders orders={orders} onNavigate={onNavigate} onAddToCart={onAddToCart} />
                        </motion.div>
                      )}

                      {accountTab === "devices" && (
                        <motion.div
                          key="devices-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          <TabDevices
                            devices={devices}
                            isLoading={isLoadingDevices}
                          />
                        </motion.div>
                      )}

                      {accountTab === "security" && (
                        <motion.div
                          key="security-tab"
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -10 }}
                          transition={{ duration: 0.3 }}
                          className="w-full"
                        >
                          <TabSecurity userProfile={userProfile} />
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
