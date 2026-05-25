/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Scheme } from '../types';
import {
  Users, Award, ClipboardCheck, Calendar, BookOpen, Plus, Search, CheckCircle, 
  MapPin, ShieldCheck, Mail, Clock, Filter, AlertCircle, Trash2
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { state, assignAssessor, addScheme, toggleAssessorStatus } = useLSPStore();

  const [activeTab, setActiveTab] = useState<'assessments' | 'students' | 'schemes' | 'assessors'>('assessments');

  // Search & Filter state for Students
  const [studentSearch, setStudentSearch] = useState('');
  const [studentJurusanFilter, setStudentJurusanFilter] = useState<string>('ALL');

  // New Scheme Form State
  const [newSchemeCode, setNewSchemeCode] = useState('');
  const [newSchemeName, setNewSchemeName] = useState('');
  const [newSchemeJurusan, setNewSchemeJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');
  const [newSchemeDesc, setNewSchemeDesc] = useState('');
  const [newSchemeUnits, setNewSchemeUnits] = useState(6);

  // Scheduling states (inline per assessment)
  const [selectedAssessorId, setSelectedAssessorId] = useState<string>('');
  const [examDate, setExamDate] = useState<string>('');
  const [schedulingId, setSchedulingId] = useState<string | null>(null);

  // Statistics
  const totalStudents = state.students.length;
  const totalAssessors = state.assessors.length;
  const totalSchemes = state.schemes.length;
  const totalAssessments = state.assessments.length;
  const pendingAssessmentsCount = state.assessments.filter(a => a.status === 'PENDING').length;
  const completedAssessmentsCount = state.assessments.filter(a => a.status === 'COMPLETED').length;

  // Filter students based on search & major
  const filteredStudents = state.students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          student.id.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesJurusan = studentJurusanFilter === 'ALL' || student.jurusan === studentJurusanFilter;
    return matchesSearch && matchesJurusan;
  });

  const handleCreateScheme = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSchemeCode || !newSchemeName) {
      toast.error('Gagal: Kode dan nama skema wajib diisi.');
      return;
    }
    addScheme({
      code: newSchemeCode,
      name: newSchemeName,
      jurusan: newSchemeJurusan,
      description: newSchemeDesc,
      unitsCount: Number(newSchemeUnits)
    });
    setNewSchemeCode('');
    setNewSchemeName('');
    setNewSchemeDesc('');
    toast.success('Skema sertifikasi berhasil ditambahkan!');
  };

  const handleAssignSubmit = (e: React.FormEvent, assessmentId: string) => {
    e.preventDefault();
    if (!selectedAssessorId || !examDate) {
      toast.error('Wajib menentukan asesor dan tanggal ujian.');
      return;
    }
    assignAssessor(assessmentId, selectedAssessorId, examDate);
    setSchedulingId(null);
    setSelectedAssessorId('');
    toast.success('Asesor sertifikasi berhasil ditugaskan & dijadwalkan!');
  };

  return (
    <div className="space-y-6">
      {/* Bento Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="h-12 w-12 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400 shrink-0 border border-indigo-500/10">
            <Users className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Total Asesi (Siswa)</p>
            <h3 className="text-xl font-bold text-white font-mono leading-tight">{totalStudents}</h3>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="h-12 w-12 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400 shrink-0 border border-amber-500/10">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Asesor Terlisensi</p>
            <h3 className="text-xl font-bold text-white font-mono leading-tight">{totalAssessors}</h3>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="h-12 w-12 bg-purple-500/10 rounded-xl flex items-center justify-center text-purple-400 shrink-0 border border-purple-500/10">
            <Award className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Skema Kompetensi</p>
            <h3 className="text-xl font-bold text-white font-mono leading-tight">{totalSchemes}</h3>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#1e293b]/50 backdrop-blur-md p-5 rounded-2xl border border-slate-800 shadow-xl flex items-center gap-4">
          <div className="h-12 w-12 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-400 shrink-0 border border-emerald-500/10">
            <ClipboardCheck className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-slate-400">Pengajuan Aktif</p>
            <h3 className="text-xl font-bold text-white font-mono leading-tight">
              {pendingAssessmentsCount} <span className="text-xs font-normal text-slate-500">pending</span>
            </h3>
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="bg-[#1e293b]/55 backdrop-blur-md rounded-2xl border border-slate-800 shadow-2xl overflow-hidden">
        {/* Navigation Tabs */}
        <div className="bg-[#0f172a]/40 px-6 border-b border-slate-800/80 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('assessments')}
            className={`py-4 px-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'assessments'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Pendaftaran & Jadwal Uji
          </button>
          <button
            onClick={() => setActiveTab('students')}
            className={`py-4 px-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'students'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Data Asesi (101 Siswa)
          </button>
          <button
            onClick={() => setActiveTab('schemes')}
            className={`py-4 px-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'schemes'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Tambah Skema Sertifikasi
          </button>
          <button
            onClick={() => setActiveTab('assessors')}
            className={`py-4 px-3 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
              activeTab === 'assessors'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-300'
            }`}
          >
            Manajemen Asesor
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-6">
          {/* TAB 1: SUBMISSIONS & SCHEDULING */}
          {activeTab === 'assessments' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center mb-2">
                <div>
                  <h3 className="text-lg font-bold text-white">Daftar Permohonan Uji Kompetensi</h3>
                  <p className="text-xs text-slate-400">Kelola dan jadwalkan pengujian untuk para asesi</p>
                </div>
              </div>

              {state.assessments.length === 0 ? (
                <div className="text-center py-12 text-slate-500">Belum ada pengajuan pendaftaran baru.</div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm text-slate-300">
                    <thead className="bg-[#0f172a]/60 text-xs font-bold text-slate-400 uppercase tracking-widest font-mono border-b border-slate-800">
                      <tr>
                        <th className="p-3">Nama Asesi</th>
                        <th className="p-3">Kelas / Jurusan</th>
                        <th className="p-3">Skema Sertifikasi</th>
                        <th className="p-3">Asesor & Jadwal</th>
                        <th className="p-3">Hasil</th>
                        <th className="p-3 text-right">Aksi</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {state.assessments.map(asm => {
                        let statusColor = 'bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400';
                        if (asm.status === 'APPROVED') statusColor = 'bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-400';
                        if (asm.status === 'COMPLETED') statusColor = 'bg-green-100 text-green-800 dark:bg-green-950/40 dark:text-green-400';

                        return (
                          <React.Fragment key={asm.id}>
                            <tr className="hover:bg-slate-700/20 border-b border-slate-800/40 transition-all text-slate-300">
                              <td className="p-3 font-semibold text-white">{asm.asesiName}</td>
                              <td className="p-3">
                                <span className="block text-white font-medium">{asm.kelas}</span>
                                <span className="text-[10px] text-slate-500">Jurusan {asm.jurusan}</span>
                              </td>
                              <td className="p-3 font-medium text-slate-300">{asm.skemaName}</td>
                              <td className="p-3">
                                {asm.asesorName ? (
                                  <div className="space-y-0.5">
                                    <span className="block font-semibold text-xs text-white">{asm.asesorName}</span>
                                    <span className="text-[11px] text-slate-400 flex items-center gap-1">
                                      <Calendar className="h-3.5 w-3.5 text-indigo-400 font-mono" /> {asm.tanggalUjian}
                                    </span>
                                  </div>
                                ) : (
                                  <span className="text-slate-505 text-slate-500 italic text-xs">Belum dijadwalkan</span>
                                )}
                              </td>
                              <td className="p-3">
                                {asm.status === 'COMPLETED' ? (
                                  <span className={`px-2 py-1 text-[11px] font-bold rounded-lg ${
                                    asm.hasil === 'K' ? 'bg-emerald-505/10 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {asm.hasil === 'K' ? 'KOMPETEN (K)' : 'BELUM KOMPETEN (BK)'}
                                  </span>
                                ) : (
                                  <span className={`px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded ${
                                    asm.status === 'PENDING' ? 'bg-amber-950/40 text-amber-500 border border-amber-500/10' : 'bg-indigo-950/40 text-indigo-400 border border-indigo-500/10'
                                  }`}>
                                    {asm.status}
                                  </span>
                                )}
                              </td>
                              <td className="p-3 text-right">
                                {asm.status === 'PENDING' && (
                                  <button
                                    onClick={() => setSchedulingId(schedulingId === asm.id ? null : asm.id)}
                                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-semibold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
                                  >
                                    Jadwalkan Asesor
                                  </button>
                                )}
                                {asm.status !== 'PENDING' && (
                                  <span className="text-xs text-slate-400 flex items-center justify-end gap-1">
                                    <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Terjadwal
                                  </span>
                                )}
                              </td>
                            </tr>

                            {/* Scheduling drawer form */}
                            {schedulingId === asm.id && (
                              <tr className="bg-[#0f172a]/60">
                                <td colSpan={6} className="p-4">
                                  <form onSubmit={(e) => handleAssignSubmit(e, asm.id)} className="flex flex-wrap items-end gap-4 p-3 bg-[#0f172a]/70 rounded-xl border border-slate-800">
                                    <div className="flex-1 min-w-[200px]">
                                      <label className="block text-xs font-semibold text-slate-400 mb-1">
                                        Pilih Asesor Kualifikasi ({asm.jurusan})
                                      </label>
                                      <select
                                        required
                                        value={selectedAssessorId}
                                        onChange={(e) => setSelectedAssessorId(e.target.value)}
                                        className="w-full p-2 text-xs bg-[#1e293b] border border-slate-800 text-white rounded-lg focus:outline-none"
                                      >
                                        <option value="">Pilih assessor...</option>
                                        {state.assessors
                                          .filter(a => a.jurusan === asm.jurusan && a.active)
                                          .map(a => (
                                            <option key={a.id} value={a.id}>{a.name} ({a.regNumber})</option>
                                          ))}
                                      </select>
                                    </div>

                                    <div>
                                      <label className="block text-xs font-semibold text-slate-600 dark:text-slate-400 mb-1">
                                        Tanggal Pelaksanaan Pelatihan/Ujian
                                      </label>
                                      <input
                                        type="date"
                                        required
                                        value={examDate}
                                        onChange={(e) => setExamDate(e.target.value)}
                                        className="p-2 text-xs bg-[#1e293b] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-505"
                                      />
                                    </div>

                                    <div className="flex gap-2">
                                      <button
                                        type="submit"
                                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
                                      >
                                        Konfirmasi Penjadwalan
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setSchedulingId(null)}
                                        className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
                                      >
                                        Gagal (Batal)
                                      </button>
                                    </div>
                                  </form>
                                </td>
                              </tr>
                            )}
                          </React.Fragment>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: STUDENTS REGISTRY (101 STUDENTS) */}
          {activeTab === 'students' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Database Siswa (Asesi LSP)</h3>
                  <p className="text-xs text-slate-450 text-slate-400">Total terdaftar: {filteredStudents.length} siswa sekolah</p>
                </div>

                {/* Filter Controls */}
                <div className="flex flex-wrap gap-2 w-full sm:w-auto">
                  {/* Search */}
                  <div className="relative flex-1 sm:flex-initial">
                    <input
                      type="text"
                      placeholder="Cari nama asesi..."
                      value={studentSearch}
                      onChange={(e) => setStudentSearch(e.target.value)}
                      className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-[#0f172a] border border-slate-850 border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  </div>

                  {/* Jurusan Filter */}
                  <select
                    value={studentJurusanFilter}
                    onChange={(e) => setStudentJurusanFilter(e.target.value)}
                    className="p-1.5 text-xs bg-[#0f172a] border border-slate-850 border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">Semua Jurusan</option>
                    <option value="DKV">DKV (Visual)</option>
                    <option value="MK">MK (Mesin Kapal)</option>
                    <option value="MO">MO (Otomotif)</option>
                    <option value="TL">TL (Listrik)</option>
                  </select>
                </div>
              </div>

              {/* Students Grid - loaded with 101 candidates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredStudents.map(student => (
                  <div key={student.id} className="p-3 bg-[#0f172a]/40 rounded-xl border border-slate-800/80 flex justify-between items-start">
                    <div className="space-y-1">
                      <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-slate-500">
                        {student.id}
                      </span>
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        NISN: {student.nisn}
                      </p>
                      <div className="flex gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                          {student.kelas}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
                          Jurusan {student.jurusan}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE SCHEMA */}
          {activeTab === 'schemes' && (
            <div className="space-y-4 max-w-lg">
              <div>
                <h3 className="text-lg font-bold text-white">Tambah Skema Sertifikasi Kompetensi</h3>
                <p className="text-xs text-slate-400">Tambahkan standar skema uji kompetensi yang dikeluarkan BNSP</p>
              </div>

              <form onSubmit={handleCreateScheme} className="space-y-4 mt-2">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Skema</label>
                    <input
                      type="text"
                      required
                      placeholder="contoh: SKM-DKV-03"
                      value={newSchemeCode}
                      onChange={(e) => setNewSchemeCode(e.target.value)}
                      className="w-full p-2.5 text-xs bg-[#0f172a]/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Jurusan</label>
                    <select
                      value={newSchemeJurusan}
                      onChange={(e) => setNewSchemeJurusan(e.target.value as any)}
                      className="w-full p-2.5 text-xs bg-[#0f172a]/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    >
                      <option value="DKV" className="bg-[#1e293b]">DKV (Visual)</option>
                      <option value="MK" className="bg-[#1e293b]">MK (Mesin Kapal)</option>
                      <option value="MO" className="bg-[#1e293b]">MO (Otomotif)</option>
                      <option value="TL" className="bg-[#1e293b]">TL (Listrik)</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1 font-semibold">Nama Skema Sertifikasi</label>
                  <input
                    type="text"
                    required
                    placeholder="contoh: Pembuat Asset Animasi 3D"
                    value={newSchemeName}
                    onChange={(e) => setNewSchemeName(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#0f172a]/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">Jumlah Unit Kompetensi</label>
                    <input
                      type="number"
                      required
                      min={1}
                      max={20}
                      value={newSchemeUnits}
                      onChange={(e) => setNewSchemeUnits(Number(e.target.value))}
                      className="w-full p-2.5 text-xs bg-[#0f172a]/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Tambahan / Cakupan Uji</label>
                  <textarea
                    rows={4}
                    placeholder="Uraikan kriteria kompetensi, materi uji coba praktik, dsb..."
                    value={newSchemeDesc}
                    onChange={(e) => setNewSchemeDesc(e.target.value)}
                    className="w-full p-2.5 text-xs bg-[#0f172a]/80 border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                </div>

                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors shadow-sm"
                >
                  Tambahkan Skema Baru
                </button>
              </form>
            </div>
          )}

          {/* TAB 4: ASSESSOR PORTFOLIO */}
          {activeTab === 'assessors' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">Daftar Tim Asesor Penguji</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Kelola guru penguji asesor dan status keaktifan menguji</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {state.assessors.map(asesor => (
                  <div key={asesor.id} className="p-4 bg-[#0f172a]/40 rounded-xl border border-slate-800 flex items-start justify-between">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[9px] font-mono font-bold uppercase border border-indigo-500/10">
                          {asesor.jurusan}
                        </span>
                        <span className="text-[10px] text-slate-500 font-mono">
                          {asesor.id}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white">{asesor.name}</h4>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <Award className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>No. Registrasi: {asesor.regNumber}</span>
                      </p>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                        <span>{asesor.email}</span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        asesor.active ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-500/10' : 'bg-rose-950/40 text-rose-400 border border-rose-500/10'
                      }`}>
                        {asesor.active ? 'Aktif Menguji' : 'Berhalangan'}
                      </span>

                      <button
                        onClick={() => {
                          toggleAssessorStatus(asesor.id);
                          toast.success('Status asesor diubah.');
                        }}
                        className={`px-3 py-1 font-semibold rounded-lg text-[10px] cursor-pointer border transition-colors ${
                          asesor.active 
                            ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-800' 
                            : 'bg-indigo-600 hover:bg-indigo-500 text-white border-transparent shadow-sm'
                        }`}
                      >
                        {asesor.active ? 'Nonaktifkan' : 'Aktifkan'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
