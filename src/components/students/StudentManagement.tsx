import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student } from '../../types';
import {
  Users,
  UserPlus,
  Search,
  Filter,
  Eye,
  Edit2,
  Trash2,
  Phone,
  Mail,
  MapPin,
  Calendar,
  CreditCard,
  CheckCircle,
  FileSpreadsheet,
  X,
  Plus,
  Shield,
  Printer,
  Sparkles,
  QrCode
} from 'lucide-react';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';

export const StudentManagement: React.FC<{ onOpenPaystackForStudent?: (student: Student) => void }> = ({
  onOpenPaystackForStudent
}) => {
  const { students, addStudent, updateStudent, deleteStudent, searchQuery, marks, attendance, invoices, classes, generateNextStudentNumber } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeStudentProfile, setActiveStudentProfile] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);

  // Digital ID Card Generator State
  const [isIdGeneratorOpen, setIsIdGeneratorOpen] = useState<boolean>(false);
  const [selectedIdCardStudent, setSelectedIdCardStudent] = useState<Student | null>(null);

  // Form State
  const [formData, setFormData] = useState<{
    admissionNo: string;
    firstName: string;
    lastName: string;
    gender: 'Male' | 'Female';
    dateOfBirth: string;
    className: string;
    classTeacher: string;
    enrollmentDate: string;
    section: string;
    rollNo: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    address: string;
    balanceDue: number;
    photoUrl: string;
  }>({
    admissionNo: '',
    firstName: '',
    lastName: '',
    gender: 'Male',
    dateOfBirth: '',
    className: classes[0]?.name || 'Primary 1 (Grade 1)',
    classTeacher: '',
    enrollmentDate: new Date().toISOString().split('T')[0],
    section: 'A',
    rollNo: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: '',
    balanceDue: 0,
    photoUrl: ''
  });

  const [localSearch, setLocalSearch] = useState('');

  const classList = [
    'All Classes',
    ...(classes && classes.length > 0
      ? classes.map((c) => c.name)
      : [
          'Creche',
          'Nursery 1',
          'Nursery 2',
          'KG 1 (Kindergarten)',
          'KG 2 (Kindergarten)',
          'Primary 1 (Grade 1)',
          'Primary 2 (Grade 2)',
          'Primary 3 (Grade 3)',
          'Primary 4 (Grade 4)',
          'Primary 5 (Grade 5)',
          'Primary 6 (Grade 6)',
          'JHS 1 (Basic 7)',
          'JHS 2 (Basic 8)',
          'JHS 3 (Basic 9)'
        ])
  ];

  // Filtering
  const effectiveSearch = localSearch || searchQuery || '';

  const filteredStudents = students.filter((s) => {
    const matchesSearch =
      effectiveSearch === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(effectiveSearch.toLowerCase()) ||
      (s.classTeacher && s.classTeacher.toLowerCase().includes(effectiveSearch.toLowerCase())) ||
      s.guardianName.toLowerCase().includes(effectiveSearch.toLowerCase());

    const matchesClass = selectedClass === 'all' || selectedClass === 'All Classes' || s.className === selectedClass;
    const matchesStatus = selectedStatus === 'all' || s.status === selectedStatus;

    return matchesSearch && matchesClass && matchesStatus;
  });

  const handleSaveStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingStudent) {
      updateStudent(editingStudent.id, {
        admissionNo: formData.admissionNo.trim() || editingStudent.admissionNo,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        className: formData.className,
        classTeacher: formData.classTeacher,
        enrollmentDate: formData.enrollmentDate,
        section: formData.section,
        rollNo: formData.rollNo,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        address: formData.address,
        photoUrl: formData.photoUrl,
        balanceDue: Number(formData.balanceDue)
      });
      setEditingStudent(null);
    } else {
      addStudent({
        admissionNo: formData.admissionNo.trim() || undefined,
        firstName: formData.firstName,
        lastName: formData.lastName,
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth,
        classId: `cls-${formData.className.toLowerCase().replace(/\s+/g, '-')}`,
        className: formData.className,
        classTeacher: formData.classTeacher,
        enrollmentDate: formData.enrollmentDate,
        section: formData.section,
        rollNo: formData.rollNo,
        guardianName: formData.guardianName,
        guardianPhone: formData.guardianPhone,
        guardianEmail: formData.guardianEmail,
        address: formData.address,
        status: 'Active',
        photoUrl: formData.photoUrl || `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(formData.firstName + ' ' + formData.lastName)}`,
        balanceDue: Number(formData.balanceDue)
      });
      setIsAddModalOpen(false);
    }

    // Reset
    setFormData({
      admissionNo: '',
      firstName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '',
      className: classes[0]?.name || 'Creche',
      classTeacher: '',
      enrollmentDate: new Date().toISOString().split('T')[0],
      section: 'A',
      rollNo: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: '',
      balanceDue: 0,
      photoUrl: ''
    });
  };

  const handleOpenEdit = (std: Student) => {
    setEditingStudent(std);
    setFormData({
      admissionNo: std.admissionNo,
      firstName: std.firstName,
      lastName: std.lastName,
      gender: std.gender as 'Male' | 'Female',
      dateOfBirth: std.dateOfBirth,
      className: std.className,
      classTeacher: std.classTeacher || '',
      enrollmentDate: std.enrollmentDate || std.joinedDate || new Date().toISOString().split('T')[0],
      section: std.section,
      rollNo: std.rollNo,
      guardianName: std.guardianName,
      guardianPhone: std.guardianPhone,
      guardianEmail: std.guardianEmail,
      address: std.address,
      balanceDue: std.balanceDue,
      photoUrl: std.photoUrl
    });
    setIsAddModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Admission No,Name,Class,Section,Roll No,Gender,Guardian,Phone,Fee Balance']
        .concat(
          filteredStudents.map(
            (s) =>
              `"${s.admissionNo}","${s.firstName} ${s.lastName}","${s.className}","${s.section}","${s.rollNo}","${s.gender}","${s.guardianName}","${s.guardianPhone}",${s.balanceDue}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'EduCore_Students_Directory.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Student Management</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              {filteredStudents.length} Active Records
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Manage student admissions, profiles, academic records, and parent contacts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setSelectedIdCardStudent(null);
              setIsIdGeneratorOpen(true);
            }}
            className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-950 border border-amber-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Open Digital ID Card Generator for single student or bulk class batch"
          >
            <CreditCard className="w-4 h-4 text-amber-600" />
            Digital ID Generator
          </button>
          <button
            onClick={handleExportCSV}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
            Export CSV
          </button>
          <button
            onClick={() => {
              setEditingStudent(null);
              setIsAddModalOpen(true);
            }}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            Enroll New Student
          </button>
        </div>
      </div>

      {/* Filters & Search Row */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 text-xs">
        <div className="flex flex-wrap items-center gap-3">
          {/* Search Column / Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search student, roll #, teacher, parent..."
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              className="pl-9 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-900 font-medium w-64 focus:outline-none focus:ring-2 focus:ring-emerald-700"
            />
          </div>

          <div className="flex items-center gap-1.5 font-semibold text-slate-600">
            <Filter className="w-3.5 h-3.5 text-emerald-700" />
            <span>Class Level:</span>
          </div>

          {/* Class Filter */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            {classList.map((c) => (
              <option key={c} value={c === 'All Classes' ? 'all' : c}>
                {c}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600"
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active Enrolled</option>
            <option value="Graduated">Graduated</option>
            <option value="Suspended">Suspended</option>
          </select>
        </div>

        <span className="text-slate-400 text-[11px] font-medium">
          Showing {filteredStudents.length} of {students.length} pupils
        </span>
      </div>

      {/* Students Data Table (with exact requested columns) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-emerald-900/95 text-white uppercase text-[10px] tracking-wider font-bold">
                <th className="py-3.5 px-4">Student Name</th>
                <th className="py-3.5 px-4">Class Level</th>
                <th className="py-3.5 px-4">Class Teacher</th>
                <th className="py-3.5 px-4">Enrollment Date</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Parents Info</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredStudents.map((std) => (
                <tr key={std.id} className="hover:bg-emerald-50/40 transition-colors group">
                  {/* 1. Student Name */}
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <img
                        src={std.photoUrl}
                        alt={std.firstName}
                        className="w-9 h-9 rounded-full object-cover ring-2 ring-emerald-600/20"
                        referrerPolicy="no-referrer"
                      />
                      <div>
                        <span className="font-bold text-slate-900 block group-hover:text-emerald-900">
                          {std.firstName} {std.lastName}
                        </span>
                        <span className="text-[11px] text-slate-400 font-mono">
                          Roll #{std.rollNo} • {std.admissionNo}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* 2. Class Level */}
                  <td className="py-3 px-4">
                    <span className="font-semibold text-slate-800 bg-emerald-50 text-emerald-900 px-2 py-0.5 rounded-md text-[11px] inline-block">
                      {std.className}
                    </span>
                    <span className="text-[11px] text-slate-400 block mt-0.5">Section {std.section}</span>
                  </td>

                  {/* 3. Class Teacher */}
                  <td className="py-3 px-4">
                    <span className="font-medium text-slate-800 block">
                      {std.classTeacher || 'Mr. Arthur Mensah'}
                    </span>
                    <span className="text-[10px] text-emerald-700">Lead Mentor</span>
                  </td>

                  {/* 4. Enrollment Date */}
                  <td className="py-3 px-4">
                    <span className="font-mono text-slate-700 text-xs">
                      {std.enrollmentDate || std.joinedDate || '2024-01-10'}
                    </span>
                  </td>

                  {/* 5. Status */}
                  <td className="py-3 px-4">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        std.status === 'Active'
                          ? 'bg-emerald-100 text-emerald-800'
                          : std.status === 'Graduated'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {std.status}
                    </span>
                  </td>

                  {/* 6. Parents Info */}
                  <td className="py-3 px-4">
                    <div className="text-slate-800 font-semibold">{std.guardianName}</div>
                    <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                      <span className="flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3 text-emerald-700" />
                        {std.guardianPhone}
                      </span>
                    </div>
                  </td>

                  {/* 7. Action */}
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <button
                        onClick={() => {
                          setSelectedIdCardStudent(std);
                          setIsIdGeneratorOpen(true);
                        }}
                        className="p-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 transition-colors"
                        title="Generate Digital ID Card"
                      >
                        <CreditCard className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          window.open(
                            `https://wa.me/${std.guardianPhone.replace(/[^0-9]/g, '')}?text=Dear%20Parent%2C%20greetings%20from%20Grace%20White%20Dove%20regarding%20${std.firstName}%20${std.lastName}.`,
                            '_blank'
                          );
                        }}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                        title="WhatsApp Parent"
                      >
                        <Phone className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setActiveStudentProfile(std)}
                        className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 transition-colors"
                        title="View Full Profile"
                      >
                        <Eye className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleOpenEdit(std)}
                        className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 transition-colors"
                        title="Edit Student"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Are you sure you want to delete ${std.firstName} ${std.lastName}?`)) {
                            deleteStudent(std.id);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 transition-colors"
                        title="Delete Student"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Student Profile Modal */}
      {activeStudentProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header banner in Green & Gold */}
            <div className="bg-gradient-to-r from-emerald-900 to-emerald-800 p-6 text-white relative">
              <button
                onClick={() => setActiveStudentProfile(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-4">
                <img
                  src={activeStudentProfile.photoUrl}
                  alt={activeStudentProfile.firstName}
                  className="w-16 h-16 rounded-2xl object-cover ring-4 ring-amber-400"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-xl font-bold text-white font-['Outfit']">
                      {activeStudentProfile.firstName} {activeStudentProfile.lastName}
                    </h3>
                    <span className="bg-amber-400 text-emerald-950 text-[10px] font-extrabold px-2 py-0.5 rounded">
                      {activeStudentProfile.status}
                    </span>
                  </div>
                  <p className="text-xs text-emerald-200">
                    {activeStudentProfile.admissionNo} • {activeStudentProfile.className} (Sec {activeStudentProfile.section})
                  </p>
                </div>
              </div>
            </div>

            {/* Profile Content */}
            <div className="p-6 space-y-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                {/* Personal Information */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-emerald-700" /> Student Particulars
                  </h4>
                  <div className="flex justify-between"><span className="text-slate-500">Gender:</span><span className="font-semibold">{activeStudentProfile.gender}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Date of Birth:</span><span className="font-semibold">{activeStudentProfile.dateOfBirth}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Roll Number:</span><span className="font-semibold font-mono">{activeStudentProfile.rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Joined Date:</span><span className="font-semibold">{activeStudentProfile.joinedDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Address:</span><span className="font-semibold text-right max-w-[150px] truncate">{activeStudentProfile.address}</span></div>
                </div>

                {/* Guardian Info & Fees */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" /> Guardian & Billing
                  </h4>
                  <div className="flex justify-between"><span className="text-slate-500">Guardian:</span><span className="font-semibold">{activeStudentProfile.guardianName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-semibold font-mono">{activeStudentProfile.guardianPhone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-semibold truncate max-w-[150px]">{activeStudentProfile.guardianEmail}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200">
                    <span className="text-slate-500">Fee Balance:</span>
                    <span className="font-bold text-amber-700 text-sm">GHS {activeStudentProfile.balanceDue.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              {/* Student Exam Marks History */}
              <div className="bg-white rounded-xl border border-slate-200 p-4">
                <h4 className="font-bold text-xs text-slate-900 mb-2">Subject Performance Record</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {marks
                    .filter((m) => m.studentId === activeStudentProfile.id)
                    .map((m) => (
                      <div key={m.id} className="p-2.5 rounded-lg bg-emerald-50/60 border border-emerald-100 flex items-center justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-slate-800 block">{m.subject}</span>
                          <span className="text-[10px] text-slate-500">Grade: {m.grade}</span>
                        </div>
                        <span className="font-black text-xs text-emerald-800 font-mono">{m.score}%</span>
                      </div>
                    ))}
                  {marks.filter((m) => m.studentId === activeStudentProfile.id).length === 0 && (
                    <p className="text-xs text-slate-400 col-span-3 py-2">No terminal assessment marks recorded yet for current term.</p>
                  )}
                </div>
              </div>

              {/* Footer action buttons */}
              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 flex-wrap">
                <button
                  onClick={() => {
                    const std = activeStudentProfile;
                    setSelectedIdCardStudent(std);
                    setIsIdGeneratorOpen(true);
                  }}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4 text-amber-300" />
                  Generate Digital ID Card
                </button>
                {onOpenPaystackForStudent && (
                  <button
                    onClick={() => {
                      const std = activeStudentProfile;
                      setActiveStudentProfile(null);
                      onOpenPaystackForStudent(std);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    Pay Student Fees (Paystack)
                  </button>
                )}
                <button
                  onClick={() => setActiveStudentProfile(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Close Profile
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Student Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">
                  {editingStudent ? 'Edit Student Details' : 'Student Admission & Enrollment'}
                </h3>
                <p className="text-xs text-emerald-200">Fill in student academic and parent information</p>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="p-6 space-y-4 text-xs">
              <div className="bg-emerald-50/70 p-3.5 rounded-xl border border-emerald-200">
                <div className="flex items-center justify-between mb-1.5">
                  <label className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-emerald-700" /> Student Number (ID / Admission No)
                  </label>
                  {!editingStudent && (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, admissionNo: generateNextStudentNumber() }))}
                      className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 bg-white hover:bg-emerald-100 border border-emerald-300 px-2 py-0.5 rounded flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <Sparkles className="w-3 h-3 text-amber-500" /> Auto-Generate ID
                    </button>
                  )}
                </div>
                <input
                  type="text"
                  value={formData.admissionNo}
                  onChange={(e) => setFormData({ ...formData, admissionNo: e.target.value })}
                  placeholder="GWD-0000-00001"
                  className="w-full bg-white border border-emerald-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                />
                <p className="text-[10px] text-emerald-800 mt-1">
                  Enter manually or leave blank to automatically generate as <span className="font-mono font-bold">GWD-0000-00001</span>.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. Kwaku"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. Mensah"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'Male' | 'Female' })}
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
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Roll Number</label>
                  <input
                    type="text"
                    value={formData.rollNo}
                    onChange={(e) => setFormData({ ...formData, rollNo: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. 14"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Assign Class</label>
                  <select
                    value={formData.className}
                    onChange={(e) => setFormData({ ...formData, className: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {classList.filter((c) => c !== 'All Classes').map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Section</label>
                  <select
                    value={formData.section}
                    onChange={(e) => setFormData({ ...formData, section: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    <option value="A">Section A</option>
                    <option value="B">Section B</option>
                    <option value="C">Section C</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Teacher</label>
                  <input
                    type="text"
                    value={formData.classTeacher}
                    onChange={(e) => setFormData({ ...formData, classTeacher: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. Mr. Arthur Mensah"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Enrollment Date</label>
                  <input
                    type="date"
                    value={formData.enrollmentDate}
                    onChange={(e) => setFormData({ ...formData, enrollmentDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="border-t border-slate-200 pt-3">
                <h4 className="font-bold text-emerald-900 mb-2">Guardian / Parent Contact Details</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Guardian Full Name *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianName}
                      onChange={(e) => setFormData({ ...formData, guardianName: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="e.g. Emmanuel Mensah"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Guardian Phone (WhatsApp) *</label>
                    <input
                      type="text"
                      required
                      value={formData.guardianPhone}
                      onChange={(e) => setFormData({ ...formData, guardianPhone: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="+233 24 000 0000"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Guardian Email</label>
                    <input
                      type="email"
                      value={formData.guardianEmail}
                      onChange={(e) => setFormData({ ...formData, guardianEmail: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="guardian@gmail.com"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Residential Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                      placeholder="Accra, Ghana"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  {editingStudent ? 'Save Changes' : 'Confirm Enrollment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Digital ID Card Generator Modal */}
      {isIdGeneratorOpen && (
        <DigitalIdCardGenerator
          isOpen={isIdGeneratorOpen}
          initialStudent={selectedIdCardStudent}
          onClose={() => {
            setIsIdGeneratorOpen(false);
            setSelectedIdCardStudent(null);
          }}
        />
      )}
    </div>
  );
};
