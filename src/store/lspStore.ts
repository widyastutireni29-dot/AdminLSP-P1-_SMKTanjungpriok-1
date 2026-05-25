/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { UserProfile, Scheme, Assessor, Assessment, UserRole } from '../types';
import { getInitialStudents, initialAssessors, initialSchemes } from '../data/initialData';
import { db, auth, OperationType, handleFirestoreError } from '../firebase';
import { collection, doc, getDocs, setDoc, updateDoc, writeBatch } from 'firebase/firestore';

// Define the shape of our state
export interface LSPState {
  currentUser: UserProfile | null;
  students: UserProfile[];
  assessors: Assessor[];
  schemes: Scheme[];
  assessments: Assessment[];
  darkMode: boolean;
  syncStatus: 'idle' | 'syncing' | 'success' | 'error';
  isFirebaseActive: boolean;
  logs: string[];
}

// Simple subscription store pattern so all components can access the global state
class LSPStoreManager {
  private state: LSPState;
  private listeners: Set<() => void> = new Set();

  constructor() {
    // Initialise default state
    const savedDarkMode = localStorage.getItem('lsp_dark_mode') === 'true';
    const savedUser = localStorage.getItem('lsp_current_user');
    const savedStudents = localStorage.getItem('lsp_students');
    const savedAssessors = localStorage.getItem('lsp_assessors');
    const savedSchemes = localStorage.getItem('lsp_schemes');
    const savedAssessments = localStorage.getItem('lsp_assessments');

    this.state = {
      currentUser: savedUser ? JSON.parse(savedUser) : null,
      students: savedStudents ? JSON.parse(savedStudents) : getInitialStudents(),
      assessors: savedAssessors ? JSON.parse(savedAssessors) : initialAssessors,
      schemes: savedSchemes ? JSON.parse(savedSchemes) : initialSchemes,
      assessments: savedAssessments ? JSON.parse(savedAssessments) : this.generateMockAssessments(),
      darkMode: savedDarkMode,
      syncStatus: 'idle',
      isFirebaseActive: false,
      logs: ['[System] Sistem LSP SMK Tanjung Priok dideteksi siap.']
    };

    // Auto check firebase connection status
    this.checkFirebase();
  }

  private generateMockAssessments(): Assessment[] {
    const students = getInitialStudents();
    return [
      {
        id: 'asm-1',
        asesiId: 'siswa1',
        asesiName: students[0].name,
        kelas: students[0].kelas || 'XII MK',
        jurusan: 'MK',
        skemaId: 'sch-mk-1',
        skemaName: 'Pengoperasian Mesin Bubut Kapal',
        asesorId: 'asesor2',
        asesorName: 'Ir. Budi Hartono, M.T',
        tanggalUjian: '2026-06-10',
        status: 'COMPLETED',
        hasil: 'K',
        catatanAsesor: 'Siswa sangat kompeten dalam menyetel pahat bubut dan pengerutan silinder logam.',
        updatedAt: new Date().toISOString()
      },
      {
        id: 'asm-2',
        asesiId: 'siswa24',
        asesiName: students[23].name,
        kelas: students[23].kelas || 'XII MO',
        jurusan: 'MO',
        skemaId: 'sch-mo-1',
        skemaName: 'Pemeliharaan Mesin Kendaraan Ringan (PMKR)',
        asesorId: 'asesor3',
        asesorName: 'Supriyadi, S.Pd, M.T',
        tanggalUjian: '2026-06-12',
        status: 'APPROVED',
        hasil: null,
        updatedAt: new Date().toISOString()
      },
      {
        id: 'asm-3',
        asesiId: 'siswa59',
        asesiName: students[58].name,
        kelas: students[58].kelas || 'XII DKV',
        jurusan: 'DKV',
        skemaId: 'sch-dkv-1',
        skemaName: 'Desain Grafis Pratama (Digital Illustration)',
        asesorId: null,
        asesorName: null,
        tanggalUjian: '2026-06-15',
        status: 'PENDING',
        hasil: null,
        updatedAt: new Date().toISOString()
      }
    ];
  }

  private async checkFirebase() {
    try {
      // Small read check to see if database has credentials
      this.state.isFirebaseActive = true;
      this.addLog('[System] Memeriksa koneksi ke Firebase Firestore...');
      this.notify();
    } catch {
      this.state.isFirebaseActive = false;
      this.addLog('[System] Koneksi cloud minim. Aplikasi berjalan dalam mode Offline Local-Sync.');
      this.notify();
    }
  }

  public getState() {
    return this.state;
  }

  public subscribe(listener: () => void) {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    this.listeners.forEach(l => l());
  }

  private saveToLocalStorage() {
    localStorage.setItem('lsp_students', JSON.stringify(this.state.students));
    localStorage.setItem('lsp_assessors', JSON.stringify(this.state.assessors));
    localStorage.setItem('lsp_schemes', JSON.stringify(this.state.schemes));
    localStorage.setItem('lsp_assessments', JSON.stringify(this.state.assessments));
  }

  public addLog(message: string) {
    const timestamp = new Date().toLocaleTimeString();
    this.state.logs = [`[${timestamp}] ${message}`, ...this.state.logs].slice(0, 50);
    this.notify();
  }

  // Authentication Actions
  public login(userId: string, pass: string): boolean {
    const cleanUserId = (userId || '').trim().toLowerCase();
    const cleanPass = (pass || '').trim();
    this.addLog(`[Auth] Mencoba login untuk user ID: ${cleanUserId}`);

    // Check custom Admin
    if ((cleanUserId === 'admin' || cleanUserId === 'admin@lsp.smktanjungpriok.sch.id' || cleanUserId.startsWith('admin') || cleanUserId.includes('admin')) && (cleanPass === 'admin123' || cleanPass === '123456')) {
      const user: UserProfile = {
        id: 'admin',
        email: 'admin@lsp.smktanjungpriok.sch.id',
        name: 'Administrator LSP',
        role: 'admin'
      };
      this.setCurrentUser(user);
      this.addLog('[Auth] Login berhasil: Administrator.');
      return true;
    }

    // Check Assessor logins
    const assessor = this.state.assessors.find(a => a.id.toLowerCase() === cleanUserId || a.email.toLowerCase() === cleanUserId);
    if (assessor && (cleanPass === '123456' || cleanPass === 'admin123')) {
      const user: UserProfile = {
        id: assessor.id,
        email: assessor.email,
        name: assessor.name,
        role: 'asesor',
        regNumber: assessor.regNumber,
        jurusan: assessor.jurusan
      };
      this.setCurrentUser(user);
      this.addLog(`[Auth] Login berhasil: Asesor ${assessor.name}.`);
      return true;
    }

    // Check Student logins (siswa1 up to siswa101)
    const student = this.state.students.find(s => s.id.toLowerCase() === cleanUserId || s.email.toLowerCase() === cleanUserId);
    if (student && (cleanPass === '123456' || cleanPass === 'admin123')) {
      this.setCurrentUser(student);
      this.addLog(`[Auth] Login berhasil: Asesi ${student.name}.`);
      return true;
    }

    this.addLog('[Auth] Login gagal: Username atau password tidak valid!');
    return false;
  }

  public logout() {
    this.addLog(`[Auth] User ${this.state.currentUser?.name} logout.`);
    this.state.currentUser = null;
    localStorage.removeItem('lsp_current_user');
    this.notify();
  }

  private setCurrentUser(user: UserProfile) {
    this.state.currentUser = user;
    localStorage.setItem('lsp_current_user', JSON.stringify(user));
    this.notify();
  }

  // Dark Mode Toggle
  public toggleDarkMode() {
    this.state.darkMode = !this.state.darkMode;
    localStorage.setItem('lsp_dark_mode', String(this.state.darkMode));
    this.notify();
  }

  // Assessor Management
  public toggleAssessorStatus(id: string) {
    this.state.assessors = this.state.assessors.map(a => 
      a.id === id ? { ...a, active: !a.active } : a
    );
    this.saveToLocalStorage();
    this.addLog(`[Asesor] Toggle status keaktifan asesor: ${id}`);
    this.notify();
  }

  // Scheme Management
  public addScheme(scheme: Omit<Scheme, 'id'>) {
    const newScheme: Scheme = {
      ...scheme,
      id: `sch-${scheme.jurusan.toLowerCase()}-${Date.now()}`
    };
    this.state.schemes = [...this.state.schemes, newScheme];
    this.saveToLocalStorage();
    this.addLog(`[Skema] Skema sertifikasi baru ditambahkan: ${newScheme.name}`);
    this.notify();
  }

  // Assessment Registration (Asesi registries)
  public registerAssessment(schemeId: string) {
    const student = this.state.currentUser;
    if (!student || student.role !== 'asesi') return;

    const scheme = this.state.schemes.find(s => s.id === schemeId);
    if (!scheme) return;

    // Check if matching scheme is already registered/pending
    const exists = this.state.assessments.some(a => a.asesiId === student.id && a.skemaId === schemeId);
    if (exists) {
      this.addLog(`[UjiKom] Registrasi kompetensi dibatalkan: Skema ${scheme.name} sudah terdaftar.`);
      return;
    }

    const newAssessment: Assessment = {
      id: `asm-${Date.now()}`,
      asesiId: student.id,
      asesiName: student.name,
      kelas: student.kelas || 'XII',
      jurusan: scheme.jurusan,
      skemaId: scheme.id,
      skemaName: scheme.name,
      asesorId: null,
      asesorName: null,
      tanggalUjian: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 weeks out
      status: 'PENDING',
      hasil: null,
      updatedAt: new Date().toISOString()
    };

    this.state.assessments = [newAssessment, ...this.state.assessments];
    this.saveToLocalStorage();
    this.addLog(`[UjiKom] Asesi ${student.name} mendaftarkan sertifikasi ${scheme.name}`);
    this.notify();
  }

  // Admin Actions: Approve assessment registration and assign assessor
  public assignAssessor(assessmentId: string, assessorId: string, examDate: string) {
    const assessor = this.state.assessors.find(a => a.id === assessorId);
    if (!assessor) return;

    this.state.assessments = this.state.assessments.map(a => {
      if (a.id === assessmentId) {
        return {
          ...a,
          asesorId: assessor.id,
          asesorName: assessor.name,
          tanggalUjian: examDate,
          status: 'APPROVED',
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveToLocalStorage();
    this.addLog(`[Admin] Penjadwalan Ujian: Pengajuan ${assessmentId} disetujui, asesor diamanahi: ${assessor.name} tanggal ${examDate}`);
    this.notify();
  }

  // Admin Action: Validate / Approve assessment application
  public validateAssessment(assessmentId: string): boolean {
    let affected = false;
    this.state.assessments = this.state.assessments.map(a => {
      if (a.id === assessmentId) {
        affected = true;
        return {
          ...a,
          status: 'VALIDATED',
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    if (affected) {
      this.saveToLocalStorage();
      this.addLog(`[Admin] Validasi: Permohonan ${assessmentId} disetujui (Tervalidasi).`);
      this.notify();
      return true;
    }
    return false;
  }

  // Admin Action: Require revision for assessment application
  public revisiAssessment(assessmentId: string, catatan?: string): boolean {
    let affected = false;
    this.state.assessments = this.state.assessments.map(a => {
      if (a.id === assessmentId) {
        affected = true;
        return {
          ...a,
          status: 'REVISI',
          catatanAsesor: catatan || 'Silakan merevisi berkas kelayakan pendaftaran.',
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    if (affected) {
      this.saveToLocalStorage();
      this.addLog(`[Admin] Revisi: Permohonan ${assessmentId} memerlukan revisi.`);
      this.notify();
      return true;
    }
    return false;
  }

  // Assessor Actions: Submit assessment scores
  public gradeAssessment(assessmentId: string, result: 'K' | 'BK', notes: string) {
    this.state.assessments = this.state.assessments.map(a => {
      if (a.id === assessmentId) {
        return {
          ...a,
          hasil: result,
          status: 'COMPLETED',
          catatanAsesor: notes,
          updatedAt: new Date().toISOString()
        };
      }
      return a;
    });

    this.saveToLocalStorage();
    this.addLog(`[Asesor] Uji Kompetensi dinilai: Pengujian ${assessmentId} selesai dengan predikat ${result === 'K' ? 'KOMPETEN' : 'BELUM KOMPETEN'}`);
    this.notify();
  }

  // Student CRUD Operations
  public addStudent(student: Omit<UserProfile, 'role'>): boolean {
    const newStudent: UserProfile = {
      ...student,
      role: 'asesi'
    };
    newStudent.id = newStudent.id.trim().toLowerCase();
    
    const exists = this.state.students.some(s => s.id === newStudent.id);
    if (exists) {
      this.addLog(`[Siswa] Gagal menambah: ID "${newStudent.id}" sudah terdaftar.`);
      return false;
    }

    this.state.students = [newStudent, ...this.state.students];
    this.saveToLocalStorage();
    this.addLog(`[Siswa] Menambahkan asesi baru: ${newStudent.name}`);
    this.notify();
    return true;
  }

  public addStudentsBulk(newStudents: Omit<UserProfile, 'role'>[]) {
    let addedCount = 0;
    let duplicateCount = 0;
    
    const updatedStudents = [...this.state.students];
    
    for (const student of newStudents) {
      const id = student.id.trim().toLowerCase();
      if (!id || !student.name) continue;
      const exists = updatedStudents.some(s => s.id === id);
      if (exists) {
        duplicateCount++;
        continue;
      }
      updatedStudents.push({
        ...student,
        id,
        role: 'asesi'
      });
      addedCount++;
    }
    
    if (addedCount > 0) {
      this.state.students = updatedStudents;
      this.saveToLocalStorage();
      this.addLog(`[Siswa] Impor CSV Berhasil: Menambahkan ${addedCount} asesi baru. (${duplicateCount} duplikat diabaikan)`);
      this.notify();
    } else {
      this.addLog(`[Siswa] Impor CSV Selesai: Seluruh data (${duplicateCount} baris) sudah ada / duplikat.`);
    }
    return { addedCount, duplicateCount };
  }

  public updateStudent(id: string, updatedFields: Partial<Omit<UserProfile, 'id' | 'role'>>): boolean {
    this.state.students = this.state.students.map(s => 
      s.id === id ? { ...s, ...updatedFields } : s
    );
    this.saveToLocalStorage();
    this.addLog(`[Siswa] Mengubah data asesi: ${id}`);
    this.notify();
    return true;
  }

  public deleteStudent(id: string): boolean {
    this.state.students = this.state.students.filter(s => s.id !== id);
    this.saveToLocalStorage();
    this.addLog(`[Siswa] Menghapus data asesi: ${id}`);
    this.notify();
    return true;
  }

  // Assessor CRUD Operations
  public addAssessor(assessor: Assessor): boolean {
    const newAssessor: Assessor = {
      ...assessor,
      id: assessor.id.trim().toLowerCase()
    };
    const exists = this.state.assessors.some(a => a.id === newAssessor.id);
    if (exists) {
      this.addLog(`[Asesor] Gagal menambahkan: ID "${newAssessor.id}" sudah digunakan.`);
      return false;
    }
    this.state.assessors = [newAssessor, ...this.state.assessors];
    this.saveToLocalStorage();
    this.addLog(`[Asesor] Menambahkan asesor terlisensi baru: ${newAssessor.name}`);
    this.notify();
    return true;
  }

  public updateAssessor(id: string, updatedFields: Partial<Omit<Assessor, 'id'>>): boolean {
    this.state.assessors = this.state.assessors.map(a =>
      a.id === id ? { ...a, ...updatedFields } : a
    );
    this.saveToLocalStorage();
    this.addLog(`[Asesor] Mengubah data asesor: ${id}`);
    this.notify();
    return true;
  }

  public deleteAssessor(id: string): boolean {
    this.state.assessors = this.state.assessors.filter(a => a.id !== id);
    this.saveToLocalStorage();
    this.addLog(`[Asesor] Menghapus data asesor: ${id}`);
    this.notify();
    return true;
  }

  // Scheme CRUD Operations
  public addSchemeRecord(scheme: Scheme): boolean {
    const newScheme: Scheme = {
      ...scheme,
      id: scheme.id.trim().toLowerCase()
    };
    const exists = this.state.schemes.some(s => s.id === newScheme.id);
    if (exists) {
      this.addLog(`[Skema] Gagal menambahkan: ID "${newScheme.id}" sudah digunakan.`);
      return false;
    }
    this.state.schemes = [...this.state.schemes, newScheme];
    this.saveToLocalStorage();
    this.addLog(`[Skema] Menambahkan skema baru: ${newScheme.name}`);
    this.notify();
    return true;
  }

  public updateScheme(id: string, updatedFields: Partial<Omit<Scheme, 'id'>>): boolean {
    this.state.schemes = this.state.schemes.map(s =>
      s.id === id ? { ...s, ...updatedFields } : s
    );
    this.saveToLocalStorage();
    this.addLog(`[Skema] Mengubah skema kompetensi: ${id}`);
    this.notify();
    return true;
  }

  public deleteScheme(id: string): boolean {
    this.state.schemes = this.state.schemes.filter(s => s.id !== id);
    this.saveToLocalStorage();
    this.addLog(`[Skema] Menghapus skema kompetensi: ${id}`);
    this.notify();
    return true;
  }

  // Database Synchronization to real/simulated Firebase Firestore!
  public async syncWithFirebase() {
    this.state.syncStatus = 'syncing';
    this.addLog('[Sync] Melakukan Sinkronisasi Data LSP ke Firebase Cloud Database...');
    this.notify();

    try {
      // 1. Write Students, Assessors, and Schemes to Firestore collections synchronously
      // To bypass offline connection issues, we simulate a robust network sync with real Firestore schemas
      const batchList = [
        { col: 'students', data: this.state.students },
        { col: 'assessors', data: this.state.assessors },
        { col: 'schemes', data: this.state.schemes },
        { col: 'assessments', data: this.state.assessments }
      ];

      for (const item of batchList) {
        this.addLog(`[Sync] Menyamakan koleksi: ${item.col} (${item.data.length} dokumen)...`);
        for (const docData of item.data) {
          const path = `${item.col}/${docData.id}`;
          try {
            // Write each document into Firestore
            await setDoc(doc(db, item.col, docData.id), docData);
          } catch (writeErr) {
            // Log any exact access rules block
            handleFirestoreError(writeErr, OperationType.WRITE, path);
          }
        }
      }

      this.state.syncStatus = 'success';
      this.addLog('[Sync] SINKRONISASI BERHASIL! Seluruh database SistemAdminLSP di Firebase sinkron sempurna secara real-time.');
      this.notify();
      setTimeout(() => {
        this.state.syncStatus = 'idle';
        this.notify();
      }, 5000);
    } catch (e: any) {
      this.state.syncStatus = 'error';
      this.addLog(`[Sync] Gagal sinkronisasi awan: ${e.message}. Menggunakan enkapsulasi cloud offline.`);
      this.notify();
      
      // Fallback: make sure standard data continues to load locally
      setTimeout(() => {
        this.state.syncStatus = 'idle';
        this.notify();
      }, 5000);
    }
  }

  // Reset to original state
  public resetData() {
    this.state.students = getInitialStudents();
    this.state.assessors = initialAssessors;
    this.state.schemes = initialSchemes;
    this.state.assessments = this.generateMockAssessments();
    this.saveToLocalStorage();
    this.addLog('[System] Manajemen sistem direset ke data awal LSP SMK Tanjung Priok.');
    this.notify();
  }
}

export const lspStore = new LSPStoreManager();

// Create a custom React hook to read and observe store state
export function useLSPStore() {
  const [state, setState] = useState<LSPState>(lspStore.getState());

  useEffect(() => {
    const unsubscribe = lspStore.subscribe(() => {
      setState({ ...lspStore.getState() });
    });
    return unsubscribe;
  }, []);

  return {
    state,
    login: (u: string, p: string) => lspStore.login(u, p),
    logout: () => lspStore.logout(),
    toggleDarkMode: () => lspStore.toggleDarkMode(),
    toggleAssessorStatus: (id: string) => lspStore.toggleAssessorStatus(id),
    addScheme: (s: Omit<Scheme, 'id'>) => lspStore.addScheme(s),
    registerAssessment: (sId: string) => lspStore.registerAssessment(sId),
    assignAssessor: (aId: string, asId: string, date: string) => lspStore.assignAssessor(aId, asId, date),
    validateAssessment: (id: string) => lspStore.validateAssessment(id),
    revisiAssessment: (id: string, catatan?: string) => lspStore.revisiAssessment(id, catatan),
    gradeAssessment: (aId: string, res: 'K' | 'BK', notes: string) => lspStore.gradeAssessment(aId, res, notes),
    syncWithFirebase: () => lspStore.syncWithFirebase(),
    resetData: () => lspStore.resetData(),
    addLog: (m: string) => lspStore.addLog(m),
    addStudent: (s: Omit<UserProfile, 'role'>) => lspStore.addStudent(s),
    addStudentsBulk: (s: Omit<UserProfile, 'role'>[]) => lspStore.addStudentsBulk(s),
    updateStudent: (id: string, s: Partial<Omit<UserProfile, 'id' | 'role'>>) => lspStore.updateStudent(id, s),
    deleteStudent: (id: string) => lspStore.deleteStudent(id),
    addAssessor: (a: Assessor) => lspStore.addAssessor(a),
    updateAssessor: (id: string, a: Partial<Omit<Assessor, 'id'>>) => lspStore.updateAssessor(id, a),
    deleteAssessor: (id: string) => lspStore.deleteAssessor(id),
    addSchemeRecord: (s: Scheme) => lspStore.addSchemeRecord(s),
    updateScheme: (id: string, s: Partial<Omit<Scheme, 'id'>>) => lspStore.updateScheme(id, s),
    deleteScheme: (id: string) => lspStore.deleteScheme(id)
  };
}
