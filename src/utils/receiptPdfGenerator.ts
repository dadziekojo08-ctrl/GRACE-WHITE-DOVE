import { jsPDF } from 'jspdf';
import { Payment, Student } from '../types';

export interface ReceiptData {
  payment: Payment;
  student?: Student | null;
  academicYear?: string;
  term?: string;
}

/**
 * Generates and downloads a clean, professional, branded PDF payment receipt
 * for Grace White Dove School Complex.
 */
export function downloadPaymentReceiptPdf({
  payment,
  student,
  academicYear = '2025/2026',
  term = 'Term 2'
}: ReceiptData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const studentName =
    payment.studentName ||
    (student ? `${student.firstName} ${student.lastName}` : 'Student');
  const admissionNo =
    payment.admissionNo || student?.admissionNo || payment.studentId || 'N/A';
  const className = payment.className || student?.className || 'N/A';
  const guardianName = student?.guardianName || 'Parent / Guardian';
  const guardianPhone = student?.guardianPhone || payment.payerPhone || 'N/A';

  const refCode =
    payment.paymentRef ||
    payment.receiptNo ||
    payment.reference ||
    `REC-${payment.id.slice(-6).toUpperCase()}`;

  const paymentDate = payment.paymentDate || payment.date || new Date().toISOString().slice(0, 10);
  const paymentMethod = payment.channel || payment.paymentMethod || 'Cash Desk';
  const amountPaid = Number(payment.amount) || 0;

  const prevBalance =
    typeof payment.previousBalance === 'number'
      ? payment.previousBalance
      : student
      ? student.balanceDue + amountPaid
      : amountPaid;

  const remainingBalance =
    typeof payment.balanceAfterPayment === 'number'
      ? payment.balanceAfterPayment
      : Math.max(0, prevBalance - amountPaid);

  const feeCategory = payment.feeCategory || 'School Fees';

  // ---------------- Page Configuration ----------------
  const pageWidth = doc.internal.pageSize.getWidth();
  const margin = 18;
  const contentWidth = pageWidth - margin * 2;
  let y = 16;

  // ---------------- Header Institutional Banner ----------------
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(margin, y, contentWidth, 30, 'F');

  // Decorative gold line under header
  doc.setFillColor(217, 119, 6); // Amber 600
  doc.rect(margin, y + 30, contentWidth, 2, 'F');

  // Institution title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('GRACE WHITE DOVE SCHOOL COMPLEX', pageWidth / 2, y + 10, { align: 'center' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(254, 240, 138); // Pale amber
  doc.text('Excellence in Knowledge & Character • Cape Coast, Central Region, Ghana', pageWidth / 2, y + 16, {
    align: 'center'
  });

  doc.setFontSize(8);
  doc.setTextColor(209, 250, 229); // Pale emerald
  doc.text('Tel: +233 (0) 24 440 3541  |  Email: whitedovesch2014@gmail.com', pageWidth / 2, y + 22, {
    align: 'center'
  });

  y += 40;

  // ---------------- Receipt Title & Voucher Meta ----------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.setTextColor(6, 78, 59);
  doc.text('OFFICIAL PAYMENT RECEIPT VOUCHER', margin, y);

  // Status pill
  doc.setFillColor(209, 250, 229); // Emerald 100
  doc.roundedRect(pageWidth - margin - 35, y - 5, 35, 7, 2, 2, 'F');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70); // Emerald 800
  doc.text('VERIFIED & PAID', pageWidth - margin - 17.5, y - 0.5, { align: 'center' });

  y += 7;

  // Horizontal divider
  doc.setDrawColor(226, 232, 240); // Slate 200
  doc.setLineWidth(0.5);
  doc.line(margin, y, pageWidth - margin, y);

  y += 6;

  // Receipt Number & Date Box
  doc.setFillColor(248, 250, 252); // Slate 50
  doc.rect(margin, y, contentWidth, 14, 'F');
  doc.setDrawColor(203, 213, 225);
  doc.rect(margin, y, contentWidth, 14, 'S');

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Receipt Voucher No:', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`#${refCode}`, margin + 38, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Transaction Date:', pageWidth / 2 + 10, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(paymentDate, pageWidth / 2 + 42, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Academic Period:', margin + 4, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${term}, ${academicYear}`, margin + 38, y + 11);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Payment Method:', pageWidth / 2 + 10, y + 11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(paymentMethod, pageWidth / 2 + 42, y + 11);

  y += 20;

  // ---------------- Student & Guardian Particulars ----------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('STUDENT & GUARDIAN PARTICULARS', margin, y);

  y += 4;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(226, 232, 240);
  doc.rect(margin, y, contentWidth, 24);

  // Left col: Student details
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Student Full Name:', margin + 4, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(studentName, margin + 40, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Student ID / Adm No:', margin + 4, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(admissionNo, margin + 40, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Enrolled Class:', margin + 4, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(className, margin + 40, y + 20);

  // Right col: Guardian details
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Parent / Guardian:', pageWidth / 2 + 10, y + 6);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(guardianName, pageWidth / 2 + 42, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Contact Phone:', pageWidth / 2 + 10, y + 13);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(guardianPhone, pageWidth / 2 + 42, y + 13);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text('Account Status:', pageWidth / 2 + 10, y + 20);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(remainingBalance === 0 ? 6 : 180, remainingBalance === 0 ? 95 : 83, remainingBalance === 0 ? 70 : 9);
  doc.text(remainingBalance === 0 ? 'Fully Cleared' : 'Active Balance', pageWidth / 2 + 42, y + 20);

  y += 30;

  // ---------------- Transaction Breakdown Table ----------------
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(30, 41, 59);
  doc.text('PAYMENT ALLOCATION BREAKDOWN', margin, y);

  y += 4;

  // Table header
  doc.setFillColor(6, 78, 59); // Emerald 900
  doc.rect(margin, y, contentWidth, 7, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(255, 255, 255);
  doc.text('Item Description / Fee Category', margin + 4, y + 5);
  doc.text('Ledger Allocation', margin + 95, y + 5);
  doc.text('Amount Credited (GHS)', pageWidth - margin - 4, y + 5, { align: 'right' });

  y += 7;

  // Row 1: The payment item
  doc.setFillColor(248, 250, 252);
  doc.rect(margin, y, contentWidth, 9, 'F');
  doc.setDrawColor(226, 232, 240);
  doc.line(margin, y + 9, pageWidth - margin, y + 9);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(15, 23, 42);
  const descriptionText =
    payment.notes ||
    `Payment for ${feeCategory} (${term})`;
  doc.text(descriptionText, margin + 4, y + 6);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  doc.text(feeCategory, margin + 95, y + 6);

  doc.setFont('helvetica', 'bold');
  doc.setTextColor(6, 95, 70);
  doc.text(amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 }), pageWidth - margin - 4, y + 6, {
    align: 'right'
  });

  y += 14;

  // ---------------- Financial Statement Summary ----------------
  const summaryBoxWidth = 85;
  const summaryX = pageWidth - margin - summaryBoxWidth;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(203, 213, 225);
  doc.rect(summaryX, y, summaryBoxWidth, 34);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(100, 116, 139);
  doc.text('Previous Outstanding Balance:', summaryX + 4, y + 7);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`GHS ${prevBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 7, {
    align: 'right'
  });

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(6, 95, 70);
  doc.text('Total Amount Paid (Credited):', summaryX + 4, y + 15);
  doc.setFont('helvetica', 'bold');
  doc.text(`- GHS ${amountPaid.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, pageWidth - margin - 4, y + 15, {
    align: 'right'
  });

  doc.setDrawColor(226, 232, 240);
  doc.line(summaryX + 4, y + 19, pageWidth - margin - 4, y + 19);

  // Big Net Outstanding Box
  doc.setFillColor(6, 78, 59);
  doc.rect(summaryX + 2, y + 21, summaryBoxWidth - 4, 10, 'F');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8.5);
  doc.setTextColor(255, 255, 255);
  doc.text('Net Balance Payable:', summaryX + 6, y + 27.5);
  doc.setFontSize(9.5);
  doc.setTextColor(254, 240, 138); // Pale amber
  doc.text(
    `GHS ${remainingBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    pageWidth - margin - 6,
    y + 27.5,
    { align: 'right' }
  );

  // Left side note box
  doc.setFillColor(240, 253, 244); // Emerald 50
  doc.roundedRect(margin, y, summaryBoxWidth - 10, 34, 2, 2, 'F');
  doc.setDrawColor(187, 247, 208);
  doc.roundedRect(margin, y, summaryBoxWidth - 10, 34, 2, 2, 'S');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(6, 95, 70);
  doc.text('ACCOUNTS RECONCILIATION NOTE', margin + 4, y + 7);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7.5);
  doc.setTextColor(51, 65, 85);
  doc.text('This receipt was officially registered in the', margin + 4, y + 13);
  doc.text('school bursar ledger. Payments are immediately', margin + 4, y + 18);
  doc.text('credited toward term fees and verified electronically.', margin + 4, y + 23);
  doc.text(`Cashier / Officer: ${payment.recordedBy || 'Accounts Bureau'}`, margin + 4, y + 28);

  y += 42;

  // ---------------- Signatures & Verification Seal ----------------
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);

  // Left signature line: Accounts Officer
  const sigWidth = 60;
  doc.line(margin, y + 14, margin + sigWidth, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Bursar / Cashier Signature', margin, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Grace White Dove Accounts Dept.', margin, y + 22);

  // Center: School Stamp circle
  const centerX = pageWidth / 2;
  doc.setDrawColor(16, 185, 129); // Emerald 500
  doc.setLineWidth(1);
  doc.circle(centerX, y + 10, 12, 'S');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(6);
  doc.setTextColor(6, 95, 70);
  doc.text('OFFICIAL VOUCHER', centerX, y + 8, { align: 'center' });
  doc.text('PAID & AUDITED', centerX, y + 11.5, { align: 'center' });
  doc.text('GWDS COMPLEX', centerX, y + 15, { align: 'center' });

  // Right signature line: Head of School / Auditor
  const rightSigX = pageWidth - margin - sigWidth;
  doc.setDrawColor(203, 213, 225);
  doc.setLineWidth(0.5);
  doc.line(rightSigX, y + 14, rightSigX + sigWidth, y + 14);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(30, 41, 59);
  doc.text('Headmaster / Auditor', rightSigX, y + 18);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(100, 116, 139);
  doc.text('Verified Computerised Ledger', rightSigX, y + 22);

  y += 30;

  // ---------------- Footer Disclaimer ----------------
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(148, 163, 184);
  doc.text(
    `Official electronic payment slip generated by Grace White Dove School Management System on ${new Date().toLocaleDateString(
      'en-GB'
    )} at ${new Date().toLocaleTimeString('en-GB')}. Receipt verification code: ${refCode}.`,
    pageWidth / 2,
    y,
    { align: 'center' }
  );

  // ---------------- Trigger File Download ----------------
  const safeFilename = `Receipt_${refCode.replace(/[^a-zA-Z0-9_-]/g, '_')}_${studentName.replace(/[^a-zA-Z0-9]/g, '_')}.pdf`;
  doc.save(safeFilename);
}
