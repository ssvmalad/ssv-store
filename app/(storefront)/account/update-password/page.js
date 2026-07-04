"use client";

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Lock, ArrowRight, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // When Supabase redirects here from an email, the session is usually set via hash fragment automatically
  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      
      setSuccessMsg("Password updated successfully! Redirecting...");
      setTimeout(() => {
        router.push('/account');
      }, 2000);
    } catch (err) {
      setErrorMsg(err.message || 'An error occurred.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto px-4 sm:px-6 py-16 min-h-[70vh] flex flex-col justify-center">
      <div className="bg-white border border-[#E2DDD5] rounded-3xl p-8 shadow-md relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-[#2C1F1F] via-[#C5A028] to-[#2C1F1F]"></div>
        
        <div className="text-center mb-8 pt-2">
          <h1 className="text-3xl font-extrabold text-[#2C1F1F] mb-2 tracking-tight">
            Update Password
          </h1>
          <p className="text-[#6E6262] text-sm">
            Enter your new password below.
          </p>
        </div>

        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {errorMsg}
          </div>
        )}
        {successMsg && (
          <div className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-3 rounded-xl mb-6 text-sm font-medium animate-in fade-in slide-in-from-top-2">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleUpdatePassword} className="space-y-5">
          <div className="space-y-1">
            <label className="text-xs font-bold uppercase tracking-wider text-[#8C7E7E] pl-1">New Password</label>
            <div className="relative">
              <Lock className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-[#A09393]" />
              <input 
                type={showPassword ? "text" : "password"}
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-12 py-3 bg-[#FAF9F5] border border-[#E2DDD5] rounded-xl text-sm text-[#2C1F1F] placeholder-[#A09393] focus:bg-white focus:border-[#C5A028] outline-none transition-all"
                placeholder="Enter new password (min 6 chars)"
              />
              <button 
                type="button" 
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A09393] hover:text-[#2C1F1F] transition p-1"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading || !password}
            className="w-full py-3.5 bg-[#C5A028] hover:bg-[#A98920] text-white rounded-xl font-bold text-base transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-[#C5A028]/20 flex items-center justify-center gap-2 mt-2"
          >
            {loading ? 'Updating...' : 'Update Password'}
            {!loading && <ArrowRight className="w-4 h-4" />}
          </button>
        </form>
      </div>
    </div>
  );
}
