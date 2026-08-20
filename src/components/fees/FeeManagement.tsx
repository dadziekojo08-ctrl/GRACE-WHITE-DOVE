import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { FeeStructure, Invoice, Payment, Student } from '../../types';
import {
  CreditCard,
  Plus,
  Receipt,
  Search,
  Filter,
  CheckCircle,
  Clock,
  AlertCircle,
  AlertTriangle,
  Printer,
  DollarSign,
  X,
  Trash2,
  Download,
  FileText,
  Users,
  Building2,
  Smartphone,
  Banknote,
  Sparkles,
  TrendingUp,
  ShieldAlert,
  Layers,
  Send,
  Bell,
  Mail,
  Phone,
  MessageSquare,
  Save,
  Edit2
} from 'lucide-react';

interface FeeManagementProps {
  onOpenPaystack?: (invoice?: Invoice, customAmount?: number, studentName?: string, studentId?: string) => void;
}

export const FeeManagement: React.FC<FeeManagementProps> = ({ onOpenPaystack }) => {
  const {
    feeStructures,
    addFeeStructure,
    updateFeeStructure,
    deleteFeeStructure,
    invoices,
    createInvoice,
    createBulkInvoices,
    updateInvoice,
    deleteInvoice,
    payments,
    recordPayment,
    updatePayment,
    deletePayment,
    clearFinancialRecords,
    clearAllArrears,
    clearTotalCollected,
    students,
    academicYear,
    currentTerm,
    classes,
    currentUser,
    sendBroadcast,
    updateStudentArrears,
    setActiveTab: setGlobalActiveTab
  } = useSchool();

  // Active Main Tab
  const [activeTab, setActiveTab] = useState<'invoices' | 'structures' | 'payments' | 'summary'>('invoices');

  // Search and Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Paid' | 'Partial' | 'Unpaid' | 'Overdue'>('All');
  const [classFilter, setClassFilter] = useState<string>('All');

  // Modal Visibility States
  const [isBillStudentOpen, setIsBillStudentOpen] = useState(false);
  const [isProcessFeeOpen, setIsProcessFeeOpen] = useState(false);
  const [isClearReportOpen, setIsClearReportOpen] = useState(false);
  const [clearMode, setClearMode] = useState<'all' | 'arrears-only' | 'payments-only'>('arrears-only');
  const [isExportPdfOpen, setIsExportPdfOpen] = useState(false);
  const [isNewStructureOpen, setIsNewStructureOpen] = useState(false);
  const [isManualArrearsModalOpen, setIsManualArrearsModalOpen] = useState(false);

  // Edit Modals State
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);
  const [isEditInvoiceOpen, setIsEditInvoiceOpen] = useState(false);
  const [editInvoiceForm, setEditInvoiceForm] = useState({
    termFees: 0,
    books: 0,
    accessories: 0,
    arrears: 0,
    dueDate: '',
    status: 'Unpaid' as 'Paid' | 'Partial' | 'Unpaid' | 'Overdue',
    paidAmount: 0
  });

  const [editingPayment, setEditingPayment] = useState<Payment | null>(null);
  const [isEditPaymentOpen, setIsEditPaymentOpen] = useState(false);
  const [editPaymentForm, setEditPaymentForm] = useState({
    amount: 0,
    paymentMethod: 'Cash' as Payment['paymentMethod'],
    payerPhone: '',
    remarks: '',
    receivedBy: '',
    date: ''
  });

  const [editingStructure, setEditingStructure] = useState<FeeStructure | null>(null);
  const [isEditStructureOpen, setIsEditStructureOpen] = useState(false);
  const [editStructForm, setEditStructForm] = useState({
    name: '',
    classLevel: '',
    termFees: 0,
    books: 0,
    accessories: 0,
    arrears: 0,
    dueDate: ''
  });

  // Manual Arrears Override State
  const [selectedStudentForArrears, setSelectedStudentForArrears] = useState<Student | null>(null);
  const [overrideArrearsAmount, setOverrideArrearsAmount] = useState<number | string>(0);
  const [overrideArrearsReason, setOverrideArrearsReason] = useState<string>('');

  const handleOpenArrearsOverride = (student: Student) => {
    setSelectedStudentForArrears(student);
    setOverrideArrearsAmount(student.manualArrears || 0);
    setOverrideArrearsReason('');
    setIsManualArrearsModalOpen(true);
  };

  // Edit Invoice Handlers
  const handleOpenEditInvoice = (inv: Invoice) => {
    setEditingInvoice(inv);
    setEditInvoiceForm({
      termFees: inv.termFees || (inv.items?.find(i => i.description.includes('Term'))?.amount) || 0,
      books: inv.books || (inv.items?.find(i => i.description.includes('Book'))?.amount) || 0,
      accessories: inv.accessories || (inv.items?.find(i => i.description.includes('Accessories'))?.amount) || 0,
      arrears: inv.arrears || (inv.items?.find(i => i.description.includes('Arrear'))?.amount) || 0,
      dueDate: inv.dueDate || '',
      status: inv.status as any,
      paidAmount: inv.paidAmount || 0
    });
    setIsEditInvoiceOpen(true);
  };

  const handleSaveEditInvoice = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingInvoice) return;

    const termFees = Number(editInvoiceForm.termFees) || 0;
    const books = Number(editInvoiceForm.books) || 0;
    const accessories = Number(editInvoiceForm.accessories) || 0;
    const arrears = Number(editInvoiceForm.arrears) || 0;
    const currentTermAmount = termFees + books + accessories;
    const totalAmount = currentTermAmount + arrears;
    const paidAmount = Number(editInvoiceForm.paidAmount) || 0;
    const balance = Math.max(0, totalAmount - paidAmount);
    const status = balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

    updateInvoice(editingInvoice.id, {
      termFees,
      books,
      accessories,
      arrears,
      currentTermAmount,
      totalAmount,
      paidAmount,
      balance,
      status,
      dueDate: editInvoiceForm.dueDate,
      items: [
        { description: 'Term Fees', amount: termFees },
        { description: 'Books (Text Books & Exercise Books)', amount: books },
        { description: 'Accessories', amount: accessories },
        { description: 'Arrears (Previous Term Outstanding)', amount: arrears }
      ].filter(i => i.amount > 0)
    });

    showToast(`Invoice ${editingInvoice.invoiceNo} successfully updated!`, 'success');
    setIsEditInvoiceOpen(false);
  };

  // Edit Payment Handlers
  const handleOpenEditPayment = (p: Payment) => {
    setEditingPayment(p);
    setEditPaymentForm({
      amount: p.amount,
      paymentMethod: p.paymentMethod,
      payerPhone: p.payerPhone || '',
      remarks: p.remarks || '',
      receivedBy: p.receivedBy || currentUser?.name || 'School Bursar',
      date: p.date || new Date().toISOString().split('T')[0]
    });
    setIsEditPaymentOpen(true);
  };

  const handleSaveEditPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingPayment) return;

    updatePayment(editingPayment.id, {
      amount: Number(editPaymentForm.amount) || 0,
      paymentMethod: editPaymentForm.paymentMethod,
      payerPhone: editPaymentForm.payerPhone,
      remarks: editPaymentForm.remarks,
      receivedBy: editPaymentForm.receivedBy,
      date: editPaymentForm.date
    });

    showToast(`Payment receipt ${editingPayment.reference} updated successfully!`, 'success');
    setIsEditPaymentOpen(false);
  };

  // Edit Structure Handlers
  const handleOpenEditStructure = (s: FeeStructure) => {
    setEditingStructure(s);
    setEditStructForm({
      name: s.name,
      classLevel: s.classLevel || s.className || '',
      termFees: s.breakdown?.termFees ?? s.termFees ?? s.tuitionFee ?? 0,
      books: s.breakdown?.books ?? s.books ?? s.libraryFee ?? 0,
      accessories: s.breakdown?.accessories ?? s.accessories ?? s.developmentLevy ?? 0,
      arrears: s.breakdown?.arrears ?? s.arrears ?? 0,
      dueDate: s.dueDate || '2026-09-30'
    });
    setIsEditStructureOpen(true);
  };

  const handleSaveEditStructure = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStructure) return;

    const termFees = Number(editStructForm.termFees) || 0;
    const books = Number(editStructForm.books) || 0;
    const accessories = Number(editStructForm.accessories) || 0;
    const arrears = Number(editStructForm.arrears) || 0;
    const totalAmount = termFees + books + accessories + arrears;

    updateFeeStructure(editingStructure.id, {
      name: editStructForm.name,
      classLevel: editStructForm.classLevel,
      termFees,
      books,
      accessories,
      arrears,
      breakdown: { termFees, books, accessories, arrears },
      totalAmount,
      dueDate: editStructForm.dueDate
    });

    showToast(`Fee structure "${editStructForm.name}" updated successfully!`, 'success');
    setIsEditStructureOpen(false);
  };

  const handleSaveArrearsOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentForArrears) return;

    const amount = Math.max(0, Number(overrideArrearsAmount) || 0);
    updateStudentArrears(
      selectedStudentForArrears.id,
      amount,
      overrideArrearsReason.trim() || 'Manual Arrears Override via Fee Portal'
    );
    showToast(
      `Set manual arrears for ${selectedStudentForArrears.firstName} ${selectedStudentForArrears.lastName} to GHS ${amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}`
    );
    setIsManualArrearsModalOpen(false);
  };

  // Send Reminder Modal State
  const [isSendReminderOpen, setIsSendReminderOpen] = useState(false);
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

  // Selected Detail Models
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedPaymentReceipt, setSelectedPaymentReceipt] = useState<Payment | null>(null);

  // Extract class names safely
  const classNames = useMemo(() => {
    return classes && classes.length > 0
      ? classes.map((c) => (typeof c === 'string' ? c : c.name))
      : ['Primary 1 (Grade 1)', 'Primary 2 (Grade 2)', 'Primary 3 (Grade 3)', 'Primary 4 (Grade 4)', 'Primary 5 (Grade 5)', 'Primary 6 (Grade 6)', 'JHS 1 (Grade 7)', 'JHS 2 (Grade 8)', 'JHS 3 (Grade 9)'];
  }, [classes]);

  // Toast / Feedback State
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const showToast = (text: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  // -------------------------------------------------------------
  // 1. BILL STUDENT FORM STATE & CATEGORIES
  // -------------------------------------------------------------
  type BillingCategoryPreset = 'full_combined' | 'term_fees' | 'books' | 'accessories' | 'arrears' | 'custom';

  const [billingMode, setBillingMode] = useState<'individual' | 'bulk'>('individual');
  const [billingPreset, setBillingPreset] = useState<BillingCategoryPreset>('full_combined');
  
  const [billForm, setBillForm] = useState({
    studentId: '',
    classLevel: classNames[0] || 'Primary 1 (Grade 1)',
    feeStructureId: feeStructures[0]?.id || '',
    dueDate: '2026-09-30',
    term: currentTerm || 'Term 1',
    academicYear: academicYear || '2025/2026',
    discountAmount: 0,
    customItems: [
      { description: 'Term Fees', amount: 1500 },
      { description: 'Books (Text Books & Exercise Books)', amount: 450 },
      { description: 'Accessories', amount: 250 },
      { description: 'Arrears (Previous Term Outstanding)', amount: 0 }
    ],
    notes: ''
  });

  // Calculate bill form sum
  const customItemsTotal = billForm.customItems.reduce((sum, item) => sum + (Number(item.amount) || 0), 0);
  const finalBillAmount = Math.max(0, customItemsTotal - (Number(billForm.discountAmount) || 0));

  // Quick Preset Applicator
  const applyBillingPreset = (preset: BillingCategoryPreset, targetStudentId?: string) => {
    setBillingPreset(preset);
    const targetId = targetStudentId !== undefined ? targetStudentId : billForm.studentId;
    const std = students.find(s => s.id === targetId);
    const arrearsVal = std ? (std.balanceDue || 0) : 0;

    if (preset === 'full_combined') {
      setBillForm(prev => ({
        ...prev,
        customItems: [
          { description: 'Term Fees', amount: 1500 },
          { description: 'Books (Text Books & Exercise Books)', amount: 450 },
          { description: 'Accessories', amount: 250 },
          ...(arrearsVal > 0 ? [{ description: 'Arrears (Previous Term Outstanding)', amount: arrearsVal }] : [{ description: 'Arrears (Previous Term Outstanding)', amount: 0 }])
        ]
      }));
    } else if (preset === 'term_fees') {
      setBillForm(prev => ({
        ...prev,
        customItems: [
          { description: 'Term Fees', amount: 1500 }
        ]
      }));
    } else if (preset === 'books') {
      setBillForm(prev => ({
        ...prev,
        customItems: [
          { description: 'Books (Text Books & Exercise Books)', amount: 450 }
        ]
      }));
    } else if (preset === 'accessories') {
      setBillForm(prev => ({
        ...prev,
        customItems: [
          { description: 'Accessories', amount: 250 }
        ]
      }));
    } else if (preset === 'arrears') {
      setBillForm(prev => ({
        ...prev,
        customItems: [
          { description: 'Arrears (Previous Term Outstanding)', amount: arrearsVal > 0 ? arrearsVal : 350 }
        ]
      }));
    } else if (preset === 'custom') {
      // Keep existing or initialize with default item
      if (billForm.customItems.length === 0) {
        setBillForm(prev => ({
          ...prev,
          customItems: [{ description: 'Custom Breakdown Fee Item', amount: 100 }]
        }));
      }
    }
  };

  const handleStudentSelectInBill = (studentId: string) => {
    const std = students.find(s => s.id === studentId);
    const arrears = std ? (std.balanceDue || 0) : 0;
    
    setBillForm(prev => {
      // If full combined preset is active, automatically update arrears amount
      if (billingPreset === 'full_combined') {
        return {
          ...prev,
          studentId,
          customItems: [
            { description: 'Term Fees', amount: 1500 },
            { description: 'Books (Text Books & Exercise Books)', amount: 450 },
            { description: 'Accessories', amount: 250 },
            { description: 'Arrears (Previous Term Outstanding)', amount: arrears }
          ]
        };
      }
      return { ...prev, studentId };
    });
  };

  const handleApplyFeeTemplate = (structureId: string) => {
    const struct = feeStructures.find(f => f.id === structureId);
    if (!struct) return;
    
    const items = [
      { description: 'Term Fees', amount: struct.breakdown?.termFees ?? struct.termFees ?? struct.tuitionFee ?? struct.tuition ?? 1500 },
      { description: 'Books (Text Books & Exercise Books)', amount: struct.breakdown?.books ?? struct.books ?? struct.breakdown?.libraryFee ?? 450 },
      { description: 'Accessories', amount: struct.breakdown?.accessories ?? struct.accessories ?? struct.breakdown?.developmentLevy ?? 250 },
      { description: 'Arrears (Previous Term Outstanding)', amount: struct.breakdown?.arrears ?? struct.arrears ?? 0 }
    ].filter(item => item.amount > 0);

    setBillForm(prev => ({
      ...prev,
      feeStructureId: structureId,
      customItems: items.length > 0 ? items : [{ description: 'Term Fees', amount: struct.totalAmount }]
    }));
  };

  const handleAddCustomItem = (categoryName?: string, defaultAmt?: number) => {
    setBillForm(prev => ({
      ...prev,
      customItems: [
        ...prev.customItems,
        { description: categoryName || 'Additional Fee Item', amount: defaultAmt ?? 100 }
      ]
    }));
  };

  const handleRemoveCustomItem = (index: number) => {
    setBillForm(prev => ({
      ...prev,
      customItems: prev.customItems.filter((_, idx) => idx !== index)
    }));
  };

  const handleBillStudentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (billingMode === 'individual') {
      const student = students.find(s => s.id === billForm.studentId);
      if (!student) {
        showToast('Please select a valid student to bill.', 'error');
        return;
      }

      createInvoice({
        studentId: student.id,
        studentName: `${student.firstName} ${student.lastName}`,
        className: student.className,
        term: billForm.term,
        academicYear: billForm.academicYear,
        dueDate: billForm.dueDate,
        items: billForm.customItems.map(i => ({ description: i.description, amount: Number(i.amount) || 0 })),
        totalAmount: finalBillAmount,
        paidAmount: 0,
        balance: finalBillAmount,
        status: 'Unpaid'
      });

      showToast(`Successfully generated invoice for ${student.firstName} ${student.lastName} (GHS ${finalBillAmount.toLocaleString()})`);
      setIsBillStudentOpen(false);
    } else {
      // Bulk class billing
      const classStudents = students.filter(s => s.className === billForm.classLevel);
      if (classStudents.length === 0) {
        showToast(`No enrolled students found in ${billForm.classLevel}.`, 'error');
        return;
      }

      const bulkInvoices = classStudents.map(std => ({
        studentId: std.id,
        studentName: `${std.firstName} ${std.lastName}`,
        className: std.className,
        term: billForm.term,
        academicYear: billForm.academicYear,
        dueDate: billForm.dueDate,
        items: billForm.customItems.map(i => ({ description: i.description, amount: Number(i.amount) || 0 })),
        totalAmount: finalBillAmount,
        paidAmount: 0,
        balance: finalBillAmount,
        status: 'Unpaid' as const
      }));

      createBulkInvoices(bulkInvoices);
      showToast(`Generated ${bulkInvoices.length} invoices for all students in ${billForm.classLevel}!`);
      setIsBillStudentOpen(false);
    }
  };

  // -------------------------------------------------------------
  // 2. PROCESS STUDENT FEES FORM STATE
  // -------------------------------------------------------------
  const [processFeeForm, setProcessFeeForm] = useState({
    studentId: '',
    invoiceId: '',
    amount: 500,
    paymentPurpose: 'Full Payment (All Fees Combined)',
    paymentMethod: 'Cash' as 'Cash' | 'Mobile Money' | 'Bank Transfer' | 'Cheque' | 'Paystack',
    channel: 'Cashier Desk',
    payerName: '',
    payerPhone: '',
    reference: `RCP-${Math.floor(100000 + Math.random() * 900000)}`,
    remarks: 'Full Payment (All Fees Combined)'
  });

  const selectedProcessStudent = useMemo(() => {
    return students.find(s => s.id === processFeeForm.studentId);
  }, [students, processFeeForm.studentId]);

  const studentOutstandingInvoices = useMemo(() => {
    if (!processFeeForm.studentId) return [];
    return invoices.filter(inv => inv.studentId === processFeeForm.studentId && inv.balance > 0);
  }, [invoices, processFeeForm.studentId]);

  const handleStudentSelectInProcess = (studentId: string) => {
    const std = students.find(s => s.id === studentId);
    const pendingInv = invoices.find(inv => inv.studentId === studentId && inv.balance > 0);
    const defaultAmount = pendingInv?.balance || std?.balanceDue || 500;
    
    setProcessFeeForm(prev => ({
      ...prev,
      studentId,
      invoiceId: pendingInv?.id || '',
      amount: defaultAmount,
      paymentPurpose: 'Full Payment (All Fees Combined)',
      remarks: `Full Payment (All Fees Combined) - ${currentTerm}`,
      payerName: std ? `${std.guardianName || `${std.firstName}'s Guardian`}` : '',
      payerPhone: std?.guardianPhone || ''
    }));
  };

  // Quick Fee Allocation handler for Process Student Fees
  const handleQuickAllocatePayment = (
    purposeLabel: string,
    allocatedAmount: number,
    remarksText: string
  ) => {
    setProcessFeeForm(prev => ({
      ...prev,
      paymentPurpose: purposeLabel,
      amount: Math.max(1, allocatedAmount),
      remarks: remarksText
    }));
  };

  const handleProcessFeeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProcessStudent) {
      showToast('Please select a student to process fees for.', 'error');
      return;
    }

    const payAmount = Number(processFeeForm.amount);
    if (payAmount <= 0) {
      showToast('Please enter a valid positive payment amount.', 'error');
      return;
    }

    const newPayment = recordPayment({
      invoiceId: processFeeForm.invoiceId || (studentOutstandingInvoices[0]?.id || `direct-${Date.now()}`),
      studentId: selectedProcessStudent.id,
      studentName: `${selectedProcessStudent.firstName} ${selectedProcessStudent.lastName}`,
      amount: payAmount,
      paymentMethod: 'Cash',
      channel: 'Cash Desk',
      payerPhone: processFeeForm.payerPhone,
      receivedBy: currentUser?.name || 'School Bursar',
      remarks: `${processFeeForm.paymentPurpose ? `[${processFeeForm.paymentPurpose}] ` : ''}${processFeeForm.remarks}`,
      status: 'Success'
    });

    showToast(`Payment of GHS ${payAmount.toLocaleString()} (${processFeeForm.paymentPurpose}) recorded for ${selectedProcessStudent.firstName}!`);
    setIsProcessFeeOpen(false);
    setSelectedPaymentReceipt(newPayment);
  };

  // -------------------------------------------------------------
  // 3. CLEAR FINANCIAL REPORT STATE
  // -------------------------------------------------------------
  const [clearConfirmText, setClearConfirmText] = useState('');

  const handleClearFinancialReportSubmit = () => {
    if (clearConfirmText.trim().toUpperCase() !== 'CONFIRM') {
      showToast('Please type CONFIRM to authorize clearing financial reports.', 'error');
      return;
    }

    if (clearMode === 'arrears-only') {
      clearAllArrears();
      showToast('All previous arrears have been successfully cleared to GHS 0.00 across all students!', 'success');
    } else if (clearMode === 'payments-only') {
      clearTotalCollected();
      showToast('Total collected figures and payment receipts cleared successfully!', 'success');
    } else {
      clearFinancialRecords('all');
      showToast('All financial records, invoices, and payment receipts have been reset cleanly.', 'info');
    }

    setIsClearReportOpen(false);
    setClearConfirmText('');
  };

  // -------------------------------------------------------------
  // 4. NEW FEE STRUCTURE FORM STATE (Aligned to new categories)
  // -------------------------------------------------------------
  const [structForm, setStructForm] = useState({
    name: '',
    classLevel: 'Primary 1 (Grade 1)',
    termFees: 1500,
    books: 450,
    accessories: 250,
    arrears: 0,
    dueDate: '2026-09-30'
  });

  const handleCreateStructure = (e: React.FormEvent) => {
    e.preventDefault();
    const total =
      Number(structForm.termFees) +
      Number(structForm.books) +
      Number(structForm.accessories) +
      Number(structForm.arrears);

    addFeeStructure({
      name: structForm.name,
      classLevel: structForm.classLevel,
      term: currentTerm || 'Term 1',
      academicYear: academicYear || '2025/2026',
      termFees: Number(structForm.termFees),
      books: Number(structForm.books),
      accessories: Number(structForm.accessories),
      arrears: Number(structForm.arrears),
      breakdown: {
        termFees: Number(structForm.termFees),
        books: Number(structForm.books),
        accessories: Number(structForm.accessories),
        arrears: Number(structForm.arrears)
      },
      totalAmount: total,
      dueDate: structForm.dueDate
    });

    showToast(`Fee structure "${structForm.name}" created successfully!`);
    setIsNewStructureOpen(false);
  };

  // -------------------------------------------------------------
  // 5. SEND REMINDER ACTION HANDLERS (Integrated with Communication Suite)
  // -------------------------------------------------------------
  const handleOpenReminderForInvoice = (inv: Invoice) => {
    const student = students.find(s => s.id === inv.studentId);
    const guardianName = student?.guardianName || `${inv.studentName}'s Parent/Guardian`;
    const guardianPhone = student?.guardianPhone || '0244123456';
    const guardianEmail = student?.guardianEmail || 'parent@educore.edu.gh';
    const studentName = inv.studentName;
    const balance = inv.balance > 0 ? inv.balance : (student?.balanceDue || 0);

    const defaultMsg = `Dear ${guardianName}, this is a gentle reminder from Grace White Dove School Complex regarding the outstanding fee balance of GHS ${balance.toLocaleString()} for your ward ${studentName} (${inv.className}) for ${inv.term || currentTerm}. Invoice #${inv.invoiceNo} is due on ${inv.dueDate}. Kindly make payments via Mobile Money, Bank Deposit, or Online Paystack portal. For inquiries, email gracewhitedoveschool@gmail.com or call 0244403541. Thank you.`;

    setReminderTarget({
      studentId: inv.studentId,
      studentName,
      guardianName,
      guardianPhone,
      guardianEmail,
      className: inv.className,
      balanceDue: balance,
      invoiceNo: inv.invoiceNo,
      dueDate: inv.dueDate
    });

    setReminderForm({
      channel: 'WhatsApp',
      recipient: guardianPhone,
      recipientName: guardianName,
      subject: `Fee Payment Reminder: ${studentName} - Grace White Dove School Complex`,
      message: defaultMsg
    });

    setIsSendReminderOpen(true);
  };

  const handleOpenBulkReminders = () => {
    const debtors = invoices.filter(inv => inv.balance > 0);
    if (debtors.length === 0) {
      showToast('No students with outstanding fee balances found.', 'info');
      return;
    }

    const firstDebtor = debtors[0];
    const student = students.find(s => s.id === firstDebtor.studentId);
    const guardianName = student?.guardianName || 'All Parents with Outstanding Balances';
    const guardianPhone = student?.guardianPhone || '0244123456';
    const guardianEmail = student?.guardianEmail || 'parents@educore.edu.gh';

    const defaultMsg = `Dear Parent/Guardian, this is a fee notice from Grace White Dove School Complex regarding the outstanding school fees for ${currentTerm} (${academicYear}). Kindly ensure all outstanding term fees, books, and accessories balances are cleared before the due date. For inquiries, contact gracewhitedoveschool@gmail.com or 0244403541. Thank you.`;

    setReminderTarget({
      studentId: 'bulk_all_debtors',
      studentName: `${debtors.length} Students with Unpaid Balances`,
      guardianName,
      guardianPhone,
      guardianEmail,
      className: 'Multiple Classes',
      balanceDue: debtors.reduce((sum, d) => sum + d.balance, 0)
    });

    setReminderForm({
      channel: 'WhatsApp',
      recipient: `${debtors.length} Selected Parents`,
      recipientName: 'All Outstanding Fee Debtors',
      subject: `Urgent Fee Settlement Notice - ${currentTerm} ${academicYear}`,
      message: defaultMsg
    });

    setIsSendReminderOpen(true);
  };

  const handleSendReminderSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reminderTarget) return;

    if (reminderTarget.studentId === 'bulk_all_debtors') {
      // Bulk broadcast to all debtors with invoices > 0
      const debtors = invoices.filter(inv => inv.balance > 0);
      debtors.forEach(inv => {
        const std = students.find(s => s.id === inv.studentId);
        const gName = std?.guardianName || `${inv.studentName}'s Parent`;
        const rec = reminderForm.channel === 'Email' ? (std?.guardianEmail || 'parent@educore.edu.gh') : (std?.guardianPhone || '0244123456');
        
        sendBroadcast({
          channel: reminderForm.channel,
          recipient: rec,
          recipientName: gName,
          subject: reminderForm.subject,
          message: reminderForm.message.replace('Dear Parent/Guardian', `Dear ${gName}`)
        });
      });

      showToast(`Dispatched ${reminderForm.channel} fee reminders to ${debtors.length} parents!`, 'success');
    } else {
      // Individual student reminder
      sendBroadcast({
        channel: reminderForm.channel,
        recipient: reminderForm.recipient || reminderTarget.guardianPhone,
        recipientName: reminderForm.recipientName || reminderTarget.guardianName,
        subject: reminderForm.subject,
        message: reminderForm.message
      });

      showToast(`Fee reminder dispatched via ${reminderForm.channel} to ${reminderTarget.guardianName}!`, 'success');
    }

    setIsSendReminderOpen(false);
  };

  // -------------------------------------------------------------
  // FINANCIAL CALCULATIONS & KPIs
  // -------------------------------------------------------------
  const totalCollected = useMemo(() => payments.reduce((sum, p) => sum + p.amount, 0), [payments]);
  const totalOutstanding = useMemo(() => invoices.reduce((sum, i) => sum + i.balance, 0), [invoices]);
  const totalBilled = useMemo(() => invoices.reduce((sum, i) => sum + i.totalAmount, 0), [invoices]);
  const collectionRate = totalBilled > 0 ? Math.round((totalCollected / totalBilled) * 100) : 0;

  // Filtered Invoices
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const matchesSearch =
        inv.studentName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.invoiceNo.toLowerCase().includes(searchQuery.toLowerCase()) ||
        inv.className.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus =
        statusFilter === 'All'
          ? true
          : statusFilter === 'Paid'
          ? inv.status === 'Paid'
          : statusFilter === 'Partial'
          ? inv.status === 'Partial' || inv.status === 'Partially Paid'
          : statusFilter === 'Unpaid'
          ? inv.status === 'Unpaid'
          : statusFilter === 'Overdue'
          ? inv.status === 'Overdue' || (new Date(inv.dueDate) < new Date() && inv.balance > 0)
          : true;
      const matchesClass = classFilter === 'All' ? true : inv.className === classFilter;
      return matchesSearch && matchesStatus && matchesClass;
    });
  }, [invoices, searchQuery, statusFilter, classFilter]);

  // Class-by-Class Financial Summary
  const classBreakdowns = useMemo(() => {
    const map: Record<string, { totalBilled: number; totalCollected: number; totalOutstanding: number; count: number }> = {};

    invoices.forEach(inv => {
      const cName = inv.className || 'Unassigned';
      if (!map[cName]) {
        map[cName] = { totalBilled: 0, totalCollected: 0, totalOutstanding: 0, count: 0 };
      }
      map[cName].totalBilled += inv.totalAmount;
      map[cName].totalCollected += inv.paidAmount;
      map[cName].totalOutstanding += inv.balance;
      map[cName].count += 1;
    });

    return Object.entries(map).map(([className, data]) => ({
      className,
      ...data,
      rate: data.totalBilled > 0 ? Math.round((data.totalCollected / data.totalBilled) * 100) : 0
    }));
  }, [invoices]);

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div
          className={`fixed top-4 right-4 z-50 px-4 py-3 rounded-xl shadow-lg border flex items-center gap-2.5 transition-all text-xs font-semibold ${
            toastMessage.type === 'success'
              ? 'bg-emerald-950 text-amber-300 border-amber-400/40 shadow-emerald-950/20'
              : toastMessage.type === 'error'
              ? 'bg-rose-950 text-rose-200 border-rose-800 shadow-rose-950/20'
              : 'bg-slate-900 text-slate-100 border-slate-700'
          }`}
        >
          {toastMessage.type === 'success' ? (
            <CheckCircle className="w-4 h-4 text-amber-300 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-300 shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button onClick={() => setToastMessage(null)} className="ml-2 text-slate-400 hover:text-white">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Main Portal Header */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <div className="w-10 h-10 rounded-xl bg-emerald-900 text-amber-300 flex items-center justify-center shadow-xs">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                Fee Collection Portal
                <span className="bg-emerald-100 text-emerald-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full">
                  {academicYear} • {currentTerm}
                </span>
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Generate student fee invoices, process cashier payments, reconcile ledger transactions, and export certified reports.
              </p>
            </div>
          </div>
        </div>

        {/* The 4 Core Primary Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Action 1: Bill Student */}
          <button
            onClick={() => setIsBillStudentOpen(true)}
            id="btn-bill-student"
            className="px-3.5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4 text-amber-300 stroke-[2.5]" />
            <span>Bill Student</span>
          </button>

          {/* Action 2: Process student fees */}
          <button
            onClick={() => setIsProcessFeeOpen(true)}
            id="btn-process-student-fees"
            className="px-3.5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <Banknote className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
            <span>Process Student Fees</span>
          </button>

          {/* Action 3: Export to PDF */}
          <button
            onClick={() => setIsExportPdfOpen(true)}
            id="btn-export-to-pdf"
            className="px-3 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-slate-200 transition-all cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-800" />
            <span>Export to PDF</span>
          </button>

          {/* Action 4: Clear financial Report */}
          <button
            onClick={() => setIsClearReportOpen(true)}
            id="btn-clear-financial-report"
            className="px-3 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-rose-200 transition-all cursor-pointer"
            title="Clear all financial invoices and payment transaction records"
          >
            <Trash2 className="w-3.5 h-3.5 text-rose-600" />
            <span>Clear Financial Report</span>
          </button>
        </div>
      </div>

      {/* Financial Overview KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Billed</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-slate-900 mt-2 block font-['Outfit']">
            GHS {totalBilled.toLocaleString()}
          </span>
          <p className="text-[11px] text-slate-400 mt-1">{invoices.length} Invoices Generated</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Total Collected</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center">
              <Banknote className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-emerald-800 mt-2 block font-['Outfit']">
            GHS {totalCollected.toLocaleString()}
          </span>
          <p className="text-[11px] text-emerald-600 mt-1 font-semibold">{payments.length} Payments Reconciled</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 uppercase tracking-wider">Total Outstanding</span>
            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-900 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <span className="text-2xl font-black text-amber-900 mt-2 block font-['Outfit']">
            GHS {totalOutstanding.toLocaleString()}
          </span>
          <p className="text-[11px] text-amber-700 mt-1 font-medium">Pending parent fee balances</p>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 uppercase tracking-wider">Collection Rate</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-2xl font-black text-emerald-950 font-['Outfit']">{collectionRate}%</span>
            <span className="text-xs text-slate-500 font-medium">of term billings</span>
          </div>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
            <div
              className="bg-emerald-600 h-1.5 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, collectionRate)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white px-4 rounded-xl text-xs font-bold gap-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('invoices')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'invoices'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Receipt className="w-4 h-4" />
          Invoices & Student Balances ({invoices.length})
        </button>
        <button
          onClick={() => setActiveTab('payments')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'payments'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Banknote className="w-4 h-4" />
          Cashier Receipts & Payments ({payments.length})
        </button>
        <button
          onClick={() => setActiveTab('summary')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'summary'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4" />
          Class-by-Class Summary ({classBreakdowns.length})
        </button>
        <button
          onClick={() => setActiveTab('structures')}
          className={`py-3.5 border-b-2 flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'structures'
              ? 'border-emerald-700 text-emerald-900'
              : 'border-transparent text-slate-500 hover:text-slate-900'
          }`}
        >
          <DollarSign className="w-4 h-4" />
          Fee Structure Templates ({feeStructures.length})
        </button>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* TAB 1: INVOICES & BALANCES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'invoices' && (
        <div className="space-y-4">
          {/* Filter and Search Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by student name, invoice # or class..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg outline-none focus:ring-2 focus:ring-emerald-600 bg-slate-50"
              />
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <button
                onClick={() => {
                  if (students.length > 0) {
                    setSelectedStudentForArrears(students[0]);
                    setOverrideArrearsAmount(students[0].manualArrears || 0);
                    setOverrideArrearsReason('');
                    setIsManualArrearsModalOpen(true);
                  }
                }}
                className="px-3 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Set or adjust manual arrears balance for any student independently of billing calculations"
              >
                <Clock className="w-3.5 h-3.5 text-amber-700" />
                <span>Manual Arrears Override</span>
              </button>

              <button
                onClick={handleOpenBulkReminders}
                className="px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                title="Send notification broadcast to all parents with outstanding balances"
              >
                <Bell className="w-3.5 h-3.5 text-emerald-700" />
                <span>Send Reminders to Debtors</span>
              </button>

              <div className="flex items-center gap-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-slate-500 font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as any)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 outline-none"
                >
                  <option value="All">All Invoices</option>
                  <option value="Unpaid">Unpaid</option>
                  <option value="Partial">Partially Paid</option>
                  <option value="Paid">Fully Paid</option>
                  <option value="Overdue">Overdue</option>
                </select>
              </div>

              <div className="flex items-center gap-1 text-xs">
                <span className="text-slate-500 font-semibold">Class:</span>
                <select
                  value={classFilter}
                  onChange={(e) => setClassFilter(e.target.value)}
                  className="border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-semibold bg-white text-slate-700 outline-none"
                >
                  <option value="All">All Classes</option>
                  {classNames.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Invoices Table */}
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            {filteredInvoices.length === 0 ? (
              <div className="p-12 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-3">
                  <Receipt className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-slate-800 text-sm">No Invoices Found</h4>
                <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                  There are no student invoices matching your search criteria. Click &quot;Bill Student&quot; to generate an invoice.
                </p>
                <button
                  onClick={() => setIsBillStudentOpen(true)}
                  className="mt-4 px-4 py-2 bg-emerald-800 text-white font-bold text-xs rounded-xl inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Plus className="w-4 h-4 text-amber-300" />
                  Bill Student Now
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                      <th className="py-3 px-4">Invoice #</th>
                      <th className="py-3 px-4">Student</th>
                      <th className="py-3 px-4">Class</th>
                      <th className="py-3 px-4">Due Date</th>
                      <th className="py-3 px-4">Total Billed</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Balance Due</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredInvoices.map((inv) => (
                      <tr key={inv.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-950">{inv.invoiceNo}</td>
                        <td className="py-3 px-4 font-bold text-slate-900">{inv.studentName}</td>
                        <td className="py-3 px-4 text-slate-600">{inv.className}</td>
                        <td className="py-3 px-4 text-slate-500 font-mono">{inv.dueDate}</td>
                        <td className="py-3 px-4 font-bold">GHS {inv.totalAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 text-emerald-700 font-bold">GHS {inv.paidAmount.toLocaleString()}</td>
                        <td className="py-3 px-4 font-bold text-amber-900">
                          {inv.balance > 0 ? `GHS ${inv.balance.toLocaleString()}` : <span className="text-emerald-700 font-medium">Cleared</span>}
                        </td>
                        <td className="py-3 px-4">
                          <span
                            className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                              inv.status === 'Paid'
                                ? 'bg-emerald-100 text-emerald-800'
                                : inv.status === 'Partial' || inv.status === 'Partially Paid'
                                ? 'bg-amber-100 text-amber-900'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {inv.status}
                          </span>
                        </td>
                        <td className="py-3 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {inv.balance > 0 && (
                              <button
                                onClick={() => handleOpenReminderForInvoice(inv)}
                                className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-lg text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                                title="Send reminder notice to parent via WhatsApp/SMS/Email"
                              >
                                <Bell className="w-3 h-3 text-emerald-700" />
                                <span>Send Reminder</span>
                              </button>
                            )}
                            <button
                              onClick={() => {
                                const std = students.find((s) => s.id === inv.studentId);
                                if (std) {
                                  handleOpenArrearsOverride(std);
                                }
                              }}
                              className="px-2.5 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-[11px] shadow-xs cursor-pointer flex items-center gap-1 transition-colors"
                              title="Set or adjust manual arrears for this student"
                            >
                              <Clock className="w-3 h-3 text-amber-700" />
                              <span>Arrears</span>
                            </button>
                            {inv.balance > 0 && (
                              <button
                                onClick={() => {
                                  setProcessFeeForm(prev => ({
                                    ...prev,
                                    studentId: inv.studentId,
                                    invoiceId: inv.id,
                                    amount: inv.balance
                                  }));
                                  setIsProcessFeeOpen(true);
                                }}
                                className="px-2.5 py-1 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-lg text-[11px] shadow-xs cursor-pointer"
                                title="Process payment for this invoice"
                              >
                                Pay / Receive
                              </button>
                            )}
                            <button
                              onClick={() => setSelectedInvoice(inv)}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 cursor-pointer"
                              title="View and Print Invoice Slip"
                            >
                              <Printer className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => handleOpenEditInvoice(inv)}
                              className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer transition-colors"
                              title="Edit & Correct Fee Bill Inputs"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => {
                                if (window.confirm(`Are you sure you want to delete invoice ${inv.invoiceNo} for ${inv.studentName}?`)) {
                                  deleteInvoice(inv.id);
                                  showToast(`Deleted invoice ${inv.invoiceNo}`);
                                }
                              }}
                              className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer"
                              title="Delete Invoice"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 2: CASHIER RECEIPTS & PAYMENTS */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'payments' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Reconciled Cashier Transactions</h3>
              <p className="text-xs text-slate-500">Real-time record of all student fee payments across cash, mobile money, bank, and online channels.</p>
            </div>
            <button
              onClick={() => setIsProcessFeeOpen(true)}
              className="px-3.5 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4 text-emerald-950" />
              New Payment Receipt
            </button>
          </div>

          {payments.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Receipt className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-xs font-semibold text-slate-600">No payment transactions recorded yet.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-emerald-900 text-white uppercase text-[10px] tracking-wider font-bold">
                    <th className="py-3 px-4">Receipt / Ref #</th>
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Payment Method</th>
                    <th className="py-3 px-4">Amount Paid</th>
                    <th className="py-3 px-4">Date</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Cashier / Staff</th>
                    <th className="py-3 px-4 text-right">Receipt</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {payments.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-emerald-950">{p.paymentRef}</td>
                      <td className="py-3 px-4 font-bold text-slate-900">{p.studentName}</td>
                      <td className="py-3 px-4">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-semibold text-[11px]">
                          {p.paymentMethod || p.channel}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-black text-emerald-800 font-mono">
                        GHS {p.amount.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-500 font-mono text-[11px]">{p.date}</td>
                      <td className="py-3 px-4">
                        <span className="bg-emerald-100 text-emerald-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full">
                          {p.status}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-600 text-[11px]">{p.receivedBy || 'Bursar'}</td>
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedPaymentReceipt(p)}
                            className="px-2 py-1 bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900 font-bold rounded-lg text-[11px] inline-flex items-center gap-1 cursor-pointer"
                            title="View and Print Payment Receipt"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Receipt</span>
                          </button>
                          <button
                            onClick={() => handleOpenEditPayment(p)}
                            className="p-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-800 cursor-pointer transition-colors"
                            title="Edit / Correct Payment Entry"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (window.confirm(`Are you sure you want to delete payment receipt ${p.paymentRef} (GHS ${p.amount.toLocaleString()}) for ${p.studentName}?`)) {
                                deletePayment(p.id);
                                showToast(`Deleted payment ${p.paymentRef}`);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                            title="Delete Payment Entry"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 3: CLASS-BY-CLASS SUMMARY */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'summary' && (
        <div className="space-y-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="font-bold text-sm text-slate-900 font-['Outfit']">Class Financial Ledger & Recovery Analysis</h3>
            <p className="text-xs text-slate-500 mt-0.5">Aggregated billings, collections, outstanding balances and recovery velocity broken down by classroom level.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {classBreakdowns.map((item) => (
              <div key={item.className} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm text-slate-900">{item.className}</span>
                  <span className="text-[11px] bg-slate-100 text-slate-700 font-semibold px-2 py-0.5 rounded-full">
                    {item.count} Invoices
                  </span>
                </div>

                <div className="space-y-1.5 text-xs pt-1">
                  <div className="flex justify-between text-slate-600">
                    <span>Total Billed:</span>
                    <span className="font-bold text-slate-900">GHS {item.totalBilled.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-emerald-700 font-semibold">
                    <span>Total Collected:</span>
                    <span>GHS {item.totalCollected.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-amber-900 font-semibold">
                    <span>Outstanding:</span>
                    <span>GHS {item.totalOutstanding.toLocaleString()}</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-[11px] mb-1">
                    <span className="text-slate-500 font-medium">Recovery Rate:</span>
                    <span className="font-bold text-emerald-800">{item.rate}%</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-emerald-600 h-2 rounded-full"
                      style={{ width: `${Math.min(100, item.rate)}%` }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* TAB 4: FEE STRUCTURES */}
      {/* ------------------------------------------------------------- */}
      {activeTab === 'structures' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center bg-white p-4 rounded-xl border border-slate-200">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Configured Fee Structures</h3>
              <p className="text-xs text-slate-500">Standardized class billing templates with tuition, levies, PTA, and laboratory itemizations.</p>
            </div>
            <button
              onClick={() => setIsNewStructureOpen(true)}
              className="px-3.5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-amber-300" />
              New Structure Template
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {feeStructures.map((struct) => (
              <div key={struct.id} className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="font-bold text-sm text-slate-900">{struct.name}</h3>
                    <p className="text-xs text-emerald-700 font-semibold">{struct.classLevel || struct.className} • {struct.term}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Total Levies</span>
                    <span className="text-lg font-black text-emerald-900 font-['Outfit']">
                      GHS {struct.totalAmount.toLocaleString()}
                    </span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs space-y-1.5">
                  <div className="flex justify-between text-slate-600">
                    <span>Term Fees:</span>
                    <span className="font-bold text-slate-800">GHS {struct.breakdown?.termFees ?? struct.termFees ?? struct.breakdown?.tuitionFee ?? struct.tuitionFee ?? struct.tuition ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Books (Text Books & Exercise Books):</span>
                    <span className="font-bold text-slate-800">GHS {struct.breakdown?.books ?? struct.books ?? struct.breakdown?.libraryFee ?? struct.libraryFee ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Accessories:</span>
                    <span className="font-bold text-slate-800">GHS {struct.breakdown?.accessories ?? struct.accessories ?? struct.breakdown?.developmentLevy ?? struct.developmentLevy ?? 0}</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Arrears (Previous Term Outstanding):</span>
                    <span className="font-bold text-slate-800">GHS {struct.breakdown?.arrears ?? struct.arrears ?? 0}</span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleOpenEditStructure(struct)}
                    className="px-3 py-1 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-300 font-bold rounded-lg text-xs flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Edit Template</span>
                  </button>
                  <button
                    onClick={() => {
                      if (window.confirm(`Are you sure you want to delete fee structure "${struct.name}"?`)) {
                        deleteFeeStructure(struct.id);
                        showToast(`Deleted structure ${struct.name}`);
                      }
                    }}
                    className="p-1.5 rounded-lg bg-slate-100 hover:bg-rose-100 text-slate-400 hover:text-rose-600 cursor-pointer transition-colors"
                    title="Delete Template"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 1. BILL STUDENT MODAL */}
      {/* ============================================================= */}
      {isBillStudentOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                  <Receipt className="w-4 h-4 text-amber-300" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Bill Student / Issue Fee Invoice</h3>
                  <p className="text-xs text-emerald-200">Create itemized fee bills for individual students or entire classes in batch</p>
                </div>
              </div>
              <button onClick={() => setIsBillStudentOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mode Switch: Individual vs Bulk Class */}
            <div className="flex border-b border-slate-200 bg-slate-50 px-6 pt-3 text-xs font-bold gap-4">
              <button
                type="button"
                onClick={() => setBillingMode('individual')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingMode === 'individual'
                    ? 'border-emerald-800 text-emerald-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                Individual Student Billing
              </button>
              <button
                type="button"
                onClick={() => setBillingMode('bulk')}
                className={`pb-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 ${
                  billingMode === 'bulk'
                    ? 'border-emerald-800 text-emerald-950'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 className="w-3.5 h-3.5" />
                Bulk Class Billing (Batch)
              </button>
            </div>

            <form onSubmit={handleBillStudentSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Target Selector */}
              {billingMode === 'individual' ? (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                  <select
                    required
                    value={billForm.studentId}
                    onChange={(e) => handleStudentSelectInBill(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none font-medium"
                  >
                    <option value="">-- Search & Choose Student --</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.firstName} {s.lastName} ({s.className}) - Adm #{s.admissionNo} {s.balanceDue > 0 ? `[Arrears: GHS ${s.balanceDue.toLocaleString()}]` : ''}
                      </option>
                    ))}
                  </select>
                  {billForm.studentId && (() => {
                    const std = students.find(s => s.id === billForm.studentId);
                    if (std && std.balanceDue > 0) {
                      return (
                        <div className="mt-2 p-2.5 bg-amber-50 border border-amber-200 rounded-lg flex items-center justify-between text-amber-900">
                          <span className="text-[11px] font-medium">
                            Student has outstanding previous arrears of <strong>GHS {std.balanceDue.toLocaleString()}</strong>.
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const existingIdx = billForm.customItems.findIndex(i => i.description.toLowerCase().includes('arrears'));
                              if (existingIdx >= 0) {
                                const newItems = [...billForm.customItems];
                                newItems[existingIdx].amount = std.balanceDue;
                                setBillForm({ ...billForm, customItems: newItems });
                              } else {
                                handleAddCustomItem('Arrears (Previous Term Outstanding)', std.balanceDue);
                              }
                              showToast(`Included GHS ${std.balanceDue} arrears in billing items!`, 'info');
                            }}
                            className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded font-bold text-[10px] cursor-pointer"
                          >
                            Include Arrears
                          </button>
                        </div>
                      );
                    }
                    return null;
                  })()}
                </div>
              ) : (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Select Class to Bill *</label>
                  <select
                    required
                    value={billForm.classLevel}
                    onChange={(e) => setBillForm({ ...billForm, classLevel: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {classNames.map((c) => {
                      const count = students.filter(s => s.className === c).length;
                      return (
                        <option key={c} value={c}>
                          {c} ({count} active students)
                        </option>
                      );
                    })}
                  </select>
                </div>
              )}

              {/* Billing Category Mode Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Fee Billing Category & Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    { id: 'full_combined', label: 'Full Payment (All Fees Combined)', icon: '🌟' },
                    { id: 'term_fees', label: 'Term Fees', icon: '🎓' },
                    { id: 'books', label: 'Books (Text & Exercise Books)', icon: '📚' },
                    { id: 'accessories', label: 'Accessories', icon: '🎒' },
                    { id: 'arrears', label: 'Arrears (Previous Term Outstanding)', icon: '🕒' },
                    { id: 'custom', label: 'Custom Breakdown (Itemized)', icon: '📝' }
                  ].map((cat) => {
                    const isSelected = billingPreset === cat.id;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => applyBillingPreset(cat.id as BillingCategoryPreset)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{cat.icon}</span>
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Term & Due Date Details */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Year</label>
                  <input
                    type="text"
                    value={billForm.academicYear}
                    onChange={(e) => setBillForm({ ...billForm, academicYear: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-slate-50"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Academic Term</label>
                  <select
                    value={billForm.term}
                    onChange={(e) => setBillForm({ ...billForm, term: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="Term 1">Term 1</option>
                    <option value="Term 2">Term 2</option>
                    <option value="Term 3">Term 3</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Due Date *</label>
                  <input
                    type="date"
                    required
                    value={billForm.dueDate}
                    onChange={(e) => setBillForm({ ...billForm, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              {/* Template Quick Loader */}
              <div className="bg-emerald-50/60 p-3.5 rounded-xl border border-emerald-200/80">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-bold text-emerald-950 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
                    Load from Fee Structure Template
                  </span>
                </div>
                <select
                  value={billForm.feeStructureId}
                  onChange={(e) => handleApplyFeeTemplate(e.target.value)}
                  className="w-full border border-emerald-300 rounded-lg px-3 py-1.5 text-slate-900 bg-white font-medium outline-none text-xs"
                >
                  <option value="">-- Select Template to Pre-populate Categories --</option>
                  {feeStructures.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} (GHS {f.totalAmount.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Items Builder with Category Chips */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center justify-between gap-1">
                  <label className="font-semibold text-slate-700">Fee Itemization Breakdown</label>
                  <div className="flex flex-wrap gap-1">
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem('Term Fees', 1500)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    >
                      + Term Fees
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem('Books (Text Books & Exercise Books)', 450)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    >
                      + Books
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem('Accessories', 250)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    >
                      + Accessories
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem('Arrears (Previous Term Outstanding)', 350)}
                      className="px-2 py-0.5 rounded-md bg-slate-100 hover:bg-slate-200 text-slate-700 text-[10px] font-semibold cursor-pointer"
                    >
                      + Arrears
                    </button>
                    <button
                      type="button"
                      onClick={() => handleAddCustomItem()}
                      className="px-2 py-0.5 rounded-md bg-emerald-100 hover:bg-emerald-200 text-emerald-900 text-[10px] font-bold cursor-pointer"
                    >
                      + Custom Item
                    </button>
                  </div>
                </div>

                <div className="space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
                  {billForm.customItems.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => {
                          const newItems = [...billForm.customItems];
                          newItems[idx].description = e.target.value;
                          setBillForm({ ...billForm, customItems: newItems });
                        }}
                        placeholder="Item name / Category (e.g. Term Fees, Books, Accessories, Arrears)"
                        className="flex-1 border border-slate-300 rounded-lg px-3 py-1.5 text-slate-900 bg-white text-xs"
                      />
                      <div className="relative w-28">
                        <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 font-mono text-[11px]">GHS</span>
                        <input
                          type="number"
                          value={item.amount}
                          onChange={(e) => {
                            const newItems = [...billForm.customItems];
                            newItems[idx].amount = Number(e.target.value);
                            setBillForm({ ...billForm, customItems: newItems });
                          }}
                          className="w-full border border-slate-300 rounded-lg pl-10 pr-2 py-1.5 text-slate-900 bg-white text-xs font-mono font-bold text-right"
                        />
                      </div>
                      {billForm.customItems.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveCustomItem(idx)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg cursor-pointer"
                          title="Remove item"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Discount & Total Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Scholarship / Bursary Discount (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    value={billForm.discountAmount}
                    onChange={(e) => setBillForm({ ...billForm, discountAmount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                    placeholder="0"
                  />
                </div>

                <div className="bg-slate-900 text-white p-3.5 rounded-xl flex flex-col justify-center">
                  <span className="text-[10px] text-emerald-300 uppercase tracking-wider font-semibold">Total Bill Payable</span>
                  <span className="text-xl font-black font-mono text-amber-300">
                    GHS {finalBillAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsBillStudentOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <Receipt className="w-4 h-4 text-amber-300" />
                  {billingMode === 'individual' ? 'Generate Student Invoice' : `Batch Bill Class (${billForm.classLevel})`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 2. PROCESS STUDENT FEES MODAL */}
      {/* ============================================================= */}
      {isProcessFeeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Banknote className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Process Student Fee Payment</h3>
                  <p className="text-xs text-emerald-200">Record cash, mobile money, cheque, or bank receipts with instant voucher</p>
                </div>
              </div>
              <button onClick={() => setIsProcessFeeOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleProcessFeeSubmit} className="p-6 space-y-4 text-xs max-h-[75vh] overflow-y-auto">
              {/* Student Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  required
                  value={processFeeForm.studentId}
                  onChange={(e) => handleStudentSelectInProcess(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                >
                  <option value="">-- Choose Student to Receive Payment --</option>
                  {students.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.firstName} {s.lastName} ({s.className}) - Bal: GHS {(s.balanceDue || 0).toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Outstanding Context Card */}
              {selectedProcessStudent && (
                <div className="bg-amber-50/70 p-3.5 rounded-xl border border-amber-200/80 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-amber-800 font-semibold block">Total Outstanding Balance:</span>
                    <span className="text-lg font-black text-amber-950 font-mono">
                      GHS {(selectedProcessStudent.balanceDue || 0).toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right text-[11px] text-slate-600">
                    <span>{studentOutstandingInvoices.length} Unsettled Invoices</span>
                  </div>
                </div>
              )}

              {/* Invoice Allocation */}
              {studentOutstandingInvoices.length > 0 && (
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Apply to Specific Invoice (Optional)</label>
                  <select
                    value={processFeeForm.invoiceId}
                    onChange={(e) => {
                      const inv = studentOutstandingInvoices.find(i => i.id === e.target.value);
                      setProcessFeeForm({
                        ...processFeeForm,
                        invoiceId: e.target.value,
                        amount: inv ? inv.balance : processFeeForm.amount
                      });
                    }}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  >
                    <option value="">-- General Account Balance --</option>
                    {studentOutstandingInvoices.map((inv) => (
                      <option key={inv.id} value={inv.id}>
                        {inv.invoiceNo} ({inv.term}) - Balance: GHS {inv.balance.toLocaleString()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Fee Purpose & Category Allocation Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Payment Purpose / Fee Category Allocation *</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {[
                    {
                      label: 'Full Payment (All Fees Combined)',
                      icon: '🌟',
                      amount: selectedProcessStudent?.balanceDue || 2200,
                      remarks: `Full Payment (All Fees Combined) - ${currentTerm}`
                    },
                    {
                      label: 'Term Fees',
                      icon: '🎓',
                      amount: 1500,
                      remarks: `Term Tuition & Academic Instruction Fees - ${currentTerm}`
                    },
                    {
                      label: 'Books (Text & Exercise Books)',
                      icon: '📚',
                      amount: 450,
                      remarks: `Text Books & Exercise Books Package - ${currentTerm}`
                    },
                    {
                      label: 'Accessories',
                      icon: '🎒',
                      amount: 250,
                      remarks: `Uniforms, Crest, PE Kit & Accessories - ${currentTerm}`
                    },
                    {
                      label: 'Arrears (Previous Term)',
                      icon: '🕒',
                      amount: selectedProcessStudent?.balanceDue || 350,
                      remarks: `Previous Term Outstanding Arrears Settlement`
                    },
                    {
                      label: 'Custom Breakdown',
                      icon: '📝',
                      amount: processFeeForm.amount,
                      remarks: `Custom Itemized Payment`
                    }
                  ].map((cat, idx) => {
                    const isSelected = processFeeForm.paymentPurpose === cat.label;
                    return (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleQuickAllocatePayment(cat.label, cat.amount, cat.remarks)}
                        className={`p-2 rounded-xl border text-left flex items-center gap-1.5 cursor-pointer transition-all ${
                          isSelected
                            ? 'border-emerald-800 bg-emerald-50 text-emerald-950 font-bold ring-1 ring-emerald-700'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{cat.icon}</span>
                        <span className="text-[11px] truncate">{cat.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Amount and Quick Buttons */}
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label className="block font-semibold text-slate-700">Payment Amount (GHS) *</label>
                  <span className="text-[11px] text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Allocated to: {processFeeForm.paymentPurpose}
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">GHS</span>
                  <input
                    type="number"
                    required
                    min="1"
                    value={processFeeForm.amount}
                    onChange={(e) => setProcessFeeForm({ ...processFeeForm, amount: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg pl-12 pr-3 py-2 text-slate-900 text-base font-bold font-mono outline-none focus:ring-2 focus:ring-emerald-600"
                  />
                </div>

                {selectedProcessStudent && selectedProcessStudent.balanceDue > 0 && (
                  <div className="flex gap-2 mt-2">
                    <button
                      type="button"
                      onClick={() => setProcessFeeForm({ ...processFeeForm, amount: selectedProcessStudent.balanceDue, paymentPurpose: 'Full Payment (All Fees Combined)' })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer"
                    >
                      Pay Full Arrears/Balance (GHS {selectedProcessStudent.balanceDue.toLocaleString()})
                    </button>
                    <button
                      type="button"
                      onClick={() => setProcessFeeForm({ ...processFeeForm, amount: Math.round(selectedProcessStudent.balanceDue / 2) })}
                      className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-semibold cursor-pointer"
                    >
                      Pay 50% (GHS {Math.round(selectedProcessStudent.balanceDue / 2).toLocaleString()})
                    </button>
                  </div>
                )}
              </div>

              {/* Remarks / Narrative */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Narrative / Purpose Description</label>
                <input
                  type="text"
                  value={processFeeForm.remarks}
                  onChange={(e) => setProcessFeeForm({ ...processFeeForm, remarks: e.target.value })}
                  placeholder="e.g. Term Fees, Books & Accessories settlement"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                />
              </div>

              {/* Payment Method - Exclusive to Cash Desk */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Method / Collection Channel *</label>
                <div className="p-3 rounded-xl border border-emerald-700 bg-emerald-50/90 text-emerald-950 flex items-center justify-between shadow-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-emerald-800 text-amber-300 flex items-center justify-center shadow-xs">
                      <Banknote className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900">Cash Desk</span>
                        <span className="text-[10px] font-extrabold bg-emerald-700 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
                          Cashier Active
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500">Official cash collection at school accounts counter</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-800 font-mono">GHS {Number(processFeeForm.amount || 0).toLocaleString()}</span>
                </div>
              </div>

              {/* Payer & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payer / Guardian Name</label>
                  <input
                    type="text"
                    value={processFeeForm.payerName}
                    onChange={(e) => setProcessFeeForm({ ...processFeeForm, payerName: e.target.value })}
                    placeholder="e.g. Mr. Kwame Mensah"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payer Phone (SMS Receipt)</label>
                  <input
                    type="tel"
                    value={processFeeForm.payerPhone}
                    onChange={(e) => setProcessFeeForm({ ...processFeeForm, payerPhone: e.target.value })}
                    placeholder="e.g. 0244123456"
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Receipt Reference / Cheque #</label>
                <input
                  type="text"
                  value={processFeeForm.reference}
                  onChange={(e) => setProcessFeeForm({ ...processFeeForm, reference: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono"
                />
              </div>

              <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsProcessFeeOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold rounded-xl shadow-sm flex items-center gap-1.5 cursor-pointer"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-950 stroke-[2.5]" />
                  Confirm & Issue Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 3. CLEAR FINANCIAL REPORT SAFETY MODAL */}
      {/* ============================================================= */}
      {isClearReportOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4">
          <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-rose-200">
            <div className="bg-rose-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-rose-300" />
                <h3 className="font-bold text-base font-['Outfit']">Clear Financial Report</h3>
              </div>
              <button onClick={() => setIsClearReportOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-900 space-y-1.5">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                  Select Clearing Option
                </p>
                <p className="text-[11px] leading-relaxed text-rose-800">
                  Choose precisely which financial ledger records you want to clear without causing cumulative billing issues.
                </p>
              </div>

              {/* Mode Selection Options */}
              <div className="space-y-2">
                <label
                  onClick={() => setClearMode('arrears-only')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearMode === 'arrears-only'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearMode"
                    checked={clearMode === 'arrears-only'}
                    onChange={() => setClearMode('arrears-only')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">1. Clear Arrears Only (Reset Previous Unpaid Debts)</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Resets all previous term arrears to GHS 0.00 across all students and student ledger profiles without deleting current term bills.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setClearMode('payments-only')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearMode === 'payments-only'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearMode"
                    checked={clearMode === 'payments-only'}
                    onChange={() => setClearMode('payments-only')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">2. Clear Total Collected Only</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Clears recorded cashier payment receipts and resets total collected figures back to GHS 0.00.
                    </span>
                  </div>
                </label>

                <label
                  onClick={() => setClearMode('all')}
                  className={`flex items-start gap-2.5 p-3 rounded-xl border cursor-pointer transition-all ${
                    clearMode === 'all'
                      ? 'border-rose-600 bg-rose-50/70 shadow-xs'
                      : 'border-slate-200 bg-white hover:bg-slate-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="clearMode"
                    checked={clearMode === 'all'}
                    onChange={() => setClearMode('all')}
                    className="mt-0.5 accent-rose-700"
                  />
                  <div>
                    <strong className="text-slate-900 block font-bold">3. Full Reset (Clear Invoices, Arrears & Payments)</strong>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Completely wipes all {invoices.length} invoices, {payments.length} receipts, and resets all student balances to 0.00.
                    </span>
                  </div>
                </label>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Type <span className="font-mono text-rose-700 font-extrabold">CONFIRM</span> to authorize:
                </label>
                <input
                  type="text"
                  value={clearConfirmText}
                  onChange={(e) => setClearConfirmText(e.target.value)}
                  placeholder="CONFIRM"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-mono font-bold uppercase outline-none focus:ring-2 focus:ring-rose-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsClearReportOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleClearFinancialReportSubmit}
                  disabled={clearConfirmText.trim().toUpperCase() !== 'CONFIRM'}
                  className={`px-5 py-2 rounded-xl font-bold transition-all ${
                    clearConfirmText.trim().toUpperCase() === 'CONFIRM'
                      ? 'bg-rose-700 hover:bg-rose-800 text-white shadow-sm cursor-pointer'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {clearMode === 'arrears-only'
                    ? 'Clear All Arrears'
                    : clearMode === 'payments-only'
                    ? 'Clear Total Collected'
                    : 'Clear All Financial Data'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* EDIT INVOICE / BILL MODAL */}
      {/* ============================================================= */}
      {isEditInvoiceOpen && editingInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Edit & Correct Fee Bill</h3>
                  <p className="text-xs text-emerald-200">Modify invoice #{editingInvoice.invoiceNo} for {editingInvoice.studentName}</p>
                </div>
              </div>
              <button onClick={() => setIsEditInvoiceOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditInvoice} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex justify-between items-center">
                <div>
                  <span className="font-bold text-slate-900 block">{editingInvoice.studentName}</span>
                  <span className="text-slate-500 text-[11px]">{editingInvoice.className} • {editingInvoice.term}</span>
                </div>
                <span className="bg-emerald-100 text-emerald-900 text-xs font-bold px-2.5 py-1 rounded-full font-mono">
                  Invoice #{editingInvoice.invoiceNo}
                </span>
              </div>

              {/* 4 Item Breakdown Fields */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term Fees (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editInvoiceForm.termFees}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, termFees: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Books (Textbooks & Workbooks) (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editInvoiceForm.books}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, books: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accessories (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editInvoiceForm.accessories}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, accessories: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Arrears / Prior Debt (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editInvoiceForm.arrears}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, arrears: Number(e.target.value) || 0 })}
                    className="w-full border border-amber-300 bg-amber-50/50 rounded-lg px-3 py-2 text-amber-900 font-bold focus:ring-2 focus:ring-amber-600 outline-none"
                  />
                </div>
              </div>

              {/* Due Date & Paid Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editInvoiceForm.dueDate}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Paid Amount (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editInvoiceForm.paidAmount}
                    onChange={(e) => setEditInvoiceForm({ ...editInvoiceForm, paidAmount: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* Calculated Totals Preview */}
              <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200 grid grid-cols-3 gap-2 text-center">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Current Bill</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    GHS {(Number(editInvoiceForm.termFees) + Number(editInvoiceForm.books) + Number(editInvoiceForm.accessories)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-amber-700 block">Total + Arrears</span>
                  <span className="text-sm font-black text-amber-900 font-mono">
                    GHS {(Number(editInvoiceForm.termFees) + Number(editInvoiceForm.books) + Number(editInvoiceForm.accessories) + Number(editInvoiceForm.arrears)).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800 block">Balance Due</span>
                  <span className="text-sm font-black text-emerald-950 font-mono">
                    GHS {Math.max(0, (Number(editInvoiceForm.termFees) + Number(editInvoiceForm.books) + Number(editInvoiceForm.accessories) + Number(editInvoiceForm.arrears)) - Number(editInvoiceForm.paidAmount)).toLocaleString()}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditInvoiceOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* EDIT PAYMENT RECEIPT MODAL */}
      {/* ============================================================= */}
      {isEditPaymentOpen && editingPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Edit Payment Receipt</h3>
                  <p className="text-xs text-emerald-200">Correct transaction receipt #{editingPayment.paymentRef || editingPayment.reference}</p>
                </div>
              </div>
              <button onClick={() => setIsEditPaymentOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditPayment} className="p-6 space-y-4 text-xs">
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200">
                <span className="font-bold text-slate-900 block">{editingPayment.studentName}</span>
                <span className="text-slate-500 text-[11px]">Original Ref: {editingPayment.paymentRef || editingPayment.reference}</span>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Amount (GHS) *</label>
                <input
                  type="number"
                  min="1"
                  step="any"
                  required
                  value={editPaymentForm.amount}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, amount: Number(e.target.value) || 0 })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold text-base focus:ring-2 focus:ring-emerald-600 outline-none font-mono"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Method</label>
                  <select
                    value={editPaymentForm.paymentMethod}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, paymentMethod: e.target.value as any })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 bg-white focus:ring-2 focus:ring-emerald-600 outline-none font-semibold"
                  >
                    <option value="Cash">Cash</option>
                    <option value="Mobile Money">Mobile Money</option>
                    <option value="Bank Transfer">Bank Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Paystack">Paystack Online</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Payment Date</label>
                  <input
                    type="date"
                    value={editPaymentForm.date}
                    onChange={(e) => setEditPaymentForm({ ...editPaymentForm, date: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payer Phone / Reference</label>
                <input
                  type="text"
                  value={editPaymentForm.payerPhone}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, payerPhone: e.target.value })}
                  placeholder="e.g. 0244123456"
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Received By (Cashier / Staff)</label>
                <input
                  type="text"
                  value={editPaymentForm.receivedBy}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, receivedBy: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Payment Purpose & Remarks</label>
                <input
                  type="text"
                  value={editPaymentForm.remarks}
                  onChange={(e) => setEditPaymentForm({ ...editPaymentForm, remarks: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditPaymentOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Corrections
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* EDIT FEE STRUCTURE MODAL */}
      {/* ============================================================= */}
      {isEditStructureOpen && editingStructure && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Edit Fee Structure Template</h3>
                  <p className="text-xs text-emerald-200">Update default billing template for {editingStructure.name}</p>
                </div>
              </div>
              <button onClick={() => setIsEditStructureOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditStructure} className="p-6 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Structure Template Name *</label>
                <input
                  type="text"
                  required
                  value={editStructForm.name}
                  onChange={(e) => setEditStructForm({ ...editStructForm, name: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level</label>
                  <input
                    type="text"
                    value={editStructForm.classLevel}
                    onChange={(e) => setEditStructForm({ ...editStructForm, classLevel: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={editStructForm.dueDate}
                    onChange={(e) => setEditStructForm({ ...editStructForm, dueDate: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              {/* 4 Categories */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term Fees (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editStructForm.termFees}
                    onChange={(e) => setEditStructForm({ ...editStructForm, termFees: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Books (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editStructForm.books}
                    onChange={(e) => setEditStructForm({ ...editStructForm, books: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accessories (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editStructForm.accessories}
                    onChange={(e) => setEditStructForm({ ...editStructForm, accessories: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Arrears (GHS)</label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    value={editStructForm.arrears}
                    onChange={(e) => setEditStructForm({ ...editStructForm, arrears: Number(e.target.value) || 0 })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-bold focus:ring-2 focus:ring-emerald-600 outline-none"
                  />
                </div>
              </div>

              <div className="bg-emerald-50 p-3 rounded-xl border border-emerald-200 flex justify-between items-center">
                <span className="font-bold text-slate-700">Total Standard Levies:</span>
                <span className="font-black text-emerald-950 font-mono text-base">
                  GHS {(Number(editStructForm.termFees) + Number(editStructForm.books) + Number(editStructForm.accessories) + Number(editStructForm.arrears)).toLocaleString()}
                </span>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsEditStructureOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 4. EXPORT TO PDF MODAL & PRINTABLE REPORT */}
      {/* ============================================================= */}
      {isExportPdfOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-950 text-white p-5 flex items-center justify-between print:hidden">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base font-['Outfit']">Financial Fee Report Export</h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-extrabold text-xs rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Printer className="w-4 h-4 text-emerald-950" />
                  Print / Save as PDF
                </button>
                <button
                  onClick={() => setIsExportPdfOpen(false)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Printable Document Sheet */}
            <div className="p-8 space-y-6 text-xs text-slate-900 bg-white font-sans">
              {/* Official Header */}
              <div className="border-b-2 border-emerald-900 pb-4 flex items-center justify-between">
                <div>
                  <h1 className="text-2xl font-black text-emerald-950 font-['Outfit']">Grace White Dove School Complex</h1>
                  <p className="text-xs text-slate-600 font-medium">Email: gracewhitedoveschool@gmail.com • Tel: 0244403541</p>
                  <p className="text-xs text-emerald-800 font-bold mt-1">OFFICIAL FINANCIAL & FEE RECOVERY AUDIT REPORT</p>
                </div>
                <div className="text-right font-mono">
                  <span className="text-[11px] text-slate-500 block">Generated On:</span>
                  <span className="font-bold text-xs text-slate-900 block">{new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                  <span className="text-[11px] text-emerald-800 font-bold block">{academicYear} • {currentTerm}</span>
                </div>
              </div>

              {/* Executive Summary Cards */}
              <div className="grid grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Total Billed</span>
                  <span className="text-base font-black text-slate-900 font-mono">GHS {totalBilled.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-emerald-700 uppercase font-semibold block">Total Collected</span>
                  <span className="text-base font-black text-emerald-800 font-mono">GHS {totalCollected.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-amber-800 uppercase font-semibold block">Total Outstanding</span>
                  <span className="text-base font-black text-amber-900 font-mono">GHS {totalOutstanding.toLocaleString()}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-semibold block">Collection Rate</span>
                  <span className="text-base font-black text-emerald-950 font-mono">{collectionRate}%</span>
                </div>
              </div>

              {/* Class Recovery Table */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">1. Summary by Class / Grade Level</h4>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Class Level</th>
                      <th className="py-2 px-3">Invoices</th>
                      <th className="py-2 px-3">Billed (GHS)</th>
                      <th className="py-2 px-3">Collected (GHS)</th>
                      <th className="py-2 px-3">Outstanding (GHS)</th>
                      <th className="py-2 px-3 text-right">Recovery Rate</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {classBreakdowns.map((c) => (
                      <tr key={c.className}>
                        <td className="py-2 px-3 font-semibold text-slate-900">{c.className}</td>
                        <td className="py-2 px-3">{c.count}</td>
                        <td className="py-2 px-3 font-mono">{c.totalBilled.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono text-emerald-800 font-bold">{c.totalCollected.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono text-amber-900 font-bold">{c.totalOutstanding.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold font-mono">{c.rate}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Recent Invoices Ledger */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">2. Student Invoices Ledger (First 10 Records)</h4>
                <table className="w-full text-left border-collapse text-[11px]">
                  <thead>
                    <tr className="bg-slate-200 text-slate-800 font-bold uppercase text-[10px]">
                      <th className="py-2 px-3">Invoice #</th>
                      <th className="py-2 px-3">Student Name</th>
                      <th className="py-2 px-3">Class</th>
                      <th className="py-2 px-3">Due Date</th>
                      <th className="py-2 px-3">Total (GHS)</th>
                      <th className="py-2 px-3">Balance (GHS)</th>
                      <th className="py-2 px-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {invoices.slice(0, 10).map((inv) => (
                      <tr key={inv.id}>
                        <td className="py-2 px-3 font-mono font-bold">{inv.invoiceNo}</td>
                        <td className="py-2 px-3 font-semibold">{inv.studentName}</td>
                        <td className="py-2 px-3">{inv.className}</td>
                        <td className="py-2 px-3 font-mono text-slate-600">{inv.dueDate}</td>
                        <td className="py-2 px-3 font-mono">{inv.totalAmount.toLocaleString()}</td>
                        <td className="py-2 px-3 font-mono font-bold text-amber-900">{inv.balance.toLocaleString()}</td>
                        <td className="py-2 px-3 text-right font-bold">{inv.status}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Signatures & Certification */}
              <div className="pt-8 border-t border-slate-300 grid grid-cols-2 gap-8 text-[11px]">
                <div>
                  <div className="border-b border-slate-400 w-48 mb-1" />
                  <span className="font-bold block text-slate-900">Head of Accounts / Bursar</span>
                  <span className="text-slate-500">Grace White Dove School Complex Financial Directorate</span>
                </div>
                <div className="text-right">
                  <div className="border-b border-slate-400 w-48 ml-auto mb-1" />
                  <span className="font-bold block text-slate-900">Headmaster / Principal</span>
                  <span className="text-slate-500">Official Stamp & Seal</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 5. INVOICE SLIP MODAL */}
      {/* ============================================================= */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-900 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Outfit']">Grace White Dove School Complex Official Invoice</h3>
                <p className="text-xs text-emerald-200">Invoice #{selectedInvoice.invoiceNo}</p>
              </div>
              <button
                onClick={() => setSelectedInvoice(null)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="flex justify-between border-b border-slate-200 pb-3">
                <div>
                  <span className="text-slate-500 block">Billed To:</span>
                  <span className="font-bold text-slate-900 text-sm block">{selectedInvoice.studentName}</span>
                  <span className="text-slate-600">{selectedInvoice.className}</span>
                </div>
                <div className="text-right">
                  <span className="text-slate-500 block">Due Date:</span>
                  <span className="font-bold text-amber-800 font-mono">{selectedInvoice.dueDate}</span>
                  <span className="text-slate-500 block mt-1">{selectedInvoice.academicYear} • {selectedInvoice.term}</span>
                </div>
              </div>

              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500 text-[11px]">
                    <th className="py-2">Description</th>
                    <th className="py-2 text-right">Amount (GHS)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(
                    selectedInvoice.items && selectedInvoice.items.length > 0
                      ? selectedInvoice.items
                      : [
                          { description: 'Term Tuition & Instructional Fee', amount: Math.max(0, selectedInvoice.totalAmount - 600) },
                          { description: 'PTA & Development Levies', amount: Math.min(600, selectedInvoice.totalAmount) }
                        ]
                  ).map((item, idx) => (
                    <tr key={idx}>
                      <td className="py-2 text-slate-800 font-medium">{item.description}</td>
                      <td className="py-2 text-right font-mono font-bold">{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              <div className="border-t-2 border-slate-200 pt-3 space-y-1.5">
                <div className="flex justify-between text-slate-600">
                  <span>Total Charges:</span>
                  <span className="font-bold">GHS {selectedInvoice.totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Paid to Date:</span>
                  <span className="font-bold">GHS {selectedInvoice.paidAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-base font-black text-amber-900 border-t border-slate-200 pt-2">
                  <span>Balance Payable:</span>
                  <span>GHS {selectedInvoice.balance.toLocaleString()}</span>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 flex-wrap">
                <button
                  onClick={() => window.print()}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer border border-slate-200"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                {selectedInvoice.balance > 0 && (
                  <button
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      handleOpenReminderForInvoice(inv);
                    }}
                    className="px-4 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Bell className="w-4 h-4 text-emerald-700" /> Send Reminder Notice
                  </button>
                )}
                {selectedInvoice.balance > 0 && (
                  <button
                    onClick={() => {
                      const inv = selectedInvoice;
                      setSelectedInvoice(null);
                      setProcessFeeForm(prev => ({
                        ...prev,
                        studentId: inv.studentId,
                        invoiceId: inv.id,
                        amount: inv.balance
                      }));
                      setIsProcessFeeOpen(true);
                    }}
                    className="px-4 py-2 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold rounded-xl flex items-center gap-1.5 cursor-pointer"
                  >
                    <Banknote className="w-4 h-4" /> Process Fee Payment
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. SEND REMINDER MODAL (Communication Suite Integration) */}
      {/* ============================================================= */}
      {isSendReminderOpen && reminderTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            {/* Header */}
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold shadow-xs">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold font-['Outfit']">Send Fee Payment Reminder</h3>
                  <p className="text-xs text-emerald-200">
                    Parent Communication Suite • Notice Dispatch
                  </p>
                </div>
              </div>
              <button
                onClick={() => setIsSendReminderOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center cursor-pointer transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSendReminderSubmit} className="p-6 space-y-4 text-xs">
              {/* Student & Debt Summary Banner */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Student / Ward:</span>
                  <span className="text-sm font-bold text-slate-900">{reminderTarget.studentName}</span>
                  <span className="text-slate-500 text-[11px] block mt-0.5">{reminderTarget.className}</span>
                </div>
                <div className="text-right">
                  <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider block">Outstanding Balance:</span>
                  <span className="text-base font-black text-amber-950 font-mono">
                    GHS {reminderTarget.balanceDue.toLocaleString()}
                  </span>
                  {reminderTarget.invoiceNo && (
                    <span className="text-[10px] text-slate-500 block">Inv: {reminderTarget.invoiceNo}</span>
                  )}
                </div>
              </div>

              {/* Delivery Channel Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1.5">Dispatch Channel *</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setReminderForm(prev => ({
                        ...prev,
                        channel: 'WhatsApp',
                        recipient: reminderTarget.guardianPhone
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'WhatsApp'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReminderForm(prev => ({
                        ...prev,
                        channel: 'SMS',
                        recipient: reminderTarget.guardianPhone
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'SMS'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Smartphone className="w-3.5 h-3.5" />
                    <span>SMS Alert</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setReminderForm(prev => ({
                        ...prev,
                        channel: 'Email',
                        recipient: reminderTarget.guardianEmail
                      }));
                    }}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      reminderForm.channel === 'Email'
                        ? 'bg-emerald-800 text-white border-emerald-800 shadow-xs'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Email Notice</span>
                  </button>
                </div>
              </div>

              {/* Recipient & Contact Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Recipient Name</label>
                  <input
                    type="text"
                    required
                    value={reminderForm.recipientName}
                    onChange={(e) => setReminderForm({ ...reminderForm, recipientName: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700 outline-none"
                    placeholder="e.g. Mr. Samuel Mensah"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {reminderForm.channel === 'Email' ? 'Email Address' : 'Phone / WhatsApp Number'} *
                  </label>
                  <input
                    type="text"
                    required
                    value={reminderForm.recipient}
                    onChange={(e) => setReminderForm({ ...reminderForm, recipient: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700 outline-none font-mono"
                    placeholder={reminderForm.channel === 'Email' ? 'parent@example.com' : '0244123456'}
                  />
                </div>
              </div>

              {/* Subject (for Email or Header) */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notice Subject / Header</label>
                <input
                  type="text"
                  required
                  value={reminderForm.subject}
                  onChange={(e) => setReminderForm({ ...reminderForm, subject: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-700 outline-none font-medium"
                />
              </div>

              {/* Message Body */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-semibold text-slate-700">Reminder Message Content *</label>
                  <span className="text-[10px] text-slate-400">Communication Suite Dispatch</span>
                </div>
                <textarea
                  required
                  rows={4}
                  value={reminderForm.message}
                  onChange={(e) => setReminderForm({ ...reminderForm, message: e.target.value })}
                  className="w-full border border-slate-300 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-emerald-700 outline-none leading-relaxed text-xs resize-none"
                  placeholder="Enter reminder notice message..."
                />
              </div>

              {/* Quick Template Fillers */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[11px] text-slate-500 font-semibold">Templates:</span>
                <button
                  type="button"
                  onClick={() => {
                    setReminderForm(prev => ({
                      ...prev,
                      message: `Dear ${reminderForm.recipientName || 'Parent'}, gentle reminder from Grace White Dove School Complex: Outstanding fee balance of GHS ${reminderTarget.balanceDue.toLocaleString()} for ${reminderTarget.studentName} is due. Please settle via Mobile Money or at the bursar's desk. For inquiries: gracewhitedoveschool@gmail.com / 0244403541. Thank you.`
                    }));
                  }}
                  className="text-[10px] px-2 py-0.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md font-medium cursor-pointer"
                >
                  Gentle Reminder
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setReminderForm(prev => ({
                      ...prev,
                      message: `URGENT NOTICE: Dear ${reminderForm.recipientName || 'Parent'}, school fees for ${reminderTarget.studentName} at Grace White Dove School Complex with outstanding amount GHS ${reminderTarget.balanceDue.toLocaleString()} is overdue. Please settle immediately to avoid disruption in student academic activities.`
                    }));
                  }}
                  className="text-[10px] px-2 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-900 rounded-md font-medium cursor-pointer"
                >
                  Urgent Notice
                </button>
              </div>

              {/* Footer Actions */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsSendReminderOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-extrabold rounded-xl flex items-center gap-1.5 shadow-sm cursor-pointer transition-all"
                >
                  <Send className="w-3.5 h-3.5 text-amber-300" />
                  <span>Dispatch Reminder via {reminderForm.channel}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 6. PAYMENT RECEIPT SLIP MODAL */}
      {/* ============================================================= */}
      {selectedPaymentReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/70 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-emerald-950 text-white p-6 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-bold font-['Outfit'] flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-amber-300" />
                  Official Payment Receipt
                </h3>
                <p className="text-xs text-emerald-200">Receipt Ref #{selectedPaymentReceipt.paymentRef}</p>
              </div>
              <button
                onClick={() => setSelectedPaymentReceipt(null)}
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
                  <span className="font-bold text-slate-900">{selectedPaymentReceipt.studentName}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Date:</span>
                  <span className="font-mono font-bold text-slate-900">{selectedPaymentReceipt.date}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Payment Method:</span>
                  <span className="font-bold text-emerald-800">{selectedPaymentReceipt.paymentMethod || selectedPaymentReceipt.channel}</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[10px]">Cashier / Received By:</span>
                  <span className="font-bold text-slate-700">{selectedPaymentReceipt.receivedBy || 'Bursar'}</span>
                </div>
              </div>

              <div className="bg-emerald-950 text-white p-4 rounded-xl text-center space-y-1">
                <span className="text-[11px] text-amber-300 uppercase tracking-wider font-semibold">Amount Paid</span>
                <div className="text-2xl font-black font-mono text-white">
                  GHS {selectedPaymentReceipt.amount.toLocaleString()}
                </div>
                <span className="text-[10px] text-emerald-300 block">Status: Verified & Processed</span>
              </div>

              <div className="flex justify-end gap-2 pt-3">
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

      {/* ============================================================= */}
      {/* 7. CREATE FEE STRUCTURE MODAL */}
      {/* ============================================================= */}
      {isNewStructureOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <h3 className="font-bold text-base font-['Outfit']">Create Class Fee Structure</h3>
              <button onClick={() => setIsNewStructureOpen(false)} className="text-white hover:opacity-80 cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form onSubmit={handleCreateStructure} className="p-6 space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Structure Name *</label>
                  <input
                    type="text"
                    required
                    value={structForm.name}
                    onChange={(e) => setStructForm({ ...structForm, name: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="e.g. Primary 1 Term Fee"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Class Level</label>
                  <select
                    value={structForm.classLevel}
                    onChange={(e) => setStructForm({ ...structForm, classLevel: e.target.value })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  >
                    {classNames.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Term Fees (GHS) *</label>
                  <input
                    type="number"
                    required
                    value={structForm.termFees}
                    onChange={(e) => setStructForm({ ...structForm, termFees: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Books (Text & Exercise Books) (GHS)</label>
                  <input
                    type="number"
                    value={structForm.books}
                    onChange={(e) => setStructForm({ ...structForm, books: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Accessories (Uniforms/Kit) (GHS)</label>
                  <input
                    type="number"
                    value={structForm.accessories}
                    onChange={(e) => setStructForm({ ...structForm, accessories: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Arrears / Prior Term Default (GHS)</label>
                  <input
                    type="number"
                    value={structForm.arrears}
                    onChange={(e) => setStructForm({ ...structForm, arrears: Number(e.target.value) })}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsNewStructureOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer"
                >
                  Save Structure
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ============================================================= */}
      {/* 8. MANUAL ARREARS OVERRIDE MODAL */}
      {/* ============================================================= */}
      {isManualArrearsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="bg-emerald-900 text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-400 text-emerald-950 flex items-center justify-center font-bold">
                  <Clock className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base font-['Outfit']">Manual Arrears Override</h3>
                  <p className="text-xs text-emerald-200">Admin & Accountant Independent Debt Ledger Control</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualArrearsModalOpen(false)}
                className="text-white hover:opacity-80 p-1 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveArrearsOverride} className="p-6 space-y-4 text-xs">
              {/* Student Selector */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Student *</label>
                <select
                  value={selectedStudentForArrears?.id || ''}
                  onChange={(e) => {
                    const found = students.find((s) => s.id === e.target.value);
                    if (found) {
                      setSelectedStudentForArrears(found);
                      setOverrideArrearsAmount(found.manualArrears || 0);
                    }
                  }}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 font-semibold bg-white outline-none focus:ring-2 focus:ring-emerald-600"
                >
                  {students.map((std) => (
                    <option key={std.id} value={std.id}>
                      {std.firstName} {std.lastName} ({std.admissionNo}) — {std.className} [Current Arrears: GHS {(std.manualArrears || 0).toLocaleString()}]
                    </option>
                  ))}
                </select>
              </div>

              {/* Student Context Card */}
              {selectedStudentForArrears && (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Student Name:</span>
                    <span className="font-bold text-slate-900">{selectedStudentForArrears.firstName} {selectedStudentForArrears.lastName}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">Class / Guardian:</span>
                    <span className="font-semibold text-slate-700">{selectedStudentForArrears.className} ({selectedStudentForArrears.guardianName})</span>
                  </div>
                  <div className="flex justify-between items-center text-xs pt-1.5 border-t border-slate-200">
                    <span className="text-slate-500 font-medium">Current Registered Arrears:</span>
                    <span className="font-extrabold text-amber-700">GHS {(selectedStudentForArrears.manualArrears || 0).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                  </div>
                </div>
              )}

              {/* Arrears Amount Input */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block font-semibold text-slate-700">New Manual Arrears Balance (GHS) *</label>
                  <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    Independent from Billing
                  </span>
                </div>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">GHS</span>
                  <input
                    type="number"
                    step="any"
                    min="0"
                    required
                    value={overrideArrearsAmount}
                    onChange={(e) => setOverrideArrearsAmount(e.target.value)}
                    className="w-full pl-12 pr-3 py-2.5 border border-slate-300 rounded-lg text-sm font-extrabold text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                    placeholder="0.00"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-1">
                  This value represents previous unpaid debt carried forward. It will persist directly to the database and will not be overwritten by current term fee billing items (Term Fees, Books, Accessories).
                </p>
              </div>

              {/* Audit Reason */}
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Audit Reason / Ledger Note (Optional)</label>
                <input
                  type="text"
                  value={overrideArrearsReason}
                  onChange={(e) => setOverrideArrearsReason(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-slate-900 focus:ring-2 focus:ring-emerald-600 outline-none"
                  placeholder="e.g. Unpaid balance brought forward from Term 3"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsManualArrearsModalOpen(false)}
                  className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl shadow-sm cursor-pointer flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4 text-amber-300" />
                  Save Arrears Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
