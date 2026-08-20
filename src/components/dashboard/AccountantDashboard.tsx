import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Student, Invoice, Payment } from '../../types';
import {
  CreditCard,
  Banknote,
  FileSpreadsheet,
  Receipt,
  RotateCcw,
  Download,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2,
  Calendar,
  Layers,
  ArrowUpRight,
  Printer,
  X,
  Plus,
  Send,
  Users,
  Search,
  BookOpen,
  Shirt
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

export const AccountantDashboard: React.FC<{
  onOpenPaystack: (invoice?: Invoice, customAmount?: number, studentName?: string, studentId?: string) => void;
}> = ({ onOpenPaystack }) => {
  const {
    students,
    invoices,
    payments,
    feeStructures,
    createInvoice,
    recordPayment,
    clearFinancialRecords,
    clearAllArrears,
    clearTotalCollected,
    currentTerm,
    academicYear,
    setActiveTab,
    logAuditAction
  } = useSchool();

  // Modals state
  const [isBillClassModalOpen, setIsBillClassModalOpen] = useState(false);
  const [isClearReportModalOpen, setIsClearReportModalOpen] = useState(false);
  const [clearReportMode, setClearReportMode] = useState<'arrears-only' | 'payments-only' | 'all'>('arrears-only');

  // Bill Class Form State
  const [billClassForm, setBillClassForm] = useState({
    targetClass: 'Primary 1 (Grade 1)',
    tuitionFee: 0,
    booksFee: 0,
    accessoriesFee: 0,
    devLevy: 0,
    ictFee: 0,
    dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  });

  const [studentSearch, setStudentSearch] = useState('');

  // Financial Calculations
  const totalBilled = invoices.reduce((acc, curr) => acc + curr.totalAmount, 0);

  // Calculate Total Collected Breakdown (Fees, Books, Accessories - strictly excluding arrears)
  const { totalCollected, collectedFees, collectedBooks, collectedAccessories } = useMemo(() => {
    let fSum = 0;
    let bSum = 0;
    let aSum = 0;

    payments.forEach(p => {
      const pAmt = Number(p.amount) || 0;
      if (pAmt <= 0) return;

      if (p.breakdown) {
        fSum += Number(p.breakdown.fees) || 0;
        bSum += Number(p.breakdown.books) || 0;
        aSum += Number(p.breakdown.accessories) || 0;
      } else if (p.feeCategory === 'Fees') {
        fSum += pAmt;
      } else if (p.feeCategory === 'Books') {
        bSum += pAmt;
      } else if (p.feeCategory === 'Accessories') {
        aSum += pAmt;
      } else {
        const remarksLower = (p.remarks || '').toLowerCase();
        if (remarksLower.includes('book') && !remarksLower.includes('term') && !remarksLower.includes('tuition')) {
          bSum += pAmt;
        } else if (remarksLower.includes('accessor') || remarksLower.includes('uniform') || remarksLower.includes('crest')) {
          aSum += pAmt;
        } else {
          const inv = invoices.find(i => i.id === p.invoiceId || i.studentId === p.studentId);
          if (inv && ((inv.termFees || 0) + (inv.books || 0) + (inv.accessories || 0)) > 0) {
            const tf = inv.termFees || (inv.currentTermAmount ? Math.max(0, inv.currentTermAmount - (inv.books || 0) - (inv.accessories || 0)) : (inv.totalAmount - (inv.arrears || 0)));
            const bk = inv.books || 0;
            const acc = inv.accessories || 0;
            const tot = (tf + bk + acc) || 1;
            const fP = Math.round(pAmt * (tf / tot));
            const bP = Math.round(pAmt * (bk / tot));
            const aP = Math.max(0, pAmt - fP - bP);
            fSum += fP;
            bSum += bP;
            aSum += aP;
          } else {
            fSum += pAmt;
          }
        }
      }
    });

    return {
      totalCollected: fSum + bSum + aSum,
      collectedFees: fSum,
      collectedBooks: bSum,
      collectedAccessories: aSum
    };
  }, [payments, invoices]);

  const totalArrears = invoices.reduce((acc, curr) => acc + curr.balance, 0);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Chart data computed dynamically from actual payment records
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const monthlyCashflowData = monthNames.map((month, idx) => {
    const monthPayments = payments.filter((p) => {
      if (!p.date) return false;
      const d = new Date(p.date);
      return !isNaN(d.getTime()) && d.getMonth() === idx;
    });
    const collected = monthPayments.reduce((acc, p) => acc + p.amount, 0);
    return {
      month,
      collected,
      target: totalBilled > 0 ? Math.round(totalBilled / 12) : 0
    };
  });

  const classBillingList = [
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

  // Batch Bill Entire Class
  const handleExecuteBillClass = (e: React.FormEvent) => {
    e.preventDefault();
    const studentsInClass = students.filter((s) => s.className === billClassForm.targetClass);

    if (studentsInClass.length === 0) {
      alert(`No students found currently enrolled in ${billClassForm.targetClass}.`);
      return;
    }

    const totalInvoiceAmount =
      Number(billClassForm.tuitionFee) +
      Number(billClassForm.booksFee) +
      Number(billClassForm.accessoriesFee) +
      Number(billClassForm.devLevy) +
      Number(billClassForm.ictFee);

    studentsInClass.forEach((std) => {
      createInvoice({
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        className: std.className,
        term: currentTerm,
        academicYear: academicYear,
        dueDate: billClassForm.dueDate,
        items: [
          { description: 'Tuition Fee', amount: Number(billClassForm.tuitionFee) },
          { description: 'School Textbooks & Exercise Books', amount: Number(billClassForm.booksFee) },
          { description: 'School Accessories & PE Uniform Kit', amount: Number(billClassForm.accessoriesFee) },
          { description: 'Institutional Development Levy', amount: Number(billClassForm.devLevy) },
          { description: 'ICT Lab & Practical Fee', amount: Number(billClassForm.ictFee) }
        ],
        totalAmount: totalInvoiceAmount,
        paidAmount: 0,
        balance: totalInvoiceAmount,
        status: 'Unpaid'
      });
    });

    logAuditAction(
      'FEE_INVOICE_CREATED',
      'Finance',
      `Class batch billed: ${billClassForm.targetClass} (${studentsInClass.length} students @ GHS ${totalInvoiceAmount})`
    );

    alert(`Successfully generated term bills for ${studentsInClass.length} students in ${billClassForm.targetClass}!`);
    setIsBillClassModalOpen(false);
  };

  // Export Financial Statement CSV
  const handleExportStatement = () => {
    let csv = `Grace White Dove School Complex - Official Financial Statement\n`;
    csv += `Academic Year: ${academicYear}, Current Term: ${currentTerm}\n`;
    csv += `Generated Date: ${new Date().toLocaleDateString()} by Accountant Desk (Powered by BenDaz IT Consult)\n\n`;

    csv += `--- SUMMARY TOTALS ---\n`;
    csv += `Total Billed Revenue,GHS ${totalBilled.toLocaleString()}\n`;
    csv += `Total Fees Collected,GHS ${totalCollected.toLocaleString()}\n`;
    csv += `Total Outstanding Arrears,GHS ${totalArrears.toLocaleString()}\n`;
    csv += `Collection Rate,${collectionRate}%\n\n`;

    csv += `--- RECENT FEE TRANSACTIONS ---\n`;
    csv += `Receipt #,Student ID,Student Name,Class,Amount (GHS),Payment Mode,Date,Status\n`;
    payments.forEach((p) => {
      const std = students.find((s) => s.id === p.studentId);
      csv += `"${p.receiptNo || p.reference}","${std?.admissionNo || p.studentId}","${p.studentName}","${std?.className || 'N/A'}",${p.amount},"${p.paymentMethod}","${p.date}","Verified"\n`;
    });

    const encodedUri = encodeURI('data:text/csv;charset=utf-8,' + csv);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `GraceWhiteDove_Financial_Statement_${academicYear}_${currentTerm}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Clear Financial Reports execution
  const handleClearFinancialReports = async () => {
    if (clearReportMode === 'arrears-only') {
      await clearAllArrears();
      alert('All student arrears have been successfully cleared to GHS 0.00.');
    } else if (clearReportMode === 'payments-only') {
      await clearTotalCollected();
      alert('Total collected figures and payment receipts cleared to GHS 0.00.');
    } else {
      await clearFinancialRecords('all');
      alert('All financial records, invoices, and payments have been completely reset.');
    }
    logAuditAction('FINANCIAL_REPORTS_CLEARED', 'Finance', `Financial ledger reset performed (Mode: ${clearReportMode}).`);
    setIsClearReportModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-150">
      {/* Top Welcome / Action Banner in Emerald and Gold */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-900 via-emerald-800 to-emerald-950 p-6 text-white shadow-md border border-emerald-700/50">
        <div className="absolute right-0 top-0 -mt-10 -mr-10 h-56 w-56 rounded-full bg-amber-400/10 blur-2xl pointer-events-none" />
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="bg-amber-400 text-emerald-950 font-extrabold text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded-full shadow-xs">
                Accountant Desk • {academicYear}
              </span>
              <span className="text-emerald-300 text-xs font-semibold">{currentTerm} Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-['Outfit'] text-white">
              Grace White Dove Finance Portal
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100/90 mt-1 max-w-xl">
              Class-level billing automation, real-time fee settlement tracking via Paystack, ledger records, and statement exports.
            </p>
          </div>

          {/* Requested Top Functional Buttons on Accountant Dashboard */}
          <div className="flex flex-wrap items-center gap-2.5">
            {/* 1. Bill Class */}
            <button
              onClick={() => setIsBillClassModalOpen(true)}
              className="bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="Batch generate term fee invoices for an entire classroom"
            >
              <Layers className="w-4 h-4 text-emerald-950" />
              Bill Class
            </button>

            {/* 2. Fee Management */}
            <button
              onClick={() => setActiveTab('fees')}
              className="bg-white text-emerald-950 hover:bg-emerald-50 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer hover:scale-[1.02]"
              title="View student invoices and billing management"
            >
              <CreditCard className="w-4 h-4 text-emerald-700" />
              Fee Management
            </button>

            {/* 3. Clear Financial Reports */}
            <button
              onClick={() => setIsClearReportModalOpen(true)}
              className="bg-emerald-800/90 hover:bg-emerald-700 text-emerald-100 font-semibold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-emerald-600 transition-all cursor-pointer"
              title="Clear report filters & refresh financial ledger cache"
            >
              <RotateCcw className="w-4 h-4 text-amber-300" />
              Clear Financial Reports
            </button>

            {/* 4. Export Statement */}
            <button
              onClick={handleExportStatement}
              className="bg-emerald-950/80 hover:bg-emerald-900 text-white font-bold px-3.5 py-2.5 rounded-xl text-xs flex items-center gap-2 border border-emerald-600/70 shadow-sm transition-all cursor-pointer"
              title="Download full CSV & ledger statement"
            >
              <Download className="w-4 h-4 text-amber-400" />
              Export Statement
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Collected */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Fees Collected</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-emerald-800 font-['Outfit']">
              GHS {totalCollected.toLocaleString(undefined, { minimumFractionDigits: 2 })}
            </div>
            {/* 3-Way Granular Breakdown for Accounts */}
            <div className="grid grid-cols-3 gap-1.5 mt-2.5 pt-2.5 border-t border-slate-100 text-[10px]">
              <div className="bg-emerald-50/80 p-1.5 rounded-lg text-center border border-emerald-100">
                <span className="text-emerald-700 font-semibold block">Fees</span>
                <span className="font-bold text-emerald-950 font-mono">GHS {collectedFees.toLocaleString()}</span>
              </div>
              <div className="bg-sky-50/80 p-1.5 rounded-lg text-center border border-sky-100">
                <span className="text-sky-700 font-semibold block">Books</span>
                <span className="font-bold text-sky-950 font-mono">GHS {collectedBooks.toLocaleString()}</span>
              </div>
              <div className="bg-purple-50/80 p-1.5 rounded-lg text-center border border-purple-100">
                <span className="text-purple-700 font-semibold block">Accessories</span>
                <span className="font-bold text-purple-950 font-mono">GHS {collectedAccessories.toLocaleString()}</span>
              </div>
            </div>
            <p className="text-[10px] text-slate-400 mt-2 font-medium">
              {payments.length === 0 ? 'No payments recorded yet' : `${payments.length} Payments Reconciled (Arrears Excluded)`}
            </p>
          </div>
        </div>

        {/* Total Arrears */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-amber-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Outstanding Arrears</span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
              <AlertCircle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-amber-950 font-['Outfit']">
              GHS {totalArrears.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-amber-700 font-semibold mt-1">
              <span>{invoices.filter((i) => i.balance > 0).length} students pending clearance</span>
            </div>
          </div>
        </div>

        {/* Total Current Term Billing */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Term Billing</span>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-['Outfit']">
              GHS {totalBilled.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
              <span>{invoices.length} total issued invoices</span>
            </div>
          </div>
        </div>

        {/* Enrolled Students Covered */}
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-emerald-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Students Enrolled</span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-800 flex items-center justify-center font-bold">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-2xl font-black text-slate-900 font-['Outfit']">
              {students.length} Pupils
            </div>
            <div className="flex items-center gap-1.5 text-xs text-blue-700 font-semibold mt-1">
              <span>Across Primary & JHS divisions</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Cashflow Charts & Fast Financial Ops */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Chart (2 Cols) */}
        <div className="lg:col-span-2 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Fee Collection & Revenue Velocity</h3>
              <p className="text-xs text-slate-500">Monthly actual collection compared against institutional target (GHS)</p>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 cursor-pointer"
            >
              View Full Reports <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyCashflowData}>
                <defs>
                  <linearGradient id="accColorCol" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#047857" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#047857" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `₵${v / 1000}k`} />
                <Tooltip
                  formatter={(val: number) => [`GHS ${val.toLocaleString()}`, 'Amount']}
                  contentStyle={{ backgroundColor: '#064e3b', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Area type="monotone" dataKey="collected" stroke="#047857" strokeWidth={2.5} fillOpacity={1} fill="url(#accColorCol)" name="Collected" />
                <Area type="monotone" dataKey="target" stroke="#f59e0b" strokeWidth={1.5} strokeDasharray="4 4" fill="none" name="Target" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Accounts & Online Gateway Settlement Status Card */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center font-black text-sm shadow-xs">
                <CreditCard className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Accounts & Settlement</h3>
                <p className="text-[11px] text-slate-500">Automated parent billing & gateway reconciliation</p>
              </div>
            </div>

            <div className="p-3.5 bg-emerald-50/70 rounded-xl border border-emerald-100 mb-4 text-xs space-y-2">
              <div className="flex justify-between items-center text-emerald-900">
                <span className="font-medium">Gateway Service:</span>
                <span className="font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full text-[10px]">Paystack Live Active</span>
              </div>
              <div className="flex justify-between items-center text-emerald-900">
                <span className="font-medium">Parent Portal MoMo:</span>
                <span className="font-bold text-slate-800 text-[10px]">MTN • Telecel • AT</span>
              </div>
              <div className="flex justify-between items-center text-emerald-900">
                <span className="font-medium">Receipt Delivery:</span>
                <span className="font-bold text-emerald-800 text-[10px]">Parent Portal Receipts</span>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => setActiveTab('fees')}
              className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-amber-300" />
              Open Fee Management
            </button>
            <button
              onClick={() => setActiveTab('reports')}
              className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-800" />
              Open Financial Reports
            </button>
          </div>
        </div>
      </div>

      {/* Financial Transactions & Ledger Activity */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Financial Transactions & Verified Settlements</h3>
            <p className="text-xs text-slate-500">Real-time ledger audit log of student fee transactions</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs font-bold text-emerald-800 hover:underline cursor-pointer"
            >
              View All in Financial Reports →
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Transaction Ref</th>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Payment Channel</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {payments.length > 0 ? (
                payments.slice(0, 7).map((p) => {
                  const std = students.find((s) => s.id === p.studentId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-950">
                        {p.receiptNo || p.reference}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-bold text-slate-900">{p.studentName}</div>
                        <div className="text-[10px] text-slate-400 font-mono">{std?.admissionNo || 'ADM-REC'}</div>
                      </td>
                      <td className="py-3 px-4 text-slate-700">{std?.className || 'Grade Class'}</td>
                      <td className="py-3 px-4 font-black text-emerald-800 font-mono">
                        GHS {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-800 font-medium px-2 py-0.5 rounded text-[10px]">
                          {p.channel || p.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500">{p.date}</td>
                      <td className="py-3 px-4 text-right">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                          Verified
                        </span>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-400">
                    No transactions recorded yet in current ledger.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 1. BILL CLASS MODAL */}
      {/* ========================================================================= */}
      {isBillClassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base font-['Outfit']">Bill Entire Class</h3>
                <p className="text-xs text-emerald-200">Generate term invoices for all enrolled students in a class</p>
              </div>
              <button
                onClick={() => setIsBillClassModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleExecuteBillClass} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Target Class *</label>
                <select
                  value={billClassForm.targetClass}
                  onChange={(e) => setBillClassForm({ ...billClassForm, targetClass: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none font-semibold"
                >
                  {classBillingList.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
                <span className="text-[10px] text-slate-500 mt-1 block">
                  Enrolled Students in selected class: {students.filter((s) => s.className === billClassForm.targetClass).length}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tuition Fee (GHS) *</label>
                  <input
                    type="number"
                    required
                    value={billClassForm.tuitionFee}
                    onChange={(e) => setBillClassForm({ ...billClassForm, tuitionFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Books & Stationery (GHS) *</label>
                  <input
                    type="number"
                    required
                    value={billClassForm.booksFee}
                    onChange={(e) => setBillClassForm({ ...billClassForm, booksFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accessories / Kit (GHS)</label>
                  <input
                    type="number"
                    value={billClassForm.accessoriesFee}
                    onChange={(e) => setBillClassForm({ ...billClassForm, accessoriesFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Dev Levy (GHS)</label>
                  <input
                    type="number"
                    value={billClassForm.devLevy}
                    onChange={(e) => setBillClassForm({ ...billClassForm, devLevy: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ICT Lab (GHS)</label>
                  <input
                    type="number"
                    value={billClassForm.ictFee}
                    onChange={(e) => setBillClassForm({ ...billClassForm, ictFee: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Due Date *</label>
                <input
                  type="date"
                  required
                  value={billClassForm.dueDate}
                  onChange={(e) => setBillClassForm({ ...billClassForm, dueDate: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex justify-between items-center">
                <span className="font-semibold text-amber-900">Total Billed Per Student:</span>
                <span className="font-extrabold text-sm text-emerald-950 font-mono">
                  GHS{' '}
                  {(
                    Number(billClassForm.tuitionFee) +
                    Number(billClassForm.booksFee) +
                    Number(billClassForm.accessoriesFee) +
                    Number(billClassForm.devLevy) +
                    Number(billClassForm.ictFee)
                  ).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBillClassModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Bill Class Now
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 2. CLEAR FINANCIAL REPORTS MODAL */}
      {/* ========================================================================= */}
      {isClearReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="p-6 space-y-4">
              <div className="flex items-center gap-3 border-b border-slate-100 pb-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-['Outfit']">Clear Financial Reports</h3>
                  <p className="text-xs text-slate-500">Select what to clear in the school accounting records.</p>
                </div>
              </div>

              <div className="space-y-2.5 text-xs">
                <label
                  onClick={() => setClearReportMode('arrears-only')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearReportMode === 'arrears-only'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearReportMode"
                    checked={clearReportMode === 'arrears-only'}
                    onChange={() => setClearReportMode('arrears-only')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">1. Clear Arrears Only</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Resets all previous arrears balances to GHS 0.00 across all students.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setClearReportMode('payments-only')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearReportMode === 'payments-only'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearReportMode"
                    checked={clearReportMode === 'payments-only'}
                    onChange={() => setClearReportMode('payments-only')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">2. Clear Total Collected Only</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Clears recorded payment receipts and resets total collected figures back to GHS 0.00.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setClearReportMode('all')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearReportMode === 'all'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearReportMode"
                    checked={clearReportMode === 'all'}
                    onChange={() => setClearReportMode('all')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">3. Full Financial Reset</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Wipes all invoices, payments, and resets all student balances to 0.00.
                    </span>
                  </div>
                </label>
              </div>

              <div className="flex justify-end gap-2.5 pt-2 border-t border-slate-100">
                <button
                  onClick={() => setIsClearReportModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleClearFinancialReports}
                  className="px-5 py-2 bg-rose-700 hover:bg-rose-800 text-white font-bold text-xs rounded-xl shadow-sm cursor-pointer"
                >
                  {clearReportMode === 'arrears-only'
                    ? 'Clear Arrears'
                    : clearReportMode === 'payments-only'
                    ? 'Clear Total Collected'
                    : 'Clear All Records'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
