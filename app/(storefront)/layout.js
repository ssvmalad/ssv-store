"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Search, ShoppingBag, Menu, X, Sparkles, Globe, MapPin, User } from 'lucide-react';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import AIAssistant from '@/app/components/AIAssistant';

export default function StorefrontLayout({ children }) {
  return (
    <LanguageProvider>
      <StorefrontLayoutInner>{children}</StorefrontLayoutInner>
    </LanguageProvider>
  );
}

function StorefrontLayoutInner({ children }) {
  const { lang, changeLanguage, t } = useLanguage();
  const pathname = usePathname() || '';
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cartCount, setCartCount] = useState(0);

  useEffect(() => {
    const updateCount = () => {
      const cart = JSON.parse(localStorage.getItem('ssv_cart') || '[]');
      setCartCount(cart.reduce((total, item) => total + item.quantity, 0));
    };
    
    updateCount();
    window.addEventListener('cartUpdated', updateCount);
    return () => window.removeEventListener('cartUpdated', updateCount);
  }, []);

  return (
    <div className="min-h-screen bg-[#FDFCF7] flex flex-col font-sans selection:bg-[#C5A028] selection:text-white">

      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-[#EAE6DF] shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* Mobile Menu Button */}
            <div className="flex items-center md:hidden">
              <button 
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="text-[#2C1F1F] hover:text-[#C5A028] p-2 -ml-2 transition"
              >
                {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
              </button>
            </div>

            {/* Logo */}
            <div className="flex-shrink-0 flex items-center justify-center md:justify-start flex-1 md:flex-none mr-6">
              <Link href="/" className="flex flex-col items-center md:items-start group">
                <span className="text-xl font-black tracking-tighter text-[#1C1212] group-hover:text-[#C5A028] transition-colors leading-none mb-1">
                  Home
                </span>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-10">
              <Link href="/shop" className={`text-sm transition relative group ${pathname.startsWith('/shop') ? 'font-bold text-[#2C1F1F]' : 'font-semibold text-[#6E6262] hover:text-[#C5A028]'}`}>
                {t('navShop')}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A028] transition-all ${pathname.startsWith('/shop') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/categories" className={`text-sm transition relative group ${pathname.startsWith('/categories') ? 'font-bold text-[#2C1F1F]' : 'font-semibold text-[#6E6262] hover:text-[#C5A028]'}`}>
                {t('navCategories')}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A028] transition-all ${pathname.startsWith('/categories') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/repair" className={`text-sm transition relative group ${pathname.startsWith('/repair') ? 'font-bold text-[#2C1F1F]' : 'font-semibold text-[#6E6262] hover:text-[#C5A028]'}`}>
                {t('navRepair')}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A028] transition-all ${pathname.startsWith('/repair') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
              <Link href="/contact" className={`text-sm transition relative group ${pathname.startsWith('/contact') ? 'font-bold text-[#2C1F1F]' : 'font-semibold text-[#6E6262] hover:text-[#C5A028]'}`}>
                {t('navContact')}
                <span className={`absolute -bottom-1 left-0 h-0.5 bg-[#C5A028] transition-all ${pathname.startsWith('/contact') ? 'w-full' : 'w-0 group-hover:w-full'}`}></span>
              </Link>
            </nav>

            {/* Right Side Icons */}
            <div className="flex items-center gap-4">
              <div className="hidden md:flex relative group">
                <input 
                  type="text" 
                  placeholder={t('searchPlaceholder')}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#F5F2EB] border border-[#E2DDD5] rounded-full py-2 pl-4 pr-10 text-sm text-[#2C1F1F] placeholder-[#8C7E7E] focus:outline-none focus:border-[#C5A028] transition-all w-48 focus:w-64"
                />
                <Search className="w-4 h-4 text-[#6E6262] absolute right-4 top-1/2 -translate-y-1/2 group-focus-within:text-[#C5A028] transition-colors" />
              </div>
              <button className="md:hidden text-[#2C1F1F] hover:text-[#C5A028] transition">
                <Search className="w-5 h-5" />
              </button>

              {/* Language Selector Dropdown */}
              <div className="flex items-center gap-1.5 relative bg-[#F5F2EB] border border-[#E2DDD5] rounded-lg px-2.5 py-1.5 cursor-pointer hover:border-[#C5A028] transition">
                <Globe className="w-3.5 h-3.5 text-[#C5A028]" />
                <select 
                  value={lang} 
                  onChange={(e) => changeLanguage(e.target.value)}
                  className="bg-transparent text-xs text-[#2C1F1F] font-semibold tracking-wider focus:outline-none cursor-pointer pr-1"
                >
                  <option value="en" className="bg-[#F5F2EB] text-[#2C1F1F]">EN</option>
                  <option value="hi" className="bg-[#F5F2EB] text-[#2C1F1F]">हिंदी</option>
                  <option value="mr" className="bg-[#F5F2EB] text-[#2C1F1F]">मराठी</option>
                </select>
              </div>

              <Link 
                href="/track" 
                className={`transition flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${
                  pathname === '/track' 
                    ? 'bg-[#FAF9F5] text-[#C5A028] border border-[#E2DDD5] shadow-sm' 
                    : 'text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#FAF9F5]'
                }`}
              >
                <MapPin className="w-4 h-4" />
                <span className="hidden sm:inline">Track</span>
              </Link>

              <Link 
                href="/account" 
                className={`transition flex items-center gap-1.5 px-3.5 py-2 rounded-xl font-bold text-xs uppercase tracking-wider ${
                  pathname.startsWith('/account') 
                    ? 'bg-[#FAF9F5] text-[#C5A028] border border-[#E2DDD5] shadow-sm' 
                    : 'text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#FAF9F5]'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">Account</span>
              </Link>

              <Link 
                href="/cart" 
                className={`transition relative group flex items-center gap-2 px-3.5 py-2 rounded-xl border font-bold text-xs uppercase tracking-wider ${
                  pathname === '/cart' 
                    ? 'bg-white text-[#C5A028] border-[#C5A028] shadow-sm' 
                    : 'bg-[#FAF9F5] border-[#E2DDD5] hover:border-[#C5A028] hover:bg-white shadow-sm text-[#2C1F1F]'
                }`}
              >
                <ShoppingBag className="w-4 h-4 text-[#C5A028] group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline">Cart</span>
                {cartCount > 0 ? (
                  <span className="flex items-center justify-center min-w-4.5 h-4.5 px-1.5 text-[9px] font-bold text-white bg-[#C5A028] rounded-full shadow-[0_0_10px_rgba(197,160,40,0.3)] font-mono shrink-0">
                    {cartCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-[#8C7E7E] font-medium font-mono">(0)</span>
                )}
              </Link>
            </div>
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-[#EAE6DF]">
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link href="/shop" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/shop') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>{t('navShop')}</Link>
              <Link href="/categories" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/categories') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>{t('navCategories')}</Link>
              <Link href="/repair" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/repair') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>{t('navRepair')}</Link>
              <Link href="/track" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/track') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>Track Order</Link>
              <Link href="/account" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/account') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>Account</Link>
              <Link href="/contact" onClick={() => setIsMobileMenuOpen(false)} className={`block px-3 py-3 text-base font-medium rounded-lg transition ${pathname.startsWith('/contact') ? 'text-[#C5A028] bg-[#F5F2EB]' : 'text-[#6E6262] hover:bg-[#F5F2EB]'}`}>{t('navContact')}</Link>
            </div>
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1">
        {children}
      </main>

      {/* Premium Footer */}
      <footer className="bg-[#FAF9F5] border-t border-[#EAE6DF] pt-16 pb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-12">
            <div className="col-span-1 md:col-span-1">
              <div className="flex items-center mb-4">
                <span className="text-base font-extrabold tracking-tight text-[#2C1F1F]">Saraswati Sangeet Vadhyalaya</span>
              </div>
              <p className="text-[#6E6262] text-sm leading-relaxed mb-6">
                Crafting premium musical instruments for professionals and enthusiasts. Quality you can hear, beauty you can see.
              </p>
              <div className="flex items-center gap-4">
                <a href="https://facebook.com/saraswatisangeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#EFECE6] border border-[#E2DDD5] flex items-center justify-center text-[#2C1F1F] hover:bg-[#C5A028] hover:text-white transition-colors font-bold text-xs font-mono">FB</a>
                <a href="https://instagram.com/saraswatisangeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#EFECE6] border border-[#E2DDD5] flex items-center justify-center text-[#2C1F1F] hover:bg-[#C5A028] hover:text-white transition-colors font-bold text-xs font-mono">IG</a>
                <a href="https://youtube.com/@saraswatisangeet" target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-[#EFECE6] border border-[#E2DDD5] flex items-center justify-center text-[#2C1F1F] hover:bg-[#C5A028] hover:text-white transition-colors font-bold text-xs font-mono">YT</a>
              </div>
            </div>
            
            <div>
              <h4 className="text-[#2C1F1F] font-semibold uppercase tracking-widest text-xs mb-6">{t('navShop')}</h4>
              <ul className="space-y-4">
                <li><Link href="/shop" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">{t('allInstruments')}</Link></li>
                <li><Link href="/shop?category=Percussion" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">Percussion</Link></li>
                <li><Link href="/shop?category=Strings" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">Strings</Link></li>
                <li><Link href="/shop?category=Keys" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">Keys</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#2C1F1F] font-semibold uppercase tracking-widest text-xs mb-6">{t('support')}</h4>
              <ul className="space-y-4">
                <li><Link href="/contact" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">{t('navContact')}</Link></li>
                <li><Link href="/shipping" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">{t('shippingPolicy')}</Link></li>
                <li><Link href="/returns" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">{t('returnsPolicy')}</Link></li>
                <li><Link href="/faq" className="text-[#6E6262] hover:text-[#C5A028] text-sm transition">{t('faq')}</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-[#2C1F1F] font-semibold uppercase tracking-widest text-xs mb-6">{t('newsletterTitle')}</h4>
              <p className="text-[#6E6262] text-sm leading-relaxed mb-4">{t('newsletterDesc')}</p>
              <form onSubmit={(e) => { e.preventDefault(); alert("Thank you for subscribing to our newsletter!"); e.target.reset(); }} className="flex">
                <input type="email" required placeholder={t('newsletterPlaceholder')} className="bg-white border border-[#E2DDD5] rounded-l-lg py-3 px-4 text-sm text-[#2C1F1F] placeholder-[#8C7E7E] focus:outline-none focus:border-[#C5A028] w-full" />
                <button type="submit" className="bg-[#C5A028] hover:bg-[#A98920] text-white px-4 font-bold rounded-r-lg transition">
                  {t('newsletterBtn')}
                </button>
              </form>
            </div>
          </div>
          <div className="border-t border-[#EAE6DF] pt-8 flex flex-col md:flex-row items-center justify-between">
            <p className="text-[#8C7E7E] text-xs">{t('rightsReserved')}</p>
            <div className="flex gap-4 mt-4 md:mt-0 text-xs text-[#8C7E7E]">
              <a href="#" className="hover:text-[#C5A028] transition">{t('privacyPolicy')}</a>
              <a href="#" className="hover:text-[#C5A028] transition">{t('termsOfService')}</a>
            </div>
          </div>
        </div>
      </footer>
      <AIAssistant />
    </div>
  );
}
