"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ArrowRight, Star, ChevronRight, ShoppingBag, MapPin, Phone, Share2, MessageCircle, X, Heart } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function StorefrontHome() {
  const { t } = useLanguage();
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showContactModal, setShowContactModal] = useState(false);
  const [wishlistIds, setWishlistIds] = useState([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const items = JSON.parse(localStorage.getItem('ssv_wishlist') || '[]');
      setWishlistIds(items);
    }
  }, []);

  const toggleWishlist = (e, productId) => {
    e.preventDefault();
    e.stopPropagation();
    let updated;
    if (wishlistIds.includes(productId)) {
      updated = wishlistIds.filter(id => id !== productId);
    } else {
      updated = [...wishlistIds, productId];
    }
    setWishlistIds(updated);
    localStorage.setItem('ssv_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  useEffect(() => {
    async function fetchFeatured() {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (!error && data) {
        setFeaturedProducts(data);
      }
      setLoading(false);
    }
    fetchFeatured();
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="relative min-h-[85vh] flex items-center overflow-hidden py-16">
        {/* Background Image */}
        <div className="absolute inset-0 bg-[#FDFCF7] z-0 flex justify-end">
          <img src="/hero-bg.jpg" alt="Store Background" className="w-full lg:w-2/3 h-full object-cover opacity-90 object-center lg:object-right" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#FDFCF7] via-[#FDFCF7]/90 to-transparent z-10"></div>
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            
            {/* Text Content */}
            <div className="max-w-2xl order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#C5A028]/10 border border-[#C5A028]/20 text-[#C5A028] text-[10px] font-bold tracking-widest uppercase mb-6">
                <Star className="w-3 h-3" /> {t('since2026')}
              </div>
              <h1 className="text-4xl md:text-6xl font-extrabold tracking-tighter text-[#2C1F1F] mb-4 leading-tight">
                {t('heroTitleFirst')} <br />
                <span className="bg-gradient-to-r from-[#2C1F1F] via-[#5A4E4E] to-[#C5A028] bg-clip-text text-transparent">{t('heroTitleSecond')}</span>
              </h1>
              <p className="text-lg text-[#6E6262] mb-8 leading-relaxed font-light">
                {t('heroDesc')}
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-sm rounded-full transition shadow-lg">
                  {t('exploreProducts')} <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>

            {/* Visiting Card Display */}
            <div className="order-1 lg:order-2 flex justify-center lg:justify-end">
              <button 
                onClick={() => setShowContactModal(true)}
                className="relative w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-[#E2DDD5] bg-white p-1.5 z-10 hover:border-[#C5A028] hover:shadow-[0_0_20px_rgba(197,160,40,0.3)] transition-all cursor-pointer block"
                title="View Contact Options"
              >
                <img src="/shop_card.jpg" alt="Visiting Card" className="w-full h-auto rounded-xl" />
              </button>
            </div>

          </div>
        </div>
      </section>

      {/* Categories Showcase */}
      <section className="py-24 bg-[#FAF9F5] border-t border-b border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter text-[#2C1F1F] mb-2">{t('browseCategory')}</h2>
              <p className="text-[#6E6262]">{t('browseCategoryDesc')}</p>
            </div>
            <Link href="/categories" className="hidden md:flex items-center gap-1 text-[#C5A028] text-sm font-semibold hover:text-[#2C1F1F] transition">
              {t('viewAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {['Percussion', 'Strings', 'Keys', 'Accessories', 'Sticks', 'Bags', 'Stands'].map((cat, i) => (
              <Link key={cat} href={`/shop?category=${cat}`} className="group relative h-80 rounded-2xl overflow-hidden bg-white border border-[#E2DDD5] hover:border-[#C5A028]/50 shadow-sm hover:shadow transition-all block">
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F1F]/60 via-[#2C1F1F]/20 to-transparent z-10"></div>
                <div className="absolute inset-0 bg-[#F5F2EB] group-hover:scale-105 transition-transform duration-700">
                   {/* Placeholder background colors/patterns for categories */}
                   <div className="w-full h-full opacity-20" style={{ backgroundImage: `url('https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=600&auto=format&fit=crop')`, backgroundSize: 'cover' }}></div>
                </div>
                <div className="absolute bottom-0 left-0 p-8 z-20 w-full">
                  <h3 className="text-2xl font-bold text-white mb-1">{cat}</h3>
                  <div className="flex items-center gap-2 text-sm text-white/80 group-hover:text-white transition-colors">
                    Explore items <ArrowRight className="w-4 h-4 opacity-0 -ml-2 group-hover:opacity-100 group-hover:ml-0 transition-all duration-300" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24 bg-[#FDFCF7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <div className="inline-block text-[10px] font-bold tracking-widest text-[#C5A028] uppercase mb-2">{t('justArrived')}</div>
              <h2 className="text-3xl font-bold tracking-tighter text-[#2C1F1F]">{t('newArrivals')}</h2>
            </div>
            <Link href="/shop" className="hidden md:flex items-center gap-1 text-[#C5A028] text-sm font-semibold hover:text-[#2C1F1F] transition">
              {t('shopAll')} <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-96 rounded-2xl bg-[#F5F2EB] border border-[#E2DDD5] animate-pulse"></div>
              ))}
            </div>
          ) : featuredProducts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-2xl border border-[#E2DDD5] shadow-sm">
              <p className="text-[#6E6262]">{t('noProducts')}</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.map(p => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group block bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden hover:border-[#C5A028]/40 transition shadow-sm hover:shadow-md">
                  <div className="aspect-[4/5] bg-[#FAF9F5] relative overflow-hidden">
                    {p.media && p.media.length > 0 && p.media[0].type === 'image' ? (
                      <img src={p.media[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (p.image_url || p.images?.[0]) ? (
                      <img src={p.image_url || p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C7E7E]">No Image</div>
                    )}
                    <button
                      onClick={(e) => toggleWishlist(e, p.id)}
                      className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/95 backdrop-blur-md border border-[#E2DDD5] flex items-center justify-center text-[#2C1F1F] hover:text-rose-500 transition-all shadow-sm active:scale-95"
                    >
                      <Heart 
                        className={`w-4 h-4 transition duration-300 ${
                          wishlistIds.includes(p.id) ? 'fill-rose-500 text-rose-500 scale-110' : 'text-[#8C7E7E]'
                        }`} 
                      />
                    </button>
                    <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md border border-[#E2DDD5] px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-[#C5A028]">{p.category}</div>
                  </div>
                  <div className="p-5">
                    <h3 className="font-semibold text-[#2C1F1F] text-base leading-tight mb-2 group-hover:text-[#C5A028] transition-colors">{p.name}</h3>
                    <p className="font-mono text-lg text-[#C5A028] font-bold">₹{p.price?.toLocaleString()}</p>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Music Classes Promotion Section */}
      <section className="py-24 bg-[#FAF9F5] border-t border-b border-[#EAE6DF] relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-multiply"></div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            <div className="lg:col-span-7 space-y-6">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A028]/10 text-[10px] font-bold uppercase tracking-wider text-[#C5A028] border border-[#C5A028]/25">
                <Star className="w-3.5 h-3.5 fill-[#C5A028]" /> Music Academy
              </span>
              <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F]">
                Professional Music Classes in Malad East
              </h2>
              <p className="text-[#6E6262] text-lg leading-relaxed max-w-2xl">
                Unlock your musical potential with expert-guided tuition in Tabla, Dholak, Dholki, Harmonium, and Keyboard. We offer beginner-to-advanced courses with batch options tailored for both kids and adults.
              </p>
              
              <div className="grid grid-cols-2 gap-6 pt-4 max-w-md">
                <div className="space-y-1">
                  <span className="text-2xl font-black text-[#C5A028] font-mono">₹1,500</span>
                  <p className="text-xs text-[#8C7E7E] font-medium">Standard monthly fee (Tabla, Dholak, Harmonium)</p>
                </div>
                <div className="space-y-1">
                  <span className="text-2xl font-black text-[#C5A028] font-mono">₹2,500</span>
                  <p className="text-xs text-[#8C7E7E] font-medium">Keyboard classes monthly fee</p>
                </div>
              </div>

              <div className="pt-6 flex flex-wrap gap-4">
                <Link href="/classes" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-[#C5A028] text-white font-bold text-sm rounded-full transition hover:bg-[#A98920] shadow-md hover:shadow-lg">
                  Explore Timings & Batches <ArrowRight className="w-4 h-4" />
                </Link>
                <a href="https://wa.me/918591223874?text=Hello!%20I%20am%20interested%20in%20joining%20your%20music%20classes." target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white border border-[#E2DDD5] text-[#2C1F1F] font-bold text-sm rounded-full transition hover:bg-gray-50">
                  <MessageCircle className="w-4.5 h-4.5 text-[#25D366]" /> Chat to Enrol
                </a>
              </div>
            </div>
            
            <div className="lg:col-span-5 relative">
              <div className="aspect-[4/3] rounded-3xl overflow-hidden border border-[#E2DDD5] shadow-lg relative bg-[#FAF9F5]">
                <img 
                  src="https://images.unsplash.com/photo-1511192336575-5a79af67a629?q=80&w=800&auto=format&fit=crop" 
                  alt="Music Classroom" 
                  className="w-full h-full object-cover" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F1F]/40 to-transparent"></div>
                <div className="absolute bottom-6 left-6 right-6 p-5 bg-white/90 backdrop-blur-md rounded-2xl border border-[#E2DDD5]/40 shadow-md">
                  <h4 className="font-bold text-sm text-[#2C1F1F] mb-1">Academy Address</h4>
                  <p className="text-xs text-[#6E6262] leading-normal font-medium">104, Pawansut Building, Tanaji Nagar Road, Malad East, Mumbai - 97</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & Location Section */}
      <section className="py-20 bg-white border-t border-[#EAE6DF]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center md:text-left">
            
            {/* Location */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A028]/10 flex items-center justify-center text-[#C5A028]">
                <MapPin className="w-6 h-6" />
              </div>
              <Link href="/contact" className="hover:text-[#C5A028] transition-colors">
                <h3 className="text-xl font-bold text-[#2C1F1F] hover:text-inherit">{t('ourAddress')}</h3>
              </Link>
              <p className="text-[#6E6262] text-sm leading-relaxed max-w-xs">
                {t('addressText')}
              </p>
              <a 
                href="https://maps.google.com/?q=Nalanda+Building,+Kurar+Village,+Malad+East,+Mumbai" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="text-[#C5A028] text-sm font-semibold hover:underline"
              >
                {t('viewGoogleMaps')} →
              </a>
            </div>

            {/* Contact */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A028]/10 flex items-center justify-center text-[#C5A028]">
                <Phone className="w-6 h-6" />
              </div>
              <Link href="/contact" className="hover:text-[#C5A028] transition-colors">
                <h3 className="text-xl font-bold text-[#2C1F1F] hover:text-inherit">{t('callWhatsApp')}</h3>
              </Link>
              <div className="flex flex-col gap-2 mt-2 w-full max-w-[200px]">
                <a 
                  href="https://wa.me/919821360536" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-full"
                >
                  <MessageCircle className="w-4 h-4" /> Dinesh: +91 98213 60536
                </a>
                <a 
                  href="https://wa.me/919833991547" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-full"
                >
                  <MessageCircle className="w-4 h-4" /> Manisha: +91 98339 91547
                </a>
                <a 
                  href="https://wa.me/918591223874" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center justify-center gap-2 text-xs font-bold text-white bg-[#25D366] hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-full"
                >
                  <MessageCircle className="w-4 h-4" /> Yash: +91 85912 23874
                </a>
              </div>
            </div>

            {/* Social Media */}
            <div className="flex flex-col items-center md:items-start space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#C5A028]/10 flex items-center justify-center text-[#C5A028]">
                <Share2 className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-[#2C1F1F]">{t('followUs')}</h3>
              <p className="text-[#6E6262] text-sm leading-relaxed max-w-xs">
                {t('followUsDesc')}
              </p>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com/saraswatisangeet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DDD5] text-sm text-[#6E6262] hover:text-[#C5A028] hover:border-[#C5A028] transition"
                >
                  <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://facebook.com/saraswatisangeet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-[#E2DDD5] text-sm text-[#6E6262] hover:text-[#C5A028] hover:border-[#C5A028] transition"
                >
                  <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Brand CTA */}
      <section className="py-32 relative overflow-hidden bg-[#FAF9F5] border-t border-[#EAE6DF]">
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-5 mix-blend-multiply"></div>
        <div className="relative z-10 max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F] mb-6">
            {t('brandCtaTitle')}
          </h2>
          <p className="text-[#6E6262] font-medium text-lg mb-10 max-w-2xl mx-auto">
            {t('brandCtaDesc')}
          </p>
          <Link href="/shop" className="inline-flex items-center justify-center gap-2 px-10 py-5 bg-[#C5A028] text-white font-bold text-base rounded-full transition hover:bg-[#A98920] shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
            {t('startShopping')} <ShoppingBag className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Contact Modal */}
      {showContactModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#2C1F1F]/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div 
            className="bg-white rounded-3xl w-full max-w-lg shadow-[0_20px_60px_rgba(44,31,31,0.15)] overflow-hidden animate-in zoom-in-95 duration-300 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-[#EAE6DF] bg-[#FAF9F5]">
              <h3 className="text-xl font-bold text-[#2C1F1F]">Contact Us</h3>
              <button 
                onClick={() => setShowContactModal(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-[#E2DDD5] text-[#6E6262] hover:text-[#C5A028] hover:border-[#C5A028] transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <div className="p-6 md:p-8 space-y-8 overflow-y-auto max-h-[70vh]">
              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#8C7E7E] mb-4">Message on WhatsApp</h4>
                <div className="grid gap-3">
                  <a href="https://wa.me/919821360536" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-[#E2DDD5] hover:border-[#25D366] hover:bg-[#25D366]/5 transition group">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#2C1F1F]">Dinesh</div>
                      <div className="text-sm text-[#6E6262]">+91 98213 60536</div>
                    </div>
                  </a>
                  <a href="https://wa.me/919833991547" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-[#E2DDD5] hover:border-[#25D366] hover:bg-[#25D366]/5 transition group">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#2C1F1F]">Manisha</div>
                      <div className="text-sm text-[#6E6262]">+91 98339 91547</div>
                    </div>
                  </a>
                  <a href="https://wa.me/918591223874" target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 p-4 rounded-xl border border-[#E2DDD5] hover:border-[#25D366] hover:bg-[#25D366]/5 transition group">
                    <div className="w-10 h-10 rounded-full bg-[#25D366]/10 flex items-center justify-center text-[#25D366] group-hover:bg-[#25D366] group-hover:text-white transition">
                      <MessageCircle className="w-5 h-5" />
                    </div>
                    <div className="flex-1">
                      <div className="font-bold text-[#2C1F1F]">Yash</div>
                      <div className="text-sm text-[#6E6262]">+91 85912 23874</div>
                    </div>
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#8C7E7E] mb-4">Direct Call</h4>
                <div className="flex flex-wrap gap-3">
                  <a href="tel:+919821360536" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F5F2EB] text-[#2C1F1F] font-semibold text-sm hover:bg-[#C5A028] hover:text-white transition border border-[#E2DDD5] hover:border-transparent">
                    <Phone className="w-4 h-4" /> Dinesh
                  </a>
                  <a href="tel:+919833991547" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F5F2EB] text-[#2C1F1F] font-semibold text-sm hover:bg-[#C5A028] hover:text-white transition border border-[#E2DDD5] hover:border-transparent">
                    <Phone className="w-4 h-4" /> Manisha
                  </a>
                  <a href="tel:+918591223874" className="flex-1 min-w-[120px] flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-[#F5F2EB] text-[#2C1F1F] font-semibold text-sm hover:bg-[#C5A028] hover:text-white transition border border-[#E2DDD5] hover:border-transparent">
                    <Phone className="w-4 h-4" /> Yash
                  </a>
                </div>
              </div>

              <div>
                <h4 className="text-sm font-bold uppercase tracking-wider text-[#8C7E7E] mb-4">Visit Us</h4>
                <div className="p-4 rounded-xl border border-[#E2DDD5] bg-[#FAF9F5]">
                  <div className="flex gap-4">
                    <div className="w-10 h-10 rounded-full bg-[#C5A028]/10 flex items-center justify-center text-[#C5A028] shrink-0">
                      <MapPin className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-[#2C1F1F] font-medium text-sm mb-3">
                        Nalanda Building, Near Saibaba Temple, Kurar Village, Malad (East), Mumbai - 400097.
                      </p>
                      <a 
                        href="https://maps.google.com/?q=Nalanda+Building,+Kurar+Village,+Malad+East,+Mumbai" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white bg-[#2C1F1F] hover:bg-[#C5A028] px-4 py-2 rounded-lg transition"
                      >
                        <MapPin className="w-3.5 h-3.5" /> Get Directions
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
