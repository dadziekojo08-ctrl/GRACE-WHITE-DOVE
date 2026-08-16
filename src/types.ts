export type Role = 'Admin' | 'Teacher' | 'Accountant' | 'Librarian' | 'Transport' | 'Parent' | 'Driver' | 'System';

export interface AuthUser {
  id: string;
  name: string;
  username?: string;
  password?: string;
  email: string;
  role: Role;
  avatarUrl?: string;
  photoUrl?: string;
  phone?: string;
  staffCode?: string;
  studentId?: string;
  lastLogin?: string;
}

export type AuthMode = 'login' | 'register' | 'forgot-password' | 'reset-password' | 'otp-verify';

export type NavigationTab =
  | 'dashboard'
  | 'my-child'
  | 'students'
  | 'classes'
  | 'subjects'
  | 'timetable'
  | 'attendance'
  | 'exams'
  | 'library'
  | 'calendar'
  | 'announcements'
  | 'admissions'
  | 'fees'
  | 'staff'
  | 'payroll'
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
  classTeacher?: string;
  section: string;
  rollNo: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  address: string;
  status: 'Active' | 'Inactive' | 'Suspended' | 'Alumni' | 'Graduated';
  photoUrl: string;
  balanceDue: number;
  joinedDate: string;
  enrollmentDate?: string;
}

export interface ClassRoom {
  id: string;
  name: string;
  level: string;
  stream: string;
  section?: string;
  classTeacher: string;
  roomNumber: string;
  capacity: number;
  enrolledCount: number;
  classPrefect?: string;
  subjects?: string[];
  averageAttendanceRate?: number;
  termAverageScore?: number;
  academicYear?: string;
}

export interface Subject {
  id: string;
  name: string;
  code: string;
  classLevel: string;
  department: string;
  teacher: string;
  periodsPerWeek: number;
  syllabusCovered?: number;
  syllabusProgress?: number;
  currentTopic?: string;
  textbook?: string;
  totalStudents?: number;
  description?: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  category: 'Academic' | 'Holiday' | 'Sports' | 'Examination' | 'Meeting' | 'Special' | 'Cultural';
  startDate: string;
  endDate?: string;
  time?: string;
  location: string;
  description: string;
  targetAudience: 'All' | 'Teachers' | 'Students' | 'Parents';
  isImportant?: boolean;
  isHoliday?: boolean;
}

export interface AdmissionApplication {
  id: string;
  applicationNo: string;
  studentNumber?: string;
  applicantName: string;
  gender: 'Male' | 'Female' | 'Other';
  dateOfBirth: string;
  enrollmentDate?: string;
  appliedClass: string;
  parentName: string;
  parentAddress?: string;
  parentEmail: string;
  parentPhone: string;
  submissionDate: string;
  status: 'Pending' | 'Interview' | 'Interview Scheduled' | 'Approved' | 'Rejected' | 'Enrolled';
  entranceScore?: number;
  entranceExamScore?: number;
  previousSchool?: string;
  interviewDate?: string;
  notes?: string;
}

export interface AttendanceRecord {
  id: string;
  date: string;
  studentId: string;
  studentName: string;
  classId: string;
  className: string;
  status: 'Present' | 'Late' | 'Absent' | 'Excused';
  timeRecorded: string;
  remarks?: string;
}

export interface FeeStructureBreakdown {
  termFees?: number;
  books?: number;
  accessories?: number;
  arrears?: number;
  tuition?: number;
  tuitionFee?: number;
  developmentLevy?: number;
  ict?: number;
  ictLabFee?: number;
  library?: number;
  libraryFee?: number;
  scienceLab?: number;
  labFee?: number;
  sports?: number;
  sportsFee?: number;
  ptaLevy?: number;
  ptaDues?: number;
  [key: string]: number | undefined;
}

export interface FeeStructure {
  id: string;
  name: string;
  classLevel?: string;
  className?: string;
  term: string;
  academicYear: string;
  dueDate?: string;
  termFees?: number;
  books?: number;
  accessories?: number;
  arrears?: number;
  tuition?: number;
  tuitionFee?: number;
  developmentLevy?: number;
  ict?: number;
  ictLabFee?: number;
  library?: number;
  libraryFee?: number;
  scienceLab?: number;
  labFee?: number;
  sports?: number;
  sportsFee?: number;
  pta?: number;
  ptaLevy?: number;
  ptaDues?: number;
  exam?: number;
  transport?: number;
  totalAmount: number;
  breakdown?: FeeStructureBreakdown;
}

export interface InvoiceItem {
  description: string;
  amount: number;
}

export interface Invoice {
  id: string;
  invoiceNo: string;
  studentId: string;
  studentName: string;
  className: string;
  term: string;
  academicYear: string;
  issueDate: string;
  dueDate: string;
  totalAmount: number;
  paidAmount: number;
  balance: number;
  status: 'Paid' | 'Partial' | 'Unpaid' | 'Overdue' | 'Partially Paid';
  items?: InvoiceItem[];
}

export interface Payment {
  id: string;
  paymentRef: string;
  reference?: string;
  receiptNo?: string;
  invoiceId: string;
  studentId: string;
  studentName: string;
  amount: number;
  paymentMethod: 'Paystack' | 'Bank Transfer' | 'Cash' | 'Cheque' | 'Mobile Money';
  date: string;
  paymentDate?: string;
  status: 'Success' | 'Pending' | 'Failed';
  payerEmail?: string;
  payerPhone?: string;
  channel?: string;
  receivedBy?: string;
  remarks?: string;
}

export interface Exam {
  id: string;
  title: string;
  className?: string;
  term: string;
  academicYear: string;
  startDate: string;
  endDate: string;
  status: 'Upcoming' | 'Ongoing' | 'Graded' | 'Published';
}

export interface ExamSchedule {
  id: string;
  examId: string;
  className: string;
  subject: string;
  date: string;
  startTime: string;
  endTime: string;
  room: string;
  maxMarks?: number;
  invigilator?: string;
}

export interface MarkEntry {
  id: string;
  examId: string;
  studentId: string;
  studentName: string;
  className: string;
  subject: string;
  subjectName?: string;
  score: number;
  totalScore?: number;
  classScore?: number;
  examScore?: number;
  maxMarks?: number;
  grade: string;
  remark?: string;
  remarks?: string;
}

export interface TimetableEntry {
  id: string;
  className: string;
  day: 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday';
  periodNumber?: number;
  timeSlot: string;
  subject: string;
  teacherName: string;
  room: string;
}

export interface StaffMember {
  id: string;
  staffCode: string;
  name: string;
  email: string;
  phone: string;
  role: 'Teacher' | 'Admin' | 'Accountant' | 'Librarian' | 'Transport' | 'Driver';
  department: string;
  designation: string;
  qualification: string;
  joinedDate: string;
  basicSalary: number;
  status: 'Active' | 'On Leave' | 'Terminated';
  photoUrl?: string;
  avatarUrl?: string;
}

export interface PayrollRecord {
  id: string;
  staffId: string;
  staffName: string;
  role: string;
  month: string;
  year: number;
  basicSalary: number;
  grossSalary?: number;
  status?: 'Paid' | 'Pending' | 'Processing';
  allowances: {
    housing: number;
    transport: number;
    medical: number;
    [key: string]: number;
  };
  deductions: {
    tax: number;
    pension: number;
    loan: number;
    [key: string]: number;
  };
  netSalary: number;
  paymentStatus: 'Paid' | 'Pending';
  paymentDate?: string;
  payslipNo: string;
}

export interface Reimbursement {
  id: string;
  staffId: string;
  staffName: string;
  title?: string;
  category: string;
  amount: number;
  description?: string;
  dateSubmitted: string;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Disbursed';
}

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  totalCopies?: number;
  copiesTotal?: number;
  copiesAvailable: number;
  shelfLocation?: string;
  rackLocation?: string;
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
  vehicleModel?: string;
  model?: string;
  type?: string;
  capacity: number;
  driverId?: string;
  driverName: string;
  driverPhone?: string;
  routeId?: string;
  routeName?: string;
  fuelLevel?: number;
  attendantName?: string;
  insuranceExpiry: string;
  status: 'Active' | 'Maintenance' | 'Out of Service';
}

export interface BusStop {
  stopName: string;
  pickupTime: string;
}

export interface TransportRoute {
  id: string;
  routeName: string;
  startPoint?: string;
  endPoint?: string;
  vehicleNo?: string;
  vehicleNumber?: string;
  assignedVehicle?: string;
  driverName?: string;
  driverPhone?: string;
  attendantName?: string;
  attendantPhone?: string;
  studentsAssigned?: number;
  totalStudents?: number;
  monthlyFee?: number;
  stops: (string | BusStop)[];
}

export interface Announcement {
  id: string;
  title: string;
  message?: string;
  content?: string;
  category?: string;
  targetAudience: 'All' | 'Parents' | 'Teachers' | 'Students';
  priority: 'Normal' | 'Medium' | 'High' | 'Urgent';
  author?: string;
  postedBy?: string;
  date: string;
  pinned?: boolean;
}

export interface CommunicationLog {
  id: string;
  channel: 'Email' | 'WhatsApp' | 'SMS';
  recipient: string;
  recipientName: string;
  subject?: string;
  message: string;
  timestamp: string;
  status: 'Delivered' | 'Failed' | 'Queued' | 'Sent';
}

export type SchoolDocument = DocumentItem;

export interface DocumentItem {
  id: string;
  title: string;
  category:
    | 'Academic'
    | 'Legal'
    | 'Admission'
    | 'Financial'
    | 'Curriculum & Syllabi'
    | 'School Policies & Handbooks'
    | 'Student Records & Medicals'
    | 'Financial Audits'
    | 'Administrative Forms';
  fileType: string;
  fileSize: string;
  fileUrl?: string;
  uploadedBy: string;
  uploadedDate?: string;
  uploadDate?: string;
  studentId?: string;
  tags?: string[];
  accessRole?: 'All' | 'Staff Only' | 'Admin Only';
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
