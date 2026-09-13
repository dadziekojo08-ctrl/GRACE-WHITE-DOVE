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
    id: 'stf-000',
    staffCode: 'STF-SAD-01',
    name: 'Bernard Dadzie',
    role: 'Super Admin',
    isSuperAdmin: true,
    department: 'Executive Administration (BenDaz IT Consult)',
    email: 'dadziebernard@gmail.com',
    phone: '+233 24 000 1122',
    designation: 'Executive Director & Super Admin',
    basicSalary: 9500,
    joinedDate: '2023-01-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    qualification: 'M.Sc. Information Technology & Software Systems'
  },
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
  },
  {
    id: 'stf-002',
    staffCode: 'STF-TCH-01',
    name: 'Mr. Kwesi Mensah',
    role: 'Teacher',
    department: 'Primary Department',
    email: 'kwesi@educore.edu.gh',
    phone: '+233 24 220 3040',
    designation: 'Class 1 Teacher',
    assignedClass: 'Primary 1 (Grade 1)',
    basicSalary: 2850,
    joinedDate: '2023-09-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    qualification: 'B.Ed Basic Education'
  },
  {
    id: 'stf-003',
    staffCode: 'STF-TCH-02',
    name: 'Mrs. Akua Antwi',
    role: 'Teacher',
    department: 'Primary Department',
    email: 'akua@educore.edu.gh',
    phone: '+233 24 330 4050',
    designation: 'Class 2 Teacher',
    assignedClass: 'Primary 2 (Grade 2)',
    basicSalary: 2850,
    joinedDate: '2023-09-01',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    qualification: 'Diploma in Education'
  },
  {
    id: 'stf-004',
    staffCode: 'STF-TCH-03',
    name: 'Ms. Efua Darko',
    role: 'Teacher',
    department: 'Early Childhood Care & Development',
    email: 'efua@educore.edu.gh',
    phone: '+233 24 440 5060',
    designation: 'Creche Lead Caregiver & Teacher',
    assignedClass: 'Creche',
    basicSalary: 2600,
    joinedDate: '2024-01-10',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    qualification: 'Certificate in Early Childhood Education'
  },
  {
    id: 'stf-005',
    staffCode: 'STF-TCH-04',
    name: 'Mr. Emmanuel Osei',
    role: 'Teacher',
    department: 'Junior High School (JHS)',
    email: 'emmanuel@educore.edu.gh',
    phone: '+233 24 550 6070',
    designation: 'JHS Science & Mathematics Teacher',
    assignedClass: 'JHS 2 (Grade 8)',
    basicSalary: 3100,
    joinedDate: '2022-08-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    qualification: 'B.Sc Mathematics & Science Education'
  },
  {
    id: 'stf-006',
    staffCode: 'STF-TCH-05',
    name: 'Madam Faustina Baah',
    role: 'Teacher',
    department: 'Junior High School (JHS)',
    email: 'faustina@educore.edu.gh',
    phone: '+233 24 660 7080',
    designation: 'JHS English & Social Studies Teacher',
    assignedClass: 'JHS 1 (Grade 7)',
    basicSalary: 3100,
    joinedDate: '2022-08-15',
    status: 'Active',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    qualification: 'B.Ed English & Social Sciences'
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
    id: 'usr-super-admin-01',
    name: 'Bernard Dadzie',
    username: 'bernard',
    password: 'bendaz',
    email: 'dadziebernard@gmail.com',
    role: 'Super Admin',
    isSuperAdmin: true,
    designation: 'Executive Director & Super Admin (BenDaz IT Consult)',
    phone: '+233 24 000 1122',
    staffCode: 'STF-SAD-01',
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    lastLogin: new Date().toISOString()
  },
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
  },
  {
    id: 'usr-tch-01',
    name: 'Mr. Kwesi Mensah',
    username: 'kwesi',
    password: 'whitedove',
    email: 'kwesi@educore.edu.gh',
    role: 'Teacher',
    phone: '+233 24 220 3040',
    staffCode: 'STF-TCH-01',
    assignedClass: 'Primary 1 (Grade 1)',
    avatarUrl: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Today'
  },
  {
    id: 'usr-tch-02',
    name: 'Mrs. Akua Antwi',
    username: 'akua',
    password: 'whitedove',
    email: 'akua@educore.edu.gh',
    role: 'Teacher',
    phone: '+233 24 330 4050',
    staffCode: 'STF-TCH-02',
    assignedClass: 'Primary 2 (Grade 2)',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Today'
  },
  {
    id: 'usr-tch-03',
    name: 'Ms. Efua Darko',
    username: 'efua',
    password: 'whitedove',
    email: 'efua@educore.edu.gh',
    role: 'Teacher',
    phone: '+233 24 440 5060',
    staffCode: 'STF-TCH-03',
    assignedClass: 'Creche',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Today'
  },
  {
    id: 'usr-tch-04',
    name: 'Mr. Emmanuel Osei',
    username: 'emmanuel',
    password: 'whitedove',
    email: 'emmanuel@educore.edu.gh',
    role: 'Teacher',
    phone: '+233 24 550 6070',
    staffCode: 'STF-TCH-04',
    assignedClass: 'JHS 2 (Grade 8)',
    avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Today'
  },
  {
    id: 'usr-tch-05',
    name: 'Madam Faustina Baah',
    username: 'faustina',
    password: 'whitedove',
    email: 'faustina@educore.edu.gh',
    role: 'Teacher',
    phone: '+233 24 660 7080',
    staffCode: 'STF-TCH-05',
    assignedClass: 'JHS 1 (Grade 7)',
    avatarUrl: 'https://images.unsplash.com/photo-1567532939604-b6b5b0db2604?w=150&auto=format&fit=crop&q=80',
    lastLogin: 'Today'
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
    classTeacher: 'Ms. Efua Darko',
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
    classTeacher: 'Mr. Kwesi Mensah',
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
    classTeacher: 'Mrs. Akua Antwi',
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
    classTeacher: 'Madam Faustina Baah',
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
    classTeacher: 'Mr. Emmanuel Osei',
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
    classTeacher: 'Mr. Emmanuel Osei',
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
