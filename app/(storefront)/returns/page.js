"use client";

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';
import { ShieldAlert, ArrowLeftRight, HelpCircle } from 'lucide-react';

export default function ReturnsPage() {
  const { t } = useLanguage();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      <h1 className="text-4xl font-extrabold tracking-tighter text-white mb-8">Returns & Exchanges</h1>
      
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-8 md:p-12 shadow-sm space-y-8 text-[#6E6262] text-sm leading-relaxed">
        
        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#C5A028]">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#2C1F1F]">No Returns & No Refunds</h2>
          </div>
          <p>
            At Saraswati Sangeet Vadhyalaya, we specialize in selling handmade, custom-checked musical instruments. Because of the traditional craftsmanship involved, we follow a strict **No Returns** and **No Refunds** policy. We encourage all customers to double-check their specs, scale choices, and selections before placing an order.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#C5A028]">
            <ArrowLeftRight className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#2C1F1F]">Exchange Policy</h2>
          </div>
          <p>
            Exchanges are only available under certain highly specific circumstances. If you believe your order qualifies or you want to request an exchange, you **must contact us directly** to discuss the case. The final decision rests entirely with the store management.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#C5A028]">
            <ShieldAlert className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#2C1F1F]">No Standard Warranty & Damaged Goods</h2>
          </div>
          <p>
            We do not provide standard commercial warranties on handmade percussion instruments. However, if your instrument arrives with transport damage or a severe structural defect, please **inform us immediately** (within 24 hours of delivery). We will inspect the case; repair charges may apply depending on the circumstances.
          </p>
        </section>

        <section className="space-y-3">
          <div className="flex items-center gap-2 text-[#C5A028]">
            <HelpCircle className="w-5 h-5" />
            <h2 className="text-xl font-bold text-[#2C1F1F]">How to Contact Us</h2>
          </div>
          <p className="mb-4">
            If you need to discuss an exchange or report delivery damage, reach out to our team immediately:
          </p>
          <div className="p-5 bg-[#FAF9F5] border border-[#E2DDD5] rounded-2xl space-y-2 font-medium text-[#2C1F1F]">
            <p>💬 **WhatsApp Support:** Yash (+91 85912 23874)</p>
            <p>📞 **General Calling Support:**</p>
            <ul className="list-disc pl-5 space-y-1 text-sm text-[#6E6262]">
              <li>**Dinesh (Owner):** +91 98213 60536</li>
              <li>**Manisha:** +91 98339 91547</li>
              <li>**Yash:** +91 85912 23874</li>
            </ul>
          </div>
        </section>

      </div>
    </div>
  );
}
