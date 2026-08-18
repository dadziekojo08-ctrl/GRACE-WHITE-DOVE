import React from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  Users,
  Briefcase,
  CheckCircle,
  CreditCard,
  BookOpen,
  Bus,
  TrendingUp,
  AlertCircle,
  Calendar,
  ArrowUpRight,
  UserPlus,
  QrCode,
  FileSpreadsheet,
  Layers,
  Building,
  GraduationCap,
  Sparkles,
  BadgeCheck,
  School
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

export const DashboardOverview: React.FC<{
  onOpenPaystack: () => void;
  onOpenGateScanner: () => void;
}> = ({ onOpenPaystack, onOpenGateScanner }) => {
  const {
    students,
    staff,
    classes,
    admissions,
    attendance,
    payments,
    invoices,
    books,
    bookIssues,
    routes,
    announcements,
    setActiveTab,
    currentTerm,
    academicYear
  } = useSchool();

  // Dynamic Real-time Metrics calculations from SchoolContext
  const totalStudents = students.length;
  const activeStudents = students.filter((s) => s.status === 'Active').length;
  const maleStudents = students.filter((s) => s.gender === 'Male').length;
  const femaleStudents = students.filter((s) => s.gender === 'Female').length;
  const pendingAdmissions = admissions.filter((a) => a.status === 'Pending' || a.status === 'Interview Scheduled').length;

  const totalStaff = staff.length;
  const activeStaff = staff.filter((s) => s.status === 'Active').length;
  const teachingStaff = staff.filter((s) => s.role === 'Teacher').length;
  const nonTeachingStaff = staff.filter((s) => s.role !== 'Teacher').length;
  const staffOnLeave = staff.filter((s) => s.status === 'On Leave').length;

  const totalClassesCount = classes.length;
  const totalDeskCapacity = classes.reduce((sum, c) => sum + (Number(c.capacity) || 0), 0);
  const enrolledClassCount = classes.reduce((sum, c) => sum + (Number(c.enrolledCount) || 0), 0);
  const totalEnrolled = totalStudents > 0 ? totalStudents : enrolledClassCount;
  const occupancyRate = totalDeskCapacity > 0 ? Math.round((totalEnrolled / totalDeskCapacity) * 100) : 0;

  const totalFeesCollected = payments.reduce((acc, curr) => acc + curr.amount, 0);
  const totalOutstandingFees = invoices.reduce((acc, curr) => acc + curr.balance, 0);
  const activeRoutesCount = routes.length;
  const activeBookIssues = bookIssues.filter((i) => i.status === 'Issued' || i.status === 'Overdue').length;

  const todayPresentCount = attendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate = attendance.length > 0 ? Math.round((todayPresentCount / attendance.length) * 100) : 0;

  // Dynamically calculate Monthly Revenue Data from live payments & invoices
  const monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
  const monthlyRevenueData = monthLabels.map((month, idx) => {
    const monthPayments = payments.filter((p) => {
      const dateStr = p.date || p.paymentDate || '';
      const d = new Date(dateStr);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    });
    const collected = monthPayments.reduce((acc, p) => acc + p.amount, 0);
    const target = invoices.length > 0 ? Math.round(invoices.reduce((acc, i) => acc + i.totalAmount, 0) / 8) : 0;
    return { month, collected, target };
  });

  // Dynamically calculate class attendance from live attendance records
  const classAttendanceData = classes.length > 0
    ? classes.slice(0, 6).map((cls) => {
        const classStudents = students.filter((s) => s.className?.toLowerCase() === cls.name.toLowerCase() || s.classId === cls.id);
        const studentIds = new Set(classStudents.map((s) => s.id));
        const classAtt = attendance.filter((a) => studentIds.has(a.studentId));
        const presentCount = classAtt.filter((a) => a.status === 'Present' || a.status === 'Late').length;
        const rate = classAtt.length > 0 ? Math.round((presentCount / classAtt.length) * 100) : 0;
        return {
          class: cls.name.replace(/Primary /i, 'Pri ').replace(/Junior High School /i, 'JHS '),
          rate
        };
      })
    : [
        { class: 'KG 1-2', rate: 0 },
        { class: 'Pri 1-3', rate: 0 },
        { class: 'Pri 4-6', rate: 0 },
        { class: 'JHS 1', rate: 0 },
        { class: 'JHS 2', rate: 0 },
        { class: 'JHS 3', rate: 0 }
      ];

  const femaleRatio = totalStudents > 0 ? Math.round((femaleStudents / totalStudents) * 100) : 0;
  const maleRatio = totalStudents > 0 ? Math.round((maleStudents / totalStudents) * 100) : 0;
  const genderData = [
    { name: 'Female Students', value: femaleRatio, count: femaleStudents, color: '#059669' },
    { name: 'Male Students', value: maleRatio, count: maleStudents, color: '#f59e0b' }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Welcome Banner in Rich Green and Gold */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white shadow-md border border-emerald-700/50">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-52 w-52 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                {academicYear} • {currentTerm}
              </span>
              <span className="text-emerald-300 text-xs font-medium">Academic Session Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              Grace White Dove School Complex Administration
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Unified institutional management for academic excellence, real-time fee settlement with Paystack, and staff & student records.
            </p>
          </div>

          {/* Quick Hub Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveTab('classes')}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-emerald-950" />
              Classes & Desk Capacity
            </button>
            <button
              onClick={() => setActiveTab('staff')}
              className="bg-emerald-800 hover:bg-emerald-700 text-white font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm border border-emerald-600 transition-all cursor-pointer"
            >
              <Briefcase className="w-4 h-4 text-amber-300" />
              Staff Management
            </button>
            <button
              onClick={() => setActiveTab('admissions')}
              className="bg-white text-emerald-900 hover:bg-emerald-50 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-emerald-700" />
              New Admission
            </button>
            <button
              onClick={onOpenPaystack}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-3.5 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-emerald-950" />
              Pay Fees (Paystack)
            </button>
            <button
              onClick={onOpenGateScanner}
              className="bg-emerald-700/80 hover:bg-emerald-600 text-white font-semibold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-emerald-600 transition-all cursor-pointer"
            >
              <QrCode className="w-4 h-4 text-amber-300" />
              Gate Scanner
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        {/* Total Students */}
        <div 
          onClick={() => setActiveTab('students')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Students</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{totalStudents}</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
              {activeStudents} Active
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{maleStudents} Male • {femaleStudents} Female</span>
            {pendingAdmissions > 0 ? (
              <span className="text-amber-700 font-semibold">{pendingAdmissions} Pending Adm</span>
            ) : (
              <span className="text-slate-400">Creche - JHS 3</span>
            )}
          </div>
        </div>

        {/* Total Staff */}
        <div 
          onClick={() => setActiveTab('staff')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Staff</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
              <Briefcase className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{totalStaff}</span>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              {activeStaff} Active Faculty
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{teachingStaff} Teaching • {nonTeachingStaff} Support</span>
            {staffOnLeave > 0 ? (
              <span className="text-amber-700 font-semibold">{staffOnLeave} on leave</span>
            ) : (
              <span className="text-emerald-700 font-semibold">100% Present</span>
            )}
          </div>
        </div>

        {/* Active Classes */}
        <div 
          onClick={() => setActiveTab('classes')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Classes</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 group-hover:bg-amber-500 group-hover:text-emerald-950 flex items-center justify-center transition-all">
              <Layers className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-slate-900 font-['Outfit']">{totalClassesCount}</span>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              {totalDeskCapacity} Total Desks
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{occupancyRate}% Capacity Filled</span>
            <span>{Math.max(0, totalDeskCapacity - totalStudents)} Desks Left</span>
          </div>
        </div>

        {/* Daily Attendance Rate */}
        <div 
          onClick={() => setActiveTab('attendance')}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-emerald-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Attendance</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 group-hover:bg-emerald-600 group-hover:text-white flex items-center justify-center transition-all">
              <CheckCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-emerald-800 font-['Outfit']">{attendanceRate}%</span>
            <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
              Today
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>{todayPresentCount} of {totalStudents} scanned</span>
            <span className="text-emerald-700 font-semibold">{totalStudents - todayPresentCount > 0 ? `${totalStudents - todayPresentCount} Absent` : 'Full Attendance'}</span>
          </div>
        </div>

        {/* Fee Collection & Paystack */}
        <div 
          onClick={onOpenPaystack}
          className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Fee Collection</span>
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-900 group-hover:bg-amber-400 group-hover:text-emerald-950 flex items-center justify-center transition-all">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-black text-emerald-950 font-['Outfit']">
              GHS {(totalFeesCollected / 1000).toFixed(1)}k
            </span>
            <span className="text-[11px] font-bold text-amber-900 bg-amber-100 border border-amber-300 px-2 py-0.5 rounded-full">
              Paystack
            </span>
          </div>
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>Bal: GHS {totalOutstandingFees.toLocaleString()}</span>
            <span className="text-amber-800 font-semibold flex items-center gap-0.5">Pay Online →</span>
          </div>
        </div>
      </div>

      {/* Main Charts & Analytics Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue / Fee Collections Area Chart */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Fee Collection & Revenue Growth (GHS)</h3>
              <p className="text-xs text-slate-400">Monthly breakdown of tuition and levies collected</p>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-emerald-700 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"></span> Collected
              </span>
              <span className="flex items-center gap-1 text-amber-600 font-semibold">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block"></span> Target
              </span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyRevenueData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCollected" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#059669" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#059669" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="colorTarget" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={(val) => `${val / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`GHS ${val.toLocaleString()}`, '']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#059669" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCollected)" name="Actual Collected" />
                <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={2} strokeDasharray="4 4" fillOpacity={1} fill="url(#colorTarget)" name="Projected Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Class Attendance Bar Chart */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-bold text-sm text-slate-900">Attendance by Class</h3>
              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">This Week</span>
            </div>
            <p className="text-xs text-slate-400 mb-4">Roll-call averages per level</p>

            <div className="h-52 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={classAttendanceData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="class" stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <YAxis domain={[0, 100]} stroke="#94a3b8" fontSize={10} tickLine={false} />
                  <Tooltip
                    formatter={(val: number) => [`${val}% Attendance`, '']}
                    contentStyle={{ backgroundColor: '#ffffff', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '12px' }}
                  />
                  <Bar dataKey="rate" fill="#047857" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
            <span className="text-slate-500">Overall Average:</span>
            <span className="font-bold text-emerald-800">{attendanceRate}%</span>
          </div>
        </div>
      </div>

      {/* Bottom Grid: Recent Notices, Quick Stats & Logistics */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logistics & Ancillary Quick Stats */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs space-y-4">
          <h3 className="font-bold text-sm text-slate-900">Campus Facilities & Operations</h3>

          <div className="space-y-3">
            <div
              onClick={() => setActiveTab('library')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <BookOpen className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Library Catalog</h4>
                  <p className="text-[11px] text-slate-400">{books.length} Books • {activeBookIssues} Issued</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </div>

            <div
              onClick={() => setActiveTab('transport')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-amber-50/50 border border-slate-100 hover:border-amber-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Bus className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-amber-900">School Transport Fleet</h4>
                  <p className="text-[11px] text-slate-400">{activeRoutesCount} Active Routes • Real-time GPS</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-amber-700" />
            </div>

            <div
              onClick={() => setActiveTab('timetable')}
              className="p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/50 border border-slate-100 hover:border-emerald-200 transition-all flex items-center justify-between cursor-pointer group"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center group-hover:scale-105 transition-transform">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800 group-hover:text-emerald-900">Weekly Master Timetable</h4>
                  <p className="text-[11px] text-slate-400">Monday — Friday • 8 Periods/Day</p>
                </div>
              </div>
              <ArrowUpRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700" />
            </div>
          </div>
        </div>

        {/* Urgent Bulletins & Announcements */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-xs">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-bold text-sm text-slate-900">Official Announcements & Communications</h3>
            <button
              onClick={() => setActiveTab('communication')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-900"
            >
              View All Bulletins →
            </button>
          </div>

          <div className="space-y-3">
            {announcements.map((ann) => (
              <div
                key={ann.id}
                className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-emerald-50/30 transition-all"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        ann.priority === 'Urgent'
                          ? 'bg-red-100 text-red-800'
                          : ann.priority === 'High'
                          ? 'bg-amber-100 text-amber-900'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ann.category} • {ann.priority}
                    </span>
                    <span className="text-xs text-slate-400">{ann.date}</span>
                  </div>
                  <span className="text-[11px] font-semibold text-slate-500">{ann.author}</span>
                </div>
                <h4 className="font-bold text-xs text-slate-900 mt-2">{ann.title}</h4>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed">{ann.message}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
