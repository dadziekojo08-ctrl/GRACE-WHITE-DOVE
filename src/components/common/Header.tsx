import React, { useState } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Role } from '../../types';
import {
  GraduationCap,
  Search,
  Bell,
  Calendar,
  ShieldCheck,
  UserCheck,
  PlusCircle,
  CreditCard,
  QrCode,
  Megaphone,
  LogOut,
  User,
  ChevronDown,
  Menu,
  Camera,
  X,
  Check,
  Cloud,
  CloudCheck,
  RefreshCw
} from 'lucide-react';
import { StaffPhotoUploader } from './StaffPhotoUploader';

export const Header: React.FC<{ onOpenMobileSidebar?: () => void; onOpenPaystack?: () => void; onOpenGateScanner?: () => void }> = ({
  onOpenMobileSidebar,
  onOpenGateScanner
}) => {
  const {
    isSyncing,
    lastSyncedTime,
    syncToCloudNow,
    academicYear,
    currentTerm,
    setCurrentTerm,
    activeRole,
    setActiveRole,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    announcements,
    currentUser,
    updateUserProfile,
    logout
  } = useSchool();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showPhotoModal, setShowPhotoModal] = useState(false);
  const [tempPhotoUrl, setTempPhotoUrl] = useState('');

  const roles: Role[] = ['Admin', 'Teacher', 'Accountant', 'Librarian', 'Transport', 'Parent'];

  return (
    <header className="bg-emerald-900 border-b border-emerald-800 text-white sticky top-0 z-30 shadow-md">
      {/* Top utility row */}
      <div className="px-3 sm:px-4 lg:px-6 py-2.5 flex items-center justify-between gap-3 sm:gap-4">
        {/* Brand & School info */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={onOpenMobileSidebar}
            className="p-1.5 rounded-lg bg-emerald-800 hover:bg-emerald-700 text-emerald-200 lg:hidden cursor-pointer"
            title="Open Menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-amber-400 flex items-center justify-center text-emerald-950 shadow-md ring-2 ring-amber-300">
            <GraduationCap className="w-5 h-5 sm:w-6 sm:h-6 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5 sm:gap-2">
              <span className="font-extrabold text-base sm:text-lg tracking-tight text-white font-['Outfit']">Grace White Dove</span>
              <span className="text-[8.5px] sm:text-[9.5px] font-bold uppercase tracking-wider bg-amber-400 text-emerald-950 px-1.5 sm:px-2 py-0.5 rounded-full whitespace-nowrap">
                BenDaz IT Consult
              </span>
            </div>
            <p className="text-[11px] text-emerald-200 hidden sm:block">Grace White Dove School Complex</p>
          </div>
        </div>

        {/* Global Search (Hidden for Parent and Teacher roles for streamlined workspace) */}
        {activeRole !== 'Parent' && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="w-4 h-4 text-emerald-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search students, staff, admission #, invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-emerald-950/60 border border-emerald-700/80 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white placeholder-emerald-400/70 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-xs text-emerald-300 hover:text-white"
                >
                  ×
                </button>
              )}
            </div>
          </div>
        )}

        {/* Term Switcher, Notifications & User Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2.5">
          {/* Cloud Firestore Persistence Status */}
          <button
            onClick={syncToCloudNow}
            title={isSyncing ? "Syncing with Cloud Firestore..." : `Cloud Firestore Connected. Last synced: ${lastSyncedTime || 'Just now'}. Click to sync now.`}
            className="flex items-center gap-1.5 bg-emerald-950/70 hover:bg-emerald-950 border border-emerald-700/70 hover:border-emerald-600 px-2 sm:px-2.5 py-1.5 rounded-lg text-[11px] font-medium text-emerald-200 transition-all cursor-pointer"
          >
            <Cloud className={`w-3.5 h-3.5 ${isSyncing ? 'text-amber-400 animate-pulse' : 'text-emerald-400'}`} />
            <span className="hidden lg:inline">
              {isSyncing ? 'Syncing...' : 'Firestore'}
            </span>
            <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
          </button>

          {/* Term / Academic Year Pill */}
          <div className="hidden xl:flex items-center gap-1.5 bg-emerald-800/80 px-2.5 py-1.5 rounded-lg border border-emerald-700 text-xs">
            <Calendar className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-emerald-200 font-medium">{academicYear}</span>
            <span className="text-emerald-500">•</span>
            <select
              value={currentTerm}
              onChange={(e) => setCurrentTerm(e.target.value)}
              className="bg-transparent text-amber-300 font-bold focus:outline-none cursor-pointer text-xs"
            >
              <option value="Term 1" className="bg-emerald-900 text-white">Term 1</option>
              <option value="Term 2" className="bg-emerald-900 text-white">Term 2</option>
              <option value="Term 3" className="bg-emerald-900 text-white">Term 3</option>
            </select>
          </div>

          {/* Quick Action Button (Strictly only for Admin / Head of School — Teachers & Parents do NOT have Quick Action) */}
          {activeRole !== 'Parent' && activeRole !== 'Teacher' && activeRole !== 'Accountant' && (
            <div className="relative">
              <button
                onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
                className="flex items-center gap-1.5 bg-amber-400 hover:bg-amber-300 text-emerald-950 font-bold px-2.5 sm:px-3 py-1.5 rounded-lg text-xs shadow-sm transition-all cursor-pointer"
              >
                <PlusCircle className="w-4 h-4" />
                <span className="hidden sm:inline">Quick Action</span>
              </button>

              {showQuickActionMenu && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white text-slate-800 rounded-xl shadow-xl border border-slate-100 py-2 z-50 animate-in fade-in zoom-in-95 duration-100"
                  onClick={() => setShowQuickActionMenu(false)}
                >
                  <div className="px-3 py-1.5 text-[11px] font-semibold text-emerald-800 uppercase tracking-wider border-b border-slate-100">
                    Instant Operations
                  </div>
                  <button
                    onClick={() => setActiveTab('admissions')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-600" />
                    New Admission Application
                  </button>
                  <button
                    onClick={() => setActiveTab('fees')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <CreditCard className="w-4 h-4 text-amber-500" />
                    Collect Fees (Paystack)
                  </button>
                  <button
                    onClick={() => {
                      setActiveTab('attendance');
                      if (onOpenGateScanner) onOpenGateScanner();
                    }}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <QrCode className="w-4 h-4 text-emerald-600" />
                    Gate Scanner Check-In
                  </button>
                  <button
                    onClick={() => setActiveTab('communication')}
                    className="w-full text-left px-3 py-2 text-xs flex items-center gap-2 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
                  >
                    <Megaphone className="w-4 h-4 text-emerald-600" />
                    Broadcast Announcement
                  </button>
                </div>
              )}
            </div>
          )}

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 rounded-lg bg-emerald-800/80 hover:bg-emerald-700 text-emerald-100 border border-emerald-700 transition-colors cursor-pointer"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              {announcements.length > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-amber-400 rounded-full ring-2 ring-emerald-900 animate-pulse"></span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 p-3 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                  <span className="font-bold text-xs text-slate-900">Recent School Notices</span>
                  <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                    {announcements.length} active
                  </span>
                </div>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {announcements.map((a) => (
                    <div key={a.id} className="p-2.5 rounded-lg bg-slate-50 border border-slate-100 hover:border-emerald-200 transition-colors">
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-bold text-emerald-950">{a.title}</h4>
                        <span className="text-[9px] font-semibold text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded">
                          {a.priority}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-600 mt-1 line-clamp-2">{a.message}</p>
                      <div className="mt-1.5 flex items-center justify-between text-[10px] text-slate-400">
                        <span>{a.author}</span>
                        <span>{a.date}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {activeRole !== 'Parent' ? (
                  <button
                    onClick={() => {
                      setActiveTab('communication');
                      setShowNotifications(false);
                    }}
                    className="w-full mt-2 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-xs font-semibold text-center block transition-colors cursor-pointer"
                  >
                    Open Communication Suite →
                  </button>
                ) : (
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="w-full mt-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-semibold text-center block transition-colors cursor-pointer"
                  >
                    Close Notices
                  </button>
                )}
              </div>
            )}
          </div>

          {/* User Account & Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 bg-emerald-950/80 hover:bg-emerald-950 border border-emerald-700/80 px-2.5 py-1 rounded-lg cursor-pointer transition-all"
            >
              {currentUser?.avatarUrl ? (
                <img
                  src={currentUser.avatarUrl}
                  alt={currentUser.name}
                  className="w-6 h-6 rounded-full object-cover border border-amber-400"
                />
              ) : (
                <div className="w-6 h-6 rounded-full bg-amber-400 text-emerald-950 font-bold flex items-center justify-center text-[10px]">
                  {activeRole.slice(0, 2)}
                </div>
              )}
              <div className="text-left hidden md:block">
                <span className="text-xs font-bold text-white block leading-tight truncate max-w-[110px]">
                  {currentUser?.name || `${activeRole} User`}
                </span>
                <span className="text-[10px] text-amber-300 font-semibold leading-none block">
                  {activeRole}
                </span>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-emerald-300" />
            </button>

            {showUserMenu && (
              <div
                className="absolute right-0 mt-2 w-64 bg-white text-slate-800 rounded-xl shadow-2xl border border-slate-100 py-2 z-50"
                onClick={(e) => e.stopPropagation()}
              >
                {/* User Info Header */}
                <div className="px-3.5 py-2.5 border-b border-slate-100 bg-slate-50/80">
                  <div className="flex items-center gap-2.5">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt=""
                        className="w-9 h-9 rounded-full object-cover border border-emerald-600"
                      />
                    ) : (
                      <div className="w-9 h-9 rounded-full bg-emerald-800 text-white font-bold flex items-center justify-center text-xs">
                        {activeRole.slice(0, 2)}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-slate-900 truncate">
                        {currentUser?.name || 'Authorized User'}
                      </p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {currentUser?.email || `${activeRole.toLowerCase()}@educore.edu.gh`}
                      </p>
                      <span className="inline-block mt-0.5 text-[9px] font-extrabold uppercase bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded">
                        {activeRole}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Staff Profile Photo Action */}
                <div className="p-2 border-b border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setTempPhotoUrl(currentUser?.photoUrl || currentUser?.avatarUrl || '');
                      setShowUserMenu(false);
                      setShowPhotoModal(true);
                    }}
                    className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-900 text-xs font-bold transition-colors cursor-pointer border border-emerald-200/60"
                  >
                    <div className="flex items-center gap-2">
                      <Camera className="w-3.5 h-3.5 text-emerald-700" />
                      <span>Edit Profile Picture</span>
                    </div>
                    <span className="text-[10px] bg-emerald-800 text-white px-1.5 py-0.5 rounded font-mono">Photo</span>
                  </button>
                </div>

                {/* Role Switcher in Menu */}
                <div className="p-2 border-b border-slate-100">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-2 pb-1">
                    Switch Active Role
                  </span>
                  <div className="grid grid-cols-2 gap-1">
                    {roles.map((r) => (
                      <button
                        key={r}
                        onClick={() => {
                          setActiveRole(r);
                          setShowUserMenu(false);
                        }}
                        className={`text-left px-2 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          activeRole === r
                            ? 'bg-emerald-900 text-white font-bold'
                            : 'text-slate-700 hover:bg-slate-100'
                        }`}
                      >
                        {r}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Sign Out Action */}
                <div className="px-2 pt-1">
                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                    }}
                    className="w-full flex items-center gap-2 px-3 py-2 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out / Lock Portal</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Picture Modal */}
      {showPhotoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white text-slate-800 w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-150 my-8">
            <div className="bg-emerald-900 text-white p-4.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Camera className="w-5 h-5 text-amber-300" />
                <h3 className="font-bold text-base font-['Outfit']">Edit Staff Profile Picture</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowPhotoModal(false)}
                className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-emerald-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <StaffPhotoUploader
                value={tempPhotoUrl}
                onChange={setTempPhotoUrl}
                name={currentUser?.name || `${activeRole} Staff`}
                role={activeRole}
                size="lg"
                label="Select or Upload New Picture"
                helperText="Upload an official photo, take a picture using your webcam, or select a preset avatar badge."
              />

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowPhotoModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (tempPhotoUrl) {
                      updateUserProfile({ photoUrl: tempPhotoUrl, avatarUrl: tempPhotoUrl });
                    }
                    setShowPhotoModal(false);
                  }}
                  className="px-5 py-2 text-xs font-bold text-emerald-950 bg-amber-400 hover:bg-amber-300 rounded-xl shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  Save Photo
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};

