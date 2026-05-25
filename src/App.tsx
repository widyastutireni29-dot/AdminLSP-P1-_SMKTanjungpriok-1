/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { useLSPStore } from './store/lspStore';
import LoginScreen from './components/LoginScreen';
import AdminDashboard from './components/AdminDashboard';
import AsesiDashboard from './components/AsesiDashboard';
import AsesorDashboard from './components/AsesorDashboard';
import LoggingConsole from './components/LoggingConsole';
import { Toaster, toast } from 'react-hot-toast';
import { LogOut, Sun, Moon, Shield, School, UserCircle, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  const { state, logout, toggleDarkMode } = useLSPStore();

  const handleLogoutClick = () => {
    logout();
    toast.success('Anda berhasil keluar dari Portal LSP.');
  };

  // If no user is logged in, show the login screen
  if (!state.currentUser) {
    return (
      <div className={state.darkMode ? 'dark' : ''}>
        <LoginScreen />
        <Toaster position="top-right" />
      </div>
    );
  }

  // Get active dashboard component based on parsed role
  const renderDashboard = () => {
    switch (state.currentUser?.role) {
      case 'admin':
        return <AdminDashboard />;
      case 'asesor':
        return <AsesorDashboard />;
      case 'asesi':
        return <AsesiDashboard />;
      default:
        return (
          <div className="text-center py-12 text-slate-500">
            Peran akses tidak dikenali. Silakan hubungi Administrator LSP.
          </div>
        );
    }
  };

  return (
    <div className={state.darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-[#0f172a] text-slate-200 transition-colors duration-300 pb-12 font-sans">
        <Toaster position="top-right" />

        {/* Global Nav Bar (Sleek Interface Style) */}
        <header className="sticky top-0 z-40 w-full bg-[#1e293b]/80 backdrop-blur-md border-b border-slate-800/80 transition-colors">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            
            {/* Left Brand info */}
            <div className="flex items-center gap-3">
              <div className="h-9 w-9 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow shadow-indigo-500/20">
                <Shield className="h-5 w-5 stroke-[1.5]" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-tight text-white leading-tight">
                  SistemAdmin<span className="text-indigo-400">LSP</span>
                </h1>
                <p className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
                  <School className="h-3 w-3 text-indigo-400" /> SMK Tanjung Priok Jakarta
                </p>
              </div>
            </div>

            {/* Right Tools & User Info */}
            <div className="flex items-center gap-4">
              
              {/* Connection Status Badge */}
              <div className="hidden sm:flex items-center bg-[#0f172a]/50 px-3 py-1.5 rounded-full border border-slate-800">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-2 shadow-[0_0_8px_#34d399]"></div>
                <span className="text-[9px] font-bold text-slate-300 uppercase tracking-widest font-mono">Firebase Linked</span>
              </div>

              {/* Active user info pill */}
              <div className="hidden md:flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-[#0f172a]/50 border border-slate-800">
                <UserCircle className="h-5 w-5 text-indigo-400 shrink-0" />
                <div className="text-left text-xs leading-none">
                  <span className="block font-bold text-white">{state.currentUser.name}</span>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-indigo-400 mt-1 block">
                    Role: {state.currentUser.role}
                  </span>
                </div>
              </div>

              {/* Theme Toggle Button */}
              <button
                onClick={toggleDarkMode}
                className="p-2 rounded-xl text-slate-400 hover:text-white bg-[#0f172a]/50 hover:bg-slate-800 transition-colors border border-slate-800 cursor-pointer"
                aria-label="Toggle dark mode"
              >
                {state.darkMode ? <Sun className="h-4 w-4 text-amber-400" /> : <Moon className="h-4 w-4" />}
              </button>

              {/* Logout Button */}
              <button
                onClick={handleLogoutClick}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-4 text-xs font-bold rounded-xl text-white bg-rose-600 hover:bg-rose-700 cursor-pointer shadow-sm shadow-rose-500/10 transition-colors"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>

          </div>
        </header>

        {/* Dashboard Workspace */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          
          {/* Active User Role Banner (for tablet/mobile sizes) */}
          <div className="md:hidden p-3 bg-[#1e293b] rounded-xl border border-slate-800 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400">Penguna Aktif:</span>
            <span className="text-xs font-bold text-white">
              {state.currentUser.name} <span className="text-indigo-400 uppercase font-mono text-[9px]">({state.currentUser.role})</span>
            </span>
          </div>

          {/* Core active portal screen */}
          <AnimatePresence mode="wait">
            <motion.div
              key={state.currentUser.role}
              initial={{ y: 8, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -8, opacity: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderDashboard()}
            </motion.div>
          </AnimatePresence>

          {/* Synchronization Logging Console (SistemAdminLSP controls) */}
          <LoggingConsole />

        </main>
      </div>
    </div>
  );
}
