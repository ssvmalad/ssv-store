"use client";

import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Clock, Send, MessageCircle, Sparkles, Share2 } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ContactPage() {
  const { t } = useLanguage();
  const [form, setForm] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);
  const [aboutData, setAboutData] = useState({
    estd: "2003",
    who_we_are: "Saraswati Sangeet Vadhyalaya is a musical instrument store and repair workshop based in Ambevadi , Kurar Village, Malad East, Mumbai. We are dedicated to providing standard and custom instruments at reasonable rates and perform repairing tasks.",
    services: "Whether you need to purchase custom-ordered classical instrument or require precise repair work of instruments such as Drums ,Guitar ,Dholak etc, we provide it . From Tabla skin replacement and Guitar tuning to Harmonium air bellows restoration, Guitar fret alignment, and Keyboard cleanup and restoration every aspect is taken care of.",
    motive: "We believe in customizing according to our customers needs and playing. Every instrument sold is checked by us, and all repair works are done manually . We promise precision you can hear and craftsmanship you can trust."
  });

  useEffect(() => {
    fetch('/api/store-info')
      .then(res => res.json())
      .then(data => {
        if (data && data.about) {
          setAboutData(data.about);
        }
      })
      .catch(err => console.error("Failed to load about details:", err));
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    
    // Construct WhatsApp message
    const text = `*New Contact Form Message*\n\n*Name:* ${form.name}\n*Email:* ${form.email}\n\n*Message:*\n${form.message}`;
    window.open(`https://wa.me/918591223874?text=${encodeURIComponent(text)}`, '_blank');

    setTimeout(() => {
      setSubmitted(false);
      setForm({ name: '', email: '', message: '' });
    }, 3000);
  };

  return (
    <div className="relative min-h-screen">
      {/* Global Background */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/30" />

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Title */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4 shadow-sm border border-[#D4AF37]/20">
            <Sparkles className="w-3 h-3" /> About & Contact
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-4">
            Get to Know Us
          </h1>
          <p className="text-white/80 text-lg">
            Learn about our heritage or get in touch for custom instruments, tuning, and expert repairs.
          </p>
        </div>

      <div className="space-y-12 animate-in fade-in slide-in-from-bottom-2">
        {/* About Section */}
        {/* About Section */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl mb-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-white/10 pb-6 mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">About the Shop</h2>
              <p className="text-xs text-[#D4AF37] font-bold uppercase tracking-wider mt-1">Established in Malad East, Mumbai</p>
            </div>
            <span className="px-4 py-2 rounded-xl bg-white/10 border border-white/10 text-xs font-semibold text-white/90 self-start md:self-auto shrink-0 font-mono">
              ESTD. {aboutData.estd}
            </span>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-white/80 text-sm leading-relaxed">
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Who We Are</h3>
              <p>
                {aboutData.who_we_are}
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Custom Made and Repair Services</h3>
              <p>
                {aboutData.services}
              </p>
            </div>
            <div className="space-y-3">
              <h3 className="font-bold text-white text-base">Our Musical Motive</h3>
              <p>
                {aboutData.motive}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20">
          {/* Contact Info column */}
          <div className="space-y-12">
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl space-y-8">
              <h3 className="text-2xl font-bold text-white border-b border-white/10 pb-4">Store Details</h3>
              
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <MapPin className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">{t('ourAddress')}</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    {t('addressText')}
                  </p>
                  <a 
                    href="https://maps.app.goo.gl/Qak75xiQmEhJVogx8" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-block mt-2 text-[#D4AF37] text-sm font-semibold hover:underline"
                  >
                    {t('viewGoogleMaps')} →
                  </a>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <Phone className="w-5 h-5" />
                </div>
                <div>
                <h4 className="font-bold text-white mb-3">{t('callWhatsApp')}</h4>
                <div className="flex flex-col gap-2">
                  <a 
                    href="https://wa.me/919821360536" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#25D366]/90 hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-fit border border-[#25D366]/50"
                  >
                    <MessageCircle className="w-4 h-4" /> Dinesh: +91 98213 60536
                  </a>
                  <a 
                    href="https://wa.me/919833991547" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#25D366]/90 hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-fit border border-[#25D366]/50"
                  >
                    <MessageCircle className="w-4 h-4" /> Manisha: +91 98339 91547
                  </a>
                  <a 
                    href="https://wa.me/918591223874" 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="inline-flex items-center gap-2 text-xs font-bold text-white bg-[#25D366]/90 hover:bg-[#1EBE5D] px-4 py-2 rounded-xl transition shadow-sm w-fit border border-[#25D366]/50"
                  >
                    <MessageCircle className="w-4 h-4" /> Yash: +91 85912 23874
                  </a>
                </div>
              </div>
              </div>

              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0 border border-[#D4AF37]/20">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white mb-1">Business Hours</h4>
                  <p className="text-white/70 text-sm leading-relaxed">
                    Monday - Sunday: 10:00 AM - 10:00 PM
                  </p>
                </div>
              </div>
            </div>

            {/* Socials */}
            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 shadow-xl">
              <h4 className="font-bold text-white mb-4 flex items-center gap-2">
                <Share2 className="w-5 h-5 text-[#D4AF37]" /> Follow Our Social Handles
              </h4>
              <div className="flex gap-3">
                <a 
                  href="https://instagram.com/saraswatisangeet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:text-white hover:border-[#D4AF37] hover:bg-white/10 transition"
                >
                  <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                  </svg>
                  <span>Instagram</span>
                </a>
                <a 
                  href="https://facebook.com/saraswatisangeet" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-sm text-white/80 hover:text-white hover:border-[#D4AF37] hover:bg-white/10 transition"
                >
                  <svg className="w-4 h-4 text-current" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
                  </svg>
                  <span>Facebook</span>
                </a>
              </div>
            </div>
          </div>

          {/* Message Form column */}
          <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-2xl p-8 sm:p-10 shadow-xl flex flex-col justify-between">
            <div>
              <h3 className="text-2xl font-bold text-white mb-2">Send a Message</h3>
              <p className="text-white/70 text-sm mb-8">
                Fill out the form below and we will get back to you as soon as possible.
              </p>

              {submitted ? (
                <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-6 py-8 rounded-xl text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center mx-auto">
                    <Send className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-lg">Message Sent!</h4>
                  <p className="text-sm text-green-400/80">Thank you for reaching out. We will get back to you shortly.</p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Your Name</label>
                    <input 
                      type="text" 
                      required
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition"
                      placeholder="Enter your full name"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Your Email</label>
                    <input 
                      type="email" 
                      required
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition"
                      placeholder="Enter your email address"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-white/60 mb-2">Message</label>
                    <textarea 
                      required
                      rows="5"
                      value={form.message}
                      onChange={(e) => setForm({ ...form, message: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3.5 text-sm text-white placeholder-white/40 focus:outline-none focus:border-[#D4AF37] focus:bg-black/60 transition resize-none"
                      placeholder="Tell us what you are looking for..."
                    ></textarea>
                  </div>

                  <button 
                    type="submit"
                    className="w-full flex items-center justify-center gap-2 h-14 bg-[#D4AF37] text-black hover:bg-[#C5A028] rounded-full font-bold text-sm transition shadow-sm hover:shadow"
                  >
                    <Send className="w-4 h-4" /> Send Message
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
