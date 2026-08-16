import {
  Student,
  AdmissionApplication,
  AttendanceRecord,
  FeeStructure,
  Invoice,
  Payment,
  Exam,
  ExamSchedule,
  MarkEntry,
  TimetableEntry,
  StaffMember,
  PayrollRecord,
  Reimbursement,
  Book,
  BookIssue,
  Vehicle,
  TransportRoute,
  Announcement,
  CommunicationLog,
  DocumentItem,
  AuditLog,
  AuthUser,
  ClassRoom,
  Subject,
  CalendarEvent
} from '../types';

// ==========================================
// 1. STUDENTS (Empty for fresh entries)
// ==========================================
export const initialStudents: Student[] = [];

// ==========================================
// 2. ADMISSIONS (Empty for fresh entries)
// ==========================================
export const initialAdmissions: AdmissionApplication[] = [];

// ==========================================
// 3. ATTENDANCE (Empty for fresh entries)
// ==========================================
export const initialAttendance: AttendanceRecord[] = [];

// ==========================================
// 4. FEE STRUCTURES (Empty for fresh entries)
// ==========================================
export const initialFeeStructures: FeeStructure[] = [];

// ==========================================
// 5. INVOICES (Empty for fresh entries)
// ==========================================
export const initialInvoices: Invoice[] = [];

// ==========================================
// 6. PAYMENTS (Empty for fresh entries)
// ==========================================
export const initialPayments: Payment[] = [];

// ==========================================
// 7. EXAMINATIONS (Empty for fresh entries)
// ==========================================
export const initialExams: Exam[] = [];

export const initialExamSchedules: ExamSchedule[] = [];

export const initialMarks: MarkEntry[] = [];

// ==========================================
// 8. TIMETABLE (Empty for fresh entries)
// ==========================================
export const initialTimetable: TimetableEntry[] = [];

// ==========================================
// 9. STAFF (Principal / Admin: Diana Adu-Boahen)
// ==========================================
export const initialStaff: StaffMember[] = [
  {
    id: 'stf-001',
    staffCode: 'STF-ADM-01',
    name: 'Diana Adu-Boahen',
    role: 'Admin',
    department: 'Executive Administration',
    email: 'diana@educore.edu.gh',
    phone: '+233 24 100 2030',
    designation: 'Head of School / Principal Administrator',
    basicSalary: 0,
    joinedDate: new Date().toISOString().slice(0, 10),
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    qualification: 'M.Ed Educational Leadership & Administration'
  }
];

// ==========================================
// 10. PAYROLL & REIMBURSEMENTS (Empty)
// ==========================================
export const initialPayrolls: PayrollRecord[] = [];

export const initialReimbursements: Reimbursement[] = [];

// ==========================================
// 11. LIBRARY & INVENTORY (Empty)
// ==========================================
export const initialBooks: Book[] = [];

export const initialBookIssues: BookIssue[] = [];

// ==========================================
// 12. TRANSPORT & FLEET (Empty)
// ==========================================
export const initialVehicles: Vehicle[] = [];

export const initialRoutes: TransportRoute[] = [];

// ==========================================
// 13. ANNOUNCEMENTS & COMMUNICATIONS (Empty)
// ==========================================
export const initialAnnouncements: Announcement[] = [];

export const initialCommunicationLogs: CommunicationLog[] = [];

// ==========================================
// 14. DOCUMENTS & AUDIT LOGS
// ==========================================
export const initialDocuments: DocumentItem[] = [];

export const initialAuditLogs: AuditLog[] = [
  {
    id: 'aud-init-01',
    action: 'SYSTEM_INITIALIZED',
    module: 'System Security',
    performedBy: 'Diana Adu-Boahen',
    userRole: 'Admin',
    timestamp: new Date().toISOString().replace('T', ' ').slice(0, 19),
    details: 'Grace White Dove School Complex management system initialized for fresh data entry.',
    ipAddress: '127.0.0.1'
  }
];

// ==========================================
// 15. AUTHENTICATION & USERS
// ==========================================
export const initialAuthUsers: AuthUser[] = [
  {
    id: 'usr-admin-01',
    name: 'Diana Adu-Boahen',
    username: 'diana',
    password: 'whitedove',
    email: 'diana@educore.edu.gh',
    role: 'Admin',
    phone: '+233 24 100 2030',
    staffCode: 'STF-ADM-01',
    avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString()
  }
];

// ==========================================
// 16. CLASSROOMS & GRADE LEVELS (Ready for fresh entries)
// ==========================================
export const initialClasses: ClassRoom[] = [
  {
    id: 'cls-creche',
    name: 'Creche',
    level: 'Creche',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block A - Room 01',
    capacity: 25,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Early Numeracy', 'Rhymes & Phonics', 'Creative Play', 'Sensory Skills'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-nur1',
    name: 'Nursery 1',
    level: 'Nursery 1',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block A - Room 02',
    capacity: 30,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Numeracy & Counting', 'Letter Work & Sounds', 'Our World Our People', 'Art & Craft'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-nur2',
    name: 'Nursery 2',
    level: 'Nursery 2',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block A - Room 03',
    capacity: 30,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Numeracy & Counting', 'Phonics & Reading', 'Our World Our People', 'Writing Skills'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-kg1',
    name: 'Kindergarten 1 (KG 1)',
    level: 'Kindergarten 1 (KG 1)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block A - Room 04',
    capacity: 30,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Numeracy', 'Literacy & Reading', 'Science & Environment', 'Creative Arts'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-kg2',
    name: 'Kindergarten 2 (KG 2)',
    level: 'Kindergarten 2 (KG 2)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block A - Room 05',
    capacity: 30,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Numeracy & Math Prep', 'Literacy & Writing', 'Our World Our People', 'ICT Basics'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri1',
    name: 'Primary 1 (Grade 1)',
    level: 'Primary 1 (Grade 1)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 101',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Natural Science', 'Our World Our People', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri2',
    name: 'Primary 2 (Grade 2)',
    level: 'Primary 2 (Grade 2)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 102',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Natural Science', 'Our World Our People', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri3',
    name: 'Primary 3 (Grade 3)',
    level: 'Primary 3 (Grade 3)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 103',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Natural Science', 'Our World Our People', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri4',
    name: 'Primary 4 (Grade 4)',
    level: 'Primary 4 (Grade 4)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 201',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri5',
    name: 'Primary 5 (Grade 5)',
    level: 'Primary 5 (Grade 5)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 202',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-pri6',
    name: 'Primary 6 (Grade 6)',
    level: 'Primary 6 (Grade 6)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block B - Room 203',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Mathematics', 'English Language', 'Integrated Science', 'Social Studies', 'Religious & Moral Education', 'Ghanaian Language', 'Creative Arts', 'Computing (ICT)', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-jhs1',
    name: 'JHS 1 (Grade 7)',
    level: 'JHS 1 (Grade 7)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block C - Room 301',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Core Mathematics', 'Integrated Science', 'English Language', 'Social Studies', 'Information & Comms Tech (ICT)', 'Religious & Moral Education', 'Ghanaian Language & Culture', 'Career Technology', 'Creative Arts & Design', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-jhs2',
    name: 'JHS 2 (Grade 8)',
    level: 'JHS 2 (Grade 8)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block C - Room 302',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Core Mathematics', 'Integrated Science', 'English Language', 'Social Studies', 'Information & Comms Tech (ICT)', 'Religious & Moral Education', 'Ghanaian Language & Culture', 'Career Technology', 'Creative Arts & Design', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  },
  {
    id: 'cls-jhs3',
    name: 'JHS 3 (Grade 9)',
    level: 'JHS 3 (Grade 9)',
    stream: 'A',
    classTeacher: '',
    roomNumber: 'Block C - Room 303',
    capacity: 35,
    enrolledCount: 0,
    classPrefect: '',
    subjects: ['Core Mathematics', 'Integrated Science', 'English Language', 'Social Studies', 'Information & Comms Tech (ICT)', 'Religious & Moral Education', 'Ghanaian Language & Culture', 'Career Technology', 'Creative Arts & Design', 'French'],
    averageAttendanceRate: 0,
    termAverageScore: 0
  }
];

// ==========================================
// 17. SUBJECTS (Standard Curriculum Ready for Teaching Allocation)
// ==========================================
export const initialSubjects: Subject[] = [
  {
    id: 'subj-001',
    name: 'Core Mathematics',
    code: 'MATH-101',
    classLevel: 'All Classes',
    department: 'Mathematics & Computing',
    teacher: '',
    periodsPerWeek: 5,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Core mathematics curriculum covering numbers, operations, geometry, algebra, and statistics.'
  },
  {
    id: 'subj-002',
    name: 'English Language & Literacy',
    code: 'ENG-102',
    classLevel: 'All Classes',
    department: 'Languages & Humanities',
    teacher: '',
    periodsPerWeek: 5,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Grammar, comprehension, composition, vocabulary development, and speech work.'
  },
  {
    id: 'subj-003',
    name: 'Integrated Science',
    code: 'SCI-103',
    classLevel: 'Primary & JHS',
    department: 'Science & STEM',
    teacher: '',
    periodsPerWeek: 4,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Comprehensive natural and physical sciences covering living things, materials, and systems.'
  },
  {
    id: 'subj-004',
    name: 'Computing & ICT',
    code: 'ICT-104',
    classLevel: 'All Classes',
    department: 'Mathematics & Computing',
    teacher: '',
    periodsPerWeek: 3,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Information and communication technology, practical computer literacy, and digital skills.'
  },
  {
    id: 'subj-005',
    name: 'Social Studies & Citizenship',
    code: 'SOC-105',
    classLevel: 'Primary & JHS',
    department: 'Languages & Humanities',
    teacher: '',
    periodsPerWeek: 3,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Civic education, geography, history, environment, and social values in Ghana.'
  },
  {
    id: 'subj-006',
    name: 'Religious & Moral Education (RME)',
    code: 'RME-106',
    classLevel: 'All Classes',
    department: 'Languages & Humanities',
    teacher: '',
    periodsPerWeek: 2,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Moral and character education, religion, and ethics.'
  },
  {
    id: 'subj-007',
    name: 'French Language',
    code: 'FRE-107',
    classLevel: 'Primary & JHS',
    department: 'Languages & Humanities',
    teacher: '',
    periodsPerWeek: 2,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Basic to intermediate French conversation, reading, and written expression.'
  },
  {
    id: 'subj-008',
    name: 'Creative Arts & Design',
    code: 'CAD-108',
    classLevel: 'All Classes',
    department: 'Vocational & Arts',
    teacher: '',
    periodsPerWeek: 2,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Visual arts, performing arts, drawing, modeling, and crafts.'
  },
  {
    id: 'subj-009',
    name: 'Physical & Health Education',
    code: 'PHE-109',
    classLevel: 'All Classes',
    department: 'Sports & Wellness',
    teacher: '',
    periodsPerWeek: 2,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Physical training, athletics, health education, and fitness.'
  },
  {
    id: 'subj-010',
    name: 'Ghanaian Language & Culture',
    code: 'GHL-110',
    classLevel: 'All Classes',
    department: 'Languages & Humanities',
    teacher: '',
    periodsPerWeek: 3,
    syllabusCovered: 0,
    currentTopic: '',
    textbook: '',
    totalStudents: 0,
    description: 'Local language literacy, cultural heritage, and traditional values.'
  }
];

// ==========================================
// 18. CALENDAR (Empty for fresh entries)
// ==========================================
export const initialCalendarEvents: CalendarEvent[] = [];
