"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Lock, ArrowRight } from 'lucide-react';

export default function AdminLogin() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    
    try {
      const res = await fetch('/api/admin/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password })
      });
      
      if (res.ok) {
        router.push('/admin');
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || 'Incorrect password');
        setPassword('');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center relative w-full h-screen">
      {/* Background Glow */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#D4AF37]/5 rounded-full blur-[120px]"></div>
      </div>

      <div className="w-full max-w-sm px-6 relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-[#160F0F] border border-[#2C1E1E] mb-6 shadow-[0_0_30px_rgba(212,175,55,0.1)]">
            <Lock className="w-6 h-6 text-[#D4AF37]" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-white mb-2">Admin Portal</h1>
          <p className="text-sm text-[#A09393]">Enter your master password to access the dashboard.</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div className="space-y-2">
            <input
              type="password"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-5 py-3.5 bg-[#160F0F] border border-[#2C1E1E] rounded-xl text-center text-white tracking-widest focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] outline-none transition"
              autoFocus
            />
          </div>

          {error && (
            <p className="text-rose-400 text-xs text-center font-medium animate-pulse">{error}</p>
          )}

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 px-6 py-3.5 bg-[#D4AF37] hover:bg-[#BFA030] text-black font-bold text-sm rounded-xl transition shadow-[0_0_20px_rgba(212,175,55,0.2)]"
          >
            Access Dashboard <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
