import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';
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
  TrendingUp,
  X,
  CheckCircle
} from 'lucide-react';
import { PaystackModal, FeePaymentCategory } from '../paystack/PaystackModal';
import { Payment, Student } from '../../types';
import { calculateGradeForClass, isLowerPrimaryOrPreschool } from '../../utils/jhsGrading';
import { getInvoiceFinancialBreakdown, computeWardFinancials } from '../../utils/feeBreakdown';
import { OfficialPaymentReceiptModal } from '../fees/OfficialPaymentReceiptModal';
import { downloadPaymentReceiptPdf } from '../../utils/receiptPdfGenerator';

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
  const [paystackConfig, setPaystackConfig] = useState<{
    isOpen: boolean;
    customAmount?: number;
    category?: FeePaymentCategory;
  }>({
    isOpen: false
  });
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

  const openPaystack = (category?: FeePaymentCategory, amount?: number) => {
    setPaystackConfig({
      isOpen: true,
      category,
      customAmount: amount
    });
  };

  const ward = students.find((s) => s.id === selectedStudentId) || defaultStudent || fallbackWard;
  const wardFullName = `${ward.firstName} ${ward.lastName}`.toLowerCase().trim();

  // Reconciled Ward Financials (instantly deducts all Cash Desk, MoMo, Paystack, Bank payments)
  const {
    currentInvoice,
    invBreakdown,
    totalBilled,
    totalPaid,
    balanceDue,
    isFullyCleared
  } = useMemo(() => {
    return computeWardFinancials(ward, invoices, payments, academicYear, currentTerm);
  }, [ward, invoices, payments, academicYear, currentTerm]);

  const wardPayments = payments
    .filter(
      (p) =>
        p.studentId === ward.id ||
        p.studentId === ward.admissionNo ||
        (p.admissionNo && p.admissionNo === ward.admissionNo) ||
        (p.studentName && p.studentName.toLowerCase().trim() === wardFullName)
    )
    .sort((a, b) => new Date(b.paymentDate || b.date || '').getTime() - new Date(a.paymentDate || a.date || '').getTime());

  const displayPayments: Payment[] = wardPayments;
  const latestReceipt = displayPayments[0] || null;

  const handleDownloadReceipt = (p: Payment) => {
    downloadPaymentReceiptPdf({
      payment: p,
      student: ward,
      academicYear,
      term: currentTerm
    });
  };

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
              onClick={() => openPaystack('Combined', balanceDue > 0 ? balanceDue : 500)}
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
                GHS {balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
              <p className="text-[11px] text-slate-500 mt-1">
                Total Bill: GHS {totalBilled.toLocaleString()} • Paid & Deducted: GHS {totalPaid.toLocaleString()}
              </p>
            </div>
          </div>
          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
            <span
              className={`text-[10px] font-extrabold px-2 py-0.5 rounded ${
                isFullyCleared
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-amber-100 text-amber-900'
              }`}
            >
              {isFullyCleared ? 'Fully Cleared' : currentInvoice.status}
            </span>
            <button
              onClick={() => openPaystack('Combined', balanceDue > 0 ? balanceDue : 500)}
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
                      <th className="pb-2.5 text-center">Raw Score</th>
                      {isLowerPrimaryOrPreschool(ward.className) ? (
                        <th className="pb-2.5 text-center">Position</th>
                      ) : (
                        <th className="pb-2.5 text-center">Grade</th>
                      )}
                      <th className="pb-2.5 text-right">Interpretation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {wardMarks.map((sub, idx) => {
                      const totalSc = sub.totalScore ?? sub.score ?? 0;
                      const gradeRes = calculateGradeForClass(totalSc, ward.className, sub.specialStatus);
                      const isLower = isLowerPrimaryOrPreschool(ward.className);

                      return (
                        <tr key={idx} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-2.5 font-bold text-slate-800">{sub.subjectName || sub.subject}</td>
                          <td className="py-2.5 text-center font-bold text-slate-900 font-mono">
                            {sub.specialStatus === 'IC' ? 'IC' : sub.specialStatus === 'Audit' ? 'AUDIT' : `${totalSc}%`}
                          </td>
                          {isLower ? (
                            <td className="py-2.5 text-center">
                              <span className={`font-black px-2 py-0.5 rounded text-[11px] border ${gradeRes.badgeClass}`}>
                                {gradeRes.position || gradeRes.grade}
                              </span>
                            </td>
                          ) : (
                            <td className="py-2.5 text-center">
                              <span className={`font-black px-2 py-0.5 rounded text-[11px] border ${gradeRes.badgeClass}`}>
                                {gradeRes.grade}
                              </span>
                            </td>
                          )}
                          <td className="py-2.5 text-right font-medium text-slate-700 text-[11px]">
                            {gradeRes.interpretation}
                          </td>
                        </tr>
                      );
                    })}
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
          {/* Card 0: Immediate Latest Receipt Notice (if payments have occurred) */}
          {latestReceipt && (
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-2xl p-4 shadow-sm border border-emerald-700/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 border border-emerald-600/60 shadow-xs">
                  <Receipt className="w-5 h-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">Latest Verified Payment Receipt</span>
                    <span className="text-[9px] font-black uppercase bg-amber-400 text-emerald-950 px-2 py-0.5 rounded font-mono">
                      #{latestReceipt.paymentRef || latestReceipt.receiptNo || latestReceipt.id}
                    </span>
                  </div>
                  <p className="text-[11px] text-emerald-200 mt-0.5">
                    GHS {Number(latestReceipt.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })} credited via {latestReceipt.channel || latestReceipt.paymentMethod} on {latestReceipt.paymentDate || latestReceipt.date}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedReceipt(latestReceipt)}
                className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black rounded-xl shrink-0 cursor-pointer shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
                title="View & Print Official Signed Receipt Voucher"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>View Receipt</span>
              </button>
            </div>
          )}

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
                  GHS {balanceDue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                {isFullyCleared && (
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    Fully Cleared
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1">
                For {currentInvoice.term}, {currentInvoice.academicYear} {currentInvoice.dueDate ? `• Due Date: ${currentInvoice.dueDate}` : ''}
              </p>
            </div>

            {/* Itemized Fee Deduction & Breakdown Cards */}
            <div className="bg-white/90 backdrop-blur-xs rounded-xl p-3.5 border border-slate-200 text-xs space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Itemized Fee Breakdown ({currentInvoice.invoiceNo})
                </span>
                <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                  Live Ledger Deductions Active
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tuition / Fees Balance</span>
                    <span className={`font-bold font-mono text-xs ${invBreakdown.netTermFeesDue === 0 && invBreakdown.termFees > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      GHS {invBreakdown.netTermFeesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {invBreakdown.paidFees > 0 ? (
                      <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                        {invBreakdown.netTermFeesDue === 0 ? '✓ Cleared & Deducted' : `Deducted: GHS ${invBreakdown.paidFees.toLocaleString()}`}
                        <span className="text-slate-400 font-normal block">Billed: GHS {invBreakdown.termFees.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Billed: GHS {invBreakdown.termFees.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {invBreakdown.netTermFeesDue > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaystack('Fees', invBreakdown.netTermFeesDue)}
                      className="mt-1 text-[10px] text-[#0ba4db] hover:underline font-bold text-left cursor-pointer"
                    >
                      Pay Tuition &rarr;
                    </button>
                  )}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Books Balance</span>
                    <span className={`font-bold font-mono text-xs ${invBreakdown.netBooksDue === 0 && invBreakdown.books > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      GHS {invBreakdown.netBooksDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {invBreakdown.paidBooks > 0 ? (
                      <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                        {invBreakdown.netBooksDue === 0 ? '✓ Cleared & Deducted' : `Deducted: GHS ${invBreakdown.paidBooks.toLocaleString()}`}
                        <span className="text-slate-400 font-normal block">Billed: GHS {invBreakdown.books.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Billed: GHS {invBreakdown.books.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {invBreakdown.netBooksDue > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaystack('Books', invBreakdown.netBooksDue)}
                      className="mt-1 text-[10px] text-[#0ba4db] hover:underline font-bold text-left cursor-pointer"
                    >
                      Pay Books &rarr;
                    </button>
                  )}
                </div>
                <div className="p-2 bg-slate-50 rounded-lg border border-slate-100 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Accessories Balance</span>
                    <span className={`font-bold font-mono text-xs ${invBreakdown.netAccessoriesDue === 0 && invBreakdown.accessories > 0 ? 'text-emerald-700' : 'text-slate-900'}`}>
                      GHS {invBreakdown.netAccessoriesDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {invBreakdown.paidAccessories > 0 ? (
                      <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                        {invBreakdown.netAccessoriesDue === 0 ? '✓ Cleared & Deducted' : `Deducted: GHS ${invBreakdown.paidAccessories.toLocaleString()}`}
                        <span className="text-slate-400 font-normal block">Billed: GHS {invBreakdown.accessories.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-slate-400 block mt-0.5">
                        Billed: GHS {invBreakdown.accessories.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {invBreakdown.netAccessoriesDue > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaystack('Accessories', invBreakdown.netAccessoriesDue)}
                      className="mt-1 text-[10px] text-[#0ba4db] hover:underline font-bold text-left cursor-pointer"
                    >
                      Pay Uniforms &rarr;
                    </button>
                  )}
                </div>
                <div className="p-2 bg-amber-50 rounded-lg border border-amber-200 flex flex-col justify-between">
                  <div>
                    <span className="text-[10px] text-amber-800 block uppercase font-bold">Arrears Balance</span>
                    <span className={`font-bold font-mono text-xs ${invBreakdown.netArrearsDue === 0 && invBreakdown.arrears > 0 ? 'text-emerald-700' : 'text-amber-950'}`}>
                      GHS {invBreakdown.netArrearsDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                    {invBreakdown.paidArrears > 0 ? (
                      <span className="text-[9px] text-emerald-700 font-bold block mt-0.5">
                        {invBreakdown.netArrearsDue === 0 ? '✓ Cleared & Deducted' : `Deducted: GHS ${invBreakdown.paidArrears.toLocaleString()}`}
                        <span className="text-amber-700/60 font-normal block">Prior: GHS {invBreakdown.arrears.toLocaleString()}</span>
                      </span>
                    ) : (
                      <span className="text-[9px] text-amber-700/70 block mt-0.5">
                        Past: GHS {invBreakdown.arrears.toLocaleString()}
                      </span>
                    )}
                  </div>
                  {invBreakdown.netArrearsDue > 0 && (
                    <button
                      type="button"
                      onClick={() => openPaystack('Arrears', invBreakdown.netArrearsDue)}
                      className="mt-1 text-[10px] text-amber-800 hover:underline font-bold text-left cursor-pointer"
                    >
                      Pay Arrears &rarr;
                    </button>
                  )}
                </div>
              </div>

              {/* Total and deductions */}
              <div className="pt-2 border-t border-slate-100 space-y-1">
                <div className="flex justify-between font-semibold text-slate-700 text-[11px]">
                  <span>Total Billed:</span>
                  <span className="font-mono">GHS {totalBilled.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-emerald-700 text-[11px]">
                  <span>Less Total Payments Deducted (Cash, MoMo & Online):</span>
                  <span className="font-mono">- GHS {totalPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-black text-slate-900 text-xs pt-1 border-t border-slate-200">
                  <span>Net Outstanding Payable:</span>
                  <span className={`font-mono ${isFullyCleared ? 'text-emerald-700' : 'text-emerald-950'}`}>
                    GHS {balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>

            {/* Big Paystack Button */}
            {balanceDue > 0 ? (
              <button
                onClick={() => openPaystack('Combined', balanceDue)}
                className="w-full bg-[#0ba4db] hover:bg-[#088bbb] text-white font-extrabold py-3.5 px-4 rounded-xl text-xs flex items-center justify-center gap-2 shadow-md shadow-[#0ba4db]/30 transition-all hover:scale-[1.01] cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Initiate Online Payment (GHS {balanceDue.toLocaleString()})</span>
              </button>
            ) : (
              <div className="w-full bg-emerald-50 border border-emerald-300 text-emerald-800 font-bold py-2.5 px-4 rounded-xl text-xs text-center flex items-center justify-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>All school fees, books, accessories, and arrears are fully cleared!</span>
              </div>
            )}

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
                  <p className="text-xs text-slate-400">Official cashier receipts & digital vouchers</p>
                </div>
              </div>
              <button
                onClick={() => setActiveTab('payment-history')}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <span>View All History</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
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
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleDownloadReceipt(p)}
                          className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-950 transition-all cursor-pointer text-[10px] font-bold flex items-center gap-1 shadow-2xs hover:scale-105"
                          title="Download Official PDF Receipt"
                        >
                          <Download className="w-3 h-3 text-emerald-700" />
                          <span>PDF</span>
                        </button>
                        <button
                          onClick={() => handlePrintReceipt(p)}
                          className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer text-[10px] font-bold flex items-center gap-1"
                          title="View & Print Official Digital Receipt"
                        >
                          <Receipt className="w-3 h-3" />
                          <span>Slip</span>
                        </button>
                      </div>
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
        isOpen={paystackConfig.isOpen}
        onClose={() => setPaystackConfig({ isOpen: false })}
        invoice={currentInvoice.totalAmount > 0 ? currentInvoice : undefined}
        customAmount={paystackConfig.customAmount}
        defaultCategory={paystackConfig.category}
        studentName={`${ward.firstName} ${ward.lastName}`}
        studentId={ward.id}
      />

      {/* Official Payment Receipt Modal */}
      <OfficialPaymentReceiptModal
        isOpen={!!selectedReceipt}
        onClose={() => setSelectedReceipt(null)}
        payment={selectedReceipt}
        ward={ward}
      />
    </div>
  );
};
