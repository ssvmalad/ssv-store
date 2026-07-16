"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, Calendar, Clock, MapPin, Phone, MessageCircle, Sparkles, Award } from 'lucide-react';

export default function ClassesPage() {
  const [classesData, setClassesData] = useState({
    general: {
      title: "Music Classes",
      description: "Learn classical and western instruments from expert instructors. We offer structured courses, flexible timings, and certified training in a professional environment.",
      location_title: "Classes Address",
      location_address: "104, Pawansut Building, Tanaji Nagar Road, Malad East, Mumbai - 97",
      contact_phones: ["+91 85912 23874", "+91 98213 60536"],
      contact_whatsapp: "918591223874",
      enrolment_note: "To enrol in a class or schedule a free trial session, please contact us directly on WhatsApp or call our instructors."
    },
    courses: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/classes')
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setClassesData(data);
        }
      })
      .catch(err => console.error("Failed to load classes:", err))
      .finally(() => setLoading(false));
  }, []);

  const handleWhatsAppEnrol = (courseName) => {
    const text = `Hi, I am interested in enrolling for the *${courseName}* at Saraswati Sangeet Vadhyalaya. Please share admission details.`;
    window.open(`https://wa.me/${classesData.general.contact_whatsapp}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="relative min-h-screen">
      {/* Background Cover */}
      <div 
        className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat" 
        style={{ backgroundImage: "url('/hero-bg.jpg')" }}
      />
      <div className="fixed inset-0 z-0 bg-black/40" />

      {/* Main Content Container */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header Block */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#D4AF37]/20 text-xs font-bold uppercase tracking-wider text-[#D4AF37] mb-4 border border-[#D4AF37]/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" /> Academy of Music
          </span>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter text-white mb-6">
            {classesData.general.title}
          </h1>
          <p className="text-white/80 text-lg leading-relaxed">
            {classesData.general.description}
          </p>
        </div>

        {/* Classes Grid */}
        {loading ? (
          <div className="flex justify-center py-20">
            <div className="w-10 h-10 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {classesData.courses.map((course) => (
              <div 
                key={course.id}
                className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-6 md:p-8 flex flex-col justify-between hover:border-[#D4AF37]/40 transition duration-300 group shadow-xl"
              >
                <div>
                  <div className="flex justify-between items-start mb-6">
                    <span className="w-12 h-12 rounded-2xl bg-[#D4AF37]/20 border border-[#D4AF37]/20 flex items-center justify-center text-[#D4AF37] shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </span>
                    <div className="text-right">
                      <span className="text-[10px] text-[#D4AF37] font-bold uppercase tracking-widest block mb-1">Monthly Fee</span>
                      <span className="text-2xl font-black text-white">₹{course.fee}</span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-[#D4AF37] transition-colors">
                    {course.name}
                  </h3>
                  
                  {course.instructor && (
                    <p className="text-xs text-[#A09393] mb-4">
                      Instructor: <span className="text-white font-medium">{course.instructor}</span>
                    </p>
                  )}

                  <p className="text-white/70 text-sm leading-relaxed mb-6">
                    {course.description}
                  </p>

                  <div className="space-y-3.5 border-t border-white/10 pt-4 mb-6">
                    <div className="flex items-start gap-2.5 text-xs text-[#A09393]">
                      <Calendar className="w-4 h-4 text-[#D4AF37] shrink-0" />
                      <div>
                        <span className="text-white font-semibold block mb-1">Timings & Batches:</span>
                        {course.schedule && course.schedule.map((sch, i) => (
                          <span key={i} className="block text-white/80 leading-relaxed mb-1 last:mb-0">• {sch}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

                <button
                  onClick={() => handleWhatsAppEnrol(course.name)}
                  className="w-full bg-[#D4AF37] hover:bg-[#BFA030] text-black font-extrabold text-xs uppercase tracking-wider py-3.5 px-4 rounded-xl transition flex items-center justify-center gap-2"
                >
                  <MessageCircle className="w-4 h-4 fill-black" /> Enrol Now via WhatsApp
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Classes Address & Contacts Panel */}
        <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 md:p-12 shadow-xl grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] mb-4">
              <Award className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Classes Location Info</span>
            </div>
            <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight mb-4">
              Where to Find Us
            </h2>
            <p className="text-white/75 text-sm leading-relaxed mb-6">
              {classesData.general.enrolment_note}
            </p>

            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <MapPin className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs text-[#A09393] uppercase font-bold tracking-wider block mb-1">Classroom Address</span>
                  <span className="text-white text-sm leading-relaxed">{classesData.general.location_address}</span>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center text-[#D4AF37] shrink-0">
                  <Phone className="w-5 h-5" />
                </span>
                <div>
                  <span className="text-xs text-[#A09393] uppercase font-bold tracking-wider block mb-1">Enrolment Contacts</span>
                  <div className="space-y-1">
                    {classesData.general.contact_phones.map((phone, idx) => (
                      <span key={idx} className="text-white text-sm font-semibold block">{phone}</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-[#0F0A0A]/50 border border-white/10 rounded-2xl p-6 md:p-8 space-y-6">
            <h4 className="text-lg font-bold text-white tracking-tight border-b border-white/10 pb-3">Admission Rules</h4>
            <ul className="space-y-3.5 text-xs text-white/70 leading-relaxed list-disc pl-4">
              <li>Classes run twice a week per batch.</li>
              <li>Admission fees are payable in advance at the start of the monthly cycle.</li>
              <li>Classes missed due to personal reasons can be compensated in other batches with prior coordinator approval.</li>
              <li>Free 1-on-1 trial session available for all beginners!</li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}
