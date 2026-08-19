import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { AdmissionApplication } from '../../types';
import {
  UserPlus,
  CheckCircle,
  CheckCircle2,
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
  ChevronRight,
  Sparkles,
  MapPin,
  Mail,
  Phone,
  User,
  GraduationCap,
  Hash,
  Download,
  BadgeCheck
} from 'lucide-react';

const ALL_CLASSES = [
  'Creche',
  'Nursery 1',
  'Nursery 2',
  'Kindergarten 1 (KG 1)',
  'Kindergarten 2 (KG 2)',
  'Primary 1 (Grade 1)',
  'Primary 2 (Grade 2)',
  'Primary 3 (Grade 3)',
  'Primary 4 (Grade 4)',
  'Primary 5 (Grade 5)',
  'Primary 6 (Grade 6)',
  'JHS 1 (Grade 7)',
  'JHS 2 (Grade 8)',
  'JHS 3 (Grade 9)'
];

export const AdmissionManagement: React.FC = () => {
  const { admissions, addAdmission, updateAdmissionStatus, generateNextStudentNumber, suggestTeacherForClass } = useSchool();

  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedClassFilter, setSelectedClassFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAdmission, setSelectedAdmission] = useState<AdmissionApplication | null>(null);
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);

  // Toast & Enrollment Confirmation Dialog states
  const [toast, setToast] = useState<{ title: string; message: string; type?: 'success' | 'info' } | null>(null);
  const [enrolledStudentDialog, setEnrolledStudentDialog] = useState<{
    studentName: string;
    studentNumber: string;
    className: string;
    enrollmentDate: string;
    parentName: string;
    parentPhone: string;
    parentAddress?: string;
  } | null>(null);

  const showToast = (title: string, message: string, type: 'success' | 'info' = 'success') => {
    setToast({ title, message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleEnrollStudent = (adm: AdmissionApplication) => {
    updateAdmissionStatus(adm.id, 'Enrolled');
    const stdNumber = adm.studentNumber || adm.applicationNo;
    
    // Set enrollment success confirmation dialog
    setEnrolledStudentDialog({
      studentName: adm.applicantName,
      studentNumber: stdNumber,
      className: adm.appliedClass,
      enrollmentDate: adm.enrollmentDate || new Date().toISOString().split('T')[0],
      parentName: adm.parentName,
      parentPhone: adm.parentPhone,
      parentAddress: adm.parentAddress || 'Accra, Ghana'
    });

    // Also trigger toast notification
    showToast(
      'Student Successfully Enrolled!',
      `${adm.applicantName} (${stdNumber}) is now active in ${adm.appliedClass}.`,
      'success'
    );
  };

  // Form State
  const [form, setForm] = useState<{
    studentNumber: string;
    applicantName: string;
    gender: 'Male' | 'Female';
    dateOfBirth: string;
    enrollmentDate: string;
    appliedClass: string;
    parentName: string;
    parentAddress: string;
    parentEmail: string;
    parentPhone: string;
    notes: string;
  }>({
    studentNumber: '',
    applicantName: '',
    gender: 'Male',
    dateOfBirth: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    appliedClass: 'Creche',
    parentName: '',
    parentAddress: '',
    parentEmail: '',
    parentPhone: '',
    notes: ''
  });

  const handleOpenModal = () => {
    setForm({
      studentNumber: '',
      applicantName: '',
      gender: 'Male',
      dateOfBirth: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      appliedClass: 'Creche',
      parentName: '',
      parentAddress: '',
      parentEmail: '',
      parentPhone: '',
      notes: ''
    });
    setIsApplyModalOpen(true);
  };

  const handleGenerateStudentNumber = () => {
    const nextNum = generateNextStudentNumber();
    setForm((prev) => ({ ...prev, studentNumber: nextNum }));
  };

  const filteredAdmissions = admissions.filter((a) => {
    const matchesStatus = selectedStatus === 'all' || a.status === selectedStatus;
    const matchesClass = selectedClassFilter === 'all' || a.appliedClass === selectedClassFilter;
    const matchesSearch =
      searchQuery === '' ||
      a.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.studentNumber && a.studentNumber.toLowerCase().includes(searchQuery.toLowerCase())) ||
      a.applicationNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.parentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.parentPhone.includes(searchQuery);
    return matchesStatus && matchesClass && matchesSearch;
  });

  const handleCreateApplication = (e: React.FormEvent) => {
    e.preventDefault();
    const finalStudentNumber =
      form.studentNumber && form.studentNumber.trim() !== ''
        ? form.studentNumber.trim()
        : generateNextStudentNumber();

    addAdmission({
      studentNumber: finalStudentNumber,
      applicantName: form.applicantName.trim(),
      gender: form.gender,
      dateOfBirth: form.dateOfBirth,
      enrollmentDate: form.enrollmentDate || new Date().toISOString().split('T')[0],
      appliedClass: form.appliedClass,
      parentName: form.parentName.trim(),
      parentAddress: form.parentAddress.trim() || 'Accra, Ghana',
      parentEmail: form.parentEmail.trim() || `${form.applicantName.toLowerCase().replace(/\s+/g, '')}@guardian.edu.gh`,
      parentPhone: form.parentPhone.trim(),
      status: 'Pending',
      notes: form.notes || `Direct application registered with Student ID: ${finalStudentNumber}`
    });

    setIsApplyModalOpen(false);
    showToast(
      'Admission Registered',
      `Application for ${form.applicantName} (${finalStudentNumber}) submitted successfully.`,
      'success'
    );
  };

  const getStatusBadge = (status: AdmissionApplication['status']) => {
    switch (status) {
      case 'Pending':
        return <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded text-[10px]">Pending Review</span>;
      case 'Interview Scheduled':
      case 'Interview':
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
            <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
              Creche to JHS 3 Admissions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enroll students from Creche through JHS 3 with manual or automatic student ID generation (e.g., GWD-0000-00001).
          </p>
        </div>

        <button
          onClick={handleOpenModal}
          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
        >
          <UserPlus className="w-4 h-4 text-amber-300" />
          New Admission Form
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
            selectedStatus === 'Interview Scheduled' || selectedStatus === 'Interview'
              ? 'bg-blue-50 border-blue-400 ring-2 ring-blue-500/20'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <span className="text-[11px] font-bold text-blue-700 block">Interviews Set</span>
          <span className="text-xl font-black text-blue-900">
            {admissions.filter((a) => a.status === 'Interview Scheduled' || a.status === 'Interview').length}
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

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by student name, ID, parent..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-600"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500">Filter Class:</span>
          <select
            value={selectedClassFilter}
            onChange={(e) => setSelectedClassFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">All Classes (Creche - JHS 3)</option>
            {ALL_CLASSES.map((cls) => (
              <option key={cls} value={cls}>
                {cls}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3.5 px-4">Student # / App ID</th>
                <th className="py-3.5 px-4">Applicant Name</th>
                <th className="py-3.5 px-4">Applied Class</th>
                <th className="py-3.5 px-4">Parent Details</th>
                <th className="py-3.5 px-4">Enrollment Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAdmissions.map((adm) => (
                <tr key={adm.id} className="hover:bg-emerald-50/40 transition-colors">
                  <td className="py-3 px-4">
                    <span className="font-mono font-bold text-emerald-950 block">
                      {adm.studentNumber || adm.applicationNo}
                    </span>
                    {adm.studentNumber && adm.applicationNo && adm.studentNumber !== adm.applicationNo && (
                      <span className="text-[10px] text-slate-400 font-mono">App: {adm.applicationNo}</span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-bold text-slate-900 block">{adm.applicantName}</span>
                    <span className="text-[11px] text-slate-500">
                      {adm.gender} • DOB: {adm.dateOfBirth || 'N/A'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-semibold text-emerald-900 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100">
                      {adm.appliedClass}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-slate-800">{adm.parentName}</div>
                    <div className="text-[11px] text-slate-500">{adm.parentPhone}</div>
                    {adm.parentAddress && (
                      <div className="text-[10px] text-slate-400 truncate max-w-[140px]">{adm.parentAddress}</div>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-700 font-mono">
                    {adm.enrollmentDate || adm.submissionDate}
                  </td>
                  <td className="py-3 px-4">{getStatusBadge(adm.status)}</td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      {adm.status === 'Pending' && (
                        <button
                          onClick={() => {
                            updateAdmissionStatus(adm.id, 'Interview Scheduled');
                            showToast('Interview Scheduled', `Interview scheduled for ${adm.applicantName}.`, 'info');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Schedule Interview
                        </button>
                      )}
                      {(adm.status === 'Interview Scheduled' || adm.status === 'Interview') && (
                        <button
                          onClick={() => {
                            updateAdmissionStatus(adm.id, 'Approved');
                            showToast('Admission Approved', `Application for ${adm.applicantName} is now approved.`, 'success');
                          }}
                          className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 hover:bg-emerald-100 font-semibold text-[11px] cursor-pointer"
                        >
                          Approve Admission
                        </button>
                      )}
                      {adm.status === 'Approved' && (
                        <button
                          onClick={() => handleEnrollStudent(adm)}
                          className="px-2.5 py-1 rounded-lg bg-amber-400 text-emerald-950 hover:bg-amber-300 font-bold text-[11px] shadow-xs cursor-pointer flex items-center gap-1"
                        >
                          <UserCheck className="w-3.5 h-3.5" />
                          Enroll as Student
                        </button>
                      )}
                      <button
                        onClick={() => setSelectedAdmission(adm)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold cursor-pointer"
                        title="View Application Details"
                      >
                        <FileText className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredAdmissions.length === 0 && (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No admission applications found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Application Details Review Modal */}
      {selectedAdmission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Admission Application Review</h3>
                <p className="text-xs text-emerald-200 font-mono">
                  Student ID: {selectedAdmission.studentNumber || selectedAdmission.applicationNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedAdmission(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-700" /> Student Number:
                  </span>
                  <span className="font-bold font-mono text-emerald-950">
                    {selectedAdmission.studentNumber || selectedAdmission.applicationNo}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" /> Applicant Name:
                  </span>
                  <span className="font-bold text-slate-900">{selectedAdmission.applicantName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Gender & DOB:</span>
                  <span className="font-semibold">{selectedAdmission.gender} • {selectedAdmission.dateOfBirth || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Enrollment Date:
                  </span>
                  <span className="font-semibold text-slate-800">{selectedAdmission.enrollmentDate || selectedAdmission.submissionDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> Applied Class:
                  </span>
                  <span className="font-bold text-emerald-800">{selectedAdmission.appliedClass}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Parent / Guardian:
                  </span>
                  <span className="font-semibold">{selectedAdmission.parentName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" /> Parent Address:
                  </span>
                  <span className="font-semibold text-right max-w-[200px]">{selectedAdmission.parentAddress || 'Accra, Ghana'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" /> Parent Phone:
                  </span>
                  <span className="font-semibold font-mono">{selectedAdmission.parentPhone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-emerald-700" /> Parent Email:
                  </span>
                  <span className="font-semibold">{selectedAdmission.parentEmail || 'N/A'}</span>
                </div>
                <div className="flex justify-between pt-1 border-t border-slate-200">
                  <span className="text-slate-500">Application Status:</span>
                  <div>{getStatusBadge(selectedAdmission.status)}</div>
                </div>
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
                {selectedAdmission.status === 'Approved' && (
                  <button
                    onClick={() => {
                      handleEnrollStudent(selectedAdmission);
                      setSelectedAdmission(null);
                    }}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl cursor-pointer flex items-center gap-1.5"
                  >
                    <UserCheck className="w-4 h-4 text-amber-300" />
                    Confirm & Enroll Student
                  </button>
                )}
                <button
                  onClick={() => setSelectedAdmission(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* New Admission Form Modal */}
      {isApplyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-6">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Student Admission Form</h3>
                <p className="text-xs text-emerald-200">
                  Enter student details, class enrollment (Creche to JHS 3), and parent information
                </p>
              </div>
              <button
                onClick={() => setIsApplyModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateApplication} className="p-6 space-y-4 text-xs">
              {/* Student Number Input with Auto-Generate Helper */}
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-700" /> Student Number (ID / Admission No)
                  </label>
                  <button
                    type="button"
                    onClick={handleGenerateStudentNumber}
                    className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate ID
                  </button>
                </div>
                <input
                  type="text"
                  value={form.studentNumber}
                  onChange={(e) => setForm({ ...form, studentNumber: e.target.value })}
                  placeholder="GWD-0000-00001"
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-emerald-800 mt-1">
                  Enter manually or leave blank to automatically generate as <span className="font-mono font-bold">GWD-0000-00001</span>.
                </p>
              </div>

              {/* Student Information */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Applicant Full Name *</label>
                <input
                  type="text"
                  required
                  value={form.applicantName}
                  onChange={(e) => setForm({ ...form, applicantName: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="e.g. David Kwaku Mensah"
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
                  <label className="block font-semibold text-slate-700 mb-1">Date of Birth *</label>
                  <input
                    type="date"
                    required
                    value={form.dateOfBirth}
                    onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrollment Date *</label>
                  <input
                    type="date"
                    required
                    value={form.enrollmentDate}
                    onChange={(e) => setForm({ ...form, enrollmentDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Applying for Class (Creche to JHS 3) *</label>
                  <select
                    value={form.appliedClass}
                    onChange={(e) => setForm({ ...form, appliedClass: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {ALL_CLASSES.map((cls) => (
                      <option key={cls} value={cls}>
                        {cls}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Matched Teacher Hint */}
              {(() => {
                const matched = suggestTeacherForClass(form.appliedClass);
                if (matched) {
                  return (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-2.5 flex items-center justify-between text-xs text-emerald-950">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span>
                          Designated Teacher: <strong>{matched.teacherName}</strong>
                        </span>
                      </div>
                      <span className="text-[10px] bg-emerald-200 text-emerald-900 px-2 py-0.5 rounded font-bold">
                        Auto-Assigned on Admission
                      </span>
                    </div>
                  );
                }
                return null;
              })()}

              {/* Parents Information Section */}
              <div className="border-t border-slate-200 pt-3 space-y-3">
                <h4 className="font-bold text-emerald-950 flex items-center gap-1.5">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Parent / Guardian Particulars
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent / Guardian Name *</label>
                    <input
                      type="text"
                      required
                      value={form.parentName}
                      onChange={(e) => setForm({ ...form, parentName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="e.g. Emmanuel Mensah"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent Phone (WhatsApp / Mobile) *</label>
                    <input
                      type="tel"
                      required
                      value={form.parentPhone}
                      onChange={(e) => setForm({ ...form, parentPhone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="+233 24 123 4567"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Parent Address (Residential / Town) *</label>
                    <input
                      type="text"
                      required
                      value={form.parentAddress}
                      onChange={(e) => setForm({ ...form, parentAddress: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="e.g. House 45, Off Spintex Road, Accra"
                    />
                  </div>
                </div>
              </div>

              {/* Administrative Remarks */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes / Remarks (Optional)</label>
                <textarea
                  rows={2}
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="Special medical conditions, pickup permissions, or referral notes..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsApplyModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Submit Admission
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Toast Notification */}
      {toast && (
        <div className="fixed top-5 right-5 z-50 max-w-sm w-full bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-slate-700/80 flex items-start gap-3 animate-in fade-in slide-in-from-top-4 duration-200">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="flex-1 pr-2">
            <h4 className="text-xs font-bold text-emerald-300 font-['Outfit']">{toast.title}</h4>
            <p className="text-xs text-slate-200 mt-0.5 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Student Enrollment Success Confirmation Dialog */}
      {enrolledStudentDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-emerald-200 animate-in zoom-in-95 duration-150">
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-900 text-white p-6 text-center relative">
              <div className="w-14 h-14 rounded-full bg-emerald-700/60 border-2 border-amber-300/80 mx-auto flex items-center justify-center shadow-lg mb-3">
                <CheckCircle2 className="w-8 h-8 text-amber-300" />
              </div>
              <h3 className="text-lg font-bold font-['Outfit'] text-white">Student Successfully Enrolled!</h3>
              <p className="text-xs text-emerald-200 mt-1">
                Student record is now active in the school directory
              </p>
              <button
                onClick={() => setEnrolledStudentDialog(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Enrolled Details Card */}
            <div className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50/60 rounded-xl p-4 border border-emerald-200/80 space-y-2.5">
                <div className="flex justify-between items-center pb-2 border-b border-emerald-200/60">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-emerald-700" /> Assigned Student ID:
                  </span>
                  <span className="font-mono font-bold text-emerald-950 text-sm bg-white px-2.5 py-0.5 rounded-md border border-emerald-300 shadow-2xs">
                    {enrolledStudentDialog.studentNumber}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-700" /> Full Name:
                  </span>
                  <span className="font-bold text-slate-900">{enrolledStudentDialog.studentName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-emerald-700" /> Enrolled Class:
                  </span>
                  <span className="font-bold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded">
                    {enrolledStudentDialog.className}
                  </span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-emerald-700" /> Enrollment Date:
                  </span>
                  <span className="font-semibold text-slate-700">{enrolledStudentDialog.enrollmentDate}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-emerald-700" /> Parent / Guardian:
                  </span>
                  <span className="font-semibold text-slate-800">{enrolledStudentDialog.parentName}</span>
                </div>

                <div className="flex justify-between items-center">
                  <span className="text-slate-500 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" /> Contact Phone:
                  </span>
                  <span className="font-mono font-semibold text-slate-800">{enrolledStudentDialog.parentPhone}</span>
                </div>

                <div className="flex justify-between items-center pt-2 border-t border-emerald-200/60">
                  <span className="text-slate-500">Directory Status:</span>
                  <span className="inline-flex items-center gap-1 bg-emerald-700 text-white font-bold px-2 py-0.5 rounded text-[10px]">
                    <BadgeCheck className="w-3 h-3 text-amber-300" /> Active Student
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 px-3.5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                >
                  <Printer className="w-4 h-4 text-slate-600" />
                  Print Admission Slip
                </button>
                <button
                  type="button"
                  onClick={() => setEnrolledStudentDialog(null)}
                  className="flex-1 px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm flex items-center justify-center gap-1 cursor-pointer transition-colors"
                >
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  Done
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
