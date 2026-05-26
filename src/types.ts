/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'asesor' | 'asesi';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  nisn?: string;
  kelas?: string;
  jurusan?: string;
  regNumber?: string; // For Assessor
  photoUrl?: string;
}

export interface Scheme {
  id: string;
  code: string;
  name: string;
  jurusan: 'DKV' | 'MK' | 'MO' | 'TL';
  description: string;
  unitsCount: number;
}

export interface Assessor {
  id: string;
  name: string;
  regNumber: string;
  jurusan: 'DKV' | 'MK' | 'MO' | 'TL';
  email: string;
  active: boolean;
}

export interface Assessment {
  id: string;
  asesiId: string;
  asesiName: string;
  kelas: string;
  jurusan: 'DKV' | 'MK' | 'MO' | 'TL';
  skemaId: string;
  skemaName: string;
  asesorId: string | null; // Assigned Assessor
  asesorName: string | null;
  tanggalUjian: string;
  status: 'PENDING' | 'REVISI' | 'VALIDATED' | 'APPROVED' | 'COMPLETED';
  hasil: 'K' | 'BK' | null; // K = Kompeten, BK = Belum Kompeten, null = Belum Dinilai
  catatanAsesor?: string;
  apl01Link?: string;
  apl02Link?: string;
  updatedAt: string;
}

export interface LSPNotification {
  id: string;
  userId: string; // Student ID
  message: string;
  type: 'status_change' | 'feedback' | 'assigned';
  assessmentId: string;
  assessmentName: string;
  read: boolean;
  createdAt: string;
}

