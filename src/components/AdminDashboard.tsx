/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Scheme } from '../types';
import {
  Users, Award, ClipboardCheck, Calendar, BookOpen, Plus, Search, CheckCircle, 
  MapPin, ShieldCheck, Mail, Clock, Filter, AlertCircle, Trash2, Edit, Upload, 
  Download, UserPlus, X, FileText, ExternalLink
} from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminDashboard() {
  const { 
    state, 
    assignAssessor, 
    validateAssessment,
    revisiAssessment,
    deleteAssessment,
    addScheme, 
    toggleAssessorStatus,
    addStudent,
    addStudentsBulk,
    updateStudent,
    deleteStudent,
    addAssessor,
    updateAssessor,
    deleteAssessor,
    addSchemeRecord,
    updateScheme,
    deleteScheme
  } = useLSPStore();

  const [activeTab, setActiveTab] = useState<'assessments' | 'students' | 'schemes' | 'assessors'>('assessments');

  // Assessment validation / revision states
  const [revisingId, setRevisingId] = useState<string | null>(null);
  const [revisionNotes, setRevisionNotes] = useState('');

  // Student CRUD states
  const [showAddForm, setShowAddForm] = useState(false);
  const [showCsvHelp, setShowCsvHelp] = useState(false);
  const [editingStudent, setEditingStudent] = useState<any | null>(null);
  
  // Custom delete confirmation modal state
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    isOpen: boolean;
    type: 'student' | 'assessor' | 'scheme';
    id: string;
    name: string;
  } | null>(null);

  // Form fields for adding single student
  const [newStudentId, setNewStudentId] = useState('');
  const [newStudentName, setNewStudentName] = useState('');
  const [newStudentEmail, setNewStudentEmail] = useState('');
  const [newStudentNisn, setNewStudentNisn] = useState('');
  const [newStudentKelas, setNewStudentKelas] = useState('');
  const [newStudentJurusan, setNewStudentJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');

  // Form fields for editing student
  const [editStudentName, setEditStudentName] = useState('');
  const [editStudentEmail, setEditStudentEmail] = useState('');
  const [editStudentNisn, setEditStudentNisn] = useState('');
  const [editStudentKelas, setEditStudentKelas] = useState('');
  const [editStudentJurusan, setEditStudentJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');

  // Assessor CRUD states
  const [showAddAssessorForm, setShowAddAssessorForm] = useState(false);
  const [editingAssessor, setEditingAssessor] = useState<any | null>(null);

  const [newAssessorId, setNewAssessorId] = useState('');
  const [newAssessorName, setNewAssessorName] = useState('');
  const [newAssessorRegNumber, setNewAssessorRegNumber] = useState('');
  const [newAssessorEmail, setNewAssessorEmail] = useState('');
  const [newAssessorJurusan, setNewAssessorJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');

  const [editAssessorName, setEditAssessorName] = useState('');
  const [editAssessorRegNumber, setEditAssessorRegNumber] = useState('');
  const [editAssessorEmail, setEditAssessorEmail] = useState('');
  const [editAssessorJurusan, setEditAssessorJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');

  // Scheme CRUD states
  const [showAddSchemeForm, setShowAddSchemeForm] = useState(false);
  const [editingScheme, setEditingScheme] = useState<any | null>(null);

  const [editSchemeCode, setEditSchemeCode] = useState('');
  const [editSchemeName, setEditSchemeName] = useState('');
  const [editSchemeJurusan, setEditSchemeJurusan] = useState<'DKV' | 'MK' | 'MO' | 'TL'>('DKV');
  const [editSchemeDesc, setEditSchemeDesc] = useState('');
  const [editSchemeUnits, setEditSchemeUnits] = useState(6);

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
    const cleanId = `sch-${newSchemeCode.trim().toLowerCase().replace(/[^a-z0-9-]/g, '')}`;
    const success = addSchemeRecord({
      id: cleanId,
      code: newSchemeCode.trim().toUpperCase(),
      name: newSchemeName.trim(),
      jurusan: newSchemeJurusan,
      description: newSchemeDesc.trim(),
      unitsCount: Number(newSchemeUnits)
    });

    if (success) {
      setNewSchemeCode('');
      setNewSchemeName('');
      setNewSchemeDesc('');
      setNewSchemeUnits(6);
      setShowAddSchemeForm(false);
      toast.success('Skema sertifikasi berhasil ditambahkan!');
    } else {
      toast.error(`Gagal: Kode/ID skema "${newSchemeCode}" sudah digunakan.`);
    }
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

  const handleAddStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStudentId || !newStudentName || !newStudentEmail) {
      toast.error('Gagal: ID, Nama, dan Email wajib diisi.');
      return;
    }

    const success = addStudent({
      id: newStudentId,
      name: newStudentName,
      email: newStudentEmail,
      nisn: newStudentNisn,
      kelas: newStudentKelas,
      jurusan: newStudentJurusan
    });

    if (success) {
      toast.success(`Berhasil menambahkan asesi: ${newStudentName}`);
      setShowAddForm(false);
      setNewStudentId('');
      setNewStudentName('');
      setNewStudentEmail('');
      setNewStudentNisn('');
      setNewStudentKelas('');
    } else {
      toast.error(`Gagal: ID "${newStudentId}" sudah digunakan.`);
    }
  };

  const handleEditStudentClick = (student: any) => {
    setEditingStudent(student);
    setEditStudentName(student.name);
    setEditStudentEmail(student.email);
    setEditStudentNisn(student.nisn || '');
    setEditStudentKelas(student.kelas || '');
    setEditStudentJurusan(student.jurusan || 'DKV');
  };

  const handleUpdateStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStudent) return;
    if (!editStudentName || !editStudentEmail) {
      toast.error('Gagal: Nama dan Email wajib diisi.');
      return;
    }

    updateStudent(editingStudent.id, {
      name: editStudentName,
      email: editStudentEmail,
      nisn: editStudentNisn,
      kelas: editStudentKelas,
      jurusan: editStudentJurusan
    });

    toast.success('Berhasil memperbarui data asesi!');
    setEditingStudent(null);
  };

  const handleDeleteStudentClick = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'student',
      id,
      name
    });
  };

  // Assessor CRUD handlers
  const handleAddAssessorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAssessorId || !newAssessorName || !newAssessorEmail || !newAssessorRegNumber) {
      toast.error('Gagal: Seluruh bidang wajib diisi.');
      return;
    }

    const success = addAssessor({
      id: newAssessorId,
      name: newAssessorName,
      regNumber: newAssessorRegNumber,
      email: newAssessorEmail,
      jurusan: newAssessorJurusan,
      active: true
    });

    if (success) {
      toast.success(`Berhasil menambahkan asesor: ${newAssessorName}`);
      setShowAddAssessorForm(false);
      setNewAssessorId('');
      setNewAssessorName('');
      setNewAssessorRegNumber('');
      setNewAssessorEmail('');
    } else {
      toast.error(`Gagal: Username "${newAssessorId}" sudah terdaftar.`);
    }
  };

  const handleEditAssessorClick = (assessor: any) => {
    setEditingAssessor(assessor);
    setEditAssessorName(assessor.name);
    setEditAssessorRegNumber(assessor.regNumber);
    setEditAssessorEmail(assessor.email);
    setEditAssessorJurusan(assessor.jurusan);
  };

  const handleUpdateAssessorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAssessor) return;
    if (!editAssessorName || !editAssessorEmail || !editAssessorRegNumber) {
      toast.error('Gagal: Bidang Nama, Surel, dan No. Registrasi wajib diisi.');
      return;
    }

    updateAssessor(editingAssessor.id, {
      name: editAssessorName,
      regNumber: editAssessorRegNumber,
      email: editAssessorEmail,
      jurusan: editAssessorJurusan
    });

    toast.success('Berhasil memperbarui data asesor!');
    setEditingAssessor(null);
  };

  const handleDeleteAssessorClick = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'assessor',
      id,
      name
    });
  };

  // Scheme CRUD handlers
  const handleEditSchemeClick = (scheme: any) => {
    setEditingScheme(scheme);
    setEditSchemeCode(scheme.code);
    setEditSchemeName(scheme.name);
    setEditSchemeJurusan(scheme.jurusan);
    setEditSchemeDesc(scheme.description || '');
    setEditSchemeUnits(scheme.unitsCount || 6);
  };

  const handleUpdateSchemeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingScheme) return;
    if (!editSchemeCode || !editSchemeName) {
      toast.error('Gagal: Kode dan Nama skema wajib diisi.');
      return;
    }

    updateScheme(editingScheme.id, {
      code: editSchemeCode,
      name: editSchemeName,
      jurusan: editSchemeJurusan,
      description: editSchemeDesc,
      unitsCount: Number(editSchemeUnits)
    });

    toast.success('Berhasil memperbarui skema kompetensi!');
    setEditingScheme(null);
  };

  const handleDeleteSchemeClick = (id: string, name: string) => {
    setDeleteConfirmation({
      isOpen: true,
      type: 'scheme',
      id,
      name
    });
  };

  const handleCsvImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const text = event.target?.result as string;
        if (!text) {
          toast.error('File CSV kosong.');
          return;
        }

        const lines = text.split(/\r?\n/);
        if (lines.length < 2) {
          toast.error('File CSV tidak memiliki data atau baris header saja.');
          return;
        }

        const firstLine = lines[0];
        const separator = firstLine.includes(';') ? ';' : ',';
        const headers = firstLine.split(separator).map(h => h.trim().toLowerCase().replace(/^["']|["']$/g, ''));

        const idIdx = headers.findIndex(h => h === 'id' || h === 'username' || h === 'email_prefix');
        const nameIdx = headers.findIndex(h => h === 'name' || h === 'nama' || h === 'nama lengkap');
        const emailIdx = headers.findIndex(h => h === 'email');
        const kelasIdx = headers.findIndex(h => h === 'kelas' || h === 'class');
        const jurusanIdx = headers.findIndex(h => h === 'jurusan' || h === 'major');
        const nisnIdx = headers.findIndex(h => h === 'nisn');

        if (idIdx === -1 || nameIdx === -1) {
          toast.error('Format CSV salah. Wajib mencantumkan kolom "id" dan "name".');
          return;
        }

        const newStudents: any[] = [];
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i].trim();
          if (!line) continue;

          const row = parseCsvRow(line, separator);
          if (row.length <= Math.max(idIdx, nameIdx)) continue;

          const id = row[idIdx]?.trim();
          const name = row[nameIdx]?.trim();
          if (!id || !name) continue;

          const email = emailIdx !== -1 && row[emailIdx] ? row[emailIdx].trim() : `${id}@siswa.sch.id`;
          const kelas = kelasIdx !== -1 && row[kelasIdx] ? row[kelasIdx].trim() : 'XII';
          const nisn = nisnIdx !== -1 && row[nisnIdx] ? row[nisnIdx].trim() : String(Math.floor(100000000 + Math.random() * 900000000));
          
          let jurusan: 'DKV' | 'MK' | 'MO' | 'TL' = 'DKV';
          if (jurusanIdx !== -1 && row[jurusanIdx]) {
            const rawJur = row[jurusanIdx].trim().toUpperCase();
            if (['DKV', 'MK', 'MO', 'TL'].includes(rawJur)) {
              jurusan = rawJur as 'DKV' | 'MK' | 'MO' | 'TL';
            } else {
              if (rawJur.includes('DESAIN') || rawJur.includes('KOMPUTER') || rawJur.includes('DKV')) jurusan = 'DKV';
              else if (rawJur.includes('MESIN') || rawJur.includes('BUBUT') || rawJur.includes('MK')) jurusan = 'MK';
              else if (rawJur.includes('OTOMOTIF') || rawJur.includes('KENDARAAN') || rawJur.includes('MO')) jurusan = 'MO';
              else if (rawJur.includes('LISTRIK') || rawJur.includes('TL')) jurusan = 'TL';
            }
          } else {
            const rawKelas = kelas.toUpperCase();
            if (rawKelas.includes('DKV')) jurusan = 'DKV';
            else if (rawKelas.includes('MK')) jurusan = 'MK';
            else if (rawKelas.includes('MO')) jurusan = 'MO';
            else if (rawKelas.includes('TL')) jurusan = 'TL';
          }

          newStudents.push({
            id,
            name,
            email,
            kelas,
            jurusan,
            nisn
          });
        }

        if (newStudents.length === 0) {
          toast.error('Tidak ada baris data valid yang ditemukan di file CSV.');
          return;
        }

        const res = addStudentsBulk(newStudents);
        toast.success(`Impor CSV berhasil: ${res.addedCount} asesi ditambahkan, ${res.duplicateCount} duplikat diabaikan.`);
        e.target.value = '';
      } catch (err) {
        toast.error('Gagal mengurai file CSV.');
        console.error(err);
      }
    };
    reader.readAsText(file);
  };

  const parseCsvRow = (line: string, sep: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const char = line[i];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === sep && !inQuotes) {
        result.push(current.replace(/^["']|["']$/g, ''));
        current = '';
      } else {
        current += char;
      }
    }
    result.push(current.replace(/^["']|["']$/g, ''));
    return result;
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
                              <td className="p-3">
                                <span className="font-medium text-slate-300 block leading-snug">{asm.skemaName}</span>
                                {(asm.apl01Link || asm.apl02Link) && (
                                  <div className="flex flex-wrap gap-2 mt-1.5 font-sans">
                                    {asm.apl01Link && (
                                      <a
                                        href={asm.apl01Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 transition-all font-semibold"
                                      >
                                        APL-01 <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                    {asm.apl02Link && (
                                      <a
                                        href={asm.apl02Link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] bg-sky-500/20 hover:bg-sky-500/30 text-sky-300 border border-sky-500/30 transition-all font-semibold"
                                      >
                                        APL-02 <ExternalLink className="h-2.5 w-2.5" />
                                      </a>
                                    )}
                                  </div>
                                )}
                              </td>
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
                                    asm.hasil === 'K' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                  }`}>
                                    {asm.hasil === 'K' ? 'KOMPETEN (K)' : 'BELUM KOMPETEN (BK)'}
                                  </span>
                                ) : asm.status === 'REVISI' ? (
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded bg-rose-950/40 text-rose-400 border border-rose-500/20">
                                    REVISI (BUTUH DOKUMEN)
                                  </span>
                                ) : asm.status === 'VALIDATED' ? (
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded bg-[#0369a1]/20 text-sky-400 border border-[#0284c7]/20">
                                    TERVALIDASI
                                  </span>
                                ) : asm.status === 'APPROVED' ? (
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded bg-indigo-950/40 text-indigo-400 border border-indigo-500/20">
                                    TERJADWAL
                                  </span>
                                ) : (
                                  <span className="px-2 py-0.5 text-[10px] uppercase font-mono tracking-wider font-bold rounded bg-amber-950/40 text-amber-500 border border-amber-500/10">
                                    MENUNGGU VALIDASI
                                  </span>
                                )}
                              </td>
                              <td className="p-3">
                                <div className="flex flex-wrap items-center justify-end gap-1.5">
                                  {(asm.status === 'PENDING' || asm.status === 'REVISI') && (
                                    <>
                                      <button
                                        onClick={() => {
                                          validateAssessment(asm.id);
                                          toast.success(`Berhasil memvalidasi pendaftaran asesi ${asm.asesiName}.`);
                                        }}
                                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[11px] cursor-pointer transition-colors shadow-sm"
                                        title="Sahkan Kelayakan Dokumen"
                                      >
                                        Setujui / Validasi
                                      </button>
                                      <button
                                        onClick={() => {
                                          setRevisingId(revisingId === asm.id ? null : asm.id);
                                          setRevisionNotes('');
                                        }}
                                        className="px-2.5 py-1 bg-amber-600/10 hover:bg-amber-600/20 text-amber-400 border border-amber-500/20 font-semibold rounded-lg text-[11px] cursor-pointer transition-colors"
                                        title="Kembalikan pendaftaran untuk direvisi"
                                      >
                                        Minta Revisi
                                      </button>
                                    </>
                                  )}
                                  
                                  {asm.status === 'VALIDATED' && (
                                    <button
                                      onClick={() => {
                                        setSchedulingId(schedulingId === asm.id ? null : asm.id);
                                        setSelectedAssessorId(asm.asesorId || '');
                                        setExamDate(asm.tanggalUjian || '');
                                      }}
                                      className="px-3 py-1 bg-indigo-600 hover:bg-indigo-550 hover:bg-indigo-500 text-white font-semibold rounded-lg text-[11px] cursor-pointer transition-colors shadow-sm flex items-center gap-1"
                                    >
                                      <Calendar className="h-3.5 w-3.5" />
                                      Jadwalkan Asesor
                                    </button>
                                  )}

                                  {asm.status === 'APPROVED' && (
                                    <div className="flex items-center gap-2">
                                      <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                                        <CheckCircle className="h-3.5 w-3.5 text-emerald-500" /> Terjadwal
                                      </span>
                                      <button
                                        onClick={() => {
                                          setSchedulingId(schedulingId === asm.id ? null : asm.id);
                                          setSelectedAssessorId(asm.asesorId || '');
                                          setExamDate(asm.tanggalUjian || '');
                                        }}
                                        className="px-2 py-0.5 bg-slate-800 hover:bg-slate-705 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-[9px] cursor-pointer transition-all"
                                      >
                                        Ubah Jadwal
                                      </button>
                                    </div>
                                  )}

                                  {asm.status === 'COMPLETED' && (
                                    <span className="text-[11px] font-mono font-semibold text-slate-500 mr-2">
                                      Arsip Selesai
                                    </span>
                                  )}

                                  <button
                                    onClick={() => {
                                      if (window.confirm(`Apakah Anda yakin ingin menghapus permohonan uji kompetensi asesi ${asm.asesiName}?`)) {
                                        deleteAssessment(asm.id);
                                        toast.success(`Berhasil menghapus permohonan asesi ${asm.asesiName}.`);
                                      }
                                    }}
                                    className="p-1 px-1.5 text-slate-400 hover:bg-rose-500/15 hover:text-rose-400 rounded-lg transition-all cursor-pointer border border-transparent hover:border-rose-500/20"
                                    title="Hapus Permohonan Uji Kompetensi"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
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

                            {/* Revision drawer form */}
                            {revisingId === asm.id && (
                              <tr className="bg-[#0f172a]/60 font-sans">
                                <td colSpan={6} className="p-4">
                                  <form onSubmit={(e) => {
                                    e.preventDefault();
                                    revisiAssessment(asm.id, revisionNotes);
                                    toast.success(`Pengajuan asesi ${asm.asesiName} berhasil ditandai memerlukan revisi.`);
                                    setRevisingId(null);
                                    setRevisionNotes('');
                                  }} className="flex flex-col gap-2.5 p-4 bg-[#1e293b]/90 rounded-xl border border-rose-500/25">
                                    <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                                      <label className="block text-xs font-bold text-rose-400 flex items-center gap-1">
                                        <AlertCircle className="h-4 w-4" /> Masukkan Catatan Revisi / Dokumen Kurang untuk {asm.asesiName}
                                      </label>
                                      <span className="text-[10px] text-slate-450 font-normal">Ketentuan BNSP</span>
                                    </div>
                                    <div className="flex gap-2">
                                      <input
                                        type="text"
                                        required
                                        placeholder="contoh: Berkas pendaftaran belum lengkap, mohon lampirkan fotokopi rapor semester 5."
                                        value={revisionNotes}
                                        onChange={(e) => setRevisionNotes(e.target.value)}
                                        className="flex-1 px-3 py-1.5 bg-[#0f172a] border border-slate-800 text-white rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 placeholder-slate-600"
                                      />
                                      <button
                                        type="submit"
                                        className="px-4 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                                      >
                                        Kirim Revisi
                                      </button>
                                      <button
                                        type="button"
                                        onClick={() => setRevisingId(null)}
                                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                                      >
                                        Batal
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
                  <p className="text-xs text-slate-400">Total terdaftar: {filteredStudents.length} siswa sekolah</p>
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
                      className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                    <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-500" />
                  </div>

                  {/* Jurusan Filter */}
                  <select
                    value={studentJurusanFilter}
                    onChange={(e) => setStudentJurusanFilter(e.target.value)}
                    className="p-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  >
                    <option value="ALL">Semua Jurusan</option>
                    <option value="DKV">DKV (Visual)</option>
                    <option value="MK">MK (Mesin Kapal)</option>
                    <option value="MO">MO (Otomotif)</option>
                    <option value="TL">TL (Listrik)</option>
                  </select>
                </div>
              </div>

              {/* Manual Creation & CSV Import Top Toolbar */}
              <div className="flex flex-wrap gap-2 pt-1 pb-1">
                <button
                  onClick={() => { setShowAddForm(!showAddForm); setEditingStudent(null); setShowCsvHelp(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${showAddForm ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400'}`}
                >
                  <UserPlus className="h-3.5 w-3.5" />
                  {showAddForm ? 'Tutup Form' : 'Tambah Asesi Manual'}
                </button>

                <label className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-emerald-400 text-xs font-bold rounded-lg transition-all cursor-pointer border border-emerald-500/10">
                  <Upload className="h-3.5 w-3.5" />
                  <span>Impor CSV</span>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleCsvImport}
                    className="hidden"
                  />
                </label>

                <button
                  onClick={() => { setShowCsvHelp(!showCsvHelp); setShowAddForm(false); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${showCsvHelp ? 'bg-indigo-500/20 text-indigo-300' : 'bg-slate-800/60 hover:bg-slate-800 text-slate-400'}`}
                >
                  <FileText className="h-3.5 w-3.5" />
                  Petunjuk Format CSV
                </button>
              </div>

              {/* CSV HELP PANEL */}
              {showCsvHelp && (
                <div className="p-4 bg-slate-900/60 border border-indigo-500/20 rounded-xl space-y-2">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                      📖 Cara Impor Data Asesi via CSV
                    </h4>
                    <button onClick={() => setShowCsvHelp(false)} className="text-slate-450 hover:text-white text-xs">
                      Tutup
                    </button>
                  </div>
                  <p className="text-xs text-slate-350 select-text leading-relaxed">
                    Sistem mendukung fail CSV standar (comma atau semicolon-separated). Buat file di Excel atau Google Sheets, lalu simpan sebagai <code className="text-emerald-400 font-mono font-bold">.csv</code> dengan kolom-kolom berikut:
                  </p>
                  <div className="overflow-x-auto text-[11px] bg-slate-950 p-2 rounded border border-slate-800">
                    <table className="w-full text-slate-300">
                      <thead>
                        <tr className="border-b border-slate-800 text-slate-400 text-left font-mono">
                          <th className="p-1 pb-2 font-semibold">Nama Kolom</th>
                          <th className="p-1 pb-2 font-semibold">Tipe</th>
                          <th className="p-1 pb-2 font-semibold">Keterangan</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-slate-800/40">
                          <td className="p-1 font-mono text-emerald-400">id</td>
                          <td className="p-1 text-yellow-500">Wajib</td>
                          <td className="p-1">Username login unik (contoh: <code className="text-slate-400">siswa102</code>)</td>
                        </tr>
                        <tr className="border-b border-slate-800/40">
                          <td className="p-1 font-mono text-emerald-400">name</td>
                          <td className="p-1 text-yellow-500">Wajib</td>
                          <td className="p-1">Nama lengkap siswa (contoh: <code className="text-slate-400">Achmad Fauzan</code>)</td>
                        </tr>
                        <tr className="border-b border-slate-800/40">
                          <td className="p-1 font-mono text-indigo-400">email</td>
                          <td className="p-1 text-slate-450 text-slate-400">Opsional</td>
                          <td className="p-1">Email, bawaan: <code className="text-slate-400">[id]@siswa.sch.id</code></td>
                        </tr>
                        <tr className="border-b border-slate-800/40">
                          <td className="p-1 font-mono text-indigo-400">kelas</td>
                          <td className="p-1 text-slate-450 text-slate-400">Opsional</td>
                          <td className="p-1">Kelas, bawaan: <code className="text-slate-400">XII</code></td>
                        </tr>
                        <tr className="border-b border-slate-800/40">
                          <td className="p-1 font-mono text-indigo-400">jurusan</td>
                          <td className="p-1 text-slate-450 text-slate-400">Opsional</td>
                          <td className="p-1">Pilihan: <code className="text-indigo-400 font-bold">DKV</code>, <code className="text-indigo-400 font-bold">MK</code>, <code className="text-indigo-400 font-bold">MO</code>, <code className="text-indigo-400 font-bold">TL</code>.</td>
                        </tr>
                        <tr>
                          <td className="p-1 font-mono text-indigo-400">nisn</td>
                          <td className="p-1 text-slate-450 text-slate-400">Opsional</td>
                          <td className="p-1">10 digit nomor NISN.</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <div className="text-[10px] text-slate-400 pt-1 flex justify-between items-center">
                    <span>💡 Unduh Contoh Format CSV:</span>
                    <span 
                      onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,id,name,email,kelas,jurusan,nisn\nsiswa102,Alexander Graham,alex@siswa.sch.id,XII DKV 1,DKV,0092837482\nsiswa103,Niels Bohr,bohr@siswa.sch.id,XII MO 2,MO,0081736281";
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "template_biodata_asesi.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                        toast.success('Template CSV berhasil diunduh!');
                      }}
                      className="text-indigo-400 hover:underline cursor-pointer font-bold text-xs"
                    >
                      [Unduh File Template .CSV]
                    </span>
                  </div>
                </div>
              )}

              {/* MANUAL ADD STUDENT FORM */}
              {showAddForm && (
                <div className="p-4 bg-[#1e293b]/60 rounded-xl border border-indigo-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <UserPlus className="h-4 w-4 text-indigo-400" /> Formulir Tambah Siswa Baru (Asesi)
                  </h4>
                  <form onSubmit={handleAddStudentSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">ID Pengguna (Username)</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: siswa102"
                          value={newStudentId}
                          onChange={(e) => setNewStudentId(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, ''))}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Achmad Fauzan"
                          value={newStudentName}
                          onChange={(e) => setNewStudentName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Alamat Surel (Email)</label>
                        <input
                          type="email"
                          required
                          placeholder="contoh: fauzan@siswa.sch.id"
                          value={newStudentEmail}
                          onChange={(e) => setNewStudentEmail(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">NISN (10 Digit)</label>
                        <input
                          type="text"
                          placeholder="contoh: 0092837482"
                          value={newStudentNisn}
                          onChange={(e) => setNewStudentNisn(e.target.value.replace(/[^0-9]/g, ''))}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Kelas</label>
                        <input
                          type="text"
                          placeholder="contoh: XII DKV 2"
                          value={newStudentKelas}
                          onChange={(e) => setNewStudentKelas(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Kurikulum Kompetensi (Jurusan)</label>
                        <select
                          value={newStudentJurusan}
                          onChange={(e) => setNewStudentJurusan(e.target.value as any)}
                          className="w-full p-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        >
                          <option value="DKV">DKV (Desain Komunikasi Visual)</option>
                          <option value="MK">MK (Mesin Kapal)</option>
                          <option value="MO">MO (Mekanik Otomotif)</option>
                          <option value="TL">TL (Teknik Listrik)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Simpan Asesi
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Student Modal Overlay */}
              {editingStudent && (
                <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-[#1e293b] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setEditingStudent(null)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit className="h-4 w-4 text-amber-500" /> Edit Biodata Asesi
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Mengubah data untuk ID: <span className="font-mono text-indigo-400 font-bold">{editingStudent.id}</span></p>
                    </div>

                    <form onSubmit={handleUpdateStudentSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap</label>
                        <input
                          type="text"
                          required
                          value={editStudentName}
                          onChange={(e) => setEditStudentName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Surel (Email)</label>
                        <input
                          type="email"
                          required
                          value={editStudentEmail}
                          onChange={(e) => setEditStudentEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">NISN</label>
                          <input
                            type="text"
                            value={editStudentNisn}
                            onChange={(e) => setEditStudentNisn(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Kelas</label>
                          <input
                            type="text"
                            value={editStudentKelas}
                            onChange={(e) => setEditStudentKelas(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                            placeholder="contoh: XII DKV 2"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Kompetensi Keahlian (Jurusan)</label>
                        <select
                          value={editStudentJurusan}
                          onChange={(e) => setEditStudentJurusan(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        >
                          <option value="DKV">DKV (Visual)</option>
                          <option value="MK">MK (Mesin Kapal)</option>
                          <option value="MO">MO (Otomotif)</option>
                          <option value="TL">TL (Listrik)</option>
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingStudent(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Students Grid - loaded with 101 candidates */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {filteredStudents.map(student => (
                  <div key={student.id} className="p-3 bg-[#0f172a]/40 rounded-xl border border-slate-800/80 hover:border-slate-700/80 transition-all flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-x-1.5 gap-y-0.5">
                        <span className="text-[10px] uppercase font-bold tracking-wider font-mono text-indigo-400">
                          {student.id}
                        </span>
                        <span className="text-[10px] text-slate-600">•</span>
                        <span className="text-[10px] text-slate-500 font-mono truncate max-w-[130px]" title={student.email}>
                          {student.email}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold text-white leading-tight">
                        {student.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        NISN: {student.nisn || '-'}
                      </p>
                      <div className="flex gap-1.5 pt-1">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-bold">
                          {student.kelas || 'N/A'}
                        </span>
                        <span className="px-1.5 py-0.5 rounded bg-slate-850 bg-slate-800 text-slate-300 text-[10px] font-bold">
                          Jurusan {student.jurusan}
                        </span>
                      </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-1 shrink-0 ml-2">
                      <button
                        onClick={() => handleEditStudentClick(student)}
                        className="p-1.5 bg-slate-800/80 hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                        title="Edit Biodata"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteStudentClick(student.id, student.name)}
                        className="p-1.5 bg-slate-800/80 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                        title="Hapus Asesi"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: CREATE SCHEMA */}
          {activeTab === 'schemes' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Skema Sertifikasi Kompetensi</h3>
                  <p className="text-xs text-slate-400">Total terdaftar: {state.schemes.length} skema sertifikasi BNSP</p>
                </div>

                <button
                  onClick={() => { setShowAddSchemeForm(!showAddSchemeForm); setEditingScheme(null); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${showAddSchemeForm ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400'}`}
                >
                  <Plus className="h-4 w-4" />
                  {showAddSchemeForm ? 'Tutup Formulir' : 'Tambah Skema Baru'}
                </button>
              </div>

              {/* Toggleable add scheme form */}
              {showAddSchemeForm && (
                <div className="p-5 bg-[#1e293b]/60 rounded-xl border border-indigo-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <Plus className="h-4 w-4 text-indigo-400" /> Formulir Tambah Skema Sertifikasi Baru
                  </h4>
                  <form onSubmit={handleCreateScheme} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Skema</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: SKM-DKV-03"
                          value={newSchemeCode}
                          onChange={(e) => setNewSchemeCode(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Skema Sertifikasi</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Pembuat Asset Animasi 3D"
                          value={newSchemeName}
                          onChange={(e) => setNewSchemeName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Kompetensi (Jurusan)</label>
                        <select
                          value={newSchemeJurusan}
                          onChange={(e) => setNewSchemeJurusan(e.target.value as any)}
                          className="w-full p-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        >
                          <option value="DKV">DKV (Desain Komunikasi Visual)</option>
                          <option value="MK">MK (Mesin Kapal)</option>
                          <option value="MO">MO (Otomotif)</option>
                          <option value="TL">TL (Listrik)</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Jumlah Unit Kompetensi</label>
                        <input
                          type="number"
                          required
                          min={1}
                          max={20}
                          value={newSchemeUnits}
                          onChange={(e) => setNewSchemeUnits(Number(e.target.value))}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Tambahan / Cakupan Uji</label>
                      <textarea
                        rows={3}
                        placeholder="Uraikan kriteria kompetensi, materi uji coba praktik, dsb..."
                        value={newSchemeDesc}
                        onChange={(e) => setNewSchemeDesc(e.target.value)}
                        className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                      />
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setShowAddSchemeForm(false)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Simpan Skema
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Scheme Overlay Modal */}
              {editingScheme && (
                <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
                  <div className="bg-[#1e293b] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative">
                    <button
                      onClick={() => setEditingScheme(null)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit className="h-4 w-4 text-amber-500" /> Edit Skema Kompetensi
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Mengubah data skema: <span className="font-mono text-indigo-400 font-bold">{editingScheme.code}</span></p>
                    </div>

                    <form onSubmit={handleUpdateSchemeSubmit} className="space-y-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Kode Skema</label>
                        <input
                          type="text"
                          required
                          value={editSchemeCode}
                          onChange={(e) => setEditSchemeCode(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Skema Sertifikasi</label>
                        <input
                          type="text"
                          required
                          value={editSchemeName}
                          onChange={(e) => setEditSchemeName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none font-medium"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Mata Jurusan</label>
                          <select
                            value={editSchemeJurusan}
                            onChange={(e) => setEditSchemeJurusan(e.target.value as any)}
                            className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none text-white"
                          >
                            <option value="DKV">DKV (Visual)</option>
                            <option value="MK">MK (Mesin Kapal)</option>
                            <option value="MO">MO (Otomotif)</option>
                            <option value="TL">TL (Listrik)</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold text-slate-400 mb-1">Jumlah Unit</label>
                          <input
                            type="number"
                            required
                            min={1}
                            value={editSchemeUnits}
                            onChange={(e) => setEditSchemeUnits(Number(e.target.value))}
                            className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none text-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Deskripsi Tambahan / Cakupan Uji</label>
                        <textarea
                          rows={3}
                          value={editSchemeDesc}
                          onChange={(e) => setEditSchemeDesc(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none text-white"
                        />
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingScheme(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Grid of Schemes */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[500px] overflow-y-auto pr-1">
                {state.schemes.map(scheme => (
                  <div key={scheme.id} className="p-4 bg-[#0f1720]/80 rounded-xl border border-slate-800/85 hover:border-slate-705/85 transition-all flex justify-between items-start gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 text-[10px] font-mono font-bold uppercase border border-indigo-500/10">
                          {scheme.jurusan}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono font-semibold">
                          {scheme.code}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white leading-tight">{scheme.name}</h4>
                      <p className="text-xs text-slate-300 leading-relaxed font-normal select-text">
                        {scheme.description || 'Tidak ada deskripsi skema kompetensi.'}
                      </p>
                      <div className="flex gap-1.5 pt-1">
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-mono font-semibold">
                          📝 {scheme.unitsCount} Unit Kompetensi
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-1 shrink-0">
                      <button
                        onClick={() => handleEditSchemeClick(scheme)}
                        className="p-1.5 bg-[#1e293b] hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                        title="Edit Skema"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteSchemeClick(scheme.id, scheme.name)}
                        className="p-1.5 bg-[#1e293b] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                        title="Hapus Skema"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: ASSESSOR PORTFOLIO */}
          {activeTab === 'assessors' && (
            <div className="space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <h3 className="text-lg font-bold text-white">Daftar Tim Asesor Penguji</h3>
                  <p className="text-xs text-slate-400">Total terdaftar: {state.assessors.length} guru penguji asesor terlisensi</p>
                </div>

                <button
                  onClick={() => { setShowAddAssessorForm(!showAddAssessorForm); setEditingAssessor(null); }}
                  className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${showAddAssessorForm ? 'bg-indigo-600 text-white' : 'bg-slate-800 hover:bg-slate-700 text-indigo-400'}`}
                >
                  <Plus className="h-4 w-4" />
                  {showAddAssessorForm ? 'Tutup Formulir' : 'Tambah Asesor Baru'}
                </button>
              </div>

              {/* Toggleable Add Assessor Form */}
              {showAddAssessorForm && (
                <div className="p-5 bg-[#1e293b]/60 rounded-xl border border-indigo-500/20 space-y-3">
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5 pb-2 border-b border-slate-800">
                    <Plus className="h-4 w-4 text-indigo-400" /> Formulir Tambah Asesor Berlisensi Baru
                  </h4>
                  <form onSubmit={handleAddAssessorSubmit} className="space-y-3">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Username / ID Login</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: budihartono"
                          value={newAssessorId}
                          onChange={(e) => setNewAssessorId(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap & Gelar</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: Ir. Budi Hartono, M.T"
                          value={newAssessorName}
                          onChange={(e) => setNewAssessorName(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">No. Registrasi (MET / BNSP)</label>
                        <input
                          type="text"
                          required
                          placeholder="contoh: MET-2026-0034"
                          value={newAssessorRegNumber}
                          onChange={(e) => setNewAssessorRegNumber(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Surel Resmi (Email)</label>
                        <input
                          type="email"
                          required
                          placeholder="contoh: budi@lsp.smk.id"
                          value={newAssessorEmail}
                          onChange={(e) => setNewAssessorEmail(e.target.value)}
                          className="w-full px-3 py-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Keahlian (Mata Jurusan)</label>
                        <select
                          value={newAssessorJurusan}
                          onChange={(e) => setNewAssessorJurusan(e.target.value as any)}
                          className="w-full p-1.5 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        >
                          <option value="DKV">DKV (Visual)</option>
                          <option value="MK">MK (Mesin Kapal)</option>
                          <option value="MO">MO (Otomotif)</option>
                          <option value="TL">TL (Listrik)</option>
                        </select>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end pt-2 border-t border-slate-800/60">
                      <button
                        type="button"
                        onClick={() => setShowAddAssessorForm(false)}
                        className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-705 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Batal
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                      >
                        Simpan Asesor
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Edit Assessor Overlay Modal */}
              {editingAssessor && (
                <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
                  <div className="bg-[#1e293b] border border-slate-800 w-full max-w-md rounded-2xl shadow-2xl p-6 relative font-sans">
                    <button
                      onClick={() => setEditingAssessor(null)}
                      className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
                    >
                      <X className="h-5 w-5" />
                    </button>
                    
                    <div className="mb-4">
                      <h3 className="text-base font-bold text-white flex items-center gap-2">
                        <Edit className="h-4 w-4 text-amber-500" /> Edit Asesor Terlisensi
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">Mengubah data penguji: <span className="font-mono text-indigo-400 font-bold">{editingAssessor.id}</span></p>
                    </div>

                    <form onSubmit={handleUpdateAssessorSubmit} className="space-y-4 font-sans">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Nama Lengkap & Gelar</label>
                        <input
                          type="text"
                          required
                          value={editAssessorName}
                          onChange={(e) => setEditAssessorName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none font-medium"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">No. Registrasi (BNSP)</label>
                        <input
                          type="text"
                          required
                          value={editAssessorRegNumber}
                          onChange={(e) => setEditAssessorRegNumber(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Alamat Surel (Email)</label>
                        <input
                          type="email"
                          required
                          value={editAssessorEmail}
                          onChange={(e) => setEditAssessorEmail(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 mb-1">Keahlian (Mata Jurusan)</label>
                        <select
                          value={editAssessorJurusan}
                          onChange={(e) => setEditAssessorJurusan(e.target.value as any)}
                          className="w-full px-3 py-2 text-xs bg-[#0f172a] border border-slate-800 text-white rounded-lg focus:outline-none text-white animate-none"
                        >
                          <option value="DKV">DKV (Visual)</option>
                          <option value="MK">MK (Mesin Kapal)</option>
                          <option value="MO">MO (Otomotif)</option>
                          <option value="TL">TL (Listrik)</option>
                        </select>
                      </div>

                      <div className="flex gap-2 justify-end pt-3 border-t border-slate-800">
                        <button
                          type="button"
                          onClick={() => setEditingAssessor(null)}
                          className="px-4 py-2 bg-slate-800 hover:bg-slate-705 text-slate-300 font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Batal
                        </button>
                        <button
                          type="submit"
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          Simpan Perubahan
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              {/* Grid of Assessors with Controls */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
                {state.assessors.map(asesor => (
                  <div key={asesor.id} className="p-4 bg-[#0f172a]/40 rounded-xl border border-slate-800 flex items-start justify-between gap-3 hover:border-slate-700 transition-all font-sans">
                    <div className="space-y-1.5 flex-1 select-text">
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
                        <Award className="h-3.5 w-3.5 text-slate-550 text-indigo-400 shrink-0" />
                        <span>No. Registrasi: {asesor.regNumber}</span>
                      </p>
                      <p className="text-xs text-slate-300 flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5 text-slate-555 text-indigo-400 shrink-0" />
                        <span>{asesor.email}</span>
                      </p>
                    </div>

                    <div className="text-right flex flex-col items-end gap-2.5 shrink-0">
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full border ${
                        asesor.active ? 'bg-emerald-955/20 text-emerald-400 border-emerald-500/10' : 'bg-rose-955/20 text-rose-400 border-rose-500/10'
                      }`}>
                        {asesor.active ? 'Aktif Menguji' : 'Berhalangan'}
                      </span>

                      <div className="flex gap-1.5 items-center">
                        <button
                          onClick={() => {
                            toggleAssessorStatus(asesor.id);
                            toast.success(`Status keaktifan ${asesor.name} diperbarui.`);
                          }}
                          className={`px-2.5 py-1 font-semibold rounded-lg text-[10px] cursor-pointer border transition-all ${
                            asesor.active 
                              ? 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-800' 
                              : 'bg-emerald-600 hover:bg-emerald-500 text-white border-transparent'
                          }`}
                          title="Ubah Keaktifan"
                        >
                          {asesor.active ? 'Nonaktifkan' : 'Aktifkan'}
                        </button>
                        
                        <button
                          onClick={() => handleEditAssessorClick(asesor)}
                          className="p-1.5 bg-[#1e293b] hover:bg-amber-500/20 text-slate-400 hover:text-amber-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                          title="Edit Asesor"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        
                        <button
                          onClick={() => handleDeleteAssessorClick(asesor.id, asesor.name)}
                          className="p-1.5 bg-[#1e293b] hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 rounded-lg transition-all focus:outline-none cursor-pointer"
                          title="Hapus Asesor"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      
      {/* Modal Confirmation Custom Delete */}
      {deleteConfirmation && deleteConfirmation.isOpen && (
        <div className="fixed inset-0 bg-[#020617]/85 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in font-sans">
          <div className="bg-[#1e293b] border border-slate-800 w-full max-w-sm rounded-2xl shadow-2xl p-6 relative font-sans text-center">
            <button
              onClick={() => setDeleteConfirmation(null)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-rose-500/10 mb-4">
              <Trash2 className="h-6 w-6 text-rose-500" />
            </div>

            <h3 className="text-base font-bold text-white mb-2">
              Konfirmasi Hapus Data
            </h3>
            
            <p className="text-xs text-slate-300 leading-relaxed mb-6">
              Apakah Anda yakin ingin menghapus{' '}
              <span className="font-semibold text-rose-400">
                {deleteConfirmation.type === 'student' ? 'asesi (siswa)' : deleteConfirmation.type === 'assessor' ? 'asesor penguji' : 'skema uji'}
              </span>{' '}
              <strong className="text-white">"{deleteConfirmation.name}"</strong>? Aksi ini bersifat permanen dan tidak dapat dibatalkan.
            </p>

            <div className="flex gap-3 justify-center">
              <button
                onClick={() => setDeleteConfirmation(null)}
                className="flex-1 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  const { type, id, name } = deleteConfirmation;
                  if (type === 'student') {
                    deleteStudent(id);
                    toast.success(`Asesi ${name} berhasil dihapus.`);
                  } else if (type === 'assessor') {
                    deleteAssessor(id);
                    toast.success(`Asesor ${name} berhasil dihapus.`);
                  } else if (type === 'scheme') {
                    deleteScheme(id);
                    toast.success(`Skema ${name} berhasil dihapus.`);
                  }
                  setDeleteConfirmation(null);
                }}
                className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-xs cursor-pointer transition-colors"
              >
                Ya, Hapus
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
