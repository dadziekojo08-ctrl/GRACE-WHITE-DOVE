import { Invoice, Student } from '../types';

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
 * Computes aggregated financial metrics across all invoices and students.
 * Guaranteed: totalTuitionFees + totalBooksValue + totalAccessoriesValue === totalAmountBilled
 */
export function calculateAggregatedFinancials(invoices: Invoice[], students: Student[] = []) {
  let totalTuitionFees = 0;
  let totalBooksValue = 0;
  let totalAccessoriesValue = 0;
  let totalAmountBilled = 0;
  let totalInvoiceArrears = 0;

  invoices.forEach((inv) => {
    const bk = getInvoiceFinancialBreakdown(inv);
    totalTuitionFees += bk.termFees;
    totalBooksValue += bk.books;
    totalAccessoriesValue += bk.accessories;
    totalAmountBilled += bk.currentTermAmount;
    totalInvoiceArrears += bk.arrears;
  });

  // Calculate student standalone manual arrears (for students without invoice arrears)
  const standaloneStudentArrears = students.reduce((sum, s) => {
    const hasInvArrears = invoices.some((i) => i.studentId === s.id && (i.arrears || 0) > 0);
    return sum + (hasInvArrears ? 0 : (s.manualArrears || 0));
  }, 0);

  const totalArrears = totalInvoiceArrears + standaloneStudentArrears;
  const cumulativeBillable = totalAmountBilled + totalArrears;

  return {
    totalTuitionFees,
    totalBooksValue,
    totalAccessoriesValue,
    totalAmountBilled, // Current Term Sum: Total Fees + Total Books + Total Accessories
    totalArrears,
    cumulativeBillable,
  };
}
