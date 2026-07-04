"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
import { Package, CheckCircle, Tag, IndianRupee, ArrowRight, TrendingUp } from 'lucide-react';
import Link from 'next/link';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalProducts: 0,
    activeListings: 0,
    categories: 0,
    monthlyEarnings: 0
  });
  const [recentProducts, setRecentProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  async function fetchDashboardData() {
    setLoading(true);
    
    // Fetch all products to calculate stats and get recent ones
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      const activeCount = data.filter(p => p.is_available).length;
      const uniqueCategories = new Set(data.map(p => p.category)).size;
      const totalValue = data.reduce((acc, curr) => acc + (curr.price || 0), 0);
      
      setStats({
        totalProducts: data.length,
        activeListings: activeCount,
        categories: uniqueCategories,
        monthlyEarnings: 0 // Will be fetched from orders table later
      });
      
      setRecentProducts(data.slice(0, 5));
    }
    
    setLoading(false);
  }

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: Package, color: 'text-blue-400' },
    { title: 'Active Listings', value: stats.activeListings, icon: CheckCircle, color: 'text-emerald-400' },
    { title: 'Categories', value: stats.categories, icon: Tag, color: 'text-purple-400' },
    { title: 'Monthly Earnings', value: `₹${stats.monthlyEarnings.toLocaleString()}`, icon: TrendingUp, color: 'text-[#D4AF37]' },
  ];

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center h-[50vh]">
        <div className="text-[#D4AF37] font-mono tracking-widest animate-pulse text-sm">
          SYNCING DASHBOARD METRICS...
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 space-y-8">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((stat, idx) => (
          <div key={idx} className="bg-[#160F0F] rounded-2xl border border-[#2C1E1E] p-6 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37]/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs text-[#A09393] font-medium uppercase tracking-wider mb-2">{stat.title}</p>
                <h3 className="text-3xl font-semibold text-white tracking-tight">{stat.value}</h3>
              </div>
              <div className={`p-3 rounded-xl bg-[#1C1212] border border-[#2C1E1E] ${stat.color}`}>
                <stat.icon className="w-5 h-5" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Products */}
      <div className="bg-[#160F0F] rounded-2xl border border-[#2C1E1E] shadow-xl overflow-hidden">
        <div className="px-6 py-5 border-b border-[#2C1E1E] flex justify-between items-center">
          <h2 className="text-base font-semibold text-white tracking-tight flex items-center gap-2">
            <Package className="w-4 h-4 text-[#D4AF37]" />
            Recently Added
          </h2>
          <Link href="/admin/products" className="text-xs font-medium text-[#D4AF37] hover:text-[#FFF] transition flex items-center gap-1 group">
            View All Catalog
            <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
        
        {recentProducts.length === 0 ? (
          <div className="p-12 text-center text-sm text-[#A09393] italic">
            No products in the catalog yet.
          </div>
        ) : (
          <div className="divide-y divide-[#2C1E1E]">
            {recentProducts.map((product) => (
              <div key={product.id} className="p-4 px-6 flex items-center justify-between hover:bg-[#1C1212] transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-lg bg-[#221616] border border-[#3D2828] flex items-center justify-center overflow-hidden shrink-0">
                    {product.image_url ? (
                      <img src={product.image_url} alt={product.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition" />
                    ) : (
                      <Package className="w-5 h-5 text-[#5A4B4B]" />
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-white mb-0.5">{product.name}</h4>
                    <div className="flex items-center gap-2 text-[10px] uppercase tracking-wider font-medium text-[#A09393]">
                      <span>{product.category}</span>
                      {product.sub_category && (
                        <>
                          <span className="w-1 h-1 rounded-full bg-[#5A4B4B]"></span>
                          <span>{product.sub_category}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="font-mono text-sm text-white font-semibold mb-0.5">₹{product.price?.toLocaleString()}</div>
                    <div className="flex items-center justify-end gap-1.5 text-[10px] font-medium tracking-wide">
                      <span className={`w-1.5 h-1.5 rounded-full ${product.is_available ? 'bg-emerald-400 shadow-[0_0_5px_#34d399]' : 'bg-rose-400'}`}></span>
                      <span className={product.is_available ? 'text-emerald-400' : 'text-rose-400'}>
                        {product.is_available ? 'ACTIVE' : 'HIDDEN'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
    </div>
  );
}