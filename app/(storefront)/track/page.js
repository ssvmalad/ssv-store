"use client";

import React, { useState, useEffect } from 'react';
import { Search, Package, Clock, CheckCircle2, Truck, AlertCircle, Edit2, Trash2, Save, X } from 'lucide-react';

export default function TrackOrderPage() {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Editing state
  const [isEditing, setIsEditing] = useState(false);
  const [editedItems, setEditedItems] = useState([]);
  const [isSaving, setIsSaving] = useState(false);
  const [delivery, setDelivery] = useState(null);

  const startEditing = () => {
    setEditedItems(JSON.parse(JSON.stringify(order.items || [])));
    setIsEditing(true);
  };

  const updateItemQty = (index, delta) => {
    const newItems = editedItems.map((item, i) => {
      if (i === index) {
        return { ...item, quantity: Math.max(1, item.quantity + delta) };
      }
      return item;
    });
    setEditedItems(newItems);
  };

  const removeItem = (index) => {
    const newItems = [...editedItems];
    newItems.splice(index, 1);
    setEditedItems(newItems);
  };

  const calculateEditedTotal = () => {
    return editedItems.reduce((acc, item) => acc + (item.price * item.quantity), 0);
  };

  const saveEdits = async () => {
    if (editedItems.length === 0) {
      setError("Order must have at least one item. To cancel, please contact support.");
      return;
    }
    setIsSaving(true);
    try {
      const newTotal = calculateEditedTotal();
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: order.id,
          items: editedItems,
          total_price: newTotal
        })
      });
      if (res.ok) {
        const updated = await res.json();
        setOrder(updated);
        setIsEditing(false);
      } else {
        setError("Failed to save changes.");
      }
    } catch (err) {
      setError("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const id = params.get('id');
      if (id) {
        setOrderId(id);
        fetchOrder(id);
      }
    }
  }, []);

  const fetchOrder = async (idToSearch) => {
    setLoading(true);
    setError('');
    setOrder(null);
    setDelivery(null);

    try {
      const res = await fetch(`/api/orders?id=${idToSearch.trim()}`);
      if (res.ok) {
        const foundOrder = await res.json();
        setOrder(foundOrder);

        // Fetch matched delivery
        try {
          const delivRes = await fetch('/api/deliveries');
          if (delivRes.ok) {
            const delivData = await delivRes.json();
            const matched = delivData.find(d => d.order_id?.toUpperCase() === idToSearch.trim().toUpperCase());
            setDelivery(matched || null);
          }
        } catch (e) {
          console.error("Failed to load delivery tracking:", e);
        }
      } else if (res.status === 404) {
        setError("We couldn't find an order with that ID. Please check and try again.");
      } else {
        setError("Something went wrong. Please try again later.");
      }
    } catch (err) {
      setError("Failed to fetch order. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!orderId.trim()) return;
    fetchOrder(orderId);
  };

  const getStatusDisplay = (status) => {
    switch(status?.toLowerCase()) {
      case 'pending':
        return { label: 'Order Received', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-500/10' };
      case 'confirmed':
        return { label: 'Order Approved & Confirmed', icon: CheckCircle2, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'working':
        return { label: 'Working on it', icon: Package, color: 'text-blue-500', bg: 'bg-blue-500/10' };
      case 'ready':
        return { label: 'Ready for Dispatch/Pickup', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10' };
      case 'dispatched':
        return { label: 'Dispatched', icon: Truck, color: 'text-purple-500', bg: 'bg-purple-500/10' };
      case 'delivered':
      case 'completed':
        return { label: 'Completed', icon: CheckCircle2, color: 'text-gray-500', bg: 'bg-gray-500/10' };
      case 'cancelled':
      case 'rejected':
        return { label: 'Request Rejected / Cancelled', icon: AlertCircle, color: 'text-rose-500', bg: 'bg-rose-500/10' };
      default:
        return { label: status || 'Unknown', icon: AlertCircle, color: 'text-gray-500', bg: 'bg-gray-500/10' };
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-extrabold tracking-tighter text-[#1C1212] mb-4">Track Your Order</h1>
        <p className="text-[#6E6262]">Enter your Order ID below to check its current status.</p>
      </div>

      <div className="bg-white rounded-3xl p-6 md:p-8 shadow-sm border border-[#E2DDD5] mb-8">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#A09393]" />
            <input 
              type="text" 
              placeholder="e.g. SSV-1234" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
              className="w-full pl-12 pr-4 py-4 bg-[#FAF9F5] border border-[#E2DDD5] rounded-2xl text-[#1C1212] focus:outline-none focus:border-[#C5A028] transition font-mono uppercase"
            />
          </div>
          <button 
            type="submit"
            disabled={loading || !orderId.trim()}
            className="px-8 py-4 bg-[#1C1212] text-white font-bold rounded-2xl hover:bg-black transition disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            {loading ? 'Searching...' : 'Track Order'}
          </button>
        </form>

        {error && (
          <div className="mt-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-start gap-3 text-red-600 text-sm">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {order && (
          <div className="mt-10 border-t border-[#E2DDD5] pt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
              <div>
                <p className="text-sm font-semibold text-[#8C7E7E] uppercase tracking-wider mb-1">Order Details</p>
                <h3 className="text-2xl font-black text-[#1C1212] font-mono">{order.id}</h3>
              </div>
              <div className="text-left md:text-right">
                <p className="text-sm font-semibold text-[#8C7E7E] uppercase tracking-wider mb-1">Order Date</p>
                <p className="font-semibold text-[#1C1212]">{new Date(order.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Status Highlight */}
            {(() => {
              const statusInfo = getStatusDisplay(order.status);
              const StatusIcon = statusInfo.icon;
              return (
                <div className={`p-6 rounded-2xl border ${statusInfo.bg.replace('/10', '/30')} ${statusInfo.bg} flex items-center gap-4 mb-8`}>
                  <div className={`p-3 rounded-xl bg-white shadow-sm ${statusInfo.color}`}>
                    <StatusIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-[#8C7E7E] uppercase tracking-wider mb-1">Current Status</p>
                    <p className={`text-xl font-black ${statusInfo.color}`}>{statusInfo.label}</p>
                  </div>
                </div>
              );
            })()}

            {/* Delivery Courier Tracking */}
            {delivery && (
              <div className="p-6 rounded-2xl border border-[#E2DDD5] bg-[#FAF9F5] flex items-center gap-4 mb-8">
                <div className="p-3 rounded-xl bg-white shadow-sm text-[#C5A028]">
                  <Truck className="w-8 h-8" />
                </div>
                <div>
                  <p className="text-sm font-bold text-[#8C7E7E] uppercase tracking-wider mb-1">Courier Delivery Tracking</p>
                  <p className="text-lg font-black text-[#1C1212] capitalize">
                    Status: <span className="text-[#C5A028]">{delivery.status}</span>
                    {delivery.carrier && ` via ${delivery.carrier}`}
                  </p>
                  {delivery.tracking_number && (
                    <p className="text-xs text-[#6E6262] mt-1 font-mono">
                      Tracking Link: <a 
                        href={delivery.carrier?.toLowerCase().includes('dtdc') ? `https://www.dtdc.in/tracking/tracking_results.asp?pinno=${delivery.tracking_number}` : '#'} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-[#C5A028] underline font-bold"
                      >
                        {delivery.tracking_number}
                      </a>
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Order Items Summary */}
            <div className="bg-[#FAF9F5] border border-[#E2DDD5] rounded-2xl p-6 relative">
              <div className="flex justify-between items-center mb-4">
                <h4 className="font-bold text-[#1C1212]">Items Summary</h4>
                {order.status === 'pending' && !isEditing && (
                  <button 
                    onClick={startEditing}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-[#C5A028]/10 text-[#C5A028] hover:bg-[#C5A028]/20 rounded-lg text-xs font-bold transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Request
                  </button>
                )}
                {isEditing && (
                  <button 
                    onClick={() => setIsEditing(false)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-200 text-gray-700 hover:bg-gray-300 rounded-lg text-xs font-bold transition"
                  >
                    <X className="w-3.5 h-3.5" /> Cancel
                  </button>
                )}
              </div>
              <div className="divide-y divide-[#E2DDD5]">
                {(isEditing ? editedItems : order.items)?.map((item, idx) => (
                  <div key={idx} className="py-3 flex justify-between items-center text-sm">
                    {isEditing ? (
                      <div className="flex-1 flex items-center justify-between gap-4">
                        <span className="font-semibold text-[#1C1212] truncate pr-2">{item.name}</span>
                        <div className="flex items-center gap-3 shrink-0">
                          <div className="flex items-center bg-white border border-[#E2DDD5] rounded-lg p-0.5">
                            <button onClick={() => updateItemQty(idx, -1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md text-[#1C1212] font-mono">-</button>
                            <span className="w-6 text-center font-mono text-[#1C1212]">{item.quantity}</span>
                            <button onClick={() => updateItemQty(idx, 1)} className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 rounded-md text-[#1C1212] font-mono">+</button>
                          </div>
                          <span className="font-mono text-[#1C1212] font-bold w-16 text-right">₹{(item.price * item.quantity).toLocaleString()}</span>
                          <button onClick={() => removeItem(idx)} className="text-red-400 hover:text-red-600 p-1">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <span className="font-semibold text-[#6E6262]">{item.quantity}x {item.name}</span>
                        <span className="font-mono text-[#1C1212] font-bold">₹{(item.price * item.quantity).toLocaleString()}</span>
                      </>
                    )}
                  </div>
                ))}
              </div>
              <div className="border-t border-[#E2DDD5] pt-4 mt-2 flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-[#1C1212]">Total Amount</span>
                  <span className="font-mono text-lg font-black text-[#C5A028]">
                    ₹{(isEditing ? calculateEditedTotal() : order.total_price)?.toLocaleString()}
                  </span>
                </div>
                {isEditing && (
                  <button 
                    onClick={saveEdits}
                    disabled={isSaving || editedItems.length === 0}
                    className="w-full py-3 bg-[#1C1212] hover:bg-black text-white font-bold rounded-xl flex items-center justify-center gap-2 transition disabled:opacity-50 shadow-md"
                  >
                    {isSaving ? 'Saving...' : <><Save className="w-4.5 h-4.5" /> Save Order Changes</>}
                  </button>
                )}
              </div>
            </div>
            
            <div className="mt-8 text-center text-sm text-[#8C7E7E]">
              If you have any questions, please reply to us on WhatsApp or call our support.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
