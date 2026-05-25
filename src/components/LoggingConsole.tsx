/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { useLSPStore } from '../store/lspStore';
import { Terminal, RefreshCw, Trash2, Wifi, WifiOff } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoggingConsole() {
  const { state, syncWithFirebase, resetData, addLog } = useLSPStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSyncClick = async () => {
    setIsSyncing(true);
    toast.loading('Menghubungkan ke database Firebase...');
    await syncWithFirebase();
    toast.dismiss();
    setIsSyncing(false);
    toast.success('Sinkronisasi cloud SistemAdminLSP tuntas!');
  };

  const handleResetClick = () => {
    if (confirm('Apakah Anda yakin ingin mengatur ulang database Sistem LSP SMK Tanjung Priok ke data asal?')) {
      resetData();
      toast.success('Database diatur ulang.');
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[280px]">
      {/* Console Header */}
      <div className="bg-slate-950/60 px-4 py-2 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-green-500 animate-pulse" />
          <span className="text-xs font-bold text-slate-300 font-mono tracking-wider uppercase">
            Firebase Cloud Sync Controller (SistemAdminLSP)
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Connection badge */}
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold font-mono bg-green-500/10 text-green-400 border border-green-500/20">
            <Wifi className="h-3 w-3" />
            <span>Connected</span>
          </div>

          <button
            onClick={handleSyncClick}
            disabled={isSyncing}
            className="flex items-center gap-1.5 px-2.5 py-1 text-[10px] uppercase tracking-wider font-bold rounded-md bg-indigo-600 hover:bg-indigo-500 text-white font-mono cursor-pointer transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Sync Cloud</span>
          </button>

          <button
            onClick={handleResetClick}
            className="flex items-center gap-1 py-1 px-2 text-[10px] uppercase tracking-wider font-bold rounded-md bg-slate-800 hover:bg-red-950 hover:text-red-300 text-slate-400 font-mono cursor-pointer transition-all border border-slate-700/60"
            title="Reset Database to 101 records"
          >
            <Trash2 className="h-3 w-3" />
            <span>Reset</span>
          </button>
        </div>
      </div>

      {/* Console Body */}
      <div className="p-3 flex-1 overflow-y-auto font-mono text-[11px] text-slate-300 space-y-1 bg-slate-950">
        {state.logs.map((log, index) => {
          let lineClass = 'text-slate-400';
          if (log.includes('[Sync]')) lineClass = 'text-blue-400';
          if (log.includes('[Auth]')) lineClass = 'text-amber-400';
          if (log.includes('BERHASIL')) lineClass = 'text-green-400 font-semibold';
          if (log.includes('[System]')) lineClass = 'text-indigo-400';

          return (
            <div key={index} className={`leading-relaxed border-l-2 pl-2 ${lineClass} border-transparent hover:border-slate-800 hover:bg-slate-900/40 py-0.5`}>
              {log}
            </div>
          );
        })}
      </div>
    </div>
  );
}
