/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Shield, BookOpen, Key, Users, AlertCircle, Sparkles, Compass, Eye, EyeOff } from 'lucide-react';
import { motion } from 'motion/react';
import toast from 'react-hot-toast';

export default function LoginScreen() {
  const { login } = useLSPStore();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanUsername = username.trim();
    const cleanPassword = password.trim();
    if (!cleanUsername || !cleanPassword) {
      toast.error('Gagal: Email/Username dan password wajib diisi.');
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const success = login(cleanUsername, cleanPassword);
      setLoading(false);
      if (success) {
        toast.success('Selamat datang di Portal LSP SMK Tanjung Priok!');
      } else {
        setErrorMsg('Email/Username atau password salah. Coba gunakan panel Demo Cepat di bawah.');
        toast.error('Login gagal: Hak akses tidak ditemukan.');
      }
    }, 600);
  };

  const handleDemoLogin = (user: string, pass: string, roleName: string) => {
    setUsername(user);
    setPassword(pass);
    setLoading(true);
    setTimeout(() => {
      const success = login(user, pass);
      setLoading(false);
      if (success) {
        toast.success(`Demos masuk sebagai: ${roleName}`);
      }
    }, 400);
  };



  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-[#0f172a] text-slate-100 transition-colors duration-300 font-sans">
      <div className="max-w-md w-full space-y-8 bg-[#1e293b]/50 backdrop-blur-md p-8 rounded-2xl shadow-2xl border border-slate-800/80">
        
        {/* Branding & Header */}
        <div className="flex flex-col items-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="h-20 w-20 bg-white p-2.5 rounded-2xl flex items-center justify-center shadow-xl shadow-indigo-500/10 mb-4 border border-slate-800"
          >
            <img 
              src="https://lh3.googleusercontent.com/d/1INrEt4FMNAuKzkDe2lZaQVcYFOc8f9YN" 
              className="h-full w-full object-contain" 
              alt="LSP Logo" 
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "https://docs.google.com/uc?export=view&id=1INrEt4FMNAuKzkDe2lZaQVcYFOc8f9YN";
              }}
            />
          </motion.div>
          <h2 className="text-center text-2xl font-bold tracking-tight text-white mb-1">
            SistemAdmin<span className="text-indigo-400">LSP</span>
          </h2>
          <p className="text-center text-xs font-semibold text-indigo-400 tracking-widest uppercase mb-1">
            SMK Tanjung Priok Jakarta
          </p>
          <p className="text-center text-[11px] text-slate-400">
            Lembaga Sertifikasi Kompetensi Profesi Terlisensi BNSP
          </p>
        </div>

        {/* Login Form */}
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          {errorMsg && (
            <div className="flex items-center gap-2 p-3 bg-red-950/30 text-red-400 text-xs rounded-xl border border-red-900/30">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Email Pengguna (User Email)
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => { setUsername(e.target.value); setErrorMsg(''); }}
                  placeholder="contoh: admin@lsp.smktanjungpriok.sch.id"
                  className="block w-full py-2.5 pl-3 pr-10 text-sm bg-[#0f172a]/80 text-white rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-slate-500"
                />
                <Users className="absolute right-3 top-2.5 h-4 w-4 text-slate-500" />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">
                Kata Sandi (Password)
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); setErrorMsg(''); }}
                  placeholder="Sandi bawaan: 123456 atau admin123"
                  className="block w-full py-2.5 pl-3 pr-12 text-sm bg-[#0f172a]/80 text-white rounded-xl border border-slate-800 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors placeholder-slate-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 p-0.5 text-slate-500 hover:text-slate-300 transition-colors focus:outline-none cursor-pointer"
                  title={showPassword ? "Sembunyikan Kata Sandi" : "Tampilkan Kata Sandi"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-500 bg-gradient-to-r from-indigo-600 to-indigo-550 hover:from-indigo-500 hover:to-indigo-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all shadow-md shadow-indigo-500/20 cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Memproses Masuk...' : 'Masuk Portal LSP'}
          </button>
        </form>

        {/* Demo Accounts Panel */}
        <div className="bg-[#0f172a]/60 p-4 rounded-xl border border-slate-800/80">
          <div className="flex items-center gap-1.5 text-indigo-400 font-semibold text-xs mb-3">
            <Sparkles className="h-4 w-4 text-indigo-500 animate-pulse" />
            <span>Akses Cepat Pengujian Peran (Demo Cepat)</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
            {/* Admin */}
            <button
              type="button"
              onClick={() => handleDemoLogin('admin@lsp.smktanjungpriok.sch.id', 'admin123', 'Administrator')}
              className="flex items-center justify-between p-2 rounded-lg bg-[#1e293b]/50 border border-slate-800 text-slate-300 hover:bg-[#1e293b] cursor-pointer font-medium"
            >
              <span className="flex items-center gap-1.5 font-bold text-white">
                <BookOpen className="h-3.5 w-3.5 text-rose-500" /> Admin
              </span>
              <span className="text-slate-400 font-mono">pw: admin123</span>
            </button>

            {/* Asesor */}
            <button
              type="button"
              onClick={() => handleDemoLogin('ahmad@asesor.lsp.id', '123456', 'Asesor DKV')}
              className="flex items-center justify-between p-2 rounded-lg bg-[#1e293b]/50 border border-slate-800 text-slate-300 hover:bg-[#1e293b] cursor-pointer font-medium"
            >
              <span className="flex items-center gap-1.5 font-bold text-white">
                <Compass className="h-3.5 w-3.5 text-amber-500" /> Asesor (DKV)
              </span>
              <span className="text-slate-400 font-mono">pw: 123456</span>
            </button>

            {/* Student 1 */}
            <button
              type="button"
              onClick={() => handleDemoLogin('siswa1@siswa.sch.id', '123456', 'Andhika (MK)')}
              className="flex items-center justify-between p-2 rounded-lg bg-[#1e293b]/50 border border-slate-800 text-slate-300 hover:bg-[#1e293b] cursor-pointer font-medium col-span-1 sm:col-span-2"
            >
              <span className="flex items-center gap-1.5 font-bold text-white">
                👥 Siswa 1 / Asesi Andhika
              </span>
              <span className="text-slate-400 font-mono">siswa1@siswa.sch.id</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
