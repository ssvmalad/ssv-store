"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useLanguage } from '@/lib/LanguageContext';
import { 
  User, Mail, Lock, ArrowRight, LogOut, Package, Save, ExternalLink, 
  Eye, EyeOff, MessageCircle, Check, Loader2, X, ClipboardList, Wrench, Truck, ChevronRight, Heart, Trash2, ShoppingCart, BookOpen, MapPin
} from 'lucide-react';
import Link from 'next/link';

export default function AccountPage() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Tabs selector
  const [activeTab, setActiveTab] = useState('orders'); // 'orders', 'wishlist', 'classes', 'profile'

  // Wishlist Tab State
  const [wishlistProducts, setWishlistProducts] = useState([]);
  const [wishlistLoading, setWishlistLoading] = useState(false);

  // Classes Tab State
  const [classesData, setClassesData] = useState(null);
  const [classesLoading, setClassesLoading] = useState(false);

  const fetchClassesData = async () => {
    setClassesLoading(true);
    try {
      const res = await fetch('/api/classes');
      if (res.ok) {
        const data = await res.json();
        setClassesData(data);
      }
    } catch (err) {
      console.error("Failed to fetch classes:", err);
    } finally {
      setClassesLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'classes') {
      fetchClassesData();
    }
  }, [activeTab]);

  const fetchWishlistProducts = async () => {
    setWishlistLoading(true);
    try {
      const savedIds = JSON.parse(localStorage.getItem('ssv_wishlist') || '[]');
      if (savedIds.length === 0) {
        setWishlistProducts([]);
        setWishlistLoading(false);
        return;
      }
      
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .in('id', savedIds);
        
      if (!error && data) {
        setWishlistProducts(data);
      }
    } catch (err) {
      console.error("Failed to load wishlist products:", err);
    } finally {
      setWishlistLoading(false);
    }
  };

  const handleRemoveFromWishlist = (productId) => {
    const savedIds = JSON.parse(localStorage.getItem('ssv_wishlist') || '[]');
    const updated = savedIds.filter(id => id !== productId);
    localStorage.setItem('ssv_wishlist', JSON.stringify(updated));
    setWishlistProducts(prev => prev.filter(p => p.id !== productId));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  useEffect(() => {
    if (activeTab === 'wishlist') {
      fetchWishlistProducts();
    }
  }, [activeTab]);

  // Auth panel inline states
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [whatsappResetPhone, setWhatsappResetPhone] = useState('');

  // Profile data states
  const [profilePhone, setProfilePhone] = useState('');
  const [savingPhone, setSavingPhone] = useState(false);

  // Orders, Repairs & Deliveries history state
  const [unifiedItems, setUnifiedItems] = useState([]);
  const [itemsLoading, setItemsLoading] = useState(false);
  const [selectedRepair, setSelectedRepair] = useState(null);
  const [deliveries, setDeliveries] = useState([]);

  useEffect(() => {
    // Read active tab from URL query if present
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tab = params.get('tab');
      if (tab === 'profile') {
        setActiveTab('profile');
      } else if (tab === 'orders') {
        setActiveTab('orders');
      } else if (tab === 'wishlist') {
        setActiveTab('wishlist');
      } else if (tab === 'classes') {
        setActiveTab('classes');
      }
    }

    checkUser();

    // Listen for auth state changes
    const { data: authListener } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session?.user) {
          setUser(session.user);
          syncCustomerToDb(session.user);
        } else {
          setUser(null);
          setUnifiedItems([]);
        }
      }
    );

    return () => {
      authListener?.subscription.unsubscribe();
    };
  }, []);

  const checkUser = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    const currentUser = session?.user || null;
    setUser(currentUser);
    setLoading(false);
    if (currentUser) {
      syncCustomerToDb(currentUser);
      if (currentUser.user_metadata?.phone) {
        setProfilePhone(currentUser.user_metadata.phone);
      }
      fetchOrdersAndRepairs(currentUser.user_metadata?.phone, currentUser.email);
    }
  };

  const syncCustomerToDb = async (authUser) => {
    try {
      const { data } = await supabase.from('customers').select('id').eq('auth_id', authUser.id).maybeSingle();
      if (!data) {
        const provider = authUser.app_metadata?.provider || 'email';
        await supabase.from('customers').insert({
          auth_id: authUser.id,
          email: authUser.email,
          provider: provider
        });
      }
    } catch (err) {
      console.error('Error syncing customer:', err);
    }
  };

  const fetchOrdersAndRepairs = async (phone, userEmail) => {
    setItemsLoading(true);
    try {
      // 1. Fetch Orders
      const orderQuery = new URLSearchParams();
      if (userEmail) orderQuery.append('email', userEmail);
      if (phone) orderQuery.append('phone', phone);
      
      const ordersRes = await fetch(`/api/orders?${orderQuery.toString()}`);
      let ordersList = [];
      if (ordersRes.ok) {
        ordersList = await ordersRes.json();
      }

      // 2. Fetch Repairs from Supabase
      let repairsList = [];
      if (userEmail || phone) {
        let repairQuery = supabase.from('repairs').select('*');
        if (userEmail && phone) {
          repairQuery = repairQuery.or(`customer_email.eq.${userEmail},customer_phone.eq.${phone}`);
        } else if (userEmail) {
          repairQuery = repairQuery.eq('customer_email', userEmail);
        } else if (phone) {
          repairQuery = repairQuery.eq('customer_phone', phone);
        }
        const { data, error } = await repairQuery;
        if (!error && data) {
          repairsList = data;
        }
      }

      // 3. Fetch Deliveries (for tracking)
      const deliveriesRes = await fetch('/api/deliveries');
      if (deliveriesRes.ok) {
        const delivData = await deliveriesRes.json();
        setDeliveries(delivData);
      }

      // 4. Merge and sort
      const mappedOrders = ordersList.map(o => ({
        ...o,
        itemType: 'order',
        date: new Date(o.created_at || new Date())
      }));

      const mappedRepairs = repairsList.map(r => ({
        ...r,
        itemType: 'repair',
        date: new Date(r.created_at || new Date())
      }));

      const merged = [...mappedOrders, ...mappedRepairs].sort((a, b) => b.date - a.date);
      setUnifiedItems(merged);
    } catch (err) {
      console.error("Error loading order history:", err);
    } finally {
      setItemsLoading(false);
    }
  };

  const saveProfilePhone = async () => {
    if (!profilePhone) return;
    setSavingPhone(true);
    const { data, error } = await supabase.auth.updateUser({
      data: { phone: profilePhone }
    });
    if (!error && data?.user) {
      setUser(data.user);
      await supabase.from('customers').update({ phone: profilePhone }).eq('auth_id', data.user.id);
      setSuccessMsg("Phone number updated successfully!");
      fetchOrdersAndRepairs(profilePhone, data.user.email);
      setTimeout(() => setSuccessMsg(''), 3000);
    } else {
      setErrorMsg(error?.message || "Failed to update phone number");
    }
    setSavingPhone(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  // Auth Handlers
  const getProcessedEmail = (input) => {
    const stripped = input.replace(/\D/g, '');
    if (stripped.length >= 10 && !input.includes('@')) {
      return `${stripped}@phone.ssvstore.com`;
    }
    return input;
  };

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

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
          setErrorMsg("Account already exists with this email or mobile number.");
        } else {
          if (data?.user) {
            await supabase.from('customers').insert({
              auth_id: data.user.id,
              email: processedEmail
            });
          }
          setSuccessMsg("Account created! You are now logged in.");
        }
      }
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred during authentication.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleForgotPassword = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    const processedEmail = getProcessedEmail(email);
    if (processedEmail.includes('@phone.ssvstore.com')) {
      const phoneOnly = processedEmail.replace('@phone.ssvstore.com', '');
      setWhatsappResetPhone(phoneOnly);
      setAuthLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(processedEmail, {
        redirectTo: `${window.location.origin}/account/update-password`,
      });
      if (error) throw error;
      setSuccessMsg("If this email exists, a password reset link has been sent to it.");
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleOAuthLogin = async (provider) => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: provider,
        options: {
          redirectTo: `${window.location.origin}/account`
        }
      });
      if (error) throw error;
    } catch (err) {
      setErrorMsg(err.message || `Failed to log in with ${provider}`);
    }
  };

  // Helper for delivery status lookup
  const getDeliveryForOrder = (orderId) => {
    return deliveries.find(d => d.order_id?.toUpperCase() === orderId?.toUpperCase());
  };

  const renderAuthPanel = () => {
    return (
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 sm:p-8 shadow-md relative overflow-hidden max-w-md mx-auto">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#2C1F1F] via-[#C5A028] to-[#2C1F1F]"></div>
        
        <div className="text-center mb-6 pt-2">
          <h2 className="text-2xl font-black text-[#2C1F1F] mb-1.5 tracking-tight">
            {isForgotPassword ? 'Reset Password' : isLogin ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="text-[#6E6262] text-xs leading-relaxed">
            {isForgotPassword 
              ? 'Enter email to receive a password reset link.' 
              : isLogin 
                ? 'Sign in to access your orders and profile.' 
                : 'Join us to track your orders and manage your profile.'}
          </p>
        </div>

        {!isForgotPassword && (
          <div className="flex bg-[#FAF9F5] p-1 rounded-xl mb-6 border border-[#E2DDD5]">
            <button
              onClick={() => { setIsLogin(true); setErrorMsg(''); setSuccessMsg(''); setWhatsappResetPhone(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                isLogin ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => { setIsLogin(false); setErrorMsg(''); setSuccessMsg(''); setWhatsappResetPhone(''); }}
              className={`flex-1 py-2.5 text-xs font-bold rounded-lg transition-all ${
                !isLogin ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-xl mb-4 text-xs font-medium">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-2 rounded-xl mb-4 text-xs font-medium">
            {successMsg}
          </div>
        )}

        {whatsappResetPhone ? (
          <div className="text-center space-y-4">
            <div className="bg-[#FAF9F5] border border-[#E2DDD5] p-4 rounded-xl">
              <MessageCircle className="w-10 h-10 text-[#25D366] mx-auto mb-3" />
              <h3 className="text-sm font-bold text-[#2C1F1F] mb-1">WhatsApp Action Required</h3>
              <p className="text-[#6E6262] text-xs mb-3">Verify your identity via WhatsApp.</p>
              <a 
                href={`https://wa.me/919920038891?text=${encodeURIComponent(`Hi, I forgot the password for my SSV Store account (${whatsappResetPhone}). Please help me reset it.`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full flex items-center justify-center gap-1.5 py-2.5 bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold text-xs rounded-xl transition"
              >
                Reset via WhatsApp <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
            <button 
              onClick={() => { setWhatsappResetPhone(''); setIsForgotPassword(false); }}
              className="text-xs font-bold text-[#6E6262] hover:text-[#2C1F1F] transition"
            >
              Back to Sign In
            </button>
          </div>
        ) : (
          <>
            {!isForgotPassword && (
              <div className="space-y-2 mb-4">
                <button 
                  onClick={() => handleOAuthLogin('google')}
                  className="w-full flex items-center justify-center gap-2 py-2.5 bg-white border border-[#E2DDD5] hover:bg-[#FAF9F5] text-[#2C1F1F] font-bold text-xs rounded-xl transition-all shadow-sm"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  Continue with Google
                </button>
              </div>
            )}

            {!isForgotPassword && (
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#E2DDD5]"></div></div>
                <div className="relative flex justify-center text-[10px]">
                  <span className="px-2 bg-white text-[#8C7E7E] font-medium uppercase tracking-wider">Or email login</span>
                </div>
              </div>
            )}

            <form onSubmit={isForgotPassword ? handleForgotPassword : handleAuth} className="space-y-4" autoComplete="off">
              {/* Dummy hidden inputs to hijack browser password autofill */}
              <input type="text" name="prevent_autofill_username" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />
              <input type="password" name="prevent_autofill_password" style={{ display: 'none' }} tabIndex={-1} autoComplete="off" />

              <div className="space-y-1">
                <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E7E]">Email or Mobile</label>
                <div className="relative">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09393]" />
                  <input 
                    type="text" 
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs text-[#2C1F1F] placeholder-[#A09393] focus:bg-white focus:border-[#C5A028] outline-none transition-all font-mono"
                    placeholder="yash@example.com or mobile..."
                  />
                </div>
              </div>
              
              {!isForgotPassword && (
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E7E]">Password</label>
                    {isLogin && (
                      <button 
                        type="button" 
                        onClick={() => { setIsForgotPassword(true); setErrorMsg(''); setSuccessMsg(''); }}
                        className="text-[10px] font-bold text-[#C5A028] hover:underline"
                      >
                        Forgot?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09393]" />
                    <input 
                      type={showPassword ? "text" : "password"}
                      required
                      minLength={6}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-9 pr-10 py-2.5 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-xs text-[#2C1F1F] placeholder-[#A09393] focus:bg-white focus:border-[#C5A028] outline-none transition-all font-mono"
                      placeholder="Password"
                      autoComplete="new-password"
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09393] hover:text-[#2C1F1F] transition p-1"
                    >
                      {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </button>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={authLoading}
                className="w-full py-3 bg-[#C5A028] hover:bg-[#A98920] text-white rounded-xl font-bold text-xs transition-all disabled:opacity-70 flex items-center justify-center gap-1.5"
              >
                {authLoading ? 'Please wait...' : isForgotPassword ? 'Send Reset Link' : (isLogin ? 'Sign In' : 'Create Account')}
                {!authLoading && <ArrowRight className="w-3.5 h-3.5" />}
              </button>

              {isForgotPassword && (
                <div className="text-center mt-3">
                  <button 
                    type="button"
                    onClick={() => { setIsForgotPassword(false); setErrorMsg(''); setSuccessMsg(''); setWhatsappResetPhone(''); }}
                    className="text-xs font-bold text-[#6E6262] hover:text-[#2C1F1F] transition"
                  >
                    Back to Sign In
                  </button>
                </div>
              )}
            </form>
          </>
        )}
      </div>
    );
  };

  if (loading) {
    return <div className="min-h-[60vh] flex items-center justify-center text-[#C5A028] bg-[#FDFCF7]">Loading...</div>;
  }

  if (!user) {
    return (
      <div className="max-w-md mx-auto px-4 py-16 min-h-[70vh] flex flex-col justify-center">
        {renderAuthPanel()}
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 min-h-[70vh] text-[#2C1F1F]">
      
      {/* Page Header */}
      <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">My Account</h1>
          <p className="text-sm text-[#6E6262] mt-1">
            {activeTab === 'orders' 
              ? 'Track your orders, delivery details, and instrument repairs.'
              : 'Update your account preferences and settings.'}
          </p>
        </div>
        <button 
          onClick={handleLogout}
          className="flex items-center gap-2 px-5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition border border-rose-200"
        >
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {errorMsg}
        </div>
      )}
      {successMsg && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium">
          {successMsg}
        </div>
      )}

      {/* Tabs */}
      <div className="flex bg-[#FAF9F5] p-1 rounded-2xl mb-8 border border-[#E2DDD5] max-w-lg shrink-0 font-sans flex-wrap sm:flex-nowrap gap-1">
        <button
          onClick={() => setActiveTab('orders')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'orders' ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
          }`}
        >
          <Package className="w-4 h-4" /> Orders & Repairs
        </button>
        <button
          onClick={() => setActiveTab('wishlist')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'wishlist' ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
          }`}
        >
          <Heart className="w-4 h-4 text-rose-500 fill-rose-500" /> Wishlist
        </button>
        <button
          onClick={() => setActiveTab('classes')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'classes' ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
          }`}
        >
          <BookOpen className="w-4 h-4 text-sky-500" /> Classes
        </button>
        <button
          onClick={() => setActiveTab('profile')}
          className={`flex-1 py-2 px-2.5 text-xs font-bold rounded-xl transition flex items-center justify-center gap-1.5 whitespace-nowrap ${
            activeTab === 'profile' ? 'bg-white text-[#C5A028] shadow-sm border border-[#E2DDD5]' : 'text-[#8C7E7E] hover:text-[#2C1F1F]'
          }`}
        >
          <User className="w-4 h-4" /> Settings
        </button>
      </div>

      {/* Content panes */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        
        {/* Left Column: tab-specific contents */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === 'orders' && (
            <div className="space-y-4">
              {itemsLoading ? (
                <div className="text-center py-20 text-sm text-[#C5A028] font-mono animate-pulse">LOADING DASHBOARD DETAILS...</div>
              ) : unifiedItems.length > 0 ? (
                <div className="space-y-3">
                  {unifiedItems.map((item, index) => {
                    const isRepair = item.itemType === 'repair';
                    const activeDelivery = !isRepair ? getDeliveryForOrder(item.id) : null;

                    return (
                      <div key={index} className="bg-white border border-[#E2DDD5] p-5 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div className="flex items-start gap-4">
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border shrink-0 ${isRepair ? 'bg-amber-50 border-amber-200 text-[#C5A028]' : 'bg-[#FAF9F5] border-[#E2DDD5] text-[#2C1F1F]'}`}>
                            {isRepair ? <Wrench className="w-5 h-5" /> : <Package className="w-5 h-5" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-bold font-mono text-sm">{isRepair ? `REP-${item.id}` : item.id}</span>
                              <span className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                                item.status === 'confirmed' || item.status === 'completed' || item.status === 'ready' 
                                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                                  : item.status === 'cancelled' || item.status === 'rejected'
                                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                    : 'bg-amber-50 text-amber-700 border border-amber-200'
                              }`}>
                                {item.status}
                              </span>
                            </div>
                            <p className="text-xs text-[#8C7E7E] mt-1">
                              {isRepair ? `${item.instrument_type} Repair Request` : `${item.items?.length || 0} product(s)`}
                              {" • "}{item.date.toLocaleDateString()}
                            </p>

                            {/* Integrated Delivery Details */}
                            {activeDelivery && (
                              <div className="mt-3 bg-[#FAF9F5] border border-[#E2DDD5] p-2.5 rounded-xl flex items-center gap-2 text-xs max-w-md">
                                <Truck className="w-4 h-4 text-[#C5A028] shrink-0" />
                                <div className="text-[#6E6262]">
                                  <strong>Delivery:</strong> <span className="capitalize text-[#2C1F1F] font-bold">{activeDelivery.status}</span>
                                  {activeDelivery.carrier && ` via ${activeDelivery.carrier}`}
                                  {activeDelivery.tracking_number && (
                                    <span className="block mt-0.5 text-[10px] font-mono">
                                      Tracking: <a 
                                        href={activeDelivery.carrier?.toLowerCase().includes('dtdc') ? `https://www.dtdc.in/tracking/tracking_results.asp?pinno=${activeDelivery.tracking_number}` : '#'} 
                                        target="_blank" 
                                        rel="noopener noreferrer" 
                                        className="text-[#C5A028] underline hover:text-[#A98920] font-bold"
                                      >
                                        {activeDelivery.tracking_number}
                                      </a>
                                    </span>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-col items-start md:items-end justify-between self-stretch md:self-auto shrink-0 border-t md:border-t-0 border-[#E2DDD5] pt-3 md:pt-0">
                          <div className="font-bold text-[#C5A028] text-sm">
                            {isRepair ? `Est: ₹${(item.estimated_cost || 0).toLocaleString()}` : `₹${item.total_price?.toLocaleString()}`}
                          </div>
                          
                          {isRepair ? (
                            <button 
                              onClick={() => setSelectedRepair(item)}
                              className="text-[10px] uppercase font-bold tracking-wider text-[#6E6262] hover:text-[#C5A028] flex items-center gap-1 transition mt-1.5"
                            >
                              View Specs & cost <ChevronRight className="w-3.5 h-3.5" />
                            </button>
                          ) : (
                            <Link 
                              href={`/track?id=${item.id}`}
                              className="text-[10px] uppercase font-bold tracking-wider text-[#6E6262] hover:text-[#C5A028] flex items-center gap-1 transition mt-1.5"
                            >
                              Track & Edit Order <ExternalLink className="w-3.5 h-3.5" />
                            </Link>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-20 bg-white rounded-2xl border border-[#E2DDD5] text-[#8C7E7E] text-sm">
                  No orders or repair requests found under this account.
                </div>
              )}
            </div>
          )}

          {activeTab === 'wishlist' && (
            <div className="space-y-4">
              {wishlistLoading ? (
                <div className="text-center py-20 text-sm text-[#C5A028] font-mono animate-pulse">LOADING WISHLIST...</div>
              ) : wishlistProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {wishlistProducts.map(p => (
                    <div key={p.id} className="bg-white border border-[#E2DDD5] rounded-2xl overflow-hidden shadow-sm flex flex-col justify-between hover:border-[#C5A028]/40 transition duration-300">
                      <div className="flex gap-3 p-4">
                        <div className="w-20 h-20 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl overflow-hidden shrink-0">
                          {p.media && p.media.length > 0 && p.media[0].type === 'image' ? (
                            <img src={p.media[0].url} alt={p.name} className="w-full h-full object-cover" />
                          ) : p.image_url ? (
                            <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-[#8C7E7E] text-[10px]">No Image</div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-sm text-[#2C1F1F] truncate">{p.name}</h4>
                          <p className="text-xs text-[#6E6262] line-clamp-1 mb-2">{p.description}</p>
                          <span className="font-mono text-sm text-[#C5A028] font-bold">₹{p.price?.toLocaleString()}</span>
                        </div>
                      </div>
                      <div className="bg-[#FAF9F5] border-t border-[#E2DDD5] px-4 py-3 flex gap-2 justify-end">
                        <button
                          onClick={() => handleRemoveFromWishlist(p.id)}
                          className="p-2 rounded-xl bg-white border border-[#E2DDD5] hover:bg-rose-50 hover:border-rose-200 text-[#8C7E7E] hover:text-rose-600 transition"
                          title="Remove from Wishlist"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                        <Link
                          href={`/shop/${p.id}`}
                          className="flex-1 max-w-[120px] flex items-center justify-center gap-1 py-2 rounded-xl bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-[10px] uppercase tracking-wider transition"
                        >
                          <ShoppingCart className="w-3.5 h-3.5" /> View
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20 bg-white border border-[#E2DDD5] rounded-3xl p-8 shadow-sm">
                  <Heart className="w-12 h-12 text-[#8C7E7E] mx-auto mb-4" />
                  <h3 className="text-lg font-bold text-[#2C1F1F] mb-1">Your wishlist is empty</h3>
                  <p className="text-[#6E6262] text-sm mb-6">Explore our catalog of premium musical instruments to add items.</p>
                  <Link 
                    href="/shop" 
                    className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition"
                  >
                    Start Shopping
                  </Link>
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'classes' && (
            <div className="space-y-6">
              {classesLoading ? (
                <div className="text-center py-20 text-sm text-[#C5A028] font-mono animate-pulse">LOADING CLASSES SCHEDULE...</div>
              ) : classesData ? (
                <div className="space-y-6">
                  {/* General Banner */}
                  <div className="bg-[#FAF9F5] border border-[#E2DDD5] rounded-3xl p-6 sm:p-8 shadow-sm">
                    <h3 className="font-extrabold text-2xl text-[#2C1F1F] mb-3">{classesData.general.title}</h3>
                    <p className="text-sm text-[#6E6262] leading-relaxed mb-6">{classesData.general.description}</p>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t border-[#E2DDD5]">
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 text-sky-600 flex items-center justify-center shrink-0">
                          <MapPin className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">{classesData.general.location_title}</h4>
                          <p className="text-xs font-semibold text-[#2C1F1F] mt-1 leading-relaxed">{classesData.general.location_address}</p>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center shrink-0">
                          <MessageCircle className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Contact Instructors</h4>
                          <div className="flex flex-col gap-1 mt-1">
                            {classesData.general.contact_phones.map(phone => (
                              <a key={phone} href={`https://wa.me/${phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="text-xs font-mono font-bold text-[#C5A028] hover:underline flex items-center gap-1">
                                {phone}
                              </a>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Course Cards Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {classesData.courses.map(course => (
                      <div key={course.id} className="bg-white border border-[#E2DDD5] rounded-3xl p-6 shadow-sm flex flex-col justify-between hover:border-[#C5A028]/45 transition duration-300">
                        <div className="space-y-4">
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <h4 className="font-extrabold text-[#2C1F1F] text-lg leading-tight">{course.name}</h4>
                              <p className="text-xs text-[#8C7E7E] mt-0.5">Instructor: {course.instructor}</p>
                            </div>
                            <span className="font-mono text-sm bg-sky-50 text-sky-600 px-3 py-1 rounded-full font-bold border border-sky-100 shrink-0">
                              ₹{course.fee} <span className="text-[10px] font-sans font-normal opacity-85">/mo</span>
                            </span>
                          </div>

                          <div className="space-y-3">
                            <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#8C7E7E]">Batch Timings</h5>
                            <div className="space-y-1.5">
                              {course.schedule.map((slot, index) => (
                                <div key={index} className="text-xs text-[#6E6262] leading-relaxed flex items-start gap-2">
                                  <span className="w-1.5 h-1.5 rounded-full bg-[#C5A028] mt-1.5 shrink-0"></span>
                                  <span>{slot}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>

                        <div className="pt-6 border-t border-[#E2DDD5]/70 mt-6 flex justify-between items-center gap-4">
                          <p className="text-[10px] text-[#8C7E7E] leading-normal">{course.fee_note}</p>
                          <a
                            href={`https://wa.me/918591223874?text=${encodeURIComponent(`Hello, I would like to enroll/inquire about the ${course.name}.`)}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-[10px] uppercase tracking-wider rounded-xl transition shadow-sm shrink-0"
                          >
                            <MessageCircle className="w-3.5 h-3.5" /> Enrol Now
                          </a>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-center py-20 text-sm text-[#8C7E7E]">Could not load class timing configuration.</div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white border border-[#E2DDD5] rounded-3xl p-6 sm:p-8 shadow-sm">
              <h3 className="font-bold text-lg text-[#2C1F1F] mb-6 flex items-center gap-2">
                <User className="w-5 h-5 text-[#C5A028]" /> Account Details
              </h3>
              
              <div className="space-y-5">
                <div>
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Account Email</label>
                  <div className="mt-1 px-4 py-3 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-sm font-mono text-[#2C1F1F]">
                    {user.email}
                  </div>
                </div>
                
                <div className="space-y-1">
                  <label className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Mobile Number (For WhatsApp Updates)</label>
                  <div className="flex gap-2">
                    <input 
                      type="tel"
                      value={profilePhone}
                      onChange={(e) => setProfilePhone(e.target.value)}
                      placeholder="e.g. 9876543210"
                      className="flex-1 px-4 py-2.5 bg-[#FAF9F5] focus:bg-white border border-[#E2DDD5] rounded-xl text-sm focus:border-[#C5A028] outline-none font-mono transition-all"
                    />
                    <button 
                      onClick={saveProfilePhone}
                      disabled={savingPhone}
                      className="px-5 py-2.5 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-sm rounded-xl transition disabled:opacity-50"
                    >
                      {savingPhone ? 'Saving...' : 'Save'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Sidebar */}
        <div className="lg:col-span-1">
          <div className="bg-[#FAF9F5] border border-[#E2DDD5] rounded-3xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-xs uppercase tracking-wider text-[#8C7E7E]">Support & Service</h4>
            <p className="text-xs text-[#6E6262] leading-relaxed">
              Inquire directly about active orders, repair estimates, or shipping statuses with our technicians.
            </p>
            <a 
              href="https://wa.me/918591223874"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-[#25D366] hover:bg-[#1EBE5D] text-white font-bold text-xs uppercase tracking-wider rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
            >
              <MessageCircle className="w-4 h-4" /> Message Support
            </a>
          </div>
        </div>

      </div>

      {/* DETAIL DIALOG FOR REPAIRS */}
      {selectedRepair && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#FAF9F5] border border-[#E2DDD5] w-full max-w-md rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh] text-[#2C1F1F] animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#E2DDD5] bg-[#FAF9F5] shrink-0">
              <h3 className="text-base sm:text-lg font-bold flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#C5A028]" /> Repair Job Specifications
              </h3>
              <button onClick={() => setSelectedRepair(null)} className="p-1.5 text-[#8C7E7E] hover:text-[#2C1F1F] transition rounded-lg hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-5 text-sm">
              <div className="grid grid-cols-2 gap-4 border-b border-[#E2DDD5] pb-4">
                <div>
                  <span className="text-xs text-[#8C7E7E] block uppercase tracking-wider font-bold">Instrument Type</span>
                  <span className="font-bold">{selectedRepair.instrument_type}</span>
                </div>
                <div>
                  <span className="text-xs text-[#8C7E7E] block uppercase tracking-wider font-bold">Brand / Model</span>
                  <span className="font-bold">{selectedRepair.brand_or_model || 'Generic / N/A'}</span>
                </div>
              </div>

              <div>
                <span className="text-xs text-[#8C7E7E] block uppercase tracking-wider font-bold mb-1">Issue Description</span>
                <p className="bg-white border border-[#E2DDD5] p-3 rounded-xl text-xs text-[#6E6262] leading-relaxed">{selectedRepair.issue_description}</p>
              </div>

              {selectedRepair.accessories_included && (
                <div>
                  <span className="text-xs text-[#8C7E7E] block uppercase tracking-wider font-bold">Accessories Included</span>
                  <span className="text-xs font-semibold">{selectedRepair.accessories_included}</span>
                </div>
              )}

              <div className="border-t border-[#E2DDD5] pt-4 space-y-3">
                <h4 className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E]">Costing & Estimates</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-3 border border-[#E2DDD5] rounded-xl text-center">
                    <span className="text-[10px] text-[#8C7E7E] block uppercase tracking-wider font-bold">Estimated Cost</span>
                    <span className="font-bold text-[#C5A028] text-base">₹{(selectedRepair.estimated_cost || 0).toLocaleString()}</span>
                  </div>
                  <div className="bg-white p-3 border border-[#E2DDD5] rounded-xl text-center">
                    <span className="text-[10px] text-[#8C7E7E] block uppercase tracking-wider font-bold">Advance Paid</span>
                    <span className="font-bold text-emerald-600 text-base">₹{(selectedRepair.advance_paid || 0).toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {selectedRepair.estimated_completion_date && (
                <div className="bg-amber-50/50 border border-amber-200 p-3 rounded-xl text-center text-xs">
                  <strong>Estimated Completion:</strong> {new Date(selectedRepair.estimated_completion_date).toLocaleDateString()}
                </div>
              )}

              {selectedRepair.media && selectedRepair.media.length > 0 && (
                <div className="space-y-2">
                  <span className="text-xs text-[#8C7E7E] block uppercase tracking-wider font-bold">Reference Media ({selectedRepair.media.length})</span>
                  <div className="grid grid-cols-3 gap-2">
                    {selectedRepair.media.map((med, idx) => (
                      <a key={idx} href={med.url} target="_blank" rel="noopener noreferrer" className="border border-[#E2DDD5] rounded-xl overflow-hidden h-16 block relative group">
                        {med.type === 'image' ? (
                          <img src={med.url} alt="Attachment" className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-[#FAF9F5] text-xs text-[#C5A028] font-bold">Play {med.type}</div>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 border-t border-[#E2DDD5] bg-[#FAF9F5] flex justify-end gap-2 shrink-0">
              <button 
                onClick={() => {
                  const text = `Hi, inquiring regarding my Instrument Repair (REP-${selectedRepair.id}):\n\n*Instrument:* ${selectedRepair.instrument_type}\n*Status:* ${selectedRepair.status}`;
                  window.open(`https://wa.me/918591223874?text=${encodeURIComponent(text)}`, '_blank');
                }}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#25D366] hover:bg-[#1EBE5D] text-white text-xs font-bold rounded-xl transition"
              >
                <MessageCircle className="w-4 h-4" /> Message Owner
              </button>
              <button onClick={() => setSelectedRepair(null)} className="px-4 py-2 bg-white border border-[#E2DDD5] text-xs font-semibold rounded-xl text-[#6E6262] hover:bg-black/5 transition">Close</button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
