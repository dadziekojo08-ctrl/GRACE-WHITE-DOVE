import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import {
  GraduationCap,
  CreditCard,
  Calendar,
  History,
  CheckCircle2,
  Clock,
  ArrowRight,
  Printer,
  Download,
  AlertCircle,
  FileText,
  Award,
  BookOpen,
  ChevronRight,
  DollarSign,
  Receipt,
  Sparkles,
  ShieldCheck,
  Phone,
  UserCheck,
  Layers,
  TrendingUp
} from 'lucide-react';
import { PaystackModal } from '../paystack/PaystackModal';
import { Payment, Student } from '../../types';

export const ParentDashboard: React.FC = () => {
  const {
    currentUser,
    students,
    invoices,
    payments,
    marks,
    attendance,
    calendarEvents,
    setActiveTab,
    academicYear,
    currentTerm
  } = useSchool();

  const fallbackWard: Student = {
    id: 'std-ward-01',
    admissionNo: 'ADM-PENDING',
    firstName: 'Student',
    lastName: 'Ward',
    gender: 'Male',
    dateOfBirth: '',
    classId: '',
    className: 'Not Assigned',
    classTeacher: '',
    section: 'A',
    rollNo: '',
    guardianName: currentUser?.name || 'Parent / Guardian',
    guardianPhone: currentUser?.phone || '',
    guardianEmail: currentUser?.email || '',
    address: '',
    status: 'Active',
    photoUrl: '',
    joinedDate: new Date().toISOString().slice(0, 10),
    balanceDue: 0
  };

  // Find parent's ward (or match by studentId / guardianEmail / parent name)
  const defaultStudent =
    (currentUser?.studentId &&
      students.find((s) => s.id === currentUser.studentId || s.admissionNo === currentUser.studentId)) ||
    students.find(
      (s) =>
        (currentUser?.email && s.guardianEmail?.toLowerCase() === currentUser.email.toLowerCase()) ||
        (currentUser?.phone && s.guardianPhone === currentUser.phone)
    ) ||
    students[0] ||
    fallbackWard;

  const [selectedStudentId, setSelectedStudentId] = useState<string>(defaultStudent?.id || fallbackWard.id);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const ward = students.find((s) => s.id === selectedStudentId) || defaultStudent || fallbackWard;

  // Ward Invoices & Payments from live state
  const wardInvoices = invoices.filter((inv) => inv.studentId === ward.id);
  const rawInvoice = wardInvoices[0];
  const currentInvoice = rawInvoice || {
    id: `inv-${ward.id}`,
    invoiceNo: `INV-${academicYear.slice(0, 4)}-${ward.rollNo || '00'}`,
    studentId: ward.id,
    studentName: `${ward.firstName} ${ward.lastName}`.trim(),
    className: ward.className,
    academicYear,
    term: currentTerm,
    issueDate: new Date().toISOString().slice(0, 10),
    dueDate: '',
    items: [],
    totalAmount: 0,
    paidAmount: 0,
    balance: 0,
    status: 'Paid' as const
  };

  const wardPayments = payments.filter((p) => p.studentId === ward.id);
  const displayPayments: Payment[] = wardPayments;

  // Dynamic Ward Marks
  const wardMarks = marks.filter((m) => m.studentId === ward.id);
  const averageScore =
    wardMarks.length > 0
      ? Math.round(wardMarks.reduce((sum, m) => sum + m.totalScore, 0) / wardMarks.length)
      : 0;

  // Dynamic Attendance
  const wardAttendance = attendance.filter((a) => a.studentId === ward.id);
  const presentDays = wardAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate =
    wardAttendance.length > 0 ? Math.round((presentDays / wardAttendance.length) * 100) : 0;

  // Upcoming School Calendar Events
  const upcomingEvents = calendarEvents.slice(0, 5);

  const handlePrintReceipt = (payment: Payment) => {
    setSelectedReceipt(payment);
    setTimeout(() => {
      window.print();
    }, 200);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. PARENT WELCOME & WARD BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="bg-amber-400 text-emerald-950 font-black text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Parent & Guardian Portal
              </span>
              <span className="text-emerald-300 text-xs font-semibold">
                {academicYear} • {currentTerm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Welcome, {currentUser?.name || 'Parent / Guardian'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-emerald-100/90">
              <div className="flex items-center gap-1.5 bg-emerald-900/80 px-2.5 py-1 rounded-lg border border-emerald-700">
                <GraduationCap className="w-4 h-4 text-amber-400" />
                <span className="font-bold">Ward: {ward.firstName} {ward.lastName}</span>
              </div>
              <span className="text-emerald-300">•</span>
              <span className="font-medium">Class: <strong className="text-white">{ward.className || 'Not Assigned'}</strong></span>
              <span className="text-emerald-300">•</span>
              <span>Adm No: <strong className="text-white">{ward.admissionNo || 'N/A'}</strong></span>
            </div>
          </div>

          {/* Prompt Paystack Action Button in Top Banner */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            <button
              onClick={() => setIsPaystackOpen(true)}
              className="bg-[#0ba4db] hover:bg-[#0993c5] text-white font-extrabold px-5 py-3 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-lg shadow-[#0ba4db]/25 transition-all hover:scale-[1.02] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Pay Fees with Paystack</span>
              <span className="bg-white/20 text-[10px] px-2 py-0.5 rounded uppercase tracking-wider font-bold">
                Instant MoMo / Card
              </span>
            </button>
            <button
              onClick={() => setActiveTab('my-child')}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <UserCheck className="w-4 h-4" />
              <span>Full Ward Profile</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUMMARY METRICS TILES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Outstanding Fees */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">School Fees Balance</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 font-['Outfit']">
                GHS {currentInvoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Total Bill: GHS {currentInvoice.totalAmount.toLocaleString()} • Paid: GHS {currentInvoice.paidAmount.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                currentInvoice.balance === 0
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {currentInvoice.balance === 0 ? 'Fully Cleared' : currentInvoice.status}
            </span>
            <button
              onClick={() => setIsPaystackOpen(true)}
              className="text-[11px] font-bold text-[#0ba4db] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Pay Now →
            </button>
          </div>
        </div>

        {/* Metric 2: Academic Performance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Academic Grade</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 font-['Outfit']">{wardMarks.length > 0 ? `${averageScore}%` : '—'}</span>
              <p className="text-[11px] font-semibold text-emerald-700 mt-1">
                {wardMarks.length > 0 ? `${wardMarks.length} Subject(s) Assessed` : 'Pending terminal entries'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold text-slate-500">Terminal Report</span>
            <button
              onClick={() => setActiveTab('my-child')}
              className="text-[11px] font-bold text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
            >
              Report Card →
            </button>
          </div>
        </div>

        {/* Metric 3: Attendance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Attendance Rate</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-black text-slate-900 font-['Outfit']">{wardAttendance.length > 0 ? `${attendanceRate}%` : '0%'}</span>
              <p className="text-[11px] text-slate-500 mt-1">
                {presentDays} Days Present / {wardAttendance.length} Academic Records
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              {attendanceRate >= 80 ? 'Regular' : 'Active Term'}
            </span>
            <span className="text-[11px] text-slate-400">{currentTerm}</span>
          </div>
        </div>

        {/* Metric 4: Next Calendar Milestone */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Next Key Date</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <Calendar className="w-4 h-4" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-lg font-extrabold text-slate-900 line-clamp-1">
                {upcomingEvents[0]?.title || 'Academic Session'}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                {upcomingEvents[0]?.startDate ? `Date: ${upcomingEvents[0].startDate}` : 'Schedule in progress'}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span className="text-[10px] font-bold bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded">
              {upcomingEvents[0]?.category || 'Academic'}
            </span>
            <span className="text-[11px] text-slate-400">All Levels</span>
          </div>
        </div>
      </div>

      {/* 3. SECTION GRID: ACADEMIC REPORT & SCHOOL FEES WITH PAYSTACK */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* LEFT COLUMN: ACADEMIC REPORT PREVIEW (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Card: Academic Report Highlights */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                  <Award className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Academic Report Summary</h3>
                  <p className="text-xs text-slate-400">Current performance overview for {ward.firstName} {ward.lastName}</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('my-child')}
                className="text-xs font-bold text-emerald-800 hover:text-emerald-900 bg-emerald-50 px-3 py-1.5 rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
              >
                Detailed Report Card <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Subject Scores Table */}
            {wardMarks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-100 text-slate-400 font-bold uppercase text-[10px]">
                      <th className="pb-2.5">Subject</th>
                      <th className="pb-2.5 text-center">Class (30%)</th>
                      <th className="pb-2.5 text-center">Exam (70%)</th>
                      <th className="pb-2.5 text-center">Total (100%)</th>
                      <th className="pb-2.5 text-right">Grade</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wardMarks.map((sub, idx) => (
                      <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-2.5 font-bold text-slate-800">{sub.subjectName}</td>
                        <td className="py-2.5 text-center text-slate-600 font-mono">{sub.classScore}</td>
                        <td className="py-2.5 text-center text-slate-600 font-mono">{sub.examScore}</td>
                        <td className="py-2.5 text-center font-bold text-slate-900 font-mono">{sub.totalScore}%</td>
                        <td className="py-2.5 text-right">
                          <span className="font-extrabold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-[11px]">
                            {sub.grade}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Award className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">No Assessment Records Yet</p>
                <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
                  Terminal assessment marks and examination scores will appear here once teachers record them.
                </p>
              </div>
            )}

            {/* Teacher Remarks Box */}
            <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-200/80 text-xs">
              <span className="font-bold text-slate-800 block mb-1">Class Teacher's Status:</span>
              <p className="text-slate-600 italic">
                {ward.classTeacher
                  ? `Assigned Class Tutor: ${ward.classTeacher}`
                  : 'Teacher remarks will be appended to the official end-of-term terminal report.'}
              </p>
            </div>
          </div>

          {/* Card: School Calendar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
                  <Calendar className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">School Calendar & Events</h3>
                  <p className="text-xs text-slate-400">Important academic milestones and holidays</p>
                </div>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {currentTerm}
              </span>
            </div>

            {upcomingEvents.length > 0 ? (
              <div className="space-y-2.5">
                {upcomingEvents.map((evt) => (
                  <div
                    key={evt.id}
                    className="p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all flex items-start justify-between gap-3"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-white border border-slate-200 flex flex-col items-center justify-center text-[10px] shrink-0 font-bold">
                        <span className="text-indigo-600 leading-tight">{evt.startDate.split('-')[1] || '08'}</span>
                        <span className="text-slate-900 text-xs font-black leading-none">{evt.startDate.split('-')[2] || '01'}</span>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{evt.title}</h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">{evt.description}</p>
                      </div>
                    </div>
                    <span
                      className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded shrink-0 ${
                        evt.category === 'Examination'
                          ? 'bg-rose-100 text-rose-800'
                          : evt.category === 'Meeting'
                          ? 'bg-amber-100 text-amber-900'
                          : evt.category === 'Holiday'
                          ? 'bg-indigo-100 text-indigo-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {evt.category}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Calendar className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">No Calendar Events Scheduled</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Events published by administration will appear here.</p>
              </div>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: SCHOOL FEES & PAYSTACK INITIATION & PAYMENT HISTORY (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Card: Paystack School Fees Callout */}
          <div className="bg-gradient-to-br from-[#0ba4db]/10 via-white to-emerald-50/30 rounded-2xl p-5 border border-[#0ba4db]/30 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="font-black text-xl text-[#0ba4db] tracking-tight">paystack</span>
                <span className="text-[10px] font-bold uppercase bg-[#0ba4db]/15 text-[#0ba4db] px-2 py-0.5 rounded">
                  Official Gateway
                </span>
              </div>
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>

            <div>
              <span className="text-xs font-semibold text-slate-500">Current Outstanding Balance:</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-3xl font-black text-slate-900 font-['Outfit']">
                  GHS {currentInvoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
              <p className="text-xs text-slate-600 mt-1">
                For {currentInvoice.term}, {currentInvoice.academicYear} {currentInvoice.dueDate ? `• Due Date: ${currentInvoice.dueDate}` : ''}
              </p>
            </div>

            {/* Fee Itemized Breakdown */}
            <div className="bg-white/80 backdrop-blur-xs rounded-xl p-3.5 border border-slate-200 text-xs space-y-2">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Fee Invoice Summary ({currentInvoice.invoiceNo})
              </div>
              {(currentInvoice.items || []).map((item, idx) => (
                <div key={idx} className="flex justify-between text-slate-600 text-[11px]">
                  <span className="truncate pr-2">{item.description}</span>
                  <span className="font-semibold text-slate-800 font-mono">GHS {item.amount}</span>
                </div>
              ))}
              <div className="pt-2 border-t border-slate-100 flex justify-between font-bold text-slate-900">
                <span>Total Term Fee</span>
                <span className="font-mono">GHS {currentInvoice.totalAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold text-[11px]">
                <span>Total Paid</span>
                <span className="font-mono">- GHS {currentInvoice.paidAmount.toLocaleString()}</span>
              </div>
            </div>

            {/* Big Paystack Button */}
            <button
              onClick={() => setIsPaystackOpen(true)}
              className="w-full bg-[#0ba4db] hover:bg-[#088bbb] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0ba4db]/30 transition-all hover:scale-[1.01] cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              <span>Initiate Payment with Paystack (GHS {currentInvoice.balance})</span>
            </button>

            <div className="flex items-center justify-center gap-3 text-[10px] text-slate-400 font-medium pt-1">
              <span>✓ MTN MoMo</span>
              <span>•</span>
              <span>✓ Telecel Cash</span>
              <span>•</span>
              <span>✓ Visa / Mastercard</span>
            </div>
          </div>

          {/* Card: Fee Payment History */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
                  <History className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">Fee Payment History</h3>
                  <p className="text-xs text-slate-400">Verified transactions & payment receipts</p>
                </div>
              </div>
            </div>

            {displayPayments.length > 0 ? (
              <div className="space-y-3">
                {displayPayments.map((p) => (
                  <div
                    key={p.id}
                    className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-slate-100/60 transition-all space-y-2"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-900">GHS {p.amount.toLocaleString()}</span>
                          <span className="text-[9px] font-extrabold bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                            {p.status}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{p.channel || p.paymentMethod}</p>
                      </div>
                      <button
                        onClick={() => handlePrintReceipt(p)}
                        className="p-1.5 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-emerald-800 hover:border-emerald-700 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                        title="Print Official Digital Receipt"
                      >
                        <Receipt className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </div>
                    <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-200/60 font-mono">
                      <span>Ref: {p.reference || p.paymentRef || p.id}</span>
                      <span>{p.paymentDate || p.date}</span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center">
                <Receipt className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs font-semibold text-slate-700">No Payment History Recorded</p>
                <p className="text-[11px] text-slate-400 mt-0.5">Verified fee transactions will appear here.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Paystack Modal Component */}
      <PaystackModal
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        invoice={currentInvoice.totalAmount > 0 ? currentInvoice : undefined}
        customAmount={currentInvoice.balance > 0 ? currentInvoice.balance : 500}
        studentName={`${ward.firstName} ${ward.lastName}`}
        studentId={ward.id}
      />
    </div>
  );
};
