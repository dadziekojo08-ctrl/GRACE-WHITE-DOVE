import React, { useState, useMemo } from 'react';
import { useSchool } from '../../context/SchoolContext';
import { Role, AuthMode } from '../../types';
import {
  GraduationCap,
  Lock,
  Mail,
  User,
  Phone,
  ShieldCheck,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  Sparkles,
  ArrowLeft,
  School,
  Building,
  CreditCard,
  BookOpen,
  Bus,
  Users,
  RefreshCw
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { StaffPhotoUploader } from '../common/StaffPhotoUploader';

const generateStaffId = (role: Role) => {
  const prefixMap: Record<string, string> = {
    Admin: 'ADM',
    Teacher: 'TEA',
    Accountant: 'ACC',
    Librarian: 'LIB',
    Transport: 'TRN'
  };
  const prefix = prefixMap[role] || 'STF';
  const randomNum = Math.floor(100 + Math.random() * 900);
  return `STF-${prefix}-${randomNum}`;
};

export const AuthPage: React.FC = () => {
  const { login, register, resetPassword, authUsers, students, marks, classes } = useSchool();

  // Dynamic live metric calculations from recorded entries
  const enrolledStudentsCount = students ? students.length : 0;
  const academicPassRate = useMemo(() => {
    if (!marks || marks.length === 0) return 0;
    const passedCount = marks.filter((m) => {
      const score = m.totalScore ?? m.score ?? 0;
      return score >= 50;
    }).length;
    return Math.round((passedCount / marks.length) * 100);
  }, [marks]);

  const [mode, setMode] = useState<AuthMode>('login');
  const [loginType, setLoginType] = useState<'staff' | 'parent'>('staff');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedRole, setSelectedRole] = useState<Role>('Admin');
  const [assignedClass, setAssignedClass] = useState<string>('Primary 1 (Grade 1)');
  const [photoUrl, setPhotoUrl] = useState('');
  const [staffCodeOrStudentId, setStaffCodeOrStudentId] = useState(() => generateStaffId('Admin'));
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Reset Password Multi-Step State
  const [resetEmail, setResetEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('849201');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [resetStep, setResetStep] = useState<1 | 2 | 3 | 4>(1);

  // Feedback State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Standard Login Submit
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!email.trim()) {
      setErrorMessage(loginType === 'parent' ? "Please enter your child's Student ID (e.g. ADM-2024-001)." : 'Please enter your email address or username.');
      return;
    }
    if (!password) {
      setErrorMessage(loginType === 'parent' ? 'Please enter your registered parent phone number.' : 'Please enter your password.');
      return;
    }

    setLoading(true);
    try {
      const res = await login(email, password, loginType === 'parent' ? 'Parent' : undefined);
      if (!res.success && res.message) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to authenticate user.');
    } finally {
      setLoading(false);
    }
  };

  // Register Submit
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (selectedRole === 'Parent') {
      setErrorMessage('Parents do not need to create an account. Please sign in directly using your child\'s Student ID and your registered phone number.');
      return;
    }

    if (!fullName.trim()) {
      setErrorMessage('Please provide your full legal name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMessage('Please provide a valid email address.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }
    if (!agreeTerms) {
      setErrorMessage('Please accept the Grace White Dove School Complex data privacy terms to proceed.');
      return;
    }

    if (selectedRole === 'Teacher' && !assignedClass) {
      setErrorMessage('Please select the classroom / grade level where you teach.');
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        name: fullName,
        email,
        password,
        role: selectedRole,
        phone,
        staffCode: staffCodeOrStudentId || undefined,
        studentId: undefined,
        assignedClass: selectedRole === 'Teacher' ? assignedClass : undefined,
        photoUrl: photoUrl || undefined,
        avatarUrl: photoUrl || undefined
      });

      if (!res.success && res.message) {
        setErrorMessage(res.message);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Reset Password Handlers
  const handleRequestOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (!resetEmail.trim() || !resetEmail.includes('@')) {
      setErrorMessage('Please enter a valid registered email address.');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setGeneratedOtp('849201');
      setResetStep(2);
      setSuccessMessage(`A 6-digit recovery code has been sent to ${resetEmail}.`);
    }, 600);
  };

  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (otpCode.trim() !== generatedOtp && otpCode.trim() !== '123456') {
      setErrorMessage('Invalid or expired verification code. Use demo code: 849201');
      return;
    }
    setResetStep(3);
    setSuccessMessage('Code verified successfully. Now choose a new password.');
  };

  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    if (newPassword.length < 6) {
      setErrorMessage('New password must be at least 6 characters long.');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setLoading(true);
    try {
      const res = await resetPassword(resetEmail, newPassword);
      if (res.success) {
        setResetStep(4);
        setSuccessMessage('Password reset successfully!');
      } else {
        setErrorMessage(res.message || 'Failed to reset password.');
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Error updating password.');
    } finally {
      setLoading(false);
    }
  };

  // Password Strength Calculation
  const calculatePasswordStrength = (pass: string) => {
    if (!pass) return 0;
    let score = 0;
    if (pass.length >= 6) score += 25;
    if (pass.length >= 10) score += 25;
    if (/[A-Z]/.test(pass)) score += 25;
    if (/[0-9]/.test(pass) || /[^A-Za-z0-9]/.test(pass)) score += 25;
    return score;
  };

  const passStrength = calculatePasswordStrength(password);

  const rolesList: { role: Role; label: string; desc: string; icon: React.ElementType }[] = [
    { role: 'Admin', label: 'School Admin', desc: 'Full institutional controls', icon: ShieldCheck },
    { role: 'Teacher', label: 'Teacher / Faculty', desc: 'Academics & grading roll', icon: School },
    { role: 'Accountant', label: 'Bursar & Finance', desc: 'Fees, payroll & Paystack', icon: CreditCard },
    { role: 'Librarian', label: 'Librarian', desc: 'Book catalog & lending', icon: BookOpen },
    { role: 'Transport', label: 'Transport Fleet', desc: 'Buses, routes & tracker', icon: Bus }
  ];

  return (
    <div className="min-h-screen w-full bg-[#f8fafc] flex items-center justify-center p-3 sm:p-6 lg:p-10 font-['Inter',sans-serif]">
      {/* Main Card Container */}
      <div className="w-full max-w-5xl bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-100 overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[640px]">
        
        {/* LEFT COLUMN: School Branding Hero Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-emerald-950 via-emerald-900 to-emerald-850 p-6 sm:p-8 lg:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          {/* Subtle Decorative Elements */}
          <div className="absolute top-0 right-0 w-80 h-80 bg-amber-400/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none -ml-20 -mb-20"></div>

          {/* Top Brand Info */}
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-amber-400 text-emerald-950 flex items-center justify-center shadow-lg ring-4 ring-amber-400/30">
                <GraduationCap className="w-7 h-7 stroke-[2.5]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-2xl tracking-tight text-white font-['Outfit']">BenDaz IT Consult</span>
                </div>
                <p className="text-xs text-emerald-200 font-medium">School Management Suite</p>
              </div>
            </div>

            <div className="pt-2">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-300 bg-emerald-900/80 px-3 py-1 rounded-full border border-emerald-700/60">
                <Sparkles className="w-3.5 h-3.5" /> Grace White Dove School Complex
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mt-3 font-['Outfit'] leading-snug">
                Unified Institutional Intelligence Platform
              </h1>
              <p className="text-xs sm:text-sm text-emerald-100/80 mt-2 leading-relaxed">
                Seamlessly orchestrating academics, admissions, automated Paystack fee collection, examinations, staff payroll, and fleet operations.
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <div className="bg-emerald-900/60 backdrop-blur-xs p-3 rounded-xl border border-emerald-700/50">
                <span className="text-amber-400 font-extrabold text-lg font-['Outfit'] block">
                  {enrolledStudentsCount.toLocaleString()}
                </span>
                <span className="text-[11px] text-emerald-200">Enrolled Students</span>
              </div>
              <div className="bg-emerald-900/60 backdrop-blur-xs p-3 rounded-xl border border-emerald-700/50">
                <span className="text-amber-400 font-extrabold text-lg font-['Outfit'] block">
                  {marks && marks.length > 0 ? `${academicPassRate}%` : '0%'}
                </span>
                <span className="text-[11px] text-emerald-200">Academic Pass Rate</span>
              </div>
            </div>
          </div>

          {/* Bottom Security / Trust Footer */}
          <div className="relative z-10 pt-6 mt-6 border-t border-emerald-800/80 flex items-center justify-between text-[11px] text-emerald-200">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>256-Bit TLS & Paystack Secured</span>
            </div>
            <span className="text-emerald-400 font-mono">v2.4.0</span>
          </div>
        </div>

        {/* RIGHT COLUMN: Auth Form Area */}
        <div className="lg:col-span-7 p-6 sm:p-8 lg:p-10 flex flex-col justify-center bg-white">
          
          {/* Feedback Alerts */}
          <AnimatePresence>
            {errorMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-2.5"
              >
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span className="flex-1 font-medium">{errorMessage}</span>
                <button
                  type="button"
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-500 hover:text-rose-800 font-bold text-sm px-1 cursor-pointer"
                >
                  ×
                </button>
              </motion.div>
            )}

            {successMessage && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2.5"
              >
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="flex-1 font-medium">{successMessage}</span>
                <button
                  type="button"
                  onClick={() => setSuccessMessage(null)}
                  className="text-emerald-600 hover:text-emerald-900 font-bold text-sm px-1 cursor-pointer"
                >
                  ×
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* ======================================================== */}
          {/* 1. LOGIN MODE */}
          {/* ======================================================== */}
          {mode === 'login' && (
            <div>
              <div className="mb-5">
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Sign In to White Dove</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Enter your credentials below to access your account workspace.
                </p>
              </div>

              {/* Portal Mode Tabs: Staff & Admin vs Parent Portal */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-xl mb-4 text-xs font-bold">
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('staff');
                    setEmail('');
                    setPassword('');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginType === 'staff'
                      ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className={`w-3.5 h-3.5 ${loginType === 'staff' ? 'text-emerald-700' : 'text-slate-400'}`} />
                  <span>Staff & Admin</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setLoginType('parent');
                    setEmail('');
                    setPassword('');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className={`py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    loginType === 'parent'
                      ? 'bg-white text-emerald-900 shadow-xs font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Users className={`w-3.5 h-3.5 ${loginType === 'parent' ? 'text-amber-600' : 'text-slate-400'}`} />
                  <span>Parent Portal</span>
                </button>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {loginType === 'parent' ? "Child's Student ID / Admission Number" : 'Username or Email Address'}
                  </label>
                  <div className="relative">
                    {loginType === 'parent' ? (
                      <GraduationCap className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type="text"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={
                        loginType === 'parent'
                          ? 'Enter student ID (e.g. ADM-2024-001)'
                          : 'Enter your username or email (e.g. diana or staff@whitedove.edu.gh)'
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      {loginType === 'parent' ? 'Parent Phone Number (Password)' : 'Password'}
                    </label>
                    {loginType === 'staff' && (
                      <button
                        type="button"
                        onClick={() => {
                          setMode('forgot-password');
                          setErrorMessage(null);
                          setSuccessMessage(null);
                          setResetStep(1);
                        }}
                        className="text-xs font-semibold text-emerald-800 hover:text-amber-600 hover:underline cursor-pointer"
                      >
                        Forgot password?
                      </button>
                    )}
                  </div>
                  <div className="relative">
                    {loginType === 'parent' ? (
                      <Phone className="w-4 h-4 text-emerald-700 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    ) : (
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    )}
                    <input
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={
                        loginType === 'parent'
                          ? 'Enter registered parent phone (e.g. +233 24 555 0192)'
                          : 'Enter your account password'
                      }
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 cursor-pointer"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5 border-slate-300"
                    />
                    <span>Remember my session</span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{loginType === 'parent' ? 'Sign In to Parent Portal' : 'Sign In to Workspace'}</span>
                      <ArrowRight className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>

              {/* Switch to Register */}
              <div className="mt-6 text-center text-xs text-slate-600 border-t border-slate-100 pt-4">
                Are you a new staff member?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('register');
                    setSelectedRole('Teacher');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-emerald-800 hover:text-amber-600 hover:underline cursor-pointer"
                >
                  Create Staff Account
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 2. REGISTER / CREATE ACCOUNT MODE */}
          {/* ======================================================== */}
          {mode === 'register' && (
            <div>
              <div className="mb-4">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-amber-600 font-semibold mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Create New Account</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Register as a school administrator, teacher, finance officer, or staff member.
                </p>
              </div>

              <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                {/* Role Picker */}
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Select Your Institutional Role
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {rolesList.map(({ role, label, icon: Icon }) => {
                      const isSelected = selectedRole === role;
                      return (
                        <button
                          key={role}
                          type="button"
                          onClick={() => {
                            setSelectedRole(role);
                            setStaffCodeOrStudentId(generateStaffId(role));
                          }}
                          className={`p-2 rounded-xl text-left border transition-all cursor-pointer flex flex-col justify-between ${
                            isSelected
                              ? 'bg-emerald-900 text-white border-emerald-900 shadow-sm'
                              : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-emerald-300'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <Icon className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-emerald-800'}`} />
                            {isSelected && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                          </div>
                          <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                            {label}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Teacher Class Assignment Selector */}
                {selectedRole === 'Teacher' && (
                  <div className="bg-amber-50/80 border border-amber-200/90 rounded-xl p-3">
                    <div className="flex items-center justify-between mb-1.5">
                      <label className="block text-xs font-bold text-amber-950 flex items-center gap-1.5">
                        <GraduationCap className="w-4 h-4 text-emerald-800" />
                        Select Class / Grade Level You Teach <span className="text-rose-600">*</span>
                      </label>
                      <span className="text-[10px] bg-amber-200/80 text-amber-900 font-bold px-2 py-0.5 rounded-full">
                        Assigned Class
                      </span>
                    </div>
                    <p className="text-[11px] text-amber-800/90 mb-2">
                      Please specify the primary classroom you are assigned to. This links your teacher portal with your students and attendance roster.
                    </p>
                    <select
                      value={assignedClass}
                      onChange={(e) => setAssignedClass(e.target.value)}
                      required
                      className="w-full bg-white border border-amber-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-700 shadow-sm cursor-pointer"
                    >
                      {classes && classes.length > 0 ? (
                        classes.map((cls) => (
                          <option key={cls.id || cls.name} value={cls.name}>
                            {cls.name} ({cls.level || 'General'})
                          </option>
                        ))
                      ) : (
                        <>
                          <option value="Creche">Creche</option>
                          <option value="Nursery 1">Nursery 1</option>
                          <option value="Nursery 2">Nursery 2</option>
                          <option value="Kindergarten 1 (KG 1)">Kindergarten 1 (KG 1)</option>
                          <option value="Kindergarten 2 (KG 2)">Kindergarten 2 (KG 2)</option>
                          <option value="Primary 1 (Grade 1)">Primary 1 (Grade 1)</option>
                          <option value="Primary 2 (Grade 2)">Primary 2 (Grade 2)</option>
                          <option value="Primary 3 (Grade 3)">Primary 3 (Grade 3)</option>
                          <option value="Primary 4 (Grade 4)">Primary 4 (Grade 4)</option>
                          <option value="Primary 5 (Grade 5)">Primary 5 (Grade 5)</option>
                          <option value="Primary 6 (Grade 6)">Primary 6 (Grade 6)</option>
                          <option value="JHS 1 (Grade 7)">JHS 1 (Grade 7)</option>
                          <option value="JHS 2 (Grade 8)">JHS 2 (Grade 8)</option>
                          <option value="JHS 3 (Grade 9)">JHS 3 (Grade 9)</option>
                        </>
                      )}
                    </select>
                  </div>
                )}

                {/* Staff Profile Photo Studio */}
                <div className="pt-1">
                  <StaffPhotoUploader
                    value={photoUrl}
                    onChange={setPhotoUrl}
                    name={fullName || `${selectedRole} Staff`}
                    role={selectedRole}
                    size="md"
                    label="Staff Profile Picture"
                    helperText="Upload your official photo, take a picture, or select a preset avatar."
                  />
                </div>

                {/* Name & Phone in 2-cols */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Full Legal Name</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Dr. Nana Kwame"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+233 24 000 0000"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Email & ID */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="staff@whitedove.edu.gh"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-semibold text-slate-700">
                        Staff ID Code
                      </label>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/80 inline-flex items-center gap-1">
                        <Sparkles className="w-2.5 h-2.5 text-emerald-600" /> Auto-Generated
                      </span>
                    </div>
                    <div className="relative">
                      <Building className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        readOnly
                        value={staffCodeOrStudentId}
                        className="w-full bg-slate-100/90 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs font-mono font-bold text-emerald-950 focus:outline-none cursor-default"
                      />
                      <button
                        type="button"
                        onClick={() => setStaffCodeOrStudentId(generateStaffId(selectedRole))}
                        title="Generate New Unique Staff ID"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-800 p-1 transition-colors cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Confirm Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-8 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Indicator */}
                {password && (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-[10px]">
                      <span className="font-semibold text-slate-600">Password Security:</span>
                      <span
                        className={`font-bold ${
                          passStrength >= 75
                            ? 'text-emerald-700'
                            : passStrength >= 50
                            ? 'text-amber-600'
                            : 'text-rose-600'
                        }`}
                      >
                        {passStrength >= 75 ? 'Strong' : passStrength >= 50 ? 'Medium' : 'Weak'}
                      </span>
                    </div>
                    <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden flex">
                      <div
                        className={`h-full transition-all duration-300 ${
                          passStrength >= 75
                            ? 'bg-emerald-600 w-full'
                            : passStrength >= 50
                            ? 'bg-amber-400 w-2/3'
                            : 'bg-rose-500 w-1/3'
                        }`}
                      />
                    </div>
                  </div>
                )}

                {/* Terms checkbox */}
                <div className="pt-1">
                  <label className="flex items-start gap-2 cursor-pointer text-xs text-slate-600">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 rounded text-emerald-800 focus:ring-emerald-700 h-3.5 w-3.5 border-slate-300"
                    />
                    <span>
                      I agree to the <span className="text-emerald-800 font-semibold underline">Institutional Policy</span> & GDPR Data Guidelines.
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2.5 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>Complete Registration</span>
                      <CheckCircle2 className="w-4 h-4 text-amber-400" />
                    </>
                  )}
                </button>
              </form>

              <div className="mt-4 text-center text-xs text-slate-600">
                Already registered?{' '}
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="font-bold text-emerald-800 hover:text-amber-600 hover:underline cursor-pointer"
                >
                  Sign In here
                </button>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* 3. FORGOT & RESET PASSWORD WORKFLOW */}
          {/* ======================================================== */}
          {mode === 'forgot-password' && (
            <div>
              <div className="mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setMode('login');
                    setErrorMessage(null);
                    setSuccessMessage(null);
                  }}
                  className="inline-flex items-center gap-1.5 text-xs text-emerald-800 hover:text-amber-600 font-semibold mb-2 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Sign In
                </button>
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Reset Password</h2>
                <p className="text-xs text-slate-500 mt-1">
                  Recover access to your account via verified email credentials.
                </p>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center justify-between mb-6 border-b border-slate-100 pb-3">
                {[
                  { step: 1, label: '1. Email Request' },
                  { step: 2, label: '2. Verify OTP' },
                  { step: 3, label: '3. New Password' }
                ].map(({ step, label }) => {
                  const isCurrent = resetStep === step;
                  const isPassed = resetStep > step;
                  return (
                    <div
                      key={step}
                      className={`text-xs font-bold flex items-center gap-1.5 ${
                        isCurrent
                          ? 'text-emerald-900 font-extrabold'
                          : isPassed
                          ? 'text-emerald-600'
                          : 'text-slate-400'
                      }`}
                    >
                      <span
                        className={`w-5 h-5 rounded-full text-[10px] flex items-center justify-center ${
                          isCurrent
                            ? 'bg-amber-400 text-emerald-950 font-black'
                            : isPassed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {isPassed ? '✓' : step}
                      </span>
                      <span className="hidden sm:inline">{label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Step 1: Enter Email */}
              {resetStep === 1 && (
                <form onSubmit={handleRequestOtp} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Your Registered Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="email"
                        required
                        value={resetEmail}
                        onChange={(e) => setResetEmail(e.target.value)}
                        placeholder="e.g. admin@educore.edu.gh"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-1.5">
                      We will generate and transmit a 6-digit confirmation code to verify your identity.
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Send 6-Digit Verification Code</span>
                        <ArrowRight className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 2: Verification Code OTP */}
              {resetStep === 2 && (
                <form onSubmit={handleVerifyOtp} className="space-y-4">
                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <KeyRound className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-bold block">Demo Recovery Code:</span>
                      <span>
                        Use verification code <span className="font-mono font-bold text-amber-950 bg-amber-200 px-1.5 py-0.5 rounded">{generatedOtp}</span> or click Auto-Fill below.
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                      Enter 6-Digit OTP Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      required
                      value={otpCode}
                      onChange={(e) => setOtpCode(e.target.value)}
                      placeholder="849201"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-center font-mono font-bold text-lg tracking-widest text-emerald-950 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setOtpCode(generatedOtp)}
                      className="flex-1 py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                    >
                      Auto-Fill Code ({generatedOtp})
                    </button>
                    <button
                      type="submit"
                      className="flex-1 py-2 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md transition-all cursor-pointer"
                    >
                      Verify Code
                    </button>
                  </div>
                </form>
              )}

              {/* Step 3: New Password */}
              {resetStep === 3 && (
                <form onSubmit={handleSetNewPassword} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        required
                        value={confirmNewPassword}
                        onChange={(e) => setConfirmNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-10 pr-10 py-2.5 text-xs text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-700 focus:bg-white"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <>
                        <span>Update Password & Save</span>
                        <CheckCircle2 className="w-4 h-4 text-amber-400" />
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* Step 4: Reset Success */}
              {resetStep === 4 && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto ring-8 ring-emerald-50">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 font-['Outfit']">Password Changed!</h3>
                    <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
                      Your credentials have been securely updated. You can now sign in with your new password.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setMode('login');
                      setErrorMessage(null);
                      setSuccessMessage('Password reset complete. Please log in.');
                    }}
                    className="py-2.5 px-6 rounded-xl bg-emerald-900 hover:bg-emerald-850 text-white text-xs font-bold shadow-md cursor-pointer inline-flex items-center gap-2"
                  >
                    <span>Proceed to Sign In</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
