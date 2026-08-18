import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
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
    currentTerm
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

  // Ward Invoice & Payments from live state
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

  // Real Ward Marks from system
  const wardMarks = marks.filter((m) => m.studentId === ward.id);
  const averageScore =
    wardMarks.length > 0
      ? Math.round(wardMarks.reduce((sum, m) => sum + m.totalScore, 0) / wardMarks.length)
      : 0;

  // Real Ward Attendance
  const wardAttendance = attendance.filter((a) => a.studentId === ward.id);
  const presentDays = wardAttendance.filter((a) => a.status === 'Present' || a.status === 'Late').length;
  const attendanceRate =
    wardAttendance.length > 0 ? Math.round((presentDays / wardAttendance.length) * 100) : 0;

  const handlePrint = () => {
    window.print();
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
          <div className="bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6 print:p-0 print:border-none print:shadow-none">
            {/* School Header */}
            <div className="border-b-2 border-emerald-900 pb-5 text-center relative">
              <div className="flex items-center justify-center gap-3 mb-2">
                <div className="w-12 h-12 rounded-2xl bg-emerald-950 text-amber-400 flex items-center justify-center font-black text-xl shadow-md border border-amber-400/40">
                  <GraduationCap className="w-7 h-7" />
                </div>
                <div className="text-left">
                  <h2 className="text-xl sm:text-2xl font-black text-emerald-950 tracking-tight font-['Outfit']">
                    GRACE WHITE DOVE SCHOOL COMPLEX
                  </h2>
                  <p className="text-[11px] text-slate-500 font-semibold uppercase tracking-wider">
                    Official Terminal Student Evaluation & Continuous Assessment Report
                  </p>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-left text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Student Name</span>
                  <span className="font-extrabold text-slate-900">{ward.firstName} {ward.lastName}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Class & Level</span>
                  <span className="font-extrabold text-emerald-800">{ward.className || 'Not Assigned'}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Admission / Roll No</span>
                  <span className="font-mono font-bold text-slate-900">{ward.admissionNo} {ward.rollNo ? `(Roll: ${ward.rollNo})` : ''}</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] uppercase font-bold block">Academic Period</span>
                  <span className="font-bold text-slate-900">{academicYear} • {currentTerm}</span>
                </div>
              </div>
            </div>

            {/* Performance Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Subjects Assessed</span>
                <span className="text-lg font-black text-emerald-950 font-['Outfit']">{wardMarks.length}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Average Score</span>
                <span className="text-lg font-black text-emerald-950 font-['Outfit']">{wardMarks.length > 0 ? `${averageScore}%` : '—'}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Attendance Records</span>
                <span className="text-lg font-black text-emerald-950 font-['Outfit']">{wardAttendance.length > 0 ? `${presentDays}/${wardAttendance.length} (${attendanceRate}%)` : '0 Records'}</span>
              </div>
              <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl text-center">
                <span className="text-[10px] font-bold uppercase text-emerald-800 block">Status</span>
                <span className="text-lg font-black text-emerald-950 font-['Outfit']">{ward.status || 'Active'}</span>
              </div>
            </div>

            {/* Subject Score Breakdown Table */}
            {wardMarks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-emerald-950 text-white text-[10px] uppercase font-bold">
                    <tr>
                      <th className="p-3">Subject Name</th>
                      <th className="p-3 text-center">Class Score (30%)</th>
                      <th className="p-3 text-center">Exam Score (70%)</th>
                      <th className="p-3 text-center">Total (100%)</th>
                      <th className="p-3 text-center">Grade</th>
                      <th className="p-3">Teacher's Remark</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {wardMarks.map((sub, idx) => (
                      <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                        <td className="p-3 font-bold text-slate-900">{sub.subjectName}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{sub.classScore}</td>
                        <td className="p-3 text-center font-mono text-slate-600">{sub.examScore}</td>
                        <td className="p-3 text-center font-mono font-extrabold text-slate-900">{sub.totalScore}%</td>
                        <td className="p-3 text-center">
                          <span className="font-extrabold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded text-[11px]">
                            {sub.grade}
                          </span>
                        </td>
                        <td className="p-3 text-slate-600 text-[11px]">{sub.remarks || 'Recorded'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-10 rounded-xl bg-slate-50 border border-dashed border-slate-200 text-center space-y-2">
                <Award className="w-8 h-8 text-slate-300 mx-auto" />
                <h4 className="text-xs font-bold text-slate-700">No Terminal Assessment Scores Yet</h4>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Terminal examinations and continuous assessment marks will automatically generate here once tutors enter them into the examination module.
                </p>
              </div>
            )}

            {/* Qualitative Evaluations & Remarks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  Class Teacher's Appraisal & Signature
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  {ward.classTeacher
                    ? `Assigned Class Tutor: ${ward.classTeacher}. Performance is under active observation for this term.`
                    : 'Class tutor remarks will be recorded upon conclusion of terminal grading.'}
                </p>
                <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
                  <span>Tutor: <strong>{ward.classTeacher || 'Class Tutor'}</strong></span>
                  <span className="text-emerald-800 font-semibold">✓ Verified & Signed</span>
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2">
                <span className="text-xs font-bold text-slate-900 block uppercase tracking-wider">
                  Head of School Official Endorsement
                </span>
                <p className="text-xs text-slate-700 italic leading-relaxed">
                  "Grace White Dove School Complex is dedicated to providing holistic, values-driven education for academic and moral excellence."
                </p>
                <div className="pt-3 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200">
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

              {/* Itemized Term Bill */}
              <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-4">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">Term Official Invoice Statement</h3>
                    <p className="text-xs text-slate-400">Invoice Number: <strong className="text-slate-700">{currentInvoice.invoiceNo}</strong></p>
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentInvoice.balance === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                    {currentInvoice.balance === 0 ? 'Cleared' : currentInvoice.status}
                  </span>
                </div>

                {currentInvoice.items && currentInvoice.items.length > 0 ? (
                  <div className="divide-y divide-slate-100 text-xs">
                    {currentInvoice.items.map((item, idx) => (
                      <div key={idx} className="py-3 flex items-center justify-between">
                        <div>
                          <span className="font-semibold text-slate-800">{item.description}</span>
                          <span className="block text-[11px] text-slate-400">Term Assessment</span>
                        </div>
                        <span className="font-mono font-bold text-slate-900 text-sm">GHS {item.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-6 text-center text-xs text-slate-500">
                    No fee line items billed for this account yet.
                  </div>
                )}

                <div className="pt-4 border-t-2 border-slate-200 space-y-2 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Term Fees:</span>
                    <span className="font-mono font-bold text-slate-900">GHS {currentInvoice.totalAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Amount Paid:</span>
                    <span className="font-mono">- GHS {currentInvoice.paidAmount.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-base font-black text-slate-900 pt-2 border-t border-slate-100">
                    <span>Net Balance Payable:</span>
                    <span className="font-mono text-emerald-900">GHS {currentInvoice.balance.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: FEE PAYMENT HISTORY & RECEIPTS (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
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
                          <button
                            onClick={() => setSelectedReceipt(p)}
                            className="p-2 rounded-lg bg-white border border-slate-200 text-slate-700 hover:text-emerald-800 hover:border-emerald-600 transition-all text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Receipt className="w-3.5 h-3.5 text-emerald-700" />
                            <span>Receipt</span>
                          </button>
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
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" /> Paystack Automated Reconciliation
                  </span>
                  <p className="text-[11px] text-emerald-800/90 leading-relaxed">
                    All online payments are immediately credited to the school bursar ledger and update clearance status in real time.
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
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-950 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                  Official Payment Receipt
                </h3>
                <p className="text-xs text-emerald-200">Receipt Ref #{selectedReceipt.paymentRef || selectedReceipt.reference || selectedReceipt.id}</p>
              </div>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="text-center pb-2 border-b border-slate-200">
                <h4 className="font-bold text-base text-slate-900 font-['Outfit']">Grace White Dove School Complex</h4>
                <p className="text-[11px] text-slate-500 font-medium">Student Tuition & Fee Payment Voucher</p>
                <p className="text-[11px] text-emerald-900 font-medium mt-0.5">
                  Email: <span className="font-semibold">gracewhitedoveschool@gmail.com</span> • Phone: <span className="font-semibold font-mono">0244403541</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-100">
                <div>
                  <span className="text-slate-500 block text-[10px]">Student Name:</span>
                  <span className="font-bold text-slate-900">{selectedReceipt.studentName || `${ward.firstName} ${ward.lastName}`}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Date:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedReceipt.paymentDate || selectedReceipt.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Channel:</span>
                  <span className="font-bold text-emerald-800">{selectedReceipt.channel || selectedReceipt.paymentMethod}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Ward ID / Class:</span>
                  <span className="font-bold text-slate-700">{ward.admissionNo} • {ward.className}</span>
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">Amount Paid</span>
                <div className="text-2xl font-black font-mono text-white">
                  GHS {selectedReceipt.amount.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300 block">Status: Verified & Processed</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Official Slip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
