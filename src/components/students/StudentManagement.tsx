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
  QrCode,
  UserCheck,
  AlertCircle,
  RefreshCw,
  GraduationCap,
  Banknote,
  DollarSign,
  Save,
  Clock
} from 'lucide-react';
import { DigitalIdCardGenerator } from './DigitalIdCardGenerator';

export const StudentManagement: React.FC<{ onOpenPaystackForStudent?: (student: Student) => void }> = ({
  onOpenPaystackForStudent
}) => {
  const {
    students,
    addStudent,
    updateStudent,
    deleteStudent,
    searchQuery,
    marks,
    attendance,
    invoices,
    classes,
    generateNextStudentNumber,
    suggestTeacherForClass,
    currentUser,
    updateStudentArrears
  } = useSchool();

  const [selectedClass, setSelectedClass] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [activeStudentProfile, setActiveStudentProfile] = useState<Student | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);

  // Manual Arrears Override in Profile Modal State
  const [profileManualArrears, setProfileManualArrears] = useState<number | string>(0);
  const [profileArrearsReason, setProfileArrearsReason] = useState<string>('');
  const [arrearsSaveFeedback, setArrearsSaveFeedback] = useState<string | null>(null);

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
    manualArrears: number;
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
    manualArrears: 0,
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

  // Auto-suggested teacher for the currently selected class in the form
  const currentSuggestedTeacher = suggestTeacherForClass(formData.className);

  // When class changes in the form, automatically suggest and fill the class teacher
  const handleClassChange = (newClassName: string) => {
    const suggested = suggestTeacherForClass(newClassName);
    setFormData((prev) => ({
      ...prev,
      className: newClassName,
      classTeacher: suggested ? suggested.teacherName : ''
    }));
  };

  const handleOpenAdd = () => {
    setEditingStudent(null);
    const initialClass = classes[0]?.name || 'Primary 1 (Grade 1)';
    const suggested = suggestTeacherForClass(initialClass);
    setFormData({
      admissionNo: '',
      firstName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '',
      className: initialClass,
      classTeacher: suggested ? suggested.teacherName : '',
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
    setIsAddModalOpen(true);
  };

  // Bulk auto-sync teachers for all enrolled students
  const handleAutoSyncAllTeachers = () => {
    let syncedCount = 0;
    students.forEach((std) => {
      const matched = suggestTeacherForClass(std.className);
      if (matched && (!std.classTeacher || std.classTeacher.trim() === '' || std.classTeacher !== matched.teacherName)) {
        updateStudent(std.id, { classTeacher: matched.teacherName });
        syncedCount++;
      }
    });
    setSyncFeedback(`Successfully synchronized class teachers for ${syncedCount} student(s) matching their class levels.`);
    setTimeout(() => setSyncFeedback(null), 5000);
  };

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
        balanceDue: Number(formData.balanceDue),
        manualArrears: Number(formData.manualArrears) || 0
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
        balanceDue: Number(formData.balanceDue),
        manualArrears: Number(formData.manualArrears) || 0
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
      manualArrears: 0,
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
      manualArrears: std.manualArrears || 0,
      photoUrl: std.photoUrl
    });
    setIsAddModalOpen(true);
  };

  const handleOpenProfile = (std: Student) => {
    setActiveStudentProfile(std);
    setProfileManualArrears(std.manualArrears || 0);
    setProfileArrearsReason('');
    setArrearsSaveFeedback(null);
  };

  const handleSaveProfileManualArrears = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeStudentProfile) return;

    const newAmount = Math.max(0, Number(profileManualArrears) || 0);
    updateStudentArrears(
      activeStudentProfile.id,
      newAmount,
      profileArrearsReason.trim() || 'Manual Arrears Override via Student Finance Profile'
    );

    const oldArrears = activeStudentProfile.manualArrears || 0;
    const diff = newAmount - oldArrears;
    const updated: Student = {
      ...activeStudentProfile,
      manualArrears: newAmount,
      balanceDue: Math.max(0, (activeStudentProfile.balanceDue || 0) + diff)
    };
    setActiveStudentProfile(updated);
    setArrearsSaveFeedback(`Manual arrears override of GHS ${newAmount.toLocaleString()} saved successfully to database!`);
    setTimeout(() => setArrearsSaveFeedback(null), 4000);
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
            onClick={handleAutoSyncAllTeachers}
            className="px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-950 border border-emerald-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-2xs transition-all cursor-pointer"
            title="Auto-match and assign class teachers for all students based on their class levels"
          >
            <RefreshCw className="w-3.5 h-3.5 text-emerald-700" />
            Auto-Sync Teachers
          </button>
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
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-amber-300" />
            Enroll New Student
          </button>
        </div>
      </div>

      {syncFeedback && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs px-4 py-2.5 rounded-xl flex items-center justify-between animate-fadeIn shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span className="font-semibold">{syncFeedback}</span>
          </div>
          <button
            onClick={() => setSyncFeedback(null)}
            className="text-emerald-700 hover:text-emerald-900 text-xs font-bold px-2 py-0.5 rounded cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

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
                    {std.classTeacher && std.classTeacher.trim() !== '' ? (
                      <div>
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <GraduationCap className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                          {std.classTeacher}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-medium block mt-0.5">Assigned Class Teacher</span>
                      </div>
                    ) : (() => {
                      const matched = suggestTeacherForClass(std.className);
                      if (matched) {
                        return (
                          <button
                            onClick={() => updateStudent(std.id, { classTeacher: matched.teacherName })}
                            className="inline-flex items-center gap-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 px-2 py-0.5 rounded-md text-[10px] font-bold cursor-pointer transition-colors"
                            title={`Auto-assign ${matched.teacherName} based on ${std.className}`}
                          >
                            <Sparkles className="w-3 h-3 text-amber-600" />
                            Assign {matched.teacherName.split(' ').pop()}
                          </button>
                        );
                      }
                      return (
                        <span className="text-slate-400 italic text-[11px]">Unassigned</span>
                      );
                    })()}
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
                  <div className="flex justify-between"><span className="text-slate-500">Class Level:</span><span className="font-bold text-emerald-900">{activeStudentProfile.className}</span></div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500">Class Teacher:</span>
                    <span className="font-semibold text-emerald-950 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                      {activeStudentProfile.classTeacher || 'Unassigned'}
                    </span>
                  </div>
                  <div className="flex justify-between"><span className="text-slate-500">Roll Number:</span><span className="font-semibold font-mono">{activeStudentProfile.rollNo}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Joined Date:</span><span className="font-semibold">{activeStudentProfile.joinedDate}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Address:</span><span className="font-semibold text-right max-w-[150px] truncate">{activeStudentProfile.address}</span></div>
                </div>

                {/* Guardian Info */}
                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                  <h4 className="font-bold text-emerald-950 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-700" /> Guardian & Family
                  </h4>
                  <div className="flex justify-between"><span className="text-slate-500">Guardian:</span><span className="font-semibold">{activeStudentProfile.guardianName}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Phone:</span><span className="font-semibold font-mono">{activeStudentProfile.guardianPhone}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Email:</span><span className="font-semibold truncate max-w-[150px]">{activeStudentProfile.guardianEmail}</span></div>
                  <div className="flex justify-between"><span className="text-slate-500">Address:</span><span className="font-semibold text-right max-w-[150px] truncate">{activeStudentProfile.address}</span></div>
                </div>
              </div>

              {/* Student Financial Profile & Manual Arrears Override */}
              {(() => {
                const studentInvoice = invoices.find((i) => i.studentId === activeStudentProfile.id);
                const termFees = studentInvoice?.termFees || 0;
                const books = studentInvoice?.books || 0;
                const accessories = studentInvoice?.accessories || 0;
                const currentTermTotal = studentInvoice?.currentTermAmount ?? (termFees + books + accessories > 0 ? (termFees + books + accessories) : Math.max(0, (studentInvoice?.totalAmount || 0) - (studentInvoice?.arrears || 0)));
                const manualArrears = activeStudentProfile.manualArrears || 0;
                const totalBalance = activeStudentProfile.balanceDue;
                const isAdminOrAccountant = currentUser?.role === 'Admin' || currentUser?.role === 'Accountant' || currentUser?.role === 'System' || !currentUser?.role;

                return (
                  <div className="bg-gradient-to-br from-slate-50 to-emerald-50/40 p-4 sm:p-5 rounded-2xl border border-emerald-200/80 space-y-4">
                    <div className="flex items-center justify-between border-b border-emerald-200/60 pb-2.5 flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-emerald-800 text-white flex items-center justify-center font-bold text-xs shadow-2xs">
                          <Banknote className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-emerald-950 text-sm">Student Finance Profile & Arrears</h4>
                          <p className="text-[11px] text-slate-500">Separated billing of current term fees from manual previous arrears</p>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                        {studentInvoice ? `Invoice: ${studentInvoice.invoiceNo}` : 'No Active Term Invoice'}
                      </span>
                    </div>

                    {/* 3 Metric Summary Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="bg-white p-3 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-500 block mb-1">
                          Current Term Bill
                        </span>
                        <span className="text-base font-extrabold text-slate-900">
                          GHS {currentTermTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[10px] text-slate-400 mt-0.5">
                          Term Fees, Books & Accessories
                        </div>
                      </div>

                      <div className="bg-white p-3 rounded-xl border border-amber-200 shadow-2xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 block mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-amber-600" /> Manual Arrears
                        </span>
                        <span className="text-base font-extrabold text-amber-700">
                          GHS {manualArrears.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[10px] text-amber-600/80 mt-0.5">
                          Prior Terms Unpaid Debt
                        </div>
                      </div>

                      <div className="bg-emerald-900 text-white p-3 rounded-xl shadow-2xs">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-200 block mb-1">
                          Total Balance Due
                        </span>
                        <span className="text-base font-extrabold text-white">
                          GHS {totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div className="text-[10px] text-emerald-300 mt-0.5">
                          Current Bill + Arrears - Payments
                        </div>
                      </div>
                    </div>

                    {/* Manual Arrears Override Interactive Form */}
                    {isAdminOrAccountant ? (
                      <form onSubmit={handleSaveProfileManualArrears} className="bg-white p-4 rounded-xl border border-emerald-300 shadow-sm space-y-3">
                        <div className="flex items-center justify-between flex-wrap gap-1">
                          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                            <DollarSign className="w-4 h-4 text-emerald-700" />
                            Manual Arrears Override (Admin / Accountant Control)
                          </label>
                          <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-semibold">
                            Persists to Database
                          </span>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-slate-700">Manual Arrears Override (GHS)</span>
                            </div>
                            <div className="relative">
                              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">GHS</span>
                              <input
                                type="number"
                                step="any"
                                min="0"
                                value={profileManualArrears}
                                onChange={(e) => setProfileManualArrears(e.target.value)}
                                className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                                placeholder="0.00"
                              />
                            </div>
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-semibold text-slate-700">Ledger Audit Reason / Note</span>
                            </div>
                            <input
                              type="text"
                              value={profileArrearsReason}
                              onChange={(e) => setProfileArrearsReason(e.target.value)}
                              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-xs text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                              placeholder="e.g. Carried forward from previous academic year"
                            />
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-slate-100 flex-wrap gap-2">
                          <p className="text-[11px] text-slate-500 max-w-sm">
                            Adjusting this value updates the student&apos;s manual arrears balance independently of current term fee calculations.
                          </p>
                          <button
                            type="submit"
                            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shrink-0 shadow-2xs"
                          >
                            <Save className="w-3.5 h-3.5 text-amber-300" />
                            Save Arrears Override
                          </button>
                        </div>

                        {arrearsSaveFeedback && (
                          <div className="bg-emerald-50 border border-emerald-300 text-emerald-900 p-2.5 rounded-lg text-xs font-semibold flex items-center gap-2 animate-in fade-in">
                            <CheckCircle className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>{arrearsSaveFeedback}</span>
                          </div>
                        )}
                      </form>
                    ) : (
                      <div className="bg-slate-100 p-3 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                        <span>Manual arrears can only be modified by an Admin or Accountant.</span>
                        <span className="font-bold text-slate-700">GHS {manualArrears.toLocaleString()}</span>
                      </div>
                    )}
                  </div>
                );
              })()}

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
                    onChange={(e) => handleClassChange(e.target.value)}
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

              {/* Class Teacher Auto-Suggestion & Match Feedback */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="block font-semibold text-slate-700">Class Teacher</label>
                    {currentSuggestedTeacher && formData.classTeacher !== currentSuggestedTeacher.teacherName && (
                      <button
                        type="button"
                        onClick={() => setFormData((prev) => ({ ...prev, classTeacher: currentSuggestedTeacher.teacherName }))}
                        className="text-[11px] font-bold text-emerald-800 hover:text-emerald-950 underline cursor-pointer"
                      >
                        Auto-fill suggested
                      </button>
                    )}
                  </div>
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

              {/* Smart Teacher Match Assistant Badge */}
              {currentSuggestedTeacher ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5 flex-wrap">
                        <span>Class Teacher:</span>
                        <span className="text-emerald-900 font-extrabold">{currentSuggestedTeacher.teacherName}</span>
                        <span className="bg-emerald-200/80 text-emerald-900 text-[10px] px-1.5 py-0.5 rounded font-semibold">
                          {currentSuggestedTeacher.source === 'class_roster' ? 'Classroom Lead' : currentSuggestedTeacher.source === 'staff_registry' ? 'Staff Registry' : 'Teacher Account'}
                        </span>
                      </div>
                      <p className="text-[11px] text-emerald-800 mt-0.5">
                        Matched automatically for <span className="font-semibold">{formData.className}</span> level.
                      </p>
                    </div>
                  </div>
                  {formData.classTeacher === currentSuggestedTeacher.teacherName ? (
                    <span className="inline-flex items-center gap-1 bg-emerald-200/70 text-emerald-950 px-2.5 py-1 rounded-lg text-xs font-bold shrink-0">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-700" />
                      Assigned
                    </span>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, classTeacher: currentSuggestedTeacher.teacherName }))}
                      className="bg-emerald-700 hover:bg-emerald-800 text-white px-3 py-1 rounded-lg text-xs font-bold transition-colors cursor-pointer shrink-0 shadow-2xs"
                    >
                      Assign {currentSuggestedTeacher.teacherName.split(' ').pop()}
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-2.5 flex items-center gap-2 text-xs text-amber-900">
                  <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
                  <span>No dedicated class teacher is assigned to <strong>{formData.className}</strong> yet. You can manually enter one or configure class teachers in Class Management.</span>
                </div>
              )}

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

              {/* Financial Particulars & Manual Arrears Override */}
              <div className="border-t border-slate-200 pt-3">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <Banknote className="w-4 h-4 text-emerald-700" />
                    Financial & Arrears Configuration
                  </h4>
                  <span className="text-[11px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                    Admin / Accountant
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">Manual Arrears Override (GHS)</label>
                      <span className="text-[10px] text-amber-700 font-bold">Independent</span>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">GHS</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.manualArrears}
                        onChange={(e) => setFormData({ ...formData, manualArrears: Number(e.target.value) || 0 })}
                        className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Prior terms debt carried forward.
                    </p>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block font-semibold text-slate-700">Total Fee Balance Due (GHS)</label>
                    </div>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">GHS</span>
                      <input
                        type="number"
                        step="any"
                        min="0"
                        value={formData.balanceDue}
                        onChange={(e) => setFormData({ ...formData, balanceDue: Number(e.target.value) || 0 })}
                        className="w-full pl-12 pr-3 py-2 border border-slate-300 rounded-lg text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 mt-0.5">
                      Total outstanding ledger balance.
                    </p>
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
