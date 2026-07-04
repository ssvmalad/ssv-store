"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Users, Mail, Phone, Calendar, Loader2, X, Package, ShoppingBag, ExternalLink, Search, Filter } from 'lucide-react';

export default function CustomersPage() {
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Modal state
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [customerOrders, setCustomerOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(false);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState('');
  const [filterProvider, setFilterProvider] = useState('all');
  const [sortOrder, setSortOrder] = useState('newest');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (err) {
      console.error(err);
      setError('Failed to load customers from database.');
    } finally {
      setLoading(false);
    }
  };

  const openCustomerModal = async (customer) => {
    setSelectedCustomer(customer);
    setOrdersLoading(true);
    try {
      let url = `/api/orders?email=${encodeURIComponent(customer.email || '')}`;
      if (customer.phone) {
        url += `&phone=${encodeURIComponent(customer.phone)}`;
      }
      const response = await fetch(url);
      const data = await response.json();
      setCustomerOrders(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load customer orders:', err);
      setCustomerOrders([]);
    } finally {
      setOrdersLoading(false);
    }
  };

  const filteredCustomers = customers
    .filter(c => {
      const q = searchQuery.toLowerCase();
      const matchesSearch = c.email?.toLowerCase().includes(q) || c.phone?.includes(q) || c.id?.toLowerCase().includes(q);
      const provider = c.provider || 'email';
      const matchesProvider = filterProvider === 'all' || provider === filterProvider;
      return matchesSearch && matchesProvider;
    })
    .sort((a, b) => {
      if (sortOrder === 'newest') return new Date(b.created_at) - new Date(a.created_at);
      return new Date(a.created_at) - new Date(b.created_at);
    });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-8">
        <div className="p-3 bg-[#C5A028]/10 rounded-xl">
          <Users className="w-6 h-6 text-[#C5A028]" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-white">Registered Customers</h1>
          <p className="text-[#A09393] text-sm mt-1">View users who have created an account.</p>
        </div>
      </div>

      {/* Filters Toolbar */}
      <div className="flex flex-col md:flex-row gap-4 mb-6 bg-[#1C1212] p-4 rounded-2xl border border-[#3D2828] shadow-lg">
        <div className="flex-1 relative">
          <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09393]" />
          <input 
            type="text" 
            placeholder="Search by email, phone, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#2C1F1F] border border-[#3D2828] rounded-xl text-sm text-white placeholder-[#8C7E7E] focus:outline-none focus:border-[#C5A028] transition"
          />
        </div>
        <div className="flex gap-4">
          <div className="relative">
            <select
              value={filterProvider}
              onChange={(e) => setFilterProvider(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-[#2C1F1F] border border-[#3D2828] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A028] transition appearance-none cursor-pointer w-full"
            >
              <option value="all">All Methods</option>
              <option value="email">Email / Phone</option>
              <option value="google">Google</option>
            </select>
            <Filter className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7E7E] pointer-events-none" />
          </div>
          <div className="relative">
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
              className="pl-4 pr-10 py-2.5 bg-[#2C1F1F] border border-[#3D2828] rounded-xl text-sm text-white focus:outline-none focus:border-[#C5A028] transition appearance-none cursor-pointer w-full"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
            </select>
            <Calendar className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-[#8C7E7E] pointer-events-none" />
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-4 rounded-xl mb-6 text-sm">
          {error}
        </div>
      )}

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="w-8 h-8 text-[#C5A028] animate-spin" />
        </div>
      ) : filteredCustomers.length === 0 ? (
        <div className="bg-[#1C1212] border border-[#3D2828] rounded-2xl p-12 text-center">
          <Users className="w-12 h-12 text-[#3D2828] mx-auto mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No customers found</h3>
          <p className="text-[#A09393] text-sm max-w-md mx-auto">
            {customers.length === 0 ? 'When users create an account on your store, they will appear here automatically.' : 'No customers match your search filters.'}
          </p>
        </div>
      ) : (
        <div className="bg-[#1C1212] border border-[#3D2828] rounded-2xl overflow-hidden shadow-xl">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#3D2828] bg-[#2C1F1F]">
                  <th className="px-6 py-4 text-xs font-bold text-[#A09393] uppercase tracking-wider">Email Address</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#A09393] uppercase tracking-wider">Linked Phone</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#A09393] uppercase tracking-wider">Signup Method</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#A09393] uppercase tracking-wider">Joined Date</th>
                  <th className="px-6 py-4 text-xs font-bold text-[#A09393] uppercase tracking-wider">Customer ID</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#3D2828]">
                {filteredCustomers.map((customer) => (
                  <tr 
                    key={customer.id} 
                    className="hover:bg-[#2C1F1F]/50 transition cursor-pointer"
                    onClick={() => openCustomerModal(customer)}
                  >
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Mail className="w-4 h-4 text-[#C5A028]" />
                        <span className="text-sm font-semibold text-white">{customer.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {customer.phone ? (
                        <div className="flex items-center gap-2">
                          <Phone className="w-4 h-4 text-emerald-500" />
                          <span className="text-sm font-mono text-emerald-400">{customer.phone}</span>
                        </div>
                      ) : (
                        <span className="text-sm text-[#8C7E7E] italic">Not linked</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                        customer.provider === 'google' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 
                        'bg-[#C5A028]/10 text-[#C5A028] border border-[#C5A028]/20'
                      }`}>
                        {customer.provider || 'email'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-[#8C7E7E]" />
                        <span className="text-sm text-[#A09393]">
                          {new Date(customer.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-xs font-mono text-[#6E6262] bg-[#2C1F1F] px-2 py-1 rounded-md">
                        {customer.id.substring(0, 8)}...
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Customer Details Modal */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1212] border border-[#3D2828] w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col max-h-[90vh]">
            
            {/* Modal Header */}
            <div className="p-6 border-b border-[#3D2828] flex items-start justify-between shrink-0">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-[#2C1F1F] flex items-center justify-center border border-[#3D2828]">
                  <Users className="w-6 h-6 text-[#A09393]" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white mb-1">Customer Details</h2>
                  <div className="flex items-center gap-3 text-sm text-[#A09393]">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {selectedCustomer.email}</span>
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setSelectedCustomer(null)}
                className="p-2 hover:bg-[#2C1F1F] rounded-xl transition text-[#A09393] hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto custom-scrollbar flex-1">
              <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-[#2C1F1F] p-4 rounded-xl border border-[#3D2828]">
                  <p className="text-xs text-[#8C7E7E] font-bold uppercase tracking-wider mb-1">Signup Method</p>
                  <p className="text-white font-medium capitalize">{selectedCustomer.provider || 'email'}</p>
                </div>
                <div className="bg-[#2C1F1F] p-4 rounded-xl border border-[#3D2828]">
                  <p className="text-xs text-[#8C7E7E] font-bold uppercase tracking-wider mb-1">Linked Phone</p>
                  <p className="text-white font-medium">{selectedCustomer.phone || 'None'}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-[#C5A028]" />
                <h3 className="text-lg font-bold text-white">Order History</h3>
              </div>

              {ordersLoading ? (
                <div className="flex justify-center py-12">
                  <Loader2 className="w-8 h-8 text-[#C5A028] animate-spin" />
                </div>
              ) : customerOrders.length === 0 ? (
                <div className="bg-[#2C1F1F]/50 border border-[#3D2828] rounded-xl p-8 text-center">
                  <ShoppingBag className="w-10 h-10 text-[#3D2828] mx-auto mb-3" />
                  <p className="text-[#A09393] text-sm">This customer hasn't placed any orders yet.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {customerOrders.map(order => (
                    <div key={order.id} className="bg-[#2C1F1F] border border-[#3D2828] rounded-xl p-4 hover:border-[#C5A028]/50 transition">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <span className="text-white font-bold block mb-1">{order.id}</span>
                          <span className="text-xs text-[#A09393]">{new Date(order.created_at).toLocaleDateString()}</span>
                        </div>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full ${
                          order.status === 'delivered' ? 'bg-emerald-500/10 text-emerald-400' :
                          order.status === 'cancelled' ? 'bg-red-500/10 text-red-400' :
                          'bg-[#C5A028]/10 text-[#C5A028]'
                        }`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="flex justify-between items-end border-t border-[#3D2828] pt-3 mt-3">
                        <span className="text-sm text-[#A09393]">{order.items.length} item(s)</span>
                        <span className="text-white font-bold font-mono">₹{order.total_price.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
