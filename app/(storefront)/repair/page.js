"use client";

import React, { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Wrench, Sparkles, MessageCircle, Send, CheckCircle2, UploadCloud, Trash2, Loader2, FileAudio, FileVideo, FileImage, PhoneCall, Search } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';
import Link from 'next/link';

export default function RepairPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    instrument: 'Tabla',
    brandOrModel: '',
    description: '',
    accessories: ''
  });
  
  const [mediaList, setMediaList] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [insertedId, setInsertedId] = useState(null);

  const [trackId, setTrackId] = useState('');
  const [trackingRepair, setTrackingRepair] = useState(null);
  const [trackingSearched, setTrackingSearched] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('submit'); // 'submit' or 'track'

  React.useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const track = params.get('track');
      if (track) {
        setTrackId(track);
        setActiveTab('track');
        const runLookup = async () => {
          setTrackingLoading(true);
          setTrackingSearched(true);
          try {
            const { data, error } = await supabase
              .from('repairs')
              .select('*')
              .eq('id', track.trim())
              .single();
            if (!error && data) setTrackingRepair(data);
          } catch (e) {}
          setTrackingLoading(false);
        };
        runLookup();
      }
    }
  }, []);

  const handleTrackRepair = async (e) => {
    e.preventDefault();
    if (!trackId.trim()) return;
    
    setTrackingLoading(true);
    setTrackingSearched(true);
    
    try {
      const { data, error } = await supabase
        .from('repairs')
        .select('*')
        .eq('id', trackId.trim())
        .single();
        
      if (error) {
        setTrackingRepair(null);
      } else {
        setTrackingRepair(data);
      }
    } catch (err) {
      setTrackingRepair(null);
    } finally {
      setTrackingLoading(false);
    }
  };

  const parseUploadedFiles = (input) => {
    if (!input) return [];
    if (typeof FileList !== 'undefined' && input instanceof FileList) return Array.from(input);
    if (Array.isArray(input)) return input;
    if (input.target && input.target.files) return Array.from(input.target.files);
    if (input.files) return Array.from(input.files);
    if (typeof input.length === 'number') return Array.from(input);
    return [];
  };

  const handleMediaUpload = async (input) => {
    const files = parseUploadedFiles(input);
    if (!files.length) return;

    setIsUploading(true);
    const uploadedMedia = [...mediaList];

    for (const file of files) {
      try {
        const fileExt = file.name.split('.').pop();
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
        const filePath = `repairs/${fileName}`;

        const { error: uploadError } = await supabase.storage.from('media').upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage.from('media').getPublicUrl(filePath);

        uploadedMedia.push({
          url: publicUrl,
          type: file.type.split('/')[0],
          name: file.name
        });
      } catch (err) {
        alert(`Failed to upload ${file.name}: ${err.message}`);
      }
    }

    setMediaList(uploadedMedia);
    setIsUploading(false);
    e.target.value = '';
  };

  const removeMedia = (index) => {
    const newMedia = [...mediaList];
    newMedia.splice(index, 1);
    setMediaList(newMedia);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.phone || !form.instrument || !form.description) {
      alert("Please fill in all required fields.");
      return;
    }

    setSubmitting(true);

    const payload = {
      customer_name: form.name,
      customer_phone: form.phone,
      customer_email: form.email || null,
      customer_address: form.address || null,
      instrument_type: form.instrument,
      brand_or_model: form.brandOrModel || null,
      issue_description: form.description,
      accessories_included: form.accessories || null,
      media: mediaList,
      status: 'pending',
      estimated_cost: 0,
      advance_paid: 0,
      estimated_completion_date: null
    };

    try {
      const { data, error } = await supabase.from('repairs').insert([payload]).select();
      if (error) throw error;

      if (data && data.length > 0) {
        setInsertedId(data[0].id);
        const newId = data[0].id;
        const msg = `Hi, I have submitted a Repair Request (ID: ${newId}):\n\n` +
          `*Name:* ${form.name}\n` +
          `*Phone:* ${form.phone}\n` +
          `*Instrument:* ${form.instrument}\n` +
          `*Problem:* ${form.description}`;
        const encoded = encodeURIComponent(msg);
        window.open(`https://wa.me/918591223874?text=${encoded}`, '_blank');
      }
      setSubmitted(true);
    } catch (err) {
      alert("Error submitting request: " + err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const triggerWhatsAppNotification = () => {
    const message = `Hi, I have submitted a Repair Request (ID: ${insertedId || 'New'}):\n\n` +
      `*Name:* ${form.name}\n` +
      `*Phone:* ${form.phone}\n` +
      `*Instrument:* ${form.instrument}\n` +
      `*Problem:* ${form.description}`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918591223874?text=${encoded}`, '_blank');
  };

  const triggerDirectWhatsApp = () => {
    const message = `Hi, I want to inquire about repair/tuning services for my instrument.`;
    const encoded = encodeURIComponent(message);
    window.open(`https://wa.me/918591223874?text=${encoded}`, '_blank');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FDFCF7]">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A028]/10 text-xs font-bold uppercase tracking-wider text-[#C5A028] mb-4">
          <Wrench className="w-3 h-3" /> Repair Services
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F] mb-4">
          Instrument Repair & Tuning
        </h1>
        <p className="text-[#6E6262] text-lg">
          Submit your repair request directly into our system, or contact us directly on WhatsApp for any questions.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-8">
        
        {/* Left column: Direct WhatsApp Inquiry & Policies */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-sm text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-4 border border-green-200">
              <MessageCircle className="w-8 h-8" />
            </div>
            <h3 className="text-xl font-bold text-[#2C1F1F] mb-2">Direct Contact</h3>
            <p className="text-sm text-[#6E6262] leading-relaxed mb-6">
              Prefer to talk to us directly without filling the form? Click below to chat or call us on WhatsApp.
            </p>
            <button 
              onClick={triggerDirectWhatsApp}
              className="w-full flex items-center justify-center gap-2 h-12 bg-[#25D366] text-white hover:bg-[#1EBE5D] rounded-xl font-bold text-sm transition"
            >
              <MessageCircle className="w-5 h-5" /> Chat on WhatsApp
            </button>
            <a 
              href="tel:+919821360536"
              className="w-full flex items-center justify-center gap-2 h-12 bg-[#FAF9F5] border border-[#E2DDD5] text-[#2C1F1F] hover:bg-[#E2DDD5]/20 rounded-xl font-bold text-sm transition mt-3"
            >
              <PhoneCall className="w-4 h-4 text-[#C5A028]" /> Call: 9821360536
            </a>
          </div>

          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="font-bold text-[#2C1F1F] flex items-center gap-2 text-sm border-b border-[#EAE6DF] pb-2">
              <Sparkles className="w-4 h-4 text-[#C5A028]" /> Store Policies & Info
            </h4>
            <ul className="space-y-3 text-xs text-[#6E6262] leading-relaxed">
              <li className="flex items-start gap-2">
                <span className="text-[#C5A028] font-bold">•</span>
                <span><strong>No Returns:</strong> Once an item is sold, it cannot be returned.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A028] font-bold">•</span>
                <span><strong>Inspection Notification:</strong> The product, once ready for inspection/pickup, will be notified to the customer immediately.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A028] font-bold">•</span>
                <span><strong>Owner Pricing:</strong> The final repair price is decided solely by the store owner.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-[#C5A028] font-bold">•</span>
                <span><strong>Tuning & Services:</strong> Tabla skin replacement, Harmonium tuning, Guitar fretting & setups, Synthesizer key repairs.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right column: Interactive Repair Request Form / Track Status Tabbed View (2 cols wide) */}
        <div className="lg:col-span-2 bg-white border border-[#E2DDD5] rounded-2xl p-6 sm:p-10 shadow-sm flex flex-col">
          
          {/* Tab Headers */}
          <div className="flex gap-3 mb-8 shrink-0">
            <button
              onClick={() => setActiveTab('submit')}
              className={`px-5 py-3 text-sm font-bold transition-all rounded-xl border ${activeTab === 'submit' ? 'bg-[#C5A028]/10 border-[#C5A028] text-[#C5A028] shadow-[0_0_15px_rgba(197,160,40,0.15)]' : 'border-transparent text-[#6E6262] hover:text-[#2C1F1F] hover:bg-[#F5F2EB] hover:border-[#E2DDD5]'}`}
            >
              Request Repair Form
            </button>
            <button
              onClick={() => setActiveTab('track')}
              className={`px-5 py-3 text-sm font-bold transition-all rounded-xl border ${activeTab === 'track' ? 'bg-[#C5A028]/10 border-[#C5A028] text-[#C5A028] shadow-[0_0_15px_rgba(197,160,40,0.15)]' : 'border-transparent text-[#6E6262] hover:text-[#2C1F1F] hover:bg-[#F5F2EB] hover:border-[#E2DDD5]'}`}
            >
              Track Repair Status
            </button>
          </div>

          {activeTab === 'submit' ? (
            submitted ? (
              <div className="text-center py-16 space-y-6">
                <div className="w-16 h-16 bg-green-50 border border-green-200 text-green-600 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-[#2C1F1F]">Request Logged!</h3>
                  <p className="text-sm text-[#6E6262] mt-2">
                    Your repair ticket (ID: <span className="font-mono font-bold text-[#C5A028]">{insertedId}</span>) has been saved directly to our database.
                  </p>
                </div>
                <div className="p-4 bg-[#FAF9F5] rounded-xl border border-[#E2DDD5] max-w-md mx-auto space-y-3">
                  <p className="text-xs text-[#6E6262]">
                    Would you like to notify our repair technician on WhatsApp to get a faster response?
                  </p>
                  <button
                    onClick={triggerWhatsAppNotification}
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#25D366] text-white hover:bg-[#1EBE5D] font-bold text-sm rounded-full transition w-full"
                  >
                    <MessageCircle className="w-4 h-4" /> Notify via WhatsApp
                  </button>
                  <Link
                    href="/cart?tab=orders"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-[#2C1F1F] text-white hover:bg-black font-bold text-sm rounded-full transition w-full"
                  >
                    View Status in My Orders & Repairs
                  </Link>
                </div>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setForm({
                      name: '', phone: '', email: '', address: '',
                      instrument: 'Tabla', brandOrModel: '', description: '', accessories: ''
                    });
                    setMediaList([]);
                  }}
                  className="text-xs text-[#C5A028] font-bold hover:underline"
                >
                  Submit another request
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="border-b border-[#EAE6DF] pb-4 mb-6">
                  <h3 className="text-2xl font-bold text-[#2C1F1F]">Submit Repair Job</h3>
                  <p className="text-xs text-[#8C7E7E]">Please enter the details below. Required fields are marked *</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Customer Name *</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                      placeholder="Enter your name"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Phone Number *</label>
                    <input 
                      type="tel" 
                      required
                      value={form.phone}
                      onChange={(e) => setForm({ ...form, phone: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                      placeholder="Enter your phone"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Email Address</label>
                    <input 
                      type="email" 
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                      placeholder="Email (optional)"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Customer Address</label>
                    <input 
                      type="text" 
                      value={form.address}
                      onChange={(e) => setForm({ ...form, address: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                      placeholder="Home address (optional)"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Instrument Type *</label>
                    <select 
                      value={form.instrument}
                      onChange={(e) => setForm({ ...form, instrument: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028] cursor-pointer"
                    >
                      <option value="Tabla">Tabla</option>
                      <option value="Dholak">Dholak / Nal</option>
                      <option value="Harmonium">Harmonium</option>
                      <option value="Guitar">Guitar</option>
                      <option value="Keyboard">Keyboard / Synth</option>
                      <option value="Sitar">Sitar</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Brand / Model</label>
                    <input 
                      type="text" 
                      value={form.brandOrModel}
                      onChange={(e) => setForm({ ...form, brandOrModel: e.target.value })}
                      className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                      placeholder="E.g., Yamaha, Gibson, Scale Changer (optional)"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Problem Description *</label>
                  <textarea 
                    required
                    rows="4"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028] resize-none"
                    placeholder="Describe what repair or tuning is needed..."
                  ></textarea>
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-2">Accessories Included</label>
                  <input 
                    type="text" 
                    value={form.accessories}
                    onChange={(e) => setForm({ ...form, accessories: e.target.value })}
                    className="w-full bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                    placeholder="E.g., Bag, tuning hammer, stand, adapter (optional)"
                  />
                </div>

                {/* Media Upload */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#6E6262] mb-3">Upload Photos / Audio / Video</label>
                  <div 
                    className={`w-full border-2 border-dashed rounded-xl px-6 py-6 cursor-pointer transition flex flex-col items-center justify-center mb-4 ${isDragging ? 'border-[#C5A028] bg-[#C5A028]/10 scale-[1.02]' : 'border-[#E2DDD5] hover:border-[#C5A028] bg-[#FAF9F5] text-[#6E6262] hover:text-[#C5A028]'}`}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); }}
                    onDrop={(e) => { e.preventDefault(); e.stopPropagation(); setIsDragging(false); handleMediaUpload(e.dataTransfer.files); }}
                    onClick={() => document.getElementById('repair-file-input').click()}
                  >
                    {isUploading ? (
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                    ) : isDragging ? (
                      <UploadCloud className="w-8 h-8 text-[#C5A028] mb-2 animate-bounce" />
                    ) : (
                      <UploadCloud className="w-6 h-6 mb-2" />
                    )}
                    <span className="text-xs font-bold">
                      {isUploading ? 'Uploading...' : isDragging ? 'Drop files here!' : 'Click to upload or drag & drop'}
                    </span>
                    <input 
                      id="repair-file-input"
                      type="file" 
                      multiple 
                      onChange={handleMediaUpload}
                      disabled={isUploading}
                      className="hidden" 
                    />
                  </div>
                  <div className="flex flex-wrap gap-4 items-center">
                    
                    {mediaList.map((media, idx) => (
                      <div key={idx} className="relative bg-[#FAF9F5] border border-[#E2DDD5] p-2 rounded-xl flex items-center gap-2 max-w-[200px]">
                        <div className="text-[#C5A028] shrink-0">
                          {media.type === 'image' && <FileImage className="w-4 h-4" />}
                          {media.type === 'video' && <FileVideo className="w-4 h-4" />}
                          {media.type === 'audio' && <FileAudio className="w-4 h-4" />}
                        </div>
                        <span className="text-[10px] text-[#2C1F1F] truncate flex-1">{media.name}</span>
                        <button 
                          type="button" 
                          onClick={() => removeMedia(idx)}
                          className="text-[#8C7E7E] hover:text-red-500 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-4 border-t border-[#EAE6DF] flex justify-end">
                  <button 
                    type="submit"
                    disabled={submitting}
                    className="flex items-center gap-2 px-8 h-12 bg-[#C5A028] text-white hover:bg-[#A98920] rounded-full font-bold text-sm transition disabled:opacity-55"
                  >
                    {submitting ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
                    ) : (
                      <><Send className="w-4 h-4" /> Submit Request</>
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            <div className="space-y-6">
              <div className="border-b border-[#EAE6DF] pb-4 mb-6">
                <h3 className="text-2xl font-bold text-[#2C1F1F]">Track Repair Status</h3>
                <p className="text-xs text-[#8C7E7E]">Enter your Repair Job ID to check live status updates and view invoices.</p>
              </div>

              <form onSubmit={handleTrackRepair} className="flex gap-3 max-w-md">
                <input 
                  type="text" 
                  required
                  value={trackId}
                  onChange={(e) => setTrackId(e.target.value)}
                  className="flex-1 bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028]"
                  placeholder="Job ID (e.g. 5)"
                />
                <button 
                  type="submit"
                  disabled={trackingLoading}
                  className="bg-[#C5A028] hover:bg-[#A98920] text-white px-6 py-3 rounded-xl transition text-sm font-bold flex items-center justify-center shrink-0"
                >
                  {trackingLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Track Job"}
                </button>
              </form>

              {trackingLoading && (
                <div className="text-center py-12 text-[#C5A028] font-mono text-sm tracking-widest animate-pulse">
                  RETRIEVING JOB DATA...
                </div>
              )}

              {!trackingLoading && trackingSearched && trackingRepair && (
                <div className="space-y-6 bg-[#FAF9F5] border border-[#E2DDD5] rounded-2xl p-6 sm:p-8 animate-in fade-in slide-in-from-bottom-2">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b border-[#E2DDD5]">
                    <div>
                      <h4 className="text-xl font-bold text-[#2C1F1F]">{trackingRepair.instrument_type}</h4>
                      <span className="text-xs text-[#8C7E7E] font-mono mt-0.5 block">Job Reference: #{trackingRepair.id}</span>
                    </div>
                    <span className={`px-4 py-1.5 rounded-full font-bold text-xs uppercase text-center border inline-block ${
                      trackingRepair.status === 'pending' ? 'bg-amber-100 text-amber-800 border-amber-200' :
                      trackingRepair.status === 'in-progress' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                      trackingRepair.status === 'ready' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                      'bg-zinc-100 text-zinc-800 border-zinc-200'
                    }`}>
                      {trackingRepair.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                    <div className="space-y-2">
                      <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Owner / Customer</span>
                      <span className="font-semibold text-[#2C1F1F]">{trackingRepair.customer_name}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Brand / Model</span>
                      <span className="font-semibold text-[#2C1F1F]">{trackingRepair.brand_or_model || 'N/A'}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Estimated Repair Cost</span>
                      <span className="font-bold text-[#C5A028] font-mono text-lg">₹{trackingRepair.estimated_cost?.toLocaleString() || '0'}</span>
                    </div>
                    <div className="space-y-2">
                      <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Ready Date</span>
                      <span className="font-semibold text-[#2C1F1F]">
                        {trackingRepair.estimated_completion_date ? new Date(trackingRepair.estimated_completion_date).toLocaleDateString() : 'Under Inspection'}
                      </span>
                    </div>
                  </div>

                  {trackingRepair.issue_description && (
                    <div className="pt-4 border-t border-[#E2DDD5]">
                      <span className="text-[#8C7E7E] uppercase font-mono block text-xs mb-2">Issue Reported</span>
                      <p className="text-sm text-[#6E6262] leading-relaxed whitespace-pre-wrap">{trackingRepair.issue_description}</p>
                    </div>
                  )}

                  {/* Bill Receipt display */}
                  {trackingRepair.media?.some(m => m.role === 'bill') && (
                    <div className="pt-6 border-t border-[#E2DDD5] space-y-3">
                      <span className="text-[#8C7E7E] uppercase font-mono block text-xs">Invoice & Billing Info</span>
                      {trackingRepair.media.filter(m => m.role === 'bill').map((bill, idx) => (
                        <div key={idx} className="bg-white border border-[#E2DDD5] rounded-xl p-4 space-y-4">
                          {bill.bill_number && (
                            <div className="flex justify-between items-center text-sm border-b border-[#F5F2EB] pb-3">
                              <span className="text-[#8C7E7E] font-medium">Invoice Number:</span>
                              <span className="font-mono font-bold text-[#2C1F1F]">#{bill.bill_number}</span>
                            </div>
                          )}
                          {bill.url ? (
                            <div className="flex flex-col sm:flex-row items-center gap-4 justify-between pt-1">
                              <div className="flex items-center gap-3 overflow-hidden w-full sm:w-auto">
                                <div className="w-12 h-12 rounded bg-[#FAF9F5] border border-[#E2DDD5] overflow-hidden shrink-0 flex items-center justify-center">
                                  <img src={bill.url} className="w-full h-full object-cover" alt="Invoice Preview" />
                                </div>
                                <div className="min-w-0">
                                  <span className="text-xs font-bold text-[#2C1F1F] block truncate">{bill.name || 'invoice.jpg'}</span>
                                  <span className="text-[10px] text-[#8C7E7E] uppercase font-mono">Invoice Attachment</span>
                                </div>
                              </div>
                              <a 
                                href={bill.url} 
                                target="_blank" 
                                rel="noopener noreferrer" 
                                className="px-4 py-2 bg-[#C5A028] hover:bg-[#A98920] text-white font-bold text-xs rounded-lg transition text-center w-full sm:w-auto shrink-0 animate-pulse hover:animate-none"
                              >
                                View Bill Image
                              </a>
                            </div>
                          ) : (
                            <p className="text-xs text-[#8C7E7E] italic pt-1">No bill image uploaded yet.</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Technician Updates Comments */}
                  <div className="pt-6 border-t border-[#E2DDD5]">
                    <span className="text-[#8C7E7E] uppercase font-mono block text-xs mb-3">Technician Progress Updates</span>
                    <div className="space-y-3">
                      {!trackingRepair.media || trackingRepair.media.filter(m => m.type === 'comment').length === 0 ? (
                        <p className="text-xs text-[#8C7E7E] italic">No progress comments recorded yet.</p>
                      ) : (
                        trackingRepair.media.filter(m => m.type === 'comment').map((comm, idx) => (
                          <div key={idx} className="bg-white border border-[#E2DDD5] p-4 rounded-xl space-y-2">
                            <p className="text-[#2C1F1F] text-xs leading-relaxed font-medium">{comm.text}</p>
                            <span className="text-[10px] text-[#8C7E7E] block text-right font-mono">
                              {new Date(comm.date).toLocaleString()}
                            </span>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              {!trackingLoading && trackingSearched && !trackingRepair && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-6 rounded-xl text-center text-sm font-semibold">
                  No active repair job found with ID "{trackId}". Please verify your Job ID and try again.
                </div>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
