/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useRef } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Award, BookOpen, Clock, Calendar, CheckCircle2, CircleAlert, Printer, User, Award as BadgeIcon, ExternalLink, Lock } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AsesiDashboard() {
  const { state, registerAssessment } = useLSPStore();
  const student = state.currentUser;

  if (!student || student.role !== 'asesi') return null;

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

  const handleRegister = (schemeId: string, schemeName: string) => {
    registerAssessment(schemeId);
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

            <div className="divide-y divide-slate-800/70">
              {matchingSchemes.map(sch => {
                // Check if already registered
                const registered = studentAssessments.find(a => a.skemaId === sch.id);

                return (
                  <div key={sch.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[9px] uppercase font-mono font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                          {sch.code}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {sch.unitsCount} Unit Kompetensi
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-snug">
                        {sch.name}
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
                            registered.status === 'VALIDATED' ? 'bg-sky-955/20 text-sky-400 border-sky-500/20' :
                            registered.status === 'APPROVED' ? 'bg-indigo-950/40 text-indigo-400 border-indigo-500/10' :
                            'bg-emerald-955/20 text-emerald-400 border-emerald-500/15'
                          }`}>
                            {registered.status === 'PENDING' ? 'Menunggu Validasi' :
                             registered.status === 'REVISI' ? 'Harus Revisi' :
                             registered.status === 'VALIDATED' ? 'Dokumen Valid (Sertifikasi)' :
                             registered.status === 'APPROVED' ? 'Terjadwal Uji' : 'Selesai'}
                          </span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleRegister(sch.id, sch.name)}
                          className="w-full sm:w-auto px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs cursor-pointer transition-colors shadow-sm"
                        >
                          Daftar Ujian
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
