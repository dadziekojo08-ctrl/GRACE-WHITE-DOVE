import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { SchoolLogo } from '../common/SchoolLogo';
import { printReportSheet } from '../../utils/printUtils';
import { getInvoiceFinancialBreakdown, calculateAggregatedFinancials } from '../../utils/feeBreakdown';
import { Invoice, Payment, Student, PayrollRecord, Expense, ExpenseCategory } from '../../types';
import {
  BarChart3,
  FileSpreadsheet,
  Receipt,
  Printer,
  TrendingUp,
  TrendingDown,
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
  Mail,
  RotateCcw,
  Wallet,
  Trash2,
  Edit3,
  ArrowDownRight,
  ArrowUpRight
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

const EXPENSE_CATEGORIES: ExpenseCategory[] = [
  'Utilities',
  'Maintenance & Repairs',
  'Teaching Supplies',
  'Stationery & Printing',
  'Fuel & Transport',
  'Food & Feeding',
  'Salaries & Allowances',
  'Equipment & ICT',
  'Events & Sports',
  'Miscellaneous'
];

export const FinancialReportsPage: React.FC<{
  onOpenPaystack?: (invoice?: Invoice, customAmount?: number, studentName?: string, studentId?: string) => void;
}> = ({ onOpenPaystack }) => {
  const {
    students,
    invoices,
    payments,
    expenses,
    addExpense,
    updateExpense,
    deleteExpense,
    clearAllExpenses,
    payrolls,
    reimbursements,
    resetAllReimbursements,
    staff,
    feeStructures,
    createInvoice,
    recordPayment,
    generateMonthlyPayroll,
    markPayrollPaid,
    updateStudentArrears,
    academicYear,
    currentTerm,
    currentUser,
    logAuditAction,
    sendBroadcast
  } = useSchool();

  // 5 Primary Sub-tabs:
  // 1. Ledger & Summary
  // 2. Student Fees Desk
  // 3. Students Fee Tracking & Arrears
  // 4. Staff Payroll Desk
  // 5. Expenses & Expenditure
  const [activeSubTab, setActiveSubTab] = useState<
    'ledger-summary' | 'fees-desk' | 'tracking-arrears' | 'payroll-desk' | 'expenses-desk'
  >('ledger-summary');

  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedArrearsFilter, setSelectedArrearsFilter] = useState<'all' | 'unpaid' | 'partial' | 'paid'>('all');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'all' | 'credit' | 'debit'>('all');

  // Expenses Filter & Modal State
  const [expenseSearch, setExpenseSearch] = useState('');
  const [expenseCategoryFilter, setExpenseCategoryFilter] = useState<string>('all');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'all' | 'Paid' | 'Approved' | 'Pending'>('all');
  const [expenseMethodFilter, setExpenseMethodFilter] = useState<string>('all');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [editingExpenseId, setEditingExpenseId] = useState<string | null>(null);
  const [expenseForm, setExpenseForm] = useState<{
    voucherNo: string;
    title: string;
    category: ExpenseCategory;
    amount: string;
    date: string;
    paymentMethod: 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque';
    paidTo: string;
    status: 'Paid' | 'Approved' | 'Pending';
    receiptRef: string;
    notes: string;
  }>({
    voucherNo: '',
    title: '',
    category: 'Utilities',
    amount: '',
    date: new Date().toISOString().slice(0, 10),
    paymentMethod: 'Cash',
    paidTo: '',
    status: 'Paid',
    receiptRef: '',
    notes: ''
  });

  // Selected Item for Receipt / Invoice Modal view
  const [viewingInvoice, setViewingInvoice] = useState<Invoice | null>(null);
  const [viewingReceipt, setViewingReceipt] = useState<Payment | null>(null);
  const [isNewFeeDeskModalOpen, setIsNewFeeDeskModalOpen] = useState(false);

  // Adjust Arrears Modal State (Admin / Finance manual entry)
  const [isAdjustArrearsOpen, setIsAdjustArrearsOpen] = useState(false);
  const [adjustArrearsTarget, setAdjustArrearsTarget] = useState<{
    studentId: string;
    studentName: string;
    className: string;
    currentArrears: number;
    currentTermBill: number;
    totalBalance: number;
    newArrearsAmount: number;
    reason: string;
  } | null>(null);

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

    const defaultMsg = `Dear ${gName}, this is a gentle reminder from Grace White Dove School Complex regarding the outstanding fee balance of GHS ${bal.toLocaleString()} for your ward ${inv.studentName} (${inv.className}) for ${inv.term || currentTerm}. Invoice #${inv.invoiceNo} is due on ${inv.dueDate}. Kindly make payment via Mobile Money, Bank, or Online Portal. For inquiries: whitedovesch2014@gmail.com or 0244403541. Thank you.`;

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
  // CALCULATIONS FOR METRICS & BREAKDOWNS
  // -------------------------------------------------------------

  // Helper to extract separated billing components for any invoice (Universal guarantee)
  const getInvoiceBreakdown = (inv: Invoice) => getInvoiceFinancialBreakdown(inv);

  // 1. Ledger & Summary Metrics (Mathematically verified: Total Fees + Total Books + Total Accessories === Total Amount)
  const {
    totalTuitionFees,
    totalBooksValue,
    totalAccessoriesValue,
    totalAmountBilled,
    grossArrears,
    collectedArrears,
    totalArrears,
    cumulativeBillable,
    collected: collectedBreakdown
  } = calculateAggregatedFinancials(invoices, students, payments);

  // 2. Student Fees Desk Metrics
  const totalCompletedPaidFees = payments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);
  const totalPendingArrears = Math.max(0, cumulativeBillable - totalCompletedPaidFees);

  // 2B. Institutional Expenses & Expenditure Metrics
  const totalExpenses = expenses.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const paidExpenses = expenses
    .filter((e) => e.status === 'Paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const pendingExpenses = expenses
    .filter((e) => e.status !== 'Paid')
    .reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
  const netCashflowBalance = totalCompletedPaidFees - totalExpenses;

  const filteredExpenses = expenses.filter((exp) => {
    const q = expenseSearch.trim().toLowerCase();
    const matchesSearch =
      !q ||
      exp.title.toLowerCase().includes(q) ||
      exp.voucherNo.toLowerCase().includes(q) ||
      exp.paidTo.toLowerCase().includes(q) ||
      exp.category.toLowerCase().includes(q) ||
      (exp.notes || '').toLowerCase().includes(q);
    const matchesCategory = expenseCategoryFilter === 'all' || exp.category === expenseCategoryFilter;
    const matchesStatus = expenseStatusFilter === 'all' || exp.status === expenseStatusFilter;
    const matchesMethod = expenseMethodFilter === 'all' || exp.paymentMethod === expenseMethodFilter;
    return matchesSearch && matchesCategory && matchesStatus && matchesMethod;
  });

  const expenseCategorySummary = EXPENSE_CATEGORIES.map((cat) => {
    const items = expenses.filter((e) => e.category === cat);
    const total = items.reduce((sum, e) => sum + (Number(e.amount) || 0), 0);
    return {
      category: cat,
      shortName: cat.split('&')[0].trim(),
      amount: total,
      count: items.length
    };
  }).filter((c) => c.amount > 0);

  const handleOpenNewExpense = () => {
    setEditingExpenseId(null);
    setExpenseForm({
      voucherNo: '',
      title: '',
      category: 'Utilities',
      amount: '',
      date: new Date().toISOString().slice(0, 10),
      paymentMethod: 'Cash',
      paidTo: '',
      status: 'Paid',
      receiptRef: '',
      notes: ''
    });
    setIsExpenseModalOpen(true);
  };

  const handleOpenEditExpense = (exp: Expense) => {
    setEditingExpenseId(exp.id);
    setExpenseForm({
      voucherNo: exp.voucherNo,
      title: exp.title,
      category: exp.category,
      amount: String(exp.amount),
      date: exp.date,
      paymentMethod: exp.paymentMethod,
      paidTo: exp.paidTo,
      status: exp.status,
      receiptRef: exp.receiptRef || '',
      notes: exp.notes || ''
    });
    setIsExpenseModalOpen(true);
  };

  const handleSaveExpenseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedAmount = Number(expenseForm.amount);
    if (!expenseForm.title.trim() || !parsedAmount || parsedAmount <= 0) {
      triggerToast('Please enter a valid expense title and amount greater than GHS 0.');
      return;
    }

    if (editingExpenseId) {
      updateExpense(editingExpenseId, {
        voucherNo: expenseForm.voucherNo.trim() || undefined,
        title: expenseForm.title.trim(),
        category: expenseForm.category,
        amount: parsedAmount,
        date: expenseForm.date,
        paymentMethod: expenseForm.paymentMethod,
        paidTo: expenseForm.paidTo.trim() || 'Vendor / Supplier',
        status: expenseForm.status,
        receiptRef: expenseForm.receiptRef.trim() || undefined,
        notes: expenseForm.notes.trim() || undefined
      });
      triggerToast(`Updated expenditure "${expenseForm.title.trim()}" (GHS ${parsedAmount.toLocaleString()})`);
    } else {
      const created = addExpense({
        voucherNo: expenseForm.voucherNo.trim() || undefined,
        title: expenseForm.title.trim(),
        category: expenseForm.category,
        amount: parsedAmount,
        date: expenseForm.date,
        paymentMethod: expenseForm.paymentMethod,
        paidTo: expenseForm.paidTo.trim() || 'Vendor / Supplier',
        recordedBy: currentUser?.name || 'Accounts Office',
        status: expenseForm.status,
        receiptRef: expenseForm.receiptRef.trim() || undefined,
        notes: expenseForm.notes.trim() || undefined,
        term: currentTerm,
        academicYear
      });
      triggerToast(`Recorded expenditure ${created.voucherNo}: GHS ${parsedAmount.toLocaleString()}`);
    }
    setIsExpenseModalOpen(false);
  };

  // Unified General Ledger entries (Credits = Fee Payments, Debits = Expenses)
  const combinedLedgerEntries = [
    ...payments.map((p) => ({
      id: `cr-${p.id}`,
      ref: p.receiptNo || p.paymentRef || p.reference || p.id,
      accountHead: p.studentName ? `Student Fees (${p.studentName})` : 'Student Tuition & Levies',
      category: `${p.paymentMethod}${p.feeCategory ? ` • ${p.feeCategory}` : ''}`,
      type: 'CREDIT' as const,
      amount: Number(p.amount) || 0,
      date: p.paymentDate || p.date || '',
      status: 'Posted'
    })),
    ...expenses.map((exp) => ({
      id: `db-${exp.id}`,
      ref: exp.voucherNo,
      accountHead: `${exp.title}${exp.paidTo ? ` (${exp.paidTo})` : ''}`,
      category: `${exp.category} • ${exp.paymentMethod}`,
      type: 'DEBIT' as const,
      amount: Number(exp.amount) || 0,
      date: exp.date,
      status: exp.status
    }))
  ]
    .filter((entry) => {
      if (ledgerTypeFilter === 'credit') return entry.type === 'CREDIT';
      if (ledgerTypeFilter === 'debit') return entry.type === 'DEBIT';
      return true;
    })
    .sort((a, b) => new Date(b.date || '').getTime() - new Date(a.date || '').getTime());

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
    'Creche',
    'Nursery 1',
    'Nursery 2',
    'KG 1',
    'KG 2',
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

  // Handle Opening Adjust Arrears Modal
  const handleOpenAdjustArrears = (studentId: string, currentInv?: Invoice) => {
    const std = students.find(s => s.id === studentId);
    if (!std) return;

    const breakdown = currentInv ? getInvoiceBreakdown(currentInv) : null;
    const currentArrears = breakdown ? breakdown.arrears : (std.manualArrears || 0);
    const currentTermBill = breakdown ? breakdown.currentTermAmount : 0;
    const totalBalance = std.balanceDue || (currentTermBill + currentArrears);

    setAdjustArrearsTarget({
      studentId: std.id,
      studentName: `${std.firstName} ${std.lastName}`,
      className: std.className,
      currentArrears,
      currentTermBill,
      totalBalance,
      newArrearsAmount: currentArrears,
      reason: ''
    });

    setIsAdjustArrearsOpen(true);
  };

  const handleSaveAdjustArrearsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustArrearsTarget) return;

    updateStudentArrears(
      adjustArrearsTarget.studentId,
      Number(adjustArrearsTarget.newArrearsAmount) || 0,
      adjustArrearsTarget.reason || 'Manual Admin/Finance Arrears Adjustment'
    );

    triggerToast(`Arrears for ${adjustArrearsTarget.studentName} updated to GHS ${Number(adjustArrearsTarget.newArrearsAmount).toLocaleString()}`);
    setIsAdjustArrearsOpen(false);
  };

  // Export Financial CSV
  const handleExportCSV = () => {
    let csv = `Grace White Dove School Complex - Financial Report (${activeSubTab.toUpperCase()})\n`;
    csv += `Academic Session: ${academicYear} • ${currentTerm}\n`;
    csv += `Generated on: ${new Date().toLocaleString()} by Accountant Desk (Powered by BenDaz IT Consult)\n\n`;

    if (activeSubTab === 'ledger-summary') {
      csv += `--- LEDGER & SUMMARY TOTALS ---\n`;
      csv += `Total Fees (Term/Tuition),GHS ${totalTuitionFees.toLocaleString()}\n`;
      csv += `Total Books & Materials,GHS ${totalBooksValue.toLocaleString()}\n`;
      csv += `Total Accessories & Uniforms,GHS ${totalAccessoriesValue.toLocaleString()}\n`;
      csv += `Total Amount (Current Term Billed),GHS ${totalAmountBilled.toLocaleString()}\n`;
      csv += `Total Arrears (Manual Previous Debt),GHS ${totalArrears.toLocaleString()}\n`;
      csv += `Cumulative Billable (Current + Arrears),GHS ${cumulativeBillable.toLocaleString()}\n`;
      csv += `Total Completed / Paid,GHS ${totalCompletedPaidFees.toLocaleString()}\n`;
      csv += `Net Outstanding Balance,GHS ${totalPendingArrears.toLocaleString()}\n`;
      csv += `Total Expenditure (Expenses),GHS ${totalExpenses.toLocaleString()}\n`;
      csv += `Net Cash Surplus / Balance (Collected - Expenses),GHS ${netCashflowBalance.toLocaleString()}\n\n`;
      csv += `--- GENERAL LEDGER TRANSACTIONS ---\n`;
      csv += `Reference,Account,Category,Debit/Credit,Amount (GHS),Date,Status\n`;
      payments.forEach((p) => {
        csv += `"${p.receiptNo || p.reference || p.paymentRef}","Student Fees (${p.studentName})","${p.paymentMethod}","CREDIT",${p.amount},"${p.paymentDate || p.date}","Posted"\n`;
      });
      expenses.forEach((exp) => {
        csv += `"${exp.voucherNo}","${exp.title} (${exp.paidTo})","${exp.category} • ${exp.paymentMethod}","DEBIT",${exp.amount},"${exp.date}","${exp.status}"\n`;
      });
    } else if (activeSubTab === 'tracking-arrears') {
      csv += `--- STUDENT FEES TRACKING & ARREARS ---\n`;
      csv += `Invoice #,Student Name,Class,Term Fees (GHS),Books (GHS),Accessories (GHS),Total Amount Current (GHS),Manual Arrears (GHS),Grand Total (GHS),Paid (GHS),Balance Due (GHS),Status,Due Date\n`;
      filteredInvoices.forEach((i) => {
        const bk = getInvoiceBreakdown(i);
        csv += `"${i.invoiceNo}","${i.studentName}","${i.className}",${bk.termFees},${bk.books},${bk.accessories},${bk.currentTermAmount},${bk.arrears},${bk.grandTotal},${bk.paidAmount},${bk.balanceDue},"${i.status}","${i.dueDate}"\n`;
      });
    } else if (activeSubTab === 'payroll-desk') {
      csv += `--- STAFF PAYROLL DESK ---\n`;
      csv += `Monthly Commitment,GHS ${monthlyPayrollCommitment.toLocaleString()}\n`;
      csv += `Salaries Disbursed,GHS ${payrollSalariesDisbursed.toLocaleString()}\n`;
      csv += `Outstanding Payout,GHS ${outstandingSalaryPayout.toLocaleString()}\n\n`;
      csv += `Staff Name,Role,Basic Salary,Allowances,SSNIT / Tax,Net Salary,Status\n`;
      payrolls.forEach((pr) => {
        const allowVal = typeof pr.allowances === 'number' ? pr.allowances : (pr.allowances?.housing || 0) + (pr.allowances?.transport || 0) + (pr.allowances?.medical || 0);
        csv += `"${pr.staffName}","Faculty/Staff",${pr.basicSalary},${allowVal},${pr.deductions.pension + pr.deductions.tax},${pr.netSalary},"${pr.paymentStatus || pr.status}"\n`;
      });
    } else if (activeSubTab === 'expenses-desk') {
      csv += `--- INSTITUTIONAL EXPENDITURE LEDGER ---\n`;
      csv += `Total Expenditure,GHS ${totalExpenses.toLocaleString()}\n`;
      csv += `Paid Expenditure,GHS ${paidExpenses.toLocaleString()}\n`;
      csv += `Pending / Approved Unpaid,GHS ${pendingExpenses.toLocaleString()}\n`;
      csv += `Net Cash Surplus (Revenue Collected - Expenditure),GHS ${netCashflowBalance.toLocaleString()}\n\n`;
      csv += `Voucher #,Date,Expense Title,Category,Paid To (Vendor),Payment Method,Receipt Ref,Recorded By,Amount (GHS),Status,Notes\n`;
      filteredExpenses.forEach((exp) => {
        csv += `"${exp.voucherNo}","${exp.date}","${exp.title.replace(/"/g, '""')}","${exp.category}","${exp.paidTo.replace(/"/g, '""')}","${exp.paymentMethod}","${exp.receiptRef || ''}","${exp.recordedBy}",${exp.amount},"${exp.status}","${(exp.notes || '').replace(/"/g, '""')}"\n`;
      });
    }

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `GraceWhiteDove_Financial_${activeSubTab}_${academicYear}.csv`);
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

        <button
          onClick={() => setActiveSubTab('expenses-desk')}
          className={`px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
            activeSubTab === 'expenses-desk'
              ? 'bg-emerald-900 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
          }`}
        >
          <Wallet className={`w-4 h-4 ${activeSubTab === 'expenses-desk' ? 'text-amber-400' : 'text-rose-600'}`} />
          <span>5. Expenses & Expenditure</span>
          {expenses.length > 0 && (
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-black ${
              activeSubTab === 'expenses-desk' ? 'bg-amber-400 text-emerald-950' : 'bg-rose-100 text-rose-800'
            }`}>
              {expenses.length}
            </span>
          )}
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 1. SUB-TAB: LEDGER & SUMMARY */}
      {/* Required Cards: Total Fees, Total Books, Total Accessories, Total Amount (Current Term), Total Arrears (Manual) */}
      {/* ========================================================================= */}
      {activeSubTab === 'ledger-summary' && (
        <div className="space-y-6">
          {/* Top 5 Requested KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
            {/* Total Fees */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Fees (Term)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center font-black">
                  ₵
                </div>
              </div>
              <div className="text-xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {Math.round(totalTuitionFees).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-700 font-medium">Core Term Tuition</span>
            </div>

            {/* Total Books */}
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-purple-300 transition-all">
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
            <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs hover:border-rose-300 transition-all">
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

            {/* Total Amount (Current Term: Fees + Books + Accessories) */}
            <div className="bg-white rounded-2xl p-4 border-2 border-emerald-600/30 shadow-xs hover:border-emerald-600 transition-all bg-emerald-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-emerald-950 uppercase tracking-wider">Total Amount (Current Term)</span>
                <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-black">
                  <DollarSign className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-emerald-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalAmountBilled).toLocaleString()}
              </div>
              <span className="text-[10px] text-emerald-800 font-semibold">Fees + Books + Accessories</span>
            </div>

            {/* Total Arrears (Entered manually by Admin/Finance) */}
            <div className="bg-white rounded-2xl p-4 border-2 border-rose-400/30 shadow-xs hover:border-rose-500 transition-all bg-rose-50/20">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-rose-900 uppercase tracking-wider">Total Arrears (Manual)</span>
                <div className="w-8 h-8 rounded-lg bg-rose-700 text-white flex items-center justify-center font-black">
                  <AlertCircle className="w-4 h-4" />
                </div>
              </div>
              <div className="text-xl font-black text-rose-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalArrears).toLocaleString()}
              </div>
              <span className="text-[10px] text-rose-700 font-medium">Prior Debt (Manual Entry)</span>
            </div>
          </div>

          {/* Expenditure & Net Cashflow Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
            <div className="bg-white rounded-2xl p-4 border border-emerald-200 shadow-xs flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block">Total Revenue Collected</span>
                <div className="text-xl font-black text-emerald-900 font-['Outfit'] mt-1">
                  +GHS {totalCompletedPaidFees.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-slate-500">{payments.length} verified credit entries</span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center">
                <ArrowUpRight className="w-5 h-5" />
              </div>
            </div>

            <div
              onClick={() => setActiveSubTab('expenses-desk')}
              className="bg-white rounded-2xl p-4 border-2 border-rose-200 hover:border-rose-400 shadow-xs flex items-center justify-between cursor-pointer transition-all"
              title="Click to open School Expenses & Expenditure Desk"
            >
              <div>
                <span className="text-[11px] font-bold text-rose-800 uppercase tracking-wider block">Total Expenditure (Expenses)</span>
                <div className="text-xl font-black text-rose-700 font-['Outfit'] mt-1">
                  -GHS {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className="text-[10px] text-rose-700 font-semibold">
                  {expenses.length} voucher(s) • Click to record or manage →
                </span>
              </div>
              <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
                <ArrowDownRight className="w-5 h-5" />
              </div>
            </div>

            <div className={`rounded-2xl p-4 border-2 shadow-xs flex items-center justify-between ${
              netCashflowBalance >= 0
                ? 'bg-emerald-50/40 border-emerald-300'
                : 'bg-red-50/60 border-red-400'
            }`}>
              <div>
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Net Cash Position (Revenue − Expenses)
                </span>
                <div className={`text-xl font-black font-['Outfit'] mt-1 ${
                  netCashflowBalance >= 0 ? 'text-emerald-950' : 'text-red-700'
                }`}>
                  {netCashflowBalance >= 0 ? '' : '-'}GHS {Math.abs(netCashflowBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </div>
                <span className={`text-[10px] font-bold ${netCashflowBalance >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
                  {netCashflowBalance >= 0 ? 'Operating Surplus' : 'Operating Deficit (Expenses Exceed Revenue)'}
                </span>
              </div>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                netCashflowBalance >= 0 ? 'bg-emerald-800 text-amber-300' : 'bg-red-600 text-white'
              }`}>
                {netCashflowBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
              </div>
            </div>
          </div>

          {/* Audit Reconciliation Formula Strip */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 text-white border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                ₵
              </div>
              <div>
                <h4 className="font-bold text-sm font-['Outfit'] text-amber-300">Financial Audit & Reconciliation Formula</h4>
                <p className="text-[11px] text-slate-300">Revenue, Arrears & Institutional Expenditure Reconciliation:</p>
              </div>
            </div>

            <div className="flex items-center flex-wrap gap-2 text-xs font-mono">
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">Current Total: <strong>GHS {Math.round(totalAmountBilled).toLocaleString()}</strong></span>
              <span className="text-amber-400 font-bold">+</span>
              <span className="bg-white/10 px-2.5 py-1 rounded-lg">Manual Arrears: <strong>GHS {Math.round(totalArrears).toLocaleString()}</strong></span>
              <span className="text-amber-400 font-bold">=</span>
              <span className="bg-amber-400 text-emerald-950 px-2.5 py-1 rounded-lg font-bold">Cumulative: GHS {Math.round(cumulativeBillable).toLocaleString()}</span>
              <span className="text-slate-400">|</span>
              <span className="bg-emerald-800 text-emerald-100 px-2.5 py-1 rounded-lg">Collected: GHS {Math.round(totalCompletedPaidFees).toLocaleString()}</span>
              <span className="bg-rose-800 text-rose-100 px-2.5 py-1 rounded-lg">Expenses: -GHS {Math.round(totalExpenses).toLocaleString()}</span>
              <span className={`px-2.5 py-1 rounded-lg font-bold ${netCashflowBalance >= 0 ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}>
                Net Surplus: GHS {Math.round(netCashflowBalance).toLocaleString()}
              </span>
            </div>
          </div>

          {/* General Ledger stream */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Institutional General Ledger</h3>
                <p className="text-xs text-slate-500">Double-entry audit reconciliation stream (Fee Credits & Expenditure Debits)</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="flex items-center bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setLedgerTypeFilter('all')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${ledgerTypeFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-500'}`}
                  >
                    All ({payments.length + expenses.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLedgerTypeFilter('credit')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${ledgerTypeFilter === 'credit' ? 'bg-emerald-700 text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Credits ({payments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setLedgerTypeFilter('debit')}
                    className={`px-2.5 py-1 rounded-lg cursor-pointer transition-all ${ledgerTypeFilter === 'debit' ? 'bg-rose-700 text-white shadow-xs' : 'text-slate-500'}`}
                  >
                    Debits / Expenses ({expenses.length})
                  </button>
                </div>
                <button
                  type="button"
                  onClick={handleOpenNewExpense}
                  className="px-3 py-1.5 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <Plus className="w-3.5 h-3.5" /> Record Expense
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Transaction / Voucher Ref</th>
                    <th className="py-3 px-4">Account Head / Description</th>
                    <th className="py-3 px-4">Category & Channel</th>
                    <th className="py-3 px-4">Type</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {combinedLedgerEntries.length > 0 ? (
                    combinedLedgerEntries.map((entry) => (
                      <tr key={entry.id} className="hover:bg-slate-50/80">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{entry.ref}</td>
                        <td className={`py-3 px-4 font-semibold ${entry.type === 'CREDIT' ? 'text-emerald-950' : 'text-rose-950'}`}>
                          {entry.accountHead}
                        </td>
                        <td className="py-3 px-4 text-slate-600">{entry.category}</td>
                        <td className="py-3 px-4">
                          {entry.type === 'CREDIT' ? (
                            <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              CREDIT
                            </span>
                          ) : (
                            <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded text-[10px]">
                              DEBIT (EXPENSE)
                            </span>
                          )}
                        </td>
                        <td className={`py-3 px-4 font-black font-mono ${entry.type === 'CREDIT' ? 'text-emerald-800' : 'text-rose-700'}`}>
                          {entry.type === 'CREDIT' ? '+' : '-'}GHS {entry.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-slate-500">{entry.date}</td>
                        <td className="py-3 px-4 text-right">
                          <span className={`font-semibold inline-flex items-center gap-1 ${
                            entry.type === 'CREDIT'
                              ? 'text-emerald-700'
                              : entry.status === 'Paid'
                              ? 'text-rose-700'
                              : 'text-amber-700'
                          }`}>
                            <CheckCircle2 className="w-3.5 h-3.5" /> {entry.status}
                          </span>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-slate-400">
                        No fee receipts or expenditure entries recorded yet.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. SUB-TAB: STUDENT FEES DESK */}
      {/* Required Cards: Total Amount (Current Term), Total Arrears (Manual), Completed/Paid Fees, Outstanding Balance */}
      {/* ========================================================================= */}
      {activeSubTab === 'fees-desk' && (
        <div className="space-y-6">
          {/* Top 4 KPI Metric Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Total Amount (Current Term: Fees + Books + Accessories) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Amount (Current Term)</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                  <DollarSign className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {Math.round(totalAmountBilled).toLocaleString()}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Term Fees + Books + Accessories</span>
            </div>

            {/* Total Arrears (Manual Entry) */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Arrears (Manual)</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-800 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalArrears).toLocaleString()}
              </div>
              <span className="text-xs text-rose-700 font-medium">Manually entered by Admin / Finance</span>
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
              <span className="text-xs text-emerald-700 font-medium">Cleared & Settled Payments</span>
            </div>

            {/* Net Outstanding Balance */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Net Outstanding Balance</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-950 font-['Outfit'] mt-2">
                GHS {Math.round(totalPendingArrears).toLocaleString()}
              </div>
              <span className="text-xs text-amber-700 font-medium">Cumulative Balance to Recover</span>
            </div>
          </div>

          {/* Active Fee Structures and Class Billing Tiers */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Standard Fee Structures by Class</h3>
                <p className="text-xs text-slate-500">Termly tuition, accessories, books, and levies breakdown</p>
              </div>
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

          {/* Arrears and Invoices Table with Complete Columns Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 whitespace-nowrap">
                  <tr>
                    <th className="py-3 px-3.5">Invoice #</th>
                    <th className="py-3 px-3.5">Student & ID</th>
                    <th className="py-3 px-3">Class</th>
                    <th className="py-3 px-3">Term Fees</th>
                    <th className="py-3 px-3">Books</th>
                    <th className="py-3 px-3">Accessories</th>
                    <th className="py-3 px-3.5 text-emerald-950 font-bold bg-emerald-50/40">Total Amount (Current)</th>
                    <th className="py-3 px-3.5 text-rose-900 font-bold bg-rose-50/40">Manual Arrears</th>
                    <th className="py-3 px-3.5 font-black text-slate-900">Grand Total</th>
                    <th className="py-3 px-3 text-emerald-800">Paid</th>
                    <th className="py-3 px-3.5 text-amber-900">Balance Due</th>
                    <th className="py-3 px-3">Status</th>
                    <th className="py-3 px-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 whitespace-nowrap">
                  {filteredInvoices.map((inv) => {
                    const std = students.find((s) => s.id === inv.studentId);
                    const bk = getInvoiceBreakdown(inv);
                    return (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-3.5 font-mono font-bold text-emerald-950">{inv.invoiceNo}</td>
                        <td className="py-3 px-3.5">
                          <div className="font-bold text-slate-900">{inv.studentName}</div>
                          <div className="text-[10px] text-slate-400 font-mono">{std?.admissionNo || 'ADM-GWD'}</div>
                        </td>
                        <td className="py-3 px-3 text-slate-700">{inv.className}</td>
                        <td className="py-3 px-3 font-mono text-slate-700">
                          GHS {bk.termFees.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-purple-900">
                          GHS {bk.books.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-mono text-rose-900">
                          GHS {bk.accessories.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-bold font-mono text-emerald-950 bg-emerald-50/30">
                          GHS {bk.currentTermAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-bold font-mono text-rose-700 bg-rose-50/30">
                          GHS {bk.arrears.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-black font-mono text-slate-900">
                          GHS {bk.grandTotal.toLocaleString()}
                        </td>
                        <td className="py-3 px-3 font-bold text-emerald-700 font-mono">
                          GHS {bk.paidAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-3.5 font-black font-mono">
                          <span className={bk.balanceDue > 0 ? 'text-amber-900' : 'text-slate-400'}>
                            GHS {bk.balanceDue.toLocaleString()}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Partially Paid' || inv.status === 'Partial'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-amber-100 text-amber-900'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-3.5 text-right space-x-1.5 whitespace-nowrap">
                          {/* Manual Arrears Adjustment Button for Admin / Finance */}
                          <button
                            onClick={() => handleOpenAdjustArrears(inv.studentId, inv)}
                            className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors shadow-xs"
                            title="Manually adjust or enter arrears for this student"
                          >
                            <AlertCircle className="w-3.5 h-3.5 text-amber-800" />
                            Edit Arrears
                          </button>

                          {bk.balanceDue > 0 && (
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
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={async () => {
                    if (window.confirm(`Are you sure you want to clear and reset all ${reimbursements.length} expense & supply reimbursement claims?`)) {
                      await resetAllReimbursements('clear-all');
                      alert('All Expense & Supply Reimbursements have been cleared and reset to GHS 0.00.');
                    }
                  }}
                  className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 hover:border-rose-300 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-all cursor-pointer"
                  title="Clear and reset expense & supply reimbursement records"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                  Clear & Reset Reimbursements ({reimbursements.length})
                </button>
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
      {/* 5. SUB-TAB: SCHOOL EXPENSES & EXPENDITURE DESK */}
      {/* ========================================================================= */}
      {activeSubTab === 'expenses-desk' && (
        <div className="space-y-6">
          {/* Top 4 Expenditure KPI Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border-2 border-rose-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-800 uppercase tracking-wider">Total Expenditure</span>
                <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
                  <Wallet className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-rose-950 font-['Outfit'] mt-2">
                GHS {totalExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-rose-700 font-medium">{expenses.length} recorded voucher(s)</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Paid Outflows</span>
                <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-slate-900 font-['Outfit'] mt-2">
                GHS {paidExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-emerald-700 font-medium">Disbursed & settled expenses</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending / Unpaid</span>
                <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
                  <Clock className="w-5 h-5" />
                </div>
              </div>
              <div className="text-2xl font-black text-amber-950 font-['Outfit'] mt-2">
                GHS {pendingExpenses.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-amber-700 font-medium">Awaiting payment settlement</span>
            </div>

            <div className={`rounded-2xl p-5 border-2 shadow-xs ${
              netCashflowBalance >= 0 ? 'bg-emerald-50/40 border-emerald-300' : 'bg-red-50/60 border-red-400'
            }`}>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">Net Surplus Balance</span>
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                  netCashflowBalance >= 0 ? 'bg-emerald-800 text-amber-300' : 'bg-red-600 text-white'
                }`}>
                  {netCashflowBalance >= 0 ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                </div>
              </div>
              <div className={`text-2xl font-black font-['Outfit'] mt-2 ${
                netCashflowBalance >= 0 ? 'text-emerald-950' : 'text-red-700'
              }`}>
                {netCashflowBalance >= 0 ? '' : '-'}GHS {Math.abs(netCashflowBalance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-slate-600 font-medium">Revenue Collected − Expenditure</span>
            </div>
          </div>

          {/* Category Breakdown Chart & Summary (Shown when expenses exist) */}
          {expenseCategorySummary.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Expenditure Breakdown by Category</h3>
                    <p className="text-xs text-slate-500">Visual distribution of school operating expenses (GHS)</p>
                  </div>
                </div>
                <div className="h-56 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={expenseCategorySummary} margin={{ top: 8, right: 12, left: 0, bottom: 4 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="shortName" stroke="#64748b" fontSize={10} />
                      <YAxis stroke="#64748b" fontSize={10} tickFormatter={(v) => `₵${v}`} />
                      <Tooltip
                        formatter={(val: number) => [`GHS ${Number(val).toLocaleString()}`, 'Expenditure']}
                        contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', color: '#fff', fontSize: '11px', border: 'none' }}
                      />
                      <Bar dataKey="amount" fill="#be123c" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="lg:col-span-5 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Category Totals</h3>
                <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                  {expenseCategorySummary
                    .slice()
                    .sort((a, b) => b.amount - a.amount)
                    .map((item) => {
                      const pct = totalExpenses > 0 ? Math.round((item.amount / totalExpenses) * 100) : 0;
                      return (
                        <div key={item.category} className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1.5">
                          <div className="flex items-center justify-between text-xs">
                            <span className="font-bold text-slate-800">{item.category}</span>
                            <span className="font-mono font-black text-rose-800">
                              GHS {item.amount.toLocaleString()} <span className="text-[10px] text-slate-400 font-normal">({pct}%)</span>
                            </span>
                          </div>
                          <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                            <div className="h-full bg-rose-600 rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                        </div>
                      );
                    })}
                </div>
              </div>
            </div>
          )}

          {/* Filter & Action Toolbar */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">School Expenditure & Expense Vouchers</h3>
                <p className="text-xs text-slate-500">
                  Record, categorize, and audit every school operating expense for accurate financial statements.
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {expenses.length > 0 && (
                  <button
                    type="button"
                    onClick={async () => {
                      await clearAllExpenses();
                      triggerToast('All expenditure records cleared from ledger.');
                    }}
                    className="px-3.5 py-2 bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5" /> Clear Expenses
                  </button>
                )}
                <button
                  type="button"
                  onClick={handleOpenNewExpense}
                  className="px-4 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  <span>Record New Expense</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              <div className="relative lg:col-span-2">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={expenseSearch}
                  onChange={(e) => setExpenseSearch(e.target.value)}
                  placeholder="Search voucher #, title, vendor, notes..."
                  className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-600"
                />
              </div>
              <select
                value={expenseCategoryFilter}
                onChange={(e) => setExpenseCategoryFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="all">All Categories</option>
                {EXPENSE_CATEGORIES.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
              <select
                value={expenseMethodFilter}
                onChange={(e) => setExpenseMethodFilter(e.target.value)}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="all">All Methods</option>
                <option value="Cash">Cash</option>
                <option value="Mobile Money">Mobile Money</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Cheque">Cheque</option>
              </select>
              <select
                value={expenseStatusFilter}
                onChange={(e) => setExpenseStatusFilter(e.target.value as 'all' | 'Paid' | 'Approved' | 'Pending')}
                className="px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-700"
              >
                <option value="all">All Statuses</option>
                <option value="Paid">Paid</option>
                <option value="Approved">Approved</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
          </div>

          {/* Expenses Ledger Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Voucher #</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Expense Description</th>
                    <th className="py-3 px-4">Category</th>
                    <th className="py-3 px-4">Paid To (Vendor)</th>
                    <th className="py-3 px-4">Method</th>
                    <th className="py-3 px-4">Amount (GHS)</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredExpenses.length > 0 ? (
                    filteredExpenses.map((exp) => (
                      <tr key={exp.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-slate-900">{exp.voucherNo}</td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">{exp.date}</td>
                        <td className="py-3 px-4">
                          <div className="font-bold text-slate-900">{exp.title}</div>
                          {(exp.notes || exp.receiptRef) && (
                            <div className="text-[10px] text-slate-500">
                              {exp.receiptRef ? `Ref: ${exp.receiptRef}` : ''}
                              {exp.receiptRef && exp.notes ? ' • ' : ''}
                              {exp.notes || ''}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[10px]">
                            {exp.category}
                          </span>
                        </td>
                        <td className="py-3 px-4 font-medium text-slate-700">{exp.paidTo}</td>
                        <td className="py-3 px-4 text-slate-600">{exp.paymentMethod}</td>
                        <td className="py-3 px-4 font-mono font-black text-rose-700">
                          -GHS {Number(exp.amount).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.status === 'Paid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : exp.status === 'Approved'
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-amber-100 text-amber-900'
                          }`}>
                            {exp.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right whitespace-nowrap">
                          <div className="inline-flex items-center gap-1.5">
                            {exp.status !== 'Paid' && (
                              <button
                                type="button"
                                onClick={() => {
                                  updateExpense(exp.id, { status: 'Paid' });
                                  triggerToast(`Marked voucher ${exp.voucherNo} as Paid.`);
                                }}
                                className="px-2 py-1 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-lg text-[10px] cursor-pointer"
                                title="Mark as Paid"
                              >
                                Mark Paid
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenEditExpense(exp)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="Edit Expense"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                deleteExpense(exp.id);
                                triggerToast(`Deleted expenditure voucher ${exp.voucherNo}.`);
                              }}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 cursor-pointer"
                              title="Delete Expense"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={9} className="py-12 text-center">
                        <Wallet className="w-8 h-8 text-slate-300 mx-auto mb-2" />
                        <p className="text-xs font-bold text-slate-700">No Expenditure Records Found</p>
                        <p className="text-[11px] text-slate-400 mt-1 mb-3">
                          Record utility bills, teaching supplies, maintenance, fuel, and other school expenses for accurate reporting.
                        </p>
                        <button
                          type="button"
                          onClick={handleOpenNewExpense}
                          className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5 text-amber-300" /> Record First Expense
                        </button>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* OFFICIAL INVOICE MODAL VIEW (Grace White Dove School Complex) */}
      {/* ========================================================================= */}
      {viewingInvoice && (() => {
        const bk = getInvoiceBreakdown(viewingInvoice);
        const std = students.find((s) => s.id === viewingInvoice.studentId);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
            <div id="official-student-invoice-sheet" className="print-area printable-sheet bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
              <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SchoolLogo
                    alt="Grace White Dove"
                    className="w-10 h-10 rounded-xl object-contain bg-white p-0.5 border border-amber-400 shrink-0"
                  />
                  <div>
                    <h3 className="font-bold text-base font-['Outfit']">Grace White Dove School Complex</h3>
                    <p className="text-xs text-emerald-200">Official Student Fee Invoice • Cape Coast, Ghana</p>
                  </div>
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
                    <p className="text-[10px] text-slate-400 font-mono">Admission No: {std?.admissionNo || 'GWD-STD'}</p>
                  </div>
                  <div className="text-right font-mono">
                    <div className="font-bold text-emerald-950">{viewingInvoice.invoiceNo}</div>
                    <div className="text-[10px] text-slate-400">Due: {viewingInvoice.dueDate}</div>
                  </div>
                </div>

                {/* Itemized breakdown */}
                <div className="space-y-1.5 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <div className="font-bold text-slate-800 text-[11px] mb-1">Fee Item Breakdown:</div>
                  {viewingInvoice.items && viewingInvoice.items.length > 0 ? (
                    viewingInvoice.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-slate-700">
                        <span>{it.description}</span>
                        <span className="font-mono font-semibold">GHS {it.amount.toLocaleString()}</span>
                      </div>
                    ))
                  ) : (
                    <>
                      <div className="flex justify-between text-slate-700">
                        <span>Term Fees (Tuition & Levies)</span>
                        <span className="font-mono font-semibold">GHS {bk.termFees.toLocaleString()}</span>
                      </div>
                      {bk.books > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Textbooks & Stationeries</span>
                          <span className="font-mono font-semibold">GHS {bk.books.toLocaleString()}</span>
                        </div>
                      )}
                      {bk.accessories > 0 && (
                        <div className="flex justify-between text-slate-700">
                          <span>Uniforms & Accessories</span>
                          <span className="font-mono font-semibold">GHS {bk.accessories.toLocaleString()}</span>
                        </div>
                      )}
                    </>
                  )}
                </div>

                {/* Totals Breakdown */}
                <div className="border-t border-slate-200 pt-3 space-y-1.5 text-right">
                  <div className="flex justify-between text-slate-700">
                    <span>Term Fees:</span>
                    <span className="font-mono font-semibold">GHS {bk.termFees.toLocaleString()}</span>
                  </div>
                  {bk.books > 0 && (
                    <div className="flex justify-between text-purple-900">
                      <span>Books:</span>
                      <span className="font-mono font-semibold">GHS {bk.books.toLocaleString()}</span>
                    </div>
                  )}
                  {bk.accessories > 0 && (
                    <div className="flex justify-between text-rose-900">
                      <span>Accessories:</span>
                      <span className="font-mono font-semibold">GHS {bk.accessories.toLocaleString()}</span>
                    </div>
                  )}

                  <div className="flex justify-between text-emerald-950 font-bold bg-emerald-50/60 p-2 rounded-lg">
                    <span>Total Amount (Current Term Bill):</span>
                    <span className="font-mono">GHS {bk.currentTermAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-rose-900 font-bold bg-rose-50/60 p-2 rounded-lg">
                    <span>Manual Arrears (Prior Debt):</span>
                    <span className="font-mono">GHS {bk.arrears.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-slate-900 font-black text-sm border-t border-slate-200 pt-1.5">
                    <span>Grand Total Billed:</span>
                    <span className="font-mono">GHS {bk.grandTotal.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-emerald-700 font-bold">
                    <span>Amount Paid:</span>
                    <span className="font-mono">GHS {bk.paidAmount.toLocaleString()}</span>
                  </div>

                  <div className="flex justify-between text-amber-900 font-black text-sm border-t border-slate-200 pt-1.5">
                    <span>Net Balance Due:</span>
                    <span className="font-mono">GHS {bk.balanceDue.toLocaleString()}</span>
                  </div>
                </div>

                <div className="text-[10px] text-slate-400 text-center pt-2">
                  Managed by Accounts Desk • Software by BenDaz IT Consult
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => setViewingInvoice(null)}
                    className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => printReportSheet('official-student-invoice-sheet', `Invoice - ${viewingInvoice.invoiceNo} - ${viewingInvoice.studentName}`)}
                    className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-4 h-4 text-amber-300" />
                    Print Official Invoice
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
      })()}

      {/* ========================================================================= */}
      {/* ADJUST STUDENT ARREARS MODAL (Manual Entry by Admin / Finance) */}
      {/* ========================================================================= */}
      {isAdjustArrearsOpen && adjustArrearsTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-gradient-to-r from-amber-900 to-amber-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <AlertCircle className="w-5 h-5 text-amber-950" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit']">Adjust Student Arrears</h3>
                  <p className="text-xs text-amber-200">Manual Entry by Admin / Finance</p>
                </div>
              </div>
              <button
                onClick={() => setIsAdjustArrearsOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdjustArrearsSubmit} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 space-y-1">
                <div className="font-bold text-sm text-slate-900">{adjustArrearsTarget.studentName}</div>
                <div className="text-slate-500">{adjustArrearsTarget.className}</div>
                <div className="flex items-center justify-between pt-2 border-t border-slate-200 text-[11px]">
                  <span className="text-slate-600">Current Term Bill:</span>
                  <span className="font-bold font-mono text-emerald-900">GHS {adjustArrearsTarget.currentTermBill.toLocaleString()}</span>
                </div>
                <div className="flex items-center justify-between text-[11px]">
                  <span className="text-slate-600">Existing Arrears:</span>
                  <span className="font-bold font-mono text-rose-700">GHS {adjustArrearsTarget.currentArrears.toLocaleString()}</span>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Manual Arrears Amount (GHS) <span className="text-rose-500">*</span>
                </label>
                <p className="text-[11px] text-slate-500 mb-2">
                  Enter the exact outstanding arrears for prior academic terms. This is separate from the current term bill.
                </p>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-slate-500">₵</span>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={adjustArrearsTarget.newArrearsAmount}
                    onChange={(e) =>
                      setAdjustArrearsTarget({
                        ...adjustArrearsTarget,
                        newArrearsAmount: Number(e.target.value) || 0
                      })
                    }
                    className="w-full pl-8 pr-4 py-2.5 text-sm font-mono font-bold border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Adjustment Reason / Notes</label>
                <input
                  type="text"
                  value={adjustArrearsTarget.reason}
                  onChange={(e) =>
                    setAdjustArrearsTarget({
                      ...adjustArrearsTarget,
                      reason: e.target.value
                    })
                  }
                  placeholder="e.g., Unpaid Term 2 balance from previous year"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* Summary Calculation Preview */}
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-950 space-y-1">
                <div className="flex justify-between text-[11px]">
                  <span>Current Term Bill:</span>
                  <span className="font-mono">GHS {adjustArrearsTarget.currentTermBill.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] font-bold text-rose-800">
                  <span>+ New Manual Arrears:</span>
                  <span className="font-mono">GHS {(Number(adjustArrearsTarget.newArrearsAmount) || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xs font-black border-t border-amber-200 pt-1 text-slate-900">
                  <span>= Total Cumulative Billable:</span>
                  <span className="font-mono text-emerald-950">
                    GHS {(adjustArrearsTarget.currentTermBill + (Number(adjustArrearsTarget.newArrearsAmount) || 0)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAdjustArrearsOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-800 hover:bg-amber-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>Save Arrears</span>
                </button>
              </div>
            </form>
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

      {/* ========================================================================= */}
      {/* ADD / EDIT SCHOOL EXPENSE MODAL */}
      {/* ========================================================================= */}
      {isExpenseModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Wallet className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold font-['Outfit']">
                    {editingExpenseId ? 'Edit School Expenditure Voucher' : 'Record New School Expense'}
                  </h3>
                  <p className="text-xs text-emerald-200">
                    {academicYear} • {currentTerm} Expenditure Ledger
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsExpenseModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveExpenseSubmit} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  Expense Title / Description <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={expenseForm.title}
                  onChange={(e) => setExpenseForm({ ...expenseForm, title: e.target.value })}
                  placeholder="e.g., ECG Prepaid Electricity Top-up / Whiteboard Markers"
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Expense Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={expenseForm.category}
                    onChange={(e) => setExpenseForm({ ...expenseForm, category: e.target.value as ExpenseCategory })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {EXPENSE_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    Amount (GHS) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    required
                    min="0.01"
                    step="any"
                    value={expenseForm.amount}
                    onChange={(e) => setExpenseForm({ ...expenseForm, amount: e.target.value })}
                    placeholder="0.00"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Paid To (Vendor / Payee) *</label>
                  <input
                    type="text"
                    required
                    value={expenseForm.paidTo}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paidTo: e.target.value })}
                    placeholder="e.g., ECG / Melcom / Fuel Station"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Expense Date *</label>
                  <input
                    type="date"
                    required
                    value={expenseForm.date}
                    onChange={(e) => setExpenseForm({ ...expenseForm, date: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Payment Method</label>
                  <select
                    value={expenseForm.paymentMethod}
                    onChange={(e) => setExpenseForm({ ...expenseForm, paymentMethod: e.target.value as 'Cash' | 'Bank Transfer' | 'Mobile Money' | 'Cheque' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Status</label>
                  <select
                    value={expenseForm.status}
                    onChange={(e) => setExpenseForm({ ...expenseForm, status: e.target.value as 'Paid' | 'Approved' | 'Pending' })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-semibold"
                  >
                    <option value="Paid">Paid</option>
                    <option value="Approved">Approved</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-800 mb-1">Receipt / Ref #</label>
                  <input
                    type="text"
                    value={expenseForm.receiptRef}
                    onChange={(e) => setExpenseForm({ ...expenseForm, receiptRef: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Notes / Justification</label>
                <textarea
                  rows={2}
                  value={expenseForm.notes}
                  onChange={(e) => setExpenseForm({ ...expenseForm, notes: e.target.value })}
                  placeholder="Optional details about purpose or items purchased..."
                  className="w-full px-3 py-2 border border-slate-300 rounded-xl text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsExpenseModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <CheckCircle2 className="w-4 h-4 text-amber-300" />
                  <span>{editingExpenseId ? 'Save Changes' : 'Record Expense'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
