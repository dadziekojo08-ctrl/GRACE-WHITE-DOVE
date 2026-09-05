import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { PayrollRecord, Reimbursement } from '../../types';
import {
  DollarSign,
  FileSpreadsheet,
  CheckCircle,
  Clock,
  Printer,
  Plus,
  ArrowUpRight,
  TrendingUp,
  Receipt,
  X,
  CreditCard,
  RotateCcw,
  Trash2,
  ShieldCheck,
  ShieldAlert,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info
} from 'lucide-react';

export const PayrollManagement: React.FC = () => {
  const {
    payrolls,
    generateMonthlyPayroll,
    markPayrollPaid,
    reimbursements,
    addReimbursement,
    updateReimbursementStatus,
    deleteReimbursement,
    resetReimbursementStatus,
    resetAllReimbursements,
    staff,
    currentUser,
    activeRole
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'payroll' | 'reimbursements'>('payroll');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isReimbModalOpen, setIsReimbModalOpen] = useState(false);

  // Reimbursement filtering and reset state
  const [reimbSearch, setReimbSearch] = useState('');
  const [reimbStatusFilter, setReimbStatusFilter] = useState<'All' | 'Pending' | 'Approved' | 'Rejected'>('All');
  const [reimbCategoryFilter, setReimbCategoryFilter] = useState<string>('All');
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetMode, setResetMode] = useState<'reset-to-pending' | 'clear-all'>('reset-to-pending');
  const [confirmText, setConfirmText] = useState('');
  const [claimToDelete, setClaimToDelete] = useState<Reimbursement | null>(null);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'warning' } | null>(null);

  // Check if current user is Admin or Accountant
  const isAdminOrAccountant =
    activeRole === 'Admin' ||
    activeRole === 'Accountant' ||
    currentUser?.role === 'Admin' ||
    currentUser?.role === 'Accountant';

  const showToast = (text: string, type: 'success' | 'warning' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleSingleClaimReset = (claim: Reimbursement) => {
    if (!isAdminOrAccountant) {
      alert('Only Admin and Accountant have authorization to reset reimbursements.');
      return;
    }
    resetReimbursementStatus(claim.id, 'Pending');
    showToast(`Claim by ${claim.staffName} (GHS ${claim.amount.toLocaleString()}) reset back to Pending!`);
  };

  const handleSingleClaimDelete = (claim: Reimbursement) => {
    if (!isAdminOrAccountant) {
      alert('Only Admin and Accountant have authorization to delete reimbursements.');
      return;
    }
    deleteReimbursement(claim.id);
    setClaimToDelete(null);
    showToast(`Claim by ${claim.staffName} deleted from records.`, 'warning');
  };

  const handleExecuteResetAll = async () => {
    if (!isAdminOrAccountant) {
      alert('Only Admin and Accountant have authorization to reset reimbursements.');
      return;
    }
    if (resetMode === 'clear-all' && confirmText.trim().toUpperCase() !== 'RESET') {
      alert('Please type "RESET" in the confirmation box to clear all reimbursement records.');
      return;
    }

    if (resetMode === 'reset-to-pending') {
      await resetAllReimbursements('reset-to-pending');
      showToast('All approved and rejected reimbursement claims have been reset back to Pending status!');
    } else {
      await resetAllReimbursements('clear-all');
      showToast('All Expense & Supply Reimbursement records have been completely reset and cleared.', 'warning');
    }
    setIsResetModalOpen(false);
    setConfirmText('');
  };

  // Reimbursement form
  const [reimbForm, setReimbForm] = useState({
    staffId: staff[0]?.id || '',
    category: 'Classroom Supplies & Books',
    amount: 0,
    description: ''
  });

  const totalNetPayroll = payrolls.reduce((sum, p) => sum + p.netSalary, 0);
  const totalTaxDeductions = payrolls.reduce((sum, p) => sum + p.deductions.tax, 0);
  const totalPension = payrolls.reduce((sum, p) => sum + p.deductions.pension, 0);

  // Reimbursement calculations
  const totalReimbAmount = reimbursements.reduce((sum, r) => sum + r.amount, 0);
  const pendingReimbs = reimbursements.filter((r) => r.status === 'Pending');
  const approvedReimbs = reimbursements.filter((r) => r.status === 'Approved');
  const rejectedReimbs = reimbursements.filter((r) => r.status === 'Rejected');
  const pendingAmount = pendingReimbs.reduce((sum, r) => sum + r.amount, 0);
  const approvedAmount = approvedReimbs.reduce((sum, r) => sum + r.amount, 0);

  const filteredReimbursements = reimbursements.filter((r) => {
    const term = reimbSearch.trim().toLowerCase();
    const matchesSearch =
      !term ||
      r.staffName.toLowerCase().includes(term) ||
      r.category.toLowerCase().includes(term) ||
      (r.description && r.description.toLowerCase().includes(term));
    const matchesStatus = reimbStatusFilter === 'All' || r.status === reimbStatusFilter;
    const matchesCategory = reimbCategoryFilter === 'All' || r.category === reimbCategoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const categories = Array.from(new Set(reimbursements.map((r) => r.category).filter(Boolean)));

  const handleRunPayroll = () => {
    generateMonthlyPayroll(selectedMonth, selectedYear);
    alert(`Automated payroll batch generated for ${selectedMonth} ${selectedYear} across all faculty & staff!`);
  };

  const handleClaimReimb = (e: React.FormEvent) => {
    e.preventDefault();
    const stf = staff.find((s) => s.id === reimbForm.staffId) || staff[0];
    addReimbursement({
      staffId: stf.id,
      staffName: stf.name,
      category: reimbForm.category,
      amount: Number(reimbForm.amount),
      description: reimbForm.description
    });
    setIsReimbModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Dynamic Feedback Toast */}
      {toastMessage && (
        <div
          className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl border text-xs font-semibold shadow-sm animate-in fade-in slide-in-from-top-2 duration-200 ${
            toastMessage.type === 'warning'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {toastMessage.type === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            ) : (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            )}
            <span>{toastMessage.text}</span>
          </div>
          <button
            onClick={() => setToastMessage(null)}
            className="p-1 hover:bg-black/5 rounded-md cursor-pointer text-slate-500 hover:text-slate-800"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Staff Payroll & Reimbursements</h2>
            <span className="bg-amber-100 text-amber-900 text-xs font-bold px-2.5 py-0.5 rounded-full">
              Automated Statutory Deductions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Calculate gross allowances, statutory deductions, manage teacher supply claims, and reset reimbursement logs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsReimbModalOpen(true)}
            className="px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-700" />
            Claim Reimbursement
          </button>
          <button
            onClick={handleRunPayroll}
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4 text-amber-300" />
            Process Monthly Payroll
          </button>
        </div>
      </div>

      {/* Dynamic KPI Cards */}
      {activeTab === 'payroll' ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Net Salary Paid</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-['Outfit']">
              GHS {totalNetPayroll.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-700 font-semibold mt-1">Direct Bank Automated ACH</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">PAYE Tax Remitted</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block font-['Outfit']">
              GHS {totalTaxDeductions.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-400 mt-1">Ghana Revenue Authority Compliant</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">SSNIT Pension Fund</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block font-['Outfit']">
              GHS {totalPension.toLocaleString()}
            </span>
            <p className="text-[11px] text-amber-700 font-medium mt-1">Tier 1 & Tier 2 Statutory</p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">Total Claims Submitted</span>
            <span className="text-2xl font-black text-slate-900 mt-1 block font-['Outfit']">
              GHS {totalReimbAmount.toLocaleString()}
            </span>
            <p className="text-[11px] text-slate-500 mt-1">{reimbursements.length} lifetime claims recorded</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider block">Approved & Payable</span>
            <span className="text-2xl font-black text-emerald-800 mt-1 block font-['Outfit']">
              GHS {approvedAmount.toLocaleString()}
            </span>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">{approvedReimbs.length} claims ready for disbursement</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider block">Pending Review</span>
            <span className="text-2xl font-black text-amber-900 mt-1 block font-['Outfit']">
              GHS {pendingAmount.toLocaleString()}
            </span>
            <p className="text-[11px] text-amber-700 font-medium mt-1">{pendingReimbs.length} awaiting approval</p>
          </div>
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <span className="text-xs font-semibold text-rose-700 uppercase tracking-wider block">Rejected Claims</span>
            <span className="text-2xl font-black text-rose-800 mt-1 block font-['Outfit']">
              {rejectedReimbs.length}
            </span>
            <p className="text-[11px] text-rose-700 font-medium mt-1">Disallowed / out of policy</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6">
        <button
          onClick={() => setActiveTab('payroll')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'payroll'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Faculty Salary Payslips ({payrolls.length})
        </button>
        <button
          onClick={() => setActiveTab('reimbursements')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer ${
            activeTab === 'reimbursements'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Expense & Supply Reimbursements ({reimbursements.length})
        </button>
      </div>

      {/* Tab 1: Payroll Records */}
      {activeTab === 'payroll' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Payslip #</th>
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Designation</th>
                  <th className="py-3 px-4">Basic Pay</th>
                  <th className="py-3 px-4">Allowances</th>
                  <th className="py-3 px-4">Deductions</th>
                  <th className="py-3 px-4">Net Salary</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {payrolls.map((p) => {
                  const totalAllow = p.allowances.housing + p.allowances.transport + p.allowances.medical;
                  const totalDeduct = p.deductions.tax + p.deductions.pension + p.deductions.loan;

                  return (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-950">{p.payslipNo}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.staffName}</td>
                      <td className="py-3 px-4 text-slate-600">{p.role}</td>
                      <td className="py-3 px-4 font-mono">GHS {p.basicSalary.toLocaleString()}</td>
                      <td className="py-3 px-4 text-emerald-700 font-mono">+GHS {totalAllow.toLocaleString()}</td>
                      <td className="py-3 px-4 text-red-600 font-mono">-GHS {totalDeduct.toLocaleString()}</td>
                      <td className="py-3 px-4 font-black font-mono text-emerald-800 text-sm">
                        GHS {p.netSalary.toLocaleString()}
                      </td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                          {p.paymentStatus}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => setSelectedPayslip(p)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-emerald-100 text-emerald-800 font-bold rounded-lg text-[11px] flex items-center gap-1 ml-auto cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          View Payslip
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Reimbursements */}
      {activeTab === 'reimbursements' && (
        <div className="space-y-4">
          {/* Controls Bar: Search, Filters, Reset and Claim Actions */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
            {/* Search Input */}
            <div className="relative flex-1 min-w-[240px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search staff name, category, or expense description..."
                value={reimbSearch}
                onChange={(e) => setReimbSearch(e.target.value)}
                className="w-full pl-9 pr-8 py-2 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-emerald-600 focus:border-transparent outline-hidden bg-slate-50/50"
              />
              {reimbSearch && (
                <button
                  onClick={() => setReimbSearch('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Filter pills & Category */}
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center bg-slate-100 p-1 rounded-xl text-xs">
                {(['All', 'Pending', 'Approved', 'Rejected'] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setReimbStatusFilter(st)}
                    className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      reimbStatusFilter === st
                        ? 'bg-white text-emerald-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>

              {categories.length > 0 && (
                <select
                  value={reimbCategoryFilter}
                  onChange={(e) => setReimbCategoryFilter(e.target.value)}
                  className="border border-slate-200 bg-white rounded-xl px-3 py-2 text-xs text-slate-700 font-semibold outline-hidden focus:ring-2 focus:ring-emerald-600"
                >
                  <option value="All">All Categories ({categories.length})</option>
                  {categories.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              )}

              {/* Reset Reimbursements Button (Admin and Accountant only) */}
              {isAdminOrAccountant ? (
                <button
                  onClick={() => {
                    setResetMode('reset-to-pending');
                    setConfirmText('');
                    setIsResetModalOpen(true);
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-800 border border-rose-200 font-bold px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 shadow-xs transition-all cursor-pointer hover:border-rose-300"
                  title="Reset or clear expense & supply reimbursement claims"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-rose-700" />
                  <span>Reset Reimbursements</span>
                  <span className="bg-rose-200/80 text-rose-900 text-[10px] px-1.5 py-0.2 rounded font-extrabold ml-0.5">
                    Admin/Accountant
                  </span>
                </button>
              ) : (
                <div
                  className="bg-slate-100 text-slate-400 font-medium px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-slate-200 cursor-not-allowed"
                  title="Only Admin and Accountant can reset reimbursements"
                >
                  <ShieldAlert className="w-3.5 h-3.5" />
                  <span>Reset Restricted</span>
                </div>
              )}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3.5 px-4">Staff Member</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Description / Item</th>
                    <th className="py-3.5 px-4">Amount</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredReimbursements.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-12 text-center text-slate-400">
                        <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2 stroke-1" />
                        <p className="font-semibold text-slate-600">No reimbursement claims found</p>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          {reimbursements.length === 0
                            ? 'No claims have been submitted or records have been reset.'
                            : 'Try adjusting your search query or status filters.'}
                        </p>
                      </td>
                    </tr>
                  ) : (
                    filteredReimbursements.map((r) => (
                      <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900 flex items-center gap-2">
                            <span className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-900 font-extrabold flex items-center justify-center text-[10px] shrink-0">
                              {r.staffName.slice(0, 2).toUpperCase()}
                            </span>
                            <div>
                              <div>{r.staffName}</div>
                              <div className="text-[10px] text-slate-400 font-mono">ID: {r.staffId}</div>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <span className="inline-block bg-emerald-50 text-emerald-900 border border-emerald-200/70 font-semibold px-2 py-0.5 rounded-lg text-[11px]">
                            {r.category}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-slate-600 max-w-xs leading-relaxed">
                          {r.description || 'No description provided'}
                        </td>
                        <td className="py-3.5 px-4 font-black font-mono text-emerald-800 text-sm">
                          GHS {r.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3.5 px-4 text-slate-500 font-mono">{r.dateSubmitted}</td>
                        <td className="py-3.5 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-wider inline-flex items-center gap-1 ${
                              r.status === 'Approved'
                                ? 'bg-emerald-100 text-emerald-900'
                                : r.status === 'Pending'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {r.status === 'Approved' && <CheckCircle2 className="w-3 h-3 text-emerald-700" />}
                            {r.status === 'Pending' && <Clock className="w-3 h-3 text-amber-700" />}
                            {r.status === 'Rejected' && <X className="w-3 h-3 text-red-700" />}
                            {r.status}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {r.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => updateReimbursementStatus(r.id, 'Approved')}
                                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[11px] shadow-xs cursor-pointer transition-all"
                                >
                                  Approve
                                </button>
                                <button
                                  onClick={() => updateReimbursementStatus(r.id, 'Rejected')}
                                  className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px] cursor-pointer transition-all"
                                >
                                  Reject
                                </button>
                                {isAdminOrAccountant && (
                                  <button
                                    onClick={() => setClaimToDelete(r)}
                                    className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer"
                                    title="Delete this claim"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </>
                            ) : (
                              <>
                                {isAdminOrAccountant ? (
                                  <div className="flex items-center gap-1">
                                    <button
                                      onClick={() => handleSingleClaimReset(r)}
                                      className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] flex items-center gap-1 cursor-pointer transition-all shadow-xs"
                                      title="Reset this claim back to Pending review"
                                    >
                                      <RotateCcw className="w-3 h-3 text-amber-700" />
                                      Reset Status
                                    </button>
                                    <button
                                      onClick={() => setClaimToDelete(r)}
                                      className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer"
                                      title="Delete reimbursement record"
                                    >
                                      <Trash2 className="w-3.5 h-3.5" />
                                    </button>
                                  </div>
                                ) : (
                                  <span className="text-[11px] text-slate-400 italic">Admin protected</span>
                                )}
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Printable Payslip Modal */}
      {selectedPayslip && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border-2 border-emerald-900">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-lg font-['Outfit']">Official Employee Salary Payslip</h3>
                <p className="text-xs text-emerald-200">
                  {selectedPayslip.month} {selectedPayslip.year} • {selectedPayslip.payslipNo}
                </p>
              </div>
              <button
                onClick={() => setSelectedPayslip(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between">
                <div>
                  <span className="text-slate-500 block text-[10px]">Employee Name:</span>
                  <span className="font-bold text-slate-900 text-sm">{selectedPayslip.staffName}</span>
                  <span className="text-slate-600 block">{selectedPayslip.role}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block text-[10px]">Payment Date:</span>
                  <span className="font-mono font-bold text-slate-800">{selectedPayslip.paymentDate}</span>
                  <span className="text-emerald-700 font-bold block mt-1">STATUS: PAID</span>
                </div>
              </div>

              {/* Earnings & Deductions Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                {/* Earnings */}
                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <h4 className="font-bold text-emerald-900 border-b border-slate-200 pb-1">Earnings (GHS)</h4>
                  <div className="flex justify-between"><span>Basic Salary:</span><span className="font-bold">{selectedPayslip.basicSalary}</span></div>
                  <div className="flex justify-between"><span>Housing Allowance:</span><span>{selectedPayslip.allowances.housing}</span></div>
                  <div className="flex justify-between"><span>Transport Allowance:</span><span>{selectedPayslip.allowances.transport}</span></div>
                  <div className="flex justify-between"><span>Medical Allowance:</span><span>{selectedPayslip.allowances.medical}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-emerald-800">
                    <span>Gross Earnings:</span>
                    <span>
                      GHS{' '}
                      {(
                        selectedPayslip.basicSalary +
                        selectedPayslip.allowances.housing +
                        selectedPayslip.allowances.transport +
                        selectedPayslip.allowances.medical
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Deductions */}
                <div className="border border-slate-200 rounded-xl p-3 space-y-1.5">
                  <h4 className="font-bold text-red-900 border-b border-slate-200 pb-1">Deductions (GHS)</h4>
                  <div className="flex justify-between"><span>PAYE Income Tax:</span><span>{selectedPayslip.deductions.tax}</span></div>
                  <div className="flex justify-between"><span>SSNIT Pension (5.5%):</span><span>{selectedPayslip.deductions.pension}</span></div>
                  <div className="flex justify-between"><span>Staff Loan Deduction:</span><span>{selectedPayslip.deductions.loan}</span></div>
                  <div className="flex justify-between pt-1 border-t border-slate-200 font-bold text-red-700">
                    <span>Total Deductions:</span>
                    <span>
                      GHS{' '}
                      {(
                        selectedPayslip.deductions.tax +
                        selectedPayslip.deductions.pension +
                        selectedPayslip.deductions.loan
                      ).toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>

              {/* Net Pay Highlight Banner */}
              <div className="bg-emerald-950 text-white p-4 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-300">Net Take-Home Pay</span>
                  <p className="text-xs text-emerald-200">Credited to Employee Bank Account</p>
                </div>
                <div className="text-2xl font-black font-['Outfit'] text-amber-400">
                  GHS {selectedPayslip.netSalary.toLocaleString()}
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-4 h-4" /> Print Payslip
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Claim Reimbursement Modal */}
      {isReimbModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit']">Submit Expense Reimbursement</h3>
              <button onClick={() => setIsReimbModalOpen(false)} className="text-white">✕</button>
            </div>
            <form onSubmit={handleClaimReimb} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Staff Member</label>
                <select
                  value={reimbForm.staffId}
                  onChange={(e) => setReimbForm({ ...reimbForm, staffId: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  {staff.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.designation})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
                <select
                  value={reimbForm.category}
                  onChange={(e) => setReimbForm({ ...reimbForm, category: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                >
                  <option value="Classroom Supplies & Books">Classroom Supplies & Books</option>
                  <option value="Science Lab Consumables">Science Lab Consumables</option>
                  <option value="Transport & Fuel Allowance">Transport & Fuel Allowance</option>
                  <option value="Sports Equipment">Sports Equipment</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Claim Amount (GHS) *</label>
                <input
                  type="number"
                  required
                  value={reimbForm.amount}
                  onChange={(e) => setReimbForm({ ...reimbForm, amount: Number(e.target.value) })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Purpose / Description *</label>
                <textarea
                  required
                  rows={3}
                  value={reimbForm.description}
                  onChange={(e) => setReimbForm({ ...reimbForm, description: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  placeholder="Detail the expense incurred on behalf of the school..."
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsReimbModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 text-slate-800 font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm"
                >
                  Submit Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reset Reimbursements Modal (Admin and Accountant Access) */}
      {isResetModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            {/* Modal Header */}
            <div className="bg-gradient-to-r from-rose-900 via-rose-800 to-rose-950 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center text-amber-300">
                  <RotateCcw className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-base sm:text-lg font-['Outfit'] text-white">
                    Reset Expense & Supply Reimbursements
                  </h3>
                  <p className="text-xs text-rose-200">Admin & Accountant Financial Authority</p>
                </div>
              </div>
              <button
                onClick={() => setIsResetModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 space-y-4">
              {/* Operator Badge */}
              <div className="bg-rose-50/70 border border-rose-200/80 rounded-xl p-3 text-xs text-rose-950 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-rose-700 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block">Authorized Session Verification</span>
                  <span className="text-rose-800 text-[11px] block mt-0.5">
                    Operator: <strong className="font-bold">{currentUser?.name || 'Administrator'}</strong> • Role:{' '}
                    <strong className="font-bold">{currentUser?.role || activeRole}</strong>
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-700">
                  Select how you would like to reset the expense & supply reimbursement ledger:
                </p>

                {/* Option 1: Reopen / Reset Statuses to Pending */}
                <label
                  onClick={() => setResetMode('reset-to-pending')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    resetMode === 'reset-to-pending'
                      ? 'border-amber-600 bg-amber-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reimbResetMode"
                    checked={resetMode === 'reset-to-pending'}
                    onChange={() => setResetMode('reset-to-pending')}
                    className="mt-0.5 accent-amber-600"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs">
                      1. Reset All Decisions to "Pending" ({reimbursements.length} claims)
                    </strong>
                    <span className="text-[11px] text-slate-600 block mt-1 leading-relaxed">
                      Preserves all submitted reimbursement claims and vendor receipts, but resets their statuses (Approved / Rejected) back to <strong>Pending</strong> review so you can re-audit and re-process them.
                    </span>
                  </div>
                </label>

                {/* Option 2: Clear & Wipe All Claims */}
                <label
                  onClick={() => setResetMode('clear-all')}
                  className={`flex items-start gap-3 p-3.5 rounded-xl border cursor-pointer transition-all ${
                    resetMode === 'clear-all'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="reimbResetMode"
                    checked={resetMode === 'clear-all'}
                    onChange={() => setResetMode('clear-all')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold text-xs">
                      2. Wipe & Purge All Reimbursement Records (Reset to GHS 0.00)
                    </strong>
                    <span className="text-[11px] text-slate-600 block mt-1 leading-relaxed">
                      Permanently wipes all reimbursement entries from the local database and Firestore cloud records. Clears all expense totals to zero.
                    </span>
                  </div>
                </label>
              </div>

              {/* Confirmation input for permanent wipe */}
              {resetMode === 'clear-all' && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl space-y-2">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-red-800">
                    <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                    <span>Permanent Clearance Verification</span>
                  </div>
                  <p className="text-[11px] text-red-700">
                    To prevent accidental ledger deletion, please type <strong className="font-black">RESET</strong> in capital letters below:
                  </p>
                  <input
                    type="text"
                    value={confirmText}
                    onChange={(e) => setConfirmText(e.target.value)}
                    placeholder="Type RESET to confirm"
                    className="w-full bg-white border border-red-300 rounded-lg px-3 py-1.5 text-xs font-mono font-bold text-red-900 outline-hidden focus:ring-2 focus:ring-red-600"
                  />
                </div>
              )}

              {/* Actions */}
              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  onClick={() => setIsResetModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleExecuteResetAll}
                  disabled={resetMode === 'clear-all' && confirmText.trim().toUpperCase() !== 'RESET'}
                  className={`px-5 py-2 font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                    resetMode === 'clear-all'
                      ? confirmText.trim().toUpperCase() === 'RESET'
                        ? 'bg-rose-700 hover:bg-rose-800 text-white'
                        : 'bg-rose-200 text-rose-400 cursor-not-allowed'
                      : 'bg-amber-600 hover:bg-amber-700 text-white'
                  }`}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  {resetMode === 'clear-all' ? 'Confirm & Wipe Records' : 'Reset All to Pending'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Single Claim Confirmation Modal */}
      {claimToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl p-5 border border-slate-200 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm sm:text-base font-['Outfit']">
                  Delete Reimbursement Claim
                </h3>
                <p className="text-xs text-slate-500">Authorized Admin & Accountant Action</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete this reimbursement claim?
            </p>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs space-y-1">
              <div className="flex justify-between">
                <span className="text-slate-500">Staff Member:</span>
                <strong className="text-slate-900 font-bold">{claimToDelete.staffName}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Category:</span>
                <span className="text-slate-700">{claimToDelete.category}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Amount:</span>
                <strong className="font-mono text-emerald-800 font-bold">
                  GHS {claimToDelete.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Status:</span>
                <span className="font-bold">{claimToDelete.status}</span>
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                onClick={() => setClaimToDelete(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => handleSingleClaimDelete(claimToDelete)}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Delete Claim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
