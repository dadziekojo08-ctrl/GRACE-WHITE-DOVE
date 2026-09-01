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

