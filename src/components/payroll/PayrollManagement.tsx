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
  CreditCard
} from 'lucide-react';

export const PayrollManagement: React.FC = () => {
  const {
    payrolls,
    generateMonthlyPayroll,
    markPayrollPaid,
    reimbursements,
    addReimbursement,
    updateReimbursementStatus,
    staff
  } = useSchool();

  const [activeTab, setActiveTab] = useState<'payroll' | 'reimbursements'>('payroll');
  const [selectedMonth, setSelectedMonth] = useState<string>('August');
  const [selectedYear, setSelectedYear] = useState<number>(2026);
  const [selectedPayslip, setSelectedPayslip] = useState<PayrollRecord | null>(null);
  const [isReimbModalOpen, setIsReimbModalOpen] = useState(false);

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
            Calculate gross allowances, PAYE income tax, SSNIT pension contributions, and issue salary payslips.
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

      {/* KPI Cards */}
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
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                  <th className="py-3 px-4">Staff Member</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4">Amount</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reimbursements.map((r) => (
                  <tr key={r.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-900">{r.staffName}</td>
                    <td className="py-3 px-4 font-semibold text-emerald-800">{r.category}</td>
                    <td className="py-3 px-4 text-slate-600 max-w-xs">{r.description}</td>
                    <td className="py-3 px-4 font-black font-mono text-emerald-800">
                      GHS {r.amount.toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-slate-400 font-mono">{r.dateSubmitted}</td>
                    <td className="py-3 px-4">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          r.status === 'Approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : r.status === 'Pending'
                            ? 'bg-amber-100 text-amber-900'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-right">
                      {r.status === 'Pending' && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => updateReimbursementStatus(r.id, 'Approved')}
                            className="px-2.5 py-1 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold rounded-lg text-[11px]"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => updateReimbursementStatus(r.id, 'Rejected')}
                            className="px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 font-bold rounded-lg text-[11px]"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
    </div>
  );
};
