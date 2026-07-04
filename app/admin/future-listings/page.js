"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../../../lib/supabase';
import { Search, Plus, LayoutGrid, List, Edit2, Trash2, X, UploadCloud, Package, ImagePlus, ShoppingBag, FileAudio, FileVideo, Loader2 } from 'lucide-react';

export default function FutureListingsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState(null);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  
  const [editingId, setEditingId] = useState(null);
  const emptyForm = {
    name: '', category: 'Percussion', sub_category: '', price: '',
    bulk_price: '', description: '', is_available: true,
    material: '', size: '', height: '', width: '', weight: '', chati: '', dhumma: '',
    media: [],
    variants: [],
    addons: []
  };
  const [formData, setFormData] = useState(emptyForm);
  
  const [customCategory, setCustomCategory] = useState('');

  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Variant temp state
  const [vName, setVName] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vMedia, setVMedia] = useState([]);
  const [isUploadingVariant, setIsUploadingVariant] = useState(false);
  const [isDraggingVariant, setIsDraggingVariant] = useState(false);

  // Addon temp state
  const [addonName, setAddonName] = useState('');
  const [addonPrice, setAddonPrice] = useState('');
  const [addonMedia, setAddonMedia] = useState([]);
  const [isUploadingAddon, setIsUploadingAddon] = useState(false);
  const [isDraggingAddon, setIsDraggingAddon] = useState(false);

  const categories = ['All', 'Percussion', 'String Instruments', 'Keys', 'Drums', 'Accessories & Spares', 'Sticks', 'Bags', 'Stands', 'Others'];

  useEffect(() => { fetchProducts(); }, []);

  async function fetchProducts() {
    setLoading(true);
    const { data, error } = await supabase.from('future_listings').select('*').order('created_at', { ascending: false });
    if (!error && data) setProducts(data);
    setLoading(false);
  }

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            (p.sub_category || '').toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, activeCategory]);

  const openAddModal = () => {
    setEditingId(null);
    setCustomCategory('');
    setFormData({...emptyForm, media: [], variants: [], addons: []});
    setIsProductModalOpen(true);
  };

  const openEditModal = (product) => {
    setEditingId(product.id);
    const isCustomCat = !categories.includes(product.category) && product.category !== 'All';
    setCustomCategory(isCustomCat ? product.category : '');
    setFormData({
      name: product.name,
      category: isCustomCat ? 'Others' : product.category,
      sub_category: product.sub_category || '',
      price: product.price || '',
      bulk_price: product.bulk_price || '',
      description: product.description || '',
      is_available: product.is_available,
      material: product.attributes?.material || '',
      size: product.attributes?.size || '',
      height: product.attributes?.height || '',
      width: product.attributes?.width || '',
      weight: product.attributes?.weight || '',
      chati: product.attributes?.chati || '',
      dhumma: product.attributes?.dhumma || '',
      media: product.media || (product.images ? product.images.map(url => ({ url, type: 'image', name: 'Legacy Image' })) : (product.image_url ? [{ url: product.image_url, type: 'image', name: 'Legacy Image' }] : [])),
      variants: product.variants?.map(v => ({...v, media: v.media || (v.image ? [{url: v.image, type: 'image'}] : [])})) || [],
      addons: product.addons?.map(a => ({...a, media: a.media || (a.image ? [{url: a.image, type: 'image'}] : [])})) || []
    });
    setIsProductModalOpen(true);
  };

  const confirmDelete = (product) => { setProductToDelete(product); setIsDeleteModalOpen(true); };

  const handleDelete = async () => {
    if (!productToDelete) return;
    const { error } = await supabase.from('future_listings').delete().eq('id', productToDelete.id);
    if (error) showToast('Error deleting product', 'error');
    else { showToast('Draft removed successfully'); setProducts(products.filter(p => p.id !== productToDelete.id)); }
    setIsDeleteModalOpen(false); setProductToDelete(null);
  };

  const toggleAvailability = async (id, currentStatus) => {
    const newStatus = !currentStatus;
    setProducts(products.map(p => p.id === id ? { ...p, is_available: newStatus } : p));
    const { error } = await supabase.from('future_listings').update({ is_available: newStatus }).eq('id', id);
    if (error) { showToast('Failed to update status', 'error'); setProducts(products.map(p => p.id === id ? { ...p, is_available: currentStatus } : p)); }
  };

  const publishDraft = async (product) => {
    const { id, created_at, ...productData } = product;
    const { error: insertError } = await supabase.from('products').insert([productData]);
    if (insertError) return showToast('Failed to publish: ' + insertError.message, 'error');
    
    const { error: deleteError } = await supabase.from('future_listings').delete().eq('id', product.id);
    if (deleteError) showToast('Published, but failed to remove from drafts', 'error');
    else {
      showToast('Successfully published to live store!');
      setProducts(products.filter(p => p.id !== product.id));
    }
  };

  // --- Image Helpers for Variants/Addons ---
  const uploadToSupabase = async (files, folder) => {
    const uploaded = [];
    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `${folder}/${fileName}`;
        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, { cacheControl: '3600', upsert: false });
        if (uploadError) throw uploadError;
        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);
        uploaded.push({ url: publicUrl, type: file.type.split('/')[0], name: file.name });
      } catch (err) {
        showToast('Failed to upload ' + file.name + ': ' + err.message, 'error');
      }
    }
    return uploaded;
  };

  // --- Media Handlers ---
  const handleMediaUpload = async (input) => {
    const files = input instanceof FileList || Array.isArray(input) ? Array.from(input) : Array.from(input?.target?.files || []);
    if (!files.length) return;
    setIsUploading(true);
    const uploaded = await uploadToSupabase(files, 'products');
    setFormData(prev => ({ ...prev, media: [...prev.media, ...uploaded] }));
    setIsUploading(false);
  };

  const handleVariantMediaUpload = async (input) => {
    const files = input instanceof FileList || Array.isArray(input) ? Array.from(input) : Array.from(input?.target?.files || []);
    if (!files.length) return;
    setIsUploadingVariant(true);
    const uploaded = await uploadToSupabase(files, 'products/variants');
    setVMedia(prev => [...prev, ...uploaded]);
    setIsUploadingVariant(false);
  };

  const handleAddonMediaUpload = async (input) => {
    const files = input instanceof FileList || Array.isArray(input) ? Array.from(input) : Array.from(input?.target?.files || []);
    if (!files.length) return;
    setIsUploadingAddon(true);
    const uploaded = await uploadToSupabase(files, 'products/addons');
    setAddonMedia(prev => [...prev, ...uploaded]);
    setIsUploadingAddon(false);
  };

  const removeMedia = (idx) => {
    setFormData(prev => ({ ...prev, media: prev.media.filter((_, i) => i !== idx) }));
  };

  const setPrimaryMedia = (idx) => {
    if (idx === 0) return;
    setFormData(prev => {
      const newMedia = [...prev.media];
      const selected = newMedia.splice(idx, 1)[0];
      newMedia.unshift(selected);
      return { ...prev, media: newMedia };
    });
  };

  // --- Variant Handlers ---
  const addVariant = () => {
    if (!vName || !vPrice) return showToast('Provide variant name and price', 'error');
    setFormData(prev => ({
      ...prev,
      variants: [...prev.variants, { name: vName, price: parseFloat(vPrice), media: vMedia, is_available: true }]
    }));
    setVName(''); setVPrice(''); setVMedia([]);
  };

  const removeVariant = (idx) => {
    setFormData(prev => ({ ...prev, variants: prev.variants.filter((_, i) => i !== idx) }));
  };

  // --- Addon Handlers ---
  const addAddon = () => {
    if (!addonName || !addonPrice) return showToast('Provide add-on name and price', 'error');
    setFormData(prev => ({
      ...prev,
      addons: [...prev.addons, { name: addonName, price: parseFloat(addonPrice), media: addonMedia }]
    }));
    setAddonName(''); setAddonPrice(''); setAddonMedia([]);
  };

  const removeAddon = (idx) => {
    setFormData(prev => ({ ...prev, addons: prev.addons.filter((_, i) => i !== idx) }));
  };

  // --- Submit ---
  const handleSubmit = async () => {
    if (!formData.name || !formData.price) return showToast('Name and base price required', 'error');

    const finalCategory = formData.category === 'Others' ? customCategory : formData.category;
    if (!finalCategory) return showToast('Category is required', 'error');

    const payload = {
      name: formData.name,
      category: finalCategory,
      sub_category: formData.sub_category,
      price: parseFloat(formData.price),
      bulk_price: formData.bulk_price ? parseFloat(formData.bulk_price) : null,
      description: formData.description,
      image_url: formData.media.length > 0 && formData.media[0].type === 'image' ? formData.media[0].url : null,
      media: formData.media,
      is_available: formData.is_available,
      attributes: { material: formData.material, size: formData.size, height: formData.height, width: formData.width, weight: formData.weight, chati: formData.chati, dhumma: formData.dhumma },
      variants: formData.variants,
      addons: formData.addons
    };

    if (editingId) {
      const { error } = await supabase.from('future_listings').update(payload).eq('id', editingId);
      if (error) showToast('Update failed: ' + error.message, 'error');
      else { showToast('Draft updated!'); fetchProducts(); setIsProductModalOpen(false); }
    } else {
      const { error } = await supabase.from('future_listings').insert([payload]);
      if (error) showToast('Insert failed: ' + error.message, 'error');
      else { showToast('Draft saved!'); fetchProducts(); setIsProductModalOpen(false); }
    }
  };

  // ========== RENDER ==========
  return (
    <div className="p-6 lg:p-8 flex flex-col h-full space-y-6">
      {/* Toast */}
      {toast.show && (
        <div className={`fixed bottom-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl border flex items-center gap-3 ${toast.type === 'success' ? 'bg-[#121A16] border-emerald-900/50 text-emerald-400' : 'bg-[#1A1212] border-rose-900/50 text-rose-400'}`}>
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-400' : 'bg-rose-400'}`}></div>
          <span className="text-sm font-medium">{toast.message}</span>
        </div>
      )}

      {/* Top Bar */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A09393]" />
          <input type="text" placeholder="Search future listings..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-[#160F0F] border border-[#2C1E1E] rounded-xl text-sm text-white placeholder-[#5A4B4B] focus:outline-none focus:border-[#D4AF37] transition" />
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center bg-[#160F0F] border border-[#2C1E1E] rounded-xl p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-lg transition ${viewMode === 'grid' ? 'bg-[#221616] text-[#D4AF37]' : 'text-[#A09393] hover:text-white'}`}><LayoutGrid className="w-4 h-4" /></button>
            <button onClick={() => setViewMode('table')} className={`p-1.5 rounded-lg transition ${viewMode === 'table' ? 'bg-[#221616] text-[#D4AF37]' : 'text-[#A09393] hover:text-white'}`}><List className="w-4 h-4" /></button>
          </div>
          <button onClick={openAddModal} className="flex-1 md:flex-none flex items-center justify-center gap-2 px-6 py-2.5 bg-[#D4AF37] hover:bg-[#BFA030] text-black font-semibold text-sm rounded-xl transition shadow-[0_0_15px_rgba(212,175,55,0.2)]">
            <Plus className="w-4 h-4" /><span>New Draft</span>
          </button>
        </div>
      </div>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2">
        {categories.map(cat => (
          <button key={cat} onClick={() => setActiveCategory(cat)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium transition border ${activeCategory === cat ? 'bg-[#221616] border-[#D4AF37]/50 text-[#D4AF37]' : 'bg-[#160F0F] border-[#2C1E1E] text-[#A09393] hover:border-[#4A3B3B] hover:text-white'}`}>
            {cat}
          </button>
        ))}
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center"><div className="text-[#D4AF37] font-mono tracking-widest animate-pulse text-sm">FETCHING CATALOG...</div></div>
      ) : filteredProducts.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center border-2 border-dashed border-[#2C1E1E] rounded-2xl bg-[#160F0F]/50">
          <Package className="w-12 h-12 text-[#3D2828] mb-4" />
          <h3 className="text-lg font-medium text-white mb-1">No drafts found</h3>
          <p className="text-sm text-[#A09393]">Try adjusting your search or category filters.</p>
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(p => {
            return (
            <div key={p.id} onClick={() => openEditModal(p)} className="bg-[#160F0F] rounded-2xl border border-[#2C1E1E] overflow-hidden group cursor-pointer hover:border-[#3D2828] transition flex flex-col shadow-lg hover:shadow-xl hover:shadow-[#D4AF37]/5">
              <div className="aspect-[4/3] bg-[#1C1212] relative overflow-hidden">
                {p.media && p.media.length > 0 && p.media[0].type === 'image' ? (
                  <img src={p.media[0].url} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (p.image_url || p.images?.[0]) ? (
                  <img src={p.image_url || p.images[0]} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" />
                ) : (
                  <Package className="w-10 h-10 text-[#3D2828]" />
                )}
                {p.images && p.images.length > 1 && (
                  <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-md border border-white/10 px-2 py-0.5 rounded-md text-[10px] font-mono text-white">
                    +{p.images.length - 1} imgs
                  </div>
                )}
                <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md border border-white/10 px-2.5 py-1 rounded-md text-[10px] font-mono uppercase tracking-wider text-[#D4AF37]">{p.category}</div>
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-3 backdrop-blur-[2px]">
                  <button onClick={(e) => { e.stopPropagation(); publishDraft(p); }} className="px-3 py-1 bg-emerald-500/20 hover:bg-emerald-500/40 text-emerald-300 text-xs font-bold rounded-lg transition">PUBLISH</button>
                  <button onClick={(e) => { e.stopPropagation(); openEditModal(p); }} className="p-2 bg-white/10 hover:bg-white/20 text-white rounded-lg transition"><Edit2 className="w-4 h-4" /></button>
                  <button onClick={(e) => { e.stopPropagation(); confirmDelete(p); }} className="p-2 bg-rose-500/20 hover:bg-rose-500/40 text-rose-300 rounded-lg transition"><Trash2 className="w-4 h-4" /></button>
                </div>
              </div>
              <div className="p-5">
                <h3 className="font-semibold text-white text-base leading-tight line-clamp-1" title={p.name}>{p.name}</h3>
                <div className="flex items-end justify-between mt-4">
                  <div>
                    <p className="text-xs text-[#A09393] uppercase tracking-wider mb-0.5 font-medium">Standard</p>
                    <p className="font-mono text-lg text-white font-semibold">₹{p.price?.toLocaleString()}</p>
                  </div>
                </div>
                {p.variants && p.variants.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[#2C1E1E] text-[10px] text-[#A09393] uppercase tracking-wider">{p.variants.length} variant{p.variants.length > 1 ? 's' : ''}</div>
                )}
                {p.addons && p.addons.length > 0 && (
                  <div className="mt-1 text-[10px] text-[#A09393] uppercase tracking-wider">{p.addons.length} add-on{p.addons.length > 1 ? 's' : ''}</div>
                )}
              </div>
            </div>
          );})}
        </div>
      ) : (
        <div className="bg-[#160F0F] rounded-2xl border border-[#2C1E1E] overflow-hidden flex-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm border-collapse">
              <thead>
                <tr className="bg-[#1C1212] text-[#A09393] text-xs font-semibold tracking-wider border-b border-[#2C1E1E]">
                  <th className="p-4 pl-6">Product</th><th className="p-4">Category</th><th className="p-4">Price</th><th className="p-4">Status</th><th className="p-4 pr-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2C1E1E] text-[#E0D8D8]">
                {filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-[#1C1212] transition-colors group">
                    <td className="p-4 pl-6 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-[#221616] border border-[#2C1E1E] flex items-center justify-center overflow-hidden shrink-0">
                        {p.media && p.media.length > 0 && p.media[0].type === 'image' ? (
                          <img src={p.media[0].url} alt="" className="w-full h-full object-cover" />
                        ) : (p.image_url || p.images?.[0]) ? (
                          <img src={p.image_url || p.images[0]} alt="" className="w-full h-full object-cover" />
                        ) : <Package className="w-6 h-6 text-[#3D2828]" />}
                      </div>
                      <div>
                        <div className="font-semibold text-white">{p.name}</div>
                        {p.sub_category && <div className="text-[10px] text-[#A09393] uppercase mt-0.5">{p.sub_category}</div>}
                      </div>
                    </td>
                    <td className="p-4 text-xs text-[#C5B3B3] uppercase tracking-wide">{p.category}</td>
                    <td className="p-4 font-mono font-semibold text-white">₹{p.price?.toLocaleString()}</td>
                    <td className="p-4">
                      <button onClick={() => toggleAvailability(p.id, p.is_available)}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-medium border uppercase tracking-wide transition ${p.is_available ? 'bg-emerald-950/40 text-emerald-400 border-emerald-800/40' : 'bg-rose-950/40 text-rose-400 border-rose-800/40'}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${p.is_available ? 'bg-emerald-400' : 'bg-rose-400'}`}></span>
                        {p.is_available ? 'Active' : 'Hidden'}
                      </button>
                    </td>
                    <td className="p-4 pr-6 text-right">
                      <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition">
                        <button onClick={() => publishDraft(p)} className="p-1.5 text-[#D4AF37] hover:text-black bg-[#D4AF37]/10 hover:bg-[#D4AF37] rounded-md transition shadow-[0_0_8px_rgba(212,175,55,0.2)]" title="Publish to Live Store"><UploadCloud className="w-4 h-4" /></button>
                        <button onClick={() => openEditModal(p)} className="p-1.5 text-[#A09393] hover:text-white bg-[#221616] rounded-md transition"><Edit2 className="w-4 h-4" /></button>
                        <button onClick={() => confirmDelete(p)} className="p-1.5 text-[#E25C5C] hover:text-rose-400 bg-rose-950/30 rounded-md transition"><Trash2 className="w-4 h-4" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-2xl p-6 w-full max-w-sm shadow-2xl">
            <h3 className="text-lg font-semibold text-white mb-2">Delete Draft</h3>
            <p className="text-sm text-[#A09393] mb-6">Are you sure you want to permanently remove <strong className="text-white">"{productToDelete?.name}"</strong>?</p>
            <div className="flex gap-3 justify-end">
              <button onClick={() => setIsDeleteModalOpen(false)} className="px-4 py-2 text-sm font-medium text-[#C5B3B3] hover:text-white transition">Cancel</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-medium rounded-lg transition shadow-lg">Delete Permanently</button>
            </div>
          </div>
        </div>
      )}

      {/* ========== ADD/EDIT PRODUCT MODAL ========== */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex justify-end" onClick={() => setIsProductModalOpen(false)}>
          <div className="bg-[#120B0B] w-full md:w-[640px] h-full border-l border-[#2C1E1E] shadow-2xl flex flex-col" onClick={(e) => e.stopPropagation()}>
            
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-5 border-b border-[#2C1E1E] bg-[#160F0F] shrink-0">
              <h2 className="text-lg font-semibold text-white">{editingId ? 'Edit Draft' : 'New Draft'}</h2>
              <button type="button" onClick={() => setIsProductModalOpen(false)} className="p-2 text-[#A09393] hover:text-white transition rounded-lg hover:bg-[#221616]"><X className="w-5 h-5" /></button>
            </div>

            {/* Scrollable Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
              
              {/* ---- SECTION: Core Details ---- */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase mb-4">Core Details</h3>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-[#C5B3B3]">Instrument Title *</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] focus:outline-none transition" placeholder="e.g., Premium Sheesham Tabla" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C5B3B3]">Category</label>
                    <select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full px-3 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none">
                      {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {formData.category === 'Others' && (
                      <input type="text" value={customCategory} onChange={(e) => setCustomCategory(e.target.value)} className="w-full mt-2 px-4 py-2.5 bg-[#160F0F] border border-[#D4AF37]/50 rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="Type custom category..." />
                    )}
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C5B3B3]">Sub-Category</label>
                    <input type="text" value={formData.sub_category} onChange={(e) => setFormData({...formData, sub_category: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" placeholder="e.g., Dholak" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C5B3B3]">Base Price (₹) *</label>
                    <input type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none font-mono" placeholder="8000" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-[#C5B3B3]">Bulk Price (₹)</label>
                    <input type="number" value={formData.bulk_price} onChange={(e) => setFormData({...formData, bulk_price: e.target.value})} className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none font-mono" placeholder="Optional" />
                  </div>
                </div>
              </div>

              {/* ---- SECTION: Media Upload ---- */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">Media (Images/Video/Audio)</h3>
                
                <label className={`w-full h-24 border-2 border-dashed rounded-xl flex flex-col items-center justify-center cursor-pointer transition ${isUploading ? 'border-[#3D2828] bg-[#1C1212]/50' : 'border-[#2C1E1E] hover:border-[#D4AF37] bg-[#1C1212]'}`}>
                  <input type="file" multiple accept="image/*,video/*,audio/*" onChange={(e) => handleMediaUpload(e.target.files)} className="hidden" disabled={isUploading} />
                  {isUploading ? (
                    <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin mb-2" />
                  ) : (
                    <UploadCloud className="w-6 h-6 text-[#5A4B4B] mb-2" />
                  )}
                  <p className="text-xs text-[#A09393]">{isUploading ? 'Uploading to bucket...' : <><span className="text-[#D4AF37]">Click to upload</span> Images, Videos, or Audio</>}</p>
                </label>

                {formData.media.length > 0 && (
                  <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin mt-4">
                    {formData.media.map((m, i) => (
                      <div key={i} className={`relative w-20 h-20 rounded-lg overflow-hidden border-2 shrink-0 group ${i === 0 ? 'border-[#D4AF37]' : 'border-transparent bg-[#1C1212]'}`}>
                        {m.type === 'image' ? (
                          <img src={m.url} alt="Preview" className="w-full h-full object-cover" />
                        ) : m.type === 'video' ? (
                          <div className="w-full h-full flex items-center justify-center"><FileVideo className="w-8 h-8 text-rose-400" /></div>
                        ) : (
                          <div className="w-full h-full flex items-center justify-center"><FileAudio className="w-8 h-8 text-blue-400" /></div>
                        )}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-2 transition">
                          {i !== 0 && <button onClick={(e) => { e.preventDefault(); setPrimaryMedia(i); }} className="p-1 bg-[#D4AF37] text-black rounded text-[10px] font-bold">PRIMARY</button>}
                          <button onClick={(e) => { e.preventDefault(); removeMedia(i); }} className="p-1 bg-rose-500 text-white rounded"><X className="w-3 h-3" /></button>
                        </div>
                        {i === 0 && <div className="absolute top-1 left-1 px-1.5 py-0.5 bg-[#D4AF37] text-black text-[8px] font-bold rounded shadow">PRIMARY</div>}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ---- SECTION: Specifications ---- */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">Specifications</h3>
                <div className="grid grid-cols-2 gap-4">
                  <input type="text" value={formData.material} onChange={(e) => setFormData({...formData, material: e.target.value})} placeholder="Material" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.size} onChange={(e) => setFormData({...formData, size: e.target.value})} placeholder="General Size" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.height} onChange={(e) => setFormData({...formData, height: e.target.value})} placeholder="Height (optional)" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.width} onChange={(e) => setFormData({...formData, width: e.target.value})} placeholder="Width (optional)" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.weight} onChange={(e) => setFormData({...formData, weight: e.target.value})} placeholder="Weight (optional)" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.chati} onChange={(e) => setFormData({...formData, chati: e.target.value})} placeholder="Chati Size (optional)" className="w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                  <input type="text" value={formData.dhumma} onChange={(e) => setFormData({...formData, dhumma: e.target.value})} placeholder="Dhumma Size (optional)" className="col-span-2 w-full px-4 py-2.5 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none" />
                </div>
                <textarea rows="3" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} placeholder="Detailed description..." className="w-full px-4 py-3 bg-[#1C1212] border border-[#2C1E1E] rounded-xl text-sm text-white focus:border-[#D4AF37] outline-none resize-none"></textarea>
              </div>

              {/* ---- SECTION: Variants (with image + price) ---- */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase">Variants</h3>
                <p className="text-[11px] text-[#5A4B4B] -mt-2">Add color variants, size options, or different finishes — each with its own price and image.</p>
                
                <div className="bg-[#1C1212] border border-[#2C1E1E] rounded-xl p-4 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={vName} onChange={(e) => setVName(e.target.value)} placeholder="Variant name (e.g., Sunburst)" className="flex-1 px-3 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white focus:border-[#D4AF37] outline-none" />
                    <input type="number" value={vPrice} onChange={(e) => setVPrice(e.target.value)} placeholder="Price ₹" className="w-28 px-3 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white font-mono focus:border-[#D4AF37] outline-none" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`flex-1 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition relative ${isDraggingVariant ? 'border-[#D4AF37] bg-[#D4AF37]/10' : isUploadingVariant ? 'border-[#3D2828] bg-[#160F0F]' : 'border-[#3D2828] hover:border-[#D4AF37] bg-[#160F0F]'}`}
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVariant(true); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVariant(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVariant(false); }}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingVariant(false); handleVariantMediaUpload(e.dataTransfer.files); }}
                        onClick={() => document.getElementById('variant-media-input').click()}
                      >
                        <input id="variant-media-input" type="file" multiple accept="image/*,video/*,audio/*" onChange={handleVariantMediaUpload} className="hidden" disabled={isUploadingVariant} />
                        {isUploadingVariant ? <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" /> : <span className="text-[10px] text-[#A09393] uppercase font-bold tracking-wider">{isDraggingVariant ? 'Drop files!' : '+ Upload Variant Media'}</span>}
                      </div>
                      <button type="button" onClick={addVariant} className="px-5 py-2 h-12 bg-[#221616] text-[#D4AF37] border border-[#3D2828] rounded-lg text-xs font-bold hover:bg-[#3D2828] transition shrink-0">+ Add Variant</button>
                    </div>
                    {vMedia.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        {vMedia.map((m, i) => (
                          <div key={i} className="relative w-10 h-10 rounded-md overflow-hidden border border-[#3D2828] shrink-0 group">
                            {m.type === 'image' ? <img src={m.url} className="w-full h-full object-cover" /> : m.type === 'video' ? <FileVideo className="w-4 h-4 m-auto text-rose-400 mt-2" /> : <FileAudio className="w-4 h-4 m-auto text-blue-400 mt-2" />}
                            <button type="button" onClick={() => setVMedia(vMedia.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formData.variants.length > 0 && (
                  <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-xl divide-y divide-[#2C1E1E]">
                    {formData.variants.map((v, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3">
                        {v.media && v.media.length > 0 ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#3D2828] shrink-0 relative">
                            {v.media[0].type === 'image' ? <img src={v.media[0].url} alt="" className="w-full h-full object-cover" /> : v.media[0].type === 'video' ? <FileVideo className="w-4 h-4 m-auto text-rose-400 mt-3" /> : <FileAudio className="w-4 h-4 m-auto text-blue-400 mt-3" />}
                            {v.media.length > 1 && <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] px-1 text-white">+{v.media.length - 1}</span>}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#1C1212] border border-[#2C1E1E] flex items-center justify-center shrink-0"><Package className="w-4 h-4 text-[#3D2828]" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{v.name}</div>
                        </div>
                        <span className="font-mono text-sm text-[#D4AF37] font-semibold">₹{v.price?.toLocaleString()}</span>
                        <button type="button" onClick={() => removeVariant(idx)} className="p-1.5 text-[#E25C5C] hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* ---- SECTION: Add-Ons / Frequently Bought Together ---- */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold tracking-widest text-[#D4AF37] uppercase flex items-center gap-2">
                  <ShoppingBag className="w-3.5 h-3.5" /> Add-Ons / Frequently Bought Together
                </h3>
                <p className="text-[11px] text-[#5A4B4B] -mt-2">Suggest accessories or complementary items that customers often buy alongside this product.</p>
                
                <div className="bg-[#1C1212] border border-[#2C1E1E] rounded-xl p-4 space-y-3">
                  <div className="flex gap-2">
                    <input type="text" value={addonName} onChange={(e) => setAddonName(e.target.value)} placeholder="Add-on name (e.g., Drum Cover Bag)" className="flex-1 px-3 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white focus:border-[#D4AF37] outline-none" />
                    <input type="number" value={addonPrice} onChange={(e) => setAddonPrice(e.target.value)} placeholder="Price ₹" className="w-28 px-3 py-2 bg-[#160F0F] border border-[#2C1E1E] rounded-lg text-sm text-white font-mono focus:border-[#D4AF37] outline-none" />
                  </div>
                  <div className="flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div 
                        className={`flex-1 h-12 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer transition relative ${isDraggingAddon ? 'border-[#D4AF37] bg-[#D4AF37]/10' : isUploadingAddon ? 'border-[#3D2828] bg-[#160F0F]' : 'border-[#3D2828] hover:border-[#D4AF37] bg-[#160F0F]'}`}
                        onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAddon(true); }}
                        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAddon(true); }}
                        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAddon(false); }}
                        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDraggingAddon(false); handleAddonMediaUpload(e.dataTransfer.files); }}
                        onClick={() => document.getElementById('addon-media-input').click()}
                      >
                        <input id="addon-media-input" type="file" multiple accept="image/*,video/*,audio/*" onChange={handleAddonMediaUpload} className="hidden" disabled={isUploadingAddon} />
                        {isUploadingAddon ? <Loader2 className="w-4 h-4 text-[#D4AF37] animate-spin" /> : <span className="text-[10px] text-[#A09393] uppercase font-bold tracking-wider">{isDraggingAddon ? 'Drop files!' : '+ Upload Add-on Media'}</span>}
                      </div>
                      <button type="button" onClick={addAddon} className="px-5 py-2 h-12 bg-[#221616] text-[#D4AF37] border border-[#3D2828] rounded-lg text-xs font-bold hover:bg-[#3D2828] transition shrink-0">+ Add Add-on</button>
                    </div>
                    {addonMedia.length > 0 && (
                      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                        {addonMedia.map((m, i) => (
                          <div key={i} className="relative w-10 h-10 rounded-md overflow-hidden border border-[#3D2828] shrink-0 group">
                            {m.type === 'image' ? <img src={m.url} className="w-full h-full object-cover" /> : m.type === 'video' ? <FileVideo className="w-4 h-4 m-auto text-rose-400 mt-2" /> : <FileAudio className="w-4 h-4 m-auto text-blue-400 mt-2" />}
                            <button type="button" onClick={() => setAddonMedia(addonMedia.filter((_, idx) => idx !== i))} className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition"><X className="w-3 h-3 text-white" /></button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {formData.addons.length > 0 && (
                  <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-xl divide-y divide-[#2C1E1E]">
                    {formData.addons.map((a, idx) => (
                      <div key={idx} className="flex items-center gap-3 p-3">
                        {a.media && a.media.length > 0 ? (
                          <div className="w-10 h-10 rounded-lg overflow-hidden border border-[#3D2828] shrink-0 relative">
                            {a.media[0].type === 'image' ? <img src={a.media[0].url} alt="" className="w-full h-full object-cover" /> : a.media[0].type === 'video' ? <FileVideo className="w-4 h-4 m-auto text-rose-400 mt-3" /> : <FileAudio className="w-4 h-4 m-auto text-blue-400 mt-3" />}
                            {a.media.length > 1 && <span className="absolute bottom-0 right-0 bg-black/80 text-[8px] px-1 text-white">+{a.media.length - 1}</span>}
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-lg bg-[#1C1212] border border-[#2C1E1E] flex items-center justify-center shrink-0"><ShoppingBag className="w-4 h-4 text-[#3D2828]" /></div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-white truncate">{a.name}</div>
                          <div className="text-[10px] text-[#A09393] uppercase">Add-on</div>
                        </div>
                        <span className="font-mono text-sm text-[#D4AF37] font-semibold">₹{a.price?.toLocaleString()}</span>
                        <button type="button" onClick={() => removeAddon(idx)} className="p-1.5 text-[#E25C5C] hover:text-rose-400 hover:bg-rose-950/30 rounded-md transition"><X className="w-4 h-4" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>

            {/* Footer */}
            <div className="px-6 py-5 border-t border-[#2C1E1E] bg-[#160F0F] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2 cursor-pointer" onClick={() => setFormData(prev => ({...prev, is_available: !prev.is_available}))}>
                <div className="relative">
                  <div className={`w-9 h-5 rounded-full transition-colors ${formData.is_available ? 'bg-emerald-600' : 'bg-[#3A2A2A]'}`}></div>
                  <div className={`absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white transition-transform ${formData.is_available ? 'translate-x-4' : ''}`}></div>
                </div>
                <span className="text-xs font-medium text-[#C5B3B3]">Ready to Publish</span>
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setIsProductModalOpen(false)} className="px-5 py-2.5 rounded-xl text-sm font-medium text-[#A09393] hover:text-white transition">Cancel</button>
                <button type="button" onClick={handleSubmit} className="px-6 py-2.5 bg-gradient-to-r from-[#D4AF37] to-[#BFA030] hover:opacity-90 text-black font-semibold text-sm rounded-xl shadow-lg transition cursor-pointer relative z-10">
                  {editingId ? 'Save Changes' : 'Save Draft'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
