import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';
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
  GraduationCap,
  CalendarDays,
  Edit2,
  ShieldCheck,
  Eye,
  Briefcase,
  Check,
  Lock,
  Shield
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
import { calculateGradeForClass, isLowerPrimaryOrPreschool } from '../../utils/jhsGrading';
import { TimetableManagement } from '../timetable/TimetableManagement';
import { getSubjectBadgeColor } from '../../utils/timetableUtils';
import {
  getAllowedClassesForTeacher,
  isJHSTeacher,
  isJHSClass,
  normalizeClassKey,
  canTeacherAccessClass
} from '../../utils/classAccess';

export type TeacherDashboardTab =
  | 'overview'
  | 'my-students'
  | 'attendance'
  | 'student-grade'
  | 'timetable'
  | 'my-salary'
  | 'teachers-oversight';

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
    staff,
    addStaff,
    payrolls,
    generateMonthlyPayroll,
    reimbursements,
    addReimbursement,
    announcements,
    setActiveTab,
    currentTerm,
    academicYear,
    authUsers
  } = useSchool();

  const [currentTab, setCurrentTab] = useState<TeacherDashboardTab>(initialTab);
  const [studentSearch, setStudentSearch] = useState('');
  const [selectedGradeSubject, setSelectedGradeSubject] = useState('Core Mathematics');
  const [gradeInputMap, setGradeInputMap] = useState<{ [studentId: string]: { rawScore: number } }>({});
  const [gradeSaveSuccess, setGradeSaveSuccess] = useState(false);
  const [isReimburseModalOpen, setIsReimburseModalOpen] = useState(false);
  const [reimburseForm, setReimburseForm] = useState({
    title: '',
    category: 'Class Supplies',
    amount: ''
  });

  // Access Control: Admin oversight vs Strict Teacher Private Portal
  const isAdminRole = activeRole === 'Admin' || currentUser?.role === 'Admin';

  // Extract all teachers in the institution (for Admin oversight)
  const allTeachers = useMemo(() => {
    const list: Array<{
      id: string;
      name: string;
      email: string;
      staffCode: string;
      assignedClass?: string;
      designation: string;
      department: string;
      phone: string;
      basicSalary: number;
    }> = [];

    // From staff list
    staff.forEach((s) => {
      const isTeacher =
        s.role === 'Teacher' ||
        s.designation.toLowerCase().includes('teacher') ||
        classes.some((c) => c.classTeacher?.toLowerCase() === s.name.toLowerCase());
      if (isTeacher && !list.some((item) => item.name.toLowerCase() === s.name.toLowerCase())) {
        const assigned = classes.find((c) => c.classTeacher?.toLowerCase() === s.name.toLowerCase())?.name;
        list.push({
          id: s.id,
          name: s.name,
          email: s.email,
          staffCode: s.staffCode || `TCH-${s.id.slice(0, 4)}`,
          assignedClass: assigned,
          designation: s.designation || 'Class Teacher',
          department: s.department || 'Academic',
          phone: s.phone || '+233 24 000 0000',
          basicSalary: s.basicSalary || 2800
        });
      }
    });

    // From auth users
    (authUsers || []).forEach((u) => {
      if (u.role === 'Teacher' && !list.some((item) => item.name.toLowerCase() === u.name.toLowerCase())) {
        const assigned = u.assignedClass || classes.find((c) => c.classTeacher?.toLowerCase() === u.name.toLowerCase())?.name;
        list.push({
          id: u.id,
          name: u.name,
          email: u.email,
          staffCode: u.staffCode || `TCH-${u.id.slice(0, 4)}`,
          assignedClass: assigned,
          designation: assigned ? `Class Teacher (${assigned})` : 'Class Teacher',
          department: 'Academic',
          phone: u.phone || '+233 24 000 0000',
          basicSalary: 2800
        });
      }
    });

    return list;
  }, [staff, authUsers, classes]);

  // Admin teacher inspector state (Admin can inspect any teacher; Teacher CANNOT inspect others)
  const [inspectedTeacherId, setInspectedTeacherId] = useState<string | null>(null);

  const activeTeacher = useMemo(() => {
    // If admin is inspecting a specific teacher
    if (isAdminRole && inspectedTeacherId) {
      return allTeachers.find((t) => t.id === inspectedTeacherId) || allTeachers[0] || null;
    }
    // If admin has not picked yet, default to first teacher
    if (isAdminRole && allTeachers.length > 0) {
      return allTeachers[0];
    }
    // If actual Teacher logged in, strictly enforce their OWN profile
    if (currentUser) {
      const matchInStaff = staff.find((s) => s.name.toLowerCase() === currentUser.name.toLowerCase());
      return {
        id: currentUser.id,
        name: currentUser.name,
        email: currentUser.email,
        staffCode: currentUser.staffCode || 'TCH-001',
        assignedClass: currentUser.assignedClass || classes.find((c) => c.classTeacher?.toLowerCase() === currentUser.name.toLowerCase())?.name,
        designation: currentUser.assignedClass ? `Class Teacher (${currentUser.assignedClass})` : 'Class Teacher',
        department: 'Academic',
        phone: currentUser.phone || '+233 24 000 0000',
        basicSalary: matchInStaff?.basicSalary || 2800
      };
    }
    return allTeachers[0] || null;
  }, [isAdminRole, inspectedTeacherId, allTeachers, currentUser, classes, staff]);

  const teacherName = activeTeacher?.name || currentUser?.name || 'Teacher / Staff';
  const teacherEmail = activeTeacher?.email || currentUser?.email || '';
  const teacherAssignedClass = activeTeacher?.assignedClass || currentUser?.assignedClass;

  // Teacher Oversight Roster filter & search (Admin mode)
  const [teacherSearch, setTeacherSearch] = useState('');

  // Class Scope & JHS Multi-Class Switching Access
  const teacherContext = useMemo(() => {
    return {
      id: activeTeacher?.id || currentUser?.id,
      name: teacherName,
      role: (activeTeacher ? 'Teacher' : (currentUser?.role || activeRole)),
      assignedClass: teacherAssignedClass,
      designation: activeTeacher?.designation || (currentUser as any)?.designation,
      department: activeTeacher?.department || (currentUser as any)?.department
    };
  }, [activeTeacher, currentUser, activeRole, teacherName, teacherAssignedClass]);

  const isTeacherJHS = useMemo(() => isJHSTeacher(teacherContext), [teacherContext]);
  const teacherAllowedClasses = useMemo(() => {
    return getAllowedClassesForTeacher(teacherContext, classes, isAdminRole && !inspectedTeacherId);
  }, [teacherContext, classes, isAdminRole, inspectedTeacherId]);

  // JHS teachers can switch between JHS 1, JHS 2, JHS 3 or All JHS
  const [jhsActiveFilter, setJhsActiveFilter] = useState<string>('All JHS');

  // Pupil Registration within Teacher Portal
  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [admitSuccessBanner, setAdmitSuccessBanner] = useState<string | null>(null);
  const [admitFormData, setAdmitFormData] = useState({
    firstName: '',
    lastName: '',
    gender: 'Male' as 'Male' | 'Female',
    dateOfBirth: '2015-05-15',
    className: teacherAssignedClass || teacherAllowedClasses[0]?.name || 'Primary 1 (Grade 1)',
    section: 'A',
    rollNo: '',
    guardianName: '',
    guardianPhone: '',
    guardianEmail: '',
    address: 'Cape Coast, Ghana',
    photoUrl: ''
  });

  // Display students strictly scoped by teacher role:
  // - Class 1 teacher: strictly Class 1 students only! No access to Class 2 or Creche.
  // - JHS teacher: can switch across JHS 1, JHS 2, and JHS 3!
  // - Admin (not inspecting): all students.
  const displayStudents = useMemo(() => {
    if (isAdminRole && !inspectedTeacherId) {
      return students;
    }

    if (isTeacherJHS) {
      return students.filter((s) => {
        if (!isJHSClass(s.className)) return false;
        if (jhsActiveFilter === 'All JHS') return true;
        return normalizeClassKey(s.className) === normalizeClassKey(jhsActiveFilter);
      });
    }

    const targetClass = teacherAssignedClass || teacherAllowedClasses[0]?.name || 'Primary 1 (Grade 1)';
    const targetKey = normalizeClassKey(targetClass);
    return students.filter((s) => normalizeClassKey(s.className) === targetKey);
  }, [isAdminRole, inspectedTeacherId, isTeacherJHS, jhsActiveFilter, teacherAssignedClass, teacherAllowedClasses, students]);

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

  // Teacher's payroll records - strictly matching this teacher's name or ID (no leaking other teachers' slips!)
  const teacherPayrolls = useMemo(() => {
    const tLower = (teacherName || '').toLowerCase();
    const tId = activeTeacher?.id;
    return payrolls.filter((p) => {
      if (tLower && p.staffName && p.staffName.toLowerCase().includes(tLower)) return true;
      if (tId && p.staffId === tId) return true;
      if (currentUser?.id && p.staffId === currentUser.id) return true;
      return false;
    });
  }, [payrolls, teacherName, activeTeacher, currentUser]);

  const [selectedPayrollId, setSelectedPayrollId] = useState<string>('');
  const latestPayroll =
    teacherPayrolls.find((p) => p.id === selectedPayrollId) || teacherPayrolls[0] || null;

  // Teacher's reimbursements - strictly private to this teacher!
  const myReimbursements = useMemo(() => {
    const tLower = (teacherName || '').toLowerCase();
    const tId = activeTeacher?.id;
    return reimbursements.filter((r) => {
      if (tLower && r.staffName && r.staffName.toLowerCase().includes(tLower)) return true;
      if (tId && r.staffId === tId) return true;
      if (currentUser?.id && r.staffId === currentUser.id) return true;
      return false;
    });
  }, [reimbursements, teacherName, activeTeacher, currentUser]);

  // Handler to generate official payslip for current month
  const [payrollGenMessage, setPayrollGenMessage] = useState<string | null>(null);
  const handleGenerateMyCurrentSlip = () => {
    const currentMonth = new Date().toLocaleString('default', { month: 'long' });
    const currentYear = new Date().getFullYear();

    // Ensure teacher is registered in staff list so SchoolContext creates the payroll record
    const existsInStaff = staff.some(
      (s) => s.name.toLowerCase() === teacherName.toLowerCase() || (activeTeacher?.id && s.id === activeTeacher.id)
    );
    if (!existsInStaff && teacherName) {
      addStaff({
        staffCode: activeTeacher?.staffCode || `STF-${Math.floor(100 + Math.random() * 900)}`,
        name: teacherName,
        email: teacherEmail || `${teacherName.toLowerCase().replace(/\s/g, '.')}@gracewhitedove.edu.gh`,
        role: 'Teacher',
        designation: teacherAssignedClass ? `Class Teacher (${teacherAssignedClass})` : 'Class Teacher',
        department: 'Academic',
        phone: activeTeacher?.phone || '+233 24 000 0000',
        basicSalary: activeTeacher?.basicSalary || 2800,
        status: 'Active',
        qualification: 'Bachelor of Education (B.Ed)'
      });
    }

    generateMonthlyPayroll(currentMonth, currentYear);
    setPayrollGenMessage(`Generated official ${currentMonth} ${currentYear} payslip for ${teacherName}!`);
    setTimeout(() => setPayrollGenMessage(null), 4000);
  };

  // Grade distributions dynamically from marks
  const subjectMarks = marks.filter((m) => !selectedGradeSubject || m.subject === selectedGradeSubject || m.subjectName === selectedGradeSubject);
  const totalClassScoreAvg = marks.length > 0 ? Math.round(marks.reduce((acc, m) => acc + (m.score || m.totalScore || 0), 0) / marks.length) : 0;

  const gradeDistributionData = [
    { grade: 'A (80-100%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 80).length, fill: '#059669' },
    { grade: 'B+ (75-79%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 75 && (m.score || m.totalScore || 0) < 80).length, fill: '#10b981' },
    { grade: 'B (70-74%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 70 && (m.score || m.totalScore || 0) < 75).length, fill: '#34d399' },
    { grade: 'C+ (65-69%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 65 && (m.score || m.totalScore || 0) < 70).length, fill: '#6ee7b7' },
    { grade: 'C (60-64%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 60 && (m.score || m.totalScore || 0) < 65).length, fill: '#f59e0b' },
    { grade: 'D+ (55-59%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 55 && (m.score || m.totalScore || 0) < 60).length, fill: '#fbbf24' },
    { grade: 'D (50-54%)', count: marks.filter((m) => (m.score || m.totalScore || 0) >= 50 && (m.score || m.totalScore || 0) < 55).length, fill: '#f97316' },
    { grade: 'E (<50%)', count: marks.filter((m) => (m.score || m.totalScore || 0) < 50).length, fill: '#ef4444' }
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
    displayStudents.forEach((s, idx) => {
      const inputs = gradeInputMap[s.id] || { rawScore: Math.max(50, 85 - idx * 3) };
      const rawScore = Math.min(100, Math.max(0, inputs.rawScore));
      const gradeResult = calculateGradeForClass(rawScore, s.className);

      recordMark({
        examId: 'ex-term-01',
        studentId: s.id,
        studentName: `${s.firstName} ${s.lastName}`,
        className: s.className,
        subject: selectedGradeSubject,
        score: rawScore,
        totalScore: rawScore,
        maxMarks: 100,
        grade: gradeResult.grade,
        gradePoint: gradeResult.gradePoint,
        interpretation: gradeResult.interpretation,
        remarks: rawScore >= 80 ? 'Outstanding performance and high diligence' : rawScore >= 70 ? 'Good comprehension and steady effort' : rawScore >= 50 ? 'Satisfactory progress' : 'Requires remedial attention'
      });
    });
    setGradeSaveSuccess(true);
    setTimeout(() => setGradeSaveSuccess(false), 3000);
  };

  const handleCreateReimbursement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reimburseForm.title || !reimburseForm.amount) return;
    addReimbursement({
      staffId: activeTeacher?.id || currentUser?.id || 'stf-002',
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
      address: admitFormData.address || 'Cape Coast, Ghana',
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
      address: 'Cape Coast, Ghana',
      photoUrl: ''
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Administrator Oversight Header Bar (Visible only to Admin role) */}
      {isAdminRole && (
        <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-700 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="bg-amber-400 text-slate-950 text-[10px] font-black uppercase px-2 py-0.5 rounded-full">
                  Admin Oversight
                </span>
                <span className="text-xs text-slate-300">Total Teachers: {allTeachers.length}</span>
              </div>
              <h3 className="text-sm font-bold text-white mt-0.5">
                Faculty & Teacher Portal Oversight Control
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <label htmlFor="teacher-inspector-select" className="text-xs font-semibold text-slate-300">
                Inspect Teacher:
              </label>
              <select
                id="teacher-inspector-select"
                value={activeTeacher?.id || ''}
                onChange={(e) => {
                  setInspectedTeacherId(e.target.value);
                  if (currentTab === 'teachers-oversight') {
                    setCurrentTab('overview');
                  }
                }}
                className="bg-slate-800 text-white border border-slate-600 rounded-xl px-3 py-1.5 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
              >
                {allTeachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name} — {t.assignedClass || t.designation || 'Teacher'}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setCurrentTab('teachers-oversight')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'teachers-oversight'
                  ? 'bg-amber-400 text-slate-950 shadow-sm'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700'
              }`}
            >
              <Eye className="w-4 h-4 text-amber-300" />
              All Teachers Roster ({allTeachers.length})
            </button>
          </div>
        </div>
      )}

      {/* Teacher Profile Banner in Deep Emerald & Gold */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="absolute right-0 top-0 -mt-8 -mr-8 h-48 w-48 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <SchoolLogo
              alt="Grace White Dove"
              className="w-14 h-14 rounded-2xl object-contain bg-white p-1 shadow-inner shrink-0 border-2 border-amber-300"
            />
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                  Teacher Workspace
                </span>
                {isTeacherJHS ? (
                  <span className="bg-emerald-800/90 text-amber-300 border border-amber-400/40 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <GraduationCap className="w-3 h-3 text-amber-400" />
                    JHS Department Faculty (JHS 1 to 3)
                  </span>
                ) : teacherAssignedClass ? (
                  <span className="bg-emerald-800/90 text-amber-300 border border-amber-400/40 font-bold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-300" />
                    Class: {teacherAssignedClass} (Locked Scope)
                  </span>
                ) : null}
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

        {/* JHS Class Switcher OR Single Class Lockdown Notification */}
        {isTeacherJHS ? (
          <div className="mt-5 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" />
                JHS Class Switcher:
              </span>
              <div className="inline-flex rounded-xl bg-emerald-950/80 p-1 border border-emerald-700/80">
                {(['All JHS', 'JHS 1 (Grade 7)', 'JHS 2 (Grade 8)', 'JHS 3 (Grade 9)'] as const).map((cls) => {
                  const isActive = jhsActiveFilter === cls;
                  const label = cls === 'All JHS' ? 'All JHS (1 – 3)' : cls.replace(' (Grade ', ' (B').replace(')', ')');
                  return (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => setJhsActiveFilter(cls)}
                      className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-emerald-950 shadow-xs'
                          : 'text-emerald-200 hover:text-white hover:bg-emerald-800/50'
                      }`}
                    >
                      {label}
                    </button>
                  );
                })}
              </div>
            </div>
            <span className="text-[11px] text-emerald-200/90 font-medium">
              Viewing: <strong className="text-white">{jhsActiveFilter === 'All JHS' ? 'All JHS Students' : jhsActiveFilter}</strong> ({displayStudents.length} Students)
            </span>
          </div>
        ) : (!isAdminRole || inspectedTeacherId) ? (
          <div className="mt-5 pt-3 border-t border-emerald-800/80 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-emerald-100">
              <Shield className="w-4 h-4 text-amber-300 shrink-0" />
              <span>
                Class Scope: <strong className="text-white">{teacherAssignedClass || teacherAllowedClasses[0]?.name || 'Primary 1 (Grade 1)'}</strong>
              </span>
              <span className="bg-amber-400/20 text-amber-300 border border-amber-400/40 px-2 py-0.5 rounded text-[10px] font-bold">
                Access to other classes or Creche is restricted
              </span>
            </div>
            <span className="text-[11px] text-emerald-200/90">
              Enrolled Pupils: <strong className="text-white">{displayStudents.length}</strong>
            </span>
          </div>
        ) : null}
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
            onClick={() => setCurrentTab('timetable')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === 'timetable'
                ? 'bg-emerald-900 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CalendarDays className="w-4 h-4 text-amber-400" />
            My Timetable
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
          {isAdminRole && (
            <button
              onClick={() => setCurrentTab('teachers-oversight')}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                currentTab === 'teachers-oversight'
                  ? 'bg-amber-400 text-slate-950 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-amber-600" />
              Faculty Oversight Roster ({allTeachers.length})
            </button>
          )}
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
                  <p className="text-xs text-slate-400">Classroom allocations, period start times and subjects</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setCurrentTab('timetable')}
                    className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 hover:bg-emerald-100 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3 h-3" /> Edit Timetable
                  </button>
                  <button
                    onClick={() => setCurrentTab('timetable')}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                  >
                    Full Schedule <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div>
                {(() => {
                  const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
                  const todayDayName = dayNames[new Date().getDay()];
                  const effectiveDay = (todayDayName === 'Saturday' || todayDayName === 'Sunday') ? 'Monday' : todayDayName;
                  
                  const myTodayLessons = timetable.filter(t => {
                    const matchDay = t.day === effectiveDay;
                    if (!matchDay) return false;
                    if (teacherAssignedClass && t.className === teacherAssignedClass) return true;
                    if (teacherName && (t.teacherName || '').toLowerCase().includes(teacherName.toLowerCase())) return true;
                    return false;
                  });

                  const displayLessons = myTodayLessons.length > 0
                    ? myTodayLessons
                    : (teacherAssignedClass ? timetable.filter(t => t.className === teacherAssignedClass).slice(0, 5) : timetable.slice(0, 5));

                  if (displayLessons.length === 0) {
                    return (
                      <div className="p-8 text-center rounded-xl bg-slate-50 border border-dashed border-slate-200">
                        <CalendarDays className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">No Lessons Scheduled for {effectiveDay}</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">You can set up lesson timings, start times, and subjects directly.</p>
                        <button
                          onClick={() => setCurrentTab('timetable')}
                          className="mt-3 px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer shadow-xs"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" />
                          Edit Class Timetable
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-2.5">
                      {displayLessons.map((slot, idx) => (
                        <div
                          key={slot.id || idx}
                          onClick={() => setCurrentTab('timetable')}
                          className="p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/20 transition-all flex items-center justify-between gap-3 cursor-pointer group"
                          title="Click to edit lesson or change time/subject"
                        >
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-900 font-extrabold flex flex-col items-center justify-center text-xs shrink-0 group-hover:bg-emerald-800 group-hover:text-amber-300 transition-colors">
                              <span>P{slot.periodNumber || idx + 1}</span>
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">{slot.subject}</h4>
                                <span className={`text-[10px] px-2 py-0.2 rounded-md font-semibold border ${getSubjectBadgeColor(slot.subject)}`}>
                                  {slot.day}
                                </span>
                              </div>
                              <div className="flex items-center gap-2 text-[11px] text-slate-500 mt-0.5">
                                <span className="font-semibold text-emerald-800">{slot.className}</span>
                                <span>•</span>
                                <span>{slot.room || 'Classroom'}</span>
                                {slot.teacherName && (
                                  <>
                                    <span>•</span>
                                    <span className="text-slate-600">{slot.teacherName}</span>
                                  </>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2.5 py-1 rounded-lg border border-slate-200">
                              {slot.timeSlot}
                            </span>
                            <span className="text-xs text-emerald-800 font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                              <Edit2 className="w-3 h-3" /> Edit
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
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
                    <th className="py-3 px-3">Status</th>
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
                        <span className="text-emerald-700 bg-emerald-50 font-bold px-2 py-0.5 rounded text-[10px]">
                          {std.status || 'Active'}
                        </span>
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
                <p className="text-xs text-slate-400">JHS Raw Score Conversion Scheme (80-100 A to Below 50 E)</p>
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
                    <th className="py-3 px-3 text-center">Raw Score (0-100)</th>
                    {isLowerPrimaryOrPreschool(teacherAssignedClass || displayStudents[0]?.className) ? (
                      <th className="py-3 px-3 text-center">Position</th>
                    ) : (
                      <th className="py-3 px-3 text-center">Grade</th>
                    )}
                    <th className="py-3 px-3">Interpretation</th>
                    <th className="py-3 px-3 text-right">Remarks</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {displayStudents.map((std, idx) => {
                    const inputs = gradeInputMap[std.id] || {
                      rawScore: Math.max(50, 85 - idx * 3)
                    };
                    const rawScore = Math.min(100, Math.max(0, inputs.rawScore));
                    const gradeResult = calculateGradeForClass(rawScore, std.className);
                    const isLower = isLowerPrimaryOrPreschool(std.className);

                    return (
                      <tr key={std.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-3 font-mono font-bold text-slate-800">{std.rollNo}</td>
                        <td className="py-3 px-3 font-bold text-slate-900">{std.firstName} {std.lastName}</td>
                        <td className="py-3 px-3 text-center">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={inputs.rawScore}
                            onChange={(e) =>
                              setGradeInputMap((prev) => ({
                                ...prev,
                                [std.id]: { rawScore: parseInt(e.target.value) || 0 }
                              }))
                            }
                            className="w-20 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1 text-center font-bold text-slate-800 focus:ring-2 focus:ring-emerald-700 outline-none"
                          />
                        </td>
                        {isLower ? (
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-black border ${gradeResult.badgeClass}`}>
                              {gradeResult.position || gradeResult.grade}
                            </span>
                          </td>
                        ) : (
                          <td className="py-3 px-3 text-center">
                            <span className={`px-2.5 py-0.5 rounded text-[11px] font-black border ${gradeResult.badgeClass}`}>
                              Grade {gradeResult.grade}
                            </span>
                          </td>
                        )}
                        <td className="py-3 px-3 font-semibold text-slate-700">
                          {gradeResult.interpretation}
                        </td>
                        <td className="py-3 px-3 text-right text-slate-500 font-medium italic text-[11px]">
                          {rawScore >= 80 ? 'Outstanding performance' : rawScore >= 70 ? 'Good comprehension' : 'Satisfactory progress'}
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

      {/* 5. TIMETABLE TAB (Teacher Self-Editing Timetable & Schedule) */}
      {currentTab === 'timetable' && (
        <TimetableManagement isTeacherPortalView={true} preselectedClass={teacherAssignedClass} />
      )}

      {/* 6. MY SALARY TAB (Strictly Private to Logged-in Teacher, with Month Selector & Payslip Generation) */}
      {currentTab === 'my-salary' && (
        <div className="space-y-6">
          {payrollGenMessage && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-900 px-4 py-3 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-700" />
              {payrollGenMessage}
            </div>
          )}

          {latestPayroll ? (
            /* Payslip Header Card */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="bg-emerald-100 text-emerald-900 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                      Official Payslip • {latestPayroll.month} {latestPayroll.year}
                    </span>
                    <span className="bg-slate-100 text-slate-700 font-bold text-[10px] px-2 py-0.5 rounded-full">
                      Staff: {latestPayroll.staffName}
                    </span>
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Staff Remuneration & Payroll Breakdown</h3>
                  <p className="text-xs text-slate-500">
                    Payslip No: <span className="font-mono font-bold text-emerald-900">{latestPayroll.payslipNo}</span>
                  </p>
                </div>

                <div className="flex items-center gap-2 flex-wrap">
                  {teacherPayrolls.length > 1 && (
                    <select
                      value={latestPayroll.id}
                      onChange={(e) => setSelectedPayrollId(e.target.value)}
                      className="bg-slate-50 border border-slate-300 rounded-xl px-2.5 py-1.5 text-xs font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-700 cursor-pointer"
                    >
                      {teacherPayrolls.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.month} {p.year} (GHS {p.netSalary.toLocaleString()})
                        </option>
                      ))}
                    </select>
                  )}
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
            /* Fallback: Official Contract Remuneration Structure & One-Click Payslip Generation */
            <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                <div>
                  <span className="bg-amber-100 text-amber-900 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                    Faculty Contract Remuneration
                  </span>
                  <h3 className="text-xl font-bold text-slate-900 mt-1">Staff Salary Structure & Entitlements</h3>
                  <p className="text-xs text-slate-500">
                    Faculty Member: <span className="font-bold text-slate-800">{teacherName}</span> • Standard GES/GWDS Academic Grade
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleGenerateMyCurrentSlip}
                    className="bg-emerald-800 hover:bg-emerald-900 text-white font-bold px-4 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Check className="w-4 h-4 text-amber-300" />
                    Generate Current Month Payslip
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

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-emerald-800">
                    <TrendingUp className="w-4 h-4" />
                    Scheduled Earnings
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>Basic Contract Salary</span>
                      <span className="font-mono font-bold text-slate-900">GHS {(activeTeacher?.basicSalary || 2800).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Housing Allowance (15%)</span>
                      <span className="font-mono font-bold text-slate-900">GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.15)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Transport Allowance (10%)</span>
                      <span className="font-mono font-bold text-slate-900">GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.10)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>Medical & Utility (5%)</span>
                      <span className="font-mono font-bold text-slate-900">GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.05)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Gross Remuneration</span>
                      <span className="font-mono text-emerald-900">
                        GHS {Math.round((activeTeacher?.basicSalary || 2800) * 1.30).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 text-rose-800">
                    <AlertCircle className="w-4 h-4" />
                    Estimated Statutory Deductions
                  </h4>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-600">
                      <span>PAYE Income Tax (GRA)</span>
                      <span className="font-mono font-bold text-slate-900">GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.18)}</span>
                    </div>
                    <div className="flex justify-between text-slate-600">
                      <span>SSNIT Pension (Tier 1 & 2)</span>
                      <span className="font-mono font-bold text-slate-900">GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.055)}</span>
                    </div>
                    <div className="pt-2 border-t border-slate-200 flex justify-between font-bold text-slate-900">
                      <span>Total Deductions</span>
                      <span className="font-mono text-rose-700">
                        GHS {Math.round((activeTeacher?.basicSalary || 2800) * 0.235).toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-emerald-950 text-white flex flex-col justify-between space-y-4">
                  <div>
                    <span className="text-[10px] font-extrabold text-amber-300 uppercase tracking-wider block">
                      Estimated Net Salary
                    </span>
                    <div className="text-3xl font-black font-['Outfit'] text-white mt-1">
                      GHS {Math.round((activeTeacher?.basicSalary || 2800) * 1.065).toLocaleString()}
                    </div>
                    <p className="text-[11px] text-emerald-200/80 mt-1">
                      Click &apos;Generate Current Month Payslip&apos; to process your official payslip.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-emerald-800/80 text-[11px] flex items-center justify-between">
                    <span className="text-emerald-300">Contract Status</span>
                    <span className="bg-emerald-700 text-white font-bold px-2 py-0.5 rounded">
                      Active Staff
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Reimbursement Claims Table - Strictly Private to this Teacher */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase">My Expense & Reimbursement Claims</h4>
                <p className="text-[11px] text-slate-500">Personal claims submitted by {teacherName}</p>
              </div>
              <button
                onClick={() => setIsReimburseModalOpen(true)}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 cursor-pointer"
              >
                + New Claim
              </button>
            </div>

            {myReimbursements.length > 0 ? (
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
                    {myReimbursements.map((rem) => (
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
              <p className="text-xs text-slate-400 italic py-2">No personal reimbursement claims filed by {teacherName}.</p>
            )}
          </div>
        </div>
      )}

      {/* 7. ADMIN OVERSIGHT: ALL TEACHERS ROSTER (Visible only to Admin) */}
      {currentTab === 'teachers-oversight' && isAdminRole && (
        <div className="space-y-6">
          {/* Top Oversight Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Teaching Faculty</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-['Outfit']">{allTeachers.length}</span>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">All Registered</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Full teaching staff directory</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Assigned Class Teachers</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                  {allTeachers.filter((t) => t.assignedClass).length}
                </span>
                <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">Active Leads</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Leading specific grade levels</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Total Timetable Slots</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-2xl font-black text-slate-900 font-['Outfit']">{timetable.length}</span>
                <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">Scheduled</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Weekly lesson periods covered</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
              <span className="text-xs font-semibold text-slate-500 uppercase">Monthly Payroll Budget</span>
              <div className="mt-3 flex items-baseline gap-2">
                <span className="text-xl font-black text-slate-900 font-['Outfit']">
                  GHS {allTeachers.reduce((acc, t) => acc + (t.basicSalary || 2800), 0).toLocaleString()}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-1">Base monthly teaching remuneration</p>
            </div>
          </div>

          {/* Teachers Oversight Directory Table */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-slate-900">Administrator Faculty Oversight Roster</h3>
                <p className="text-xs text-slate-500">Monitor all teachers, class allocations, timetable workload, and payroll status</p>
              </div>

              <div className="relative w-full sm:w-72">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search teacher by name or class..."
                  value={teacherSearch}
                  onChange={(e) => setTeacherSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-amber-400 outline-none"
                />
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 font-bold border-y border-slate-100">
                    <th className="py-3 px-3">Teacher</th>
                    <th className="py-3 px-3">Staff Code</th>
                    <th className="py-3 px-3">Assigned Class</th>
                    <th className="py-3 px-3 text-center">Timetable Workload</th>
                    <th className="py-3 px-3">Basic Salary</th>
                    <th className="py-3 px-3 text-center">Payroll Slips</th>
                    <th className="py-3 px-3 text-right">Oversight Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {allTeachers
                    .filter(
                      (t) =>
                        teacherSearch === '' ||
                        t.name.toLowerCase().includes(teacherSearch.toLowerCase()) ||
                        (t.assignedClass && t.assignedClass.toLowerCase().includes(teacherSearch.toLowerCase())) ||
                        t.staffCode.toLowerCase().includes(teacherSearch.toLowerCase())
                    )
                    .map((t) => {
                      // Calculate weekly lessons
                      const tLower = t.name.toLowerCase();
                      const teacherSlots = timetable.filter(
                        (entry) =>
                          (entry.teacherName && entry.teacherName.toLowerCase().includes(tLower)) ||
                          (t.assignedClass && entry.className?.toLowerCase() === t.assignedClass.toLowerCase())
                      );
                      const teacherSlipCount = payrolls.filter(
                        (p) => p.staffName.toLowerCase().includes(tLower) || p.staffId === t.id
                      ).length;

                      return (
                        <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3 px-3 font-bold text-slate-900">
                            <div className="flex items-center gap-2">
                              <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-bold flex items-center justify-center text-xs">
                                {t.name.charAt(0)}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900">{t.name}</div>
                                <div className="text-[10px] text-slate-400 font-normal">{t.email}</div>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-3 font-mono font-semibold text-slate-600">{t.staffCode}</td>
                          <td className="py-3 px-3">
                            {t.assignedClass ? (
                              <span className="bg-emerald-50 border border-emerald-200 text-emerald-900 font-bold px-2 py-0.5 rounded text-[11px]">
                                {t.assignedClass}
                              </span>
                            ) : (
                              <span className="text-slate-400 italic text-[11px]">Subject Specialist</span>
                            )}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span className="font-mono font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded text-[11px]">
                              {teacherSlots.length} periods/wk
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-slate-900">
                            GHS {t.basicSalary.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-center">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                teacherSlipCount > 0
                                  ? 'bg-emerald-50 text-emerald-800'
                                  : 'bg-amber-50 text-amber-800'
                              }`}
                            >
                              {teacherSlipCount > 0 ? `${teacherSlipCount} Slips Generated` : 'Pending Generation'}
                            </span>
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setInspectedTeacherId(t.id);
                                setCurrentTab('overview');
                              }}
                              className="bg-emerald-900 hover:bg-emerald-950 text-amber-400 font-bold px-3 py-1.5 rounded-lg text-xs flex items-center gap-1.5 ml-auto cursor-pointer shadow-xs"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Inspect Portal
                            </button>
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
                  {(!isAdminRole || inspectedTeacherId) && !isTeacherJHS && teacherAllowedClasses.length === 1 ? (
                    <div className="w-full bg-slate-100 border border-slate-300 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Lock className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{teacherAllowedClasses[0].name}</span>
                      </div>
                      <span className="text-[9px] bg-amber-100 text-amber-900 px-1.5 py-0.5 rounded font-extrabold">Assigned Class</span>
                    </div>
                  ) : (
                    <select
                      value={admitFormData.className}
                      onChange={(e) => setAdmitFormData({ ...admitFormData, className: e.target.value })}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-800 cursor-pointer"
                    >
                      {(isTeacherJHS ? teacherAllowedClasses : classes).map((cls) => (
                        <option key={cls.id} value={cls.name}>
                          {cls.name}
                        </option>
                      ))}
                    </select>
                  )}
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
                    placeholder="e.g. Hse No 14, Pedu Estate, Cape Coast"
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
