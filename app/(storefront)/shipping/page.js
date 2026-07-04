"use client";

import React, { useState } from 'react';
import { Package, Truck, Compass, CheckCircle2, Search, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/lib/LanguageContext';

export default function ShippingDeliveryPage() {
  const { t } = useLanguage();
  const [orderId, setOrderId] = useState('');
  const [trackingData, setTrackingData] = useState(null);
  const [searched, setSearched] = useState(false);

  const handleTrack = (e) => {
    e.preventDefault();
    setSearched(true);
    
    // Simulate lookup
    if (orderId.trim()) {
      setTrackingData({
        id: orderId.toUpperCase(),
        status: 'In Transit',
        step: 3, // out of 4
        date: 'July 3, 2026',
        carrier: 'DTDC Express',
        history: [
          { status: 'Order Placed & Confirmed on WhatsApp', date: 'July 1, 2026, 03:00 PM', desc: 'Availability verified and payment completed securely.', done: true },
          { status: 'Packed & Secured', date: 'July 2, 2026, 11:30 AM', desc: 'Instrument packed with premium protective air bubble wrap.', done: true },
          { status: 'Handed over to Carrier (In Transit)', date: 'July 2, 2026, 04:00 PM', desc: 'Dispatched via DTDC Express. Transit code generated.', done: true },
          { status: 'Out for Delivery', date: 'July 3, 2026, 09:30 AM', desc: 'Out for local delivery from destination hub.', done: false },
          { status: 'Delivered', date: 'Pending', desc: 'Customer signature required.', done: false }
        ]
      });
    } else {
      setTrackingData(null);
    }
  };

  const stepsList = [
    { title: '1. Add & Checkout', desc: 'Add instruments to your cart and click checkout. It redirects you to WhatsApp with your order details pre-filled.' },
    { title: '2. Confirm Shipping & Pay', desc: 'We verify the instrument in stock and estimate shipping costs based on weight and your address, then share UPI payment details.' },
    { title: '3. Premium Packing', desc: 'All instruments are packed with thick foam cushions, bubble wrap, and cardboard/wood boxes to avoid any damage in transit.' },
    { title: '4. Safe Delivery', desc: 'We dispatch your items via trusted shipping partners (DTDC, Professional Courier) or arrange fast local delivery within Mumbai.' }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 bg-[#FDFCF7]">
      {/* Title */}
      <div className="text-center max-w-2xl mx-auto mb-16">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#C5A028]/10 text-xs font-bold uppercase tracking-wider text-[#C5A028] mb-4">
          <Truck className="w-3 h-3" /> Order & Delivery Policy
        </span>
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-[#2C1F1F] mb-4">
          How We Deliver Your Instruments
        </h1>
        <p className="text-[#6E6262] text-lg">
          Read about our ordering process, packing guarantees, and track your active package shipping status below.
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 mb-16">
        
        {/* Delivery Process column */}
        <div className="space-y-8">
          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-8 shadow-sm">
            <h3 className="text-2xl font-bold text-[#2C1F1F] mb-6 border-b border-[#EAE6DF] pb-4">Our Ordering Process</h3>
            
            <div className="space-y-6">
              {stepsList.map((item, index) => (
                <div key={index} className="flex gap-4">
                  <div className="w-10 h-10 rounded-full bg-[#C5A028]/10 flex items-center justify-center text-[#C5A028] shrink-0 font-extrabold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <h4 className="font-bold text-[#2C1F1F] mb-1">{item.title}</h4>
                    <p className="text-[#6E6262] text-sm leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-white border border-[#E2DDD5] rounded-2xl p-8 shadow-sm flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-50 text-green-600 flex items-center justify-center shrink-0 border border-green-200">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-bold text-[#2C1F1F] mb-1">Transit Damage Protection</h4>
              <p className="text-sm text-[#6E6262] leading-relaxed">
                Musical instruments are fragile. We guarantee robust packaging. If any instrument reaches you damaged in transit, we will replace or repair it immediately.
              </p>
            </div>
          </div>
        </div>

        {/* Tracking Column */}
        <div className="bg-white border border-[#E2DDD5] rounded-2xl p-8 sm:p-10 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="text-2xl font-bold text-[#2C1F1F] mb-2">Track Your Delivery</h3>
            <p className="text-[#6E6262] text-sm mb-8">
              Enter your Order ID (received after payment validation on WhatsApp) to trace your package location in real-time.
            </p>

            <form onSubmit={handleTrack} className="flex gap-2 mb-8">
              <input 
                type="text" 
                required
                value={orderId}
                onChange={(e) => setOrderId(e.target.value)}
                className="flex-1 bg-[#F5F2EB] border border-[#E2DDD5] rounded-xl px-4 py-3 text-sm text-[#2C1F1F] focus:outline-none focus:border-[#C5A028] transition"
                placeholder="E.g., SSV-4921"
              />
              <button 
                type="submit"
                className="bg-[#C5A028] hover:bg-[#A98920] text-white p-3 rounded-xl transition flex items-center justify-center"
              >
                <Search className="w-5 h-5" />
              </button>
            </form>

            {searched && trackingData && (
              <div className="space-y-6">
                <div className="flex justify-between items-center bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl p-4 text-sm">
                  <div>
                    <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Order ID</span>
                    <span className="font-bold text-[#2C1F1F] font-mono">{trackingData.id}</span>
                  </div>
                  <div className="text-right">
                    <span className="text-[#8C7E7E] block text-xs uppercase font-mono">Courier Partner</span>
                    <span className="font-bold text-[#C5A028]">{trackingData.carrier}</span>
                  </div>
                </div>

                <div className="space-y-6 relative pl-6 before:content-[''] before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[2px] before:bg-[#E2DDD5]">
                  {trackingData.history.map((step, index) => (
                    <div key={index} className="relative">
                      <div className={`absolute -left-[20px] top-1.5 w-[10px] h-[10px] rounded-full border-2 bg-[#FDFCF7] ${step.done ? 'border-[#C5A028] bg-[#C5A028]' : 'border-[#8C7E7E]'}`}></div>
                      <div className="pl-4">
                        <h5 className={`font-semibold text-sm ${step.done ? 'text-[#2C1F1F]' : 'text-[#8C7E7E]'}`}>
                          {step.status}
                        </h5>
                        <p className="text-xs text-[#8C7E7E] mt-0.5">{step.date}</p>
                        <p className="text-xs text-[#6E6262] mt-1 leading-relaxed">{step.desc}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {searched && !trackingData && (
              <div className="text-center py-8 text-[#8C7E7E] bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl">
                No tracking information found. Please contact support on WhatsApp to get your tracking details.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
