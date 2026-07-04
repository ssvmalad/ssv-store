"use client";

import React from 'react';
import { useLanguage } from '@/lib/LanguageContext';

export default function FAQPage() {
  const { t } = useLanguage();

  const faqs = [
    {
      q: "Where is the store located?",
      a: "Saraswati Sangeet Vadhyalaya is located at Nalanda Building, Kurar Village, Malad East, Mumbai. We invite you to visit our workshop."
    },
    {
      q: "Do you repair all types of instruments?",
      a: "We specialize in classical Indian instruments like Tabla, Harmonium, Sitar, as well as western instruments like Guitars and Keyboards. From skin replacement to electronic contact cleaning, we do it all."
    },
    {
      q: "Can I place a custom order?",
      a: "Yes! We build and tune custom instruments to your specific requirements. Please contact us via WhatsApp to discuss materials, tuning scales, and design."
    },
    {
      q: "How does the checkout process work?",
      a: "Since many of our instruments require specific tuning or consultation, we process our orders via WhatsApp. Build your cart on our website, proceed to checkout, and it will send a pre-formatted message to our team to confirm availability and finalize the sale."
    },
    {
      q: "Do you ship internationally?",
      a: "Currently, we focus on serving our local musical community in Mumbai and across India. However, for specialized custom orders, contact us directly and we can discuss shipping arrangements."
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 min-h-[70vh]">
      <h1 className="text-4xl font-extrabold tracking-tighter text-[#2C1F1F] mb-8">Frequently Asked Questions</h1>
      
      <div className="space-y-6">
        {faqs.map((faq, idx) => (
          <div key={idx} className="bg-white border border-[#E2DDD5] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#2C1F1F] mb-2">{faq.q}</h3>
            <p className="text-[#6E6262] text-sm leading-relaxed">{faq.a}</p>
          </div>
        ))}
      </div>
      
      <div className="mt-12 text-center">
        <p className="text-[#6E6262] mb-4">Still have questions?</p>
        <a 
          href="https://wa.me/918591223874"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 bg-[#25D366] text-white font-bold rounded-full hover:bg-[#1EBE5D] transition"
        >
          Message us on WhatsApp
        </a>
      </div>
    </div>
  );
}
