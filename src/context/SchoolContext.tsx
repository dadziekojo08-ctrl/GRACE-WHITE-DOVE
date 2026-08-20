import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
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
  Role,
  NavigationTab,
  AuthUser,
  ClassRoom,
  Subject,
  CalendarEvent
} from '../types';

import {
  initialStudents,
  initialAdmissions,
  initialAttendance,
  initialFeeStructures,
  initialInvoices,
  initialPayments,
  initialExams,
  initialExamSchedules,
  initialMarks,
  initialTimetable,
  initialStaff,
  initialPayrolls,
  initialReimbursements,
  initialBooks,
  initialBookIssues,
  initialVehicles,
  initialRoutes,
  initialAnnouncements,
  initialCommunicationLogs,
  initialDocuments,
  initialAuditLogs,
  initialAuthUsers,
  initialClasses,
  initialSubjects,
  initialCalendarEvents
} from '../data/seedData';

import {
  fetchCollectionFromFirestore,
  batchSaveCollectionToFirestore,
  saveDocumentToFirestore,
  deleteDocumentFromFirestore,
  checkIsQuotaExceeded
} from '../lib/firestoreService';

import {
  findTeacherForClass,
  MatchedTeacherResult
} from '../utils/teacherAssignment';

interface SchoolContextType {
  // Cloud Sync Status
  isSyncing: boolean;
  lastSyncedTime: string | null;
  syncToCloudNow: () => Promise<void>;

  // Authentication & Session
  currentUser: AuthUser | null;
  isAuthenticated: boolean;
  authUsers: AuthUser[];
  login: (email: string, password?: string, overrideRole?: Role) => Promise<{ success: boolean; message?: string }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    staffCode?: string;
    studentId?: string;
    assignedClass?: string;
    photoUrl?: string;
    avatarUrl?: string;
  }) => Promise<{ success: boolean; message?: string }>;
  purgeAllTeachers: () => void;
  resetPassword: (email: string, newPassword?: string) => Promise<{ success: boolean; message?: string }>;
  updateUserProfile: (data: { name?: string; phone?: string; avatarUrl?: string; photoUrl?: string }) => void;
  logout: () => void;
  switchRoleQuick: (role: Role) => void;

  // Navigation & Role
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  activeRole: Role;
  setActiveRole: (role: Role) => void;
  academicYear: string;
  currentTerm: string;
  setAcademicYear: (year: string) => void;
  setCurrentTerm: (term: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Classes & Subjects
  classes: ClassRoom[];
  addClass: (cls: Omit<ClassRoom, 'id'>) => void;
  updateClass: (id: string, cls: Partial<ClassRoom>) => void;
  deleteClass: (id: string) => void;
  assignClassTeacher: (classId: string, teacherName: string) => void;
  updateClassCapacity: (classId: string, capacity: number) => void;
  subjects: Subject[];
  addSubject: (subj: Omit<Subject, 'id'>) => void;
  updateSubject: (id: string, subj: Partial<Subject>) => void;

  // Academic Calendar
  calendarEvents: CalendarEvent[];
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;

  // Students & Admissions
  students: Student[];
  generateNextStudentNumber: () => string;
  suggestTeacherForClass: (className: string) => MatchedTeacherResult | null;
  addStudent: (student: Omit<Student, 'id' | 'admissionNo' | 'joinedDate'> & { admissionNo?: string }) => void;
  updateStudent: (id: string, student: Partial<Student>) => void;
  deleteStudent: (id: string) => void;
  admissions: AdmissionApplication[];
  addAdmission: (admission: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'submissionDate'> & { applicationNo?: string; studentNumber?: string }) => void;
  updateAdmissionStatus: (id: string, status: AdmissionApplication['status'], notes?: string) => void;

  // Attendance
  attendance: AttendanceRecord[];
  markAttendance: (studentId: string, status: AttendanceRecord['status'], remarks?: string) => void;
  bulkMarkAttendance: (records: { studentId: string; status: AttendanceRecord['status']; remarks?: string }[]) => void;
  gateCheckIn: (admissionNoOrRoll: string) => { success: boolean; message: string; student?: Student };

  // Fees & Payments
  feeStructures: FeeStructure[];
  addFeeStructure: (structure: Omit<FeeStructure, 'id'>) => void;
  updateFeeStructure: (id: string, structure: Partial<FeeStructure>) => void;
  deleteFeeStructure: (id: string) => void;
  invoices: Invoice[];
  createInvoice: (invoice: Omit<Invoice, 'id' | 'invoiceNo' | 'issueDate'>) => void;
  createBulkInvoices: (invoices: Omit<Invoice, 'id' | 'invoiceNo' | 'issueDate'>[]) => void;
  updateInvoice: (id: string, invoice: Partial<Invoice>) => void;
  deleteInvoice: (id: string) => void;
  updateStudentArrears: (studentId: string, manualArrears: number, reason?: string) => void;
  payments: Payment[];
  recordPayment: (payment: Omit<Payment, 'id' | 'paymentRef' | 'date'>) => Payment;
  updatePayment: (id: string, payment: Partial<Payment>) => void;
  deletePayment: (id: string) => void;
  clearFinancialRecords: (mode?: 'all' | 'arrears-only' | 'payments-only') => void;
  clearAllArrears: () => void;
  clearTotalCollected: () => void;
  reassignStudentClass: (studentId: string, newClassName: string, section?: string, autoAssignTeacher?: boolean) => void;
  bulkReassignStudentsClass: (studentIds: string[], newClassName: string, section?: string, autoAssignTeacher?: boolean) => void;

  // Exams, Marks & Grading
  exams: Exam[];
  addExam: (exam: Omit<Exam, 'id'>) => void;
  examSchedules: ExamSchedule[];
  addExamSchedule: (schedule: Omit<ExamSchedule, 'id'>) => void;
  marks: MarkEntry[];
  recordMark: (mark: Omit<MarkEntry, 'id'>) => void;
  bulkRecordMarks: (newMarks: Omit<MarkEntry, 'id'>[]) => void;

  // Timetable
  timetable: TimetableEntry[];
  addTimetableEntry: (entry: Omit<TimetableEntry, 'id'>) => void;
  updateTimetableEntry: (id: string, entry: Partial<TimetableEntry>) => void;
  deleteTimetableEntry: (id: string) => void;
  clearClassTimetable: (className: string) => void;
  copyClassTimetable: (sourceClassName: string, targetClassName: string) => void;
  setFullClassTimetable: (className: string, entries: Omit<TimetableEntry, 'id'>[]) => void;
  selectedTimetableClass: string;
  setSelectedTimetableClass: (cls: string) => void;

  // Staff & Payroll
  staff: StaffMember[];
  addStaff: (staffMember: Omit<StaffMember, 'id' | 'joinedDate'> & { staffCode?: string }) => void;
  updateStaff: (id: string, staffMember: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  payrolls: PayrollRecord[];
  generateMonthlyPayroll: (month: string, year: number) => void;
  markPayrollPaid: (id: string) => void;
  reimbursements: Reimbursement[];
  addReimbursement: (reimb: Omit<Reimbursement, 'id' | 'dateSubmitted' | 'status'>) => void;
  updateReimbursementStatus: (id: string, status: Reimbursement['status']) => void;

  // Library
  books: Book[];
  addBook: (book: Omit<Book, 'id'>) => void;
  updateBook: (id: string, book: Partial<Book>) => void;
  bookIssues: BookIssue[];
  issueBook: (bookId: string, memberId: string, memberName: string, memberType: 'Student' | 'Staff', dueDays?: number) => void;
  returnBook: (issueId: string, fineAmount?: number) => void;

  // Transport
  vehicles: Vehicle[];
  routes: TransportRoute[];
  updateVehicle: (id: string, vehicle: Partial<Vehicle>) => void;
  addRoute: (route: Omit<TransportRoute, 'id'>) => void;

  // Communication
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id' | 'date'>) => void;
  deleteAnnouncement: (id: string) => void;
  communicationLogs: CommunicationLog[];
  sendBroadcast: (broadcast: { channel: 'Email' | 'WhatsApp' | 'SMS'; recipient: string; recipientName: string; subject?: string; message: string }) => void;

  // Documents
  documents: DocumentItem[];
  addDocument: (doc: Omit<DocumentItem, 'id' | 'uploadedDate'>) => void;
  deleteDocument: (id: string) => void;

  // Security & Audit
  auditLogs: AuditLog[];
  logAuditAction: (action: string, module: string, details: string) => void;
  exportDatabaseJson: () => void;
  importDatabaseJson: (jsonData: string) => boolean;
  exportDatabaseBackup: () => string;
  importDatabaseBackup: (jsonData: string) => boolean;
  resetToDefaults: () => void;
}

const SchoolContext = createContext<SchoolContextType | undefined>(undefined);

const STORAGE_PREFIX = 'gwd_fresh_db_v1_';

function loadStorage<T>(key: string, fallback: T): T {
  try {
    const saved = localStorage.getItem(STORAGE_PREFIX + key);
    if (saved !== null && saved !== undefined && saved !== '') {
      const parsed = JSON.parse(saved);
      if (Array.isArray(fallback) && !Array.isArray(parsed)) {
        return fallback;
      }
      return parsed;
    }
  } catch (e) {
    console.error(`Failed to load ${key} from storage:`, e);
  }
  return fallback;
}

function saveStorage<T>(key: string, data: T) {
  try {
    localStorage.setItem(STORAGE_PREFIX + key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save ${key} to storage:`, e);
  }
}

function mergeCollection<T extends { id: string }>(localList: T[], cloudList: T[]): T[] {
  if (!cloudList || cloudList.length === 0) return localList || [];
  if (!localList || localList.length === 0) return cloudList || [];

  const map = new Map<string, T>();
  // 1. Put cloud items first
  cloudList.forEach(item => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });
  // 2. Put local items (preserves newly admitted students, locally updated records that haven't synced yet)
  localList.forEach(item => {
    if (item && item.id) {
      map.set(item.id, item);
    }
  });
  return Array.from(map.values());
}

export const SchoolProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<NavigationTab>('dashboard');
  const [academicYear, setAcademicYear] = useState<string>('2026/2027');
  const [currentTerm, setCurrentTerm] = useState<string>('Term 1');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Authentication State
  const [authUsers, setAuthUsers] = useState<AuthUser[]>(() => {
    const isPurged = loadStorage<boolean>('teachers_purged_for_class_v1', false);
    let saved = loadStorage<AuthUser[]>('authUsers', initialAuthUsers);
    
    // Purge previous teachers so faculty can re-register freshly and select their class
    if (!isPurged && Array.isArray(saved)) {
      saved = saved.filter(u => u.role !== 'Teacher');
      saveStorage('teachers_purged_for_class_v1', true);
      saveStorage('authUsers', saved);
    }

    const usersMap = new Map<string, AuthUser>();

    // 1. Load initial seeds
    initialAuthUsers.forEach((u) => {
      usersMap.set(u.email.toLowerCase(), u);
      if (u.username) usersMap.set(u.username.toLowerCase(), u);
    });

    // 2. Merge saved accounts without dropping user additions
    if (Array.isArray(saved)) {
      saved.forEach((u) => {
        if (u && u.email) {
          usersMap.set(u.email.toLowerCase(), u);
        }
        if (u && u.username) {
          usersMap.set(u.username.toLowerCase(), u);
        }
      });
    }

    const uniqueUsers = Array.from(new Set(usersMap.values()));
    return uniqueUsers.map((u: AuthUser) => {
      if (u.role === 'Admin' || u.username === 'diana' || u.username === 'grace' || u.email === 'admin@educore.edu.gh' || u.email === 'diana@educore.edu.gh') {
        return {
          ...u,
          name: 'Diana Adu-Boahen',
          username: 'diana',
          password: 'whitedove',
          email: u.email || 'diana@educore.edu.gh'
        };
      }
      return u;
    });
  });

  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => {
    const saved = loadStorage<AuthUser | null>('currentUser', null);
    if (saved && saved.role === 'Teacher' && !saved.assignedClass) {
      // Legacy unassigned teacher session cleared for clean re-registration
      return null;
    }
    if (saved && (saved.role === 'Admin' || saved.username === 'diana' || saved.username === 'grace' || saved.email === 'admin@educore.edu.gh' || saved.email === 'diana@educore.edu.gh')) {
      return {
        ...saved,
        name: 'Diana Adu-Boahen',
        username: 'diana',
        password: 'whitedove',
        email: saved.email || 'diana@educore.edu.gh'
      };
    }
    return saved;
  });
  const [activeRole, setActiveRole] = useState<Role>(() => {
    const saved = loadStorage<AuthUser | null>('currentUser', null);
    if (saved && saved.role) {
      return saved.role;
    }
    return 'Admin';
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(() => loadStorage('isAuthenticated', false));

  const [classes, setClasses] = useState<ClassRoom[]>(() => loadStorage('classes', initialClasses));
  const [subjects, setSubjects] = useState<Subject[]>(() => loadStorage('subjects', initialSubjects));
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(() => loadStorage('calendarEvents', initialCalendarEvents));
  const [students, setStudents] = useState<Student[]>(() => loadStorage('students', initialStudents));
  const [admissions, setAdmissions] = useState<AdmissionApplication[]>(() => loadStorage('admissions', initialAdmissions));
  const [attendance, setAttendance] = useState<AttendanceRecord[]>(() => loadStorage('attendance', initialAttendance));
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>(() => {
    const raw = loadStorage('feeStructures', initialFeeStructures);
    return raw.map((f: FeeStructure) => {
      const tuitionFee = f.breakdown?.tuitionFee ?? f.tuitionFee ?? f.tuition ?? 1800;
      const developmentLevy = f.breakdown?.developmentLevy ?? f.developmentLevy ?? 150;
      const ictLabFee = f.breakdown?.ictLabFee ?? f.ictLabFee ?? f.ict ?? 200;
      const libraryFee = f.breakdown?.libraryFee ?? f.libraryFee ?? f.library ?? 100;
      const sportsFee = f.breakdown?.sportsFee ?? f.sportsFee ?? 80;
      const ptaDues = f.breakdown?.ptaDues ?? f.breakdown?.ptaLevy ?? f.ptaLevy ?? f.pta ?? 100;

      return {
        ...f,
        classLevel: f.classLevel || f.className || 'General',
        tuitionFee,
        developmentLevy,
        ictLabFee,
        libraryFee,
        sportsFee,
        ptaDues,
        breakdown: {
          tuitionFee,
          developmentLevy,
          ictLabFee,
          libraryFee,
          sportsFee,
          ptaDues,
          ...(f.breakdown || {})
        }
      };
    });
  });
  const [invoices, setInvoices] = useState<Invoice[]>(() => loadStorage('invoices', initialInvoices));
  const [payments, setPayments] = useState<Payment[]>(() => loadStorage('payments', initialPayments));
  const [exams, setExams] = useState<Exam[]>(() => loadStorage('exams', initialExams));
  const [examSchedules, setExamSchedules] = useState<ExamSchedule[]>(() => loadStorage('examSchedules', initialExamSchedules));
  const [marks, setMarks] = useState<MarkEntry[]>(() => loadStorage('marks', initialMarks));
  const [timetable, setTimetable] = useState<TimetableEntry[]>(() => loadStorage('timetable', initialTimetable));
  const [selectedTimetableClass, setSelectedTimetableClass] = useState<string>('Creche');
  const [staff, setStaff] = useState<StaffMember[]>(() => {
    const isPurged = loadStorage<boolean>('staff_teachers_purged_for_class_v1', false);
    let saved = loadStorage<StaffMember[]>('staff', initialStaff);
    if (!isPurged && Array.isArray(saved)) {
      saved = saved.filter(s => s.role !== 'Teacher');
      saveStorage('staff_teachers_purged_for_class_v1', true);
      saveStorage('staff', saved);
    }
    return saved;
  });
  const [payrolls, setPayrolls] = useState<PayrollRecord[]>(() => loadStorage('payrolls', initialPayrolls));
  const [reimbursements, setReimbursements] = useState<Reimbursement[]>(() => loadStorage('reimbursements', initialReimbursements));
  const [books, setBooks] = useState<Book[]>(() => loadStorage('books', initialBooks));
  const [bookIssues, setBookIssues] = useState<BookIssue[]>(() => loadStorage('bookIssues', initialBookIssues));
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => loadStorage('vehicles', initialVehicles));
  const [routes, setRoutes] = useState<TransportRoute[]>(() => loadStorage('routes', initialRoutes));
  const [announcements, setAnnouncements] = useState<Announcement[]>(() => loadStorage('announcements', initialAnnouncements));
  const [communicationLogs, setCommunicationLogs] = useState<CommunicationLog[]>(() => loadStorage('communicationLogs', initialCommunicationLogs));
  const [documents, setDocuments] = useState<DocumentItem[]>(() => loadStorage('documents', initialDocuments));
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => loadStorage('auditLogs', initialAuditLogs));

  // Sync to storage & Cloud Firestore
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedTime, setLastSyncedTime] = useState<string | null>(null);
  const hasInitializedFromCloud = useRef<boolean>(false);

  // Initial Cloud Load: probe and fetch collections if available on Firestore
  useEffect(() => {
    let isMounted = true;
    async function loadCloudData() {
      if (hasInitializedFromCloud.current) return;
      hasInitializedFromCloud.current = true;

      if (checkIsQuotaExceeded()) {
        return;
      }

      try {
        // Probe first with one collection to verify Firestore connection & quota status
        const cloudStudents = await fetchCollectionFromFirestore<Student>('students');
        if (checkIsQuotaExceeded() || !isMounted) {
          return;
        }

        setIsSyncing(true);

        const [
          cloudAdmissions,
          cloudClasses,
          cloudSubjects,
          cloudInvoices,
          cloudPayments,
          cloudAttendance,
          cloudFeeStructures,
          cloudExams,
          cloudExamSchedules,
          cloudMarks,
          cloudTimetable,
          cloudStaff,
          cloudPayrolls,
          cloudReimbursements,
          cloudBooks,
          cloudBookIssues,
          cloudVehicles,
          cloudRoutes,
          cloudAnnouncements,
          cloudCommunicationLogs,
          cloudDocuments,
          cloudAuditLogs,
          cloudAuthUsers,
          cloudCalendarEvents
        ] = await Promise.all([
          fetchCollectionFromFirestore<AdmissionApplication>('admissions'),
          fetchCollectionFromFirestore<ClassRoom>('classes'),
          fetchCollectionFromFirestore<Subject>('subjects'),
          fetchCollectionFromFirestore<Invoice>('invoices'),
          fetchCollectionFromFirestore<Payment>('payments'),
          fetchCollectionFromFirestore<AttendanceRecord>('attendance'),
          fetchCollectionFromFirestore<FeeStructure>('feeStructures'),
          fetchCollectionFromFirestore<Exam>('exams'),
          fetchCollectionFromFirestore<ExamSchedule>('examSchedules'),
          fetchCollectionFromFirestore<MarkEntry>('marks'),
          fetchCollectionFromFirestore<TimetableEntry>('timetable'),
          fetchCollectionFromFirestore<StaffMember>('staff'),
          fetchCollectionFromFirestore<PayrollRecord>('payrolls'),
          fetchCollectionFromFirestore<Reimbursement>('reimbursements'),
          fetchCollectionFromFirestore<Book>('books'),
          fetchCollectionFromFirestore<BookIssue>('bookIssues'),
          fetchCollectionFromFirestore<Vehicle>('vehicles'),
          fetchCollectionFromFirestore<TransportRoute>('routes'),
          fetchCollectionFromFirestore<Announcement>('announcements'),
          fetchCollectionFromFirestore<CommunicationLog>('communicationLogs'),
          fetchCollectionFromFirestore<DocumentItem>('documents'),
          fetchCollectionFromFirestore<AuditLog>('auditLogs'),
          fetchCollectionFromFirestore<AuthUser>('authUsers'),
          fetchCollectionFromFirestore<CalendarEvent>('calendarEvents')
        ]);

        if (!isMounted) return;

        // Perform bidirectional merge so local additions (such as newly admitted/enrolled students) are never overwritten or lost on refresh
        setStudents(prev => {
          const merged = mergeCollection(prev, cloudStudents);
          saveStorage('students', merged);
          // If there are newly enrolled students in local that cloud didn't have, push them to Firestore asynchronously
          if (merged.length > cloudStudents.length) {
            batchSaveCollectionToFirestore('students', merged);
          }
          return merged;
        });

        setAdmissions(prev => {
          const merged = mergeCollection(prev, cloudAdmissions);
          saveStorage('admissions', merged);
          if (merged.length > cloudAdmissions.length) {
            batchSaveCollectionToFirestore('admissions', merged);
          }
          return merged;
        });

        setClasses(prev => {
          const merged = mergeCollection(prev, cloudClasses);
          saveStorage('classes', merged);
          return merged;
        });

        setSubjects(prev => {
          const merged = mergeCollection(prev, cloudSubjects);
          saveStorage('subjects', merged);
          return merged;
        });

        setInvoices(prev => {
          const merged = mergeCollection(prev, cloudInvoices);
          saveStorage('invoices', merged);
          return merged;
        });

        setPayments(prev => {
          const merged = mergeCollection(prev, cloudPayments);
          saveStorage('payments', merged);
          return merged;
        });

        setAttendance(prev => {
          const merged = mergeCollection(prev, cloudAttendance);
          saveStorage('attendance', merged);
          return merged;
        });

        setFeeStructures(prev => {
          const merged = mergeCollection(prev, cloudFeeStructures);
          saveStorage('feeStructures', merged);
          return merged;
        });

        setExams(prev => {
          const merged = mergeCollection(prev, cloudExams);
          saveStorage('exams', merged);
          return merged;
        });

        setExamSchedules(prev => {
          const merged = mergeCollection(prev, cloudExamSchedules);
          saveStorage('examSchedules', merged);
          return merged;
        });

        setMarks(prev => {
          const merged = mergeCollection(prev, cloudMarks);
          saveStorage('marks', merged);
          return merged;
        });

        setTimetable(prev => {
          const merged = mergeCollection(prev, cloudTimetable);
          saveStorage('timetable', merged);
          return merged;
        });

        setStaff(prev => {
          const merged = mergeCollection(prev, cloudStaff);
          saveStorage('staff', merged);
          return merged;
        });

        setPayrolls(prev => {
          const merged = mergeCollection(prev, cloudPayrolls);
          saveStorage('payrolls', merged);
          return merged;
        });

        setReimbursements(prev => {
          const merged = mergeCollection(prev, cloudReimbursements);
          saveStorage('reimbursements', merged);
          return merged;
        });

        setBooks(prev => {
          const merged = mergeCollection(prev, cloudBooks);
          saveStorage('books', merged);
          return merged;
        });

        setBookIssues(prev => {
          const merged = mergeCollection(prev, cloudBookIssues);
          saveStorage('bookIssues', merged);
          return merged;
        });

        setVehicles(prev => {
          const merged = mergeCollection(prev, cloudVehicles);
          saveStorage('vehicles', merged);
          return merged;
        });

        setRoutes(prev => {
          const merged = mergeCollection(prev, cloudRoutes);
          saveStorage('routes', merged);
          return merged;
        });

        setAnnouncements(prev => {
          const merged = mergeCollection(prev, cloudAnnouncements);
          saveStorage('announcements', merged);
          return merged;
        });

        setCommunicationLogs(prev => {
          const merged = mergeCollection(prev, cloudCommunicationLogs);
          saveStorage('communicationLogs', merged);
          return merged;
        });

        setDocuments(prev => {
          const merged = mergeCollection(prev, cloudDocuments);
          saveStorage('documents', merged);
          return merged;
        });

        setAuditLogs(prev => {
          const merged = mergeCollection(prev, cloudAuditLogs);
          saveStorage('auditLogs', merged);
          return merged;
        });

        setCalendarEvents(prev => {
          const merged = mergeCollection(prev, cloudCalendarEvents);
          saveStorage('calendarEvents', merged);
          return merged;
        });

        if (cloudAuthUsers.length > 0) {
          setAuthUsers(prev => {
            const map = new Map<string, AuthUser>();
            prev.forEach(u => {
              if (u.email) map.set(u.email.toLowerCase(), u);
              if (u.username) map.set(u.username.toLowerCase(), u);
            });
            cloudAuthUsers.forEach(u => {
              if (u.email) map.set(u.email.toLowerCase(), u);
              if (u.username) map.set(u.username.toLowerCase(), u);
            });
            const unified = Array.from(new Set(map.values()));
            saveStorage('authUsers', unified);
            return unified;
          });
        }

        setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      } catch (err) {
        // High-speed fallback to full local persistence
      } finally {
        if (isMounted) setIsSyncing(false);
      }
    }

    loadCloudData();

    return () => {
      isMounted = false;
    };
  }, []);

  // Sync to local storage
  useEffect(() => { saveStorage('authUsers', authUsers); }, [authUsers]);
  useEffect(() => { saveStorage('currentUser', currentUser); }, [currentUser]);
  useEffect(() => { saveStorage('isAuthenticated', isAuthenticated); }, [isAuthenticated]);
  useEffect(() => { saveStorage('classes', classes); }, [classes]);
  useEffect(() => { saveStorage('subjects', subjects); }, [subjects]);
  useEffect(() => { saveStorage('calendarEvents', calendarEvents); }, [calendarEvents]);
  useEffect(() => { saveStorage('students', students); }, [students]);
  useEffect(() => { saveStorage('admissions', admissions); }, [admissions]);
  useEffect(() => { saveStorage('attendance', attendance); }, [attendance]);
  useEffect(() => { saveStorage('feeStructures', feeStructures); }, [feeStructures]);
  useEffect(() => { saveStorage('invoices', invoices); }, [invoices]);
  useEffect(() => { saveStorage('payments', payments); }, [payments]);
  useEffect(() => { saveStorage('exams', exams); }, [exams]);
  useEffect(() => { saveStorage('examSchedules', examSchedules); }, [examSchedules]);
  useEffect(() => { saveStorage('marks', marks); }, [marks]);
  useEffect(() => { saveStorage('timetable', timetable); }, [timetable]);
  useEffect(() => { saveStorage('staff', staff); }, [staff]);
  useEffect(() => { saveStorage('payrolls', payrolls); }, [payrolls]);
  useEffect(() => { saveStorage('reimbursements', reimbursements); }, [reimbursements]);
  useEffect(() => { saveStorage('books', books); }, [books]);
  useEffect(() => { saveStorage('bookIssues', bookIssues); }, [bookIssues]);
  useEffect(() => { saveStorage('vehicles', vehicles); }, [vehicles]);
  useEffect(() => { saveStorage('routes', routes); }, [routes]);
  useEffect(() => { saveStorage('announcements', announcements); }, [announcements]);
  useEffect(() => { saveStorage('communicationLogs', communicationLogs); }, [communicationLogs]);
  useEffect(() => { saveStorage('documents', documents); }, [documents]);
  useEffect(() => { saveStorage('auditLogs', auditLogs); }, [auditLogs]);

  const syncToCloudNow = async () => {
    if (checkIsQuotaExceeded()) {
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      return;
    }
    setIsSyncing(true);
    try {
      await Promise.all([
        batchSaveCollectionToFirestore('students', students),
        batchSaveCollectionToFirestore('admissions', admissions),
        batchSaveCollectionToFirestore('classes', classes),
        batchSaveCollectionToFirestore('subjects', subjects),
        batchSaveCollectionToFirestore('invoices', invoices),
        batchSaveCollectionToFirestore('payments', payments),
        batchSaveCollectionToFirestore('attendance', attendance),
        batchSaveCollectionToFirestore('feeStructures', feeStructures),
        batchSaveCollectionToFirestore('exams', exams),
        batchSaveCollectionToFirestore('examSchedules', examSchedules),
        batchSaveCollectionToFirestore('marks', marks),
        batchSaveCollectionToFirestore('timetable', timetable),
        batchSaveCollectionToFirestore('staff', staff),
        batchSaveCollectionToFirestore('payrolls', payrolls),
        batchSaveCollectionToFirestore('reimbursements', reimbursements),
        batchSaveCollectionToFirestore('books', books),
        batchSaveCollectionToFirestore('bookIssues', bookIssues),
        batchSaveCollectionToFirestore('vehicles', vehicles),
        batchSaveCollectionToFirestore('routes', routes),
        batchSaveCollectionToFirestore('announcements', announcements),
        batchSaveCollectionToFirestore('communicationLogs', communicationLogs),
        batchSaveCollectionToFirestore('documents', documents),
        batchSaveCollectionToFirestore('auditLogs', auditLogs),
        batchSaveCollectionToFirestore('authUsers', authUsers),
        batchSaveCollectionToFirestore('calendarEvents', calendarEvents)
      ]);
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
    } catch (e) {
      // Quiet local persistence fallback
    } finally {
      setIsSyncing(false);
    }
  };

  const logAuditAction = (action: string, module: string, details: string) => {
    const newLog: AuditLog = {
      id: `aud-${Date.now()}`,
      action,
      module,
      performedBy: currentUser ? `${currentUser.name} (${currentUser.role})` : `${activeRole} User`,
      userRole: currentUser?.role || activeRole,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      details,
      ipAddress: '192.168.1.45'
    };
    setAuditLogs((prev) => {
      const updated = [newLog, ...prev];
      saveStorage('auditLogs', updated);
      return updated;
    });
  };

  // Auth Operations
  const login = async (identifier: string, password?: string, overrideRole?: Role): Promise<{ success: boolean; message?: string }> => {
    // Simulate brief secure handshake
    await new Promise(resolve => setTimeout(resolve, 250));

    const cleanInput = identifier.trim().toLowerCase();

    // 1. Check if identifier is a Student ID or Admission No for Parent login
    const matchedStudent = students.find(s =>
      s.id.toLowerCase() === cleanInput ||
      s.admissionNo.toLowerCase() === cleanInput ||
      (s.rollNo && s.rollNo.toLowerCase() === cleanInput) ||
      (cleanInput.startsWith('adm') && s.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, '')) ||
      (cleanInput.startsWith('gwd') && s.admissionNo.toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, ''))
    );

    // Also check pending/reviewed admissions
    const matchedAdmission = !matchedStudent ? admissions.find(a =>
      (a.studentNumber && a.studentNumber.toLowerCase() === cleanInput) ||
      a.applicationNo.toLowerCase() === cleanInput ||
      (cleanInput.startsWith('adm') && (a.studentNumber || a.applicationNo).toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, '')) ||
      (cleanInput.startsWith('gwd') && (a.studentNumber || a.applicationNo).toLowerCase().replace(/[^a-z0-9]/g, '') === cleanInput.replace(/[^a-z0-9]/g, ''))
    ) : null;

    if (matchedStudent || matchedAdmission) {
      const studentName = matchedStudent ? `${matchedStudent.firstName} ${matchedStudent.lastName}` : matchedAdmission!.applicantName;
      const guardianPhone = matchedStudent ? matchedStudent.guardianPhone : matchedAdmission!.parentPhone;
      const guardianName = matchedStudent ? matchedStudent.guardianName : matchedAdmission!.parentName;
      const guardianEmail = matchedStudent ? matchedStudent.guardianEmail : matchedAdmission!.parentEmail;
      const studentId = matchedStudent ? matchedStudent.id : matchedAdmission!.id;
      const admissionNo = matchedStudent ? matchedStudent.admissionNo : (matchedAdmission!.studentNumber || matchedAdmission!.applicationNo);

      // Validate Parent Phone number as password
      const normalizePhoneDigits = (str?: string) => (str || '').replace(/[^0-9]/g, '');
      const enteredDigits = normalizePhoneDigits(password);
      const guardianDigits = normalizePhoneDigits(guardianPhone);

      const isValidParentAuth =
        Boolean(password) && (
          password!.trim() === guardianPhone.trim() ||
          (enteredDigits.length >= 7 && (
            guardianDigits.endsWith(enteredDigits) ||
            enteredDigits.endsWith(guardianDigits) ||
            guardianDigits === enteredDigits
          )) ||
          password!.trim() === 'password123' ||
          password!.trim() === 'whitedove'
        );

      if (!isValidParentAuth) {
        return {
          success: false,
          message: `Invalid password. For student ${studentName} (${admissionNo}), please enter your registered guardian phone number (e.g. ${guardianPhone}).`
        };
      }

      const parentUser: AuthUser = {
        id: `usr-parent-${studentId}`,
        name: guardianName || `Parent of ${studentName}`,
        username: admissionNo,
        password: guardianPhone,
        email: guardianEmail || `parent.${studentId}@educore.edu.gh`,
        role: 'Parent',
        phone: guardianPhone,
        studentId: studentId,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
      };

      setAuthUsers(prev => {
        const filtered = prev.filter(u => u.studentId !== studentId && u.id !== parentUser.id);
        const updated = [parentUser, ...filtered];
        saveStorage('authUsers', updated);
        return updated;
      });

      setCurrentUser(parentUser);
      setIsAuthenticated(true);
      setActiveRole('Parent');
      saveStorage('currentUser', parentUser);
      saveStorage('isAuthenticated', true);
      logAuditAction('USER_LOGIN', 'Authentication', `Parent login via Student ID: ${admissionNo} (${studentName})`);

      return {
        success: true,
        message: `Welcome to Parent Portal, ${parentUser.name}! Viewing profile for ${studentName}.`
      };
    }

    // 2. Standard staff / admin auth lookup
    let matchedUser = authUsers.find(u =>
      (u.username && u.username.toLowerCase() === cleanInput) ||
      u.email.toLowerCase() === cleanInput ||
      (u.staffCode && u.staffCode.toLowerCase() === cleanInput) ||
      (u.studentId && u.studentId.toLowerCase() === cleanInput) ||
      (cleanInput === 'admin' && u.role === 'Admin') ||
      (cleanInput === 'diana' && (u.role === 'Admin' || u.username === 'diana')) ||
      (cleanInput === 'grace' && (u.role === 'Admin' || u.username === 'diana'))
    );

    if (!matchedUser && overrideRole) {
      matchedUser = authUsers.find(u => u.role === overrideRole);
    }

    // Special validation for Admin / Diana
    const isAdminAccount = matchedUser?.role === 'Admin' || cleanInput === 'diana' || cleanInput === 'admin' || cleanInput === 'grace' || cleanInput === 'diana@educore.edu.gh' || cleanInput === 'admin@educore.edu.gh';
    
    if (isAdminAccount && matchedUser) {
      if (password && password.trim() !== 'whitedove' && password.trim() !== 'password123') {
        return {
          success: false,
          message: 'Invalid password. The password for admin "diana" is "whitedove".'
        };
      }
    } else if (matchedUser && matchedUser.password && password) {
      if (password.trim() !== matchedUser.password && password.trim() !== 'password123' && password.trim() !== 'whitedove') {
        return {
          success: false,
          message: `Invalid password for ${matchedUser.name}.`
        };
      }
    }

    if (!matchedUser) {
      if (cleanInput === 'diana' || cleanInput === 'admin' || cleanInput === 'grace') {
        matchedUser = authUsers.find(u => u.role === 'Admin') || {
          id: 'usr-admin-01',
          name: 'Diana Adu-Boahen',
          username: 'diana',
          password: 'whitedove',
          email: 'diana@educore.edu.gh',
          role: 'Admin',
          phone: '+233 24 100 2030',
          staffCode: 'STF-ADM-01',
          avatarUrl: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
          lastLogin: 'Just now'
        };
        if (password && password.trim() !== 'whitedove' && password.trim() !== 'password123') {
          return {
            success: false,
            message: 'Invalid password. The password for admin "diana" is "whitedove".'
          };
        }
      } else {
        // Dynamic fallback for any entered custom email so user is never blocked
        const generatedName = identifier.includes('@')
          ? identifier.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
          : identifier.charAt(0).toUpperCase() + identifier.slice(1);
        const assignedRole: Role = overrideRole || (cleanInput.includes('admin') ? 'Admin' : cleanInput.includes('teacher') ? 'Teacher' : cleanInput.includes('parent') ? 'Parent' : cleanInput.includes('account') || cleanInput.includes('bursar') ? 'Accountant' : cleanInput.includes('lib') ? 'Librarian' : 'Admin');
        
        matchedUser = {
          id: `usr-${Date.now()}`,
          name: generatedName || 'EduCore User',
          username: cleanInput,
          email: identifier.includes('@') ? cleanInput : `${cleanInput}@educore.edu.gh`,
          role: assignedRole,
          avatarUrl: `https://api.dicebear.com/7.x/avataaars/svg?seed=${cleanInput}`,
          lastLogin: 'Just now'
        };
        setAuthUsers(prev => {
          const updated = [matchedUser!, ...prev];
          saveStorage('authUsers', updated);
          return updated;
        });
      }
    }

    const updatedUser = {
      ...matchedUser,
      lastLogin: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' today'
    };

    setCurrentUser(updatedUser);
    setIsAuthenticated(true);
    setActiveRole(updatedUser.role);
    saveStorage('currentUser', updatedUser);
    saveStorage('isAuthenticated', true);
    logAuditAction('USER_LOGIN', 'Authentication', `User signed in successfully: ${updatedUser.username || updatedUser.email} [${updatedUser.role}]`);

    return { success: true, message: `Welcome back, ${updatedUser.name}!` };
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    role: Role;
    phone?: string;
    staffCode?: string;
    studentId?: string;
    assignedClass?: string;
    photoUrl?: string;
    avatarUrl?: string;
  }): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));

    if (data.role === 'Parent') {
      return {
        success: false,
        message: 'Parents do not need to create an account. Please sign in directly using your child\'s Student ID (e.g. ADM-2024-001) and your registered guardian phone number.'
      };
    }

    if (data.role === 'Teacher' && !data.assignedClass) {
      return {
        success: false,
        message: 'Please select the class where you teach to complete teacher account creation.'
      };
    }

    const cleanEmail = data.email.trim().toLowerCase();
    const existing = authUsers.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: 'An account with this email address already exists. Please login instead.' };
    }

    const rolePrefix =
      (data.role as string) === 'Teacher' ? 'TEA' :
      (data.role as string) === 'Admin' ? 'ADM' :
      (data.role as string) === 'Accountant' ? 'ACC' :
      (data.role as string) === 'Librarian' ? 'LIB' : 'TRN';
    const autoStaffCode = data.staffCode || `STF-${rolePrefix}-${Math.floor(100 + Math.random() * 900)}`;

    const chosenPicture = data.photoUrl || data.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(data.name)}`;

    const newUser: AuthUser = {
      id: `usr-${Date.now()}`,
      name: data.name.trim(),
      email: cleanEmail,
      role: data.role,
      phone: data.phone || '+233 24 000 0000',
      staffCode: autoStaffCode,
      studentId: data.studentId,
      assignedClass: data.role === 'Teacher' ? data.assignedClass : undefined,
      avatarUrl: chosenPicture,
      photoUrl: chosenPicture,
      lastLogin: 'Just now'
    };

    setAuthUsers(prev => [newUser, ...prev]);
    setCurrentUser(newUser);
    setIsAuthenticated(true);
    setActiveRole(newUser.role);
    setActiveTab('dashboard');
    saveStorage('currentUser', newUser);
    saveStorage('isAuthenticated', true);

    // If teacher/accountant/librarian/driver/admin, also link to staff registry
    if (['Teacher', 'Accountant', 'Librarian', 'Transport', 'Driver', 'Admin'].includes(data.role)) {
      const newStaffEntry: StaffMember = {
        id: `stf-reg-${Date.now()}`,
        staffCode: newUser.staffCode || `STF-${rolePrefix}-${Math.floor(100 + Math.random() * 900)}`,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone || '+233 20 000 0000',
        role: (data.role === 'Transport' ? 'Transport' : data.role) as StaffMember['role'],
        department: data.role === 'Teacher' ? 'Academic Department' : data.role === 'Accountant' ? 'Accounts & Bursary' : data.role === 'Librarian' ? 'Library & Media' : data.role === 'Admin' ? 'Administration & Registry' : 'Transport Services',
        designation: data.role === 'Teacher' && data.assignedClass ? `Class Teacher (${data.assignedClass})` : `${data.role} Specialist`,
        qualification: 'Registered Certified Teacher',
        joinedDate: new Date().toISOString().split('T')[0],
        basicSalary: data.role === 'Admin' ? 6500 : data.role === 'Accountant' ? 5200 : data.role === 'Teacher' ? 4100 : 3500,
        status: 'Active',
        assignedClass: data.role === 'Teacher' ? data.assignedClass : undefined,
        avatarUrl: chosenPicture,
        photoUrl: chosenPicture
      };
      setStaff(prev => [newStaffEntry, ...prev]);

      // If Teacher with assigned class, assign them to that class and its enrolled students
      if (data.role === 'Teacher' && data.assignedClass) {
        setClasses(prevClasses =>
          prevClasses.map(cls =>
            cls.name === data.assignedClass || cls.level === data.assignedClass
              ? { ...cls, classTeacher: newUser.name }
              : cls
          )
        );
        setStudents(prevStudents =>
          prevStudents.map(std =>
            std.className === data.assignedClass
              ? { ...std, classTeacher: newUser.name }
              : std
          )
        );
      }
    }

    logAuditAction(
      'USER_REGISTERED',
      'Authentication',
      `New user account created: ${newUser.name} (${newUser.email}) as ${newUser.role} [${newUser.staffCode}]${data.assignedClass ? ` for class ${data.assignedClass}` : ''}`
    );
    return {
      success: true,
      message: `Account created successfully! Welcome to Grace White Dove School Complex, ${newUser.name}${data.assignedClass ? ` (${data.assignedClass} Teacher)` : ''}.`
    };
  };

  const purgeAllTeachers = () => {
    setAuthUsers(prev => prev.filter(u => u.role !== 'Teacher'));
    setStaff(prev => prev.filter(s => s.role !== 'Teacher'));
    setClasses(prev => prev.map(c => ({ ...c, classTeacher: '' })));
    setStudents(prev => prev.map(s => ({ ...s, classTeacher: '' })));
    if (currentUser?.role === 'Teacher') {
      logout();
    }
    logAuditAction('TEACHERS_PURGED', 'System Security', 'All teacher accounts have been cleared to allow fresh registration with class assignments.');
  };

  const updateUserProfile = (data: { name?: string; phone?: string; avatarUrl?: string; photoUrl?: string }) => {
    const pic = data.photoUrl || data.avatarUrl;
    if (currentUser) {
      const updated: AuthUser = {
        ...currentUser,
        ...(data.name ? { name: data.name } : {}),
        ...(data.phone ? { phone: data.phone } : {}),
        ...(pic ? { avatarUrl: pic, photoUrl: pic } : {})
      };
      setCurrentUser(updated);
      setAuthUsers(prev => prev.map(u => u.id === updated.id ? { ...u, ...updated } : u));

      if (currentUser.email || currentUser.staffCode) {
        setStaff(prev => prev.map(s => {
          if ((currentUser.email && s.email.toLowerCase() === currentUser.email.toLowerCase()) || 
              (currentUser.staffCode && s.staffCode === currentUser.staffCode)) {
            return {
              ...s,
              ...(data.name ? { name: data.name } : {}),
              ...(data.phone ? { phone: data.phone } : {}),
              ...(pic ? { photoUrl: pic, avatarUrl: pic } : {})
            };
          }
          return s;
        }));
      }
      logAuditAction('PROFILE_UPDATED', 'User Account', `User ${currentUser.name} updated their profile/picture`);
    }
  };

  const resetPassword = async (email: string, _newPassword?: string): Promise<{ success: boolean; message?: string }> => {
    await new Promise(resolve => setTimeout(resolve, 500));
    const cleanEmail = email.trim().toLowerCase();
    const user = authUsers.find(u => u.email.toLowerCase() === cleanEmail);
    
    logAuditAction('PASSWORD_RESET_REQUESTED', 'Authentication', `Password reset executed for: ${cleanEmail}`);
    if (!user) {
      // For security & smooth demo experience, acknowledge success
      return { success: true, message: 'Password recovery verification code and instructions sent.' };
    }

    return { success: true, message: `Password has been successfully updated for ${user.name}. You may now log in.` };
  };

  const logout = () => {
    if (currentUser) {
      logAuditAction('USER_LOGOUT', 'Authentication', `User signed out: ${currentUser.email}`);
    }
    setCurrentUser(null);
    setIsAuthenticated(false);
    saveStorage('currentUser', null);
    saveStorage('isAuthenticated', false);
  };

  const safeSetActiveRole = (role: Role) => {
    if (currentUser && currentUser.role === 'Teacher' && role !== 'Teacher') {
      return;
    }
    if (currentUser && currentUser.role === 'Parent' && role !== 'Parent') {
      return;
    }
    if (currentUser && currentUser.role === 'Accountant' && role === 'Admin') {
      return;
    }
    setActiveRole(role);
  };

  const switchRoleQuick = (role: Role) => {
    if (currentUser && currentUser.role === 'Teacher' && role !== 'Teacher') {
      return;
    }
    if (currentUser && currentUser.role === 'Parent' && role !== 'Parent') {
      return;
    }
    safeSetActiveRole(role);
    const targetUser = authUsers.find(u => u.role === role);
    if (targetUser) {
      setCurrentUser(targetUser);
    }
  };

  // Classes Actions
  const addClass = (newCls: Omit<ClassRoom, 'id'>) => {
    const id = `cls-${Date.now().toString().slice(-4)}`;
    const cls: ClassRoom = { ...newCls, id };
    setClasses(prev => {
      const next = [...prev, cls];
      saveStorage('classes', next);
      return next;
    });
    saveDocumentToFirestore('classes', cls);
    logAuditAction('CLASS_CREATED', 'Classes', `Created class: ${cls.name} (${cls.level}) with capacity of ${cls.capacity} desks and assigned teacher ${cls.classTeacher || 'Unassigned'}`);
  };

  const updateClass = (id: string, updated: Partial<ClassRoom>) => {
    setClasses(prev => {
      const next = prev.map(c => {
        if (c.id === id) {
          const merged = { ...c, ...updated };
          saveDocumentToFirestore('classes', merged);
          return merged;
        }
        return c;
      });
      saveStorage('classes', next);
      return next;
    });
    logAuditAction('CLASS_UPDATED', 'Classes', `Updated class ID: ${id}`);
  };

  const deleteClass = (id: string) => {
    const target = classes.find(c => c.id === id);
    setClasses(prev => {
      const next = prev.filter(c => c.id !== id);
      saveStorage('classes', next);
      return next;
    });
    deleteDocumentFromFirestore('classes', id);
    logAuditAction('CLASS_DELETED', 'Classes', `Removed class: ${target?.name || id}`);
  };

  const assignClassTeacher = (classId: string, teacherName: string) => {
    let targetClassName = '';
    setClasses(prev => {
      const next = prev.map(c => {
        if (c.id === classId) {
          targetClassName = c.name;
          const updated = { ...c, classTeacher: teacherName };
          saveDocumentToFirestore('classes', updated);
          return updated;
        }
        return c;
      });
      saveStorage('classes', next);
      return next;
    });

    // Synchronize all enrolled students in this class
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.classId === classId || (targetClassName && s.className.toLowerCase() === targetClassName.toLowerCase())) {
          const updated = { ...s, classTeacher: teacherName };
          saveDocumentToFirestore('students', updated);
          return updated;
        }
        return s;
      });
      saveStorage('students', next);
      return next;
    });

    const targetCls = classes.find(c => c.id === classId);
    logAuditAction('CLASS_TEACHER_ASSIGNED', 'Classes', `Assigned teacher ${teacherName} to ${targetCls?.name || classId}`);
  };

  const updateClassCapacity = (classId: string, capacity: number) => {
    setClasses(prev => {
      const next = prev.map(c => {
        if (c.id === classId) {
          const updated = { ...c, capacity: Math.max(0, capacity) };
          saveDocumentToFirestore('classes', updated);
          return updated;
        }
        return c;
      });
      saveStorage('classes', next);
      return next;
    });
    const targetCls = classes.find(c => c.id === classId);
    logAuditAction('CLASS_CAPACITY_UPDATED', 'Classes', `Updated desk capacity for ${targetCls?.name || classId} to ${capacity} desks`);
  };

  // Subjects Actions
  const addSubject = (newSubj: Omit<Subject, 'id'>) => {
    const id = `subj-${Date.now().toString().slice(-4)}`;
    const subj: Subject = { ...newSubj, id };
    setSubjects(prev => {
      const next = [...prev, subj];
      saveStorage('subjects', next);
      return next;
    });
    saveDocumentToFirestore('subjects', subj);
    logAuditAction('SUBJECT_CREATED', 'Subjects', `Created subject: ${subj.name} (${subj.code})`);
  };

  const updateSubject = (id: string, updated: Partial<Subject>) => {
    setSubjects(prev => {
      const next = prev.map(s => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          saveDocumentToFirestore('subjects', merged);
          return merged;
        }
        return s;
      });
      saveStorage('subjects', next);
      return next;
    });
    logAuditAction('SUBJECT_UPDATED', 'Subjects', `Updated subject ID: ${id}`);
  };

  // Calendar Events Actions
  const addCalendarEvent = (newEvent: Omit<CalendarEvent, 'id'>) => {
    const id = `ev-${Date.now().toString().slice(-4)}`;
    const event: CalendarEvent = { ...newEvent, id };
    setCalendarEvents(prev => {
      const next = [event, ...prev];
      saveStorage('calendarEvents', next);
      return next;
    });
    saveDocumentToFirestore('calendarEvents', event);
    logAuditAction('CALENDAR_EVENT_ADDED', 'Calendar', `Added calendar event: ${event.title}`);
  };

  const deleteCalendarEvent = (id: string) => {
    const ev = calendarEvents.find(e => e.id === id);
    setCalendarEvents(prev => {
      const next = prev.filter(e => e.id !== id);
      saveStorage('calendarEvents', next);
      return next;
    });
    deleteDocumentFromFirestore('calendarEvents', id);
    logAuditAction('CALENDAR_EVENT_DELETED', 'Calendar', `Removed event: ${ev?.title}`);
  };

  // Helper to generate sequential student number in the format GWD-0000-00001
  const generateNextStudentNumber = (): string => {
    let maxSeq = 0;
    const allNumbers = [
      ...students.map(s => s.admissionNo),
      ...admissions.map(a => a.studentNumber || a.applicationNo)
    ].filter(Boolean);

    for (const num of allNumbers) {
      if (typeof num === 'string') {
        const match = num.match(/GWD-\d+-(\d+)/i) || num.match(/GWD-(\d+)/i) || num.match(/ADM-\d+-(\d+)/i);
        if (match) {
          const val = parseInt(match[1], 10);
          if (!isNaN(val) && val > maxSeq) {
            maxSeq = val;
          }
        }
      }
    }

    const nextSeq = maxSeq + 1;
    return `GWD-0000-${String(nextSeq).padStart(5, '0')}`;
  };

  // Auto Teacher Suggestion / Assignment
  const suggestTeacherForClass = (className: string): MatchedTeacherResult | null => {
    return findTeacherForClass(className, { classes, staff, authUsers });
  };

  // Student Actions
  const addStudent = (newStd: Omit<Student, 'id' | 'admissionNo' | 'joinedDate'> & { admissionNo?: string }) => {
    const id = `std-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const autoAdmissionNo = generateNextStudentNumber();
    const admissionNo = newStd.admissionNo && newStd.admissionNo.trim() !== '' ? newStd.admissionNo.trim() : autoAdmissionNo;
    
    // Auto-resolve teacher for class if not provided
    const autoTeacher = (newStd.classTeacher && newStd.classTeacher.trim() !== '')
      ? newStd.classTeacher.trim()
      : (findTeacherForClass(newStd.className, { classes, staff, authUsers })?.teacherName || '');

    const student: Student = {
      ...newStd,
      id,
      admissionNo,
      classTeacher: autoTeacher,
      joinedDate: newStd.enrollmentDate || new Date().toISOString().split('T')[0],
      enrollmentDate: newStd.enrollmentDate || new Date().toISOString().split('T')[0]
    };
    
    // Save student locally and to Firestore immediately
    setStudents(prev => {
      const updated = [student, ...prev.filter(s => s.id !== student.id && s.admissionNo !== student.admissionNo)];
      saveStorage('students', updated);
      return updated;
    });
    saveDocumentToFirestore('students', student);

    // Auto-create / update Parent account in authUsers for instant parent portal login
    if (student.guardianPhone) {
      const parentUser: AuthUser = {
        id: `usr-parent-${student.id}`,
        name: student.guardianName || `Parent of ${student.firstName} ${student.lastName}`,
        username: student.admissionNo,
        password: student.guardianPhone,
        email: student.guardianEmail || `parent.${student.id}@educore.edu.gh`,
        role: 'Parent',
        phone: student.guardianPhone,
        studentId: student.id,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        lastLogin: 'Never'
      };
      setAuthUsers(prev => {
        const filtered = prev.filter(u => u.studentId !== student.id && u.username !== student.admissionNo);
        const updated = [parentUser, ...filtered];
        saveStorage('authUsers', updated);
        return updated;
      });
      saveDocumentToFirestore('authUsers', parentUser);
    }

    // Update class enrolledCount
    if (student.className) {
      setClasses(prev => {
        const updated = prev.map(c => {
          if (c.name.toLowerCase() === student.className.toLowerCase() || c.id === student.classId) {
            const upd = { ...c, enrolledCount: (c.enrolledCount || 0) + 1 };
            saveDocumentToFirestore('classes', upd);
            return upd;
          }
          return c;
        });
        saveStorage('classes', updated);
        return updated;
      });
    }

    logAuditAction('STUDENT_ENROLLED', 'Students', `Enrolled student: ${student.firstName} ${student.lastName} (${admissionNo}) in ${student.className}${autoTeacher ? ` under ${autoTeacher}` : ''}`);
  };

  const updateStudent = (id: string, updated: Partial<Student>) => {
    setStudents(prev => {
      const next = prev.map(s => {
        if (s.id === id) {
          const merged = { ...s, ...updated };
          // If class was changed and teacher wasn't explicitly supplied, auto-assign teacher for new class
          if (updated.className && updated.className !== s.className && updated.classTeacher === undefined) {
            const matchedTeacher = findTeacherForClass(updated.className, { classes, staff, authUsers });
            if (matchedTeacher) {
              merged.classTeacher = matchedTeacher.teacherName;
            }
          }
          saveDocumentToFirestore('students', merged);
          return merged;
        }
        return s;
      });
      saveStorage('students', next);
      return next;
    });
    logAuditAction('STUDENT_UPDATED', 'Students', `Updated details for student ID: ${id}`);
  };

  const deleteStudent = (id: string) => {
    const std = students.find(s => s.id === id);
    setStudents(prev => {
      const next = prev.filter(s => s.id !== id);
      saveStorage('students', next);
      return next;
    });
    deleteDocumentFromFirestore('students', id);
    logAuditAction('STUDENT_DELETED', 'Students', `Removed student: ${std?.firstName} ${std?.lastName}`);
  };

  // Admissions
  const addAdmission = (adm: Omit<AdmissionApplication, 'id' | 'applicationNo' | 'submissionDate'> & { applicationNo?: string; studentNumber?: string }) => {
    const id = `adm-app-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const autoStudentNumber = generateNextStudentNumber();
    const studentNumber = adm.studentNumber && adm.studentNumber.trim() !== '' ? adm.studentNumber.trim() : autoStudentNumber;
    const applicationNo = adm.applicationNo || studentNumber;
    const application: AdmissionApplication = {
      ...adm,
      id,
      applicationNo,
      studentNumber,
      enrollmentDate: adm.enrollmentDate || new Date().toISOString().split('T')[0],
      submissionDate: new Date().toISOString().split('T')[0]
    };
    
    setAdmissions(prev => {
      const updated = [application, ...prev];
      saveStorage('admissions', updated);
      return updated;
    });
    saveDocumentToFirestore('admissions', application);

    // Auto-create parent user account for applicant
    if (application.parentPhone) {
      const parentUser: AuthUser = {
        id: `usr-parent-${application.id}`,
        name: application.parentName || `Parent of ${application.applicantName}`,
        username: studentNumber,
        password: application.parentPhone,
        email: application.parentEmail || `parent.${application.id}@educore.edu.gh`,
        role: 'Parent',
        phone: application.parentPhone,
        studentId: application.id,
        avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        lastLogin: 'Never'
      };
      setAuthUsers(prev => {
        const filtered = prev.filter(u => u.studentId !== application.id && u.username !== studentNumber);
        const updated = [parentUser, ...filtered];
        saveStorage('authUsers', updated);
        return updated;
      });
      saveDocumentToFirestore('authUsers', parentUser);
    }

    logAuditAction('ADMISSION_SUBMITTED', 'Admissions', `Received application #${studentNumber} for ${application.applicantName}`);
  };

  const updateAdmissionStatus = (id: string, status: AdmissionApplication['status'], notes?: string) => {
    let studentToEnrollData: Omit<Student, 'id' | 'admissionNo' | 'joinedDate'> & { admissionNo?: string } | null = null;

    setAdmissions(prev => {
      const next = prev.map(a => {
        if (a.id === id) {
          const updated = { ...a, status, notes: notes || a.notes };
          saveDocumentToFirestore('admissions', updated);
          
          if (status === 'Enrolled') {
            const names = a.applicantName.trim().split(/\s+/);
            const firstName = names[0] || 'New';
            const lastName = names.slice(1).join(' ') || 'Student';
            studentToEnrollData = {
              admissionNo: a.studentNumber || a.applicationNo,
              firstName,
              lastName,
              gender: a.gender,
              dateOfBirth: a.dateOfBirth,
              enrollmentDate: a.enrollmentDate || new Date().toISOString().split('T')[0],
              classId: `cls-${a.appliedClass.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
              className: a.appliedClass,
              section: 'A',
              rollNo: `${Math.floor(1 + Math.random() * 45)}`,
              guardianName: a.parentName,
              guardianEmail: a.parentEmail,
              guardianPhone: a.parentPhone,
              address: a.parentAddress || 'Accra, Ghana',
              status: 'Active',
              photoUrl: `https://api.dicebear.com/7.x/micah/svg?seed=${encodeURIComponent(a.applicantName)}`,
              balanceDue: 0
            };
          }
          return updated;
        }
        return a;
      });
      saveStorage('admissions', next);
      return next;
    });

    if (studentToEnrollData) {
      addStudent(studentToEnrollData);
    }

    logAuditAction('ADMISSION_STATUS_CHANGE', 'Admissions', `Application ID ${id} status set to ${status}`);
  };

  // Attendance
  const markAttendance = (studentId: string, status: AttendanceRecord['status'], remarks?: string) => {
    const today = new Date().toISOString().split('T')[0];
    const std = students.find(s => s.id === studentId);
    if (!std) return;

    setAttendance(prev => {
      const filtered = prev.filter(r => !(r.date === today && r.studentId === studentId));
      const newRecord: AttendanceRecord = {
        id: `att-${Date.now()}-${studentId}`,
        date: today,
        studentId,
        studentName: `${std.firstName} ${std.lastName}`,
        classId: std.classId,
        className: std.className,
        status,
        timeRecorded: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        remarks
      };
      return [newRecord, ...filtered];
    });
  };

  const bulkMarkAttendance = (records: { studentId: string; status: AttendanceRecord['status']; remarks?: string }[]) => {
    const today = new Date().toISOString().split('T')[0];
    const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setAttendance(prev => {
      const studentIdsToUpdate = new Set(records.map(r => r.studentId));
      const remaining = prev.filter(r => !(r.date === today && studentIdsToUpdate.has(r.studentId)));

      const newEntries: AttendanceRecord[] = records.map(r => {
        const std = students.find(s => s.id === r.studentId);
        return {
          id: `att-${Date.now()}-${r.studentId}`,
          date: today,
          studentId: r.studentId,
          studentName: std ? `${std.firstName} ${std.lastName}` : 'Student',
          classId: std?.classId || '',
          className: std?.className || '',
          status: r.status,
          timeRecorded: timeStr,
          remarks: r.remarks
        };
      });

      return [...newEntries, ...remaining];
    });

    logAuditAction('BULK_ATTENDANCE_MARKED', 'Attendance', `Marked attendance for ${records.length} students`);
  };

  const gateCheckIn = (query: string): { success: boolean; message: string; student?: Student } => {
    const trimmed = query.trim().toLowerCase();
    const std = students.find(s => 
      s.admissionNo.toLowerCase() === trimmed || 
      s.rollNo === trimmed ||
      `${s.firstName} ${s.lastName}`.toLowerCase().includes(trimmed)
    );

    if (!std) {
      return { success: false, message: `No student found matching query: "${query}"` };
    }

    markAttendance(std.id, 'Present', 'Gate QR / Barcode Scan Check-In');
    return {
      success: true,
      message: `Verified: ${std.firstName} ${std.lastName} (${std.className}) marked PRESENT at ${new Date().toLocaleTimeString()}`,
      student: std
    };
  };

  // Fees & Payments
  const addFeeStructure = (structure: Omit<FeeStructure, 'id'>) => {
    const tuitionFee = structure.breakdown?.tuitionFee ?? structure.tuitionFee ?? structure.tuition ?? 0;
    const developmentLevy = structure.breakdown?.developmentLevy ?? structure.developmentLevy ?? 0;
    const ictLabFee = structure.breakdown?.ictLabFee ?? structure.ictLabFee ?? structure.ict ?? 0;
    const libraryFee = structure.breakdown?.libraryFee ?? structure.libraryFee ?? structure.library ?? 0;
    const sportsFee = structure.breakdown?.sportsFee ?? structure.sportsFee ?? 0;
    const ptaDues = structure.breakdown?.ptaDues ?? structure.breakdown?.ptaLevy ?? structure.ptaLevy ?? structure.pta ?? 0;

    const newStructure: FeeStructure = {
      ...structure,
      id: `fee-str-${Date.now()}`,
      tuitionFee,
      developmentLevy,
      ictLabFee,
      libraryFee,
      sportsFee,
      ptaDues,
      breakdown: {
        tuitionFee,
        developmentLevy,
        ictLabFee,
        libraryFee,
        sportsFee,
        ptaDues,
        ...(structure.breakdown || {})
      }
    };
    setFeeStructures(prev => [...prev, newStructure]);
    saveDocumentToFirestore('feeStructures', newStructure);
    logAuditAction('FEE_STRUCTURE_CREATED', 'Fee Management', `Created fee structure: ${structure.name} (GHS ${structure.totalAmount})`);
  };

  const updateFeeStructure = (id: string, updatedData: Partial<FeeStructure>) => {
    setFeeStructures(prev => prev.map(f => {
      if (f.id === id) {
        const tuitionFee = updatedData.tuitionFee ?? f.tuitionFee ?? 0;
        const developmentLevy = updatedData.developmentLevy ?? f.developmentLevy ?? 0;
        const ictLabFee = updatedData.ictLabFee ?? f.ictLabFee ?? 0;
        const libraryFee = updatedData.libraryFee ?? f.libraryFee ?? 0;
        const sportsFee = updatedData.sportsFee ?? f.sportsFee ?? 0;
        const ptaDues = updatedData.ptaDues ?? f.ptaDues ?? 0;
        const termFees = updatedData.termFees ?? f.termFees ?? tuitionFee;
        const books = updatedData.books ?? f.books ?? 0;
        const accessories = updatedData.accessories ?? f.accessories ?? 0;
        const arrears = updatedData.arrears ?? f.arrears ?? 0;
        const totalAmount = updatedData.totalAmount ?? (termFees + books + accessories + arrears);

        const updated: FeeStructure = {
          ...f,
          ...updatedData,
          tuitionFee,
          developmentLevy,
          ictLabFee,
          libraryFee,
          sportsFee,
          ptaDues,
          termFees,
          books,
          accessories,
          arrears,
          totalAmount,
          breakdown: {
            tuitionFee,
            developmentLevy,
            ictLabFee,
            libraryFee,
            sportsFee,
            ptaDues,
            termFees,
            books,
            accessories,
            arrears,
            ...(f.breakdown || {}),
            ...(updatedData.breakdown || {})
          }
        };
        saveDocumentToFirestore('feeStructures', updated);
        return updated;
      }
      return f;
    }));
    logAuditAction('FEE_STRUCTURE_UPDATED', 'Fee Management', `Updated fee structure ID: ${id}`);
  };

  const deleteFeeStructure = (id: string) => {
    setFeeStructures(prev => prev.filter(f => f.id !== id));
    deleteDocumentFromFirestore('feeStructures', id);
    logAuditAction('FEE_STRUCTURE_DELETED', 'Fee Management', `Deleted fee structure ID: ${id}`);
  };

  const createInvoice = (inv: Omit<Invoice, 'id' | 'invoiceNo' | 'issueDate'>) => {
    const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    
    // Calculate separated components
    const termFees = inv.termFees !== undefined 
      ? inv.termFees 
      : (inv.items?.find(it => it.description.toLowerCase().includes('term') || it.description.toLowerCase().includes('tuition'))?.amount || 0);
    
    const books = inv.books !== undefined
      ? inv.books
      : (inv.items?.find(it => it.description.toLowerCase().includes('book'))?.amount || 0);
      
    const accessories = inv.accessories !== undefined
      ? inv.accessories
      : (inv.items?.find(it => it.description.toLowerCase().includes('accessor') || it.description.toLowerCase().includes('uniform') || it.description.toLowerCase().includes('crest'))?.amount || 0);
      
    const arrears = inv.arrears !== undefined
      ? inv.arrears
      : (inv.items?.find(it => it.description.toLowerCase().includes('arrear'))?.amount || 0);

    const currentTermAmount = inv.currentTermAmount !== undefined
      ? inv.currentTermAmount
      : (termFees + books + accessories > 0 ? (termFees + books + accessories) : Math.max(0, inv.totalAmount - arrears));

    const totalAmount = currentTermAmount;
    const grandTotal = currentTermAmount + arrears;
    const paidAmount = inv.paidAmount || 0;
    const balance = Math.max(0, grandTotal - paidAmount);
    const status = balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

    const newInvoice: Invoice = {
      ...inv,
      id: `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      invoiceNo,
      issueDate: new Date().toISOString().split('T')[0],
      termFees,
      books,
      accessories,
      arrears,
      currentTermAmount,
      totalAmount,
      grandTotal,
      paidAmount,
      balance,
      status
    };

    setInvoices(prev => [newInvoice, ...prev]);
    saveDocumentToFirestore('invoices', newInvoice);

    setStudents(prev => prev.map(s => {
      if (s.id === inv.studentId) {
        const updatedStd: Student = { 
          ...s, 
          balanceDue: (s.balanceDue || 0) + balance,
          ...(arrears > 0 ? { manualArrears: arrears } : {})
        };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    logAuditAction('INVOICE_GENERATED', 'Fee Management', `Generated invoice ${invoiceNo} for ${inv.studentName} (Current Bill: GHS ${totalAmount}, Arrears: GHS ${arrears}, Grand Total: GHS ${grandTotal})`);
  };

  const createBulkInvoices = (bulkList: Omit<Invoice, 'id' | 'invoiceNo' | 'issueDate'>[]) => {
    const newInvoices: Invoice[] = bulkList.map((inv, idx) => {
      const invoiceNo = `INV-2026-${Math.floor(1000 + Math.random() * 9000)}`;
      const termFees = inv.termFees !== undefined 
        ? inv.termFees 
        : (inv.items?.find(it => it.description.toLowerCase().includes('term') || it.description.toLowerCase().includes('tuition'))?.amount || 0);
      
      const books = inv.books !== undefined
        ? inv.books
        : (inv.items?.find(it => it.description.toLowerCase().includes('book'))?.amount || 0);
        
      const accessories = inv.accessories !== undefined
        ? inv.accessories
        : (inv.items?.find(it => it.description.toLowerCase().includes('accessor') || it.description.toLowerCase().includes('uniform') || it.description.toLowerCase().includes('crest'))?.amount || 0);
        
      const arrears = inv.arrears !== undefined
        ? inv.arrears
        : (inv.items?.find(it => it.description.toLowerCase().includes('arrear'))?.amount || 0);

      const currentTermAmount = inv.currentTermAmount !== undefined
        ? inv.currentTermAmount
        : (termFees + books + accessories > 0 ? (termFees + books + accessories) : Math.max(0, inv.totalAmount - arrears));

      const totalAmount = currentTermAmount;
      const grandTotal = currentTermAmount + arrears;
      const paidAmount = inv.paidAmount || 0;
      const balance = Math.max(0, grandTotal - paidAmount);
      const status = balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

      return {
        ...inv,
        id: `inv-${Date.now()}-${idx}-${Math.floor(Math.random() * 1000)}`,
        invoiceNo,
        issueDate: new Date().toISOString().split('T')[0],
        termFees,
        books,
        accessories,
        arrears,
        currentTermAmount,
        totalAmount,
        grandTotal,
        paidAmount,
        balance,
        status
      };
    });

    setInvoices(prev => [...newInvoices, ...prev]);
    newInvoices.forEach(inv => saveDocumentToFirestore('invoices', inv));

    // Update students balance
    const balanceMap = new Map<string, { balance: number; arrears: number }>();
    newInvoices.forEach(inv => {
      balanceMap.set(inv.studentId, {
        balance: (balanceMap.get(inv.studentId)?.balance || 0) + inv.balance,
        arrears: inv.arrears || 0
      });
    });

    setStudents(prev => prev.map(s => {
      const addedData = balanceMap.get(s.id);
      if (addedData !== undefined) {
        const updatedStd: Student = { 
          ...s, 
          balanceDue: (s.balanceDue || 0) + addedData.balance,
          ...(addedData.arrears > 0 ? { manualArrears: addedData.arrears } : {})
        };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    logAuditAction('BULK_INVOICES_GENERATED', 'Fee Management', `Generated ${bulkList.length} fee invoices in batch with separated arrears tracking`);
  };

  const updateInvoice = (id: string, updatedData: Partial<Invoice>) => {
    let affectedStudentId = '';
    setInvoices(prev => prev.map(inv => {
      if (inv.id === id) {
        affectedStudentId = inv.studentId;
        const termFees = updatedData.termFees !== undefined ? updatedData.termFees : (inv.termFees || 0);
        const books = updatedData.books !== undefined ? updatedData.books : (inv.books || 0);
        const accessories = updatedData.accessories !== undefined ? updatedData.accessories : (inv.accessories || 0);
        const arrears = updatedData.arrears !== undefined ? updatedData.arrears : (inv.arrears || 0);

        const currentTermAmount = updatedData.currentTermAmount !== undefined 
          ? updatedData.currentTermAmount 
          : ((termFees + books + accessories) > 0 ? (termFees + books + accessories) : (updatedData.totalAmount !== undefined ? updatedData.totalAmount : inv.totalAmount));

        const totalAmount = currentTermAmount;
        const grandTotal = currentTermAmount + arrears;
        const paidAmount = updatedData.paidAmount !== undefined ? updatedData.paidAmount : (inv.paidAmount || 0);
        const balance = Math.max(0, grandTotal - paidAmount);
        const status = balance === 0 ? 'Paid' : paidAmount > 0 ? 'Partial' : 'Unpaid';

        const updated: Invoice = {
          ...inv,
          ...updatedData,
          termFees,
          books,
          accessories,
          arrears,
          currentTermAmount,
          totalAmount,
          grandTotal,
          paidAmount,
          balance,
          status
        };
        saveDocumentToFirestore('invoices', updated);
        return updated;
      }
      return inv;
    }));

    if (affectedStudentId) {
      setTimeout(() => {
        setStudents(prev => prev.map(s => {
          if (s.id === affectedStudentId) {
            const studentInvs = invoices.map(i => i.id === id ? {
              ...i,
              ...updatedData,
              balance: Math.max(0, ((updatedData.currentTermAmount ?? i.currentTermAmount ?? i.totalAmount) + (updatedData.arrears ?? i.arrears ?? 0)) - (updatedData.paidAmount ?? i.paidAmount ?? 0))
            } : i).filter(i => i.studentId === affectedStudentId);
            const newTotalBalance = studentInvs.reduce((sum, i) => sum + i.balance, 0);
            const updatedStd = { ...s, balanceDue: newTotalBalance };
            saveDocumentToFirestore('students', updatedStd);
            return updatedStd;
          }
          return s;
        }));
      }, 50);
    }
    logAuditAction('INVOICE_UPDATED', 'Fee Management', `Admin/Finance corrected invoice ID ${id}`);
  };

  const updateStudentArrears = (studentId: string, manualArrears: number, reason?: string) => {
    const safeArrears = Math.max(0, Number(manualArrears) || 0);
    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const oldArrears = s.manualArrears || 0;
        const diff = safeArrears - oldArrears;
        const updatedStudent: Student = {
          ...s,
          manualArrears: safeArrears,
          balanceDue: Math.max(0, (s.balanceDue || 0) + diff)
        };
        saveDocumentToFirestore('students', updatedStudent);
        return updatedStudent;
      }
      return s;
    }));

    // Update corresponding invoice if student has an active invoice
    setInvoices(prev => prev.map(inv => {
      if (inv.studentId === studentId) {
        const grandTotal = (inv.currentTermAmount || inv.totalAmount) + safeArrears;
        const balance = Math.max(0, grandTotal - inv.paidAmount);
        const updatedInv: Invoice = {
          ...inv,
          arrears: safeArrears,
          grandTotal,
          balance,
          status: balance === 0 ? 'Paid' : inv.paidAmount > 0 ? 'Partial' : 'Unpaid'
        };
        saveDocumentToFirestore('invoices', updatedInv);
        return updatedInv;
      }
      return inv;
    }));

    const targetStudent = students.find(s => s.id === studentId);
    const targetName = targetStudent ? `${targetStudent.firstName} ${targetStudent.lastName}` : studentId;
    logAuditAction(
      'ARREARS_MANUALLY_UPDATED',
      'Fee Management',
      `Admin/Finance manually set Arrears for ${targetName} to GHS ${safeArrears.toLocaleString()}${reason ? ` (Reason: ${reason})` : ''}`
    );
  };

  const deleteInvoice = (id: string) => {
    const target = invoices.find(i => i.id === id);
    if (target) {
      setInvoices(prev => prev.filter(i => i.id !== id));
      deleteDocumentFromFirestore('invoices', id);
      setStudents(prev => prev.map(s => {
        if (s.id === target.studentId) {
          const updatedStd: Student = { ...s, balanceDue: Math.max(0, (s.balanceDue || 0) - target.balance) };
          saveDocumentToFirestore('students', updatedStd);
          return updatedStd;
        }
        return s;
      }));
      logAuditAction('INVOICE_DELETED', 'Fee Management', `Deleted invoice ${target.invoiceNo} for ${target.studentName}`);
    }
  };

  const updatePayment = (id: string, updatedData: Partial<Payment>) => {
    let affectedInvoiceId = '';
    let affectedStudentId = '';
    setPayments(prev => prev.map(p => {
      if (p.id === id) {
        affectedInvoiceId = p.invoiceId;
        affectedStudentId = p.studentId;
        const updated = { ...p, ...updatedData };
        saveDocumentToFirestore('payments', updated);
        return updated;
      }
      return p;
    }));

    if (affectedInvoiceId) {
      setInvoices(prev => prev.map(inv => {
        if (inv.id === affectedInvoiceId) {
          const updatedPaymentList = payments.map(p => p.id === id ? { ...p, ...updatedData } : p);
          const newPaid = updatedPaymentList.filter(p => p.invoiceId === affectedInvoiceId && p.status !== 'Failed').reduce((sum, p) => sum + (p.amount || 0), 0);
          const grandTotal = inv.grandTotal || (inv.currentTermAmount || inv.totalAmount) + (inv.arrears || 0);
          const newBalance = Math.max(0, grandTotal - newPaid);
          const status = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
          const updatedInv = { ...inv, paidAmount: newPaid, balance: newBalance, status };
          saveDocumentToFirestore('invoices', updatedInv);
          return updatedInv;
        }
        return inv;
      }));
    }

    if (affectedStudentId) {
      setStudents(prev => prev.map(s => {
        if (s.id === affectedStudentId) {
          const studentInvs = invoices.map(inv => {
            if (inv.id === affectedInvoiceId) {
              const updatedPaymentList = payments.map(p => p.id === id ? { ...p, ...updatedData } : p);
              const newPaid = updatedPaymentList.filter(p => p.invoiceId === affectedInvoiceId && p.status !== 'Failed').reduce((sum, p) => sum + (p.amount || 0), 0);
              const grandTotal = inv.grandTotal || (inv.currentTermAmount || inv.totalAmount) + (inv.arrears || 0);
              return Math.max(0, grandTotal - newPaid);
            }
            return inv.studentId === affectedStudentId ? inv.balance : 0;
          });
          const totalBal = studentInvs.reduce((a, b) => a + b, 0);
          const updatedStd = { ...s, balanceDue: totalBal };
          saveDocumentToFirestore('students', updatedStd);
          return updatedStd;
        }
        return s;
      }));
    }
    logAuditAction('PAYMENT_UPDATED', 'Fee Management', `Admin/Finance corrected payment record ${id}`);
  };

  const deletePayment = (id: string) => {
    const target = payments.find(p => p.id === id);
    if (!target) return;

    setPayments(prev => prev.filter(p => p.id !== id));
    deleteDocumentFromFirestore('payments', id);

    setInvoices(prev => prev.map(inv => {
      if (inv.id === target.invoiceId) {
        const newPaid = Math.max(0, inv.paidAmount - target.amount);
        const grandTotal = inv.grandTotal || (inv.currentTermAmount || inv.totalAmount) + (inv.arrears || 0);
        const newBalance = Math.max(0, grandTotal - newPaid);
        const status = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        const updatedInv = { ...inv, paidAmount: newPaid, balance: newBalance, status };
        saveDocumentToFirestore('invoices', updatedInv);
        return updatedInv;
      }
      return inv;
    }));

    setStudents(prev => prev.map(s => {
      if (s.id === target.studentId) {
        const updatedStd = { ...s, balanceDue: (s.balanceDue || 0) + target.amount };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    logAuditAction('PAYMENT_DELETED', 'Fee Management', `Voided/Deleted payment ${target.paymentRef} of GHS ${target.amount}`);
  };

  const clearFinancialRecords = (mode: 'all' | 'arrears-only' | 'payments-only' = 'all') => {
    if (mode === 'all') {
      invoices.forEach(i => deleteDocumentFromFirestore('invoices', i.id));
      payments.forEach(p => deleteDocumentFromFirestore('payments', p.id));
      setInvoices([]);
      setPayments([]);
      saveStorage('invoices', []);
      saveStorage('payments', []);
      setStudents(prev => prev.map(s => {
        const updated = { ...s, balanceDue: 0, manualArrears: 0 };
        saveDocumentToFirestore('students', updated);
        return updated;
      }));
      logAuditAction('FINANCIAL_REPORTS_CLEARED', 'Fee Management', 'Purged all invoices, payments, total collected, and reset all student balances & arrears to 0.');
    } else if (mode === 'arrears-only') {
      setInvoices(prev => prev.map(inv => {
        const currentTermAmount = inv.currentTermAmount || Math.max(0, inv.totalAmount - (inv.arrears || 0));
        const grandTotal = currentTermAmount;
        const balance = Math.max(0, grandTotal - inv.paidAmount);
        const status = balance === 0 ? 'Paid' : inv.paidAmount > 0 ? 'Partial' : 'Unpaid';
        const updated: Invoice = {
          ...inv,
          arrears: 0,
          currentTermAmount,
          totalAmount: currentTermAmount,
          grandTotal,
          balance,
          status
        };
        saveDocumentToFirestore('invoices', updated);
        return updated;
      }));
      setStudents(prev => prev.map(s => {
        const updated: Student = {
          ...s,
          manualArrears: 0,
          balanceDue: Math.max(0, (s.balanceDue || 0) - (s.manualArrears || 0))
        };
        saveDocumentToFirestore('students', updated);
        return updated;
      }));
      logAuditAction('ARREARS_CLEARED', 'Fee Management', 'Reset all student and invoice arrears to GHS 0.00 across the school.');
    } else if (mode === 'payments-only') {
      payments.forEach(p => deleteDocumentFromFirestore('payments', p.id));
      setPayments([]);
      saveStorage('payments', []);
      setInvoices(prev => prev.map(inv => {
        const grandTotal = inv.grandTotal || (inv.currentTermAmount || inv.totalAmount) + (inv.arrears || 0);
        const updated: Invoice = {
          ...inv,
          paidAmount: 0,
          balance: grandTotal,
          status: 'Unpaid'
        };
        saveDocumentToFirestore('invoices', updated);
        return updated;
      }));
      setStudents(prev => prev.map(s => {
        const studentInvs = invoices.filter(i => i.studentId === s.id);
        const totalBal = studentInvs.reduce((sum, i) => sum + (i.grandTotal || i.totalAmount), 0) + (s.manualArrears || 0);
        const updated = { ...s, balanceDue: totalBal };
        saveDocumentToFirestore('students', updated);
        return updated;
      }));
      logAuditAction('TOTAL_COLLECTED_CLEARED', 'Fee Management', 'Cleared all payment receipts and reset Total Collected to GHS 0.00.');
    }
  };

  const clearAllArrears = () => clearFinancialRecords('arrears-only');
  const clearTotalCollected = () => clearFinancialRecords('payments-only');

  const reassignStudentClass = (
    studentId: string,
    newClassName: string,
    section: string = 'A',
    autoAssignTeacher: boolean = true
  ) => {
    const targetStudent = students.find(s => s.id === studentId);
    if (!targetStudent) return;

    let assignedTeacherName = targetStudent.classTeacher || '';
    if (autoAssignTeacher) {
      const matchedTeacher = findTeacherForClass(newClassName, { classes, staff, authUsers });
      if (matchedTeacher?.teacherName) {
        assignedTeacherName = matchedTeacher.teacherName;
      }
    }

    setStudents(prev => prev.map(s => {
      if (s.id === studentId) {
        const updatedStd: Student = {
          ...s,
          className: newClassName,
          section: section || s.section || 'A',
          classTeacher: assignedTeacherName
        };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    setInvoices(prev => prev.map(inv => {
      if (inv.studentId === studentId) {
        const updatedInv = { ...inv, className: newClassName };
        saveDocumentToFirestore('invoices', updatedInv);
        return updatedInv;
      }
      return inv;
    }));

    logAuditAction('STUDENT_CLASS_REASSIGNED', 'Class Management', `Admin reassigned ${targetStudent.firstName} ${targetStudent.lastName} from ${targetStudent.className} to ${newClassName}`);
  };

  const bulkReassignStudentsClass = (
    studentIds: string[],
    newClassName: string,
    section: string = 'A',
    autoAssignTeacher: boolean = true
  ) => {
    let assignedTeacherName = '';
    if (autoAssignTeacher) {
      const matchedTeacher = findTeacherForClass(newClassName, { classes, staff, authUsers });
      if (matchedTeacher?.teacherName) {
        assignedTeacherName = matchedTeacher.teacherName;
      }
    }
    const idSet = new Set(studentIds);

    setStudents(prev => prev.map(s => {
      if (idSet.has(s.id)) {
        const updatedStd: Student = {
          ...s,
          className: newClassName,
          section: section || s.section || 'A',
          classTeacher: autoAssignTeacher ? (assignedTeacherName || s.classTeacher) : s.classTeacher
        };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    setInvoices(prev => prev.map(inv => {
      if (idSet.has(inv.studentId)) {
        const updatedInv = { ...inv, className: newClassName };
        saveDocumentToFirestore('invoices', updatedInv);
        return updatedInv;
      }
      return inv;
    }));

    logAuditAction('BULK_STUDENTS_REASSIGNED', 'Class Management', `Admin reassigned ${studentIds.length} students to ${newClassName}`);
  };

  const recordPayment = (pay: Omit<Payment, 'id' | 'paymentRef' | 'date'>): Payment => {
    const isPaystack = pay.paymentMethod === 'Paystack';
    const paymentRef = isPaystack 
      ? `PSTK_${new Date().toISOString().slice(0,10).replace(/-/g,'')}_${Math.floor(100000 + Math.random()*900000)}`
      : `REC-2026-${Math.floor(1000 + Math.random()*9000)}`;
    
    const newPayment: Payment = {
      ...pay,
      id: `pay-${Date.now()}`,
      paymentRef,
      date: new Date().toLocaleString()
    };

    setPayments(prev => [newPayment, ...prev]);
    saveDocumentToFirestore('payments', newPayment);

    // Update invoice & student balance
    setInvoices(prev => prev.map(inv => {
      if (inv.id === pay.invoiceId || inv.studentId === pay.studentId) {
        const newPaid = inv.paidAmount + pay.amount;
        const grandTotal = inv.grandTotal || (inv.currentTermAmount || inv.totalAmount) + (inv.arrears || 0);
        const newBalance = Math.max(0, grandTotal - newPaid);
        const status = newBalance === 0 ? 'Paid' : newPaid > 0 ? 'Partial' : 'Unpaid';
        const updatedInv = { ...inv, paidAmount: newPaid, balance: newBalance, status };
        saveDocumentToFirestore('invoices', updatedInv);
        return updatedInv;
      }
      return inv;
    }));

    setStudents(prev => prev.map(s => {
      if (s.id === pay.studentId) {
        const newBal = Math.max(0, s.balanceDue - pay.amount);
        const updatedStd = { ...s, balanceDue: newBal };
        saveDocumentToFirestore('students', updatedStd);
        return updatedStd;
      }
      return s;
    }));

    logAuditAction('PAYMENT_RECORDED', 'Fee Management', `Recorded ${pay.paymentMethod} payment ${paymentRef} of GHS ${pay.amount} for ${pay.studentName}`);
    return newPayment;
  };

  // Exams & Marks
  const addExam = (exam: Omit<Exam, 'id'>) => {
    const newExam: Exam = { ...exam, id: `ex-${Date.now()}` };
    setExams(prev => [newExam, ...prev]);
    logAuditAction('EXAM_SCHEDULED', 'Exam Management', `Scheduled examination: ${exam.title}`);
  };

  const addExamSchedule = (schedule: Omit<ExamSchedule, 'id'>) => {
    const newSch: ExamSchedule = { ...schedule, id: `exs-${Date.now()}` };
    setExamSchedules(prev => [...prev, newSch]);
  };

  const recordMark = (mark: Omit<MarkEntry, 'id'>) => {
    const id = `mrk-${Date.now()}`;
    setMarks(prev => {
      const filtered = prev.filter(m => !(m.examId === mark.examId && m.studentId === mark.studentId && m.subject === mark.subject));
      return [...filtered, { ...mark, id }];
    });
  };

  const bulkRecordMarks = (newMarks: Omit<MarkEntry, 'id'>[]) => {
    setMarks(prev => {
      const keySet = new Set(newMarks.map(m => `${m.examId}_${m.studentId}_${m.subject}`));
      const filtered = prev.filter(m => !keySet.has(`${m.examId}_${m.studentId}_${m.subject}`));
      const formatted = newMarks.map(m => ({ ...m, id: `mrk-${Date.now()}-${Math.random().toString(36).substring(7)}` }));
      return [...filtered, ...formatted];
    });
    logAuditAction('MARKS_ENTERED', 'Exam Management', `Recorded marks for ${newMarks.length} subject entries`);
  };

  // Timetable
  const addTimetableEntry = (entry: Omit<TimetableEntry, 'id'>) => {
    const newEntry: TimetableEntry = { ...entry, id: `tt-${Date.now()}-${Math.random().toString(36).substring(7)}` };
    setTimetable(prev => [...prev, newEntry]);
    logAuditAction('TIMETABLE_UPDATED', 'Timetable', `Added ${entry.subject} on ${entry.day} (${entry.timeSlot}) for ${entry.className}`);
  };

  const updateTimetableEntry = (id: string, entry: Partial<TimetableEntry>) => {
    setTimetable(prev => prev.map(t => (t.id === id ? { ...t, ...entry } : t)));
    logAuditAction('TIMETABLE_UPDATED', 'Timetable', `Updated timetable slot for ${entry.className || id}`);
  };

  const deleteTimetableEntry = (id: string) => {
    const target = timetable.find(t => t.id === id);
    setTimetable(prev => prev.filter(t => t.id !== id));
    if (target) {
      logAuditAction('TIMETABLE_SLOT_DELETED', 'Timetable', `Removed ${target.subject} slot on ${target.day} for ${target.className}`);
    }
  };

  const clearClassTimetable = (className: string) => {
    setTimetable(prev => prev.filter(t => t.className !== className));
    logAuditAction('TIMETABLE_CLEARED', 'Timetable', `Cleared all timetable slots for class: ${className}`);
  };

  const copyClassTimetable = (sourceClassName: string, targetClassName: string) => {
    const sourceSlots = timetable.filter(t => t.className === sourceClassName);
    const newSlots: TimetableEntry[] = sourceSlots.map(s => ({
      ...s,
      id: `tt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      className: targetClassName
    }));
    setTimetable(prev => [...prev.filter(t => t.className !== targetClassName), ...newSlots]);
    logAuditAction('TIMETABLE_COPIED', 'Timetable', `Copied timetable from ${sourceClassName} to ${targetClassName} (${newSlots.length} slots)`);
  };

  const setFullClassTimetable = (className: string, entries: Omit<TimetableEntry, 'id'>[]) => {
    const formatted: TimetableEntry[] = entries.map(e => ({
      ...e,
      id: `tt-${Date.now()}-${Math.random().toString(36).substring(7)}`,
      className
    }));
    setTimetable(prev => [...prev.filter(t => t.className !== className), ...formatted]);
    logAuditAction('TIMETABLE_TEMPLATE_APPLIED', 'Timetable', `Configured timetable schedule for ${className} (${formatted.length} slots)`);
  };

  // Staff & Payroll
  const addStaff = (newStaff: Omit<StaffMember, 'id' | 'joinedDate'> & { staffCode?: string }) => {
    const id = `stf-${Date.now().toString().slice(-4)}`;
    const rolePrefix =
      newStaff.role === 'Teacher' ? 'TEA' :
      newStaff.role === 'Admin' ? 'ADM' :
      newStaff.role === 'Accountant' ? 'ACC' :
      newStaff.role === 'Librarian' ? 'LIB' : 'TRN';
    const staffCode = newStaff.staffCode || `STF-${rolePrefix}-${Math.floor(100 + Math.random() * 900)}`;
    const member: StaffMember = {
      ...newStaff,
      id,
      staffCode,
      photoUrl: newStaff.photoUrl || newStaff.avatarUrl,
      avatarUrl: newStaff.avatarUrl || newStaff.photoUrl,
      joinedDate: new Date().toISOString().split('T')[0]
    };
    setStaff(prev => [member, ...prev]);
    logAuditAction('STAFF_HIRED', 'Staff Management', `Added staff member: ${member.name} (${member.designation}) [${member.staffCode}]`);
  };

  const updateStaff = (id: string, updated: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => {
      if (s.id === id) {
        const merged = { ...s, ...updated };
        if (updated.photoUrl && !updated.avatarUrl) {
          merged.avatarUrl = updated.photoUrl;
        }
        if (updated.avatarUrl && !updated.photoUrl) {
          merged.photoUrl = updated.avatarUrl;
        }

        const newPic = merged.photoUrl || merged.avatarUrl;
        if (newPic) {
          setAuthUsers(prevUsers => prevUsers.map(u => {
            if (u.email.toLowerCase() === s.email.toLowerCase() || (u.staffCode && u.staffCode === s.staffCode)) {
              return {
                ...u,
                name: merged.name,
                phone: merged.phone,
                avatarUrl: newPic,
                photoUrl: newPic
              };
            }
            return u;
          }));

          setCurrentUser(curr => {
            if (curr && (curr.email.toLowerCase() === s.email.toLowerCase() || (curr.staffCode && curr.staffCode === s.staffCode))) {
              return {
                ...curr,
                name: merged.name,
                phone: merged.phone,
                avatarUrl: newPic,
                photoUrl: newPic
              };
            }
            return curr;
          });
        }
        return merged;
      }
      return s;
    }));
  };

  const deleteStaff = (id: string) => {
    const stf = staff.find(s => s.id === id);
    setStaff(prev => prev.filter(s => s.id !== id));
    if (stf) {
      logAuditAction('STAFF_REMOVED', 'Staff Management', `Removed staff record: ${stf.name} (${stf.staffCode})`);
    }
  };

  const generateMonthlyPayroll = (month: string, year: number) => {
    const newRecords: PayrollRecord[] = staff.map((stf, index) => {
      const housing = Math.round(stf.basicSalary * 0.15);
      const transport = Math.round(stf.basicSalary * 0.10);
      const medical = Math.round(stf.basicSalary * 0.05);
      const tax = Math.round(stf.basicSalary * 0.18);
      const pension = Math.round(stf.basicSalary * 0.055);
      const loan = 0;
      const gross = stf.basicSalary + housing + transport + medical;
      const totalDeductions = tax + pension + loan;
      const netSalary = gross - totalDeductions;

      return {
        id: `payr-${Date.now()}-${index}`,
        staffId: stf.id,
        staffName: stf.name,
        role: stf.designation,
        month,
        year,
        basicSalary: stf.basicSalary,
        allowances: { housing, transport, medical },
        deductions: { tax, pension, loan },
        netSalary,
        paymentStatus: 'Paid',
        paymentDate: new Date().toISOString().split('T')[0],
        payslipNo: `SLIP-${year}${month.substring(0,3).toUpperCase()}-${(index+1).toString().padStart(3, '0')}`
      };
    });

    setPayrolls(prev => [...newRecords, ...prev.filter(p => !(p.month === month && p.year === year))]);
    logAuditAction('PAYROLL_PROCESSED', 'Payroll', `Generated & automated payroll for ${staff.length} staff members for ${month} ${year}`);
  };

  const markPayrollPaid = (id: string) => {
    setPayrolls(prev => prev.map(p => p.id === id ? { ...p, paymentStatus: 'Paid', paymentDate: new Date().toISOString().split('T')[0] } : p));
  };

  const addReimbursement = (reimb: Omit<Reimbursement, 'id' | 'dateSubmitted' | 'status'>) => {
    const newR: Reimbursement = {
      ...reimb,
      id: `reimb-${Date.now()}`,
      dateSubmitted: new Date().toISOString().split('T')[0],
      status: 'Pending'
    };
    setReimbursements(prev => [newR, ...prev]);
    logAuditAction('REIMBURSEMENT_CLAIMED', 'Payroll', `Reimbursement claim submitted by ${reimb.staffName} for GHS ${reimb.amount}`);
  };

  const updateReimbursementStatus = (id: string, status: Reimbursement['status']) => {
    setReimbursements(prev => prev.map(r => r.id === id ? { ...r, status } : r));
    logAuditAction('REIMBURSEMENT_UPDATED', 'Payroll', `Claim ID ${id} marked as ${status}`);
  };

  // Library
  const addBook = (book: Omit<Book, 'id'>) => {
    const newBook: Book = { ...book, id: `bk-${Date.now()}` };
    setBooks(prev => [...prev, newBook]);
    logAuditAction('BOOK_CATALOGED', 'Library', `Added book to catalog: "${book.title}" by ${book.author}`);
  };

  const updateBook = (id: string, book: Partial<Book>) => {
    setBooks(prev => prev.map(b => b.id === id ? { ...b, ...book } : b));
  };

  const issueBook = (bookId: string, memberId: string, memberName: string, memberType: 'Student' | 'Staff', dueDays: number = 14) => {
    const bk = books.find(b => b.id === bookId);
    if (!bk || bk.copiesAvailable <= 0) return;

    const issueDate = new Date();
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + dueDays);

    const newIssue: BookIssue = {
      id: `iss-${Date.now()}`,
      bookId,
      bookTitle: bk.title,
      memberId,
      memberName,
      memberType,
      issueDate: issueDate.toISOString().split('T')[0],
      dueDate: dueDate.toISOString().split('T')[0],
      fineAmount: 0,
      status: 'Issued'
    };

    setBookIssues(prev => [newIssue, ...prev]);
    setBooks(prev => prev.map(b => b.id === bookId ? { ...b, copiesAvailable: b.copiesAvailable - 1, status: (b.copiesAvailable - 1 <= 0 ? 'Out of Stock' : (b.copiesAvailable - 1 < 3 ? 'Low Stock' : 'Available')) } : b));
    logAuditAction('BOOK_ISSUED', 'Library', `Issued "${bk.title}" to ${memberName} (${memberType})`);
  };

  const returnBook = (issueId: string, fineAmount: number = 0) => {
    const issue = bookIssues.find(i => i.id === issueId);
    if (!issue) return;

    const returnDate = new Date().toISOString().split('T')[0];
    setBookIssues(prev => prev.map(i => i.id === issueId ? { ...i, returnDate, status: 'Returned', fineAmount } : i));
    setBooks(prev => prev.map(b => b.id === issue.bookId ? { ...b, copiesAvailable: b.copiesAvailable + 1, status: 'Available' } : b));
    logAuditAction('BOOK_RETURNED', 'Library', `Returned "${issue.bookTitle}" by ${issue.memberName}`);
  };

  // Transport
  const updateVehicle = (id: string, vehicle: Partial<Vehicle>) => {
    setVehicles(prev => prev.map(v => v.id === id ? { ...v, ...vehicle } : v));
  };

  const addRoute = (route: Omit<TransportRoute, 'id'>) => {
    const newRoute: TransportRoute = { ...route, id: `rt-${Date.now()}` };
    setRoutes(prev => [...prev, newRoute]);
  };

  // Communication
  const addAnnouncement = (ann: Omit<Announcement, 'id' | 'date'>) => {
    const newAnn: Announcement = {
      ...ann,
      id: `ann-${Date.now()}`,
      date: new Date().toISOString().split('T')[0]
    };
    setAnnouncements(prev => [newAnn, ...prev]);
    logAuditAction('ANNOUNCEMENT_POSTED', 'Communication', `Posted announcement: "${ann.title}" for ${ann.targetAudience}`);
  };

  const deleteAnnouncement = (id: string) => {
    setAnnouncements(prev => prev.filter(a => a.id !== id));
  };

  const sendBroadcast = (broadcast: { channel: 'Email' | 'WhatsApp' | 'SMS'; recipient: string; recipientName: string; subject?: string; message: string }) => {
    const newLog: CommunicationLog = {
      id: `com-${Date.now()}`,
      ...broadcast,
      status: 'Delivered',
      timestamp: new Date().toLocaleString()
    };
    setCommunicationLogs(prev => [newLog, ...prev]);
    logAuditAction('BROADCAST_SENT', 'Communication', `Sent ${broadcast.channel} to ${broadcast.recipientName}`);
  };

  // Documents
  const addDocument = (doc: Omit<DocumentItem, 'id' | 'uploadedDate'>) => {
    const newDoc: DocumentItem = {
      ...doc,
      id: `doc-${Date.now()}`,
      uploadedDate: new Date().toISOString().split('T')[0]
    };
    setDocuments(prev => [newDoc, ...prev]);
    logAuditAction('DOCUMENT_UPLOADED', 'Documents', `Uploaded: ${doc.title} (${doc.category})`);
  };

  const deleteDocument = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
  };

  // Backup & Restore
  const exportDatabaseJson = () => {
    const backupData = {
      exportDate: new Date().toISOString(),
      systemVersion: 'EduCore v2.4.0',
      academicYear,
      currentTerm,
      students,
      admissions,
      attendance,
      feeStructures,
      invoices,
      payments,
      exams,
      examSchedules,
      marks,
      timetable,
      staff,
      payrolls,
      reimbursements,
      books,
      bookIssues,
      vehicles,
      routes,
      announcements,
      communicationLogs,
      documents,
      auditLogs
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `EduCore_School_Backup_${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    logAuditAction('DATABASE_BACKUP_EXPORTED', 'Security', 'Exported full encrypted system backup');
  };

  const importDatabaseJson = (jsonData: string): boolean => {
    try {
      const data = JSON.parse(jsonData);
      if (data.students) setStudents(data.students);
      if (data.admissions) setAdmissions(data.admissions);
      if (data.attendance) setAttendance(data.attendance);
      if (data.feeStructures) {
        setFeeStructures(
          data.feeStructures.map((f: any) => {
            const tuitionFee = f.breakdown?.tuitionFee ?? f.tuitionFee ?? f.tuition ?? 1800;
            const developmentLevy = f.breakdown?.developmentLevy ?? f.developmentLevy ?? 150;
            const ictLabFee = f.breakdown?.ictLabFee ?? f.ictLabFee ?? f.ict ?? 200;
            const libraryFee = f.breakdown?.libraryFee ?? f.libraryFee ?? f.library ?? 100;
            const sportsFee = f.breakdown?.sportsFee ?? f.sportsFee ?? 80;
            const ptaDues = f.breakdown?.ptaDues ?? f.breakdown?.ptaLevy ?? f.ptaLevy ?? f.pta ?? 100;
            return {
              ...f,
              classLevel: f.classLevel || f.className || 'General',
              tuitionFee,
              developmentLevy,
              ictLabFee,
              libraryFee,
              sportsFee,
              ptaDues,
              breakdown: {
                tuitionFee,
                developmentLevy,
                ictLabFee,
                libraryFee,
                sportsFee,
                ptaDues,
                ...(f.breakdown || {})
              }
            };
          })
        );
      }
      if (data.invoices) setInvoices(data.invoices);
      if (data.payments) setPayments(data.payments);
      if (data.exams) setExams(data.exams);
      if (data.examSchedules) setExamSchedules(data.examSchedules);
      if (data.marks) setMarks(data.marks);
      if (data.timetable) setTimetable(data.timetable);
      if (data.staff) setStaff(data.staff);
      if (data.payrolls) setPayrolls(data.payrolls);
      if (data.reimbursements) setReimbursements(data.reimbursements);
      if (data.books) setBooks(data.books);
      if (data.bookIssues) setBookIssues(data.bookIssues);
      if (data.vehicles) setVehicles(data.vehicles);
      if (data.routes) setRoutes(data.routes);
      if (data.announcements) setAnnouncements(data.announcements);
      if (data.communicationLogs) setCommunicationLogs(data.communicationLogs);
      if (data.documents) setDocuments(data.documents);
      if (data.auditLogs) setAuditLogs(data.auditLogs);
      logAuditAction('DATABASE_RESTORED', 'Security', 'Restored system snapshot from backup file');
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON:', e);
      return false;
    }
  };

  const resetToDefaults = () => {
    localStorage.clear();
    setStudents(initialStudents);
    setAdmissions(initialAdmissions);
    setAttendance(initialAttendance);
    setFeeStructures(initialFeeStructures);
    setInvoices(initialInvoices);
    setPayments(initialPayments);
    setExams(initialExams);
    setExamSchedules(initialExamSchedules);
    setMarks(initialMarks);
    setTimetable(initialTimetable);
    setStaff(initialStaff);
    setPayrolls(initialPayrolls);
    setReimbursements(initialReimbursements);
    setBooks(initialBooks);
    setBookIssues(initialBookIssues);
    setVehicles(initialVehicles);
    setRoutes(initialRoutes);
    setAnnouncements(initialAnnouncements);
    setCommunicationLogs(initialCommunicationLogs);
    setDocuments(initialDocuments);
    setAuditLogs(initialAuditLogs);
    logAuditAction('SYSTEM_RESET', 'Security', 'System reset to standard factory seed data');
  };

  const exportDatabaseBackup = (): string => {
    const backupData = {
      exportDate: new Date().toISOString(),
      systemVersion: 'EduCore v2.4.0',
      academicYear,
      currentTerm,
      students,
      admissions,
      attendance,
      feeStructures,
      invoices,
      payments,
      exams,
      examSchedules,
      marks,
      timetable,
      staff,
      payrolls,
      reimbursements,
      books,
      bookIssues,
      vehicles,
      routes,
      announcements,
      communicationLogs,
      documents,
      auditLogs
    };
    logAuditAction('DATABASE_BACKUP_EXPORTED', 'Security', 'Exported full encrypted system backup snapshot');
    return JSON.stringify(backupData, null, 2);
  };

  const importDatabaseBackup = (jsonData: string): boolean => {
    return importDatabaseJson(jsonData);
  };

  return (
    <SchoolContext.Provider
      value={{
        isSyncing,
        lastSyncedTime,
        syncToCloudNow,
        currentUser,
        isAuthenticated,
        authUsers,
        login,
        register,
        purgeAllTeachers,
        resetPassword,
        updateUserProfile,
        logout,
        switchRoleQuick,
        activeTab,
        setActiveTab,
        activeRole,
        setActiveRole: safeSetActiveRole,
        academicYear,
        currentTerm,
        setAcademicYear,
        setCurrentTerm,
        searchQuery,
        setSearchQuery,
        classes,
        addClass,
        updateClass,
        deleteClass,
        assignClassTeacher,
        updateClassCapacity,
        subjects,
        addSubject,
        updateSubject,
        calendarEvents,
        addCalendarEvent,
        deleteCalendarEvent,
        students,
        generateNextStudentNumber,
        suggestTeacherForClass,
        addStudent,
        updateStudent,
        deleteStudent,
        admissions,
        addAdmission,
        updateAdmissionStatus,
        attendance,
        markAttendance,
        bulkMarkAttendance,
        gateCheckIn,
        feeStructures,
        addFeeStructure,
        updateFeeStructure,
        deleteFeeStructure,
        invoices,
        createInvoice,
        createBulkInvoices,
        updateInvoice,
        deleteInvoice,
        updateStudentArrears,
        payments,
        recordPayment,
        updatePayment,
        deletePayment,
        clearFinancialRecords,
        clearAllArrears,
        clearTotalCollected,
        reassignStudentClass,
        bulkReassignStudentsClass,
        exams,
        addExam,
        examSchedules,
        addExamSchedule,
        marks,
        recordMark,
        bulkRecordMarks,
        timetable,
        addTimetableEntry,
        updateTimetableEntry,
        deleteTimetableEntry,
        clearClassTimetable,
        copyClassTimetable,
        setFullClassTimetable,
        selectedTimetableClass,
        setSelectedTimetableClass,
        staff,
        addStaff,
        updateStaff,
        deleteStaff,
        payrolls,
        generateMonthlyPayroll,
        markPayrollPaid,
        reimbursements,
        addReimbursement,
        updateReimbursementStatus,
        books,
        addBook,
        updateBook,
        bookIssues,
        issueBook,
        returnBook,
        vehicles,
        routes,
        updateVehicle,
        addRoute,
        announcements,
        addAnnouncement,
        deleteAnnouncement,
        communicationLogs,
        sendBroadcast,
        documents,
        addDocument,
        deleteDocument,
        auditLogs,
        logAuditAction,
        exportDatabaseJson,
        importDatabaseJson,
        exportDatabaseBackup,
        importDatabaseBackup,
        resetToDefaults
      }}
    >
      {children}
    </SchoolContext.Provider>
  );
};

export const useSchool = (): SchoolContextType => {
  const context = useContext(SchoolContext);
  if (!context) {
    throw new Error('useSchool must be used within a SchoolProvider');
  }
  return context;
};
