"use client";

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function CategoriesPage() {
  const { t } = useLanguage();

  const categoriesList = [
    {
      id: 'Percussion',
      nameKey: 'catPercussion',
      descKey: 'catPercussionDesc',
      image: 'https://images.unsplash.com/photo-1519892300165-cb5542fb47c7?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Strings',
      nameKey: 'catStrings',
      descKey: 'catStringsDesc',
      image: 'https://images.unsplash.com/photo-1510915361894-db8b60106cb1?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Keys',
      nameKey: 'catKeys',
      descKey: 'catKeysDesc',
      image: 'https://images.unsplash.com/photo-1552422535-c45813c61732?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Accessories',
      nameKey: 'catAccessories',
      descKey: 'catAccessoriesDesc',
      image: 'https://images.unsplash.com/photo-1618609378039-b572f64c5b42?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Sticks',
      nameKey: 'catSticks',
      descKey: 'catSticksDesc',
      image: 'https://images.unsplash.com/photo-1517409217646-c0c451662df5?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Bags',
      nameKey: 'catBags',
      descKey: 'catBagsDesc',
      image: 'https://images.unsplash.com/photo-1627993077395-6a56c4d8ce84?q=80&w=600&auto=format&fit=crop',
    },
    {
      id: 'Stands',
      nameKey: 'catStands',
      descKey: 'catStandsDesc',
      image: 'https://images.unsplash.com/photo-1520523839897-bd0b52f945a0?q=80&w=600&auto=format&fit=crop',
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A028]/10 text-xs font-bold uppercase tracking-wider text-[#C5A028] mb-4">
          <Sparkles className="w-3 h-3" /> {t('navCategories')}
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F] mb-4">
          {t('navCategories')}
        </h1>
        <p className="text-[#6E6262] text-lg">
          {t('browseCategoryDesc')}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {categoriesList.map((cat) => (
          <Link 
            key={cat.id} 
            href={`/shop?category=${cat.id}`} 
            className="group relative h-96 rounded-2xl overflow-hidden bg-white border border-[#E2DDD5] hover:border-[#C5A028]/50 shadow-sm hover:shadow-md transition-all block"
          >
            <div className="absolute inset-0 bg-gradient-to-t from-[#2C1F1F]/70 via-[#2C1F1F]/20 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[#F5F2EB] group-hover:scale-105 transition-transform duration-700">
              <div 
                className="w-full h-full opacity-35 group-hover:opacity-45 transition-opacity duration-300" 
                style={{ backgroundImage: `url('${cat.image}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}
              ></div>
            </div>
            
            <div className="absolute bottom-0 left-0 p-8 z-20 w-full flex justify-between items-end">
              <div>
                <h3 className="text-2xl sm:text-3xl font-extrabold text-white mb-2 tracking-tight">{t(cat.nameKey)}</h3>
                <p className="text-sm text-white/80 max-w-sm">{t(cat.descKey)}</p>
              </div>
              <div className="w-6 h-6 rounded-full bg-white/40 backdrop-blur-sm border border-white/50 flex items-center justify-center text-white group-hover:bg-[#C5A028] group-hover:border-transparent transition-all duration-300 transform group-hover:translate-x-1">
                <ArrowRight className="w-3 h-3" />
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
