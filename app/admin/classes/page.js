"use client";

import React, { useState, useEffect } from 'react';
import { BookOpen, MapPin, Phone, Save, Plus, Trash2, ArrowUp, ArrowDown, Sparkles, AlertCircle } from 'lucide-react';

export default function AdminClassesPage() {
  const [classesData, setClassesData] = useState({
    general: {
      title: "Music Classes",
      description: "Learn classical and western instruments from expert instructors.",
      location_title: "Classes Address",
      location_address: "",
      contact_phones: [],
      contact_whatsapp: "",
      enrolment_note: ""
    },
    courses: []
  });
  const [newPhone, setNewPhone] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
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

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const response = await fetch('/api/classes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(classesData)
      });
      if (response.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddCourse = () => {
    const newCourse = {
      id: `course_${Date.now()}`,
      name: "New Class Title",
      instructor: "Dinesh Pokle",
      duration: "2 classes per week",
      fee: "1500",
      fee_note: "Payable monthly",
      description: "Introduce the course material here.",
      schedule: ["Mon & Thurs: 6:00 PM - 7:00 PM"]
    };
    setClassesData(prev => ({
      ...prev,
      courses: [...prev.courses, newCourse]
    }));
  };

  const handleDeleteCourse = (courseId) => {
    setClassesData(prev => ({
      ...prev,
      courses: prev.courses.filter(c => c.id !== courseId)
    }));
  };

  const handleCourseChange = (idx, field, val) => {
    const newCourses = [...classesData.courses];
    newCourses[idx] = { ...newCourses[idx], [field]: val };
    setClassesData(prev => ({ ...prev, courses: newCourses }));
  };

  const handleAddSchedule = (courseIdx) => {
    const newCourses = [...classesData.courses];
    newCourses[courseIdx].schedule = [...(newCourses[courseIdx].schedule || []), "New Timing Slot Details"];
    setClassesData(prev => ({ ...prev, courses: newCourses }));
  };

  const handleRemoveSchedule = (courseIdx, schIdx) => {
    const newCourses = [...classesData.courses];
    newCourses[courseIdx].schedule = newCourses[courseIdx].schedule.filter((_, i) => i !== schIdx);
    setClassesData(prev => ({ ...prev, courses: newCourses }));
  };

  const handleScheduleChange = (courseIdx, schIdx, val) => {
    const newCourses = [...classesData.courses];
    newCourses[courseIdx].schedule[schIdx] = val;
    setClassesData(prev => ({ ...prev, courses: newCourses }));
  };

  const handleAddPhone = () => {
    if (!newPhone.trim()) return;
    setClassesData(prev => ({
      ...prev,
      general: {
        ...prev.general,
        contact_phones: [...(prev.general.contact_phones || []), newPhone.trim()]
      }
    }));
    setNewPhone('');
  };

  const handleRemovePhone = (phoneIdx) => {
    setClassesData(prev => ({
      ...prev,
      general: {
        ...prev.general,
        contact_phones: prev.general.contact_phones.filter((_, i) => i !== phoneIdx)
      }
    }));
  };

  if (loading) {
    return (
      <div className="p-8 flex justify-center items-center h-[70vh]">
        <div className="w-10 h-10 border-4 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto h-[calc(100vh-4rem)] flex flex-col">
      {/* Admin Title Block */}
      <div className="flex items-center justify-between mb-8 shrink-0">
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight mb-1">Music Classes Management</h1>
          <p className="text-sm text-[#A09393]">Edit batch schedules, class fees, location classroom address, and enrolment settings.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={isSaving}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-[0_0_15px_rgba(212,175,55,0.15)] ${
            saved ? 'bg-emerald-500 text-black shadow-emerald-500/20' : 'bg-[#D4AF37] hover:bg-[#BFA030] text-black'
          }`}
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
          ) : saved ? (
            "Saved Successfully!"
          ) : (
            <><Save className="w-4 h-4" /> Save Changes</>
          )}
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 space-y-8 scrollbar-thin">
        {/* General Info Card */}
        <div className="bg-[#160F0F] border border-[#2C1E1E] rounded-3xl p-6 md:p-8 space-y-6">
          <div className="flex items-center gap-2.5 text-[#D4AF37] border-b border-[#2C1E1E] pb-4">
            <Sparkles className="w-5 h-5" />
            <h3 className="text-base font-bold uppercase tracking-wider">General Classes Settings</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">Page Header Title</label>
                <input
                  type="text"
                  value={classesData.general.title || ''}
                  onChange={(e) => setClassesData({
                    ...classesData,
                    general: { ...classesData.general, title: e.target.value }
                  })}
                  className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">General Intro Description</label>
                <textarea
                  rows={3}
                  value={classesData.general.description || ''}
                  onChange={(e) => setClassesData({
                    ...classesData,
                    general: { ...classesData.general, description: e.target.value }
                  })}
                  className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">Classroom Location Address</label>
                <input
                  type="text"
                  value={classesData.general.location_address || ''}
                  onChange={(e) => setClassesData({
                    ...classesData,
                    general: { ...classesData.general, location_address: e.target.value }
                  })}
                  className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">Primary WhatsApp Number (no spaces/symbols)</label>
                <input
                  type="text"
                  value={classesData.general.contact_whatsapp || ''}
                  onChange={(e) => setClassesData({
                    ...classesData,
                    general: { ...classesData.general, contact_whatsapp: e.target.value }
                  })}
                  placeholder="e.g., 918591223874"
                  className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">Enrolment Callout Info Details</label>
                <textarea
                  rows={2}
                  value={classesData.general.enrolment_note || ''}
                  onChange={(e) => setClassesData({
                    ...classesData,
                    general: { ...classesData.general, enrolment_note: e.target.value }
                  })}
                  className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37]"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-[#A09393] uppercase tracking-wider mb-2">Display Contact Phone List</label>
                <div className="flex gap-2 mb-3">
                  <input
                    type="text"
                    value={newPhone}
                    onChange={(e) => setNewPhone(e.target.value)}
                    placeholder="e.g., +91 85912 23874"
                    className="flex-1 bg-[#0F0A0A] border border-[#2C1E1E] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                  />
                  <button
                    onClick={handleAddPhone}
                    className="bg-[#2C1E1E] hover:bg-[#3D2B2B] text-white text-xs px-4 rounded-xl transition"
                  >
                    Add Phone
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {classesData.general.contact_phones && classesData.general.contact_phones.map((phone, idx) => (
                    <span key={idx} className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#2C1E1E] border border-white/5 text-xs text-white">
                      {phone}
                      <button onClick={() => handleRemovePhone(idx)} className="text-zinc-500 hover:text-rose-500 font-bold shrink-0">×</button>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Editor Block */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-white tracking-tight">Active Instruments Classes ({classesData.courses.length})</h3>
            <button
              onClick={handleAddCourse}
              className="flex items-center gap-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 border border-[#D4AF37]/20 text-[#D4AF37] px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              <Plus className="w-3.5 h-3.5" /> Add Music Class
            </button>
          </div>

          <div className="space-y-6">
            {classesData.courses.map((course, idx) => (
              <div 
                key={course.id}
                className="bg-[#160F0F] border border-[#2C1E1E] rounded-3xl p-6 md:p-8 space-y-6 relative group"
              >
                {/* Delete button */}
                <button
                  onClick={() => handleDeleteCourse(course.id)}
                  className="absolute top-6 right-6 p-2 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-500 border border-rose-500/20 transition-all opacity-0 group-hover:opacity-100"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Class Name</label>
                        <input
                          type="text"
                          value={course.name || ''}
                          onChange={(e) => handleCourseChange(idx, 'name', e.target.value)}
                          className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Instructor</label>
                        <input
                          type="text"
                          value={course.instructor || ''}
                          onChange={(e) => handleCourseChange(idx, 'instructor', e.target.value)}
                          className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Short Description</label>
                      <textarea
                        rows={2}
                        value={course.description || ''}
                        onChange={(e) => handleCourseChange(idx, 'description', e.target.value)}
                        className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Course Frequency</label>
                        <input
                          type="text"
                          value={course.duration || ''}
                          onChange={(e) => handleCourseChange(idx, 'duration', e.target.value)}
                          className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Monthly Tuition Fee (₹)</label>
                        <input
                          type="text"
                          value={course.fee || ''}
                          onChange={(e) => handleCourseChange(idx, 'fee', e.target.value)}
                          className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-[#A09393] uppercase tracking-wider mb-1">Fee Label / Note</label>
                        <input
                          type="text"
                          value={course.fee_note || ''}
                          onChange={(e) => handleCourseChange(idx, 'fee_note', e.target.value)}
                          className="w-full bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center border-b border-[#2C1E1E] pb-2">
                      <span className="text-[10px] font-bold text-[#A09393] uppercase tracking-wider">Weekly Batch Timings</span>
                      <button
                        onClick={() => handleAddSchedule(idx)}
                        className="text-[#D4AF37] hover:text-[#BFA030] text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                      >
                        <Plus className="w-3 h-3" /> Add Slot
                      </button>
                    </div>

                    <div className="space-y-2">
                      {course.schedule && course.schedule.map((sch, schIdx) => (
                        <div key={schIdx} className="flex gap-2 items-center">
                          <input
                            type="text"
                            value={sch || ''}
                            onChange={(e) => handleScheduleChange(idx, schIdx, e.target.value)}
                            className="flex-1 bg-[#0F0A0A] border border-[#2C1E1E] rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                          />
                          <button
                            onClick={() => handleRemoveSchedule(idx, schIdx)}
                            className="text-zinc-500 hover:text-rose-500 font-bold text-sm px-1.5"
                          >
                            ×
                          </button>
                        </div>
                      ))}
                      {(!course.schedule || course.schedule.length === 0) && (
                        <div className="text-center py-4 text-xs text-[#5A4B4B] italic">No batch slots added.</div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
