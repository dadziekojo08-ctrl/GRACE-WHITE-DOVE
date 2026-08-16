export type Role = 'Admin' | 'Teacher' | 'Accountant' | 'Librarian' | 'Transport' | 'Parent' | 'Student';

export type NavigationTab = 
  | 'dashboard'
  | 'students'
  | 'admissions'
  | 'attendance'
  | 'fees'
  | 'exams'
  | 'timetable'
  | 'staff'
  | 'payroll'
  | 'library'
  | 'transport'
  | 'communication'
  | 'reports'
  | 'documents'
  | 'security';

export interface Student {
  id: string;
  admissionNo: string;
  firstName: string;
  lastName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  classId: string;
  className: string;
  section: string;
  rollNo: string;
  guardianName: string;
  guardianPhone: string;
  guardianEmail: string;
  address: string;
  status: 'Active' | 'Enrolled' | 'Graduated' | 'Suspended';
  photoUrl: string;
  joinedDate: string;
  balanceDue: number;
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  studentNumber?: string;
  applicantName: string;
  gender: 'Male' | 'Female';
  dateOfBirth: string;
  enrollmentDate?: string;
  appliedClass: string;
  parentName: string;
  parentAddress?: string;
  parentEmail: string;
  parentPhone: string;
  previousSchool?: string;
  status: 'Pending' | 'Under Review' | 'Interview Scheduled' | 'Approved' | 'Enrolled' | 'Rejected';
  submissionDate: string;
  interviewDate?: string;
  notes?: string;
  entranceExamScore?: number;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: 'Present' | 'Absent' | 'Late' | 'Excused';
  timeRecorded: string;
  remarks?: string;
}

export interface FeeStructure {
  id: string;
  name: string;
  className: string;
  term: string;
  academicYear: string;
  tuition: number;
  ict: number;
  library: number;
  pta: number;
  exam: number;
  transport?: number;
  totalAmount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  className: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid';
  dueDate: string;
  term: string;
  academicYear: string;
  issueDate: string;
}

export interface Payment {
  id: string;
  paymentRef: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'Paystack' | 'Cash' | 'Bank Transfer' | 'POS' | 'Mobile Money';
  channel: string;
  date: string;
  status: 'Success' | 'Pending' | 'Failed';
  receivedBy: string;
  remarks?: string;
}

export interface Exam {
  id: string;
  title: string;
  term: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  className: string;
  status: 'Upcoming' | 'In Progress' | 'Completed' | 'Graded';
}

export interface ExamSchedule {
  id: string;
  examId: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  invigilator: string;
  className: string;
}

export interface MarkEntry {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  score: number;
  maxMarks: number;
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  remark: string;
}

export interface TimetableEntry {
  id: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber: number;
  timeSlot: string;
  className: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface StaffMember {
  id: string;
  staffCode: string;
  name: string;
  role: 'Teacher' | 'Admin' | 'Accountant' | 'Librarian' | 'Driver' | 'Security';
  department: string;
  email: string;
  phone: string;
  designation: string;
  basicSalary: number;
  joinedDate: string;
  status: 'Active' | 'On Leave' | 'Terminated';
  avatarUrl?: string;
  photoUrl?: string;
  qualification: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  month: string;
  year: number;
  basicSalary: number;
  allowances: {
    housing: number;
    transport: number;
    medical: number;
  };
  deductions: {
    tax: number;
    pension: number;
    loan: number;
  };
  netSalary: number;
  paymentStatus: 'Paid' | 'Pending' | 'Processing';
  paymentDate?: string;
  payslipNo: string;
}

export interface Reimbursement {
  id: string;
  staffId: string;
  staffName: string;
  title: string;
  amount: number;
  category: 'Class Supplies' | 'Travel' | 'Event' | 'Maintenance' | 'Other';
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
  dateSubmitted: string;
  receiptUrl?: string;
}

export interface Book {
  id: string;
  isbn: string;
  title: string;
  author: string;
  category: string;
  copiesTotal: number;
  copiesAvailable: number;
  rackLocation: string;
  status: 'Available' | 'Low Stock' | 'Out of Stock';
}

export interface BookIssue {
  id: string;
  bookId: string;
  bookTitle: string;
  memberId: string;
  memberName: string;
  memberType: 'Student' | 'Staff';
  issueDate: string;
  dueDate: string;
  returnDate?: string;
  fineAmount: number;
  status: 'Issued' | 'Returned' | 'Overdue';
}

export interface Vehicle {
  id: string;
  vehicleNumber: string;
  vehicleModel: string;
  capacity: number;
  driverId: string;
  driverName: string;
  routeId: string;
  routeName: string;
  status: 'Active' | 'Maintenance' | 'Out of Service';
  fuelLevel: number;
  insuranceExpiry: string;
  attendantName: string;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  startPoint: string;
  endPoint: string;
  stops: string[];
  assignedVehicle: string;
  totalStudents: number;
  monthlyFee: number;
}

export interface Announcement {
  id: string;
  title: string;
  message: string;
  category: 'General' | 'Academic' | 'Holiday' | 'Emergency' | 'Finance';
  targetAudience: 'All' | 'Parents' | 'Students' | 'Staff';
  date: string;
  author: string;
  priority: 'Normal' | 'High' | 'Urgent';
}

export interface CommunicationLog {
  id: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  recipient: string;
  recipientName: string;
  subject?: string;
  message: string;
  status: 'Sent' | 'Delivered' | 'Failed';
  timestamp: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  category: 'Academic' | 'Admission' | 'Staff' | 'Legal' | 'Financial' | 'Certificates';
  fileType: string;
  fileSize: string;
  uploadedBy: string;
  uploadedDate: string;
  studentId?: string;
  staffId?: string;
  tags: string[];
}

export interface AuditLog {
  id: string;
  action: string;
  module: string;
  performedBy: string;
  userRole: string;
  timestamp: string;
  details: string;
  ipAddress: string;
}
