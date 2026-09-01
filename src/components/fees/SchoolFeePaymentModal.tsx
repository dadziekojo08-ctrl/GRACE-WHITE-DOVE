import React, { useState, useMemo } from 'react';
import {
  CreditCard,
  Search,
  CheckCircle2,
  Printer,
  X,
  User,
  Phone,
  Banknote,
  DollarSign,
  ArrowRight,
  ShieldCheck,
  Building,
  RotateCcw,
  Sparkles,
  Calendar
} from 'lucide-react';
import { useSchool } from '../../context/SchoolContext';
import { Student, Invoice, Payment } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';

interface SchoolFeePaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenPaystack?: (
    invoice?: Invoice,
    customAmount?: number,
    studentName?: string,
    studentId?: string
  ) => void;
}

export const SchoolFeePaymentModal: React.FC<SchoolFeePaymentModalProps> = ({
  isOpen,
  onClose,
  onOpenPaystack
}) => {
  const {
    students,
    invoices,
    classes,
    recordPayment,
    currentUser,
    academicYear,
    currentTerm
  } = useSchool();

  // Search & Filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  // Payment Form state
  const [paymentAmount, setPaymentAmount] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Cheque' | 'Paystack'>('Cash');
  const [momoProvider, setMomoProvider] = useState<'MTN MoMo' | 'Telecel Cash' | 'AT Money'>('MTN MoMo');
  const [referenceNote, setReferenceNote] = useState('');
  const [feeCategory, setFeeCategory] = useState<'Fees' | 'Books' | 'Accessories' | 'Arrears' | 'Combined' | 'Other'>('Fees');
  const [cashierName, setCashierName] = useState(currentUser?.name || 'Administrator');

  // Completed Payment / Receipt state
  const [completedPayment, setCompletedPayment] = useState<Payment | null>(null);
  const [previousBalance, setPreviousBalance] = useState<number>(0);
  const [newBalance, setNewBalance] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter students
  const filteredStudents = useMemo(() => {
    return students.filter((s) => {
      const matchesClass = selectedClassFilter === 'all' || s.className === selectedClassFilter;
      const term = searchTerm.toLowerCase().trim();
      if (!term) return matchesClass;
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const adm = (s.admissionNo || '').toLowerCase();
      const roll = (s.rollNo || '').toLowerCase();
      return matchesClass && (fullName.includes(term) || adm.includes(term) || roll.includes(term));
    });
  }, [students, searchTerm, selectedClassFilter]);

  // When a student is selected, pre-fill amount with balance or default 500
  const handleSelectStudent = (student: Student) => {
    setSelectedStudent(student);
    const balance = student.balanceDue > 0 ? student.balanceDue : 500;
    setPaymentAmount(balance.toString());
  };

  // Find active student invoice
  const activeStudentInvoice = useMemo(() => {
    if (!selectedStudent) return null;
    return invoices.find((inv) => inv.studentId === selectedStudent.id);
  }, [invoices, selectedStudent]);

  // Quick Preset Handlers
  const handleSetPreset = (type: 'full' | 'half' | 500 | 1000 | 2000) => {
    if (!selectedStudent) return;
    const bal = selectedStudent.balanceDue;
    if (type === 'full') {
      setPaymentAmount(Math.max(1, bal).toString());
    } else if (type === 'half') {
      setPaymentAmount(Math.max(1, Math.round(bal / 2)).toString());
    } else {
      setPaymentAmount(type.toString());
    }
  };

  // Process and record fee payment
  const handleRecordPaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;

    const amountNum = parseFloat(paymentAmount);
    if (!amountNum || amountNum <= 0) {
      alert('Please enter a valid payment amount.');
      return;
    }

    // If Paystack is chosen, route through Paystack modal
    if (paymentMethod === 'Paystack') {
      onClose();
      if (onOpenPaystack) {
        onOpenPaystack(
          activeStudentInvoice || undefined,
          amountNum,
          `${selectedStudent.firstName} ${selectedStudent.lastName}`,
          selectedStudent.id
        );
      }
      return;
    }

    setIsSubmitting(true);
    const prevBal = selectedStudent.balanceDue;
    const nextBal = Math.max(0, prevBal - amountNum);
    setPreviousBalance(prevBal);
    setNewBalance(nextBal);

    const channelDesc = paymentMethod === 'Mobile Money' ? momoProvider : paymentMethod;
    const invId = activeStudentInvoice?.id || `inv-${selectedStudent.id}`;

    let itemizedBreakdown: { fees?: number; books?: number; accessories?: number; arrears?: number } | undefined = undefined;
    if (feeCategory === 'Arrears') {
      itemizedBreakdown = { fees: 0, books: 0, accessories: 0, arrears: amountNum };
    } else if (feeCategory === 'Fees') {
      itemizedBreakdown = { fees: amountNum, books: 0, accessories: 0, arrears: 0 };
    } else if (feeCategory === 'Books') {
      itemizedBreakdown = { fees: 0, books: amountNum, accessories: 0, arrears: 0 };
    } else if (feeCategory === 'Accessories') {
      itemizedBreakdown = { fees: 0, books: 0, accessories: amountNum, arrears: 0 };
    }

    const newPayment = recordPayment({
      invoiceId: invId,
      studentId: selectedStudent.id,
      studentName: `${selectedStudent.firstName} ${selectedStudent.lastName}`,
      amount: amountNum,
      paymentMethod: paymentMethod,
      channel: channelDesc,
      status: 'Success',
      receivedBy: cashierName,
      remarks: referenceNote.trim() || `${feeCategory === 'Arrears' ? 'Arrears payment' : 'School fees payment'} received via ${channelDesc} for ${academicYear} ${currentTerm}`,
      feeCategory: feeCategory,
      breakdown: itemizedBreakdown
    });

    setIsSubmitting(false);
    setCompletedPayment(newPayment);
  };

  // Reset to pay another student
  const handleResetForAnother = () => {
    setCompletedPayment(null);
    setSelectedStudent(null);
    setPaymentAmount('');
    setReferenceNote('');
    setSearchTerm('');
  };

  const handlePrintReceipt = () => {
    window.print();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-950 via-emerald-900 to-emerald-800 p-5 text-white flex items-center justify-between border-b border-amber-400/30">
          <div className="flex items-center gap-3.5">
            <SchoolLogo
              alt="Grace White Dove"
              className="w-11 h-11 rounded-xl object-contain bg-white p-1 shadow-inner shrink-0 border border-amber-300"
            />
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base sm:text-lg text-white font-['Outfit']">
                  School Fees Payment Desk
                </h3>
                <span className="bg-amber-400 text-emerald-950 font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full">
                  Admin Portal
                </span>
              </div>
              <p className="text-xs text-emerald-200/90 mt-0.5">
                Grace White Dove School Complex • Official Student Billing & Receipts
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Close modal"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-5 sm:p-6 max-h-[82vh] overflow-y-auto">
          {!completedPayment ? (
            <div className="space-y-5">
              {/* Step 1: Select Student */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <User className="w-4 h-4 text-emerald-700" />
                    1. Select Student for School Fees Payment
                  </label>
                  {selectedStudent && (
                    <button
                      type="button"
                      onClick={() => setSelectedStudent(null)}
                      className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                      Change Pupil
                    </button>
                  )}
                </div>

                {!selectedStudent ? (
                  <div className="space-y-3">
                    {/* Search and Class Filter row */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <div className="sm:col-span-2 relative">
                        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="text"
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          placeholder="Search student by name, roll # or admission no..."
                          className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-none"
                        />
                      </div>
                      <div>
                        <select
                          value={selectedClassFilter}
                          onChange={(e) => setSelectedClassFilter(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-none bg-white font-medium"
                        >
                          <option value="all">All Classes ({classes.length})</option>
                          {classes.map((cls) => (
                            <option key={cls.id} value={cls.name}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {/* Students List Selection */}
                    <div className="border border-slate-200 rounded-xl max-h-48 overflow-y-auto divide-y divide-slate-100 bg-slate-50/50">
                      {filteredStudents.length > 0 ? (
                        filteredStudents.map((std) => (
                          <div
                            key={std.id}
                            onClick={() => handleSelectStudent(std)}
                            className="p-2.5 flex items-center justify-between hover:bg-emerald-50/80 cursor-pointer transition-colors group"
                          >
                            <div className="flex items-center gap-3">
                              <img
                                src={std.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(std.firstName + std.lastName)}`}
                                alt=""
                                className="w-8 h-8 rounded-full object-cover border border-slate-200"
                              />
                              <div>
                                <h4 className="text-xs font-bold text-slate-900 group-hover:text-emerald-900">
                                  {std.firstName} {std.lastName}
                                </h4>
                                <p className="text-[10px] text-slate-500 font-mono">
                                  Roll #{std.rollNo} • {std.admissionNo} • {std.className}
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="text-[11px] font-extrabold text-slate-900 block font-mono">
                                GHS {std.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </span>
                              <span className={`text-[9px] font-bold px-1.5 py-0.2 rounded ${std.balanceDue === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-900'}`}>
                                {std.balanceDue === 0 ? 'Cleared' : 'Due'}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No students matching &quot;{searchTerm}&quot;
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  /* Selected Student Active Card */
                  <div className="bg-gradient-to-br from-emerald-50 to-white p-4 rounded-xl border border-emerald-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={selectedStudent.photoUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(selectedStudent.firstName + selectedStudent.lastName)}`}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border-2 border-emerald-300 shadow-2xs shrink-0"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-extrabold text-emerald-950 font-['Outfit']">
                            {selectedStudent.firstName} {selectedStudent.lastName}
                          </h4>
                          <span className="bg-emerald-800 text-white text-[9px] font-bold px-2 py-0.5 rounded-full">
                            Roll #{selectedStudent.rollNo}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 font-medium mt-0.5">
                          {selectedStudent.className} (Sec {selectedStudent.section}) • Adm: {selectedStudent.admissionNo}
                        </p>
                        <p className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-1">
                          <Phone className="w-3 h-3 text-emerald-700" />
                          {selectedStudent.guardianName} ({selectedStudent.guardianPhone})
                        </p>
                      </div>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-emerald-200 text-right shrink-0">
                      <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Balance Due</span>
                      <div className="text-base sm:text-lg font-black text-emerald-900 font-['Outfit']">
                        GHS {selectedStudent.balanceDue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[10px] text-amber-700 font-semibold">
                        Arrears: GHS {(selectedStudent.manualArrears || 0).toLocaleString()}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Step 2: Payment Amount & Configuration */}
              {selectedStudent && (
                <form onSubmit={handleRecordPaymentSubmit} className="space-y-4 pt-3 border-t border-slate-100">
                  <div>
                    <label className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-2">
                      <Banknote className="w-4 h-4 text-emerald-700" />
                      2. Payment Amount (GHS)
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-emerald-800">
                        GHS
                      </span>
                      <input
                        type="number"
                        step="any"
                        min="1"
                        required
                        value={paymentAmount}
                        onChange={(e) => setPaymentAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full pl-14 pr-4 py-2.5 text-base font-extrabold text-slate-900 border-2 border-emerald-300 rounded-xl focus:border-emerald-600 focus:ring-2 focus:ring-emerald-600 outline-none"
                      />
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 mt-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase mr-1">Quick Fill:</span>
                      <button
                        type="button"
                        onClick={() => handleSetPreset('full')}
                        className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-lg text-xs font-bold transition-colors cursor-pointer"
                      >
                        Full Balance (GHS {selectedStudent.balanceDue.toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPreset('half')}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        50% (GHS {Math.round(selectedStudent.balanceDue / 2).toLocaleString()})
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPreset(500)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        GHS 500
                      </button>
                      <button
                        type="button"
                        onClick={() => handleSetPreset(1000)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
                      >
                        GHS 1,000
                      </button>
                    </div>
                  </div>

                  {/* Fee Category & Payment Method */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Fee Item / Billing Category
                      </label>
                      <select
                        value={feeCategory}
                        onChange={(e) => setFeeCategory(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-none bg-white font-semibold"
                      >
                        <option value="Fees">Tuition & Term School Fees</option>
                        <option value="Books">Textbooks & Stationery</option>
                        <option value="Accessories">Uniform, Badge & Accessories</option>
                        <option value="Arrears">Arrears / Previous Debt Balance</option>
                        <option value="Combined">Combined All-Inclusive Fees</option>
                        <option value="Other">Other Miscellaneous Levies</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        Payment Channel / Method
                      </label>
                      <select
                        value={paymentMethod}
                        onChange={(e) => setPaymentMethod(e.target.value as any)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 outline-none bg-white font-semibold"
                      >
                        <option value="Cash">Cash Desk (Direct In-Person)</option>
                        <option value="Mobile Money">Mobile Money (MTN / Telecel / AT)</option>
                        <option value="Paystack">Paystack Online Checkout (Card / MoMo)</option>
                        <option value="Bank Transfer">Bank Deposit / Transfer (GCB / Ecobank)</option>
                        <option value="Cheque">Banker&apos;s Cheque / Draft</option>
                      </select>
                    </div>
                  </div>

                  {/* MoMo Provider specifics */}
                  {paymentMethod === 'Mobile Money' && (
                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                      <label className="block text-xs font-bold text-amber-950 mb-1">
                        Mobile Money Network
                      </label>
                      <div className="flex gap-2">
                        {(['MTN MoMo', 'Telecel Cash', 'AT Money'] as const).map((prov) => (
                          <button
                            key={prov}
                            type="button"
                            onClick={() => setMomoProvider(prov)}
                            className={`flex-1 py-1.5 px-2 rounded-lg text-xs font-bold border transition-all cursor-pointer ${
                              momoProvider === prov
                                ? 'bg-amber-400 text-emerald-950 border-amber-500 shadow-2xs'
                                : 'bg-white text-slate-700 border-slate-200'
                            }`}
                          >
                            {prov}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Cashier & Remarks */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cashier / Received By
                      </label>
                      <input
                        type="text"
                        value={cashierName}
                        onChange={(e) => setCashierName(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700"
                        placeholder="Staff / Cashier Name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Payment Slip Ref / Audit Note
                      </label>
                      <input
                        type="text"
                        value={referenceNote}
                        onChange={(e) => setReferenceNote(e.target.value)}
                        className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl outline-none focus:ring-2 focus:ring-emerald-700"
                        placeholder="e.g. Paid at admin office / MoMo Txn ID"
                      />
                    </div>
                  </div>

                  {/* Submit Action Buttons */}
                  <div className="flex items-center justify-between pt-3 border-t border-slate-100 flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={onClose}
                      className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs rounded-xl transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>

                    {paymentMethod === 'Paystack' ? (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-sky-600 hover:bg-sky-700 text-white font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all cursor-pointer"
                      >
                        <CreditCard className="w-4 h-4" />
                        Launch Paystack Online Checkout
                      </button>
                    ) : (
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="px-6 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-md hover:shadow-lg transition-all cursor-pointer"
                      >
                        <ShieldCheck className="w-4 h-4 text-emerald-950" />
                        Confirm & Record Fee Payment
                      </button>
                    )}
                  </div>
                </form>
              )}
            </div>
          ) : (
            /* Step 3: Official Printable Receipt Voucher */
            <div className="space-y-5 animate-in fade-in zoom-in-95 duration-200">
              {/* Success Banner */}
              <div className="bg-emerald-50 border border-emerald-300 p-4 rounded-xl flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center shrink-0 shadow-sm">
                    <CheckCircle2 className="w-6 h-6 text-amber-300" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-sm text-emerald-950">
                      Fee Payment Successfully Recorded!
                    </h4>
                    <p className="text-xs text-emerald-800">
                      Official transaction reference: <strong className="font-mono">{completedPayment.paymentRef}</strong>
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-emerald-900 bg-emerald-200/80 px-2.5 py-1 rounded-full">
                  Verified & Saved
                </span>
              </div>

              {/* Official Printable Receipt Document */}
              <div
                id="printable-fee-receipt"
                className="bg-white border-2 border-emerald-900 rounded-2xl p-6 shadow-sm space-y-4 text-slate-800"
              >
                {/* Receipt Header */}
                <div className="flex items-center justify-between border-b-2 border-emerald-900 pb-4">
                  <div className="flex items-center gap-3">
                    <SchoolLogo
                      alt="Grace White Dove"
                      className="w-14 h-14 rounded-xl object-contain bg-white p-1 border border-slate-200 shrink-0"
                    />
                    <div>
                      <h2 className="text-base sm:text-lg font-black text-emerald-950 font-['Outfit'] uppercase tracking-tight">
                        Grace White Dove School Complex
                      </h2>
                      <p className="text-[11px] font-semibold text-slate-600">
                        Cape Coast, Central Region, Ghana • Tel: +233 (0) 24 100 0000
                      </p>
                      <p className="text-[10px] text-amber-700 font-bold uppercase tracking-wider">
                        Official School Fees Payment Voucher
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                      Receipt No.
                    </span>
                    <span className="text-sm sm:text-base font-mono font-black text-emerald-900">
                      {completedPayment.paymentRef}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {completedPayment.date}
                    </span>
                  </div>
                </div>

                {/* Pupil & Transaction Meta */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-3 rounded-xl text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Student Name</span>
                    <strong className="text-slate-900">{completedPayment.studentName}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Class Level</span>
                    <strong className="text-slate-900">{selectedStudent?.className || 'Pupil'}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Academic Term</span>
                    <strong className="text-slate-900">{academicYear} ({currentTerm})</strong>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Payment Method</span>
                    <strong className="text-emerald-900 font-bold">{completedPayment.channel || completedPayment.paymentMethod}</strong>
                  </div>
                </div>

                {/* Financial Ledger Calculation */}
                <table className="w-full text-xs text-left border border-slate-200 rounded-xl overflow-hidden">
                  <thead className="bg-emerald-950 text-white font-bold">
                    <tr>
                      <th className="p-2.5">Item Description</th>
                      <th className="p-2.5">Category</th>
                      <th className="p-2.5 text-right">Amount Paid</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    <tr>
                      <td className="p-2.5 font-medium">
                        School Fees Settlement ({academicYear} {currentTerm})
                        <div className="text-[10px] text-slate-500">{completedPayment.remarks}</div>
                      </td>
                      <td className="p-2.5 text-slate-600 font-semibold">{completedPayment.feeCategory || 'Fees'}</td>
                      <td className="p-2.5 text-right font-black text-slate-900 font-mono">
                        GHS {completedPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                  <tfoot className="bg-slate-50 font-bold border-t border-slate-200">
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right text-slate-600">
                        Prior Ledger Balance:
                      </td>
                      <td className="p-2.5 text-right text-slate-700 font-mono">
                        GHS {previousBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr className="bg-amber-50/60">
                      <td colSpan={2} className="p-2.5 text-right text-emerald-950 font-black">
                        Total Amount Received:
                      </td>
                      <td className="p-2.5 text-right text-emerald-900 font-black font-mono text-sm">
                        GHS {completedPayment.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                    <tr>
                      <td colSpan={2} className="p-2.5 text-right text-slate-600">
                        Outstanding Balance Remaining:
                      </td>
                      <td className="p-2.5 text-right font-mono font-black text-slate-900">
                        GHS {newBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                {/* Footer verification & Cashier sign */}
                <div className="pt-3 flex items-end justify-between border-t border-slate-200 text-xs">
                  <div>
                    <span className="text-[10px] text-slate-400 block uppercase font-bold">Received & Audited By:</span>
                    <span className="font-bold text-slate-800">{completedPayment.receivedBy || cashierName}</span>
                    <span className="text-[10px] text-emerald-700 block">Bursary Office • Grace White Dove</span>
                  </div>
                  <div className="text-right">
                    <div className="inline-block border-2 border-emerald-800 text-emerald-800 font-black text-[10px] uppercase px-3 py-1 rounded-md tracking-wider">
                      ★ OFFICIAL PAID STAMP ★
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons for Receipt */}
              <div className="flex items-center justify-between pt-2 flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleResetForAnother}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-emerald-800" />
                  Pay for Another Pupil
                </button>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handlePrintReceipt}
                    className="px-4 py-2.5 bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-amber-400" />
                    Print Official Receipt
                  </button>
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl shadow-sm transition-all cursor-pointer"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
