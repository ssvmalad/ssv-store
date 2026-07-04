"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Filter, ChevronDown, SlidersHorizontal, Search, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ShopCatalog() {
  const { t } = useLanguage();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [category, setCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    async function fetchProducts() {
      setLoading(true);
      let query = supabase
        .from('products')
        .select('*')
        .eq('is_available', true)
        .order('created_at', { ascending: false });

      if (category !== 'All') {
        query = query.eq('category', category);
      }

      if (searchQuery) {
        query = query.ilike('name', `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (!error && data) {
        setProducts(data);
      }
      setLoading(false);
    }
    
    // Add a small debounce for search
    const timer = setTimeout(() => {
      fetchProducts();
    }, 300);
    return () => clearTimeout(timer);
  }, [category, searchQuery]);

  const categories = ['All', 'Percussion', 'Strings', 'Keys', 'Accessories', 'Sticks', 'Bags', 'Stands'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tighter text-[#2C1F1F] mb-2">{t('shopTitle')}</h1>
          <p className="text-[#6E6262]">{t('shopDesc')}</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative">
            <Search className="w-4 h-4 text-[#8C7E7E] absolute left-3 top-1/2 transform -translate-y-1/2" />
            <input 
              type="text" 
              placeholder={t('search')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-[#F5F2EB] border border-[#E2DDD5] rounded-full py-2 pl-10 pr-4 text-sm text-[#2C1F1F] placeholder-[#8C7E7E] focus:outline-none focus:border-[#C5A028] w-full md:w-64 transition-all"
            />
          </div>
          <button 
            onClick={() => setIsFilterOpen(!isFilterOpen)}
            className="md:hidden flex items-center justify-center w-10 h-10 rounded-full bg-[#F5F2EB] border border-[#E2DDD5] text-[#2C1F1F]"
          >
            <SlidersHorizontal className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-8">
        {/* Sidebar Filters */}
        <div className={`md:w-64 flex-shrink-0 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
          <div className="sticky top-24 space-y-8">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-[#2C1F1F] mb-4 border-b border-[#E2DDD5] pb-2">{t('filterCategory')}</h3>
              <ul className="space-y-3">
                {categories.map(c => (
                  <li key={c}>
                    <button 
                      onClick={() => setCategory(c)}
                      className={`text-sm flex items-center gap-2 transition-colors ${category === c ? 'text-[#C5A028] font-semibold' : 'text-[#6E6262] hover:text-[#2C1F1F]'}`}
                    >
                      <div className={`w-1.5 h-1.5 rounded-full ${category === c ? 'bg-[#C5A028]' : 'bg-transparent'}`}></div>
                      {c}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            
            {/* Can add more filters here later (Price, Brand, etc.) */}
          </div>
        </div>

        {/* Product Grid */}
        <div className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map(n => (
                <div key={n} className="h-96 rounded-2xl bg-[#FAF9F5] border border-[#EAE6DF] animate-pulse"></div>
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="text-center py-32 bg-white rounded-2xl border border-[#E2DDD5] shadow-sm">
              <Search className="w-12 h-12 text-[#8C7E7E] mx-auto mb-4" />
              <h3 className="text-xl font-bold text-[#2C1F1F] mb-2">{t('noProductsFound')}</h3>
              <p className="text-[#6E6262]">{t('adjustFilters')}</p>
              <button 
                onClick={() => { setCategory('All'); setSearchQuery(''); }}
                className="mt-6 px-6 py-2 bg-[#C5A028] text-white font-bold text-sm rounded-full transition hover:bg-[#A98920]"
              >
                {t('clearFilters')}
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map(p => (
                <Link key={p.id} href={`/shop/${p.id}`} className="group block bg-white rounded-2xl border border-[#E2DDD5] overflow-hidden hover:border-[#C5A028]/40 transition shadow-sm hover:shadow-md">
                  <div className="aspect-square bg-[#FAF9F5] relative overflow-hidden">
                    {p.media && p.media.length > 0 && p.media[0].type === 'image' ? (
                      <img src={p.media[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (p.image_url || p.images?.[0]) ? (
                      <img src={p.image_url || p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-700" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#8C7E7E]">No Image</div>
                    )}
                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-md border border-[#E2DDD5] px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-[#C5A028]">{p.category}</div>
                  </div>
                  <div className="p-5 flex flex-col justify-between" style={{ minHeight: '140px' }}>
                    <div>
                      <h3 className="font-semibold text-[#2C1F1F] text-base leading-tight mb-2 group-hover:text-[#C5A028] transition-colors line-clamp-2">{p.name}</h3>
                      <p className="text-sm text-[#6E6262] line-clamp-1 mb-3">{p.description}</p>
                    </div>
                    <div className="flex items-center justify-between mt-auto">
                      <p className="font-mono text-lg text-[#C5A028] font-bold">₹{p.price?.toLocaleString()}</p>
                      <div className="w-8 h-8 rounded-full bg-[#F5F2EB] flex items-center justify-center group-hover:bg-[#C5A028] group-hover:text-white transition-colors text-[#2C1F1F]">
                        <ArrowRight className="w-4 h-4" />
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
