/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Award, BookOpen, Clock, Calendar, CheckCircle2, CircleAlert, Printer, User, Award as BadgeIcon, ExternalLink, Lock, Bell, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AsesiDashboard() {
  const { state, registerAssessment, markNotificationAsRead, markAllNotificationsAsRead } = useLSPStore();
  const student = state.currentUser;

  const [apl01Link, setApl01Link] = React.useState('');
  const [apl02Link, setApl02Link] = React.useState('');
  const [isNotifOpen, setIsNotifOpen] = React.useState(true);

  if (!student || student.role !== 'asesi') return null;

  const notifications = state.notifications ? state.notifications.filter(n => n.userId === student.id) : [];
  const unreadCount = notifications.filter(n => !n.read).length;

  // Filter schemes matching student's jurusan
  const matchingSchemes = state.schemes.filter(s => s.jurusan === student.jurusan);

  // Filter assessments already submitted by this student
  const studentAssessments = state.assessments.filter(a => a.asesiId === student.id);

  // Determine active APL-01 and APL-02 form links based on BNSP scheme requirements
  const isDkv = student.jurusan === 'DKV';
  const isMo = student.jurusan === 'MO';

  let apl01Url = '';
  let apl02Url = '';
  let apl01Status: 'active' | 'inactive' | 'not-needed' = 'inactive';
  let apl02Status: 'active' | 'inactive' | 'not-needed' = 'inactive';

  if (isDkv) {
    // Junior Desain Grafis / DKV Schemes
    apl01Url = 'https://forms.gle/XvfBgpZ35o39Y9A76';
    apl02Url = 'https://forms.gle/j2YXxydBu6XYTukm9';
    apl01Status = 'active';
    apl02Status = 'active';
  } else if (isMo) {
    // Pemeliharaan Mesin Kendaraan Ringan / MO Schemes
    apl01Url = 'https://forms.gle/oKfX2KgNSiABVQpU6';
    apl01Status = 'active';
    apl02Status = 'not-needed';
  }

  // Helper to check if a scheme is currently active / opened
  const isSchemeActive = (schId: string) => {
    if (student.jurusan === 'DKV') {
      return schId === 'sch-dkv-1'; // Junior Operator Desain Grafis
    }
    if (student.jurusan === 'MO') {
      return schId === 'sch-mo-1'; // Pemeliharaan Mesin Kendaraan Ringan
    }
    return false; // Other schemes are disabled
  };

  const isDkvAndMissingLinks = isDkv && (!apl01Link.trim() || !apl02Link.trim());
  const isMoAndMissingLinks = isMo && !apl01Link.trim();
  const isMissingLinks = isDkvAndMissingLinks || isMoAndMissingLinks;

  const handleRegister = (schemeId: string, schemeName: string) => {
    if (!isSchemeActive(schemeId)) {
      toast.error('Skema ini sedang tidak aktif atau belum dibuka oleh Admin.');
      return;
    }

    if (isDkv && (!apl01Link.trim() || !apl02Link.trim())) {
      toast.error('Gagal mendaftar! Harap isi kedua link Google Drive Berkas APL-01 dan APL-02 terlebih dahulu.');
      return;
    }
    if (isMo && !apl01Link.trim()) {
      toast.error('Gagal mendaftar! Harap isi link Google Drive Berkas APL-01 terlebih dahulu.');
      return;
    }

    registerAssessment(schemeId, apl01Link.trim(), isDkv ? apl02Link.trim() : undefined);
    toast.success(`Berhasil mendaftar uji kompetensi: ${schemeName}. Menunggu approval admin.`);
  };

  const handlePrintCertificate = (skemaName: string) => {
    toast.loading('Menyiapkan format cetakan sertifikat digital...');
    setTimeout(() => {
      toast.dismiss();
      window.print();
      toast.success('Format cetak sertifikat kompetensi berhasil dibuka!');
    }, 1000);
  };

  return (
    <div className="space-y-6">
      {/* Welcome & Student Stats */}
      <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/95 border border-indigo-500/20 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 h-40 w-40 bg-indigo-500/5 rounded-full -translate-y-8 translate-x-8 blur-2xl animate-pulse" />
        
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 bg-indigo-500/10 backdrop-blur rounded-2xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
              <User className="h-8 w-8 stroke-[1.5]" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-indigo-300">Portal Asesi Sekolah</span>
              <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white leading-tight">
                {student.name}
              </h2>
              <p className="text-xs text-slate-400 flex flex-wrap gap-x-2 mt-1">
                <span>NISN: {student.nisn}</span>
                <span>•</span>
                <span>Kelas: {student.kelas}</span>
                <span>•</span>
                <span>Tahun Ajaran: 2026/2027</span>
              </p>
            </div>
          </div>

          <div className="bg-indigo-500/10 backdrop-blur border border-indigo-500/20 p-3 rounded-2xl text-center shrink-0 min-w-[120px]">
            <span className="block text-[10px] uppercase font-medium tracking-wider text-indigo-300">Status Kelulusan</span>
            <div className="text-lg font-bold mt-0.5">
              {studentAssessments.some(a => a.hasil === 'K') ? (
                <span className="text-emerald-400">★ KOMPETEN</span>
              ) : (
                <span className="text-indigo-400">Belum Ujian</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* NOTIFICATION SYSTEM SECTION */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md rounded-3xl border border-slate-800/80 shadow-2xl overflow-hidden font-sans">
        <div 
          onClick={() => setIsNotifOpen(!isNotifOpen)} 
          className="p-5 flex items-center justify-between gap-4 cursor-pointer select-none hover:bg-slate-850/20 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="h-10 w-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 border border-indigo-500/20">
                <Bell className="h-5 w-5" />
              </div>
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-4 w-4">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-4 w-4 bg-rose-500 text-[9px] text-white font-bold items-center justify-center">
                    {unreadCount}
                  </span>
                </span>
              )}
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                Pemberitahuan Sistem LSP Digital
                <span className="px-2 py-0.5 text-[9px] tracking-wider uppercase bg-indigo-505 bg-indigo-500/10 text-indigo-400 border border-indigo-500/15 font-bold rounded-md font-mono">
                  BNSP Digital AI Check
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                {unreadCount > 0 
                  ? `Ada ${unreadCount} pemberitahuan baru yang membutuhkan perhatian Anda.` 
                  : 'Seluruh berkas pendaftaran & status hasil sertifikasi Anda sudah tervalidasi.'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5" onClick={(e) => e.stopPropagation()}>
            {unreadCount > 0 && (
              <button
                onClick={() => {
                  markAllNotificationsAsRead(student.id);
                  toast.success('Semua pemberitahuan ditandai telah dibaca.');
                }}
                className="px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-semibold flex items-center gap-1 cursor-pointer transition-all border border-slate-700/60"
              >
                <Check className="h-3 w-3" /> Tandai Semua Dibaca
              </button>
            )}
            <button 
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-800/40 hover:bg-slate-800 rounded-lg transition-all cursor-pointer"
            >
              {isNotifOpen ? 'Sembunyikan' : 'Tampilkan'}
            </button>
          </div>
        </div>

        {isNotifOpen && (
          <div className="border-t border-slate-800/80 p-5 pt-3 divide-y divide-slate-800/40 max-h-[340px] overflow-y-auto animate-fade-in">
            {notifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs italic">
                Belum ada pemberitahuan dari Admin LSP atau Asesor Penguji.
              </div>
            ) : (
              notifications.map((notif) => {
                let iconBg = 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
                let typeLabel = 'Admin LSP';
                if (notif.type === 'assigned') {
                  iconBg = 'bg-purple-500/10 text-purple-400 border-purple-500/20';
                  typeLabel = 'JADWAL ASESOR';
                } else if (notif.type === 'feedback') {
                  iconBg = 'bg-rose-500/10 text-rose-455 text-rose-400 border-rose-500/20';
                  typeLabel = 'EVALUASI & REVISI';
                } else if (notif.type === 'status_change') {
                  iconBg = 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
                  typeLabel = 'STATUS VERIFIKASI';
                }

                return (
                  <div 
                    key={notif.id} 
                    className={`py-3.5 flex items-start justify-between gap-4 transition-all ${
                      !notif.read ? 'bg-indigo-500/5 -mx-5 px-5 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 border ${iconBg}`}>
                        <Bell className="h-4 w-4 shrink-0" />
                      </div>
                      <div className="space-y-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-[10px] font-bold tracking-wider uppercase text-slate-400">
                            {typeLabel}
                          </span>
                          <span className="text-[10px] text-slate-500">
                            {new Date(notif.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} - {new Date(notif.createdAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                          </span>
                          {!notif.read && (
                            <span className="h-1.5 w-1.5 bg-rose-500 rounded-full"></span>
                          )}
                        </div>
                        <p className="text-xs text-slate-200 leading-relaxed font-sans">{notif.message}</p>
                        <p className="text-[10px] text-indigo-400 font-medium font-sans">Skema: {notif.assessmentName}</p>
                      </div>
                    </div>

                    {!notif.read && (
                      <button
                        onClick={() => {
                          markNotificationAsRead(notif.id);
                          toast.success('Pemberitahuan ditandai sebagai dibaca.');
                        }}
                        className="p-1 px-2.5 hover:bg-indigo-500/10 hover:text-indigo-300 text-slate-400 rounded-lg transition-all text-[10px] font-bold flex items-center gap-1 border border-transparent hover:border-indigo-500/10 cursor-pointer shrink-0"
                        title="Tandai telah dibaca"
                      >
                        <Check className="h-3 w-3 shrink-0" /> Dibaca
                      </button>
                    )}
                  </div>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* SECTION: AKTIVASI FORMULIR DOKUMEN APL-01 & APL-02 */}
      <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-3xl border border-slate-800/80 shadow-2xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-indigo-400" />
              Kelengkapan Dokumen Pra-Asesmen Resmi (APL-01 & APL-02)
            </h3>
            <p className="text-xs text-slate-400">
              Berikut adalah tautan pengisian formulir kelayakan pendaftaran (APL-01) dan ceklis mandiri (APL-02) yang telah diverifikasi dan diaktifkan oleh LSP Admin untuk kelas Anda.
            </p>
          </div>
          <span className="px-2.5 py-0.5 text-[10px] uppercase font-mono font-bold rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 max-w-fit">
            Terhubung & Sinkron
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* CARD APL-01 */}
          <div className="p-5 bg-[#0f172a]/60 rounded-2xl border border-slate-850 border-slate-800/80 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-black tracking-wider text-slate-400 uppercase font-mono">FORMULIR APL-01</span>
                {apl01Status === 'active' ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aktif & Terbuka
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Belum Diaktifkan
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Permohonan Sertifikasi Kompetensi</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Pernyataan pendaftaran resmi asesi beserta kelayakan berkas-berkas prasyarat dasar (KTP/Rapor/Fotokopi Kehadiran) untuk verifikasi BNSP.
                </p>
              </div>
            </div>

            <div>
              {apl01Status === 'active' ? (
                <a
                  href={apl01Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Isi Formulir APL-01 Online <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : (
                <div className="w-full py-2.5 px-4 bg-slate-800/40 text-slate-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-805">
                  <Lock className="h-3.5 w-3.5" /> Link Belum Tersedia oleh LSP Admin
                </div>
              )}
            </div>
          </div>

          {/* CARD APL-02 */}
          <div className="p-5 bg-[#0f172a]/60 rounded-2xl border border-slate-850 border-slate-800/80 flex flex-col justify-between gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center gap-2">
                <span className="text-xs font-black tracking-wider text-slate-400 uppercase font-mono">FORMULIR APL-02</span>
                {apl02Status === 'active' ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center gap-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                    Aktif & Terbuka
                  </span>
                ) : apl02Status === 'not-needed' ? (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center gap-1 font-sans">
                    Fisik Otomatis
                  </span>
                ) : (
                  <span className="px-2 py-0.5 text-[9px] font-bold rounded-full bg-slate-800 text-slate-400 border border-slate-700 flex items-center gap-1">
                    <Lock className="h-2.5 w-2.5" />
                    Belum Diaktifkan
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-sm font-bold text-white">Asesmen Mandiri / Portofolio Keahlian</h4>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  Formulir bukti unggah portofolio proyek dan penilaian diri mandiri terhadap daftar unit kompetensi keahlian BNSP sebelum diuji tatap muka.
                </p>
              </div>
            </div>

            <div>
              {apl02Status === 'active' ? (
                <a
                  href={apl02Url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer"
                >
                  Isi Formulir APL-02 Mandiri <ExternalLink className="h-3.5 w-3.5" />
                </a>
              ) : apl02Status === 'not-needed' ? (
                <div className="w-full py-2.5 px-3.5 bg-indigo-950/20 border border-indigo-500/10 text-indigo-300 rounded-xl text-[11px] leading-relaxed select-none text-center">
                  💡 Skema Pemeliharaan Mesin tidak menggunakan lembar APL-02 digital (Ceklis dilangsungkan manual di tempat bersama penguji asesor Anda).
                </div>
              ) : (
                <div className="w-full py-2.5 px-4 bg-slate-800/40 text-slate-500 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 border border-slate-805">
                  <Lock className="h-3.5 w-3.5" /> Link Belum Tersedia oleh LSP Admin
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Register New Schemes */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-white">Pendaftaran Skema Sertifikat ({student.jurusan})</h3>
              <p className="text-xs text-slate-400">Pilih skema kompetensi BNSP yang tersedia sesuai dengan program keahlian Anda</p>
            </div>

            {/* INPUT LINK FORM UNTUK MULTI-STEP VERIFIKASI SEBELUM DAFTAR */}
            {matchingSchemes.some(sch => !studentAssessments.some(a => a.skemaId === sch.id) && isSchemeActive(sch.id)) && (
              <div className="p-5 bg-indigo-500/10 rounded-2xl border border-indigo-500/25 space-y-4 mb-2 animate-fade-in font-sans">
                <div className="flex items-center gap-2 text-indigo-400">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-xs font-bold uppercase tracking-wider">Langkah Mandiri: Masukkan Link Google Drive Berkas APL-01 & APL-02</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Sebelum mendaftar, silakan lakukan pengisian berkas kelayakan pendaftaran dan ceklis mandiri, unggah berkas Anda ke Google Drive, lalu tempelkan (paste) link sharing folder / file Google Drive Anda di bawah ini agar dapat divalidasi oleh Admin LSP:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
                  <div className="space-y-1.5">
                    <label className="block text-[11px] font-bold text-slate-400 font-mono uppercase">
                      Link Google Drive Berkas APL-01 <span className="text-rose-500">*</span>
                    </label>
                    <input
                      type="url"
                      placeholder="Contoh: https://drive.google.com/drive/folders/... atau link file"
                      value={apl01Link}
                      onChange={(e) => setApl01Link(e.target.value)}
                      className="w-full text-xs px-3.5 py-2.5 bg-[#0f172a]/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                    />
                  </div>
                  {isDkv ? (
                    <div className="space-y-1.5">
                      <label className="block text-[11px] font-bold text-slate-445 text-slate-400 font-mono uppercase">
                        Link Google Drive Berkas APL-02 <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="url"
                        placeholder="Contoh: https://drive.google.com/drive/folders/... atau link file"
                        value={apl02Link}
                        onChange={(e) => setApl02Link(e.target.value)}
                        className="w-full text-xs px-3.5 py-2.5 bg-[#0f172a]/90 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 focus:outline-none transition-all"
                      />
                    </div>
                  ) : (
                    <div className="space-y-1.5 flex flex-col justify-end">
                      <label className="block text-[11px] font-bold text-slate-500 font-mono uppercase">
                        Link Google Drive Berkas APL-02 <span className="text-slate-500">(Tidak Diperlukan)</span>
                      </label>
                      <div className="text-[11px] text-indigo-300 leading-normal bg-indigo-950/20 border border-indigo-900/40 p-2.5 h-[38px] flex items-center rounded-xl font-sans">
                        Skema MO tidak memerlukan APL-02 online.
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="divide-y divide-slate-800/70">
              {matchingSchemes.map(sch => {
                // Check if already registered
                const registered = studentAssessments.find(a => a.skemaId === sch.id);
                const active = isSchemeActive(sch.id);

                return (
                  <div key={sch.id} className={`py-5 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all ${!active && !registered ? 'opacity-50' : ''}`}>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {sch.code}
                        </span>
                        <span className="text-[10px] text-slate-550">
                          {sch.unitsCount} Unit Kompetensi
                        </span>
                        {active ? (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center gap-1 font-mono animate-fade-in">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                            Skema Aktif
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 text-[9px] uppercase font-bold text-slate-400 bg-slate-800/50 border border-slate-700/50 rounded-full flex items-center gap-1 font-mono">
                            <Lock className="h-2 w-2" />
                            Belum Dibuka (Non-Aktif)
                          </span>
                        )}
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug flex items-center gap-1.5">
                        {sch.name}
                        {!active && <Lock className="h-3.5 w-3.5 text-slate-500 shrink-0" />}
                      </h4>
                      <p className="text-xs text-slate-400 leading-relaxed">
                        {sch.description}
                      </p>
                    </div>

                    <div className="shrink-0 sm:text-right">
                      {registered ? (
                        <div className="flex flex-col items-end">
                          <span className={`px-2.5 py-1 text-xs font-bold rounded-lg border ${
                            registered.status === 'PENDING' ? 'bg-amber-950/40 text-amber-400 border-amber-500/20' :
                            registered.status === 'REVISI' ? 'bg-rose-955/20 text-rose-400 border-rose-500/20' :
                            registered.status === 'VALIDATED' ? 'bg-sky-955/20 text-sky-400 border-sky-505/20' :
                            registered.status === 'APPROVED' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/10' :
                            'bg-emerald-955/20 text-emerald-400 border-emerald-500/15'
                          }`}>
                            {registered.status === 'PENDING' ? 'Menunggu Validasi' :
                             registered.status === 'REVISI' ? 'Harus Revisi' :
                             registered.status === 'VALIDATED' ? 'Dokumen Valid (Sertifikasi)' :
                             registered.status === 'APPROVED' ? 'Terjadwal Uji' : 'Selesai'}
                          </span>
                        </div>
                      ) : active ? (
                        <button
                          onClick={() => handleRegister(sch.id, sch.name)}
                          className={`w-full sm:w-auto px-4 py-2 font-bold rounded-xl text-xs cursor-pointer transition-all shadow-sm ${
                            isMissingLinks
                              ? 'bg-indigo-600/20 text-indigo-400 hover:bg-indigo-600/30 border border-indigo-500/15 shadow-none'
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                          }`}
                        >
                          {isMissingLinks ? 'Isi Link GDrive Dahulu' : 'Daftar Ujian Sekarang'}
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full sm:w-auto px-4 py-2 bg-slate-800 text-slate-600 font-semibold rounded-xl text-xs cursor-not-allowed border border-slate-705/30"
                        >
                          Terkunci
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Status & Certificate Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#1e293b]/50 backdrop-blur-md p-6 rounded-2xl border border-slate-800/80 shadow-2xl space-y-4 text-slate-100">
            <div>
              <h3 className="text-base font-bold text-white">Status Permohonan Anda</h3>
              <p className="text-xs text-slate-400">Ikuti perkembangan pengujian kompetensi dinas Anda</p>
            </div>

            <div className="space-y-4">
              {studentAssessments.length === 0 ? (
                <div className="text-center py-6 text-slate-500 text-xs italic">
                  Belum ada pengajuan ujian. Silakan daftarkan diri pada salah satu skema di samping.
                </div>
              ) : (
                studentAssessments.map(asm => (
                  <div key={asm.id} className="p-4 bg-[#0f172a]/60 rounded-xl border border-slate-800 space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] text-slate-500 font-mono font-bold uppercase">{asm.id}</span>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-bold border ${
                        asm.status === 'PENDING' ? 'bg-amber-95/40 text-amber-400 border-amber-500/10' :
                        asm.status === 'REVISI' ? 'bg-rose-95/20 text-rose-400 border-rose-500/20' :
                        asm.status === 'VALIDATED' ? 'bg-sky-95/20 text-sky-400 border-sky-505/20 font-sans' :
                        asm.status === 'APPROVED' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/10' :
                        'bg-emerald-955/20 text-emerald-450 border-emerald-500/15'
                      }`}>
                        {asm.status === 'PENDING' ? 'MENUNGGU VALIDASI' :
                         asm.status === 'REVISI' ? 'BUTUH REVISI' :
                         asm.status === 'VALIDATED' ? 'TERVALIDASI' :
                         asm.status === 'APPROVED' ? 'TERJADWAL' : 'SELESAI'}
                      </span>
                    </div>

                    <div className="space-y-1">
                      <h4 className="text-xs font-bold text-white">{asm.skemaName}</h4>
                      {asm.status === 'PENDING' && (
                        <p className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Clock className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          <span>Menunggu verifikasi berkas kelayakan pendaftaran oleh LSP Admin.</span>
                        </p>
                      )}

                      {asm.status === 'REVISI' && (
                        <div className="p-3 bg-rose-950/20 rounded-lg text-[11px] text-slate-300 space-y-1 mt-2 border border-rose-500/15 font-sans">
                          <p className="font-bold flex items-center gap-1.5 text-rose-400">
                            <CircleAlert className="h-3.5 w-3.5" /> REVISI DOKUMEN WAJIB
                          </p>
                          <p className="text-white italic bg-[#0f172a]/80 p-2 rounded border border-slate-800/80 leading-relaxed">
                            &ldquo;{asm.catatanAsesor || 'Silakan lengkapi fotokopi sertifikat kepesertaan kelas atau data rapor.'}&rdquo;
                          </p>
                          <p className="text-[9px] text-slate-500 mt-1">Harap hubungi LSP Admin segera setelah berkas diperbaiki.</p>
                        </div>
                      )}

                      {asm.status === 'VALIDATED' && (
                        <p className="text-[11px] text-slate-300 flex items-center gap-1 mt-2 bg-sky-500/5 p-2.5 rounded-lg border border-sky-500/15 font-sans">
                          <CheckCircle2 className="h-3.5 w-3.5 text-sky-400 shrink-0" />
                          <span>Dokumen pendaftaran sudah VALID. Menunggu tim LSP menjadwalkan Guru Penguji Asesor.</span>
                        </p>
                      )}
                      
                      {asm.status === 'APPROVED' && (
                        <div className="p-2.5 bg-indigo-500/10 rounded-lg text-[11px] text-slate-300 space-y-1 mt-2">
                          <p className="font-semibold flex items-center gap-1.5 text-indigo-400">
                            <Calendar className="h-3.5 w-3.5" /> Jadwal Terkonfirmasi
                          </p>
                          <p>Asesor: <span className="font-semibold text-white">{asm.asesorName}</span></p>
                          <p>Tanggal: <span className="font-semibold text-white">{asm.tanggalUjian}</span></p>
                          <p className="text-[10px] text-slate-500 italic">Harap hadir di lab jurusan tepat waktu membawa lembar portofolio.</p>
                        </div>
                      )}

                      {asm.status === 'COMPLETED' && (
                        <div className={`p-3 rounded-lg text-xs space-y-2 mt-2 border ${
                          asm.hasil === 'K' 
                            ? 'bg-emerald-500/5 text-emerald-350 border-emerald-500/20' 
                            : 'bg-rose-500/5 text-rose-350 border-rose-500/20'
                        }`}>
                          <p className="font-bold flex items-center gap-1">
                            {asm.hasil === 'K' ? (
                              <>
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                                <span className="text-emerald-400">Predikat: KOMPETEN (K)</span>
                              </>
                            ) : (
                              <>
                                <CircleAlert className="h-4 w-4 text-rose-500" />
                                <span className="text-rose-400">Predikat: BELUM KOMPETEN (BK)</span>
                              </>
                            )}
                          </p>
                          {asm.catatanAsesor && (
                            <p className="text-[11px] italic text-slate-400 leading-relaxed bg-[#0f172a] p-2 rounded border border-slate-800">
                              &ldquo; {asm.catatanAsesor} &rdquo;
                            </p>
                          )}

                          {asm.hasil === 'K' && (
                            <button
                              onClick={() => handlePrintCertificate(asm.skemaName)}
                              className="w-full py-1.5 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer mt-2 transition-colors"
                            >
                              <Printer className="h-3.5 w-3.5" /> Cetak Sertifikat BNSP
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Certificate Print Preview Mock (Visible only during printing) */}
      <div id="print-area" className="hidden print:block p-8 bg-white text-slate-900 border-[10px] border-double border-slate-200 rounded-3xl max-w-2xl mx-auto space-y-6 shadow-2xl relative">
        <div className="absolute top-4 right-4 h-12 w-12 border-4 border-slate-300 rounded-full flex items-center justify-center text-[10px] font-bold text-slate-400 tracking-tighter select-none rotate-12">
          BNSP MOCK
        </div>
        
        {/* Certificate Header */}
        <div className="text-center space-y-1.5 pb-4 border-b-2 border-slate-200">
          <h1 className="text-sm font-bold tracking-widest text-slate-500 uppercase">Sertifikat Kelulusan Kompetensi</h1>
          <h2 className="text-xl font-bold font-serif text-slate-800">LSP SMK TANJUNG PRIOK JAKARTA</h2>
          <p className="text-[9px] text-slate-500">Lisensi BNSP (Badan Nasional Sertifikasi Profesi) No. Kep. 102/BNSP/VI/2026</p>
        </div>

        {/* Certificate Body */}
        <div className="text-center space-y-4 py-4">
          <p className="text-xs text-slate-500 italic">Menyatakan dengan bangga bahwa asesi:</p>
          <div>
            <h3 className="text-xl font-bold underline font-serif tracking-wide text-slate-800">{student.name}</h3>
            <p className="text-xs text-slate-500 mt-1">NISN: {student.nisn} | Kelas: {student.kelas}</p>
          </div>
          <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
            Telah dinyatakan <span className="font-bold text-blue-700">KOMPETEN (K)</span> dalam pelaksanaan ujian sertifikasi profesi nasional berdasarkan standar kurikulum terlisensi BNSP pada skema keahlian kejuruan:
          </p>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 inline-block">
            <h4 className="text-sm font-bold text-slate-800">{studentAssessments.find(a => a.hasil === 'K')?.skemaName || 'Skema Sertifikasi'}</h4>
          </div>
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 text-center pt-8 text-[11px]">
          <div className="space-y-12">
            <p className="text-slate-500">Asesi Teruji,</p>
            <div className="font-bold underline">{student.name}</div>
          </div>
          <div className="space-y-10">
            <p className="text-slate-500">Jakarta, {new Date().toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}<br/>Asesor Penguji,</p>
            <div className="font-bold underline italic text-[10px]">
              {studentAssessments.find(a => a.hasil === 'K')?.asesorName || 'Nama Tim Asesor'}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
