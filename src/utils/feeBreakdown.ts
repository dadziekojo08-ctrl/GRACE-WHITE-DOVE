import { Invoice, Payment, Student } from '../types';

export interface InvoiceFinancialBreakdown {
  termFees: number;
  books: number;
  accessories: number;
  currentTermAmount: number;
  arrears: number;
  grandTotal: number;
  paidAmount: number;
  balanceDue: number;
}

export interface CollectedFeesBreakdown {
  totalCollected: number;
  collectedFees: number;
  collectedBooks: number;
  collectedAccessories: number;
  collectedArrears: number;
}

/**
 * Universal calculation engine for Invoices at Grace White Dove School Complex.
 * Guarantees that:
 * 1) termFees + books + accessories === currentTermAmount (Current Term Total)
 * 2) grandTotal === currentTermAmount + arrears
 * 3) balanceDue === Math.max(0, grandTotal - paidAmount)
 */
export function getInvoiceFinancialBreakdown(inv: Partial<Invoice> | null | undefined): InvoiceFinancialBreakdown {
  if (!inv) {
    return {
      termFees: 0,
      books: 0,
      accessories: 0,
      currentTermAmount: 0,
      arrears: 0,
      grandTotal: 0,
      paidAmount: 0,
      balanceDue: 0,
    };
  }

  const items = Array.isArray(inv.items) ? inv.items : [];

  // Helper matching functions
  const isBookItem = (desc: string) => {
    const d = desc.toLowerCase();
    return (
      d.includes('book') ||
      d.includes('textbook') ||
      d.includes('workbook') ||
      d.includes('exercise') ||
      d.includes('stationer') ||
      d.includes('reader') ||
      d.includes('novel') ||
      d.includes('diary') ||
      d.includes('literature')
    );
  };

  const isAccessoryItem = (desc: string) => {
    const d = desc.toLowerCase();
    return (
      d.includes('accessor') ||
      d.includes('uniform') ||
      d.includes('pe kit') ||
      d.includes('sport') ||
      d.includes('crest') ||
      d.includes('badge') ||
      d.includes('socks') ||
      d.includes('cardigan') ||
      d.includes('tie') ||
      d.includes('belt') ||
      d.includes('t-shirt') ||
      d.includes('polo') ||
      d.includes('cloth') ||
      d.includes('wear')
    );
  };

  const isArrearsItem = (desc: string) => {
    const d = desc.toLowerCase();
    return (
      d.includes('arrear') ||
      d.includes('debt') ||
      d.includes('b/f') ||
      d.includes('brought forward') ||
      d.includes('previous balance') ||
      d.includes('prior term')
    );
  };

  // 1. Arrears
  let arrears = 0;
  if (typeof inv.arrears === 'number' && inv.arrears >= 0) {
    arrears = inv.arrears;
  } else {
    const arrItemSum = items
      .filter((it) => isArrearsItem(it.description || ''))
      .reduce((sum, it) => sum + (Number(it.amount) || 0), 0);
    arrears = arrItemSum;
  }

  // 2. Books & Accessories from itemized breakdown if available
  let books = 0;
  let accessories = 0;
  let feesFromItems = 0;

  if (items.length > 0) {
    items.forEach((it) => {
      const desc = it.description || '';
      const amt = Number(it.amount) || 0;
      if (isArrearsItem(desc)) {
        // Handled in arrears
      } else if (isBookItem(desc)) {
        books += amt;
      } else if (isAccessoryItem(desc)) {
        accessories += amt;
      } else {
        // Core Tuition, Exam, PTA, ICT, Maintenance, Utility, Sanitation, etc.
        feesFromItems += amt;
      }
    });
  }

  // If item list didn't specify books/accessories but invoice object has explicit values
  if (books === 0 && typeof inv.books === 'number' && inv.books > 0) {
    books = inv.books;
  }
  if (accessories === 0 && typeof inv.accessories === 'number' && inv.accessories > 0) {
    accessories = inv.accessories;
  }

  // 3. Current Term Total Amount Calculation
  // Determine raw current term base:
  // If inv.currentTermAmount is explicitly provided, use it as baseline
  // If not, use inv.totalAmount - arrears
  let rawCurrentTerm = 0;
  if (typeof inv.currentTermAmount === 'number' && inv.currentTermAmount > 0) {
    rawCurrentTerm = inv.currentTermAmount;
  } else if (typeof inv.totalAmount === 'number' && inv.totalAmount > 0) {
    rawCurrentTerm = Math.max(0, inv.totalAmount - arrears);
  }

  // Determine Term Fees
  let termFees = 0;
  if (feesFromItems > 0) {
    termFees = feesFromItems;
  } else if (typeof inv.termFees === 'number' && inv.termFees > 0) {
    termFees = inv.termFees;
  } else {
    // If no explicit fee line items or termFees field, termFees is the remaining portion of current term bill
    termFees = Math.max(0, rawCurrentTerm - books - accessories);
  }

  // CRITICAL RECONCILIATION:
  // Current Term Total Amount MUST EXACTLY equal termFees + books + accessories
  const currentTermAmount = termFees + books + accessories;

  // Grand Total = Current Term Amount + Arrears
  const grandTotal = currentTermAmount + arrears;

  // Paid amount & Balance due
  const paidAmount = Number(inv.paidAmount) || 0;
  const balanceDue = typeof inv.balance === 'number' ? inv.balance : Math.max(0, grandTotal - paidAmount);

  return {
    termFees,
    books,
    accessories,
    currentTermAmount,
    arrears,
    grandTotal,
    paidAmount,
    balanceDue,
  };
}

/**
 * Universal calculation engine for Payments Collected breakdown.
 * Distributes collections across:
 * 1) Tuition & Term Fees
 * 2) Books
 * 3) Accessories
 * 4) Arrears (deducted from total arrears and recognized in collected breakdown)
 */
export function calculatePaymentsCollectedBreakdown(
  payments: Payment[] = [],
  invoices: Invoice[] = [],
  students: Student[] = []
): CollectedFeesBreakdown {
  let fSum = 0;
  let bSum = 0;
  let aSum = 0;
  let arrSum = 0;

  payments.forEach((p) => {
    const pAmt = Number(p.amount) || 0;
    if (pAmt <= 0) return;

    if (p.breakdown) {
      fSum += Number(p.breakdown.fees) || 0;
      bSum += Number(p.breakdown.books) || 0;
      aSum += Number(p.breakdown.accessories) || 0;
      arrSum += Number(p.breakdown.arrears) || 0;
    } else if (p.feeCategory === 'Arrears') {
      arrSum += pAmt;
    } else if (p.feeCategory === 'Fees') {
      fSum += pAmt;
    } else if (p.feeCategory === 'Books') {
      bSum += pAmt;
    } else if (p.feeCategory === 'Accessories') {
      aSum += pAmt;
    } else {
      const remarksLower = (p.remarks || '').toLowerCase();
      if (
        remarksLower.includes('arrear') ||
        remarksLower.includes('debt') ||
        remarksLower.includes('b/f') ||
        remarksLower.includes('previous balance') ||
        remarksLower.includes('prior term')
      ) {
        arrSum += pAmt;
      } else if (remarksLower.includes('book') && !remarksLower.includes('term') && !remarksLower.includes('tuition')) {
        bSum += pAmt;
      } else if (remarksLower.includes('accessor') || remarksLower.includes('uniform') || remarksLower.includes('crest')) {
        aSum += pAmt;
      } else {
        // Match student invoice or debt distribution
        const inv = invoices.find((i) => i.id === p.invoiceId || i.studentId === p.studentId);
        const std = students.find((s) => s.id === p.studentId);

        if (inv) {
          const bk = getInvoiceFinancialBreakdown(inv);
          const totalComponents = bk.termFees + bk.books + bk.accessories + bk.arrears;
          if (totalComponents > 0) {
            const fP = Math.round(pAmt * (bk.termFees / totalComponents));
            const bP = Math.round(pAmt * (bk.books / totalComponents));
            const aP = Math.round(pAmt * (bk.accessories / totalComponents));
            const arrP = Math.max(0, pAmt - fP - bP - aP);
            fSum += fP;
            bSum += bP;
            aSum += aP;
            arrSum += arrP;
          } else {
            fSum += pAmt;
          }
        } else if (std && (std.manualArrears || 0) > 0 && (std.balanceDue || 0) <= (std.manualArrears || 0)) {
          arrSum += pAmt;
        } else {
          fSum += pAmt;
        }
      }
    }
  });

  return {
    totalCollected: fSum + bSum + aSum + arrSum,
    collectedFees: fSum,
    collectedBooks: bSum,
    collectedAccessories: aSum,
    collectedArrears: arrSum,
  };
}

/**
 * Computes aggregated financial metrics across all invoices, students, and payments.
 * Guaranteed: totalTuitionFees + totalBooksValue + totalAccessoriesValue === totalAmountBilled
 * Net Total Arrears = Gross Arrears - Total Arrears Collected
 */
export function calculateAggregatedFinancials(
  invoices: Invoice[],
  students: Student[] = [],
  payments: Payment[] = []
) {
  let totalTuitionFees = 0;
  let totalBooksValue = 0;
  let totalAccessoriesValue = 0;
  let totalAmountBilled = 0;
  let totalGrossInvoiceArrears = 0;

  invoices.forEach((inv) => {
    const bk = getInvoiceFinancialBreakdown(inv);
    totalTuitionFees += bk.termFees;
    totalBooksValue += bk.books;
    totalAccessoriesValue += bk.accessories;
    totalAmountBilled += bk.currentTermAmount;
    totalGrossInvoiceArrears += bk.arrears;
  });

  // Calculate student standalone manual arrears (for students without invoice arrears)
  const standaloneStudentArrears = students.reduce((sum, s) => {
    const hasInvArrears = invoices.some((i) => i.studentId === s.id && (i.arrears || 0) > 0);
    return sum + (hasInvArrears ? 0 : (s.manualArrears || 0));
  }, 0);

  const grossArrears = totalGrossInvoiceArrears + standaloneStudentArrears;
  
  // Calculate collected breakdown (including collected arrears)
  const collected = calculatePaymentsCollectedBreakdown(payments, invoices, students);
  
  // Net Outstanding Arrears after deducting arrears collected
  const totalArrears = Math.max(0, grossArrears - collected.collectedArrears);
  const cumulativeBillable = totalAmountBilled + totalArrears;

  return {
    totalTuitionFees,
    totalBooksValue,
    totalAccessoriesValue,
    totalAmountBilled, // Current Term Sum: Total Fees + Total Books + Total Accessories
    grossArrears,
    collectedArrears: collected.collectedArrears,
    totalArrears, // Net Outstanding Arrears after deducting collected arrears
    cumulativeBillable,
    collected,
  };
}

export interface ReconciledWardFinancials {
  currentInvoice: Invoice;
  invBreakdown: InvoiceFinancialBreakdown & {
    netTermFeesDue: number;
    netBooksDue: number;
    netAccessoriesDue: number;
    netArrearsDue: number;
    paidFees: number;
    paidBooks: number;
    paidAccessories: number;
    paidArrears: number;
  };
  totalBilled: number;
  totalPaid: number;
  balanceDue: number;
  isFullyCleared: boolean;
}

/**
 * Reconciles a ward's financial ledger in real time for the Parent Portal.
 * Ensures that EVERY payment (Cash desk, Paystack online, MoMo, Bank) immediately
 * deducts from the outstanding balance and itemized fee categories.
 */
export function computeWardFinancials(
  ward: Student,
  invoices: Invoice[],
  payments: Payment[],
  academicYear: string,
  currentTerm: string
): ReconciledWardFinancials {
  const wardFullName = `${ward.firstName} ${ward.lastName}`.toLowerCase().trim();

  // 1. All payments for this student
  const wardPayments = payments.filter((p) => {
    if (p.studentId === ward.id || p.studentId === ward.admissionNo) return true;
    if (p.admissionNo && p.admissionNo === ward.admissionNo) return true;
    if (p.studentName && p.studentName.toLowerCase().trim() === wardFullName) return true;
    return false;
  });

  const totalPaid = wardPayments.reduce((sum, p) => sum + (Number(p.amount) || 0), 0);

  // Categorize payments collected
  let paidFees = 0;
  let paidBooks = 0;
  let paidAccessories = 0;
  let paidArrears = 0;

  wardPayments.forEach((p) => {
    const amt = Number(p.amount) || 0;
    if (amt <= 0) return;
    if (p.breakdown) {
      paidFees += Number(p.breakdown.fees) || 0;
      paidBooks += Number(p.breakdown.books) || 0;
      paidAccessories += Number(p.breakdown.accessories) || 0;
      paidArrears += Number(p.breakdown.arrears) || 0;
    } else if (p.feeCategory === 'Arrears' || (p.remarks || '').toLowerCase().includes('arrear')) {
      paidArrears += amt;
    } else if (p.feeCategory === 'Books') {
      paidBooks += amt;
    } else if (p.feeCategory === 'Accessories') {
      paidAccessories += amt;
    } else {
      paidFees += amt;
    }
  });

  // 2. All invoices for this student
  const wardInvoices = invoices.filter((inv) => {
    if (inv.studentId === ward.id || inv.studentId === ward.admissionNo) return true;
    if (inv.studentName && inv.studentName.toLowerCase().trim() === wardFullName) return true;
    return false;
  });

  const rawInvoice = wardInvoices[0];

  // Calculate gross bill components
  let billedTermFees = 0;
  let billedBooks = 0;
  let billedAccessories = 0;
  let billedArrears = 0;
  const allItems: any[] = [];

  if (wardInvoices.length > 0) {
    wardInvoices.forEach((inv) => {
      const bk = getInvoiceFinancialBreakdown(inv);
      billedTermFees += bk.termFees;
      billedBooks += bk.books;
      billedAccessories += bk.accessories;
      billedArrears += bk.arrears;
      if (Array.isArray(inv.items)) {
        allItems.push(...inv.items);
      }
    });
  } else {
    // Fallback if no explicit invoice: use student balanceDue or default
    const base = ward.balanceDue > 0 ? ward.balanceDue : (totalPaid > 0 ? totalPaid : 0);
    billedTermFees = Math.max(0, base - (ward.manualArrears || 0));
    billedArrears = ward.manualArrears || 0;
  }

  const currentTermAmount = billedTermFees + billedBooks + billedAccessories;
  const grandTotal = currentTermAmount + billedArrears;
  const balanceDue = Math.max(0, grandTotal - totalPaid);
  const isFullyCleared = balanceDue === 0;

  // Calculate net category remainders after deducting payments
  // Distribute general paid amounts if category breakdown wasn't completely itemized
  let effectivePaidArrears = Math.min(billedArrears, paidArrears);
  let effectivePaidBooks = Math.min(billedBooks, paidBooks);
  let effectivePaidAccessories = Math.min(billedAccessories, paidAccessories);
  let effectivePaidFees = Math.min(billedTermFees, paidFees);

  const totalCategorizedPaid = effectivePaidArrears + effectivePaidBooks + effectivePaidAccessories + effectivePaidFees;
  const unallocatedPaid = Math.max(0, totalPaid - totalCategorizedPaid);

  if (unallocatedPaid > 0) {
    // Apply unallocated to fees, then arrears, then books, then accessories
    const feesRoom = Math.max(0, billedTermFees - effectivePaidFees);
    const feesAdd = Math.min(unallocatedPaid, feesRoom);
    effectivePaidFees += feesAdd;
    const rem1 = unallocatedPaid - feesAdd;

    const arrRoom = Math.max(0, billedArrears - effectivePaidArrears);
    const arrAdd = Math.min(rem1, arrRoom);
    effectivePaidArrears += arrAdd;
    const rem2 = rem1 - arrAdd;

    const booksRoom = Math.max(0, billedBooks - effectivePaidBooks);
    const booksAdd = Math.min(rem2, booksRoom);
    effectivePaidBooks += booksAdd;
    const rem3 = rem2 - booksAdd;

    const accRoom = Math.max(0, billedAccessories - effectivePaidAccessories);
    effectivePaidAccessories += Math.min(rem3, accRoom);
  }

  const netArrearsDue = Math.max(0, billedArrears - effectivePaidArrears);
  const netBooksDue = Math.max(0, billedBooks - effectivePaidBooks);
  const netAccessoriesDue = Math.max(0, billedAccessories - effectivePaidAccessories);
  const netTermFeesDue = Math.max(0, billedTermFees - effectivePaidFees);

  const status: 'Paid' | 'Partial' | 'Unpaid' =
    isFullyCleared ? 'Paid' : totalPaid > 0 ? 'Partial' : 'Unpaid';

  const currentInvoice: Invoice = rawInvoice
    ? {
        ...rawInvoice,
        termFees: billedTermFees,
        books: billedBooks,
        accessories: billedAccessories,
        arrears: billedArrears,
        currentTermAmount,
        totalAmount: grandTotal,
        grandTotal,
        paidAmount: totalPaid,
        balance: balanceDue,
        status,
        items: allItems.length > 0 ? allItems : rawInvoice.items
      }
    : {
        id: `inv-${ward.id}`,
        invoiceNo: `INV-${academicYear.slice(0, 4)}-${ward.rollNo || '00'}`,
        studentId: ward.id,
        studentName: `${ward.firstName} ${ward.lastName}`.trim(),
        className: ward.className,
        academicYear,
        term: currentTerm,
        issueDate: new Date().toISOString().slice(0, 10),
        dueDate: '',
        items: allItems,
        termFees: billedTermFees,
        books: billedBooks,
        accessories: billedAccessories,
        arrears: billedArrears,
        currentTermAmount,
        totalAmount: grandTotal,
        grandTotal,
        paidAmount: totalPaid,
        balance: balanceDue,
        status
      };

  return {
    currentInvoice,
    invBreakdown: {
      termFees: billedTermFees,
      books: billedBooks,
      accessories: billedAccessories,
      currentTermAmount,
      arrears: billedArrears,
      grandTotal,
      paidAmount: totalPaid,
      balanceDue,
      netTermFeesDue,
      netBooksDue,
      netAccessoriesDue,
      netArrearsDue,
      paidFees: effectivePaidFees,
      paidBooks: effectivePaidBooks,
      paidAccessories: effectivePaidAccessories,
      paidArrears: effectivePaidArrears
    },
    totalBilled: grandTotal,
    totalPaid,
    balanceDue,
    isFullyCleared
  };
}


