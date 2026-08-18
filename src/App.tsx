import React, { useState } from 'react';
import { SchoolProvider, useSchool } from './context/SchoolContext';
import { Header } from './components/common/Header';
import { Sidebar } from './components/common/Sidebar';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { TeacherDashboard } from './components/dashboard/TeacherDashboard';
import { AccountantDashboard } from './components/dashboard/AccountantDashboard';
import { ParentDashboard } from './components/dashboard/ParentDashboard';
import { ParentMyChild } from './components/parent/ParentMyChild';
import { StudentManagement } from './components/students/StudentManagement';
import { ClassManagement } from './components/classes/ClassManagement';
import { SubjectManagement } from './components/subjects/SubjectManagement';
import { AcademicCalendar } from './components/calendar/AcademicCalendar';
import { AnnouncementCenter } from './components/announcements/AnnouncementCenter';
import { AdmissionManagement } from './components/admissions/AdmissionManagement';
import { AttendanceManagement } from './components/attendance/AttendanceManagement';
import { FeeManagement } from './components/fees/FeeManagement';
import { ExamManagement } from './components/exams/ExamManagement';
import { TimetableManagement } from './components/timetable/TimetableManagement';
import { StaffManagement } from './components/staff/StaffManagement';
import { PayrollManagement } from './components/payroll/PayrollManagement';
import { LibraryManagement } from './components/library/LibraryManagement';
import { TransportManagement } from './components/transport/TransportManagement';
import { CommunicationSuite } from './components/communication/CommunicationSuite';
import { CustomReportsAnalytics } from './components/reports/CustomReportsAnalytics';
import { FinancialReportsPage } from './components/reports/FinancialReportsPage';
import { DocumentManagement } from './components/documents/DocumentManagement';
import { BackupSecurity } from './components/security/BackupSecurity';
import { PaystackModal } from './components/paystack/PaystackModal';
import { AuthPage } from './components/auth/AuthPage';
import { AnimatePresence, motion } from 'motion/react';
import { Invoice } from './types';

const MainContent: React.FC = () => {
  const { activeTab, activeRole, isAuthenticated } = useSchool();
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Paystack modal state
  const [paystackModal, setPaystackModal] = useState<{
    isOpen: boolean;
    invoice?: Invoice;
    customAmount?: number;
    studentName?: string;
    studentId?: string;
  }>({
    isOpen: false
  });

  const handleOpenPaystack = (
    invoice?: Invoice,
    customAmount?: number,
    studentName?: string,
    studentId?: string
  ) => {
    setPaystackModal({
      isOpen: true,
      invoice,
      customAmount,
      studentName,
      studentId
    });
  };

  const handleClosePaystack = () => {
    setPaystackModal((prev) => ({ ...prev, isOpen: false }));
  };

  if (!isAuthenticated) {
    return <AuthPage />;
  }

  const renderActiveView = () => {
    // 1. Parent Portal View Routing
    if (activeRole === 'Parent') {
      switch (activeTab) {
        case 'my-child':
          return <ParentMyChild onOpenPaystackForStudent={(std) => handleOpenPaystack(undefined, std.balanceDue, `${std.firstName} ${std.lastName}`, std.id)} />;
        case 'dashboard':
        default:
          return <ParentDashboard onOpenPaystack={handleOpenPaystack} />;
      }
    }

    // 2. Accountant Portal View Routing
    if (activeRole === 'Accountant') {
      switch (activeTab) {
        case 'reports':
          return <FinancialReportsPage onOpenPaystack={handleOpenPaystack} />;
        case 'announcements':
          return <AnnouncementCenter />;
        case 'fees':
          return <FinancialReportsPage onOpenPaystack={handleOpenPaystack} />;
        case 'dashboard':
        default:
          return <AccountantDashboard onOpenPaystack={handleOpenPaystack} />;
      }
    }

    // 3. Teacher Portal View Routing (Strict Role-Based Isolation: Teachers only have access to their teacher portal)
    if (activeRole === 'Teacher') {
      switch (activeTab) {
        case 'students':
          return <StudentManagement onOpenPaystackForStudent={(std) => handleOpenPaystack(undefined, std.balanceDue, `${std.firstName} ${std.lastName}`, std.id)} />;
        case 'library':
          return <LibraryManagement />;
        case 'classes':
          return <ClassManagement />;
        case 'subjects':
          return <SubjectManagement />;
        case 'timetable':
          return <TimetableManagement />;
        case 'attendance':
          return <AttendanceManagement />;
        case 'exams':
          return <ExamManagement />;
        case 'calendar':
          return <AcademicCalendar />;
        case 'announcements':
          return <AnnouncementCenter />;
        case 'dashboard':
        default:
          return <TeacherDashboard />;
      }
    }

    // 4. Admin & Management View Routing
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview onOpenPaystack={() => handleOpenPaystack()} onOpenGateScanner={() => {}} />;
      case 'my-child':
        return <ParentMyChild onOpenPaystackForStudent={(std) => handleOpenPaystack(undefined, std.balanceDue, `${std.firstName} ${std.lastName}`, std.id)} />;
      case 'students':
        return <StudentManagement onOpenPaystackForStudent={(std) => handleOpenPaystack(undefined, std.balanceDue, `${std.firstName} ${std.lastName}`, std.id)} />;
      case 'classes':
        return <ClassManagement />;
      case 'subjects':
        return <SubjectManagement />;
      case 'calendar':
        return <AcademicCalendar />;
      case 'announcements':
        return <AnnouncementCenter />;
      case 'admissions':
        return <AdmissionManagement />;
      case 'attendance':
        return <AttendanceManagement />;
      case 'fees':
        return <FeeManagement onOpenPaystack={handleOpenPaystack} />;
      case 'exams':
        return <ExamManagement />;
      case 'timetable':
        return <TimetableManagement />;
      case 'staff':
        return <StaffManagement />;
      case 'payroll':
        return <PayrollManagement />;
      case 'library':
        return <LibraryManagement />;
      case 'transport':
        return <TransportManagement />;
      case 'communication':
        return <CommunicationSuite />;
      case 'reports':
        return <FinancialReportsPage onOpenPaystack={handleOpenPaystack} />;
      case 'documents':
        return <DocumentManagement />;
      case 'security':
        return <BackupSecurity />;
      default:
        return <DashboardOverview onOpenPaystack={() => handleOpenPaystack()} onOpenGateScanner={() => {}} />;
    }
  };

  return (
    <div className="flex h-screen w-full bg-[#f8fafc] text-slate-800 overflow-hidden font-['Inter',sans-serif]">
      {/* Sidebar Navigation */}
      <Sidebar
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        {/* Top Header */}
        <Header onOpenMobileSidebar={() => setIsMobileSidebarOpen(true)} />

        {/* Scrollable Workspace View */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              {renderActiveView()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Integrated Paystack Payment Processing Modal */}
      <PaystackModal
        isOpen={paystackModal.isOpen}
        onClose={handleClosePaystack}
        invoice={paystackModal.invoice}
        customAmount={paystackModal.customAmount}
        studentName={paystackModal.studentName}
        studentId={paystackModal.studentId}
      />
    </div>
  );
};

export default function App() {
  return (
    <SchoolProvider>
      <MainContent />
    </SchoolProvider>
  );
}
