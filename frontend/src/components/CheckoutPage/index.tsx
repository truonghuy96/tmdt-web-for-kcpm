import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { CartItem } from '../../types';
import { getCheckoutPaymentStatus, submitCheckoutOrder, getVouchers } from '../../services/api';
import { Gift, Info } from 'lucide-react';
import { showSuccess, showError, showWarning } from '../../utils/toast';

import CheckoutForm from './CheckoutForm';
import CheckoutProcessing from './CheckoutProcessing';
import CheckoutSuccess from './CheckoutSuccess';

interface CheckoutPageProps {
  cart: CartItem[];
  onQuantityChange: (productId: string, delta: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onNavigate: (tab: any) => void;
  isLoggedIn?: boolean;
  userProfile?: any;
}

type PaymentMethodType = 'bank' | 'cod' | 'momo' | 'vnpay';
type DeliveryMethodType = 'standard' | 'express';

export default function CheckoutPage({
  cart,
  onClearCart,
  onNavigate,
  isLoggedIn = false,
  userProfile
}: CheckoutPageProps) {
  const [showGuestNotice, setShowGuestNotice] = useState(!isLoggedIn);
  // Steps: 'form' | 'processing' | 'success'
  const [step, setStep] = useState<'form' | 'processing' | 'success'>('form');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethodType>('bank');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethodType>('standard');
  const [serverOrderId, setServerOrderId] = useState<number | string | null>(null);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const [apiError, setApiError] = useState<string>('');
  const [paymentStatusMessage, setPaymentStatusMessage] = useState<string>('');
  const [isCheckingPayment, setIsCheckingPayment] = useState(false);
  
  // Snapshots for CheckoutSuccess view so global cart can be cleared immediately
  const [completedCart, setCompletedCart] = useState<CartItem[]>([]);
  const [completedTotals, setCompletedTotals] = useState({
    subtotal: 0,
    discountAmount: 0,
    deliveryFee: 0,
    finalTotal: 0
  });
  
  // Checkout Input States initialized from userProfile if available
  const [fullName, setFullName] = useState(userProfile?.name || '');
  const [phone, setPhone] = useState(userProfile?.phone || '');
  const [email, setEmail] = useState(userProfile?.email || '');
  const [address, setAddress] = useState(userProfile?.address || '');
  const [notes, setNotes] = useState('');

  // Keep the inputs in sync with user profile changes (e.g. after editing in TabProfile)
  useEffect(() => {
    if (userProfile) {
      if (userProfile.name) setFullName(userProfile.name);
      if (userProfile.phone) setPhone(userProfile.phone);
      if (userProfile.email) setEmail(userProfile.email);
      if (userProfile.address) setAddress(userProfile.address);
    }
  }, [userProfile]);
  
  // Promo code
  const [promoCode, setPromoCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<number>(0);
  const [promoError, setPromoError] = useState('');
  const [promoSuccess, setPromoSuccess] = useState('');
  const [backendPromos, setBackendPromos] = useState<any[]>([]);

  // Fetch promos from database
  useEffect(() => {
    getVouchers().then(res => {
      if (res.success && res.promos) {
        setBackendPromos(res.promos);
      }
    }).catch(err => {
      console.error("Lỗi khi fetch vouchers từ db:", err);
    });
  }, []);

  // Check URL query parameters for orderId to view past receipt/payment details
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const orderIdParam = params.get('orderId');
    if (orderIdParam) {
      setStep('processing');
      getCheckoutPaymentStatus(orderIdParam).then(res => {
        if (res.success && res.order) {
          const ord = res.order;
          setServerOrderId(ord.orderId);
          setFullName(ord.fullName);
          setPhone(ord.phone);
          setEmail(ord.email);
          setAddress(ord.address);
          setNotes(ord.notes);
          
          // Set delivery method to match the order
          const ordDel = ord.deliveryMethod || '';
          setDeliveryMethod(ordDel.toLowerCase().includes('express') ? 'express' : 'standard');

          // Map items to match CartItem structure
          const mappedItems: CartItem[] = (ord.cart || []).map((c: any) => ({
            product: {
              id: c.product?.id || c.product?._id || String(Math.random()),
              name: c.product?.name || c.product_name || 'Sản phẩm',
              price: c.product?.price || c.product_price || 0,
              image: c.product?.image || c.image || '',
              category: c.product?.category || 'Thiết bị',
              specs: c.product?.specs || [],
              colors: c.product?.colors || [],
              averageRating: c.product?.averageRating || 0,
              reviewCount: c.product?.reviewCount || 0
            },
            quantity: c.quantity || 1
          }));
          setCompletedCart(mappedItems);

          // Calculate subtotal, fee, discount
          const sub = mappedItems.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
          const finalValStr = String(ord.finalTotal || '0₫');
          const final = parseInt(finalValStr.replace(/\D/g, ''), 10) || 0;
          const fee = ordDel.toLowerCase().includes('express') ? 120000 : 0;
          const disc = sub + fee - final;
          
          setCompletedTotals({
            subtotal: sub,
            discountAmount: disc > 0 ? disc : 0,
            deliveryFee: fee,
            finalTotal: final
          });

          // Set payment details
          setPaymentDetails(res.payment || {
            provider: ord.paymentProvider,
            status: ord.paymentStatus,
            statusLabel: ord.paymentStatusLabel,
            reference: ord.paymentReference,
            note: ord.paymentNote,
            paymentUrl: ord.paymentUrl
          });
          
          setStep('success');
        } else {
          setApiError(res.message || 'Không thể tải thông tin đơn hàng.');
          setStep('form');
        }
      }).catch(err => {
        console.error('Lỗi khi fetch thông tin đơn hàng:', err);
        setApiError('Lỗi kết nối khi tải đơn hàng.');
        setStep('form');
      });
    }
  }, []);


  // Calculations
  const subtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  const deliveryFee = deliveryMethod === 'express' ? 120000 : 0;
  const discountAmount = subtotal * appliedDiscount;
  const finalTotal = subtotal + deliveryFee - discountAmount;

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    setPromoError('');
    setPromoSuccess('');
    const code = promoCode.trim().toUpperCase();

    // Kết hợp mã từ database/localStorage
    let localPromos = [...backendPromos];
    
    try {
      const saved = localStorage.getItem('techvie_promos');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Tránh trùng lặp mã đã có từ db
          parsed.forEach((p: any) => {
            if (!localPromos.some((bp: any) => bp.code.toUpperCase() === p.code.toUpperCase())) {
              localPromos.push(p);
            }
          });
        }
      }
    } catch (err) {
      console.error(err);
    }

    // Nếu trống hoàn toàn, sử dụng các giá trị mặc định làm phương án dự phòng
    if (localPromos.length === 0) {
      localPromos = [
        { code: 'TECHVIE2026', discount: 0.1, description: 'Giảm giá ra mắt sản phẩm 10%', isActive: true },
        { code: 'FUTURE', discount: 0.1, description: 'Đặc quyền tương lai 10%', isActive: true },
        { code: 'VIPLAB', discount: 0.25, description: 'Siêu đặc quyền từ TechVie Lab 25%', isActive: true, minOrderVal: 30000000 }
      ];
    }

    const foundPromo = localPromos.find((p: any) => p.code.toUpperCase() === code);

    if (foundPromo) {
      if (!foundPromo.isActive) {
        setPromoError('Mã ưu đãi này hiện đã tạm dừng hoạt động.');
        return;
      }
      if (foundPromo.minOrderVal && subtotal < foundPromo.minOrderVal) {
        setPromoError(`Mã giảm giá này yêu cầu đơn hàng tối thiểu từ ${foundPromo.minOrderVal.toLocaleString('vi-VN')}₫`);
        return;
      }
      setAppliedDiscount(foundPromo.discount);
      setPromoSuccess(`Áp dụng thành công: ${foundPromo.description || `Giảm ${(foundPromo.discount * 100).toFixed(0)}%`}`);
    } else {
      setPromoError('Mã ưu đãi không chính xác hoặc đã hết hạn.');
    }
  };

  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    // Kiểm tra số điện thoại không chứa chữ cái
    const containsLetters = /[a-zA-ZÀ-ỹ]/.test(phone);
    if (containsLetters) {
      setApiError('Số điện thoại liên hệ không hợp lệ. Vui lòng nhập đúng số điện thoại (không được chứa chữ cái).');
      return;
    }
    
    setStep('processing');
    setApiError('');
    
    try {
      const data = await submitCheckoutOrder({
        fullName,
        phone,
        email,
        address,
        notes,
        paymentMethod,
        deliveryMethod,
        cart,
        finalTotal: finalTotal.toString()
      });

      // Trì hoãn xử lý màn hình 1.5 giây để hiệu ứng load động mượt mà, chân thực
      setTimeout(() => {
        if (data.success && data.orderId) {
          setServerOrderId(data.orderId);
          setPaymentDetails(data.payment || data.order || null);
          
          // Save snapshots of values
          setCompletedCart([...cart]);
          setCompletedTotals({
            subtotal,
            discountAmount,
            deliveryFee,
            finalTotal
          });
          
          // Clear the global cart immediately
          onClearCart();
          
          setStep('success');
        } else {
          setApiError(data.message || 'Lỗi hệ thống khi khởi tạo bưu kiện đơn hàng.');
          setStep('form');
        }
      }, 1500);

    } catch (err: any) {
      setTimeout(() => {
        setApiError('Không thể kết nối đến máy chủ trực tuyến. Vui lòng kiểm tra lại đường truyền mạng.');
        setStep('form');
      }, 1500);
    }
  };

  const handleFinishSuccess = () => {
    onClearCart();
    onNavigate('home');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleRefreshPaymentStatus = async () => {
    if (!serverOrderId) return;

    setIsCheckingPayment(true);
    setPaymentStatusMessage('');

    const data = await getCheckoutPaymentStatus(serverOrderId);

    if (data.success) {
      setPaymentDetails(data.payment || data.order || paymentDetails);
      const status = data.payment?.status || data.order?.paymentStatus;
      if (status === 'paid') {
        console.log('Admin đã xác nhận. Đơn hàng đã thanh toán thành công.');
        showSuccess('Thanh toán thành công! Đơn hàng đã được xác nhận.');
      } else if (status === 'failed') {
        console.log('Thanh toán đang được đánh dấu lỗi. Vui lòng liên hệ cửa hàng để kiểm tra.');
        showError('Giao dịch thanh toán bị lỗi hoặc thất bại.');
      } else {
        console.log('Đơn hàng vẫn đang chờ admin đối soát giao dịch.');
        showWarning('Hệ thống vẫn đang chờ nhận được thanh toán chuyển khoản.');
      }
    } else {
      console.log(data.message || 'Không thể kiểm tra trạng thái thanh toán lúc này.');
      showError(data.message || 'Không thể kết nối đến máy chủ để kiểm tra.');
    }

    setIsCheckingPayment(false);
  };

  if (cart.length === 0 && step !== 'success') {
    return (
      <div className="max-w-4xl mx-auto px-6 py-20 text-center flex flex-col items-center">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-6"
        >
          <div className="w-16 h-16 rounded-full bg-indigo-50 text-indigo-500 flex items-center justify-center mx-auto">
            <Gift size={28} />
          </div>
          <h2 className="text-2xl font-black text-gray-900 tracking-tight uppercase">Giỏ hàng của bạn đang trống</h2>
          <p className="text-sm text-gray-500 font-sans leading-relaxed max-w-md mx-auto">
            Bạn chưa chọn mẫu laptop, điện thoại hay phụ kiện TechVie nào vào giỏ. Hãy tham khảo và mua sắm sản phẩm trước.
          </p>
          <button 
            onClick={() => onNavigate('products')}
            className="inline-flex items-center gap-2 bg-black hover:bg-gray-900 text-white font-sans text-xs uppercase tracking-widest font-black px-8 py-4 rounded-xl transition-all shadow-md active:scale-95"
          >
            Quay lại sảnh sản phẩm
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-8 md:py-12 relative">
      <AnimatePresence>
        {showGuestNotice && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[100] flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 15 }}
              className="bg-white/90 backdrop-blur-[30px] border border-white/60 rounded-2xl shadow-2xl max-w-md w-full p-8 relative overflow-hidden text-center animate-in"
            >
              {/* Specular Highlight Top Edge */}
              <div className="absolute top-0 inset-x-0 h-[1px] bg-gradient-to-r from-white/80 via-white/50 to-transparent" />
              
              <div className="w-16 h-16 bg-[#2d3748] text-white rounded-2xl flex items-center justify-center mx-auto shadow-md mb-6">
                <Info size={32} className="animate-pulse" />
              </div>

              <h3 className="font-sans font-black text-xl text-gray-955 uppercase tracking-wide mb-3">
                THÔNG BÁO KHÁCH VÃNG LAI
              </h3>
              <p className="text-xs text-gray-655 font-sans leading-relaxed mb-6">
                Bạn đang chuẩn bị đặt mua các thiết bị cao cấp của TechVie dưới tư cách <strong>Khách vãng lai</strong>. 
                Hãy đăng nhập hoặc đăng ký tài khoản TechVie ID để hưởng đặc quyền thành viên Premium, tự động điền thông tin giao nhận và nhận bảo hộ bảo hành tối đa.
              </p>

              <div className="space-y-3">
                <button
                  type="button"
                  onClick={() => {
                    onNavigate('account');
                  }}
                  className="w-full bg-black text-white hover:bg-gray-800 py-3.5 rounded-xl font-sans text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer block text-center"
                >
                  ĐĂNG NHẬP HOẶC ĐĂNG KÝ
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestNotice(false)}
                  className="w-full bg-white/50 hover:bg-white text-[#2d3748] border border-gray-200/50 py-3 rounded-xl font-sans text-xs uppercase tracking-widest font-black transition-all active:scale-95 cursor-pointer block text-center"
                >
                  TIẾP TỤC VỚI TƯ CÁCH KHÁCH
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {step === 'form' && (
          <motion.div
            key="checkout-step-form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <CheckoutForm
              cart={cart}
              fullName={fullName}
              setFullName={setFullName}
              phone={phone}
              setPhone={setPhone}
              email={email}
              setEmail={setEmail}
              address={address}
              setAddress={setAddress}
              notes={notes}
              setNotes={setNotes}
              paymentMethod={paymentMethod}
              setPaymentMethod={setPaymentMethod}
              deliveryMethod={deliveryMethod}
              setDeliveryMethod={setDeliveryMethod}
              promoCode={promoCode}
              setPromoCode={setPromoCode}
              appliedDiscount={appliedDiscount}
              promoError={promoError}
              promoSuccess={promoSuccess}
              handleApplyPromo={handleApplyPromo}
              subtotal={subtotal}
              deliveryFee={deliveryFee}
              discountAmount={discountAmount}
              finalTotal={finalTotal}
              apiError={apiError}
              onSubmit={handleCheckoutSubmit}
              onNavigate={onNavigate}
            />
          </motion.div>
        )}

        {step === 'processing' && (
          <CheckoutProcessing />
        )}

        {step === 'success' && (
          <CheckoutSuccess
            email={email}
            serverOrderId={serverOrderId}
            paymentDetails={paymentDetails}
            fullName={fullName}
            phone={phone}
            address={address}
            deliveryMethod={deliveryMethod}
            cart={completedCart}
            subtotal={completedTotals.subtotal}
            appliedDiscount={appliedDiscount}
            discountAmount={completedTotals.discountAmount}
            deliveryFee={completedTotals.deliveryFee}
            finalTotal={completedTotals.finalTotal}
            onFinish={handleFinishSuccess}
            onRefreshPaymentStatus={handleRefreshPaymentStatus}
            isCheckingPayment={isCheckingPayment}
            paymentStatusMessage={paymentStatusMessage}
            onNavigate={onNavigate}
          />
        )}
      </AnimatePresence>
    </div>
  );
}