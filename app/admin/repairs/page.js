"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Plus, Wrench, Edit2, Trash2, X, Phone, User, IndianRupee, FileText, CheckCircle, UploadCloud, FileAudio, FileVideo, FileImage, Loader2, MessageCircle } from 'lucide-react';

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [repairToDelete, setRepairToDelete] = useState(null);
  
  // Form State
  const [editingId, setEditingId] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [isDraggingBill, setIsDraggingBill] = useState(false);
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_phone: '',
    customer_email: '',
    customer_address: '',
    instrument_type: '',
    brand_or_model: '',
    issue_description: '',
    accessories_included: '',
    status: 'pending',
    estimated_cost: '',
    advance_paid: '',
    estimated_completion_date: '',
    media: [] // New field for audio/video/images
  });

  const [toast, setToast] = useState(null);
  const showToast = (msg, type='success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    fetchRepairs();
  }, []);

  async function fetchRepairs() {
    setLoading(true);
    const { data, error } = await supabase.from('repairs').select('*').order('created_at', { ascending: false });
    if (!error && data) setRepairs(data);
    setLoading(false);
  }

  const openAddModal = () => {
    setEditingId(null);
    setFormData({
      customer_name: '', customer_phone: '', customer_email: '', customer_address: '',
      instrument_type: '', brand_or_model: '', issue_description: '', accessories_included: '',
      status: 'pending', estimated_cost: '', advance_paid: '', estimated_completion_date: '',
      bill_number: '',
      media: []
    });
    setIsModalOpen(true);
  };

  const openEditModal = (repair) => {
    const billObj = repair.media?.find(m => m.role === 'bill');
    setEditingId(repair.id);
    setFormData({
      customer_name: repair.customer_name || '',
      customer_phone: repair.customer_phone || '',
      customer_email: repair.customer_email || '',
      customer_address: repair.customer_address || '',
      instrument_type: repair.instrument_type || '',
      brand_or_model: repair.brand_or_model || '',
      issue_description: repair.issue_description || '',
      accessories_included: repair.accessories_included || '',
      status: repair.status || 'pending',
      estimated_cost: repair.estimated_cost || '',
      advance_paid: repair.advance_paid || '',
      estimated_completion_date: repair.estimated_completion_date || '',
      bill_number: billObj?.bill_number || '',
      media: repair.media || []
    });
    setIsModalOpen(true);
  };

  const handleAddComment = async (id, currentMedia = [], commentText) => {
    if (!commentText.trim()) return;
    const mediaArray = Array.isArray(currentMedia) ? currentMedia : [];
    const newComment = {
      type: 'comment',
      text: commentText.trim(),
      date: new Date().toISOString()
    };
    const updatedMedia = [...mediaArray, newComment];
    try {
      const { error } = await supabase
        .from('repairs')
        .update({ media: updatedMedia })
        .eq('id', id);
      if (error) {
        showToast("Failed to add comment", "error");
      } else {
        showToast("Progress comment added!");
        fetchRepairs();
      }
    } catch (err) {
      showToast("Error adding comment", "error");
    }
  };

  // Upload handler to Supabase Storage Bucket 'media'
  const handleMediaUpload = async (input) => {
    const files = input instanceof FileList || Array.isArray(input) ? Array.from(input) : Array.from(input?.target?.files || []);
    if (!files.length) return;

    setIsUploading(true);
    const uploadedMedia = [...formData.media];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `repairs/${fileName}`;

        // Upload to bucket
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

        uploadedMedia.push({
          url: publicUrl,
          type: file.type.split('/')[0], // 'image', 'video', or 'audio'
          name: file.name
        });
        
      } catch (err) {
        showToast(`Failed to upload ${file.name}: ${err.message}`, 'error');
      }
    }

    setFormData({ ...formData, media: uploadedMedia });
    setIsUploading(false);
  };

  const removeMedia = (index) => {
    const newMedia = [...formData.media];
    newMedia.splice(index, 1);
    setFormData({ ...formData, media: newMedia });
  };

  const handleBillUpload = async (input) => {
    const file = input instanceof FileList ? input[0] : (input?.target?.files?.[0] || null);
    if (!file) return;

    setIsUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `bill-${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const filePath = `repairs/${fileName}`;

      // Upload to bucket
      const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
        cacheControl: '3600',
        upsert: false
      });

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

      // Clean existing bill if any
      const cleanMedia = (formData.media || []).filter(m => m.role !== 'bill');

      setFormData({
        ...formData,
        media: [...cleanMedia, { url: publicUrl, type: 'bill_receipt', role: 'bill', name: file.name, bill_number: formData.bill_number || '' }]
      });
      showToast("Bill image uploaded successfully!");
    } catch (err) {
      showToast(`Failed to upload bill: ${err.message}`, 'error');
    } finally {
      setIsUploading(false);
    }
  };

  const removeBill = () => {
    const cleanMedia = (formData.media || []).filter(m => m.role !== 'bill');
    if (formData.bill_number?.trim()) {
      setFormData({
        ...formData,
        media: [...cleanMedia, { role: 'bill', type: 'bill_receipt', bill_number: formData.bill_number }]
      });
    } else {
      setFormData({ ...formData, media: cleanMedia });
    }
    showToast("Bill image removed.");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.customer_name || !formData.instrument_type || !formData.issue_description) {
      return showToast('Please fill out Customer Name, Instrument Type, and Issue.', 'error');
    }

    // Unify bill_number & bill image in media array
    let updatedMedia = [...(formData.media || [])];
    const billItemIndex = updatedMedia.findIndex(m => m.role === 'bill');
    
    if (formData.bill_number?.trim() || (billItemIndex !== -1 && updatedMedia[billItemIndex].url)) {
      const existingBill = billItemIndex !== -1 ? updatedMedia[billItemIndex] : {};
      const unifiedBill = {
        role: 'bill',
        type: 'bill_receipt',
        bill_number: formData.bill_number?.trim() || '',
        url: existingBill.url || '',
        name: existingBill.name || 'Invoice Receipt'
      };

      if (billItemIndex !== -1) {
        updatedMedia[billItemIndex] = unifiedBill;
      } else {
        updatedMedia.push(unifiedBill);
      }
    } else {
      updatedMedia = updatedMedia.filter(m => m.role !== 'bill');
    }

    // Strip bill_number from database payload
    const { bill_number, ...dbFields } = formData;
    const payload = {
      ...dbFields,
      media: updatedMedia,
      estimated_cost: formData.estimated_cost ? parseFloat(formData.estimated_cost) : 0,
      advance_paid: formData.advance_paid ? parseFloat(formData.advance_paid) : 0,
      estimated_completion_date: formData.estimated_completion_date || null
    };

    if (editingId) {
      const { error } = await supabase.from('repairs').update(payload).eq('id', editingId);
      if (error) showToast('Update failed: ' + error.message, 'error');
      else { showToast('Repair job updated!'); fetchRepairs(); setIsModalOpen(false); }
    } else {
      const { error } = await supabase.from('repairs').insert([payload]);
      if (error) showToast('Insert failed: ' + error.message, 'error');
      else { showToast('Repair job added!'); fetchRepairs(); setIsModalOpen(false); }
    }
  };

  const confirmDelete = (repair) => { setRepairToDelete(repair); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!repairToDelete) return;
    const { error } = await supabase.from('repairs').delete().eq('id', repairToDelete.id);
    if (error) showToast('Error deleting repair', 'error');
    else { showToast('Repair record removed'); setRepairs(repairs.filter(r => r.id !== repairToDelete.id)); }
    setIsDeleteModalOpen(false); setRepairToDelete(null);
  };

  const updateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('repairs').update({ status: newStatus }).eq('id', id);
    if (error) showToast('Failed to update status', 'error');
    else { fetchRepairs(); showToast('Status updated'); }
  };

  const filteredRepairs = repairs.filter(r => 
    (r.customer_name?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (r.instrument_type?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
    (r.customer_phone?.includes(searchQuery) || '')
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-amber-950/40 text-amber-400 border-amber-800/40';
      case 'in-progress': return 'bg-blue-950/40 text-blue-400 border-blue-800/40';
      case 'ready': return 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40';
      case 'completed': return 'bg-[#2C1E1E] text-[#A09393] border-[#3D2828]';
      default: return 'bg-[#2C1E1E] text-white border-[#3D2828]';
    }
  };

  const renderMediaIcon = (type) => {
    if (type === 'video') return <FileVideo className="w-4 h-4 text-rose-400" />;
    if (type === 'audio') return <FileAudio className="w-4 h-4 text-blue-400" />;
    return <FileImage className="w-4 h-4 text-[#D4AF37]" />;
  };

  return (
    <div className="p-6 lg:p-8 flex flex-col h-full space-y-6">
      
      {/* Top Bar Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09393]" />
          <input 
            type="text" 
            placeholder="Search by customer name, phone, or instrument..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37] transition"
          />
        </div>
        <button onClick={openAddModal} className="w-full md:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#BFA030] text-black font-semibold text-sm rounded-xl transition shadow-[0_0_15px_rgba(212,175,55,0.2)]">
          <Plus className="w-4 h-4" /><span>Log New Repair</span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[#D4AF37] font-mono tracking-widest animate-pulse text-sm">FETCHING REPAIR LOGS...</div></div>
      ) : filteredRepairs.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#2C1E1E] rounded-2xl bg-[#160F0F]/50 min-h-[400px]">
          <Wrench className="w-12 h-12 text-[#3D2828] mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No repair jobs found</h3>
          <p className="text-sm text-[#A09393]">Click 'Log New Repair' when a customer drops off an instrument.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-start">
          {filteredRepairs.map(repair => (
            <div key={repair.id} className="bg-[#160F0F] rounded-2xl border border-[#2C1E1E] overflow-hidden flex flex-col hover:border-[#3D2828] transition group shadow-lg">
              
              <div className="p-5 border-b border-[#2C1E1E] bg-[#1C1212] flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-white text-lg tracking-tight mb-1">{repair.instrument_type}</h3>
                  <div className="flex items-center gap-2 text-xs text-[#A09393]">
                    <span className="uppercase tracking-wider">{repair.brand_or_model || 'Unknown Brand'}</span>
                    <span className="w-1 h-1 rounded-full bg-[#3D2828]"></span>
                    <span className="font-mono text-[#D4AF37]">#{repair.id}</span>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-full border text-[10px] font-bold uppercase tracking-wider ${getStatusColor(repair.status)}`}>
                  {repair.status}
                </div>
              </div>

              <div className="p-5 space-y-4 flex-1">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-sm text-[#C5B3B3]">
                    <User className="w-4 h-4 text-[#5A4B4B]" />
                    <span className="font-medium text-white">{repair.customer_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-[#C5B3B3]">
                    <Phone className="w-4 h-4 text-[#5A4B4B]" />
                    <span className="font-mono">{repair.customer_phone || 'No phone'}</span>
                  </div>
                </div>
                
                <div className="h-px w-full bg-[#2C1E1E]"></div>

                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold text-[#D4AF37] uppercase tracking-wider mb-2">
                    <FileText className="w-3.5 h-3.5" /> Issue Reported
                  </div>
                  <p className="text-sm text-[#A09393] line-clamp-3 leading-relaxed mb-4">
                    {repair.issue_description}
                  </p>
                  
                  {/* Media Gallery in Card */}
                  {repair.media && repair.media.filter(m => m.type !== 'comment').length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {repair.media.filter(m => m.type !== 'comment').map((m, i) => (
                        <div key={i} className="relative group/media overflow-hidden rounded-lg border border-[#2C1E1E] bg-[#1C1212] w-16 h-16 flex items-center justify-center flex-shrink-0 cursor-pointer" onClick={() => window.open(m.url, '_blank')}>
                          {m.type === 'image' ? (
                            <img src={m.url} className="w-full h-full object-cover opacity-80 group-hover/media:opacity-100 transition" alt="Attachment" />
                          ) : m.type === 'video' ? (
                            <FileVideo className="w-6 h-6 text-rose-500/70 group-hover/media:text-rose-500 transition" />
                          ) : (
                            <FileAudio className="w-6 h-6 text-blue-500/70 group-hover/media:text-blue-500 transition" />
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Progress Notes / Comments */}
                  <div className="mt-4 pt-4 border-t border-[#2C1E1E]">
                    <div className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-widest mb-2 flex items-center gap-1.5">
                      <span>📝</span> Progress Updates
                    </div>
                    
                    {/* Render comments timeline */}
                    <div className="space-y-2 max-h-36 overflow-y-auto pr-1 text-xs">
                      {!repair.media || repair.media.filter(m => m.type === 'comment').length === 0 ? (
                        <p className="text-[#5A4B4B] italic text-[10px]">No status comments logged yet.</p>
                      ) : (
                        repair.media.filter(m => m.type === 'comment').map((comm, idx) => (
                          <div key={idx} className="bg-[#1C1212] border border-[#2C1E1E] p-2 rounded-lg space-y-1">
                            <p className="text-[#C5B3B3] text-[11px] font-medium leading-normal">{comm.text}</p>
                            <span className="text-[9px] text-[#5A4B4B] font-mono block text-right">
                              {new Date(comm.date).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Add comment input */}
                    <div className="flex gap-2 mt-3">
                      <input 
                        type="text" 
                        id={`new-comment-${repair.id}`}
                        placeholder="Type a progress comment..."
                        className="flex-1 bg-[#1C1212] border border-[#2C1E1E] rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37]"
                        onKeyDown={async (e) => {
                          if (e.key === 'Enter' && e.target.value.trim()) {
                            await handleAddComment(repair.id, repair.media, e.target.value.trim());
                            e.target.value = '';
                          }
                        }}
                      />
                      <button 
                        type="button"
                        onClick={async () => {
                          const el = document.getElementById(`new-comment-${repair.id}`);
                          if (el && el.value.trim()) {
                            await handleAddComment(repair.id, repair.media, el.value.trim());
                            el.value = '';
                          }
                        }}
                        className="bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/30 text-[#D4AF37] px-2.5 py-1 rounded-lg text-xs font-bold transition shrink-0"
                      >
                        Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#120B0B] border-t border-[#2C1E1E] flex items-center justify-between mt-auto">
                <div className="flex flex-col">
                  <span className="text-[10px] text-[#5A4B4B] uppercase tracking-wider font-medium">Est. Cost</span>
                  <span className="text-sm font-mono font-semibold text-white">₹{repair.estimated_cost?.toLocaleString() || '0'}</span>
                </div>
                
                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition">
                  <select 
                    value={repair.status} 
                    onChange={(e) => updateStatus(repair.id, e.target.value)}
                    className="px-2 py-1.5 bg-[#1C1212] border border-[#2C1E1E] rounded-lg text-xs text-white outline-none cursor-pointer hover:border-[#D4AF37]"
                  >
                    <option value="pending">Pending</option>
                    <option value="in-progress">In Progress</option>
                    <option value="ready">Ready</option>
                    <option value="completed">Completed</option>
                  </select>
                  {repair.customer_phone && (
                    <button 
                      onClick={() => {
                        const formattedPhone = repair.customer_phone.replace(/\D/g, '');
                        const phoneWithCountry = formattedPhone.length === 10 ? `91${formattedPhone}` : formattedPhone;
                        const billItem = repair.media?.find(m => m.role === 'bill');
                        const billNumText = billItem?.bill_number ? `\nBill/Invoice Number: ${billItem.bill_number}` : '';
                        const billImgText = billItem?.url ? `\nView Bill/Receipt Image: ${billItem.url}` : '';
                        const msg = `Hi ${repair.customer_name},\n\nYour repair request for *${repair.instrument_type}* (ID: #${repair.id}) status has been updated to *${repair.status.toUpperCase()}*.\n` +
                          `Estimated Cost: ₹${repair.estimated_cost || 0}\n` +
                          `Completion Date: ${repair.estimated_completion_date ? new Date(repair.estimated_completion_date).toLocaleDateString() : 'Pending evaluation'}\n` +
                          `${billNumText}${billImgText}\n` +
                          `You can track the live status here:\nhttp://localhost:3000/repair?track=${repair.id}`;
                        const encoded = encodeURIComponent(msg);
                        window.open(`https://wa.me/${phoneWithCountry}?text=${encoded}`, '_blank');
                      }}
                      title="Send status update to customer via WhatsApp"
                      className="p-1.5 bg-[#25D366]/10 text-[#25D366] hover:bg-[#25D366]/20 border border-[#25D366]/20 rounded-lg transition"
                    >
                      <MessageCircle className="w-4 h-4" />
                    </button>
                  )}
                  <button onClick={() => openEditModal(repair)} className="p-1.5 bg-[#221616] text-[#A09393] hover:text-white rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={() => confirmDelete(repair)} className="p-1.5 bg-rose-950/30 text-rose-400 hover:text-rose-300 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* --- ADD / EDIT MODAL --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2C1E1E] bg-[#1C1212] shrink-0">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Wrench className="w-5 h-5 text-[#D4AF37]" />
                {editingId ? 'Edit Repair Log' : 'Log New Repair'}
              </h2>
              <button type="button" onClick={() => setIsModalOpen(false)} className="p-2 text-[#A09393] hover:text-white transition rounded-lg hover:bg-[#2C1E1E]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-8 flex-1 scrollbar-thin flex flex-col lg:flex-row gap-8">
              
              <div className="flex-1 space-y-8">
                {/* Customer Info Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                    <User className="w-3.5 h-3.5" /> Customer Details
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Full Name *</label>
                      <input type="text" value={formData.customer_name} onChange={(e) => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="e.g. Rahul Sharma" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Phone Number</label>
                      <input type="text" value={formData.customer_phone} onChange={(e) => setFormData({...formData, customer_phone: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none font-mono" placeholder="+91 9876543210" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-[#C5B3B3]">Address (Optional)</label>
                      <input type="text" value={formData.customer_address} onChange={(e) => setFormData({...formData, customer_address: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="Full address" />
                    </div>
                  </div>
                </section>

                {/* Instrument & Issue Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                    <Wrench className="w-3.5 h-3.5" /> Instrument & Issue
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Instrument Type *</label>
                      <input type="text" value={formData.instrument_type} onChange={(e) => setFormData({...formData, instrument_type: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="e.g. Acoustic Guitar" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Brand / Model</label>
                      <input type="text" value={formData.brand_or_model} onChange={(e) => setFormData({...formData, brand_or_model: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="e.g. Yamaha F310" />
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-[#C5B3B3]">Issue Description *</label>
                      <textarea rows="3" value={formData.issue_description} onChange={(e) => setFormData({...formData, issue_description: e.target.value})} className="w-full px-4 py-3 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none resize-none" placeholder="Describe the problem in detail..."></textarea>
                    </div>
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-xs font-medium text-[#C5B3B3]">Included Accessories (To track what was deposited)</label>
                      <input type="text" value={formData.accessories_included} onChange={(e) => setFormData({...formData, accessories_included: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="e.g. Gig bag, 2 picks, strap" />
                    </div>
                  </div>
                </section>
              </div>

              {/* Sidebar column for Media & Financials */}
              <div className="w-full lg:w-80 space-y-8">
                
                {/* Media Upload Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                    <UploadCloud className="w-3.5 h-3.5" /> Media Attachments
                  </h3>
                  
                  <div 
                    className={`w-full h-28 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition relative ${isDragging ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.02]' : isUploading ? 'border-[#3D2828] bg-[#1C1212]/50' : 'border-[#2C1E1E] hover:border-[#D4AF37] bg-[#1C1212]'}`}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleMediaUpload(e.dataTransfer.files); }}
                    onClick={() => document.getElementById('admin-repair-media-input').click()}
                  >
                    <input id="admin-repair-media-input" type="file" multiple accept="image/*,video/*,audio/*" onChange={handleMediaUpload} className="hidden" disabled={isUploading} />
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mb-2" />
                    ) : isDragging ? (
                      <UploadCloud className="w-8 h-8 text-[#D4AF37] mb-2 animate-bounce" />
                    ) : (
                      <UploadCloud className="w-6 h-6 text-[#5A4B4B] mb-2" />
                    )}
                    <span className="text-xs font-medium text-[#C5B3B3]">
                      {isUploading ? 'Uploading to bucket...' : isDragging ? 'Drop files here!' : 'Click or drag & drop Images/Audio/Video'}
                    </span>
                  </div>

                  {formData.media?.filter(m => m.role !== 'bill').length > 0 && (
                    <div className="flex flex-col gap-2 max-h-48 overflow-y-auto scrollbar-thin pr-2">
                      {formData.media.map((m, i) => {
                        if (m.role === 'bill') return null;
                        return (
                          <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-[#1C1212] border border-[#2C1E1E]">
                            <div className="flex items-center gap-3 overflow-hidden">
                              <div className="w-10 h-10 rounded bg-[#2C1E1E] flex items-center justify-center shrink-0">
                                {m.type === 'image' && <img src={m.url} className="w-full h-full object-cover rounded" />}
                                {m.type === 'video' && <FileVideo className="w-5 h-5 text-rose-400" />}
                                {m.type === 'audio' && <FileAudio className="w-5 h-5 text-blue-400" />}
                              </div>
                              <div className="flex flex-col min-w-0">
                                <span className="text-xs text-white truncate">{m.name || 'Attachment'}</span>
                                <span className="text-[10px] text-[#A09393] uppercase tracking-wider">{m.type}</span>
                              </div>
                            </div>
                            <button onClick={() => removeMedia(i)} className="p-1.5 text-[#5A4B4B] hover:text-rose-400 transition">
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </section>

                {/* Bill Image Upload Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                    📄 Bill / Invoice Receipt (Optional)
                  </h3>
                  
                  {formData.media?.some(m => m.role === 'bill' && m.url) ? (
                    formData.media.filter(m => m.role === 'bill' && m.url).map((bill, idx) => (
                      <div key={idx} className="bg-[#1C1212] border border-[#2C1E1E] p-3 rounded-xl flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-10 h-10 rounded bg-[#2C1E1E] overflow-hidden shrink-0 flex items-center justify-center">
                            <img src={bill.url} className="w-full h-full object-cover" alt="Invoice" />
                          </div>
                          <div className="min-w-0">
                            <span className="text-xs font-bold text-white block truncate">{bill.name || 'Invoice Receipt'}</span>
                            <span className="text-[10px] text-[#A09393] uppercase font-mono">Image uploaded</span>
                          </div>
                        </div>
                        <button type="button" onClick={removeBill} className="p-1.5 text-rose-500 hover:text-rose-400 hover:bg-rose-950/20 rounded transition">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div 
                      className={`w-full h-20 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${isDraggingBill ? 'border-[#D4AF37] bg-[#D4AF37]/10 scale-[1.02]' : isUploading ? 'border-[#3D2828] bg-[#1C1212]/50' : 'border-[#2C1E1E] hover:border-[#D4AF37] bg-[#1C1212]'}`}
                      onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingBill(true); }}
                      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingBill(true); }}
                      onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingBill(false); }}
                      onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingBill(false); handleBillUpload(e.dataTransfer.files); }}
                      onClick={() => document.getElementById('admin-repair-bill-input').click()}
                    >
                      <input id="admin-repair-bill-input" type="file" accept="image/*" onChange={handleBillUpload} className="hidden" disabled={isUploading} />
                      {isDraggingBill ? (
                        <UploadCloud className="w-6 h-6 text-[#D4AF37] mb-1 animate-bounce" />
                      ) : (
                        <UploadCloud className="w-5 h-5 text-[#5A4B4B] mb-1" />
                      )}
                      <span className="text-xs font-medium text-[#C5B3B3]">
                        {isDraggingBill ? 'Drop bill image here!' : 'Click or drag & drop Bill Image'}
                      </span>
                    </div>
                  )}
                </section>

                {/* Financials & Status Section */}
                <section className="space-y-4">
                  <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                    <IndianRupee className="w-3.5 h-3.5" /> Financials & Status
                  </h3>
                  <div className="space-y-4 bg-[#1C1212] p-4 rounded-xl border border-[#2C1E1E]">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Status</label>
                      <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="w-full px-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white focus:border-[#D4AF37] outline-none cursor-pointer">
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="ready">Ready for Pickup</option>
                        <option value="completed">Completed</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Bill / Invoice Number</label>
                      <input type="text" value={formData.bill_number || ''} onChange={(e) => setFormData({...formData, bill_number: e.target.value})} className="w-full px-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white focus:border-[#D4AF37] outline-none font-mono" placeholder="e.g. SSV-2026-004" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Est. Completion Date</label>
                      <input type="date" value={formData.estimated_completion_date} onChange={(e) => setFormData({...formData, estimated_completion_date: e.target.value})} className="w-full px-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-[#A09393] focus:text-white focus:border-[#D4AF37] outline-none [color-scheme:dark]" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Est. Total Cost (₹)</label>
                      <input type="number" value={formData.estimated_cost} onChange={(e) => setFormData({...formData, estimated_cost: e.target.value})} className="w-full px-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white focus:border-[#D4AF37] outline-none font-mono" placeholder="0" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-[#C5B3B3]">Advance Paid (₹)</label>
                      <input type="number" value={formData.advance_paid} onChange={(e) => setFormData({...formData, advance_paid: e.target.value})} className="w-full px-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-emerald-400 focus:border-[#D4AF37] outline-none font-mono" placeholder="0" />
                    </div>
                  </div>
                </section>
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-[#2C1E1E] bg-[#160F0F] flex items-center justify-end gap-3 shrink-0">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#A09393] hover:text-white transition">Cancel</button>
              <button type="button" onClick={handleSubmit} disabled={isUploading} className={`px-6 py-2.5 font-semibold text-sm rounded-xl transition ${isUploading ? 'bg-[#3D2828] text-[#5A4B4B] cursor-not-allowed' : 'bg-gradient-to-r from-[#D4AF37] to-[#BFA030] hover:opacity-90 text-black shadow-[0_0_15px_rgba(212,175,55,0.2)]'}`}>
                {editingId ? 'Save Changes' : 'Log Repair Job'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Repair Log</h3>
            <p className="text-sm text-[#A09393] mb-6">Are you sure you want to permanently remove this repair record for <strong className="text-white">{repairToDelete?.customer_name}</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#C5B3B3] hover:text-white transition">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-500/10 text-rose-500 hover:bg-rose-500 hover:text-white font-medium text-sm rounded-lg transition">Delete Record</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in duration-300">
          <div className={`flex items-center gap-3 px-5 py-3.5 rounded-xl shadow-2xl border ${toast.type === 'error' ? 'bg-rose-950/90 border-rose-900/50 text-rose-200' : 'bg-[#1C1212]/95 border-[#D4AF37]/30 text-[#D4AF37] backdrop-blur-md'}`}>
            {toast.type === 'error' ? <X className="w-5 h-5 text-rose-400" /> : <CheckCircle className="w-5 h-5" />}
            <span className="text-sm font-medium tracking-wide">{toast.msg}</span>
          </div>
        </div>
      )}

    </div>
  );
}
