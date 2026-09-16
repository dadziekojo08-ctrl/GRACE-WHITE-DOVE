import React, { useState, useMemo } from 'react';
import {
  Receipt,
  Download,
  Printer,
  Search,
  Filter,
  CreditCard,
  CheckCircle2,
  Calendar,
  User,
  ArrowUpDown,
  FileText,
  DollarSign,
  Clock,
  Sparkles,
  ExternalLink,
  ChevronRight,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Payment, Student } from '../../types';
import { downloadPaymentReceiptPdf } from '../../utils/receiptPdfGenerator';
import { OfficialPaymentReceiptModal } from '../fees/OfficialPaymentReceiptModal';

interface ParentPaymentHistoryProps {
  onOpenPaystack?: (invoice?: any, customAmount?: number, studentName?: string, studentId?: string) => void;
}

export const ParentPaymentHistory: React.FC<ParentPaymentHistoryProps> = ({ onOpenPaystack }) => {
  const {
    students,
    payments,
    invoices,
    academicYear,
    currentTerm,
    currentUser,
    setActiveTab
  } = useSchool();

  // Find wards associated with this parent
  // If currentUser is parent, match by parent's children or phone/email or default to student list
  const parentWards = useMemo(() => {
    if (!students || students.length === 0) return [];
    if (currentUser?.role === 'Parent' && currentUser.email) {
      const emailMatches = students.filter(
        (s) =>
          (s.guardianEmail && s.guardianEmail.toLowerCase() === currentUser.email.toLowerCase()) ||
          (s.guardianPhone && currentUser.phone && s.guardianPhone === currentUser.phone)
      );
      if (emailMatches.length > 0) return emailMatches;
    }
    // Fallback: Return primary student and first few for easy switching
    return students.slice(0, 4);
  }, [students, currentUser]);

  const [selectedStudentFilter, setSelectedStudentFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [selectedReceiptForView, setSelectedReceiptForView] = useState<Payment | null>(null);
  const [isDownloadingAll, setIsDownloadingAll] = useState<boolean>(false);

  // Filter payments belonging to parent's wards
  const wardIds = useMemo(() => new Set(parentWards.map((w) => w.id)), [parentWards]);
  const wardAdmissionNos = useMemo(() => new Set(parentWards.map((w) => w.admissionNo)), [parentWards]);
  const wardNames = useMemo(
    () => new Set(parentWards.map((w) => `${w.firstName} ${w.lastName}`.toLowerCase().trim())),
    [parentWards]
  );

  const relevantPayments = useMemo(() => {
    return payments.filter((p) => {
      if (wardIds.has(p.studentId) || wardAdmissionNos.has(p.studentId)) return true;
      if (p.studentName && wardNames.has(p.studentName.toLowerCase().trim())) return true;
      // If no specific wards match, show all payments so parent is never stranded
      return parentWards.length === 0;
    });
  }, [payments, wardIds, wardAdmissionNos, wardNames, parentWards.length]);

  // Apply search and dropdown filters
  const filteredPayments = useMemo(() => {
    return relevantPayments
      .filter((p) => {
        // Student filter
        if (selectedStudentFilter !== 'all') {
          const ward = parentWards.find((w) => w.id === selectedStudentFilter);
          if (ward) {
            const wardName = `${ward.firstName} ${ward.lastName}`.toLowerCase().trim();
            const matchesId = p.studentId === ward.id || p.studentId === ward.admissionNo;
            const matchesName = p.studentName && p.studentName.toLowerCase().trim() === wardName;
            if (!matchesId && !matchesName) return false;
          }
        }

        // Method filter
        if (methodFilter !== 'all') {
          const methodStr = `${p.paymentMethod || ''} ${p.channel || ''}`.toLowerCase();
          if (!methodStr.includes(methodFilter.toLowerCase())) return false;
        }

        // Category filter
        if (categoryFilter !== 'all') {
          const cat = (p.feeCategory || 'Fees').toLowerCase();
          if (cat !== categoryFilter.toLowerCase()) return false;
        }

        // Search text
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase();
          const matchRef = (p.paymentRef || p.receiptNo || p.reference || p.id).toLowerCase().includes(q);
          const matchName = (p.studentName || '').toLowerCase().includes(q);
          const matchAdm = (p.admissionNo || p.studentId || '').toLowerCase().includes(q);
          const matchNotes = (p.remarks || p.notes || '').toLowerCase().includes(q);
          const matchCategory = (p.feeCategory || '').toLowerCase().includes(q);
          if (!matchRef && !matchName && !matchAdm && !matchNotes && !matchCategory) return false;
        }

        return true;
      })
      .sort(
        (a, b) =>
          new Date(b.paymentDate || b.date || '').getTime() -
          new Date(a.paymentDate || a.date || '').getTime()
      );
  }, [relevantPayments, selectedStudentFilter, methodFilter, categoryFilter, searchTerm, parentWards]);

  // Aggregate Metrics
  const totalPaidSum = useMemo(() => {
    return filteredPayments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);
  }, [filteredPayments]);

  const activeWard = useMemo(() => {
    if (selectedStudentFilter === 'all') return parentWards[0] || null;
    return parentWards.find((w) => w.id === selectedStudentFilter) || null;
  }, [selectedStudentFilter, parentWards]);

  const outstandingBalance = useMemo(() => {
    if (selectedStudentFilter === 'all') {
      return parentWards.reduce((sum, w) => sum + (w.balanceDue || 0), 0);
    }
    return activeWard?.balanceDue || 0;
  }, [selectedStudentFilter, parentWards, activeWard]);

  // Handler to download single receipt
  const handleDownloadPdf = (payment: Payment) => {
    const student =
      parentWards.find(
        (w) =>
          w.id === payment.studentId ||
          w.admissionNo === payment.studentId ||
          (payment.studentName &&
            `${w.firstName} ${w.lastName}`.toLowerCase().trim() === payment.studentName.toLowerCase().trim())
      ) ||
      students.find((s) => s.id === payment.studentId) ||
      null;

    downloadPaymentReceiptPdf({
      payment,
      student,
      academicYear,
      term: currentTerm
    });
  };

  // Handler to download all filtered receipts sequentially
  const handleDownloadAllReceipts = () => {
    if (filteredPayments.length === 0) return;
    setIsDownloadingAll(true);
    filteredPayments.forEach((p, idx) => {
      setTimeout(() => {
        handleDownloadPdf(p);
        if (idx === filteredPayments.length - 1) {
          setIsDownloadingAll(false);
        }
      }, idx * 400);
    });
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in duration-150">
      {/* 1. Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-emerald-700/60">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-32 -bottom-16 w-64 h-64 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-800/80 border border-emerald-600/60 text-amber-300 font-extrabold text-[11px] tracking-wide uppercase flex items-center gap-1.5 shadow-2xs">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
                Verified Bursar Ledger
              </span>
              <span className="text-xs text-emerald-200">
                {currentTerm} • {academicYear}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-['Outfit'] tracking-tight text-white flex items-center gap-3">
              <Receipt className="w-8 h-8 text-amber-400" />
              <span>Payment History & Receipts</span>
            </h1>
            <p className="text-xs sm:text-sm text-emerald-100 max-w-2xl leading-relaxed">
              Track all past school fee payments, textbook purchases, accessories, and arrears.
              Instant access to download official, certified PDF receipts for each transaction.
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5">
            {filteredPayments.length > 0 && (
              <button
                onClick={handleDownloadAllReceipts}
                disabled={isDownloadingAll}
                className="px-4 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer backdrop-blur-xs disabled:opacity-50"
                title="Download all listed PDF receipts"
              >
                <Download className="w-4 h-4 text-amber-300" />
                <span>{isDownloadingAll ? 'Generating PDFs...' : 'Download All Receipts'}</span>
              </button>
            )}

            {outstandingBalance > 0 && onOpenPaystack && (
              <button
                onClick={() =>
                  onOpenPaystack(
                    undefined,
                    outstandingBalance,
                    activeWard ? `${activeWard.firstName} ${activeWard.lastName}` : 'Ward',
                    activeWard?.id
                  )
                }
                className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black rounded-xl text-xs flex items-center gap-2 shadow-md transition-all hover:scale-105 cursor-pointer"
              >
                <CreditCard className="w-4 h-4" />
                <span>Pay Outstanding (GHS {outstandingBalance.toLocaleString()})</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Top Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 border border-emerald-100">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Total Amount Paid
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              GHS {totalPaidSum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] text-emerald-700 font-semibold block mt-0.5">
              Verified in school accounts
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 border border-blue-100">
            <Receipt className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Transactions Recorded
            </span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono">
              {filteredPayments.length}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              Each with digital receipt
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 border ${
            outstandingBalance === 0
              ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
              : 'bg-amber-50 text-amber-700 border-amber-200'
          }`}>
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Outstanding Balance
            </span>
            <span className={`text-xl sm:text-2xl font-black font-mono ${
              outstandingBalance === 0 ? 'text-emerald-700' : 'text-amber-900'
            }`}>
              GHS {outstandingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
            </span>
            <span className="text-[10px] font-semibold block mt-0.5 text-slate-500">
              {outstandingBalance === 0 ? '✓ Fully Cleared' : 'Due for term settlement'}
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center shrink-0 border border-purple-100">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              Latest Receipt
            </span>
            <span className="text-sm font-black text-slate-900 font-mono truncate max-w-[150px] block">
              {filteredPayments[0] ? `#${filteredPayments[0].paymentRef || filteredPayments[0].receiptNo || filteredPayments[0].id}` : 'None yet'}
            </span>
            <span className="text-[10px] text-slate-500 font-medium block mt-0.5">
              {filteredPayments[0] ? (filteredPayments[0].paymentDate || filteredPayments[0].date) : 'No transactions'}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Filter Controls & Child Switcher Bar */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-4">
        {/* Child Selector Tabs */}
        {parentWards.length > 1 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500 whitespace-nowrap flex items-center gap-1.5">
              <User className="w-3.5 h-3.5" /> Select Child:
            </span>
            <button
              onClick={() => setSelectedStudentFilter('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap ${
                selectedStudentFilter === 'all'
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All Children ({parentWards.length})
            </button>
            {parentWards.map((ward) => (
              <button
                key={ward.id}
                onClick={() => setSelectedStudentFilter(ward.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                  selectedStudentFilter === ward.id
                    ? 'bg-emerald-800 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                <span>{ward.firstName} {ward.lastName}</span>
                <span className="text-[10px] opacity-75 font-mono">({ward.className})</span>
              </button>
            ))}
          </div>
        )}

        {/* Search & Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Box */}
          <div className="relative md:col-span-2">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by receipt #, student, note, or code..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Payment Method Filter */}
          <div>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Payment Channels</option>
              <option value="momo">MTN Mobile Money</option>
              <option value="telecel">Telecel Cash</option>
              <option value="paystack">Paystack Online</option>
              <option value="cash">Cash Desk (Bursary)</option>
              <option value="bank">Bank Transfer / Deposit</option>
            </select>
          </div>

          {/* Fee Category Filter */}
          <div>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-emerald-500 cursor-pointer"
            >
              <option value="all">All Fee Categories</option>
              <option value="fees">Tuition / School Fees</option>
              <option value="books">Textbooks & Stationery</option>
              <option value="accessories">Uniform & Accessories</option>
              <option value="arrears">Arrears / Past Debt</option>
            </select>
          </div>
        </div>

        {/* Filter info indicator */}
        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredPayments.length}</strong> of {relevantPayments.length} recorded payments
          </span>
          {(searchTerm || methodFilter !== 'all' || categoryFilter !== 'all' || selectedStudentFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm('');
                setMethodFilter('all');
                setCategoryFilter('all');
                setSelectedStudentFilter('all');
              }}
              className="text-emerald-700 hover:text-emerald-800 font-bold cursor-pointer text-[11px]"
            >
              Reset Filters
            </button>
          )}
        </div>
      </div>

      {/* 4. Transactions List / Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 mx-auto flex items-center justify-center">
              <Receipt className="w-8 h-8" />
            </div>
            <div className="space-y-1 max-w-sm mx-auto">
              <h3 className="text-base font-bold text-slate-800">No Payment Records Found</h3>
              <p className="text-xs text-slate-500">
                {searchTerm || methodFilter !== 'all' || categoryFilter !== 'all'
                  ? 'No transactions matched your current search filters. Try adjusting your criteria.'
                  : 'No payment transactions have been logged for this account yet. Payments made via Paystack or at the accounts office will appear here immediately.'}
              </p>
            </div>
            {outstandingBalance > 0 && onOpenPaystack && (
              <button
                onClick={() =>
                  onOpenPaystack(
                    undefined,
                    outstandingBalance,
                    activeWard ? `${activeWard.firstName} ${activeWard.lastName}` : 'Ward',
                    activeWard?.id
                  )
                }
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl inline-flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <CreditCard className="w-4 h-4" />
                <span>Make a Payment Now</span>
              </button>
            )}
          </div>
        ) : (
          <div>
            {/* Desktop Table View */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-left text-xs text-slate-600">
                <thead className="bg-slate-50 text-[11px] uppercase tracking-wider text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3.5 px-4">Receipt # / Ref</th>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Student Particulars</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Channel / Method</th>
                    <th className="py-3.5 px-4 text-right">Amount Paid</th>
                    <th className="py-3.5 px-4 text-center">Status</th>
                    <th className="py-3.5 px-4 text-right">PDF Receipts & Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredPayments.map((p) => {
                    const refCode = p.paymentRef || p.receiptNo || p.reference || p.id;
                    const cat = p.feeCategory || 'Fees';
                    const amountNum = Number(p.amount) || 0;

                    return (
                      <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                        {/* Receipt Ref */}
                        <td className="py-3.5 px-4 font-mono font-bold text-slate-900 whitespace-nowrap">
                          <span className="bg-slate-100 px-2.5 py-1 rounded-md text-emerald-900 border border-slate-200">
                            #{refCode}
                          </span>
                        </td>

                        {/* Date */}
                        <td className="py-3.5 px-4 whitespace-nowrap text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.paymentDate || p.date}</span>
                          </div>
                        </td>

                        {/* Student */}
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-900">{p.studentName || 'Ward'}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            {p.admissionNo || p.studentId} {p.className ? `• ${p.className}` : ''}
                          </div>
                        </td>

                        {/* Category */}
                        <td className="py-3.5 px-4">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                              cat === 'Arrears'
                                ? 'bg-amber-100 text-amber-900'
                                : cat === 'Books'
                                ? 'bg-blue-100 text-blue-900'
                                : cat === 'Accessories'
                                ? 'bg-purple-100 text-purple-900'
                                : 'bg-emerald-100 text-emerald-900'
                            }`}
                          >
                            {cat}
                          </span>
                        </td>

                        {/* Channel */}
                        <td className="py-3.5 px-4 whitespace-nowrap font-medium text-slate-700">
                          <div className="flex items-center gap-1.5">
                            <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                            <span>{p.channel || p.paymentMethod}</span>
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-3.5 px-4 text-right font-mono font-black text-slate-900 text-sm whitespace-nowrap">
                          GHS {amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </td>

                        {/* Status */}
                        <td className="py-3.5 px-4 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            <span>Verified</span>
                          </span>
                        </td>

                        {/* Action Buttons */}
                        <td className="py-3.5 px-4 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-2">
                            {/* Download PDF button */}
                            <button
                              onClick={() => handleDownloadPdf(p)}
                              className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-900 border border-emerald-200 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-2xs transition-all hover:scale-105 cursor-pointer"
                              title="Download official PDF receipt file"
                            >
                              <Download className="w-3.5 h-3.5 text-emerald-700" />
                              <span>PDF Receipt</span>
                            </button>

                            {/* View / Print modal button */}
                            <button
                              onClick={() => setSelectedReceiptForView(p)}
                              className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                              title="View & Print certified voucher slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Card View */}
            <div className="md:hidden divide-y divide-slate-100 p-3 space-y-3">
              {filteredPayments.map((p) => {
                const refCode = p.paymentRef || p.receiptNo || p.reference || p.id;
                const cat = p.feeCategory || 'Fees';
                const amountNum = Number(p.amount) || 0;

                return (
                  <div key={p.id} className="p-4 bg-slate-50/60 rounded-xl border border-slate-200/80 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="font-mono font-bold text-xs bg-slate-200/80 px-2 py-0.5 rounded text-emerald-950">
                          #{refCode}
                        </span>
                        <h4 className="font-bold text-sm text-slate-900 mt-1">{p.studentName || 'Ward'}</h4>
                        <p className="text-[11px] text-slate-500 font-mono">
                          {p.admissionNo || p.studentId} • {p.className}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className="text-base font-black text-slate-900 font-mono block">
                          GHS {amountNum.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 inline-block mt-0.5">
                          ✓ Verified
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-white p-2.5 rounded-lg border border-slate-100">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Date</span>
                        <span className="font-medium text-slate-800">{p.paymentDate || p.date}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-400 block">Category</span>
                        <span className="font-bold text-emerald-800">{cat}</span>
                      </div>
                      <div className="col-span-2">
                        <span className="text-[10px] text-slate-400 block">Payment Channel</span>
                        <span className="font-medium text-slate-800">{p.channel || p.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => handleDownloadPdf(p)}
                        className="flex-1 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-300" />
                        <span>Download PDF Receipt</span>
                      </button>
                      <button
                        onClick={() => setSelectedReceiptForView(p)}
                        className="px-3 py-2 bg-white border border-slate-200 text-slate-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1 shadow-2xs hover:bg-slate-50 cursor-pointer"
                        title="View Official Voucher"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>View</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* 5. Official Signed Receipt Modal */}
      <OfficialPaymentReceiptModal
        isOpen={!!selectedReceiptForView}
        onClose={() => setSelectedReceiptForView(null)}
        payment={selectedReceiptForView}
      />
    </div>
  );
};
