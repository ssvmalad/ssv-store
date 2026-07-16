"use client";

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { ShoppingBag, MessageCircle, ChevronRight, Check, ArrowLeft, Play, Volume2, Heart } from 'lucide-react';
import Link from 'next/link';
import { useLanguage } from '@/lib/LanguageContext';

export default function ProductDetails() {
  const { t } = useLanguage();
  const params = useParams();
  const router = useRouter();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeMedia, setActiveMedia] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [isWishlisted, setIsWishlisted] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && params.id) {
      const items = JSON.parse(localStorage.getItem('ssv_wishlist') || '[]');
      const pid = isNaN(params.id) ? params.id : parseInt(params.id);
      setIsWishlisted(items.includes(pid));
    }
  }, [params.id]);

  const toggleWishlist = (e) => {
    e.preventDefault();
    if (!params.id) return;
    const items = JSON.parse(localStorage.getItem('ssv_wishlist') || '[]');
    let updated;
    const pid = isNaN(params.id) ? params.id : parseInt(params.id);
    if (items.includes(pid)) {
      updated = items.filter(id => id !== pid);
      setIsWishlisted(false);
    } else {
      updated = [...items, pid];
      setIsWishlisted(true);
    }
    localStorage.setItem('ssv_wishlist', JSON.stringify(updated));
    window.dispatchEvent(new Event('wishlistUpdated'));
  };

  useEffect(() => {
    async function fetchProduct() {
      if (!params.id) return;
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('id', params.id)
        .single();
      
      if (!error && data) {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          setSelectedVariant(data.variants[0]);
          
          // Set initial active media to the first variant's image if available
          const firstVar = data.variants[0];
          const varUrl = (firstVar.media && firstVar.media.length > 0) ? firstVar.media[0].url : firstVar.image;
          if (varUrl) {
            let tempGallery = [];
            if (data.media && data.media.length > 0) tempGallery = [...data.media];
            else if (data.images && data.images.length > 0) tempGallery = data.images.map(url => ({ type: 'image', url }));
            else if (data.image_url) tempGallery = [{ type: 'image', url: data.image_url }];
            
            data.variants.forEach(v => {
              const url = (v.media && v.media.length > 0) ? v.media[0].url : v.image;
              if (url && !tempGallery.some(g => g.url === url)) {
                tempGallery.push({ type: 'image', url });
              }
            });

            const idx = tempGallery.findIndex(g => g.url === varUrl);
            if (idx > -1) {
              setActiveMedia(idx);
            }
          }
        }
      } else {
        // Handle 404 or error
        router.push('/shop');
      }
      setLoading(false);
    }
    fetchProduct();
  }, [params.id, router]);

  const handleAddToCart = () => {
    try {
      const currentCart = JSON.parse(localStorage.getItem('ssv_cart') || '[]');
      const cartItemId = selectedVariant ? `${product.id}-${selectedVariant.name}` : product.id;
      const existingIndex = currentCart.findIndex(item => item.id === cartItemId);
      
      if (existingIndex > -1) {
        currentCart[existingIndex].quantity += quantity;
      } else {
        currentCart.push({
          id: cartItemId,
          name: selectedVariant ? `${product.name} - ${selectedVariant.name}` : product.name,
          variant: selectedVariant ? selectedVariant.name : null,
          price: selectedVariant ? selectedVariant.price : product.price,
          image: (selectedVariant && Array.isArray(selectedVariant.media) && selectedVariant.media.length > 0 && selectedVariant.media[0].type === 'image') 
                   ? selectedVariant.media[0].url 
                   : (Array.isArray(product.media) && product.media.length > 0) ? product.media[0].url : product.image_url,
          quantity: quantity
        });
      }
      
      localStorage.setItem('ssv_cart', JSON.stringify(currentCart));
      setAdded(true);
      
      window.dispatchEvent(new Event('cartUpdated'));
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Cart Error:", err);
      alert("Error adding to cart. Please try again.");
    }
  };


  const handleWhatsApp = () => {
    const itemName = selectedVariant ? `${product.name} (${selectedVariant.name})` : product.name;
    const itemPrice = selectedVariant ? selectedVariant.price : product.price;
    const text = encodeURIComponent(`Hi, I'm interested in the ${itemName} (₹${itemPrice}). Is it available?`);
    window.open(`https://wa.me/919999999999?text=${text}`, '_blank'); // Replace with actual number
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 animate-pulse bg-[#FDFCF7]">
        <div className="h-8 w-32 bg-[#FAF9F5] rounded mb-8"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
          <div className="h-[600px] bg-[#FAF9F5] rounded-2xl border border-[#EAE6DF]"></div>
          <div className="space-y-6">
            <div className="h-12 bg-[#FAF9F5] rounded"></div>
            <div className="h-8 w-1/4 bg-[#FAF9F5] rounded"></div>
            <div className="h-32 bg-[#FAF9F5] rounded"></div>
            <div className="h-16 bg-[#FAF9F5] rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) return null;

  // Combine legacy images, new media, and any unique variant media/images for the unified gallery
  let gallery = [];
  if (product.media && product.media.length > 0) {
    gallery = [...product.media];
  } else if (product.images && product.images.length > 0) {
    gallery = product.images.map(url => ({ type: 'image', url }));
  } else if (product.image_url) {
    gallery = [{ type: 'image', url: product.image_url }];
  }

  // Append any unique variant images not already present in the general gallery
  if (product.variants && product.variants.length > 0) {
    product.variants.forEach(v => {
      const varUrl = (v.media && v.media.length > 0) ? v.media[0].url : v.image;
      if (varUrl && !gallery.some(g => g.url === varUrl)) {
        gallery.push({ type: 'image', url: varUrl });
      }
    });
  }

  const displayedMedia = gallery.length > 0 ? gallery[activeMedia] : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-sm text-[#6E6262] mb-8">
        <Link href="/" className="hover:text-[#2C1F1F] transition">{t('home')}</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href="/shop" className="hover:text-[#2C1F1F] transition">{t('navShop')}</Link>
        <ChevronRight className="w-4 h-4" />
        <Link href={`/shop?category=${product.category}`} className="hover:text-[#2C1F1F] transition">{product.category}</Link>
        <ChevronRight className="w-4 h-4" />
        <span className="text-[#C5A028] truncate">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Media Gallery */}
        <div className="lg:col-span-5 space-y-4 max-w-sm sm:max-w-md mx-auto lg:mx-0 w-full">
          <div className="aspect-square max-h-[300px] sm:max-h-[380px] rounded-2xl bg-white border border-[#E2DDD5] shadow-sm overflow-hidden relative flex items-center justify-center">
            {displayedMedia ? (
              displayedMedia.type === 'image' ? (
                <img src={displayedMedia.url} alt={product.name} className="w-full h-full object-cover" />
              ) : displayedMedia.type === 'video' ? (
                <video src={displayedMedia.url} controls autoPlay muted loop className="w-full h-full object-contain bg-black" />
              ) : displayedMedia.type === 'audio' ? (
                <div className="w-full h-full flex flex-col items-center justify-center bg-[#FAF9F5] p-8 text-center">
                  <Volume2 className="w-16 h-16 text-[#C5A028] mb-6" />
                  <audio src={displayedMedia.url} controls className="w-full max-w-md" />
                  <p className="text-[#6E6262] mt-4 font-mono text-sm">Audio Sample</p>
                </div>
              ) : (
                <div className="text-[#8C7E7E]">Unsupported media type</div>
              )
            ) : (
              <div className="text-[#8C7E7E]">No Media Available</div>
            )}
          </div>
          
          {/* Thumbnails */}
          {gallery.length > 1 && (
            <div className="grid grid-cols-6 lg:grid-cols-8 gap-2 sm:gap-3">
              {gallery.map((item, index) => (
                <button 
                  key={index}
                  onClick={() => {
                    setActiveMedia(index);
                    if (product.variants && product.variants.length > 0) {
                      const matchingVariant = product.variants.find(v => {
                        const varUrl = (v.media && v.media.length > 0) ? v.media[0].url : v.image;
                        return varUrl === item.url;
                      });
                      if (matchingVariant) {
                        setSelectedVariant(matchingVariant);
                      }
                    }
                  }}
                  className={`aspect-square rounded-lg overflow-hidden border-2 transition-all ${activeMedia === index ? 'border-[#C5A028]' : 'border-transparent hover:border-[#E2DDD5]'}`}
                >
                  {item.type === 'image' ? (
                    <img src={item.url} className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                  ) : item.type === 'video' ? (
                    <div className="w-full h-full bg-[#FAF9F5] flex items-center justify-center text-[#C5A028]"><Play className="w-4 h-4" /></div>
                  ) : item.type === 'audio' ? (
                    <div className="w-full h-full bg-[#FAF9F5] flex items-center justify-center text-[#C5A028]"><Volume2 className="w-4 h-4" /></div>
                  ) : null}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="lg:col-span-7 flex flex-col">
          <div className="mb-2">
            <span className="text-xs font-bold tracking-widest text-[#C5A028] uppercase bg-[#C5A028]/10 px-2.5 py-1 rounded-sm border border-[#C5A028]/20">
              {product.category}
            </span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F] mt-4 mb-4 leading-tight">
            {product.name}
          </h1>
          
          <div className="flex items-center gap-4 mb-8">
            <span className="text-3xl font-mono text-[#C5A028] font-bold">
              ₹{(selectedVariant ? selectedVariant.price : product.price)?.toLocaleString()}
            </span>
          </div>

          <div className="prose prose-invert prose-p:text-[#6E6262] prose-p:leading-relaxed max-w-none mb-10 border-t border-b border-[#EAE6DF] py-8">
            <p className="whitespace-pre-wrap">{product.description || t('noDesc')}</p>
          </div>

          {product.variants && product.variants.length > 0 && (
            <div className="mb-8 relative z-10">
              <h3 className="text-sm font-bold tracking-widest text-[#8C7E7E] uppercase mb-4">Select Option</h3>
              <div className="flex flex-col sm:flex-row flex-wrap gap-3">
                {product.variants.map((v, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (selectedVariant?.name === v.name) {
                        setSelectedVariant(null);
                      } else {
                        setSelectedVariant(v);
                        // Sync active gallery image
                        const varUrl = (v.media && v.media.length > 0) ? v.media[0].url : v.image;
                        if (varUrl) {
                          const idx = gallery.findIndex(g => g.url === varUrl);
                          if (idx > -1) {
                            setActiveMedia(idx);
                          }
                        }
                      }
                    }}
                    className={`flex items-center justify-between sm:justify-start gap-3 px-4 py-2.5 rounded-xl border font-semibold transition w-full sm:w-auto text-left cursor-pointer ${
                      selectedVariant?.name === v.name 
                        ? 'border-[#C5A028] bg-[#C5A028]/10 text-[#C5A028] shadow-sm' 
                        : 'border-[#E2DDD5] bg-white text-[#6E6262] hover:border-[#C5A028] hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      {Array.isArray(v.media) && v.media.length > 0 && v.media[0].type === 'image' && (
                        <img src={v.media[0].url} alt={v.name} className="w-5 h-5 rounded-sm object-cover shrink-0 pointer-events-none" />
                      )}
                      <span className="text-sm">{v.name}</span>
                    </div>
                    <span className="text-sm font-mono opacity-80 shrink-0">(₹{v.price})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="flex items-center gap-4 mb-8">
            <div className="flex items-center bg-[#F5F2EB] border border-[#E2DDD5] rounded-full p-1">
              <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="w-10 h-10 flex items-center justify-center text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#E2DDD5] rounded-full transition">-</button>
              <span className="w-12 text-center text-[#2C1F1F] font-mono">{quantity}</span>
              <button onClick={() => setQuantity(quantity + 1)} className="w-10 h-10 flex items-center justify-center text-[#2C1F1F] hover:text-[#C5A028] hover:bg-[#E2DDD5] rounded-full transition">+</button>
            </div>
            
            <button 
              onClick={handleAddToCart}
              className={`flex-1 flex items-center justify-center gap-2 h-14 rounded-full font-bold text-sm transition shadow-md hover:shadow-lg ${added ? 'bg-green-500 text-white shadow-none' : 'bg-[#C5A028] text-white hover:bg-[#A98920]'}`}
            >
              {added ? (
                <><Check className="w-5 h-5" /> {t('addedToCart')}</>
              ) : (
                <><ShoppingBag className="w-5 h-5" /> {t('addToCart')}</>
              )}
            </button>

            <button 
              onClick={toggleWishlist}
              className={`w-14 h-14 rounded-full border flex items-center justify-center transition shadow-sm shrink-0 active:scale-95 ${
                isWishlisted 
                  ? 'bg-rose-50 border-rose-200 text-rose-500 hover:bg-rose-100' 
                  : 'bg-[#FAF9F5] border-[#E2DDD5] text-[#2C1F1F] hover:bg-white hover:border-[#C5A028]'
              }`}
            >
              <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-rose-500' : ''}`} />
            </button>
          </div>

          <button 
            onClick={handleWhatsApp}
            className="w-full flex items-center justify-center gap-2 h-14 rounded-full font-bold text-sm bg-[#FAF9F5] border border-[#E2DDD5] text-[#2C1F1F] hover:border-[#25D366] hover:text-[#1EBE5D] transition"
          >
            <MessageCircle className="w-5 h-5" /> {t('inquireWhatsApp')}
          </button>

          {/* Details / Specs Accordion Placeholder */}
          <div className="mt-12 space-y-4">
            <div className="border border-[#E2DDD5] rounded-xl p-5 bg-[#FAF9F5]">
              <h4 className="text-[#2C1F1F] font-semibold mb-2">{t('securePayment')}</h4>
              <p className="text-sm text-[#6E6262]">{t('securePaymentDesc')}</p>
            </div>
            <div className="border border-[#E2DDD5] rounded-xl p-5 bg-[#FAF9F5]">
              <h4 className="text-[#2C1F1F] font-semibold mb-2">{t('shippingReturns')}</h4>
              <p className="text-sm text-[#6E6262]">{t('shippingReturnsDesc')}</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
