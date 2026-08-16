import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdmissionApplication } from '../../types';
import {
  UserPlus,
  CheckCircle,
  Clock,
  Calendar,
  XCircle,
  FileText,
  UserCheck,
  Search,
  Filter,
  Plus,
  X,
  Printer,
  ChevronRight
} from 'lucide-react';

export const AdmissionManagement: React.FC = () => {
  const { admissions, addAdmission, updateAdmissionStatus } = useSchool();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Form State
  const [form, setForm] = useState<{
    applicantName: string;
    gender: 'Male' | 'Female';
    dateOfBirth: string;
    appliedClass: string;
    parentName: string;
    parentEmail: string;
    parentPhone: string;
    previousSchool: string;
    notes: string;
  }>({
    applicantName: '',
    gender: 'Male',
    dateOfBirth: '',
    appliedClass: 'Primary 1 (Grade 1)',
    parentName: '',
    parentEmail: '',
    parentPhone: '',
    previousSchool: '',
    notes: ''
  });

  const filteredAdmissions = admissions.filter((a) => {
    return selectedStatus === 'all' || a.status === selectedStatus;
  });

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    addAdmission({
      ...form,
      status: 'Pending',
      notes: form.notes || 'New application submitted via admission portal.'
    });
    setIsApplyModalOpen(false);
    setForm({
      applicantName: '',
      gender: 'Male',
      dateOfBirth: '',
      appliedClass: 'Primary 1 (Grade 1)',
      parentName: '',
      parentEmail: '',
      parentPhone: '',
      previousSchool: '',
      notes: ''
    });
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">Pending Review</span>;
      case 'Interview Scheduled':
        return <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded text-[10px]">Interview Set</span>;
      case 'Approved':
        return <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">Approved</span>;
      case 'Enrolled':
        return <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[10px]">Enrolled & Active</span>;
      case 'Rejected':
        return <span className="bg-red-100 text-red-800 font-bold px-2 py-0.5 rounded text-[10px]">Declined</span>;
      default:
        return <span className="bg-slate-100 text-slate-800 font-bold px-2 py-0.5 rounded text-[10px]">{status}</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Admission Management</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              2026/2027 Admissions Open
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Review online applications, schedule entrance interviews, and automatically enroll students.
          </p>
        </div>

        <button
          onClick={() => setIsApplyModalOpen(true)}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          Create Application
        </button>
      </div>

      {/* Pipeline Status Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div
          onClick={() => setSelectedStatus('all')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStatus === 'all'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-slate-500 block">Total Applications</span>
          <span className="text-xl font-black text-slate-900">{admissions.length}</span>
        </div>
        <div
          onClick={() => setSelectedStatus('Pending')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStatus === 'Pending'
              ? 'bg-amber-50 border-amber-400 ring-2 ring-amber-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-amber-800 block">Pending Review</span>
          <span className="text-xl font-black text-amber-900">
            {admissions.filter((a) => a.status === 'Pending').length}
          </span>
        </div>
        <div
          onClick={() => setSelectedStatus('Interview Scheduled')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStatus === 'Interview Scheduled'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-700 block">Interviews Scheduled</span>
          <span className="text-xl font-black text-blue-900">
            {admissions.filter((a) => a.status === 'Interview Scheduled').length}
          </span>
        </div>
        <div
          onClick={() => setSelectedStatus('Approved')}
          className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
            selectedStatus === 'Approved'
              ? 'bg-emerald-50 border-emerald-400 ring-2 ring-emerald-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-emerald-700 block">Approved & Ready</span>
          <span className="text-xl font-black text-emerald-800">
            {admissions.filter((a) => a.status === 'Approved').length}
          </span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3.5 px-4">Application #</th>
                <th className="py-3.5 px-4">Applicant Name</th>
                <th className="py-3.5 px-4">Applied Class</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Exam Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map((adm) => (
                <tr key={adm.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-emerald-950">{adm.applicationNo}</td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{adm.applicantName}</span>
                    <span className="text-[11px] text-slate-400">{adm.gender} • DOB: {adm.dateOfBirth}</span>
                  </td>
                  <td className="py-3 px-4 font-semibold text-slate-800">{adm.appliedClass}</td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{adm.parentName}</div>
                    <div className="text-[11px] text-slate-400">{adm.parentPhone}</div>
                  </td>
                  <td className="py-3 px-4">
                    {adm.entranceExamScore ? (
                      <span className="font-bold font-mono text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                        {adm.entranceExamScore}%
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[11px]">Pending Test</span>
                    )}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(adm.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {adm.status === 'Pending' && (
                        <button
                          onClick={() => updateAdmissionStatus(adm.id, 'Interview Scheduled')}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px]"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {adm.status === 'Interview Scheduled' && (
                        <button
                          onClick={() => updateAdmissionStatus(adm.id, 'Approved')}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px]"
                        >
                          Approve Admission
                        </button>
                      )}
                      {adm.status === 'Approved' && (
                        <button
                          onClick={() => updateAdmissionStatus(adm.id, 'Enrolled')}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 text-emerald-950 hover:bg-amber-300 font-bold text-[11px] shadow-xs"
                        >
                          Enroll as Student
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAdmission(adm)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold"
                        title="View Application Details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Admission Application Review</h3>
                <p className="text-xs text-emerald-200">{selectedAdmission.applicationNo}</p>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-2">
                <div className="flex justify-between"><span className="text-slate-500">Applicant:</span><span className="font-bold text-slate-900">{selectedAdmission.applicantName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Gender & DOB:</span><span className="font-semibold">{selectedAdmission.gender} • {selectedAdmission.dateOfBirth}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Applied Class:</span><span className="font-semibold text-emerald-800">{selectedAdmission.appliedClass}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Previous School:</span><span className="font-semibold">{selectedAdmission.previousSchool || 'N/A'}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Guardian Name:</span><span className="font-semibold">{selectedAdmission.parentName}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Guardian Contact:</span><span className="font-semibold">{selectedAdmission.parentPhone} • {selectedAdmission.parentEmail}</span></div>
                <div className="flex justify-between"><span className="text-slate-500">Exam Score:</span><span className="font-bold text-emerald-800">{selectedAdmission.entranceExamScore || 'Awaiting Test'}%</span></div>
              </div>

              {selectedAdmission.notes && (
                <div>
                  <h4 className="font-bold text-slate-800 mb-1">Administrative Notes:</h4>
                  <p className="p-3 bg-amber-50/70 border border-amber-200 rounded-lg text-amber-900 leading-relaxed">
                    {selectedAdmission.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  onClick={() => setSelectedAdmission(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Application Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">New Admission Form</h3>
                <p className="text-xs text-emerald-200">Submit an application for student admission</p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="e.g. David Addo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={form.gender}
                    onChange={(e) => setForm({ ...form, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applying for Class</label>
                  <select
                    value={form.appliedClass}
                    onChange={(e) => setForm({ ...form, appliedClass: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1)</option>
                    <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4)</option>
                    <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6)</option>
                    <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7)</option>
                    <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8)</option>
                    <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9)</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Previous School Attended</label>
                  <input
                    type="text"
                    value={form.previousSchool}
                    onChange={(e) => setForm({ ...form, previousSchool: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. St. Jude Academy"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                <input
                  type="text"
                  required
                  value={form.parentName}
                  onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="e.g. Marcus Addo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Phone (WhatsApp) *</label>
                  <input
                    type="text"
                    required
                    value={form.parentPhone}
                    onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="+233 24 000 0000"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Parent Email</label>
                  <input
                    type="email"
                    value={form.parentEmail}
                    onChange={(e) => setForm({ ...form, parentEmail: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="parent@gmail.com"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm"
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
