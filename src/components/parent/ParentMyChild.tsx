import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';
import { printReportSheet } from '../../utils/printUtils';
import {
  GraduationCap,
  Award,
  CreditCard,
  Printer,
  Download,
  Calendar,
  CheckCircle2,
  AlertCircle,
  FileText,
  User,
  BookOpen,
  DollarSign,
  Receipt,
  ShieldCheck,
  ChevronRight,
  TrendingUp,
  Sparkles,
  Phone,
  Mail,
  MapPin,
  X,
  CheckCircle
} from 'lucide-react';
import { PaystackModal } from '../paystack/PaystackModal';
import { Payment, Student } from '../../types';
import { getInvoiceFinancialBreakdown } from '../../utils/feeBreakdown';
import { OfficialPaymentReceiptModal } from '../fees/OfficialPaymentReceiptModal';
import { downloadPaymentReceiptPdf } from '../../utils/receiptPdfGenerator';
import {
  calculateGradeForClass,
  calculateJHSGPA,
  calculateJHSGrade,
  calculateLowerPrimaryGrade,
  JHS_GRADING_SCHEME,
  LOWER_PRIMARY_GRADING_SCHEME,
  isLowerPrimaryOrPreschool
} from '../../utils/jhsGrading';

export type ChildTab = 'academic-report' | 'school-fees';

export const ParentMyChild: React.FC<{ initialTab?: ChildTab }> = ({ initialTab = 'academic-report' }) => {
  const {
    currentUser,
    students,
    invoices,
    payments,
    marks,
    attendance,
    academicYear,
    currentTerm,
    setActiveTab
  } = useSchool();

  const [currentTab, setCurrentTab] = useState<ChildTab>(initialTab);
  const [isPaystackOpen, setIsPaystackOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<Payment | null>(null);

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

  // Identify ward
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

  const ward = defaultStudent || fallbackWard;
  const wardFullName = `${ward.firstName} ${ward.lastName}`.toLowerCase().trim();

  // Ward Invoice & Payments from live state with broad synchronization
  const wardInvoices = invoices.filter(
    (inv) =>
      inv.studentId === ward.id ||
      inv.studentId === ward.admissionNo ||
      (inv.studentName && inv.studentName.toLowerCase().trim() === wardFullName)
  );
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
    totalAmount: ward.balanceDue > 0 ? ward.balanceDue : 0,
    paidAmount: 0,
    balance: ward.balanceDue > 0 ? ward.balanceDue : 0,
    status: (ward.balanceDue === 0 ? 'Paid' : 'Unpaid') as 'Paid' | 'Unpaid'
  };

  const wardPayments = payments
    .filter(
      (p) =>
        p.studentId === ward.id ||
        p.studentId === ward.admissionNo ||
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

  // Categorized breakdown (fees, books, accessories, arrears)
  const invBreakdown = getInvoiceFinancialBreakdown(currentInvoice);

  // Real Ward Marks from system
  const wardMarks = marks.filter((m) => m.studentId === ward.id);
  const averageScore =
    wardMarks.length > 0
      ? Math.round(wardMarks.reduce((sum, m) => sum + (m.totalScore ?? m.score ?? 0), 0) / wardMarks.length)
      : 0;

  const wardGpaStats = calculateJHSGPA(
    wardMarks.map((m) => ({
      gradePoint: m.gradePoint,
      score: m.totalScore ?? m.score,
      specialStatus: m.specialStatus
    }))
  );

  // Real Ward Attendance
  const wardAttendance = attendance.filter((a) => a.studentId === ward.id);
  const presentDays = wardAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate =
    wardAttendance.length > 0 ? Math.round((presentDays / wardAttendance.length) * 100) : 0;

  const handlePrint = () => {
    if (currentTab === 'academic-report') {
      printReportSheet('parent-ward-report-sheet', `Grace White Dove Report - ${ward.firstName} ${ward.lastName}`);
    } else {
      window.print();
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HEADER BANNER */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-6 text-white shadow-md border border-emerald-700/60">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full">
                Ward Profile & Records
              </span>
              <span className="text-emerald-300 text-xs font-semibold">
                {academicYear} • {currentTerm}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              My Child: {ward.firstName} {ward.lastName}
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
              {ward.className || 'Not Assigned'} • Admission No: <span className="text-amber-300 font-mono font-bold">{ward.admissionNo || 'N/A'}</span> • Class Tutor: {ward.classTeacher || 'Assigned Tutor'}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setIsPaystackOpen(true)}
              className="bg-[#0ba4db] hover:bg-[#0895c8] text-white font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <CreditCard className="w-4 h-4" />
              Pay School Fees
            </button>
            <button
              onClick={handlePrint}
              className="bg-white hover:bg-slate-100 text-slate-800 font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-sm transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-emerald-800" />
              Print
            </button>
          </div>
        </div>
      </div>

      {/* 2. SUB-MENU TABS: ACADEMIC REPORT & SCHOOL FEES */}
      <div className="flex items-center gap-2 bg-slate-100/80 p-1.5 rounded-2xl w-fit border border-slate-200">
        <button
          onClick={() => setCurrentTab('academic-report')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'academic-report'
              ? 'bg-emerald-950 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <Award className="w-4 h-4" />
          Academic Report
        </button>
        <button
          onClick={() => setCurrentTab('school-fees')}
          className={`px-5 py-2.5 rounded-xl text-xs font-extrabold transition-all flex items-center gap-2 cursor-pointer ${
            currentTab === 'school-fees'
              ? 'bg-emerald-950 text-amber-400 shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          School Fees ({currentInvoice.balance > 0 ? `Balance: GHS ${currentInvoice.balance}` : 'Fully Cleared'})
        </button>
      </div>

      {/* 3. TAB 1: ACADEMIC REPORT */}
      {currentTab === 'academic-report' && (
        <div className="space-y-6">
          {/* Printable Report Card Sheet */}
          <div
            id="parent-ward-report-sheet"
            className="print-area printable-sheet report-card-print-sheet bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-3.5 print:space-y-0 print:p-0 print:border-none print:shadow-none print:max-w-full"
          >
            {/* School Header */}
            <div className="border-b-2 border-emerald-900 pb-2.5 print:pb-1.5 text-center relative shrink-0">
              <div className="flex items-center justify-center gap-3 mb-1 print:mb-0.5">
                <SchoolLogo
                  alt="Grace White Dove Logo"
                  className="w-14 h-14 print:w-12 print:h-12 rounded-xl object-contain bg-white p-1 shadow-xs border border-amber-400/80 shrink-0"
                />
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl print:text-xl font-black text-emerald-950 tracking-tight font-['Outfit']">
                    GRACE WHITE DOVE SCHOOL COMPLEX
                  </h2>
                  <p className="text-xs print:text-[9.5pt] text-slate-500 font-semibold uppercase tracking-wider">
                    Official Terminal Student Evaluation & Continuous Assessment Report
                  </p>
                  <p className="text-[10px] print:text-[8.5pt] text-slate-500 font-mono mt-0.5">
                    Cape Coast, Ghana • Tel: 0244403541 • Email: whitedovesch2014@gmail.com
                  </p>
                </div>
              </div>

              <div className="mt-2 print:mt-1 grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:gap-1.5 bg-emerald-50/70 p-2.5 print:p-2 rounded-xl border border-emerald-200 text-left text-xs print:text-[9pt] shrink-0 print:my-1">
                <div>
                  <span className="text-emerald-900 text-[9px] print:text-[8pt] uppercase font-bold block">Student Name</span>
                  <span className="font-extrabold text-slate-900">{ward.firstName} {ward.lastName}</span>
                </div>
                <div>
                  <span className="text-emerald-900 text-[9px] print:text-[8pt] uppercase font-bold block">Class & Level</span>
                  <span className="font-extrabold text-emerald-800">{ward.className || 'Not Assigned'}</span>
                </div>
                <div>
                  <span className="text-emerald-900 text-[9px] print:text-[8pt] uppercase font-bold block">Admission / Roll No</span>
                  <span className="font-mono font-bold text-slate-900">{ward.admissionNo} {ward.rollNo ? `(Roll: ${ward.rollNo})` : ''}</span>
                </div>
                <div>
                  <span className="text-emerald-900 text-[9px] print:text-[8pt] uppercase font-bold block">Academic Period</span>
                  <span className="font-bold text-slate-900">{academicYear} • {currentTerm}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 print:gap-1.5 shrink-0 print:my-1">
              {isLowerPrimaryOrPreschool(ward.className) ? (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 print:p-1.5 rounded-lg text-center">
                  <span className="text-[9px] print:text-[8pt] font-extrabold uppercase text-emerald-800 block">Class Level</span>
                  <span className="text-xs print:text-[9pt] font-black text-emerald-950 font-['Outfit'] block mt-0.5">
                    {ward.className}
                  </span>
                </div>
              ) : (
                <div className="bg-emerald-50 border border-emerald-200 p-2.5 print:p-1.5 rounded-lg text-center">
                  <span className="text-[9px] print:text-[8pt] font-extrabold uppercase text-emerald-800 block">Overall Numerical Grade</span>
                  <span className="text-lg print:text-base font-black text-emerald-950 font-mono font-['Outfit']">
                    Grade {calculateJHSGrade(averageScore).grade}
                  </span>
                </div>
              )}
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 print:p-1.5 rounded-lg text-center">
                <span className="text-[9px] print:text-[8pt] font-extrabold uppercase text-emerald-800 block">Average Raw Score</span>
                <span className="text-lg print:text-base font-black text-emerald-950 font-mono font-['Outfit']">{wardMarks.length > 0 ? `${averageScore}%` : '—'}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 print:p-1.5 rounded-lg text-center">
                <span className="text-[9px] print:text-[8pt] font-extrabold uppercase text-emerald-800 block">Subjects Assessed</span>
                <span className="text-lg print:text-base font-black text-emerald-950 font-mono font-['Outfit']">{wardMarks.length}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-2.5 print:p-1.5 rounded-lg text-center">
                <span className="text-[9px] print:text-[8pt] font-extrabold uppercase text-emerald-800 block">Standing</span>
                <span className="text-xs print:text-[8.5pt] font-black text-emerald-800 block mt-0.5">
                  {isLowerPrimaryOrPreschool(ward.className)
                    ? calculateLowerPrimaryGrade(averageScore).interpretation
                    : calculateJHSGrade(averageScore).interpretation}
                </span>
              </div>
            </div>

            {/* Subject Score Breakdown Table */}
            {wardMarks.length > 0 ? (
              <div className="overflow-x-auto print:overflow-visible print:my-1 flex-1">
                <table className="w-full text-left text-xs print:text-[8.5pt] border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-emerald-950 text-white text-[9.5px] print:text-[8pt] uppercase font-bold">
                    <tr>
                      <th className="py-2 px-2.5 print:py-1.5 print:px-2">Subject Name</th>
                      <th className="py-2 px-2.5 print:py-1.5 print:px-2 text-center">Raw Score</th>
                      {isLowerPrimaryOrPreschool(ward.className) ? (
                        <th className="py-2 px-2.5 print:py-1.5 print:px-2 text-center">Position</th>
                      ) : (
                        <th className="py-2 px-2.5 print:py-1.5 print:px-2 text-center">Grade</th>
                      )}
                      <th className="py-2 px-2.5 print:py-1.5 print:px-2 text-center">Interpretation</th>
                      <th className="py-2 px-2.5 print:py-1.5 print:px-2">Teacher's Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {wardMarks.map((sub, idx) => {
                      const rawScore = sub.totalScore ?? sub.score ?? 0;
                      const gradeInfo = calculateGradeForClass(rawScore, ward.className, sub.specialStatus);
                      const isLower = isLowerPrimaryOrPreschool(ward.className);

                      return (
                        <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                          <td className="py-1.5 px-2.5 print:py-1 print:px-2 font-bold text-slate-900">{sub.subjectName || sub.subject}</td>
                          <td className="py-1.5 px-2.5 print:py-1 print:px-2 text-center font-mono font-extrabold text-slate-900">
                            {sub.specialStatus === 'IC' ? 'IC' : sub.specialStatus === 'Audit' ? 'AUDIT' : `${rawScore}%`}
                          </td>
                          {isLower ? (
                            <td className="py-1.5 px-2.5 print:py-1 print:px-2 text-center">
                              <span className={`font-black px-2 py-0.5 rounded text-[10px] print:text-[8pt] border ${gradeInfo.badgeClass}`}>
                                {gradeInfo.position || gradeInfo.grade}
                              </span>
                            </td>
                          ) : (
                            <td className="py-1.5 px-2.5 print:py-1 print:px-2 text-center">
                              <span className={`font-black px-2 py-0.5 rounded text-[10px] print:text-[8pt] border ${gradeInfo.badgeClass}`}>
                                {gradeInfo.grade}
                              </span>
                            </td>
                          )}
                          <td className="py-1.5 px-2.5 print:py-1 print:px-2 text-center font-semibold text-slate-700 text-[10.5px] print:text-[8pt]">
                            {gradeInfo.interpretation}
                          </td>
                          <td className="py-1.5 px-2.5 print:py-1 print:px-2 text-slate-600 text-[10.5px] print:text-[8pt] italic">{sub.remarks || sub.remark || gradeInfo.interpretation}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1 my-2">
                <Award className="w-6 h-6 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Terminal Assessment Scores Yet</h4>
                <p className="text-[10px] text-slate-400 max-w-md mx-auto">
                  Terminal examinations and continuous assessment marks will automatically generate here once tutors enter them into the examination module.
                </p>
              </div>
            )}

            {/* Official Grading Scheme Reference Footer */}
            {isLowerPrimaryOrPreschool(ward.className) ? (
              <div className="border border-slate-300 rounded-xl p-2.5 print:p-1.5 bg-white space-y-1 print:space-y-0.5 text-xs shrink-0 print:my-1">
                <div className="text-center pb-0.5 border-b border-slate-200">
                  <span className="font-extrabold text-emerald-950 block text-[10px] print:text-[8pt] uppercase tracking-wider font-['Outfit']">
                    GRACE WHITE DOVE SCHOOL COMPLEX • PRE-SCHOOL & LOWER PRIMARY GRADING
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-1.5 print:gap-1 text-[9px] print:text-[7.5pt]">
                  {LOWER_PRIMARY_GRADING_SCHEME.map((tier, idx) => (
                    <div key={idx} className="bg-slate-50 p-1.5 print:p-1 rounded border border-slate-200 text-center">
                      <span className="font-bold text-slate-900 block font-mono">{tier.scoreRangeLabel}</span>
                      <span className="font-black text-emerald-900 block text-[10px] print:text-[8pt]">{tier.position}</span>
                      <span className="text-slate-500 text-[8.5px] print:text-[7pt]">{tier.interpretation}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="border border-slate-200 rounded-xl p-2.5 print:p-1.5 bg-slate-50 space-y-1 print:space-y-0.5 text-xs shrink-0 print:my-1">
                <span className="font-extrabold text-emerald-950 block text-[10px] print:text-[8pt] uppercase tracking-wider font-['Outfit']">
                  Upper Primary & JHS Official Numerical Grading System (Basic 4 to JHS 3)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5 print:gap-1 text-[9px] print:text-[7.5pt]">
                  {JHS_GRADING_SCHEME.map((tier, idx) => (
                    <div key={idx} className="bg-white p-1.5 print:p-1 rounded border border-slate-200 text-center">
                      <span className="font-bold text-slate-900 block font-mono">{tier.scoreRangeLabel}</span>
                      <span className="font-black text-[11px] print:text-[8.5pt] text-emerald-900 block font-mono">Grade {tier.grade}</span>
                      <span className="text-slate-500 text-[8.5px] print:text-[7pt] block">{tier.interpretation}</span>
                    </div>
                  ))}
                </div>
                <div className="bg-white p-1.5 print:p-1 rounded border border-slate-200 text-[9px] print:text-[7.5pt] text-slate-600 flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <div><strong>Audit:</strong> Audited coursework without numerical grade.</div>
                  <div><strong>Incomplete (IC):</strong> Graded IC when missing one or more assessment components.</div>
                </div>
              </div>
            )}

            {/* Qualitative Evaluations & Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 print:gap-2 pt-1 print:pt-0.5 shrink-0 print:my-1">
              <div className="p-3 print:p-1.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 print:space-y-0.5">
                <span className="text-[10px] print:text-[7.5pt] font-bold text-slate-900 block uppercase tracking-wider">
                  Class Teacher's Appraisal & Signature
                </span>
                <p className="text-[10.5px] print:text-[7.5pt] text-slate-700 italic leading-tight">
                  {ward.classTeacher
                    ? `Assigned Class Tutor: ${ward.classTeacher}. Performance is under active observation for this term.`
                    : 'Class tutor remarks will be recorded upon conclusion of terminal grading.'}
                </p>
                <div className="pt-1.5 print:pt-1 flex items-center justify-between text-[10px] print:text-[7.5pt] text-slate-500 border-t border-slate-200">
                  <span>Tutor: <strong>{ward.classTeacher || 'Class Tutor'}</strong></span>
                  <span className="text-emerald-800 font-semibold">✓ Verified & Signed</span>
                </div>
              </div>

              <div className="p-3 print:p-1.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1 print:space-y-0.5">
                <span className="text-[10px] print:text-[7.5pt] font-bold text-slate-900 block uppercase tracking-wider">
                  Head of School Official Endorsement
                </span>
                <p className="text-[10.5px] print:text-[7.5pt] text-slate-700 italic leading-tight">
                  "Grace White Dove School Complex is dedicated to providing holistic, values-driven education for academic and moral excellence."
                </p>
                <div className="pt-1.5 print:pt-1 flex items-center justify-between text-[10px] print:text-[7.5pt] text-slate-500 border-t border-slate-200">
                  <span>Head of School: <strong>Diana Adu-Boahen (M.Ed)</strong></span>
                  <span className="text-amber-800 font-semibold">★ Official Stamp & Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 4. TAB 2: SCHOOL FEES & PAYSTACK */}
      {currentTab === 'school-fees' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* LEFT COLUMN: INVOICE BREAKDOWN & PAYSTACK CTA (7 cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Paystack Checkout Card */}
              <div className="bg-gradient-to-br from-[#0ba4db]/10 via-white to-emerald-50 rounded-2xl p-6 border-2 border-[#0ba4db]/40 shadow-sm space-y-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-2xl text-[#0ba4db] tracking-tight">paystack</span>
                    <span className="bg-[#0ba4db] text-white text-[10px] font-extrabold uppercase px-2 py-0.5 rounded">
                      Direct Fee Portal
                    </span>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-emerald-600" />
                </div>

                <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-semibold text-slate-500">Outstanding Balance:</span>
                    <div className="text-3xl font-black text-slate-900 font-['Outfit'] mt-0.5">
                      GHS {currentInvoice.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPaystackOpen(true)}
                    className="bg-[#0ba4db] hover:bg-[#088bbb] text-white font-extrabold px-6 py-3.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#0ba4db]/30 transition-all hover:scale-[1.02] cursor-pointer"
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>Pay with Paystack Now</span>
                  </button>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">
                  Support instant payment via <strong>MTN Mobile Money</strong>, <strong>Telecel Cash</strong>, <strong>AT Money</strong>, and <strong>Visa/Mastercard</strong> with zero delay and instant verifiable digital receipts.
                </p>
              </div>

              {/* Itemized Term Bill with Category Breakdown */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Official Fee Statement & Category Allocation</h3>
                    <p className="text-xs text-slate-400">Invoice Number: <strong className="text-slate-700">{currentInvoice.invoiceNo}</strong></p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentInvoice.balance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                    {currentInvoice.balance === 0 ? 'Fully Cleared' : currentInvoice.status}
                  </span>
                </div>

                {/* 4 Categorized Financial Blocks */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Tuition / Fees</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                      GHS {invBreakdown.termFees.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Textbooks</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                      GHS {invBreakdown.books.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                    <span className="text-[10px] text-slate-500 block uppercase font-bold">Accessories</span>
                    <span className="text-sm font-black text-slate-900 font-mono mt-0.5 block">
                      GHS {invBreakdown.accessories.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                    <span className="text-[10px] text-amber-800 block uppercase font-bold">Arrears</span>
                    <span className="text-sm font-black text-amber-950 font-mono mt-0.5 block">
                      GHS {invBreakdown.arrears.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                {/* Individual Line Items if present */}
                {currentInvoice.items && currentInvoice.items.length > 0 && (
                  <div className="divide-y divide-slate-100 text-xs pt-1">
                    {currentInvoice.items.map((item, idx) => (
                      <div key={idx} className="py-2.5 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{item.description}</span>
                          <span className="block text-[11px] text-slate-400">Term Assessment</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-xs">GHS {item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                )}

                <div className="pt-4 border-t-2 border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Billed Amount:</span>
                    <span className="font-mono font-bold text-slate-900">GHS {invBreakdown.grandTotal.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Total Paid & Credited:</span>
                    <span className="font-mono">- GHS {invBreakdown.paidAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Net Balance Payable:</span>
                    <span className="font-mono text-emerald-900">GHS {invBreakdown.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FEE PAYMENT HISTORY & RECEIPTS (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Latest Receipt Banner */}
              {latestReceipt && (
                <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white rounded-2xl p-4 shadow-sm border border-emerald-700/60 flex items-center justify-between gap-3 animate-in fade-in duration-200">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shrink-0 border border-emerald-600/60">
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
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleDownloadReceipt(latestReceipt)}
                      className="px-3 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 text-xs font-black rounded-xl shrink-0 cursor-pointer shadow-sm transition-all hover:scale-105 flex items-center gap-1.5"
                      title="Download official signed PDF receipt file"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download PDF</span>
                    </button>
                    <button
                      onClick={() => setSelectedReceipt(latestReceipt)}
                      className="px-3 py-2 bg-white/10 hover:bg-white/20 text-white text-xs font-bold rounded-xl shrink-0 cursor-pointer shadow-sm transition-all flex items-center gap-1.5"
                      title="View & Print Official Signed Receipt Voucher"
                    >
                      <Printer className="w-3.5 h-3.5 text-amber-300" />
                      <span>View Voucher</span>
                    </button>
                  </div>
                </div>
              )}

              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-900 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">Payment History & Receipts</h3>
                      <p className="text-xs text-slate-400">Transactions for {ward.firstName} {ward.lastName}</p>
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
                        className="p-4 rounded-xl border border-slate-200 bg-slate-50/80 hover:bg-slate-100 transition-all space-y-2"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-base font-extrabold text-slate-900">GHS {p.amount.toLocaleString()}</span>
                            <span className="ml-2 text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                              {p.status}
                            </span>
                            <p className="text-xs text-slate-600 mt-1">{p.channel || p.paymentMethod}</p>
                          </div>
                          <div className="flex items-center gap-1.5">
                            <button
                              onClick={() => handleDownloadReceipt(p)}
                              className="p-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-900 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs hover:scale-105"
                              title="Download official PDF receipt file"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                              <span>PDF Receipt</span>
                            </button>
                            <button
                              onClick={() => setSelectedReceipt(p)}
                              className="p-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors text-xs font-bold flex items-center gap-1 cursor-pointer"
                              title="View & Print Official Voucher"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[10px] text-slate-400 font-mono">
                          <span>Ref: {p.paymentRef || p.reference || p.id}</span>
                          <span>Date: {p.paymentDate || p.date}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-8 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-1">
                    <Receipt className="w-6 h-6 text-slate-300 mx-auto" />
                    <p className="text-xs font-semibold text-slate-700">No Receipts Found</p>
                    <p className="text-[11px] text-slate-400">Payment receipts will display here once recorded.</p>
                  </div>
                )}

                <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                  <span className="font-bold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Automated Bursar Ledger Reconciliation
                  </span>
                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    All cashier payments made at the accounts office (fees, books, accessories, or arrears) immediately deduct from the balance and reflect here in real-time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Paystack Modal Component */}
      <PaystackModal
        isOpen={isPaystackOpen}
        onClose={() => setIsPaystackOpen(false)}
        invoice={currentInvoice.totalAmount > 0 ? currentInvoice : undefined}
        customAmount={currentInvoice.balance > 0 ? currentInvoice.balance : 500}
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
