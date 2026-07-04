"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  ShoppingBag, Trash2, ArrowRight, X, MessageCircle, Mail, Lock, 
  Eye, EyeOff, Check, Loader2, User 
} from 'lucide-react';
import Link from 'next/link';

export default function CartPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Cart state
  const [cart, setCart] = useState([]);
  const [showCheckout, setShowCheckout] = useState(false);
  const [paymentStep, setPaymentStep] = useState('info'); // 'info', 'success'
  const [shippingInfo, setShippingInfo] = useState({ name: '', phone: '', address: '' });
  const [isProcessing, setIsProcessing] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [specialInstructionsText, setSpecialInstructionsText] = useState('');
  const [specialInstructionsFiles, setSpecialInstructionsFiles] = useState([]);

  // Guest login states
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authErrorMsg, setAuthErrorMsg] = useState('');
  const [authSuccessMsg, setAuthSuccessMsg] = useState('');
  const [submittingAuth, setSubmittingAuth] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    // Read cart
    const loadedCart = JSON.parse(localStorage.getItem('ssv_cart') || '[]');
    setCart(loadedCart);
    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
        } else {
          setUser(null);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    setUser(session?.user || null);
    setAuthLoading(false);
  };

  useEffect(() => {
    if (user) {
      setShippingInfo(prev => ({
        ...prev,
        name: user.user_metadata?.full_name || prev.name || '',
        phone: user.user_metadata?.phone || prev.phone || ''
      }));
    }
  }, [user]);

  // Cart actions
  const updateQuantity = (index, delta) => {
    const newCart = cart.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setCart(newCart);
    localStorage.setItem('ssv_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const removeItem = (index) => {
    const newCart = [...cart];
    newCart.splice(index, 1);
    setCart(newCart);
    localStorage.setItem('ssv_cart', JSON.stringify(newCart));
    window.dispatchEvent(new Event('cartUpdated'));
  };

  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Special instructions file upload
  const handleSpecialFilesUpload = (e) => {
    const files = Array.from(e.target.files || e.dataTransfer?.files || []);
    const filePromises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          resolve({
            name: file.name,
            type: file.type,
            size: file.size,
            base64: reader.result
          });
        };
        reader.readAsDataURL(file);
      });
    });

    Promise.all(filePromises).then(processedFiles => {
      setSpecialInstructionsFiles(prev => [...prev, ...processedFiles]);
    });
  };

  const removeSpecialFile = (index) => {
    setSpecialInstructionsFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleCheckoutWhatsApp = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    
    const userEmail = user?.email || '';
    
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: shippingInfo.name || "Walk-in Customer",
          customer_phone: shippingInfo.phone || "",
          customer_email: userEmail,
          customer_address: shippingInfo.address || "",
          items: cart,
          total_price: calculateTotal(),
          status: 'pending',
          payment_method: 'whatsapp',
          payment_status: 'pending',
          special_instructions: specialInstructionsText,
          special_files: specialInstructionsFiles
        })
      });
      if (res.ok) {
        const savedOrder = await res.json();
        setCreatedOrder(savedOrder);
        
        // Clear cart
        localStorage.removeItem('ssv_cart');
        setCart([]);
        window.dispatchEvent(new Event('cartUpdated'));
        setPaymentStep('success');
      }
    } catch (err) {
      console.error("Error creating order:", err);
    } finally {
      setIsProcessing(false);
    }
  };

  // Guest Auth Handlers
  const getProcessedEmail = (input) => {
    const stripped = input.replace(/\D/g, '');
    if (stripped.length >= 10 && !input.includes('@')) {
      return `${stripped}@phone.ssvstore.com`;
    }
    return input;
  };

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setSubmittingAuth(true);
    setAuthErrorMsg('');
    setAuthSuccessMsg('');

    const processedEmail = getProcessedEmail(email);

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({
          email: processedEmail,
          password,
        });
        if (error) throw error;
      } else {
        const { error, data } = await supabase.auth.signUp({
          email: processedEmail,
          password,
        });
        if (error) throw error;

        if (data?.user?.identities?.length === 0) {
          setAuthErrorMsg("Account already exists with this email or mobile.");
        } else {
          if (data?.user) {
            await supabase.from('customers').insert({
              auth_id: data.user.id,
              email: processedEmail
            });
          }
          setAuthSuccessMsg("Account created! You are now logged in.");
        }
      }
    } catch (err) {
      setAuthErrorMsg(err.message || 'An error occurred.');
    } finally {
      setSubmittingAuth(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      await supabase.auth.signInWithOAuth({
        provider,
        options: { redirectTo: window.location.href }
      });
    } catch (err) {
      setAuthErrorMsg(err.message || 'Failed OAuth login');
    }
  };

  const renderInlineAuth = () => {
    return (
      <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 shadow-sm space-y-4">
        <div className="text-center">
          <h4 className="font-bold text-sm text-[#2C1F1F]">
            {isLogin ? 'Sign In to Checkout' : 'Create Account to Checkout'}
          </h4>
          <p className="text-xs text-[#6E6262] mt-0.5">Please authenticate to finalise your order.</p>
        </div>

        {authErrorMsg && <div className="text-xs font-semibold text-rose-600 bg-rose-50 border border-rose-100 p-2 rounded-lg">{authErrorMsg}</div>}
        {authSuccessMsg && <div className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-100 p-2 rounded-lg">{authSuccessMsg}</div>}

        <form onSubmit={handleAuthSubmit} className="space-y-3" autoComplete="off">
          {/* Dummy hidden inputs to hijack browser password autofill */}
          <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
          <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

          <input 
            type="text"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email or 10-digit Mobile"
            className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs font-mono text-[#2C1F1F] focus:bg-white outline-none focus:border-[#C5A028]"
          />
          <input 
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full px-3 py-2 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs text-[#2C1F1F] focus:bg-white outline-none focus:border-[#C5A028]"
            autoComplete="new-password"
          />
          <button 
            type="submit"
            disabled={submittingAuth}
            className="w-full py-2.5 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-xs rounded-xl transition disabled:opacity-60 flex items-center justify-center gap-1.5"
          >
            {submittingAuth ? 'Please wait...' : (isLogin ? 'Log In' : 'Sign Up')}
            {!submittingAuth && <ArrowRight className="w-3.5 h-3.5" />}
          </button>
        </form>

        <div className="flex items-center gap-2 justify-center text-xs">
          <span className="text-[#8C7E7E]">{isLogin ? "New user?" : "Existing account?"}</span>
          <button 
            onClick={() => { setIsLogin(!isLogin); setAuthErrorMsg(''); setAuthSuccessMsg(''); }}
            className="font-bold text-[#C5A028] hover:underline"
          >
            {isLogin ? 'Sign Up' : 'Log In'}
          </button>
        </div>

        <div className="relative my-2">
          <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2DDD5]"></div></div>
          <div className="relative flex justify-center text-[10px]"><span className="px-2 bg-white text-[#8C7E7E]">OR</span></div>
        </div>

        <button 
          onClick={() => handleOAuthLogin('google')}
          className="w-full flex items-center justify-center gap-2 py-2 bg-white border border-[#E2DDD5] hover:bg-[#FAF9F5] text-[#2C1F1F] font-bold text-[11px] rounded-xl transition shadow-sm"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
          Continue with Google
        </button>
      </div>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 min-h-[75vh] text-[#2C1F1F]">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">My Shopping Cart</h1>
        <p className="text-sm text-[#6E6262] mt-1">Review your items and complete your reservation request.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: Cart items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E2DDD5] shadow-sm">
              <ShoppingBag className="w-16 h-16 text-[#8C7E7E] mx-auto mb-4" />
              <h2 className="text-xl font-bold text-[#2C1F1F] mb-1">{t('cartEmpty')}</h2>
              <p className="text-[#6E6262] text-sm mb-6">{t('cartEmptyDesc')}</p>
              <Link href="/shop" className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#C5A028] text-white font-bold text-xs uppercase tracking-wider rounded-full transition hover:bg-[#A98920]">
                {t('continueShopping')} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            cart.map((item, index) => (
              <div key={`${item.id}-${index}`} className="flex gap-4 p-4 sm:p-5 bg-white border border-[#E2DDD5] rounded-2xl relative group shadow-sm">
                <div className="w-20 h-20 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-[#8C7E7E]">No Image</div>
                  )}
                </div>
                <div className="flex-1 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-[#2C1F1F] mb-0.5 text-sm">{item.name}</h3>
                      {item.variant && <p className="text-[10px] font-bold text-[#C5A028] uppercase tracking-wider mb-1">Variant: {item.variant}</p>}
                      <p className="text-xs font-mono text-[#C5A028] font-bold">₹{item.price.toLocaleString()}</p>
                    </div>
                    <button 
                      onClick={() => removeItem(index)}
                      className="text-[#8C7E7E] hover:text-red-500 transition p-1.5 bg-[#FAF9F5] border border-[#E2DDD5] rounded-full sm:opacity-0 sm:group-hover:opacity-100"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="flex items-center gap-4 mt-2 sm:mt-0">
                    <div className="flex items-center bg-[#F5F2EB] border border-[#E2DDD5] rounded-full p-0.5">
                      <button onClick={() => updateQuantity(index, -1)} className="w-6 h-6 flex items-center justify-center text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#E2DDD5] rounded-full transition">-</button>
                      <span className="w-6 text-center text-xs text-[#2C1F1F] font-mono">{item.quantity}</span>
                      <button onClick={() => updateQuantity(index, 1)} className="w-6 h-6 flex items-center justify-center text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#E2DDD5] rounded-full transition">+</button>
                    </div>
                    <span className="text-xs text-[#6E6262]">
                      Subtotal: <span className="text-[#2C1F1F] font-mono font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Right Column: Checkout summary */}
        <div className="lg:col-span-1">
          {cart.length > 0 && (
            <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-sm space-y-6">
              <h3 className="text-lg font-bold">{t('orderSummary')}</h3>
              
              <div className="space-y-4 text-xs sm:text-sm border-b border-[#E2DDD5] pb-4">
                <div className="flex justify-between text-[#6E6262]">
                  <span>Subtotal ({cart.reduce((a,b)=>a+b.quantity,0)} items)</span>
                  <span className="text-[#2C1F1F] font-mono font-bold">₹{calculateTotal().toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[#6E6262]">
                  <span>Shipping</span>
                  <span className="text-green-600 font-semibold">{t('calculatedWhatsApp')}</span>
                </div>
                <div className="border-t border-[#E2DDD5] pt-4 flex justify-between items-center">
                  <span className="font-bold">Total</span>
                  <span className="text-xl font-mono text-[#C5A028] font-bold">₹{calculateTotal().toLocaleString()}</span>
                </div>
              </div>

              {user ? (
                <button 
                  onClick={() => { setShowCheckout(true); setPaymentStep('info'); }}
                  className="w-full py-3.5 bg-[#C5A028] text-white font-bold text-xs uppercase tracking-wider rounded-full transition hover:bg-[#A98920] shadow-md shadow-[#C5A028]/10 flex items-center justify-center gap-2"
                >
                  Proceed to Checkout <ArrowRight className="w-4 h-4" />
                </button>
              ) : (
                <div className="space-y-4">
                  <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl text-center">
                    <h4 className="font-bold text-amber-800 text-xs mb-1">Account Required</h4>
                    <p className="text-amber-700 text-[11px] leading-relaxed">Sign in or create an account inline to proceed to checkout.</p>
                  </div>
                  {renderInlineAuth()}
                </div>
              )}
            </div>
          )}
        </div>

      </div>

      {/* CHECKOUT MODAL */}
      {showCheckout && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border border-[#E2DDD5] w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[95vh] text-[#2C1F1F] animate-in zoom-in-95 duration-200">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2DDD5] bg-[#FAF9F5] shrink-0">
              <h3 className="text-base sm:text-lg font-bold text-[#2C1F1F]">
                {paymentStep === 'info' && "Checkout - Delivery Details"}
                {paymentStep === 'success' && "Order Confirmed!"}
              </h3>
              {paymentStep !== 'success' && (
                <button 
                  onClick={() => setShowCheckout(false)} 
                  className="p-1.5 text-[#8C7E7E] hover:text-[#2C1F1F] transition rounded-lg hover:bg-black/5"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {paymentStep === 'info' && (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6E6262]">Full Name *</label>
                    <input 
                      type="text" 
                      required
                      value={shippingInfo.name} 
                      onChange={(e) => setShippingInfo({...shippingInfo, name: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-white border border-[#E2DDD5] rounded-xl text-sm focus:border-[#C5A028] outline-none" 
                      placeholder="e.g. Dinesh Pokle"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6E6262]">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={shippingInfo.phone} 
                      onChange={(e) => setShippingInfo({...shippingInfo, phone: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-white border border-[#E2DDD5] rounded-xl text-sm focus:border-[#C5A028] outline-none font-mono" 
                      placeholder="e.g. 9821360536"
                    />
                  </div>
                  
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-[#6E6262]">Full Address (Optional)</label>
                    <textarea 
                      rows="2"
                      value={shippingInfo.address} 
                      onChange={(e) => setShippingInfo({...shippingInfo, address: e.target.value})} 
                      className="w-full px-4 py-2.5 bg-white border border-[#E2DDD5] rounded-xl text-sm focus:border-[#C5A028] outline-none resize-none" 
                      placeholder="Street address, area, pin code..."
                    />
                  </div>

                  <div className="space-y-4 pt-4 border-t border-[#E2DDD5]">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Special instructions</h4>
                    <textarea 
                      rows="2"
                      value={specialInstructionsText} 
                      onChange={(e) => setSpecialInstructionsText(e.target.value)} 
                      className="w-full px-4 py-2.5 bg-white border border-[#E2DDD5] rounded-xl text-sm focus:border-[#C5A028] outline-none resize-none" 
                      placeholder="Instructions or customization requests..."
                    />
                    
                    <div className="space-y-2">
                      <label className="block text-xs font-semibold text-[#6E6262]">Upload References (Optional)</label>
                      <div className="border-2 border-dashed border-[#E2DDD5] hover:border-[#C5A028]/55 transition rounded-xl p-5 text-center cursor-pointer relative bg-white">
                        <input type="file" multiple onChange={handleSpecialFilesUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                        <p className="text-xs font-medium text-[#6E6262]">Click to upload design layout files</p>
                      </div>
                      {specialInstructionsFiles.length > 0 && (
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {specialInstructionsFiles.map((file, idx) => (
                            <div key={idx} className="flex items-center justify-between p-2 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs">
                              <span className="font-semibold truncate text-[#2C1F1F] pr-4">{file.name}</span>
                              <button onClick={() => removeSpecialFile(idx)} className="text-rose-500 hover:text-rose-700 font-bold shrink-0 px-1">Remove</button>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Payment Option</h4>
                    <div className="flex items-start gap-4 p-4 border border-[#C5A028] bg-[#C5A028]/5 rounded-2xl">
                      <div className="mt-1 p-2 rounded-lg bg-[#25D366]/10 text-[#25D366]"><MessageCircle className="w-5 h-5" /></div>
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[#2C1F1F]">Pay via WhatsApp</div>
                        <div className="text-xs text-[#6E6262]">Final bill discussed on WhatsApp. Pay on delivery/UPI.</div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-6 text-center space-y-6">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-600 flex items-center justify-center mx-auto shadow-sm">
                    <Check className="w-8 h-8" />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className="text-2xl font-bold text-[#2C1F1F]">Order Placed Successfully!</h4>
                    <p className="text-sm text-green-600 font-bold uppercase tracking-wider">WhatsApp Confirmation Pending</p>
                    {createdOrder && (
                      <div className="text-sm font-mono bg-white border border-[#E2DDD5] py-2 px-4 rounded-lg inline-block text-[#2C1F1F] font-bold shadow-sm">
                        Order ID: {createdOrder.id}
                      </div>
                    )}
                  </div>

                  <p className="text-sm text-[#6E6262] max-w-sm mx-auto">
                    Your order request was stored. Reach us on WhatsApp to finalize invoice details and shipping costs.
                  </p>

                  <div className="bg-white border border-[#E2DDD5] rounded-2xl p-5 mx-auto max-w-sm space-y-4 shadow-sm text-center">
                    <h5 className="font-bold text-[#2C1F1F] text-xs uppercase tracking-wider">Direct GPay / UPI Payment</h5>
                    <img src="/upi-qr.jpg" alt="UPI QR Code" className="w-40 h-40 mx-auto rounded-xl border border-[#E2DDD5] object-contain p-2" />
                    <div className="text-sm font-mono text-[#6E6262]">UPI ID: yashpokle1234@oksbi</div>
                    <div className="text-xs font-bold bg-[#FAF9F5] py-2 rounded-lg text-[#2C1F1F] border border-[#E2DDD5]">
                      Phone / GPay: <span className="font-mono text-[#C5A028]">8591223874</span>
                    </div>
                  </div>

                  <div className="border-t border-[#E2DDD5] pt-6 flex flex-col sm:flex-row gap-3 justify-center">
                    <button 
                      onClick={() => {
                        let text = `Hello! I just placed an order.\n\n*Order ID:* ${createdOrder?.id || 'Pending'}\n*Payment Method:* WHATSAPP\n*Payment Status:* PENDING\n\n*Items:*`;
                        if (createdOrder && createdOrder.items) {
                          createdOrder.items.forEach(item => {
                            text += `\n- ${item.quantity}x ${item.name} (₹${item.price.toLocaleString()})`;
                          });
                          if (createdOrder.special_instructions) {
                            text += `\n\n*Instructions:* ${createdOrder.special_instructions}`;
                          }
                          text += `\n\n*Total:* ₹${createdOrder.total_price.toLocaleString()}`;
                        }
                        window.open(`https://wa.me/918591223874?text=${encodeURIComponent(text)}`, '_blank');
                      }}
                      className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-sm font-bold rounded-full transition shadow-sm animate-bounce"
                    >
                      <MessageCircle className="w-4.5 h-4.5" /> Direct Message on WhatsApp
                    </button>
                    <button 
                      onClick={() => setShowCheckout(false)}
                      className="px-6 py-3 bg-white border border-[#E2DDD5] text-sm text-[#6E6262] font-semibold rounded-full hover:bg-black/5 transition"
                    >
                      Continue
                    </button>
                  </div>
                </div>
              )}
            </div>

            {paymentStep !== 'success' && (
              <div className="px-6 py-4 border-t border-[#E2DDD5] bg-[#FAF9F5] flex justify-end gap-3 shrink-0">
                <button onClick={() => setShowCheckout(false)} className="px-5 py-2.5 bg-white border border-[#E2DDD5] text-xs font-semibold rounded-xl text-[#6E6262] hover:bg-black/5 transition">Cancel</button>
                <button 
                  disabled={isProcessing}
                  onClick={() => {
                    if (!shippingInfo.name || !shippingInfo.phone) {
                      alert("Please fill out your Name and Phone Number.");
                      return;
                    }
                    handleCheckoutWhatsApp();
                  }} 
                  className="px-6 py-2.5 bg-[#C5A028] hover:bg-[#A98920] text-white text-xs font-bold rounded-xl transition disabled:opacity-50 flex items-center gap-1.5"
                >
                  {isProcessing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Processing...</> : "Confirm via WhatsApp"}
                </button>
              </div>
            )}

          </div>
        </div>
      )}
    </div>
  );
}
