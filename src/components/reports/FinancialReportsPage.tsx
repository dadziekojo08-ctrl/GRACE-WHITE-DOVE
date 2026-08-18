import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Invoice, Payment, Student, PayrollRecord } from '../../types';
import {
  BarChart3,
  FileSpreadsheet,
  Receipt,
  Printer,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  DollarSign,
  Users,
  Search,
  Filter,
  Download,
  Calendar,
  CreditCard,
  BookOpen,
  ShoppingBag,
  Send,
  Plus,
  Eye,
  X,
  FileText,
  Clock,
  Briefcase,
  Bell,
  MessageSquare,
  Smartphone,
  Mail
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

export const FinancialReportsPage: React.FC<{
  onOpenPaystack?: (invoice?: Invoice, customAmount?: number, studentName?: string, studentId?: string) => void;
}> = ({ onOpenPaystack }) => {
  const {
    students,
    invoices,
    payments,
    payrolls,
    staff,
    feeStructures,
    createInvoice,
    recordPayment,
    generateMonthlyPayroll,
    markPayrollPaid,
    academicYear,
    currentTerm,
    logAuditAction,
    sendBroadcast
  } = useSchool();

  // 4 Primary Sub-tabs as explicitly requested:
  // 1. Ledger & Summary
  // 2. Student Fees Desk
  // 3. Students Fee Tracking & Arrears
  // 4. Staff Payroll Desk
  const [activeSubTab, setActiveSubTab] = useState<
    'ledger-summary' | 'fees-desk' | 'tracking-arrears' | 'payroll-desk'
  >('ledger-summary');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedArrearsFilter, setSelectedArrearsFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');

  // Selected Item for Receipt / Invoice Modal view
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [isNewFeeDeskModalOpen, setIsNewFeeDeskModalOpen] = useState(false);

  // Send Reminder Modal State for Arrears Tracking
  const [isReminderOpen, setIsReminderOpen] = useState(false);
  const [reminderTarget, setReminderTarget] = useState<{
    studentId: string;
    studentName: string;
    guardianName: string;
    guardianPhone: string;
    guardianEmail: string;
    className: string;
    balanceDue: number;
    invoiceNo?: string;
    dueDate?: string;
  } | null>(null);

  const [reminderForm, setReminderForm] = useState<{
    channel: 'WhatsApp' | 'SMS' | 'Email';
    recipient: string;
    recipientName: string;
    subject: string;
    message: string;
  }>({
    channel: 'WhatsApp',
    recipient: '',
    recipientName: '',
    subject: '',
    message: ''
  });

  const [toastMsg, setToastMsg] = useState<string | null>(null);
  const triggerToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const handleOpenReminder = (inv: Invoice) => {
    const std = students.find((s) => s.id === inv.studentId);
    const gName = std?.guardianName || `${inv.studentName}'s Guardian`;
    const gPhone = std?.guardianPhone || '0244123456';
    const gEmail = std?.guardianEmail || 'parent@educore.edu.gh';
    const bal = inv.balance > 0 ? inv.balance : (std?.balanceDue || 0);

    const defaultMsg = `Dear ${gName}, this is a gentle reminder from Grace White Dove School Complex regarding the outstanding fee balance of GHS ${bal.toLocaleString()} for your ward ${inv.studentName} (${inv.className}) for ${inv.term || currentTerm}. Invoice #${inv.invoiceNo} is due on ${inv.dueDate}. Kindly make payment via Mobile Money, Bank, or Online Portal. For inquiries: gracewhitedoveschool@gmail.com or 0244403541. Thank you.`;

    setReminderTarget({
      studentId: inv.studentId,
      studentName: inv.studentName,
      guardianName: gName,
      guardianPhone: gPhone,
      guardianEmail: gEmail,
      className: inv.className,
      balanceDue: bal,
      invoiceNo: inv.invoiceNo,
      dueDate: inv.dueDate
    });

    setReminderForm({
      channel: 'WhatsApp',
      recipient: gPhone,
      recipientName: gName,
      subject: `Fee Payment Reminder: ${inv.studentName} - Grace White Dove School Complex`,
      message: defaultMsg
    });

    setIsReminderOpen(true);
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTarget) return;

    sendBroadcast({
      channel: reminderForm.channel,
      recipient: reminderForm.recipient || reminderTarget.guardianPhone,
      recipientName: reminderForm.recipientName || reminderTarget.guardianName,
      subject: reminderForm.subject,
      message: reminderForm.message
    });

    triggerToast(`Fee reminder dispatched via ${reminderForm.channel} to ${reminderTarget.guardianName}!`);
    setIsReminderOpen(false);
  };

  // -------------------------------------------------------------
  // CALCULATIONS FOR METRICS
  // -------------------------------------------------------------

  // 1. Ledger & Summary Metrics
  // Total Tuition/Academic Fees
  const totalTuitionFees = invoices.reduce((sum, inv) => {
    const tuitionItem = inv.items?.find((it) => it.description.toLowerCase().includes('tuition'));
    return sum + (tuitionItem ? tuitionItem.amount : inv.totalAmount * 0.7);
  }, 0);

  // Total Books
  const totalBooksValue = invoices.reduce((sum, inv) => {
    const bookItem = inv.items?.find((it) => it.description.toLowerCase().includes('book'));
    return sum + (bookItem ? bookItem.amount : inv.totalAmount * 0.12);
  }, 0);

  // Total Accessories (PE kit, uniforms, crests)
  const totalAccessoriesValue = invoices.reduce((sum, inv) => {
    const accItem = inv.items?.find(
      (it) => it.description.toLowerCase().includes('accessor') || it.description.toLowerCase().includes('uniform')
    );
    return sum + (accItem ? accItem.amount : inv.totalAmount * 0.08);
  }, 0);

  // Total Billed Grand Total Amount
  const totalAmountBilled = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0);

  // Total Arrears
  const totalArrears = invoices.reduce((sum, inv) => sum + inv.balance, 0);

  // 2. Student Fees Desk Metrics
  const totalCompletedPaidFees = payments.reduce((sum, p) => sum + p.amount, 0);
  const totalPendingArrears = totalArrears;

  // 3. Staff Payroll Desk Metrics
  const monthlyPayrollCommitment =
    payrolls.reduce((sum, p) => {
      const allowVal = typeof p.allowances === 'number' ? p.allowances : (p.allowances?.housing || 0) + (p.allowances?.transport || 0) + (p.allowances?.medical || 0);
      return sum + (p.grossSalary || (p.basicSalary + allowVal));
    }, 0);

  const payrollSalariesDisbursed = payrolls
    .filter((p) => (p.paymentStatus === 'Paid' || p.status === 'Paid'))
    .reduce((sum, p) => sum + p.netSalary, 0);

  const outstandingSalaryPayout = payrolls
    .filter((p) => (p.paymentStatus !== 'Paid' && p.status !== 'Paid'))
    .reduce((sum, p) => sum + p.netSalary, 0);

  // Class list for filters
  const classList = [
    'All Classes',
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

  // Filtered Invoices for Arrears Desk
  const filteredInvoices = invoices.filter((inv) => {
    const matchesSearch =
      searchTerm === '' ||
      inv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.invoiceNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inv.className.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesClass =
      selectedClassFilter === 'all' ||
      selectedClassFilter === 'All Classes' ||
      inv.className === selectedClassFilter;

    let matchesStatus = true;
    if (selectedArrearsFilter === 'unpaid') matchesStatus = inv.status === 'Unpaid';
    else if (selectedArrearsFilter === 'partial') matchesStatus = inv.status === 'Partial' || inv.status === 'Partially Paid';
    else if (selectedArrearsFilter === 'paid') matchesStatus = inv.status === 'Paid';

    return matchesSearch && matchesClass && matchesStatus;
  });

  // Export Financial CSV
  const handleExportCSV = () => {
    let csv = `Grace White Dove School Complex - Financial Report (${activeSubTab.toUpperCase()})\n`;
    csv += `Academic Session: ${academicYear} • ${currentTerm}\n`;
    csv += `Generated on: ${new Date().toLocaleString()} by Accountant Desk (Powered by BenDaz IT Consult)\n\n`;

    if (activeSubTab === 'ledger-summary') {
      csv += `--- LEDGER & SUMMARY TOTALS ---\n`;
      csv += `Total Fees (Tuition),GHS ${totalTuitionFees.toLocaleString()}\n`;
      csv += `Total Amount (Grand Total),GHS ${totalAmountBilled.toLocaleString()}\n`;
      csv += `Total Arrears (Unpaid),GHS ${totalArrears.toLocaleString()}\n`;
      csv += `Total Books & Materials,GHS ${totalBooksValue.toLocaleString()}\n`;
      csv += `Total Accessories & Uniforms,GHS ${totalAccessoriesValue.toLocaleString()}\n\n`;
      csv += `--- GENERAL LEDGER TRANSACTIONS ---\n`;
      csv += `Reference,Account,Category,Debit/Credit,Amount (GHS),Date\n`;
      payments.forEach((p) => {
        csv += `"${p.receiptNo || p.reference}","Student Fees","Tuition Revenue","CREDIT",${p.amount},"${p.date}"\n`;
      });
    } else if (activeSubTab === 'tracking-arrears') {
      csv += `--- STUDENT FEES TRACKING & ARREARS ---\n`;
      csv += `Invoice #,Student Name,Class,Total Billed (GHS),Paid (GHS),Balance Arrears (GHS),Status,Due Date\n`;
      filteredInvoices.forEach((i) => {
        csv += `"${i.invoiceNo}","${i.studentName}","${i.className}",${i.totalAmount},${i.paidAmount},${i.balance},"${i.status}","${i.dueDate}"\n`;
      });
    } else if (activeSubTab === 'payroll-desk') {
      csv += `--- STAFF PAYROLL DESK ---\n`;
      csv += `Monthly Commitment,GHS ${monthlyPayrollCommitment.toLocaleString()}\n`;
      csv += `Salaries Disbursed,GHS ${payrollSalariesDisbursed.toLocaleString()}\n`;
      csv += `Outstanding Payout,GHS ${outstandingSalaryPayout.toLocaleString()}\n\n`;
      csv += `Staff Name,Role,Basic Salary,Allowances,SSNIT / Tax,Net Salary,Status\n`;
      payrolls.forEach((pr) => {
        const allowVal = typeof pr.allowances === 'number' ? pr.allowances : (pr.allowances?.housing || 0) + (pr.allowances?.transport || 0) + (pr.allowances?.medical || 0);
        csv += `"${pr.staffName}","Faculty/Staff",${pr.basicSalary},${allowVal},${pr.deductions.tax + pr.deductions.pension},${pr.netSalary},"${pr.paymentStatus || pr.status || 'Pending'}"\n`;
      });
    }

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GraceWhiteDove_FinancialReport_${activeSubTab}_${academicYear}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Financial Reports & Accounts Desk</h2>
            <span className="bg-emerald-100 text-emerald-800 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Grace White Dove Complex
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official ledger reconciliations, student fee collection desks, arrears recovery, and staff payroll accounts.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4 text-emerald-700" />
            Print Report
          </button>
          <button
            onClick={handleExportCSV}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-amber-300" />
            Export CSV
          </button>
        </div>
      </div>

      {/* 4 Requested Navigation Sub-Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveSubTab('ledger-summary')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'ledger-summary'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <FileSpreadsheet className={`w-4 h-4 ${activeSubTab === 'ledger-summary' ? 'text-amber-400' : 'text-emerald-700'}`} />
          1. Ledger & Summary
        </button>

        <button
          onClick={() => setActiveSubTab('fees-desk')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'fees-desk'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <CreditCard className={`w-4 h-4 ${activeSubTab === 'fees-desk' ? 'text-amber-400' : 'text-emerald-700'}`} />
          2. Student Fees Desk
        </button>

        <button
          onClick={() => setActiveSubTab('tracking-arrears')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'tracking-arrears'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Receipt className={`w-4 h-4 ${activeSubTab === 'tracking-arrears' ? 'text-amber-400' : 'text-emerald-700'}`} />
          3. Students Fee Tracking & Arrears
        </button>

        <button
          onClick={() => setActiveSubTab('payroll-desk')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'payroll-desk'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Briefcase className={`w-4 h-4 ${activeSubTab === 'payroll-desk' ? 'text-amber-400' : 'text-emerald-700'}`} />
          4. Staff Payroll Desk
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: LEDGER & SUMMARY */}
      {/* Required Cards: Total Fees, Total Amount, Total Arrears, Total Books, Total Accessories */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger-summary' && (
        <div className="space-y-6">
          {/* Top 5 Requested KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Total Fees */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fees</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                  ₵
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {Math.round(totalTuitionFees).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Core Tuition Revenue</span>
            </div>

            {/* Total Amount */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Amount</span>
                <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-800 flex items-center justify-center font-black">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-blue-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalAmountBilled).toLocaleString()}
              </div>
              <span className="text-[10px] text-blue-700 font-medium">Grand Billed Sum</span>
            </div>

            {/* Total Arrears */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Arrears</span>
                <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-800 flex items-center justify-center font-black">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-amber-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalArrears).toLocaleString()}
              </div>
              <span className="text-[10px] text-amber-700 font-medium">Outstanding Balances</span>
            </div>

            {/* Total Books */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Books</span>
                <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-800 flex items-center justify-center font-black">
                  <BookOpen className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-purple-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalBooksValue).toLocaleString()}
              </div>
              <span className="text-[10px] text-purple-700 font-medium">Textbooks & Stationeries</span>
            </div>

            {/* Total Accessories */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Accessories</span>
                <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-800 flex items-center justify-center font-black">
                  <ShoppingBag className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-rose-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalAccessoriesValue).toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-700 font-medium">Uniforms & PE Kits</span>
            </div>
          </div>

          {/* General Ledger stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Institutional General Ledger</h3>
                <p className="text-xs text-slate-500">Double-entry audit reconciliation stream</p>
              </div>
              <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-3 py-1 rounded-full">
                Ledger Balance: Reconciled
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Transaction Ref</th>
                    <th className="py-3 px-4">Account Head</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-4 font-mono font-bold text-slate-900">{p.receiptNo || p.reference}</td>
                      <td className="py-3 px-4 font-semibold text-emerald-950">Student Tuition & Levies</td>
                      <td className="py-3 px-4 text-slate-600">{p.paymentMethod}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                          CREDIT
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-800 font-mono">
                        +GHS {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Posted
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: STUDENT FEES DESK */}
      {/* Required Cards: Total Billed Fees, Completed/Paid Fees, Pending/Arrears */}
      {/* ========================================================================= */}
      {activeSubTab === 'fees-desk' && (
        <div className="space-y-6">
          {/* Top 3 Requested KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Total Billed Fees */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Billed Fees</span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {Math.round(totalAmountBilled).toLocaleString()}
              </div>
              <span className="text-xs text-blue-700 font-medium">All Issued Student Bills</span>
            </div>

            {/* Completed/Paid Fees */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Completed / Paid Fees</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-900 font-['Outfit'] mt-2">
                GHS {Math.round(totalCompletedPaidFees).toLocaleString()}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Cleared and Settled</span>
            </div>

            {/* Pending / Arrears */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Pending / Arrears</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalPendingArrears).toLocaleString()}
              </div>
              <span className="text-xs text-amber-700 font-medium">Outstanding Balances to Recover</span>
            </div>
          </div>

          {/* Active Fee Structures and Class Billing Tiers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Standard Fee Structures by Class</h3>
                <p className="text-xs text-slate-500">Termly tuition, accessories, books, and levies breakdown</p>
              </div>
              {onOpenPaystack && (
                <button
                  onClick={() => onOpenPaystack()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                >
                  <CreditCard className="w-4 h-4" />
                  Open Paystack Checkout
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {feeStructures.map((struct) => (
                <div key={struct.id} className="p-4 rounded-xl bg-slate-50 border border-slate-200 hover:border-emerald-300 transition-all">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-bold text-xs text-slate-900">{struct.name}</h4>
                      <span className="text-[10px] text-emerald-800 font-semibold">{struct.classLevel}</span>
                    </div>
                    <span className="text-sm font-black text-emerald-900 font-mono">
                      GHS {struct.totalAmount.toLocaleString()}
                    </span>
                  </div>

                  <div className="space-y-1 text-[11px] text-slate-600 border-t border-slate-200 pt-2 mt-2">
                    <div className="flex justify-between"><span>Tuition:</span><span className="font-semibold">GHS {struct.breakdown?.tuitionFee ?? struct.tuitionFee ?? struct.tuition ?? 0}</span></div>
                    <div className="flex justify-between"><span>Development Levy:</span><span className="font-semibold">GHS {struct.breakdown?.developmentLevy ?? struct.developmentLevy ?? 0}</span></div>
                    <div className="flex justify-between"><span>ICT Lab:</span><span className="font-semibold">GHS {struct.breakdown?.ictLabFee ?? struct.ictLabFee ?? struct.ict ?? 0}</span></div>
                    <div className="flex justify-between"><span>Library & Learning:</span><span className="font-semibold">GHS {struct.breakdown?.libraryFee ?? struct.libraryFee ?? struct.library ?? 0}</span></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 3. SUB-TAB: STUDENTS FEE TRACKING & ARREARS */}
      {/* Tracking table + Receipt & Invoice generator and viewing */}
      {/* ========================================================================= */}
      {activeSubTab === 'tracking-arrears' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 w-full md:max-w-xs relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search student, invoice #, class..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700 bg-slate-50"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
              <select
                value={selectedClassFilter}
                onChange={(e) => setSelectedClassFilter(e.target.value)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 outline-none"
              >
                {classList.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <select
                value={selectedArrearsFilter}
                onChange={(e) => setSelectedArrearsFilter(e.target.value as any)}
                className="px-3 py-2 text-xs border border-slate-200 rounded-xl bg-slate-50 font-medium text-slate-700 outline-none"
              >
                <option value="all">All Payment Statuses</option>
                <option value="unpaid">Unpaid / High Arrears</option>
                <option value="partial">Partially Paid</option>
                <option value="paid">Fully Settled</option>
              </select>
            </div>
          </div>

          {/* Arrears and Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Invoice #</th>
                    <th className="py-3 px-4">Student & ID</th>
                    <th className="py-3 px-4">Class</th>
                    <th className="py-3 px-4">Total Billed</th>
                    <th className="py-3 px-4">Paid</th>
                    <th className="py-3 px-4">Balance Arrears</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Receipt & Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredInvoices.map((inv) => {
                    const std = students.find((s) => s.id === inv.studentId);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-950">{inv.invoiceNo}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{inv.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{std?.admissionNo || 'ADM-GWD'}</div>
                        </td>
                        <td className="py-3 px-4 text-slate-700">{inv.className}</td>
                        <td className="py-3 px-4 font-bold text-slate-800 font-mono">
                          GHS {inv.totalAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-bold text-emerald-700 font-mono">
                          GHS {inv.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 font-black font-mono">
                          <span className={inv.balance > 0 ? 'text-amber-800' : 'text-slate-400'}>
                            GHS {inv.balance.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Partially Paid'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right space-x-1.5 whitespace-nowrap">
                          {inv.balance > 0 && (
                            <button
                              onClick={() => handleOpenReminder(inv)}
                              className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                              title="Send fee reminder notice to parent"
                            >
                              <Bell className="w-3.5 h-3.5 text-emerald-700" />
                              Reminder
                            </button>
                          )}
                          <button
                            onClick={() => setViewingInvoice(inv)}
                            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-emerald-700" />
                            View Invoice
                          </button>
                          {onOpenPaystack && inv.balance > 0 && (
                            <button
                              onClick={() => onOpenPaystack(inv, inv.balance, inv.studentName, inv.studentId)}
                              className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay
                            </button>
                          )}
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

      {/* ========================================================================= */}
      {/* 4. SUB-TAB: STAFF PAYROLL DESK */}
      {/* Required Cards: Payroll Monthly Commitment, Payroll Salaries Disbursed, Outstanding Salary Payout */}
      {/* ========================================================================= */}
      {activeSubTab === 'payroll-desk' && (
        <div className="space-y-6">
          {/* Top 3 Requested KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Payroll Monthly Commitment */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payroll Monthly Commitment
                </span>
                <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
                  <Briefcase className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {Math.round(monthlyPayrollCommitment).toLocaleString()}
              </div>
              <span className="text-xs text-blue-700 font-medium">Faculty & Administrative Staff Gross</span>
            </div>

            {/* Payroll Salaries Disbursed */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Payroll Salaries Disbursed
                </span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-emerald-900 font-['Outfit'] mt-2">
                GHS {Math.round(payrollSalariesDisbursed).toLocaleString()}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Paid out to bank accounts</span>
            </div>

            {/* Outstanding Salary Payout */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Outstanding Salary Payout
                </span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-950 font-['Outfit'] mt-2">
                GHS {Math.round(outstandingSalaryPayout).toLocaleString()}
              </div>
              <span className="text-xs text-amber-700 font-medium">Pending Release / Authorization</span>
            </div>
          </div>

          {/* Staff Payroll Roster Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Faculty & Staff Payroll Roster</h3>
                <p className="text-xs text-slate-500">Gross compensation, SSNIT Tier 1/2 & GRA PAYE Deductions</p>
              </div>
              <button
                onClick={() => {
                  generateMonthlyPayroll('August', 2026);
                  alert('Automated payroll batch generated for current month!');
                }}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
              >
                + Run Monthly Batch
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Staff Member</th>
                    <th className="py-3 px-4">Basic Salary</th>
                    <th className="py-3 px-4">Allowances</th>
                    <th className="py-3 px-4">SSNIT (5.5%)</th>
                    <th className="py-3 px-4">PAYE Tax</th>
                    <th className="py-3 px-4">Net Salary</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payrolls.map((pr) => {
                    const allowVal = typeof pr.allowances === 'number' ? pr.allowances : (pr.allowances?.housing || 0) + (pr.allowances?.transport || 0) + (pr.allowances?.medical || 0);
                    const isPaid = pr.paymentStatus === 'Paid' || pr.status === 'Paid';
                    return (
                      <tr key={pr.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{pr.staffName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">STAFF-GH</div>
                        </td>
                        <td className="py-3 px-4 font-mono font-semibold">GHS {pr.basicSalary.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-emerald-700">+GHS {allowVal.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">-GHS {pr.deductions.pension.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono text-slate-500">-GHS {pr.deductions.tax.toLocaleString()}</td>
                        <td className="py-3 px-4 font-mono font-black text-emerald-950">
                          GHS {pr.netSalary.toLocaleString()}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isPaid
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {isPaid ? 'Paid' : 'Pending'}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          {!isPaid ? (
                            <button
                              onClick={() => {
                                markPayrollPaid(pr.id);
                                alert(`Salary disbursed to ${pr.staffName}!`);
                              }}
                              className="px-3 py-1 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-lg text-[11px] cursor-pointer"
                            >
                              Disburse
                            </button>
                          ) : (
                            <button
                              onClick={() => window.print()}
                              className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3.5 h-3.5" /> Payslip
                            </button>
                          )}
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

      {/* ========================================================================= */}
      {/* OFFICIAL INVOICE MODAL VIEW (Grace White Dove School Complex) */}
      {/* ========================================================================= */}
      {viewingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Grace White Dove School Complex</h3>
                <p className="text-xs text-emerald-200">Official Student Fee Invoice</p>
              </div>
              <button
                onClick={() => setViewingInvoice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <h4 className="font-bold text-sm text-slate-900">{viewingInvoice.studentName}</h4>
                  <p className="text-[11px] text-slate-500">{viewingInvoice.className} • {viewingInvoice.term}</p>
                </div>
                <div className="text-right font-mono">
                  <div className="font-bold text-emerald-950">{viewingInvoice.invoiceNo}</div>
                  <div className="text-[10px] text-slate-400">Due: {viewingInvoice.dueDate}</div>
                </div>
              </div>

              {/* Itemized breakdown */}
              <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-800 text-[11px] mb-1">Fee Item Breakdown:</div>
                {viewingInvoice.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between text-slate-700">
                    <span>{it.description}</span>
                    <span className="font-mono font-semibold">GHS {it.amount.toLocaleString()}</span>
                  </div>
                ))}
              </div>

              {/* Totals */}
              <div className="border-t border-slate-200 pt-3 space-y-1 text-right">
                <div className="flex justify-between text-slate-600">
                  <span>Total Amount Billed:</span>
                  <span className="font-bold font-mono text-slate-900">GHS {viewingInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Paid Amount:</span>
                  <span className="font-bold font-mono">GHS {viewingInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-amber-900 font-extrabold text-sm border-t border-slate-200 pt-1.5">
                  <span>Balance Due:</span>
                  <span className="font-mono">GHS {viewingInvoice.balance.toLocaleString()}</span>
                </div>
              </div>

              <div className="text-[10px] text-slate-400 text-center pt-2">
                Managed by Accounts Desk • Software by BenDaz IT Consult
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                <button
                  onClick={() => setViewingInvoice(null)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl"
                >
                  Close
                </button>
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-amber-300" />
                  Print Official Invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border bg-emerald-950 text-amber-300 border-amber-400/40 flex items-center gap-2 text-xs font-semibold">
          <CheckCircle2 className="w-4 h-4 text-amber-300 shrink-0" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Send Reminder Modal */}
      {isReminderOpen && reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit']">Send Fee Balance Reminder</h3>
                  <p className="text-xs text-emerald-200">Parent Communication Suite</p>
                </div>
              </div>
              <button
                onClick={() => setIsReminderOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReminderSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Student / Ward:</span>
                  <span className="text-sm font-bold text-slate-900">{reminderTarget.studentName}</span>
                  <span className="text-slate-500 text-[11px] block">{reminderTarget.className}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Balance Outstanding:</span>
                  <span className="text-base font-black text-amber-950 font-mono">
                    GHS {reminderTarget.balanceDue.toLocaleString()}
                  </span>
                  {reminderTarget.invoiceNo && (
                    <span className="text-[10px] text-slate-500 block">Inv: {reminderTarget.invoiceNo}</span>
                  )}
                </div>
              </div>

              {/* Channel Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Delivery Channel *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setReminderForm(prev => ({ ...prev, channel: 'WhatsApp', recipient: reminderTarget.guardianPhone }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'WhatsApp'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderForm(prev => ({ ...prev, channel: 'SMS', recipient: reminderTarget.guardianPhone }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'SMS'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReminderForm(prev => ({ ...prev, channel: 'Email', recipient: reminderTarget.guardianEmail }))}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'Email'
                        ? 'bg-emerald-800 text-white border-emerald-800'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Notice</span>
                  </button>
                </div>
              </div>

              {/* Recipient Details */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={reminderForm.recipientName}
                    onChange={(e) => setReminderForm({ ...reminderForm, recipientName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Contact</label>
                  <input
                    type="text"
                    required
                    value={reminderForm.recipient}
                    onChange={(e) => setReminderForm({ ...reminderForm, recipient: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Subject</label>
                <input
                  type="text"
                  required
                  value={reminderForm.subject}
                  onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Message Content</label>
                <textarea
                  required
                  rows={4}
                  value={reminderForm.message}
                  onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 resize-none leading-relaxed"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReminderOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Send Reminder ({reminderForm.channel})</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
