import React, { useRef } from 'react';
import {
  CheckCircle2,
  Printer,
  Download,
  X,
  Building,
  User,
  Phone,
  Calendar,
  CreditCard,
  Banknote,
  ShieldCheck,
  Award,
  Layers,
  FileCheck
} from 'lucide-react';
import { Payment, Student } from '../../types';
import { SchoolLogo } from '../common/SchoolLogo';
import { useSchool } from '../../context/SchoolContext';
import { downloadPaymentReceiptPdf } from '../../utils/receiptPdfGenerator';

interface OfficialPaymentReceiptModalProps {
  isOpen: boolean;
  onClose: () => void;
  payment: Payment | null;
  ward?: Student | null;
}

export const OfficialPaymentReceiptModal: React.FC<OfficialPaymentReceiptModalProps> = ({
  isOpen,
  onClose,
  payment,
  ward
}) => {
  const { students, academicYear, currentTerm } = useSchool();
  const printContainerRef = useRef<HTMLDivElement>(null);

  if (!isOpen || !payment) return null;

  // Resolve associated student
  const matchedStudent =
    ward ||
    students.find(
      (s) =>
        s.id === payment.studentId ||
        s.admissionNo === payment.studentId ||
        (payment.studentName &&
          `${s.firstName} ${s.lastName}`.toLowerCase().trim() === payment.studentName.toLowerCase().trim())
    );

  const studentName = payment.studentName || (matchedStudent ? `${matchedStudent.firstName} ${matchedStudent.lastName}` : 'Student');
  const admissionNo = payment.admissionNo || matchedStudent?.admissionNo || payment.studentId || 'N/A';
  const className = payment.className || matchedStudent?.className || 'N/A';
  const guardianName = matchedStudent?.guardianName || 'Parent / Guardian';
  const guardianPhone = matchedStudent?.guardianPhone || payment.payerPhone || 'N/A';

  // Financial values
  const amountPaid = Number(payment.amount) || 0;
  const prevBalance = typeof payment.previousBalance === 'number'
    ? payment.previousBalance
    : (matchedStudent ? matchedStudent.balanceDue + amountPaid : amountPaid);
  const remainingBalance = typeof payment.balanceAfterPayment === 'number'
    ? payment.balanceAfterPayment
    : Math.max(0, prevBalance - amountPaid);

  // Breakdown
  const breakdown = payment.breakdown || {
    fees: payment.feeCategory === 'Fees' ? amountPaid : 0,
    books: payment.feeCategory === 'Books' ? amountPaid : 0,
    accessories: payment.feeCategory === 'Accessories' ? amountPaid : 0,
    arrears: payment.feeCategory === 'Arrears' ? amountPaid : 0
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        id="printable-receipt-modal"
        className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-4 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Top Bar (Hidden during printing) */}
        <div className="print:hidden bg-emerald-950 text-white p-4 sm:p-5 flex items-center justify-between border-b border-emerald-800">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-amber-300 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="text-base font-bold font-['Outfit'] text-white">
                Official Payment Receipt
              </h3>
              <p className="text-[11px] text-emerald-200">
                Receipt #{payment.paymentRef || payment.receiptNo || payment.reference || payment.id}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadPaymentReceiptPdf({
                  payment,
                  student: matchedStudent,
                  academicYear,
                  term: currentTerm
                })
              }
              className="px-3 py-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 rounded-lg text-xs font-black flex items-center gap-1.5 cursor-pointer shadow-xs transition-all hover:scale-105"
              title="Download official PDF receipt file"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 bg-emerald-800 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* The Printable Official Receipt Document */}
        <div ref={printContainerRef} className="p-6 sm:p-7 space-y-5 text-xs text-slate-800 bg-white">
          {/* Institutional Crest & Header */}
          <div className="text-center pb-4 border-b-2 border-emerald-900 space-y-1.5">
            <SchoolLogo
              alt="Grace White Dove School Complex"
              className="w-14 h-14 rounded-2xl object-contain mx-auto bg-white p-1 border-2 border-amber-400 shadow-xs"
            />
            <div>
              <h2 className="text-base sm:text-lg font-black tracking-tight text-emerald-950 uppercase font-['Outfit']">
                Grace White Dove School Complex
              </h2>
              <p className="text-[10px] sm:text-[11px] font-bold text-amber-800 uppercase tracking-widest">
                Excellence in Knowledge & Character • Cape Coast, Central Region, Ghana
              </p>
              <p className="text-[10px] text-slate-500">
                Tel: +233 (0) 24 440 3541 • Email: gracewhitedoveschool@gmail.com
              </p>
            </div>

            <div className="inline-block mt-2 px-3.5 py-1 rounded-full bg-emerald-100 text-emerald-950 font-extrabold text-[11px] uppercase tracking-wider border border-emerald-200">
              Official Cashier Payment Voucher
            </div>
          </div>

          {/* Receipt Meta & Voucher Number */}
          <div className="grid grid-cols-2 gap-3 bg-slate-50 p-3.5 rounded-xl border border-slate-200">
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Receipt Reference:</span>
              <span className="font-mono font-extrabold text-emerald-950 text-xs sm:text-sm">
                {payment.paymentRef || payment.receiptNo || payment.reference || payment.id}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Transaction Date:</span>
              <span className="font-mono font-bold text-slate-800 text-xs">
                {payment.paymentDate || payment.date || new Date().toLocaleDateString()}
              </span>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Academic Period:</span>
              <span className="font-bold text-slate-700 text-xs">
                {academicYear} • {currentTerm}
              </span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-500 uppercase font-bold block">Payment Channel:</span>
              <span className="font-bold text-emerald-800 text-xs">
                {payment.channel || payment.paymentMethod}
              </span>
            </div>
          </div>

          {/* Student & Guardian Profile */}
          <div className="border border-slate-200 rounded-xl p-3.5 space-y-2 bg-white">
            <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
              Student & Payer Identification
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <span className="text-[10px] text-slate-500 block">Student Full Name:</span>
                <span className="font-extrabold text-slate-900 text-sm">{studentName}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Admission / Roll No:</span>
                <span className="font-mono font-bold text-slate-800">{admissionNo}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Class / Department:</span>
                <span className="font-bold text-slate-800">{className}</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-500 block">Guardian / Payer:</span>
                <span className="font-semibold text-slate-700">{guardianName} ({guardianPhone})</span>
              </div>
            </div>
          </div>

          {/* Itemized Payment Category Allocation */}
          <div className="border border-slate-200 rounded-xl overflow-hidden">
            <div className="bg-emerald-900 text-white px-3.5 py-2 text-[10px] uppercase tracking-wider font-extrabold flex justify-between">
              <span>Billing Allocation Category</span>
              <span>Amount Credited</span>
            </div>
            <div className="divide-y divide-slate-100 p-1">
              {(breakdown.fees || 0) > 0 && (
                <div className="px-3 py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="font-semibold text-slate-800">Tuition & Term School Fees</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    GHS {(breakdown.fees || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {(breakdown.books || 0) > 0 && (
                <div className="px-3 py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-sky-600"></span>
                    <span className="font-semibold text-slate-800">Textbooks & Stationery</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    GHS {(breakdown.books || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {(breakdown.accessories || 0) > 0 && (
                <div className="px-3 py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span className="font-semibold text-slate-800">Uniform & Accessories</span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    GHS {(breakdown.accessories || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {(breakdown.arrears || 0) > 0 && (
                <div className="px-3 py-2 flex justify-between items-center text-xs bg-amber-50/50">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-amber-600"></span>
                    <span className="font-semibold text-amber-900">Arrears / Previous Term Debt</span>
                  </div>
                  <span className="font-mono font-bold text-amber-950">
                    GHS {(breakdown.arrears || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}

              {/* If no specific breakdown recorded, show category row */}
              {!breakdown.fees && !breakdown.books && !breakdown.accessories && !breakdown.arrears && (
                <div className="px-3 py-2 flex justify-between items-center text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span className="font-semibold text-slate-800">
                      {payment.feeCategory === 'Arrears' ? 'Arrears / Debt Payment' :
                       payment.feeCategory === 'Books' ? 'Textbooks & Stationery' :
                       payment.feeCategory === 'Accessories' ? 'Uniform & Accessories' :
                       'School Fees Payment'}
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-900">
                    GHS {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Financial Summary & Balance Reconciliation Box */}
          <div className="bg-gradient-to-br from-emerald-50 via-white to-amber-50/40 p-4 rounded-xl border border-emerald-300 space-y-2.5">
            <div className="flex justify-between text-xs text-slate-600">
              <span>Previous Balance Due:</span>
              <span className="font-mono font-semibold text-slate-700">
                GHS {prevBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-baseline border-t border-b border-emerald-200 py-2">
              <span className="text-sm font-black text-emerald-950 uppercase">
                Total Amount Received:
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-800 font-mono">
                GHS {amountPaid.toLocaleString(undefined, { minimumFractionDigits: 2 })}
              </span>
            </div>

            <div className="flex justify-between items-center text-xs pt-0.5">
              <span className="font-bold text-slate-700">Remaining Balance Due:</span>
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-slate-900 text-sm">
                  GHS {remainingBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
                <span
                  className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full ${
                    remainingBalance === 0
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-amber-100 text-amber-900'
                  }`}
                >
                  {remainingBalance === 0 ? 'Fully Cleared' : 'Balance Pending'}
                </span>
              </div>
            </div>
          </div>

          {/* Notes / Remarks if present */}
          {payment.remarks && (
            <div className="text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200 italic">
              <strong>Notes:</strong> {payment.remarks}
            </div>
          )}

          {/* Certification / Cashier Stamp */}
          <div className="pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] text-slate-500">
            <div>
              <p>
                <strong>Received By:</strong>{' '}
                <span className="text-slate-900 font-bold">{payment.receivedBy || 'Accounts & Bursar Office'}</span>
              </p>
              <p className="mt-0.5">Automated Electronic Ledger Verification</p>
            </div>

            <div className="border-2 border-dashed border-emerald-600 text-emerald-800 px-3 py-1.5 rounded-lg text-center font-bold tracking-wider uppercase text-[9px] bg-emerald-50">
              ✓ Grace White Dove Accounts Office Certified
            </div>
          </div>
        </div>

        {/* Footer Actions (Hidden on Print) */}
        <div className="print:hidden bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between gap-3">
          <p className="text-[11px] text-slate-500">
            Retain this certified digital receipt for all verification and clearance audits.
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() =>
                downloadPaymentReceiptPdf({
                  payment,
                  student: matchedStudent,
                  academicYear,
                  term: currentTerm
                })
              }
              className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Download PDF</span>
            </button>
            <button
              onClick={handlePrint}
              className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Official Receipt</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs rounded-xl transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
