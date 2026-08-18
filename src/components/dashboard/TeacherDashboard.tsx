import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  CheckSquare,
  Award,
  DollarSign,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Search,
  Filter,
  Plus,
  Printer,
  Download,
  FileSpreadsheet,
  TrendingUp,
  MessageSquare,
  Phone,
  Mail,
  UserCheck,
  ChevronRight,
  Sparkles,
  Layers,
  GraduationCap
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export type TeacherDashboardTab = 'overview' | 'my-students' | 'attendance' | 'student-grade' | 'my-salary';

export const TeacherDashboard: React.FC<{ initialTab?: TeacherDashboardTab }> = ({ initialTab = 'overview' }) => {
  const {
    currentUser,
    activeRole,
    students,
    addStudent,
    generateNextStudentNumber,
    attendance,
    markAttendance,
    bulkMarkAttendance,
    marks,
    recordMark,
    classes,
    subjects,
    timetable,
    payrolls,
    reimbursements,
    addReimbursement,
    announcements,
    setActiveTab,
    currentTerm,
    academicYear
  } = useSchool();

  const [currentTab, setCurrentTab] = useState<TeacherDashboardTab>(initialTab);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedGradeSubject, setSelectedGradeSubject] = useState('Core Mathematics');
  const [gradeInputMap, setGradeInputMap] = useState<{ [studentId: string]: { classwork: number; midterm: number; exam: number } }>({});
  const [gradeSaveSuccess, setGradeSaveSuccess] = useState(false);
  const [isReimburseModalOpen, setIsReimburseModalOpen] = useState(false);
  const [reimburseForm, setReimburseForm] = useState({
    title: '',
    category: 'Class Supplies',
    amount: ''
  });

  // Pupil Registration within Teacher Portal
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitSuccessBanner, setAdmitSuccessBanner] = useState<string | null>(null);
  const [admitFormData, setAdmitFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '2012-05-15',
    className: 'JHS 2 (Basic 8)',
    section: 'A',
    rollNo: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: 'Accra, Ghana',
    photoUrl: ''
  });

  const teacherName = currentUser?.name || 'Teacher / Staff';
  const teacherEmail = currentUser?.email || '';

  // Teacher's assigned students (e.g. assigned as classTeacher or matching className)
  const myStudents = students.filter(
    (s) => s.classTeacher === teacherName || (currentUser?.name && s.classTeacher?.includes(currentUser.name))
  );

  const displayStudents = myStudents.length > 0 ? myStudents : students;

  const filteredMyStudents = displayStudents.filter(
    (s) =>
      studentSearch === '' ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.admissionNo.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.rollNo.includes(studentSearch)
  );

  // Today attendance for teacher's class
  const todayStr = new Date().toISOString().split('T')[0];
  const todayAttendanceRecords = attendance.filter((a) => a.date === todayStr);

  const presentCount = displayStudents.filter((s) => {
    const rec = todayAttendanceRecords.find((r) => r.studentId === s.id);
    return rec?.status === 'Present' || rec?.status === 'Late';
  }).length;

  const attendanceRate = displayStudents.length > 0 && todayAttendanceRecords.length > 0
    ? Math.round((presentCount / displayStudents.length) * 100)
    : 0;

  // Teacher's payroll records
  const teacherPayrolls = payrolls.filter((p) => p.staffName.includes(teacherName) || (currentUser?.id && p.staffId === currentUser.id));
  const latestPayroll = teacherPayrolls[0] || payrolls[0] || null;

  // Grade distributions dynamically from marks
  const subjectMarks = marks.filter((m) => !selectedGradeSubject || m.subject === selectedGradeSubject || m.subjectName === selectedGradeSubject);
  const totalClassScoreAvg = marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + (m.score || m.totalScore || 0), 0) / marks.length) : 0;

  const gradeDistributionData = [
    { grade: 'A1 (80-100%)', count: marks.filter((m) => (m.score || m.totalScore) >= 80).length, fill: '#059669' },
    { grade: 'B2 (70-79%)', count: marks.filter((m) => (m.score || m.totalScore) >= 70 && (m.score || m.totalScore) < 80).length, fill: '#10b981' },
    { grade: 'B3 (65-69%)', count: marks.filter((m) => (m.score || m.totalScore) >= 65 && (m.score || m.totalScore) < 70).length, fill: '#34d399' },
    { grade: 'C4-C6 (50-64%)', count: marks.filter((m) => (m.score || m.totalScore) >= 50 && (m.score || m.totalScore) < 65).length, fill: '#f59e0b' },
    { grade: 'D7-E8 (40-49%)', count: marks.filter((m) => (m.score || m.totalScore) >= 40 && (m.score || m.totalScore) < 50).length, fill: '#f97316' },
    { grade: 'F9 (0-39%)', count: marks.filter((m) => (m.score || m.totalScore) < 40).length, fill: '#ef4444' }
  ];

  // Quick mark all present
  const handleMarkAllPresent = () => {
    const records = displayStudents.map((s) => ({
      studentId: s.id,
      status: 'Present' as const,
      remarks: 'Normal on-time arrival'
    }));
    bulkMarkAttendance(records);
  };

  // Save quick grades
  const handleSaveGrades = (e: React.FormEvent) => {
    e.preventDefault();
    displayStudents.forEach((s) => {
      const inputs = gradeInputMap[s.id];
      if (inputs) {
        const total = Math.round(inputs.classwork * 0.3 + inputs.midterm * 0.3 + inputs.exam * 0.4);
        let grade = 'B2';
        if (total >= 80) grade = 'A1';
        else if (total >= 70) grade = 'B2';
        else if (total >= 65) grade = 'B3';
        else if (total >= 60) grade = 'C4';
        else if (total >= 50) grade = 'C5';
        else grade = 'D7';

        recordMark({
          examId: 'ex-midterm-01',
          studentId: s.id,
          studentName: `${s.firstName} ${s.lastName}`,
          className: s.className,
          subject: selectedGradeSubject,
          score: total,
          classScore: inputs.classwork,
          examScore: inputs.exam,
          maxMarks: 100,
          grade,
          remarks: total >= 75 ? 'Excellent work' : 'Satisfactory progress'
        });
      }
    });
    setGradeSaveSuccess(true);
    setTimeout(() => setGradeSaveSuccess(false), 3000);
  };

  const handleCreateReimbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reimburseForm.title || !reimburseForm.amount) return;
    addReimbursement({
      staffId: currentUser?.id || 'stf-002',
      staffName: teacherName,
      title: reimburseForm.title,
      category: reimburseForm.category,
      amount: parseFloat(reimburseForm.amount) || 100
    });
    setReimburseForm({ title: '', category: 'Class Supplies', amount: '' });
    setIsReimburseModalOpen(false);
  };

  const handleAdmitStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!admitFormData.firstName || !admitFormData.lastName) return;

    const matchedClass = classes.find(c => c.name === admitFormData.className);
    const classId = matchedClass?.id || 'cls-008';
    const autoRollNo = admitFormData.rollNo || `${displayStudents.length + 1}`.padStart(2, '0');
    const autoPhoto = admitFormData.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(admitFormData.firstName + admitFormData.lastName)}`;

    addStudent({
      firstName: admitFormData.firstName.trim(),
      lastName: admitFormData.lastName.trim(),
      gender: admitFormData.gender,
      dateOfBirth: admitFormData.dateOfBirth,
      classId,
      className: admitFormData.className,
      classTeacher: teacherName,
      section: admitFormData.section || 'A',
      rollNo: autoRollNo,
      guardianName: admitFormData.guardianName || 'Parent / Guardian',
      guardianPhone: admitFormData.guardianPhone || '+233 24 100 0000',
      guardianEmail: admitFormData.guardianEmail || '',
      address: admitFormData.address || 'Accra, Ghana',
      status: 'Active',
      photoUrl: autoPhoto,
      balanceDue: 0,
      enrollmentDate: new Date().toISOString().split('T')[0]
    });

    setAdmitSuccessBanner(`Pupil ${admitFormData.firstName} ${admitFormData.lastName} successfully registered & admitted to ${admitFormData.className}!`);
    setIsAdmitModalOpen(false);
    setAdmitFormData({
      firstName: '',
      lastName: '',
      gender: 'Male',
      dateOfBirth: '2012-05-15',
      className: 'JHS 2 (Basic 8)',
      section: 'A',
      rollNo: '',
      guardianName: '',
      guardianPhone: '',
      guardianEmail: '',
      address: 'Accra, Ghana',
      photoUrl: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Teacher Profile Banner in Deep Emerald & Gold */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold text-xl shadow-inner shrink-0 border-2 border-amber-300">
              <GraduationCap className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Teacher Workspace
                </span>
                <span className="text-emerald-300 text-xs font-medium">
                  {academicYear} • {currentTerm}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-white mt-1">
                Welcome back, {teacherName}
              </h1>
              <p className="text-xs text-emerald-100/80 mt-0.5">
                Grace White Dove School Complex • Academic Staff Portal
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setCurrentTab('attendance')}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CheckSquare className="w-4 h-4" />
              Take Roll Call
            </button>
            <button
              onClick={() => setCurrentTab('student-grade')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-amber-300" />
              Enter Marks
            </button>
            <button
              onClick={() => setCurrentTab('my-salary')}
              className="bg-white/10 hover:bg-white/20 text-white font-semibold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-white/20 transition-all cursor-pointer"
            >
              <DollarSign className="w-4 h-4 text-amber-300" />
              My Salary
            </button>
          </div>
        </div>
      </div>

      {/* Main Teacher Dashboard Navigation Tabs (Requested Menu Sub-Views) */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1">
          <button
            onClick={() => setCurrentTab('overview')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'overview'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-400" />
            Dashboard Overview
          </button>
          <button
            onClick={() => setCurrentTab('my-students')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'my-students'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-amber-400" />
            My Students ({displayStudents.length})
          </button>
          <button
            onClick={() => setCurrentTab('attendance')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'attendance'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-400" />
            Attendance ({attendanceRate}%)
          </button>
          <button
            onClick={() => setCurrentTab('student-grade')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'student-grade'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Award className="w-4 h-4 text-amber-400" />
            Student Grade
          </button>
          <button
            onClick={() => setCurrentTab('my-salary')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'my-salary'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <DollarSign className="w-4 h-4 text-amber-400" />
            My Salary
          </button>
        </div>
      </div>

      {/* 1. OVERVIEW TAB */}
      {currentTab === 'overview' && (
        <div className="space-y-6">
          {/* Quick Metrics Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">My Class Roster</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <Users className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-['Outfit']">{displayStudents.length}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">JHS 2 (Stream A)</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">100% enrolled & verified</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Today's Attendance</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <CheckSquare className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-800 font-['Outfit']">{attendanceRate}%</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                  {presentCount}/{displayStudents.length} Present
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Live roll-call recorded</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Class Average</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-['Outfit']">{marks.length > 0 ? `${totalClassScoreAvg}%` : '—'}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{marks.length > 0 ? `${marks.length} Assessments` : 'Pending Entries'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{currentTerm} Assessment Overview</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 uppercase">Latest Net Salary</span>
                <div className="w-9 h-9 rounded-xl bg-amber-100 text-emerald-950 flex items-center justify-center">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-emerald-900 font-['Outfit']">{latestPayroll ? `GHS ${latestPayroll.netSalary.toLocaleString()}` : 'GHS 0'}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">{latestPayroll ? latestPayroll.paymentStatus : 'Pending'}</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">{latestPayroll ? `${latestPayroll.month} ${latestPayroll.year}` : 'No active payroll record'}</p>
            </div>
          </div>

          {/* Timetable & Grade Chart Row */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Today's Teaching Schedule & Classes</h3>
                  <p className="text-xs text-slate-400">Classroom allocations and subject periods</p>
                </div>
                <button
                  onClick={() => setActiveTab('timetable')}
                  className="text-xs font-bold text-emerald-800 hover:text-emerald-900 flex items-center gap-1 cursor-pointer"
                >
                  Full Timetable <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="space-y-2.5">
                {timetable.slice(0, 4).map((slot, idx) => (
                  <div
                    key={slot.id || idx}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold flex flex-col items-center justify-center text-xs shrink-0">
                        <span>P{slot.periodNumber || idx + 1}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{slot.subject}</h4>
                        <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                          <span className="font-semibold text-emerald-800">{slot.className}</span>
                          <span>•</span>
                          <span>{slot.room}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-1 rounded-lg border border-slate-200">
                        {slot.timeSlot}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Grade Distribution */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex flex-col">
              <h3 className="font-bold text-sm text-slate-900 mb-1">Class Grade Distribution</h3>
              <p className="text-xs text-slate-400 mb-4">JHS 2 Core Mathematics performance</p>
              <div className="h-56 w-full flex-1">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={gradeDistributionData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                    <XAxis dataKey="grade" tick={{ fontSize: 9, fill: '#64748b' }} />
                    <YAxis tick={{ fontSize: 10, fill: '#64748b' }} allowDecimals={false} />
                    <Tooltip />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]}>
                      {gradeDistributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 2. MY STUDENTS TAB (Requested Component) */}
      {currentTab === 'my-students' && (
        <div className="space-y-4">
          {admitSuccessBanner && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-2xl flex items-center justify-between gap-3 shadow-xs">
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
                <span className="text-xs font-bold">{admitSuccessBanner}</span>
              </div>
              <button
                onClick={() => setAdmitSuccessBanner(null)}
                className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
          )}

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Class Student Directory • JHS 2 (Stream A)</h3>
                <p className="text-xs text-slate-400">Manage enrolled pupils, parents contact, and performance records</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={studentSearch}
                    onChange={(e) => setStudentSearch(e.target.value)}
                    placeholder="Search pupil name, roll #..."
                    className="pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <button
                  onClick={() => setIsAdmitModalOpen(true)}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  Admit / Register Pupil
                </button>
              </div>
            </div>

            {/* Students Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                    <th className="py-3 px-3">Roll #</th>
                    <th className="py-3 px-3">Student Name</th>
                    <th className="py-3 px-3">Class Level</th>
                    <th className="py-3 px-3">Parents Info</th>
                    <th className="py-3 px-3">Attendance</th>
                    <th className="py-3 px-3">Fee Status</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredMyStudents.map((std) => (
                    <tr key={std.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-3 font-mono font-bold text-emerald-900">{std.rollNo}</td>
                      <td className="py-3 px-3">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={std.photoUrl}
                            alt=""
                            className="w-8 h-8 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <span className="font-bold text-slate-900 block">{std.firstName} {std.lastName}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{std.admissionNo}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded-md font-semibold text-[11px]">
                          {std.className}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <div>
                          <p className="font-medium text-slate-800">{std.guardianName}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-0.5"><Phone className="w-2.5 h-2.5 text-emerald-600" /> {std.guardianPhone}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <span className="font-bold text-emerald-700">96%</span>
                        <span className="text-[10px] text-slate-400 block">Regular</span>
                      </td>
                      <td className="py-3 px-3">
                        {std.balanceDue === 0 ? (
                          <span className="text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded text-[10px]">
                            Cleared
                          </span>
                        ) : (
                          <span className="text-amber-700 bg-amber-50 font-bold px-2 py-0.5 rounded text-[10px]">
                            Bal: GHS {std.balanceDue}
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setCurrentTab('student-grade')}
                            className="px-2.5 py-1 text-[10px] font-bold bg-slate-100 hover:bg-emerald-800 hover:text-white rounded-lg text-slate-700 transition-all cursor-pointer"
                          >
                            Marks
                          </button>
                          <button
                            onClick={() => {
                              window.open(`https://wa.me/${std.guardianPhone.replace(/[^0-9]/g, '')}?text=Dear%20Parent%2C%20greetings%20from%20Grace%20White%20Dove%20School%20Complex.`, '_blank');
                            }}
                            className="p-1 text-emerald-700 hover:bg-emerald-50 rounded-lg cursor-pointer"
                            title="WhatsApp Parent"
                          >
                            <MessageSquare className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 3. ATTENDANCE TAB (Requested Component) */}
      {currentTab === 'attendance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="bg-emerald-100 text-emerald-900 font-bold text-[10px] px-2 py-0.5 rounded-full">
                    Live Roll Call
                  </span>
                  <span className="text-xs text-slate-400">Date: {todayStr}</span>
                </div>
                <h3 className="font-bold text-sm text-slate-900 mt-1">Class Attendance Register • JHS 2</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleMarkAllPresent}
                  className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-3 py-1.5 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                >
                  <UserCheck className="w-3.5 h-3.5 text-amber-300" />
                  Mark All Present
                </button>
              </div>
            </div>

            {/* Quick Status Toggles */}
            <div className="divide-y divide-slate-100">
              {displayStudents.map((std) => {
                const rec = todayAttendanceRecords.find((r) => r.studentId === std.id);
                const currentStatus = rec?.status || 'Present';

                return (
                  <div key={std.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-900 font-mono font-bold flex items-center justify-center text-xs">
                        {std.rollNo}
                      </div>
                      <img src={std.photoUrl} alt="" className="w-8 h-8 rounded-full object-cover" />
                      <div>
                        <span className="font-bold text-xs text-slate-900 block">{std.firstName} {std.lastName}</span>
                        <span className="text-[10px] text-slate-400">Parent: {std.guardianName} ({std.guardianPhone})</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 self-end sm:self-auto">
                      {(['Present', 'Late', 'Absent', 'Excused'] as const).map((st) => (
                        <button
                          key={st}
                          onClick={() => markAttendance(std.id, st)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            currentStatus === st
                              ? st === 'Present'
                                ? 'bg-emerald-700 text-white'
                                : st === 'Late'
                                ? 'bg-amber-500 text-white'
                                : st === 'Absent'
                                ? 'bg-rose-600 text-white'
                                : 'bg-blue-600 text-white'
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {st}
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* 4. STUDENT GRADE TAB (Requested Component) */}
      {currentTab === 'student-grade' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Continuous Assessment & Grade Book</h3>
                <p className="text-xs text-slate-400">Classwork (30%), Mid-Term Exam (30%), Final Exam (40%)</p>
              </div>
              <div className="flex items-center gap-2">
                <select
                  value={selectedGradeSubject}
                  onChange={(e) => setSelectedGradeSubject(e.target.value)}
                  className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-1.5 font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="Core Mathematics">Core Mathematics</option>
                  <option value="Integrated Science">Integrated Science</option>
                  <option value="English Language">English Language</option>
                  <option value="ICT & Coding">ICT & Coding</option>
                </select>
                <button
                  onClick={handleSaveGrades}
                  className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-1.5 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
                >
                  Save Marks
                </button>
              </div>
            </div>

            {gradeSaveSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-700" />
                Assessment grades saved successfully for {selectedGradeSubject}!
              </div>
            )}

            {/* Grading Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                    <th className="py-3 px-3">Roll #</th>
                    <th className="py-3 px-3">Student</th>
                    <th className="py-3 px-3">Classwork (30%)</th>
                    <th className="py-3 px-3">Mid-Term (30%)</th>
                    <th className="py-3 px-3">Exam (40%)</th>
                    <th className="py-3 px-3">Total Score</th>
                    <th className="py-3 px-3">Grade</th>
                    <th className="py-3 px-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayStudents.map((std, idx) => {
                    const inputs = gradeInputMap[std.id] || {
                      classwork: 80 - idx * 2,
                      midterm: 85 - idx * 3,
                      exam: 78 - idx * 2
                    };
                    const total = Math.round(inputs.classwork * 0.3 + inputs.midterm * 0.3 + inputs.exam * 0.4);
                    let grade = 'B2';
                    if (total >= 80) grade = 'A1';
                    else if (total >= 70) grade = 'B2';
                    else if (total >= 65) grade = 'B3';
                    else if (total >= 60) grade = 'C4';
                    else grade = 'C5';

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{std.rollNo}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{std.firstName} {std.lastName}</td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inputs.classwork}
                            onChange={(e) =>
                              setGradeInputMap((prev) => ({
                                ...prev,
                                [std.id]: { ...inputs, classwork: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inputs.midterm}
                            onChange={(e) =>
                              setGradeInputMap((prev) => ({
                                ...prev,
                                [std.id]: { ...inputs, midterm: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-3 px-3">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inputs.exam}
                            onChange={(e) =>
                              setGradeInputMap((prev) => ({
                                ...prev,
                                [std.id]: { ...inputs, exam: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="w-16 bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-center font-bold text-slate-800"
                          />
                        </td>
                        <td className="py-3 px-3 font-mono font-bold text-sm text-emerald-950">{total}%</td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${
                              grade === 'A1'
                                ? 'bg-emerald-100 text-emerald-900'
                                : grade === 'B2'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-900'
                            }`}
                          >
                            {grade}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 font-medium">
                          {total >= 80 ? 'Excellent' : total >= 70 ? 'Very Good' : 'Credit'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* 5. MY SALARY TAB (Requested Component) */}
      {currentTab === 'my-salary' && (
        <div className="space-y-6">
          {latestPayroll ? (
            /* Payslip Header Card */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Official Payslip • {latestPayroll.month} {latestPayroll.year}
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Staff Remuneration & Payroll Breakdown</h3>
                  <p className="text-xs text-slate-500">Payslip No: <span className="font-mono font-bold text-emerald-900">{latestPayroll.payslipNo}</span></p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 transition-all cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    Print Slip
                  </button>
                  <button
                    onClick={() => setIsReimburseModalOpen(true)}
                    className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    Claim Reimbursement
                  </button>
                </div>
              </div>

              {/* Salary Breakdown Columns */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Earnings */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                    <TrendingUp className="w-4 h-4" />
                    Gross Earnings
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Salary</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.basicSalary.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Housing Allowance</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.allowances?.housing || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Transport Allowance</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.allowances?.transport || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Medical & Utility</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.allowances?.medical || 0}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Earnings</span>
                      <span className="font-mono text-emerald-900">
                        GHS {(latestPayroll.basicSalary + (latestPayroll.allowances?.housing || 0) + (latestPayroll.allowances?.transport || 0) + (latestPayroll.allowances?.medical || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Deductions */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-rose-800">
                    <AlertCircle className="w-4 h-4" />
                    Statutory Deductions
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>PAYE Income Tax</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.deductions?.tax || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SSNIT Tier 1 & 2</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.deductions?.pension || 0}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Staff Welfare / Loan</span>
                      <span className="font-mono font-bold text-slate-900">GHS {latestPayroll.deductions?.loan || 0}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-700">
                        GHS {((latestPayroll.deductions?.tax || 0) + (latestPayroll.deductions?.pension || 0) + (latestPayroll.deductions?.loan || 0)).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Net Take Home */}
                <div className="p-4 rounded-xl bg-emerald-950 text-white flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                      Net Take-Home Pay
                    </span>
                    <div className="text-3xl font-black font-['Outfit'] text-white mt-1">
                      GHS {latestPayroll.netSalary.toLocaleString()}
                    </div>
                    <p className="text-[11px] text-emerald-200/80 mt-1">
                      Grace White Dove School Complex Official Payroll
                    </p>
                  </div>
                  <div className="pt-3 border-t border-emerald-800/80 text-[11px] flex items-center justify-between">
                    <span className="text-emerald-300">Status</span>
                    <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                      {latestPayroll.paymentStatus}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl p-8 border border-slate-200 shadow-xs text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 mx-auto flex items-center justify-center">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-sm text-slate-900">No Payslip Records Generated Yet</h3>
              <p className="text-xs text-slate-500 max-w-md mx-auto">
                Official staff remuneration and monthly salary slips will appear here once processed by the accounts department.
              </p>
              <button
                onClick={() => setIsReimburseModalOpen(true)}
                className="inline-flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-2 rounded-xl text-xs shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Claim Reimbursement
              </button>
            </div>
          )}

          {/* Reimbursement Claims Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold text-slate-900 uppercase">My Expense & Reimbursement Claims</h4>
              <button
                onClick={() => setIsReimburseModalOpen(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900"
              >
                + New Claim
              </button>
            </div>

            {reimbursements.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                      <th className="py-2.5 px-3">Claim Item</th>
                      <th className="py-2.5 px-3">Category</th>
                      <th className="py-2.5 px-3">Date</th>
                      <th className="py-2.5 px-3">Amount</th>
                      <th className="py-2.5 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {reimbursements.map((rem) => (
                      <tr key={rem.id}>
                        <td className="py-2.5 px-3 font-bold text-slate-900">{rem.title || 'Class Supplies'}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rem.category}</td>
                        <td className="py-2.5 px-3 text-slate-500">{rem.dateSubmitted}</td>
                        <td className="py-2.5 px-3 font-mono font-bold text-emerald-900">GHS {rem.amount}</td>
                        <td className="py-2.5 px-3 text-right">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              rem.status === 'Approved' || rem.status === 'Disbursed'
                                ? 'bg-emerald-50 text-emerald-800'
                                : 'bg-amber-50 text-amber-800'
                            }`}
                          >
                            {rem.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-xs text-slate-400 italic py-2">No reimbursement claims filed.</p>
            )}
          </div>
        </div>
      )}

      {/* Reimbursement Modal */}
      {isReimburseModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-slate-200">
            <h3 className="text-base font-bold text-slate-900 mb-1">Submit Reimbursement Claim</h3>
            <p className="text-xs text-slate-500 mb-4">Class materials, travel or examination logistics expense</p>
            <form onSubmit={handleCreateReimbursement} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Expense Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. STEM Lab Experiment Supplies"
                  value={reimburseForm.title}
                  onChange={(e) => setReimburseForm({ ...reimburseForm, title: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                <select
                  value={reimburseForm.category}
                  onChange={(e) => setReimburseForm({ ...reimburseForm, category: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                >
                  <option value="Class Supplies">Class Supplies</option>
                  <option value="Travel">Travel & Transport</option>
                  <option value="Exam Logistics">Exam Logistics</option>
                  <option value="Stationery">Stationery</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Amount (GHS)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g. 250"
                  value={reimburseForm.amount}
                  onChange={(e) => setReimburseForm({ ...reimburseForm, amount: e.target.value })}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsReimburseModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs cursor-pointer"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Teacher Pupil Registration / Admission Modal */}
      {isAdmitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center font-bold">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Admit Pupil to Class Roster</h3>
                  <p className="text-xs text-slate-400">Teacher Portal • Grace White Dove School Complex</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdmitModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAdmitStudentSubmit} className="mt-4 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">First Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Kwabena"
                    value={admitFormData.firstName}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, firstName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Last Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mensah"
                    value={admitFormData.lastName}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, lastName: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={admitFormData.gender}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, gender: e.target.value as 'Male' | 'Female' })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Birth</label>
                  <input
                    type="date"
                    value={admitFormData.dateOfBirth}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, dateOfBirth: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Class Assigned *</label>
                  <select
                    value={admitFormData.className}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, className: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  >
                    {classes.map((cls) => (
                      <option key={cls.id} value={cls.name}>
                        {cls.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Section / Stream</label>
                  <input
                    type="text"
                    placeholder="e.g. A"
                    value={admitFormData.section}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, section: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Roll / Desk Number</label>
                  <input
                    type="text"
                    placeholder="e.g. 15"
                    value={admitFormData.rollNo}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, rollNo: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                  Parent / Guardian Details
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Dr. Kwame Mensah"
                      value={admitFormData.guardianName}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, guardianName: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Guardian Phone (Login Key) *</label>
                    <input
                      type="tel"
                      required
                      placeholder="e.g. +233 24 456 7890"
                      value={admitFormData.guardianPhone}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, guardianPhone: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Residential Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Hse No 14, East Legon, Accra"
                    value={admitFormData.address}
                    onChange={(e) => setAdmitFormData({ ...admitFormData, address: e.target.value })}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsAdmitModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-800 hover:bg-emerald-900 text-white shadow-xs cursor-pointer flex items-center gap-1.5"
                >
                  <CheckCircle className="w-4 h-4 text-amber-300" />
                  Admit to Class
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
