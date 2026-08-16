import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { NavigationTab } from '../../types';
import {
  LayoutDashboard,
  Users,
  UserPlus,
  CheckSquare,
  CreditCard,
  Award,
  CalendarDays,
  Briefcase,
  DollarSign,
  BookOpen,
  Bus,
  MessageSquare,
  BarChart3,
  TrendingUp,
  FileText,
  ShieldAlert,
  ChevronRight,
  ChevronDown,
  LogOut,
  GraduationCap,
  BookmarkCheck,
  Megaphone,
  Calendar as CalendarIcon,
  Layers
} from 'lucide-react';

interface SubNavItem {
  id: NavigationTab;
  label: string;
  badge?: string;
  subText?: string;
  icon?: React.ElementType;
}

interface NavItem {
  id: NavigationTab;
  label: string;
  icon: React.ElementType;
  badge?: string;
  subText?: string;
  category?: 'Core Academic' | 'Financial & Admin' | 'Logistics & Comms' | 'System & Reports' | 'Teacher Portal' | 'Parent Portal';
  children?: SubNavItem[];
}

const parentNavItems: NavItem[] = [
  {
    id: 'dashboard',
    label: 'Dashboard',
    icon: LayoutDashboard,
    subText: 'Academic Report • Fees • Calendar • Paystack'
  },
  {
    id: 'my-child',
    label: 'My Child',
    icon: GraduationCap,
    subText: 'Academic Report • School Fees'
  }
];

const teacherNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, subText: 'My Students • Attendance • Grades • Salary' },
  { id: 'students', label: 'Students', icon: Users, subText: 'Student Directory & Profiles' },
  { id: 'library', label: 'Library', icon: BookOpen, subText: 'Books Catalog & Borrowing' },
  { id: 'classes', label: 'Class', icon: GraduationCap, subText: 'Classrooms & Sections' },
  { id: 'subjects', label: 'Subjects', icon: BookmarkCheck, subText: 'Syllabus & Course Codes' },
  { id: 'timetable', label: 'Timetable', icon: CalendarDays, subText: 'Weekly Period Schedules' },
  { id: 'attendance', label: 'Attendance', icon: CheckSquare, subText: 'Daily Roll Marking' },
  { id: 'exams', label: 'Examination', icon: Award, subText: 'Marks, Grades & Terminal Reports' },
  { id: 'calendar', label: 'Calendar', icon: CalendarIcon, subText: 'Academic Dates & Events' },
  { id: 'announcements', label: 'Announcement', icon: Megaphone, subText: 'Notice Board & Circulars' }
];

const accountantNavItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, subText: 'Bill Class • Fees • Statement' },
  {
    id: 'fees',
    label: 'Financial Report',
    icon: BarChart3,
    subText: 'Fee Collection • Report & Analytics',
    children: [
      { id: 'fees', label: 'Fee Collection', icon: CreditCard, subText: 'Student Invoices & Desk' },
      { id: 'reports', label: 'Report & Analytics', icon: TrendingUp, subText: 'Ledger, Arrears, Statement' }
    ]
  },
  { id: 'announcements', label: 'Announcement', icon: Megaphone, subText: 'Head of School Notices' }
];

const allNavItems: NavItem[] = [
  // Core Academic
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, category: 'Core Academic' },
  { id: 'students', label: 'Student Directory', icon: Users, category: 'Core Academic' },
  { id: 'classes', label: 'Class Management', icon: GraduationCap, category: 'Core Academic' },
  { id: 'subjects', label: 'Subject Syllabus', icon: BookmarkCheck, category: 'Core Academic' },
  { id: 'admissions', label: 'Admissions', icon: UserPlus, category: 'Core Academic' },
  { id: 'attendance', label: 'Attendance Roll', icon: CheckSquare, category: 'Core Academic' },
  { id: 'exams', label: 'Examination & Reports', icon: Award, category: 'Core Academic' },
  { id: 'timetable', label: 'Class Timetable', icon: CalendarDays, category: 'Core Academic' },

  // Financial & Admin
  {
    id: 'fees',
    label: 'Financial Report',
    icon: BarChart3,
    category: 'Financial & Admin',
    children: [
      { id: 'fees', label: 'Fee Collection', icon: CreditCard, subText: 'Invoicing, Receipts & Payments' },
      { id: 'reports', label: 'Report & Analytics', icon: TrendingUp, subText: 'Financial Summary & Statements' }
    ]
  },
  { id: 'payroll', label: 'Staff Payroll', icon: DollarSign, category: 'Financial & Admin' },
  { id: 'staff', label: 'Staff Management', icon: Briefcase, category: 'Financial & Admin' },

  // Logistics & Comms
  { id: 'library', label: 'Library Catalog', icon: BookOpen, category: 'Logistics & Comms' },
  { id: 'calendar', label: 'Academic Calendar', icon: CalendarIcon, category: 'Logistics & Comms' },
  { id: 'announcements', label: 'Announcements', icon: Megaphone, category: 'Logistics & Comms' },
  { id: 'transport', label: 'Transport Fleet', icon: Bus, category: 'Logistics & Comms' },
  { id: 'communication', label: 'Comms & WhatsApp', icon: MessageSquare, category: 'Logistics & Comms' },

  // System & Reports
  { id: 'documents', label: 'Document Vault', icon: FileText, category: 'System & Reports' },
  { id: 'security', label: 'Backup & Security', icon: ShieldAlert, category: 'System & Reports' }
];

export const Sidebar: React.FC<{
  isOpenMobile?: boolean;
  isMobileOpen?: boolean;
  onCloseMobile: () => void;
}> = ({ isOpenMobile, isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, activeRole, currentUser, logout } = useSchool();
  const mobileOpen = isOpenMobile ?? isMobileOpen ?? false;

  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    fees: true
  });

  const toggleSubmenu = (menuId: string) => {
    setExpandedMenus((prev) => ({
      ...prev,
      [menuId]: !prev[menuId]
    }));
  };

  const isTeacherRole = activeRole === 'Teacher';
  const isParentRole = activeRole === 'Parent';
  const isAccountantRole = activeRole === 'Accountant';
  const categories = ['Core Academic', 'Financial & Admin', 'Logistics & Comms', 'System & Reports'] as const;

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-40 lg:hidden backdrop-blur-xs"
          onClick={onCloseMobile}
        />
      )}

      <aside
        className={`fixed lg:static top-[57px] bottom-0 left-0 z-40 w-64 bg-emerald-950 text-slate-100 flex flex-col border-r border-emerald-800/80 transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-5">
          {isParentRole ? (
            /* Parent Portal Menu Layout */
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-amber-400 uppercase flex items-center justify-between">
                <span>Parent Workspace</span>
                <span className="bg-emerald-800 text-emerald-200 text-[9px] px-1.5 py-0.2 rounded">Ward Services</span>
              </div>
              <div className="mt-2 space-y-1">
                {parentNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-emerald-950 shadow-sm font-extrabold'
                          : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-emerald-950 stroke-[2.5]'
                              : 'text-emerald-300 group-hover:text-amber-300'
                          }`}
                        />
                        <div className="text-left">
                          <div className="leading-tight">{item.label}</div>
                          {item.subText && (
                            <div
                              className={`text-[9px] font-medium leading-none mt-0.5 ${
                                isActive ? 'text-emerald-950/70' : 'text-emerald-400/60'
                              }`}
                            >
                              {item.subText}
                            </div>
                          )}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : isAccountantRole ? (
            /* Accountant Portal Menu Layout */
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-amber-400 uppercase flex items-center justify-between">
                <span>Accountant Workspace</span>
                <span className="bg-emerald-800 text-emerald-200 text-[9px] px-1.5 py-0.2 rounded">Finance Office</span>
              </div>
              <div className="mt-2 space-y-1">
                {accountantNavItems.map((item) => {
                  const Icon = item.icon;
                  const hasChildren = item.children && item.children.length > 0;
                  const isAncestorActive = hasChildren && item.children?.some(c => c.id === activeTab);
                  const isDirectActive = activeTab === item.id;
                  const isActive = isDirectActive || isAncestorActive;
                  const isExpanded = hasChildren ? (expandedMenus[item.id] ?? isAncestorActive ?? true) : false;

                  return (
                    <div key={item.id} className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (hasChildren) {
                            toggleSubmenu(item.id);
                          } else {
                            setActiveTab(item.id);
                            onCloseMobile();
                          }
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                          isActive && !hasChildren
                            ? 'bg-amber-400 text-emerald-950 shadow-sm font-extrabold'
                            : isAncestorActive
                            ? 'bg-emerald-900 text-amber-300 border border-emerald-700/60 font-bold'
                            : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <Icon
                            className={`w-4 h-4 shrink-0 ${
                              isActive && !hasChildren
                                ? 'text-emerald-950 stroke-[2.5]'
                                : isAncestorActive
                                ? 'text-amber-300 stroke-[2.5]'
                                : 'text-emerald-300 group-hover:text-amber-300'
                            }`}
                          />
                          <div className="text-left">
                            <div className="leading-tight">{item.label}</div>
                            {item.subText && (
                              <div
                                className={`text-[9px] font-medium leading-none mt-0.5 ${
                                  isActive && !hasChildren ? 'text-emerald-950/70' : 'text-emerald-400/70'
                                }`}
                              >
                                {item.subText}
                              </div>
                            )}
                          </div>
                        </div>
                        {hasChildren ? (
                          isExpanded ? (
                            <ChevronDown className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          ) : (
                            <ChevronRight className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
                          )
                        ) : (
                          isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950 shrink-0" />
                        )}
                      </button>

                      {/* Sub-menu items */}
                      {hasChildren && isExpanded && (
                        <div className="pl-3.5 ml-3 my-1 space-y-1 border-l-2 border-emerald-700/60">
                          {item.children?.map((child) => {
                            const ChildIcon = child.icon || ChevronRight;
                            const isChildActive = activeTab === child.id;
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => {
                                  setActiveTab(child.id);
                                  onCloseMobile();
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                                  isChildActive
                                    ? 'bg-amber-400 text-emerald-950 shadow-xs font-bold'
                                    : 'text-emerald-200/90 hover:bg-emerald-900/90 hover:text-white'
                                }`}
                              >
                                <div className="flex items-center gap-2">
                                  <ChildIcon
                                    className={`w-3.5 h-3.5 ${
                                      isChildActive
                                        ? 'text-emerald-950 stroke-[2.5]'
                                        : 'text-emerald-400 group-hover:text-amber-300'
                                    }`}
                                  />
                                  <span className="truncate">{child.label}</span>
                                </div>
                                {isChildActive && (
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 shrink-0" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : isTeacherRole ? (
            /* Teacher Portal Menu Layout */
            <div className="space-y-1">
              <div className="px-3 text-[10px] font-extrabold tracking-wider text-amber-400 uppercase flex items-center justify-between">
                <span>Teacher Workspace</span>
                <span className="bg-emerald-800 text-emerald-200 text-[9px] px-1.5 py-0.2 rounded">10 Menus</span>
              </div>
              <div className="mt-2 space-y-1">
                {teacherNavItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        onCloseMobile();
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group cursor-pointer ${
                        isActive
                          ? 'bg-amber-400 text-emerald-950 shadow-sm font-extrabold'
                          : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <Icon
                          className={`w-4 h-4 shrink-0 ${
                            isActive
                              ? 'text-emerald-950 stroke-[2.5]'
                              : 'text-emerald-300 group-hover:text-amber-300'
                          }`}
                        />
                        <div className="text-left">
                          <div className="leading-tight">{item.label}</div>
                          {item.subText && (
                            <div
                              className={`text-[9px] font-medium leading-none mt-0.5 ${
                                isActive ? 'text-emerald-950/70' : 'text-emerald-400/60'
                              }`}
                            >
                              {item.subText}
                            </div>
                          )}
                        </div>
                      </div>
                      {isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          ) : (
            /* Admin & General Multi-Category Layout */
            categories.map((cat) => {
              const items = allNavItems.filter((item) => item.category === cat);
              if (items.length === 0) return null;
              return (
                <div key={cat} className="space-y-1">
                  <div className="px-3 text-[10px] font-bold tracking-wider text-emerald-400 uppercase">
                    {cat}
                  </div>
                  {items.map((item) => {
                    const Icon = item.icon;
                    const hasChildren = item.children && item.children.length > 0;
                    const isAncestorActive = hasChildren && item.children?.some(c => c.id === activeTab);
                    const isDirectActive = activeTab === item.id;
                    const isActive = isDirectActive || isAncestorActive;
                    const isExpanded = hasChildren ? (expandedMenus[item.id] ?? isAncestorActive ?? true) : false;

                    return (
                      <div key={item.id} className="space-y-1">
                        <button
                          type="button"
                          onClick={() => {
                            if (hasChildren) {
                              toggleSubmenu(item.id);
                            } else {
                              setActiveTab(item.id);
                              onCloseMobile();
                            }
                          }}
                          className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                            isActive && !hasChildren
                              ? 'bg-amber-400 text-emerald-950 shadow-sm shadow-amber-400/20 font-bold'
                              : isAncestorActive
                              ? 'bg-emerald-900/90 text-amber-300 border border-emerald-700/60 font-bold'
                              : 'text-emerald-100/90 hover:bg-emerald-900 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon
                              className={`w-4 h-4 ${
                                isActive && !hasChildren
                                  ? 'text-emerald-950 stroke-[2.5]'
                                  : isAncestorActive
                                  ? 'text-amber-300 stroke-[2.5]'
                                  : 'text-emerald-300 group-hover:text-amber-300'
                              }`}
                            />
                            <span>{item.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5">
                            {item.badge && (
                              <span
                                className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-full ${
                                  isActive
                                    ? 'bg-emerald-900 text-amber-300'
                                    : 'bg-amber-400 text-emerald-950'
                                }`}
                              >
                                {item.badge}
                              </span>
                            )}
                            {hasChildren ? (
                              isExpanded ? (
                                <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
                              ) : (
                                <ChevronRight className="w-3.5 h-3.5 text-emerald-300" />
                              )
                            ) : (
                              isActive && <ChevronRight className="w-3.5 h-3.5 text-emerald-950" />
                            )}
                          </div>
                        </button>

                        {/* Sub-menu items */}
                        {hasChildren && isExpanded && (
                          <div className="pl-3.5 ml-3 my-1 space-y-1 border-l-2 border-emerald-700/60">
                            {item.children?.map((child) => {
                              const ChildIcon = child.icon || ChevronRight;
                              const isChildActive = activeTab === child.id;
                              return (
                                <button
                                  key={child.id}
                                  type="button"
                                  onClick={() => {
                                    setActiveTab(child.id);
                                    onCloseMobile();
                                  }}
                                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all group cursor-pointer ${
                                    isChildActive
                                      ? 'bg-amber-400 text-emerald-950 shadow-xs font-bold'
                                      : 'text-emerald-200/90 hover:bg-emerald-900/90 hover:text-white'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <ChildIcon
                                      className={`w-3.5 h-3.5 ${
                                        isChildActive
                                          ? 'text-emerald-950 stroke-[2.5]'
                                          : 'text-emerald-400 group-hover:text-amber-300'
                                      }`}
                                    />
                                    <span className="truncate">{child.label}</span>
                                  </div>
                                  {isChildActive && (
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-950 shrink-0" />
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>

        {/* User Card at bottom of sidebar */}
        <div className="p-3 bg-emerald-900/90 border-t border-emerald-800 space-y-2">
          <div className="flex items-center gap-2.5 bg-emerald-950/60 p-2 rounded-lg border border-emerald-700/60">
            {currentUser?.avatarUrl ? (
              <img
                src={currentUser.avatarUrl}
                alt=""
                className="w-8 h-8 rounded-full object-cover border border-amber-400 shrink-0"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-xs shrink-0">
                {activeRole.substring(0, 2).toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">
                {currentUser?.name || 'Active Session'}
              </p>
              <p className="text-[10px] text-amber-300 font-medium truncate">
                {activeRole} Portal
              </p>
            </div>
            <button
              type="button"
              onClick={logout}
              className="p-1.5 rounded-lg text-emerald-300 hover:text-rose-300 hover:bg-emerald-800/80 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

