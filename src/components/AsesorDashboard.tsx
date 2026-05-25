/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Assessment } from '../types';
import { Award, Calendar, CheckSquare, ClipboardList, PenTool, Check, AlertTriangle, MessageSquareCode } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AsesorDashboard() {
  const { state, gradeAssessment } = useLSPStore();
  const assessor = state.currentUser;

  // Rating states (for inline grading)
  const [selectedResult, setSelectedResult] = useState<'K' | 'BK'>('K');
  const [catatan, setCatatan] = useState('');
  const [gradingId, setGradingId] = useState<string | null>(null);

  if (!assessor || assessor.role !== 'asesor') return null;

  // Filter assessments where this assessor is assigned
  const assessorAssessments = state.assessments.filter(a => a.asesorId === assessor.id);

  // Active / pending grade
  const activeAssessments = assessorAssessments.filter(a => a.status === 'APPROVED');
  // Finished grade
  const historyAssessments = assessorAssessments.filter(a => a.status === 'COMPLETED');

  const handleGradeSubmit = (e: React.FormEvent, assessmentId: string) => {
    e.preventDefault();
    if (!catatan.trim()) {
      toast.error('Gagal: Catatan penilaian asesi wajib diberikan penguji.');
      return;
    }
    gradeAssessment(assessmentId, selectedResult, catatan);
    setGradingId(null);
    setCatatan('');
    toast.success('Hasil penilaian kompetensi berhasil didaftarkan!');
  };

  return (
    <div className="space-y-6">
      {/* Assessor Banner */}
      <div className="bg-gradient-to-br from-indigo-950/60 to-slate-900/95 border border-indigo-500/20 rounded-3xl p-6 shadow-xl text-white">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold font-mono uppercase tracking-wider border border-indigo-500/20">
              Tim Assessor Berlisensi LSP
            </span>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-white">{assessor.name}</h2>
            <p className="text-xs text-slate-400">
              No. Reg: {assessor.regNumber} | Bidang Keahlian: <span className="font-bold text-indigo-300">{assessor.jurusan}</span>
            </p>
          </div>

          <div className="flex gap-4 shrink-0">
            <div className="p-3 bg-[#0f172a]/80 rounded-2xl border border-slate-800/80 text-center min-w-[100px] shadow-inner">
              <span className="block text-[10px] text-slate-500 font-bold uppercase font-mono">Uji Aktif</span>
              <span className="text-lg font-bold text-indigo-400">{activeAssessments.length}</span>
            </div>
            <div className="p-3 bg-[#0f172a]/80 rounded-2xl border border-slate-800/80 text-center min-w-[100px] shadow-inner">
              <span className="block text-[10px] text-slate-500 font-bold uppercase font-mono">Selesai diuji</span>
              <span className="text-lg font-bold text-emerald-400">{historyAssessments.length}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Scheduled Assessments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-indigo-455 text-indigo-400" />
            <h3 className="text-base font-bold text-white">Jadwal Ujian Kompetensi Aktif</h3>
          </div>

          {activeAssessments.length === 0 ? (
            <div className="p-8 bg-[#1e293b]/50 backdrop-blur border border-slate-800/80 rounded-2xl text-center text-slate-500 text-xs italic">
              Tidak ada jadwal uji kompetensi asesi aktif saat ini.
            </div>
          ) : (
            <div className="space-y-3">
              {activeAssessments.map(asm => (
                <div key={asm.id} className="p-5 bg-[#1e293b]/55 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-xl space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-bold font-mono">
                        {asm.id}
                      </span>
                      <h4 className="text-sm font-bold text-white mt-1">{asm.asesiName}</h4>
                      <p className="text-xs text-slate-400">Kelas {asm.kelas} | Jurusan {asm.jurusan}</p>
                    </div>

                    <div className="text-right text-xs text-slate-405 text-slate-400 flex items-center gap-1">
                      <Calendar className="h-4 w-4 text-indigo-400" />
                      <span>{asm.tanggalUjian}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-[#0f172a]/70 rounded-xl border border-slate-800/60">
                    <span className="block text-[9px] uppercase font-bold text-slate-500 font-mono">
                      Skema Diuji
                    </span>
                    <span className="text-xs font-semibold text-slate-200">
                      {asm.skemaName}
                    </span>
                  </div>

                  {gradingId !== asm.id ? (
                    <button
                      onClick={() => {
                        setGradingId(asm.id);
                        setSelectedResult('K');
                      }}
                      className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer transition-colors shadow-sm"
                    >
                      <PenTool className="h-3.5 w-3.5" /> Berikan Penilaian & Rekomendasi
                    </button>
                  ) : (
                    <form onSubmit={(e) => handleGradeSubmit(e, asm.id)} className="space-y-3 p-3 bg-indigo-505 bg-indigo-550/10 bg-indigo-500/5 border border-indigo-500/15 rounded-xl">
                      <h5 className="text-xs font-bold text-indigo-400">Form Evaluasi Sertifikat</h5>
                      
                      {/* Score Selection Buttons */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedResult('K')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                            selectedResult === 'K'
                              ? 'bg-emerald-600 text-white border-transparent shadow shadow-emerald-500/10'
                              : 'bg-[#0f172a] text-slate-300 border-slate-800'
                          }`}
                        >
                          <Check className="h-4 w-4" /> Kompeten (K)
                        </button>
                        <button
                          type="button"
                          onClick={() => setSelectedResult('BK')}
                          className={`py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-2 border cursor-pointer transition-all ${
                            selectedResult === 'BK'
                              ? 'bg-rose-600 text-white border-transparent shadow shadow-rose-500/10'
                              : 'bg-[#0f172a] text-slate-300 border-slate-800'
                          }`}
                        >
                          <AlertTriangle className="h-4 w-4" /> Belum Kompeten (BK)
                        </button>
                      </div>

                      {/* Instructor notes */}
                      <div>
                        <label className="block text-[10px] font-semibold text-slate-500 mb-1">
                          Catatan Portofolio & Penilaian Asesor
                        </label>
                        <textarea
                          required
                          rows={3}
                          placeholder="contoh: Siswa mahir dalam pengolahan grafis aset digital, penggunaan warna sesuai pakem publikasi..."
                          value={catatan}
                          onChange={(e) => setCatatan(e.target.value)}
                          className="w-full p-2 bg-[#0f172a] text-xs text-white rounded-lg border border-slate-800 focus:ring-1 focus:ring-indigo-505 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>

                      <div className="flex gap-2 justify-end">
                        <button
                          type="button"
                          onClick={() => setGradingId(null)}
                          className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs cursor-pointer font-medium"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-xs cursor-pointer"
                        >
                          Kirim Hasil
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Historical / Completed Assessments */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <CheckSquare className="h-5 w-5 text-emerald-450 text-emerald-400" />
            <h3 className="text-base font-bold text-white">Riwayat Asesi Selesai Diuji</h3>
          </div>

          {historyAssessments.length === 0 ? (
            <div className="p-8 bg-[#1e293b]/50 backdrop-blur border border-slate-800/80 rounded-2xl text-center text-slate-500 text-xs italic">
              Belum ada riwayat siswa yang dinilai oleh Anda.
            </div>
          ) : (
            <div className="space-y-3 max-h-[500px] overflow-y-auto pr-1">
              {historyAssessments.map(asm => (
                <div key={asm.id} className="p-4 bg-[#1e293b]/55 backdrop-blur-md border border-slate-800/80 rounded-2xl shadow-lg space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xs font-bold text-white">{asm.asesiName}</h4>
                      <p className="text-[10px] text-slate-450 text-slate-450 text-slate-400">{asm.kelas} | NISN {asm.asesiId}</p>
                    </div>

                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                      asm.hasil === 'K' 
                        ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' 
                        : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                    }`}>
                      {asm.hasil === 'K' ? 'KOMPETEN (K)' : 'BELUM KOMPETEN (BK)'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-300 font-medium">
                    Skema: {asm.skemaName}
                  </p>

                  {asm.catatanAsesor && (
                    <p className="text-[11px] italic text-slate-400 bg-[#0f172a]/60 p-2 rounded-lg border border-slate-800/80 flex gap-1 items-start leading-relaxed">
                      <MessageSquareCode className="h-3.5 w-3.5 text-slate-500 shrink-0 mt-0.5" />
                      <span>{asm.catatanAsesor}</span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
