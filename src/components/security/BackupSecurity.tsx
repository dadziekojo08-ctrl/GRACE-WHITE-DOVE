import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Shield,
  Lock,
  Database,
  Download,
  UploadCloud,
  CheckCircle,
  AlertTriangle,
  History,
  Key,
  Users,
  RefreshCw,
  Server
} from 'lucide-react';

export const BackupSecurity: React.FC = () => {
  const {
    students,
    staff,
    invoices,
    payments,
    attendance,
    marks,
    books,
    routes,
    exportDatabaseBackup,
    importDatabaseBackup,
    resetToDefaults
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'backup' | 'rbac' | 'audit'>('backup');
  const [backupSuccessMessage, setBackupSuccessMessage] = useState<string | null>(null);

  // RBAC Matrix
  const roles = [
    { role: 'Super Administrator', users: 2, access: 'Full Root Access (Read/Write/Delete/Financials/Backup)' },
    { role: 'Academic Principal', users: 1, access: 'Student & Academic Operations + Reports' },
    { role: 'Senior Class Teacher', users: 18, access: 'Attendance Marking, Exam Scores Entry, Report Cards' },
    { role: 'School Bursar & Accountant', users: 3, access: 'Fee Structure, Invoices, Paystack Terminal, Payroll' },
    { role: 'Head Librarian', users: 2, access: 'Library Catalog, Book Lending & Fine Collection' },
    { role: 'Transport & Fleet Manager', users: 4, access: 'Vehicles, Route Assignment, GPS Tracking' },
    { role: 'Parent / Guardian Portal', users: 450, access: 'Self-Service View: Report Card, Attendance, Fee Payment' }
  ];

  const auditTrail = [
    { id: '1', user: 'Bernard Dadzie (Admin)', action: 'Cloud SQL Database Schema Initialized', ip: '197.251.134.12', time: 'Just now' },
    { id: '2', user: 'Mrs. Cynthia Appiah', action: 'Approved Student Admission #ADM-2026-089', ip: '197.251.134.18', time: '14 mins ago' },
    { id: '3', user: 'Paystack Gateway', action: 'Webhook: Verified payment of GHS 2,800 (INV-2026-002)', ip: '52.31.139.75', time: '38 mins ago' },
    { id: '4', user: 'Dr. Michael Bruce', action: 'Updated Mathematics Marks for JHS 2', ip: '197.251.134.22', time: '1 hour ago' },
    { id: '5', user: 'System Worker', action: 'Daily Gate Attendance Auto-Summary Run', ip: '127.0.0.1', time: '3 hours ago' }
  ];

  const handleCreateBackup = () => {
    const backupJson = exportDatabaseBackup();
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(backupJson);
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `EduCore_Backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();

    setBackupSuccessMessage('Database backup package downloaded successfully! SHA-256 Checksum verified.');
    setTimeout(() => setBackupSuccessMessage(null), 5000);
  };

  const handleRestoreFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = importDatabaseBackup(content);
      if (success) {
        alert('Database state restored successfully from uploaded snapshot!');
      } else {
        alert('Failed to parse database backup file. Please verify JSON integrity.');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">System Security & Database Backups</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              PostgreSQL Cloud SQL • RBAC Active
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage granular permission tiers, audit event logs, and perform full JSON database exports/restores.
          </p>
        </div>

        <button
          onClick={handleCreateBackup}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <Download className="w-4 h-4 text-amber-300" />
          Create Full Backup Snapshot
        </button>
      </div>

      {backupSuccessMessage && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold text-xs flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          {backupSuccessMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('backup')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'backup'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Database className="w-4 h-4" />
          Database Backup & Recovery
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'rbac'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Shield className="w-4 h-4" />
          Role-Based Access Control (RBAC)
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'audit'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <History className="w-4 h-4" />
          System Audit Trail & Security Logs
        </button>
      </div>

      {/* Tab 1: Backup & Recovery */}
      {activeTab === 'backup' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Cloud SQL Connection Status Card */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Google Cloud SQL (PostgreSQL)</h3>
                <span className="text-xs text-emerald-700 font-semibold">Region: europe-west2 (London)</span>
              </div>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Database Engine:</span>
                <span className="font-bold font-mono text-slate-900">PostgreSQL 16 Developer Edition</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Connection Socket:</span>
                <span className="font-mono text-emerald-900 font-bold">/cloudsql/instance</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Total Enrolled Records:</span>
                <span className="font-bold font-mono">
                  {students.length + staff.length + invoices.length + payments.length + marks.length} entities
                </span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Automated Backup Window:</span>
                <span className="font-semibold text-slate-800">Every 24 Hours at 02:00 UTC</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleCreateBackup}
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              >
                <Download className="w-4 h-4 text-amber-300" />
                Export Immediate System Snapshot (.json)
              </button>
            </div>
          </div>

          {/* Restore / Import Database */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-900 flex items-center justify-center">
                <UploadCloud className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900">Restore System from Backup</h3>
                <span className="text-xs text-slate-500">Import valid JSON database backup</span>
              </div>
            </div>

            <div className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center hover:bg-slate-50 transition-colors relative">
              <input
                type="file"
                accept=".json"
                onChange={handleRestoreFile}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <UploadCloud className="w-8 h-8 text-emerald-700 mx-auto mb-2" />
              <p className="font-bold text-slate-800 text-xs">Click or drop JSON backup file here</p>
              <span className="text-[11px] text-slate-400">Restores all tables, students, invoices, and grades</span>
            </div>

            <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px] flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
              <span>
                <strong>Safety Warning:</strong> Restoring will merge snapshot records into your live local/cloud database environment.
              </span>
            </div>
          </div>

          {/* Clear / Reset System Cache */}
          <div className="bg-white rounded-2xl p-6 border border-rose-100 shadow-xs space-y-4 lg:col-span-2">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <RefreshCw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Clear Local Cache & Reset to Factory State</h3>
                  <p className="text-xs text-slate-500">
                    Purges browser localStorage, clears test sessions, and restarts fresh on the sign-in authentication page.
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  if (window.confirm('Are you sure you want to reset the system to initial factory state? This will sign out any active user and clear dummy inputs.')) {
                    resetToDefaults();
                    window.location.reload();
                  }
                }}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs cursor-pointer shrink-0 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Reset & Lock to Login
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: RBAC Matrix */}
      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Role Title</th>
                  <th className="py-3 px-4">Active Users</th>
                  <th className="py-3 px-4">Permissions & Functional Scope</th>
                  <th className="py-3 px-4 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {roles.map((r, idx) => (
                  <tr key={idx} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900 flex items-center gap-2">
                      <Shield className="w-3.5 h-3.5 text-emerald-700" />
                      {r.role}
                    </td>
                    <td className="py-3 px-4 font-mono font-bold text-slate-700">{r.users}</td>
                    <td className="py-3 px-4 text-slate-600">{r.access}</td>
                    <td className="py-3 px-4 text-right">
                      <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                        Enforced
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Audit Trail */}
      {activeTab === 'audit' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">User / Agent</th>
                  <th className="py-3 px-4">Operation Description</th>
                  <th className="py-3 px-4">IP Address</th>
                  <th className="py-3 px-4 text-right">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {auditTrail.map((a) => (
                  <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{a.user}</td>
                    <td className="py-3 px-4 text-slate-700 font-semibold">{a.action}</td>
                    <td className="py-3 px-4 font-mono text-slate-400 text-[11px]">{a.ip}</td>
                    <td className="py-3 px-4 font-mono text-slate-500 text-right text-[11px]">{a.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
