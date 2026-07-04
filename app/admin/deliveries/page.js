"use client";

import React, { useState, useEffect } from 'react';
import { Truck, Edit2, Trash2, CheckCircle2, XCircle, Clock, Search, ChevronDown, User, Phone, MapPin, Barcode, ShieldAlert, RefreshCw } from 'lucide-react';

export default function AdminDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingDelivery, setEditingDelivery] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editForm, setEditForm] = useState({
    status: 'pending',
    carrier: 'DTDC Express',
    tracking_number: ''
  });
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const fetchDeliveries = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/deliveries');
      if (res.ok) {
        const data = await res.json();
        setDeliveries(data.sort((a, b) => new Date(b.updated_at) - new Date(a.updated_at)));
      }
    } catch (error) {
      showToast("Failed to fetch deliveries", "error");
    } finally {
      setLoading(false);
    }
  };

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
        
        // Also update order status to delivered if delivery is marked delivered
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

  const getStatusBadge = (status) => {
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
            <Truck className="w-8 h-8 text-[#D4AF37]" /> Delivery Logistics
          </h1>
          <p className="text-xs text-[#A09393] uppercase tracking-wider mt-1">Trace courier dispatch, tracking codes and delivery handovers</p>
        </div>
        <button 
          onClick={fetchDeliveries}
          className="flex items-center gap-2 px-4 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-xl hover:bg-[#1C1212] transition font-bold text-xs"
        >
          <RefreshCw className="w-4 h-4 text-[#D4AF37]" /> Refresh List
        </button>
      </div>

      {loading ? (
        <div className="text-center py-20 font-mono text-sm tracking-widest text-[#D4AF37] animate-pulse">
          LOADING SHIPMENT LOGS...
        </div>
      ) : deliveries.length === 0 ? (
        <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl p-12 text-center text-[#A09393]">
          No active shipments registered. Dispatched orders will trigger a delivery log.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {deliveries.map((deliv) => (
            <div key={deliv.id} className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl overflow-hidden shadow-xl flex flex-col justify-between">
              
              {/* Delivery Top Header */}
              <div className="p-5 border-b border-[#2C1E1E] bg-[#1C1212]/50 flex justify-between items-center">
                <div>
                  <span className="font-mono text-sm font-bold text-white block">{deliv.id}</span>
                  <span className="text-[10px] text-[#A09393] font-mono">Linked Order: {deliv.order_id}</span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      setEditingDelivery(deliv);
                      setEditForm({
                        status: deliv.status,
                        carrier: deliv.carrier,
                        tracking_number: deliv.tracking_number || ''
                      });
                      setShowEditModal(true);
                    }}
                    className="p-1.5 bg-[#1C1212] border border-[#2C1E1E] hover:border-[#D4AF37] text-white rounded-lg transition"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => handleDeleteDelivery(deliv.id)}
                    className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 hover:border-rose-500/40 text-rose-400 rounded-lg transition"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Delivery Details */}
              <div className="p-6 space-y-4 flex-1">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#A09393]">Shipment Status</span>
                  {getStatusBadge(deliv.status)}
                </div>

                <div className="space-y-3 text-sm pt-2">
                  <div className="flex items-start gap-2.5">
                    <User className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold text-white block">{deliv.customer_name}</span>
                      {deliv.customer_phone && <span className="text-xs font-mono text-[#8C7E7E]">{deliv.customer_phone}</span>}
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                    <span className="text-[#A09393] text-xs leading-relaxed">{deliv.customer_address || 'No address provided'}</span>
                  </div>

                  <div className="border-t border-[#2C1E1E] pt-3 mt-3 flex justify-between text-xs">
                    <div>
                      <span className="text-[#8C7E7E] block text-[9px] uppercase tracking-wider font-mono">Carrier</span>
                      <span className="font-bold text-white mt-0.5 block">{deliv.carrier}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[#8C7E7E] block text-[9px] uppercase tracking-wider font-mono">Tracking Code</span>
                      <span className="font-bold text-[#D4AF37] font-mono mt-0.5 block">
                        {deliv.tracking_number || 'PENDING DISPATCH'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              
            </div>
          ))}
        </div>
      )}

      {/* Edit Delivery Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <form onSubmit={handleUpdateDelivery} className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl w-full max-w-md overflow-hidden shadow-2xl animate-scale-in">
            <div className="px-6 py-4 border-b border-[#2C1E1E] flex justify-between items-center">
              <h3 className="font-bold text-white">Update Dispatch: {editingDelivery?.id}</h3>
              <button 
                type="button" 
                onClick={() => setShowEditModal(false)} 
                className="text-[#A09393] hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393] mb-2">Delivery Status</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                  className="w-full bg-[#1C1212] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-[#F3EFE0] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="pending">Pending</option>
                  <option value="in-transit">In Transit</option>
                  <option value="out-for-delivery">Out for Delivery</option>
                  <option value="delivered">Delivered</option>
                  <option value="failed">Failed / Returned</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393] mb-2">Carrier Partner</label>
                <select
                  value={editForm.carrier}
                  onChange={(e) => setEditForm({ ...editForm, carrier: e.target.value })}
                  className="w-full bg-[#1C1212] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-[#F3EFE0] focus:outline-none focus:border-[#D4AF37] cursor-pointer"
                >
                  <option value="DTDC Express">DTDC Express</option>
                  <option value="Professional Courier">Professional Courier</option>
                  <option value="Speed Post (India Post)">Speed Post (India Post)</option>
                  <option value="Local Handover">Local Handover (Mumbai)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-[#A09393] mb-2">Tracking / Reference Code</label>
                <input
                  type="text"
                  value={editForm.tracking_number}
                  onChange={(e) => setEditForm({ ...editForm, tracking_number: e.target.value })}
                  className="w-full bg-[#1C1212] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-[#F3EFE0] focus:outline-none focus:border-[#D4AF37]"
                  placeholder="E.g. DTDC-12941-891"
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
      )}
    </div>
  );
}
