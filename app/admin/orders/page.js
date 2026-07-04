"use client";

import React, { useState, useEffect } from 'react';
import { 
  ShoppingCart, Edit2, Trash2, CheckCircle2, XCircle, Clock, 
  Truck, ChevronDown, User, Phone, MapPin, IndianRupee, 
  RefreshCw, Barcode, ShieldAlert, Search, MessageCircle, Send
} from 'lucide-react';

export default function AdminOrdersDeliveriesPage() {
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' or 'deliveries'
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Orders modals & forms
  const [editingOrder, setEditingOrder] = useState(null);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('pending');
  const [selectedPaymentStatus, setSelectedPaymentStatus] = useState('pending');
  const [orderSearchQuery, setOrderSearchQuery] = useState('');
  const [customReplies, setCustomReplies] = useState({});

  // Deliveries modals & forms
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'pending',
    carrier: 'DTDC Express',
    tracking_number: ''
  });
  const [deliverySearchQuery, setDeliverySearchQuery] = useState('');
  
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    setLoading(true);
    if (activeTab === 'orders') {
      await fetchOrders();
    } else {
      await fetchDeliveries();
    }
    setLoading(false);
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch('/api/orders');
      if (res.ok) {
        const data = await res.json();
        setOrders(data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)));
      }
    } catch (error) {
      showToast("Failed to fetch orders", "error");
    }
  };

  const fetchDeliveries = async () => {
    try {
      const res = await fetch('/api/deliveries');
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      }
    } catch (error) {
      showToast("Failed to fetch deliveries", "error");
    }
  };

  // Orders callbacks
  const handleUpdateStatus = async () => {
    if (!editingOrder) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingOrder.id,
          status: selectedStatus,
          payment_status: selectedPaymentStatus
        })
      });
      if (res.ok) {
        showToast(`Order updated successfully!`);
        fetchOrders();
        setShowStatusModal(false);
        setEditingOrder(null);
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleApproveRequest = async (order) => {
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'confirmed' })
      });
      if (res.ok) {
        showToast(`Order Request Approved!`);
        fetchOrders();
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleRejectRequest = async (order) => {
    if (!confirm("Are you sure you want to reject this request due to stock unavailability?")) return;
    try {
      const res = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: order.id, status: 'cancelled' })
      });
      if (res.ok) {
        showToast(`Order Request Rejected.`);
        fetchOrders();
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDeleteOrder = async (id) => {
    if (!confirm("Are you sure you want to delete this order?")) return;
    try {
      const res = await fetch(`/api/orders?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Order deleted successfully");
        fetchOrders();
      }
    } catch (err) {
      showToast("Failed to delete order", "error");
    }
  };

  const handleWhatsAppReply = async (order, message, newStatus = null) => {
    let finalPhone = order.customer_phone || "";
    // Clean phone number
    finalPhone = finalPhone.replace(/\D/g, '');
    if (finalPhone && !finalPhone.startsWith('91')) {
      finalPhone = '91' + finalPhone; // Assuming India for now
    }
    
    // Update status if provided
    if (newStatus && newStatus !== order.status) {
      try {
        const res = await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: order.id,
            status: newStatus
          })
        });
        if (res.ok) {
          showToast(`Order status updated to ${newStatus}`);
          fetchOrders();
        }
      } catch (err) {
        showToast("Failed to update status", "error");
      }
    }
    
    if (finalPhone) {
      window.open(`https://wa.me/${finalPhone}?text=${encodeURIComponent(message)}`, '_blank');
    } else {
      showToast("Customer phone number is missing or invalid", "error");
    }
  };

  const handleCreateDelivery = async (order) => {
    try {
      const delivRes = await fetch('/api/deliveries');
      if (delivRes.ok) {
        const deliveriesData = await delivRes.json();
        const exists = deliveriesData.some(d => d.order_id === order.id);
        if (exists) {
          showToast("Delivery task already exists for this order", "error");
          return;
        }
      }

      const res = await fetch('/api/deliveries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          order_id: order.id,
          customer_name: order.customer_name,
          customer_phone: order.customer_phone,
          customer_address: order.customer_address,
          status: 'pending',
          carrier: 'DTDC Express',
          tracking_number: ''
        })
      });
      if (res.ok) {
        showToast("Delivery task created! Switch to Deliveries tab to track.");
        await fetch('/api/orders', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: order.id, status: 'dispatched' })
        });
        fetchOrders();
      }
    } catch (err) {
      showToast("Failed to create delivery", "error");
    }
  };

  // Deliveries callbacks
  const handleUpdateDelivery = async (e) => {
    e.preventDefault();
    if (!editingDelivery) return;
    
    try {
      const res = await fetch('/api/deliveries', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingDelivery.id,
          status: editForm.status,
          carrier: editForm.carrier,
          tracking_number: editForm.tracking_number
        })
      });
      if (res.ok) {
        showToast("Delivery details updated successfully!");
        if (editForm.status === 'delivered') {
          await fetch('/api/orders', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingDelivery.order_id, status: 'delivered' })
          });
        }
        fetchDeliveries();
        setShowEditModal(false);
        setEditingDelivery(null);
      }
    } catch (err) {
      showToast("Update failed", "error");
    }
  };

  const handleDeleteDelivery = async (id) => {
    if (!confirm("Are you sure you want to delete this delivery log?")) return;
    try {
      const res = await fetch(`/api/deliveries?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast("Delivery log deleted successfully");
        fetchDeliveries();
      }
    } catch (err) {
      showToast("Failed to delete log", "error");
    }
  };

  // Badge helpers
  const getOrderStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20"><Clock className="w-3 h-3" /> PENDING</span>;
      case 'confirmed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-400/10 text-blue-400 border border-blue-400/20"><CheckCircle2 className="w-3 h-3" /> CONFIRMED</span>;
      case 'dispatched':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-400/10 text-purple-400 border border-purple-400/20"><Truck className="w-3 h-3" /> DISPATCHED</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><CheckCircle2 className="w-3 h-3" /> DELIVERED</span>;
      case 'cancelled':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-400/10 text-rose-400 border border-rose-400/20"><XCircle className="w-3 h-3" /> CANCELLED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-400/10 text-zinc-400 border border-zinc-400/20">UNKNOWN</span>;
    }
  };

  const getDeliveryStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-400/10 text-amber-400 border border-amber-400/20"><Clock className="w-3 h-3" /> PENDING</span>;
      case 'in-transit':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-400/10 text-blue-400 border border-blue-400/20"><Truck className="w-3 h-3" /> IN TRANSIT</span>;
      case 'out-for-delivery':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-400/10 text-purple-400 border border-purple-400/20"><Truck className="w-3 h-3" /> OUT FOR DELIVERY</span>;
      case 'delivered':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-400/10 text-emerald-400 border border-emerald-400/20"><CheckCircle2 className="w-3 h-3" /> DELIVERED</span>;
      case 'failed':
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-400/10 text-rose-400 border border-rose-400/20"><XCircle className="w-3 h-3" /> FAILED</span>;
      default:
        return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-zinc-400/10 text-zinc-400 border border-zinc-400/20">UNKNOWN</span>;
    }
  };

  // Filter handlers
  const filteredOrders = orders.filter(o => 
    (o.customer_name?.toLowerCase().includes(orderSearchQuery.toLowerCase()) || '') ||
    (o.customer_phone?.includes(orderSearchQuery) || '') ||
    (o.id?.toString().includes(orderSearchQuery) || '')
  );

  const filteredDeliveries = deliveries.filter(d => 
    (d.customer_name?.toLowerCase().includes(deliverySearchQuery.toLowerCase()) || '') ||
    (d.customer_phone?.includes(deliverySearchQuery) || '') ||
    (d.tracking_number?.toLowerCase().includes(deliverySearchQuery.toLowerCase()) || '') ||
    (d.order_id?.toString().includes(deliverySearchQuery) || '')
  );

  return (
    <div className="p-6 lg:p-8 space-y-8 min-h-screen bg-[#0F0A0A] text-[#F3EFE0]">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-xl border text-sm font-semibold shadow-lg transition-all duration-300 ${
          toast.type === 'error' ? 'bg-rose-950/80 border-rose-500/30 text-rose-400' : 'bg-emerald-950/80 border-emerald-500/30 text-emerald-400'
        }`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tighter text-white flex items-center gap-2">
            <ShoppingCart className="w-8 h-8 text-[#D4AF37]" /> Sales & Dispatch Center
          </h1>
          <p className="text-xs text-[#A09393] uppercase tracking-wider mt-1">Manage storefront checkouts, WhatsApp sales, and DTDC parcel shipments</p>
        </div>
        <button 
          onClick={fetchData}
          className="flex items-center gap-2 px-4 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-xl hover:bg-[#1C1212] transition font-bold text-xs"
        >
          <RefreshCw className="w-4 h-4 text-[#D4AF37]" /> Refresh Logs
        </button>
      </div>

      {/* Tab Selectors */}
      <div className="flex gap-3 mb-6">
        <button
          onClick={() => setActiveTab('orders')}
          className={`px-5 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-xl border ${activeTab === 'orders' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-transparent text-[#A09393] hover:text-white hover:bg-[#1C1212] hover:border-[#2C1E1E]'}`}
        >
          <ShoppingCart className="w-4 h-4" /> Customer Bookings ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-5 py-3 text-sm font-bold transition-all flex items-center gap-2 rounded-xl border ${activeTab === 'deliveries' ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.15)]' : 'border-transparent text-[#A09393] hover:text-white hover:bg-[#1C1212] hover:border-[#2C1E1E]'}`}
        >
          <Truck className="w-4 h-4" /> Logistics Dispatches ({deliveries.length})
        </button>
      </div>

      {/* Tab 1: Orders Dashboard */}
      {activeTab === 'orders' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09393]" />
            <input 
              type="text" 
              placeholder="Search orders by customer name, phone, ID..." 
              value={orderSearchQuery}
              onChange={(e) => setOrderSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-sm tracking-widest text-[#D4AF37] animate-pulse">
              RETRIEVING CUSTOMER ORDERS...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl p-12 text-center text-[#A09393]">
              No active bookings found matching the query.
            </div>
          ) : (
            <div className="space-y-6">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl overflow-hidden shadow-xl">
                  {/* Order Top Bar */}
                  <div className="p-4 sm:p-6 border-b border-[#2C1E1E] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#1C1212]/50">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-lg font-bold text-white">#{order.id}</span>
                        {getOrderStatusBadge(order.status)}
                      </div>
                      <p className="text-[10px] text-[#A09393] font-mono">
                        Placed: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {order.status === 'pending' ? (
                        <>
                          <button 
                            onClick={() => handleApproveRequest(order)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-lg transition shadow-sm"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve Request
                          </button>
                          <button 
                            onClick={() => handleRejectRequest(order)}
                            className="flex items-center gap-1.5 px-4 py-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold rounded-lg transition shadow-sm"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => {
                            setEditingOrder(order);
                            setSelectedStatus(order.status);
                            setSelectedPaymentStatus(order.payment_status || 'pending');
                            setShowStatusModal(true);
                          }}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#1C1212] border border-[#2C1E1E] hover:border-[#D4AF37] text-xs font-semibold rounded-lg transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" /> Status
                        </button>
                      )}
                      {order.status === 'confirmed' && (
                        <button 
                          onClick={() => handleCreateDelivery(order)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37]/10 border border-[#D4AF37]/30 hover:bg-[#D4AF37]/20 text-[#D4AF37] text-xs font-semibold rounded-lg transition"
                        >
                          <Truck className="w-3.5 h-3.5" /> Create Delivery Task
                        </button>
                      )}
                      <button 
                        onClick={() => handleDeleteOrder(order.id)}
                        className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-lg transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Order Info grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-[#2C1E1E]">
                    {/* Customer Details */}
                    <div className="p-6 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A09393] border-b border-[#2C1E1E] pb-2">Customer details</h4>
                      <div className="space-y-3 text-sm">
                        <div className="flex items-start gap-2.5">
                          <User className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="font-semibold text-white">{order.customer_name}</span>
                        </div>
                        {order.customer_phone && (
                          <div className="flex items-center gap-2.5">
                            <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                            <a href={`tel:${order.customer_phone}`} className="hover:underline font-mono">{order.customer_phone}</a>
                          </div>
                        )}
                        {order.customer_address && (
                          <div className="flex items-start gap-2.5">
                            <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                            <span className="text-[#A09393] leading-relaxed text-xs">{order.customer_address}</span>
                          </div>
                        )}
                        <div className="border-t border-[#2C1E1E] pt-3 mt-3 space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="text-[#A09393]">Payment Method:</span>
                            <span className="font-semibold text-white uppercase">{order.payment_method || 'WhatsApp'}</span>
                          </div>
                          <div className="flex justify-between text-xs">
                            <span className="text-[#A09393]">Payment Status:</span>
                            <span className={`font-semibold uppercase ${
                              order.payment_status === 'paid' 
                                ? 'text-emerald-400' 
                                : order.payment_status === 'pending_verification' 
                                  ? 'text-yellow-400 font-bold' 
                                  : 'text-amber-400'
                            }`}>
                              {(order.payment_status || 'Pending').replace('_', ' ')}
                            </span>
                          </div>
                          {order.payment_ref && (
                            <div className="flex justify-between text-xs pt-1 border-t border-[#2C1E1E] mt-1">
                              <span className="text-[#A09393]">UTR Ref No:</span>
                              <span className="font-mono text-white select-all font-semibold">{order.payment_ref}</span>
                            </div>
                          )}
                        </div>
                        {order.special_instructions && (
                          <div className="border-t border-[#2C1E1E] pt-3 mt-3 space-y-1">
                            <span className="block text-[10px] font-bold uppercase text-[#A09393]">Special Instructions:</span>
                            <p className="text-xs text-white bg-[#1C1212] p-2.5 rounded-lg border border-[#2C1E1E] whitespace-pre-wrap">{order.special_instructions}</p>
                          </div>
                        )}
                        {order.special_files && order.special_files.length > 0 && (
                          <div className="mt-2 space-y-1">
                            <span className="block text-[10px] font-bold uppercase text-[#A09393]">Files Attached ({order.special_files.length}):</span>
                            <div className="flex flex-col gap-1.5 pt-1">
                              {order.special_files.map((file, idx) => (
                                <a 
                                  key={idx}
                                  href={file.base64} 
                                  download={file.name} 
                                  className="text-[11px] text-[#D4AF37] hover:underline truncate flex items-center gap-1.5 font-mono bg-[#1C1212] px-2 py-1 rounded border border-[#2C1E1E]"
                                >
                                  📄 {file.name}
                                </a>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Items */}
                    <div className="p-6 md:col-span-2 space-y-4">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#A09393] border-b border-[#2C1E1E] pb-2">Purchased items</h4>
                      <div className="divide-y divide-[#2C1E1E]">
                        {order.items?.map((item, idx) => (
                          <div key={idx} className="py-3 flex items-center justify-between gap-4 first:pt-0 last:pb-0">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg bg-[#221616] border border-[#3D2828] flex-shrink-0 overflow-hidden flex items-center justify-center">
                                {item.image ? (
                                  <img src={item.image} className="w-full h-full object-cover" />
                                ) : (
                                  <span className="text-[10px] text-[#5A4B4B] font-mono">ITEM</span>
                                )}
                              </div>
                              <div>
                                <h5 className="font-semibold text-white text-sm">{item.name}</h5>
                                <span className="text-[10px] text-[#A09393] font-mono">Qty: {item.quantity} × ₹{item.price.toLocaleString()}</span>
                              </div>
                            </div>
                            <span className="font-mono text-sm font-bold text-white">₹{(item.price * item.quantity).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      <div className="border-t border-[#2C1E1E] pt-4 flex justify-between items-center bg-[#1C1212]/30 px-4 py-3 rounded-xl">
                        <span className="text-xs font-bold uppercase text-[#A09393]">Order Total</span>
                        <span className="font-mono text-lg font-bold text-[#D4AF37]">₹{order.total_price?.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                  
                  {/* WhatsApp Quick Replies */}
                  <div className="border-t border-[#2C1E1E] bg-[#1C1212]/50 p-6 rounded-b-2xl">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#A09393] mb-3 flex items-center gap-2">
                      <MessageCircle className="w-4 h-4 text-[#25D366]" /> Customer Communication
                    </h4>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      <button 
                        onClick={() => handleWhatsAppReply(order, `Hello ${order.customer_name},\n\nWe are currently working on your order (ID: ${order.id}). We will notify you once it's ready!`, 'working')}
                        className="px-3 py-1.5 bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/30 rounded-lg text-xs font-semibold hover:bg-[#25D366]/20 transition"
                      >
                        Notify: "Working on it"
                      </button>
                      <button 
                        onClick={() => handleWhatsAppReply(order, `Hello ${order.customer_name},\n\nYour order (ID: ${order.id}) is ready for dispatch/pickup!`, 'ready')}
                        className="px-3 py-1.5 bg-[#3B82F6]/10 text-[#3B82F6] border border-[#3B82F6]/30 rounded-lg text-xs font-semibold hover:bg-[#3B82F6]/20 transition"
                      >
                        Notify: "Ready"
                      </button>
                      <button 
                        onClick={() => handleWhatsAppReply(order, `Hello ${order.customer_name},\n\nThank you for choosing SSV! Your order (ID: ${order.id}) has been completed. We hope to see you again!`, 'completed')}
                        className="px-3 py-1.5 bg-[#8B5CF6]/10 text-[#8B5CF6] border border-[#8B5CF6]/30 rounded-lg text-xs font-semibold hover:bg-[#8B5CF6]/20 transition"
                      >
                        Notify: "Completed"
                      </button>
                    </div>

                    <div className="flex items-center gap-2">
                      <input 
                        type="text" 
                        value={customReplies[order.id] || ''}
                        onChange={(e) => setCustomReplies({...customReplies, [order.id]: e.target.value})}
                        placeholder="Type custom WhatsApp reply..." 
                        className="flex-1 bg-black/50 border border-[#2C1E1E] rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-[#D4AF37] transition"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && customReplies[order.id]) {
                            handleWhatsAppReply(order, customReplies[order.id]);
                            setCustomReplies({...customReplies, [order.id]: ''});
                          }
                        }}
                      />
                      <button 
                        onClick={() => {
                          if (customReplies[order.id]) {
                            handleWhatsAppReply(order, customReplies[order.id]);
                            setCustomReplies({...customReplies, [order.id]: ''});
                          }
                        }}
                        disabled={!customReplies[order.id]}
                        className="p-2.5 bg-[#D4AF37] text-black rounded-xl hover:bg-[#C5A028] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center shrink-0"
                      >
                        <Send className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Deliveries Dashboard */}
      {activeTab === 'deliveries' && (
        <div className="space-y-6">
          {/* Search bar */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09393]" />
            <input 
              type="text" 
              placeholder="Search deliveries by name, tracking, order ID..." 
              value={deliverySearchQuery}
              onChange={(e) => setDeliverySearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37] transition"
            />
          </div>

          {loading ? (
            <div className="text-center py-20 font-mono text-sm tracking-widest text-[#D4AF37] animate-pulse">
              RETRIEVING DISPATCH LOGS...
            </div>
          ) : filteredDeliveries.length === 0 ? (
            <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl p-12 text-center text-[#A09393]">
              No dispatch shipments registered or matching current filters.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {filteredDeliveries.map((deliv) => (
                <div key={deliv.id} className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
                  {/* Delivery Top Header */}
                  <div className="p-5 border-b border-[#2C1E1E] bg-[#1C1212]/50 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-[#A09393] uppercase font-mono block">Order Linkage</span>
                      <span className="font-mono text-sm font-bold text-white">Order Reference: #{deliv.order_id}</span>
                    </div>
                    {getDeliveryStatusBadge(deliv.status)}
                  </div>

                  {/* Delivery Card details */}
                  <div className="p-6 space-y-4 flex-1">
                    <div className="space-y-2.5 text-sm text-[#C5B3B3]">
                      <div className="flex items-start gap-2.5">
                        <User className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                        <span className="font-semibold text-white">{deliv.customer_name}</span>
                      </div>
                      {deliv.customer_phone && (
                        <div className="flex items-center gap-2.5">
                          <Phone className="w-4 h-4 text-[#D4AF37] shrink-0" />
                          <span className="font-mono">{deliv.customer_phone}</span>
                        </div>
                      )}
                      {deliv.customer_address && (
                        <div className="flex items-start gap-2.5">
                          <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                          <span className="text-xs text-[#A09393] leading-relaxed">{deliv.customer_address}</span>
                        </div>
                      )}
                    </div>

                    <div className="h-px bg-[#2C1E1E] my-3"></div>

                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between items-center">
                        <span className="text-[#A09393] text-xs uppercase tracking-wider font-semibold">Carrier</span>
                        <span className="text-white font-bold">{deliv.carrier || 'DTDC Express'}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-[#A09393] text-xs uppercase tracking-wider font-semibold">Tracking Code</span>
                        <span className="font-mono text-white text-xs bg-[#1C1212] px-2.5 py-1 rounded border border-[#2C1E1E]">
                          {deliv.tracking_number || 'NOT ASSIGNED'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Delivery Footer */}
                  <div className="px-5 py-4 border-t border-[#2C1E1E] bg-[#120B0B]/50 flex justify-end gap-2 shrink-0">
                    <button
                      onClick={() => {
                        setEditingDelivery(deliv);
                        setEditForm({
                          status: deliv.status,
                          carrier: deliv.carrier || 'DTDC Express',
                          tracking_number: deliv.tracking_number || ''
                        });
                        setShowEditModal(true);
                      }}
                      className="flex items-center gap-1.5 px-3.5 py-1.5 bg-[#1C1212] border border-[#2C1E1E] hover:border-[#D4AF37] text-xs font-semibold rounded-lg text-white transition"
                    >
                      <Edit2 className="w-3.5 h-3.5" /> Update Dispatch
                    </button>
                    <button
                      onClick={() => handleDeleteDelivery(deliv.id)}
                      className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-lg transition"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Orders Edit Status Modal */}
      {showStatusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#2C1E1E] flex justify-between items-center">
              <h3 className="font-bold text-white">Update Status: #{editingOrder?.id}</h3>
              <button onClick={() => setShowStatusModal(false)} className="text-[#A09393] hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-5">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393] mb-2">Select Status</label>
                <div className="grid grid-cols-2 gap-2">
                  {['pending', 'confirmed', 'dispatched', 'delivered', 'cancelled'].map((st) => (
                    <button
                      key={st}
                      type="button"
                      onClick={() => setSelectedStatus(st)}
                      className={`px-4 py-2.5 rounded-xl border text-[10px] font-bold uppercase transition ${
                        selectedStatus === st
                          ? 'bg-[#D4AF37]/10 border-[#D4AF37] text-[#D4AF37]'
                          : 'bg-[#1C1212] border-[#2C1E1E] text-[#A09393] hover:bg-[#221616]'
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393] mb-2">Payment Status</label>
                <div className="grid grid-cols-3 gap-2">
                  {['pending', 'pending_verification', 'paid'].map((ps) => (
                    <button
                      key={ps}
                      type="button"
                      onClick={() => setSelectedPaymentStatus(ps)}
                      className={`px-3 py-2.5 rounded-xl border text-[9px] font-bold uppercase transition ${
                        selectedPaymentStatus === ps
                          ? 'bg-emerald-500/10 border-emerald-500 text-emerald-400'
                          : 'bg-[#1C1212] border-[#2C1E1E] text-[#A09393] hover:bg-[#221616]'
                      }`}
                    >
                      {ps.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 bg-[#1C1212]/50 border-t border-[#2C1E1E] flex justify-end gap-3">
              <button 
                onClick={() => setShowStatusModal(false)}
                className="px-4 py-2 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-xs font-bold hover:bg-[#221616]"
              >
                Cancel
              </button>
              <button 
                onClick={handleUpdateStatus}
                className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#BFA030]"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Deliveries Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#2C1E1E] flex justify-between items-center">
              <h3 className="font-bold text-white">Update Dispatch: #{editingDelivery?.order_id}</h3>
              <button onClick={() => setShowEditModal(false)} className="text-[#A09393] hover:text-white"><XCircle className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleUpdateDelivery}>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393]">Shipping Status</label>
                  <select 
                    value={editForm.status} 
                    onChange={(e) => setEditForm({...editForm, status: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none cursor-pointer"
                  >
                    <option value="pending">Pending Dispatch</option>
                    <option value="in-transit">In Transit</option>
                    <option value="out-for-delivery">Out for Delivery</option>
                    <option value="delivered">Delivered Successfully</option>
                    <option value="failed">Delivery Failed</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393]">Courier Partner</label>
                  <input 
                    type="text" 
                    required
                    value={editForm.carrier}
                    onChange={(e) => setEditForm({...editForm, carrier: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none"
                    placeholder="e.g. DTDC Express, Blue Dart"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393]">Tracking Code / AWB</label>
                  <input 
                    type="text" 
                    value={editForm.tracking_number}
                    onChange={(e) => setEditForm({...editForm, tracking_number: e.target.value})}
                    className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm font-mono text-white focus:border-[#D4AF37] outline-none"
                    placeholder="e.g. AWB123456789"
                  />
                </div>
              </div>
              <div className="px-6 py-4 bg-[#1C1212]/50 border-t border-[#2C1E1E] flex justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-xs font-bold hover:bg-[#221616]"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-[#D4AF37] text-black font-bold text-xs rounded-xl hover:bg-[#BFA030]"
                >
                  Save Dispatch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
